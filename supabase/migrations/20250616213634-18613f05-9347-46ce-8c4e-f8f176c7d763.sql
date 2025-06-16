
-- Criar tabela para solicitações de upgrade para premium
CREATE TABLE public.premium_upgrade_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Adicionar RLS
ALTER TABLE public.premium_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem suas próprias solicitações
CREATE POLICY "Users can view their own upgrade requests" 
  ON public.premium_upgrade_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários criarem suas próprias solicitações
CREATE POLICY "Users can create upgrade requests" 
  ON public.premium_upgrade_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Política para admins verem todas as solicitações
CREATE POLICY "Admins can view all upgrade requests" 
  ON public.premium_upgrade_requests 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Política para admins atualizarem solicitações
CREATE POLICY "Admins can update upgrade requests" 
  ON public.premium_upgrade_requests 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Função para obter solicitações de upgrade pendentes para admins
CREATE OR REPLACE FUNCTION public.get_pending_upgrade_requests()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  user_email TEXT,
  requested_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    pur.id,
    pur.user_id,
    au.email::TEXT as user_email,
    pur.requested_at,
    pur.status,
    pur.notes
  FROM public.premium_upgrade_requests pur
  JOIN auth.users au ON pur.user_id = au.id
  WHERE pur.status = 'pending'
  ORDER BY pur.requested_at ASC;
END;
$$;

-- Função para aprovar/rejeitar solicitação de upgrade
CREATE OR REPLACE FUNCTION public.process_upgrade_request(
  request_id UUID,
  new_status TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Verificar se o status é válido
  IF new_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status. Must be approved or rejected.';
  END IF;
  
  -- Obter o user_id da solicitação
  SELECT user_id INTO target_user_id
  FROM public.premium_upgrade_requests
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed.';
  END IF;
  
  -- Atualizar a solicitação
  UPDATE public.premium_upgrade_requests
  SET 
    status = new_status,
    approved_by = auth.uid(),
    approved_at = now(),
    notes = admin_notes,
    updated_at = now()
  WHERE id = request_id;
  
  -- Se aprovado, atualizar o usuário para premium
  IF new_status = 'approved' THEN
    INSERT INTO public.user_usage_control (user_id, is_premium, is_trial_active)
    VALUES (target_user_id, true, false)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      is_premium = true,
      is_trial_active = false,
      updated_at = now();
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_premium_upgrade_requests_updated_at
  BEFORE UPDATE ON public.premium_upgrade_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
