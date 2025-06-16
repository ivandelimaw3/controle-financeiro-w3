
-- Criar tabela para controle de tempo de utilização dos usuários
CREATE TABLE public.user_usage_control (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  trial_start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trial_end_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  trial_days_limit INTEGER NOT NULL DEFAULT 30,
  is_trial_active BOOLEAN NOT NULL DEFAULT true,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.user_usage_control ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas seus próprios dados
CREATE POLICY "Users can view their own usage control" 
  ON public.user_usage_control 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para inserção (apenas para o próprio usuário)
CREATE POLICY "Users can insert their own usage control" 
  ON public.user_usage_control 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para atualização (apenas para o próprio usuário)
CREATE POLICY "Users can update their own usage control" 
  ON public.user_usage_control 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Função para criar automaticamente o controle de uso quando um usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user_usage_control()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_usage_control (user_id, trial_start_date, trial_end_date)
  VALUES (NEW.id, now(), now() + INTERVAL '30 days');
  RETURN NEW;
END;
$$;

-- Trigger para executar a função quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created_usage_control
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_usage_control();

-- Função para verificar se o usuário ainda está no período trial
CREATE OR REPLACE FUNCTION public.check_user_trial_status(user_uuid UUID)
RETURNS TABLE (
  is_trial_active BOOLEAN,
  is_premium BOOLEAN,
  days_remaining INTEGER,
  trial_end_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  usage_record RECORD;
BEGIN
  SELECT * INTO usage_record 
  FROM public.user_usage_control 
  WHERE user_id = user_uuid;
  
  IF NOT FOUND THEN
    -- Se não encontrar registro, criar um novo
    INSERT INTO public.user_usage_control (user_id)
    VALUES (user_uuid)
    RETURNING * INTO usage_record;
  END IF;
  
  -- Verificar se o trial ainda está ativo
  IF usage_record.trial_end_date > now() AND usage_record.is_trial_active THEN
    RETURN QUERY SELECT 
      true::BOOLEAN,
      usage_record.is_premium,
      EXTRACT(DAY FROM (usage_record.trial_end_date - now()))::INTEGER,
      usage_record.trial_end_date;
  ELSE
    -- Trial expirado, atualizar status
    UPDATE public.user_usage_control 
    SET is_trial_active = false, updated_at = now()
    WHERE user_id = user_uuid;
    
    RETURN QUERY SELECT 
      false::BOOLEAN,
      usage_record.is_premium,
      0::INTEGER,
      usage_record.trial_end_date;
  END IF;
END;
$$;
