
-- Criar tabela para armazenar saldos iniciais por mês/ano
CREATE TABLE public.monthly_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Habilitar Row Level Security
ALTER TABLE public.monthly_balances ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para a tabela monthly_balances
CREATE POLICY "Users can view their own monthly balances" 
  ON public.monthly_balances 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own monthly balances" 
  ON public.monthly_balances 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly balances" 
  ON public.monthly_balances 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly balances" 
  ON public.monthly_balances 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_monthly_balances_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER monthly_balances_updated_at
  BEFORE UPDATE ON public.monthly_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_monthly_balances_updated_at();
