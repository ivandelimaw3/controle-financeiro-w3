
-- Adicionar status de solicitação pendente na tabela user_usage_control
ALTER TABLE public.user_usage_control 
ADD COLUMN upgrade_request_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN upgrade_status TEXT DEFAULT 'none' CHECK (upgrade_status IN ('none', 'pending', 'approved', 'rejected'));

-- Função para listar usuários que precisam de revisão admin (trial expirado ou com solicitação pendente)
CREATE OR REPLACE FUNCTION public.get_users_for_admin_review()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  is_trial_active BOOLEAN,
  is_premium BOOLEAN,
  days_remaining INTEGER,
  upgrade_request_date TIMESTAMP WITH TIME ZONE,
  upgrade_status TEXT,
  needs_attention BOOLEAN
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
    au.id as user_id,
    au.email::TEXT,
    au.created_at,
    COALESCE(uuc.trial_start_date, au.created_at) as trial_start_date,
    COALESCE(uuc.trial_end_date, au.created_at + INTERVAL '30 days') as trial_end_date,
    COALESCE(uuc.is_trial_active, true) as is_trial_active,
    COALESCE(uuc.is_premium, false) as is_premium,
    CASE 
      WHEN COALESCE(uuc.trial_end_date, au.created_at + INTERVAL '30 days') > now() 
           AND COALESCE(uuc.is_trial_active, true) THEN
        EXTRACT(DAY FROM (COALESCE(uuc.trial_end_date, au.created_at + INTERVAL '30 days') - now()))::INTEGER
      ELSE 
        0
    END as days_remaining,
    uuc.upgrade_request_date,
    COALESCE(uuc.upgrade_status, 'none') as upgrade_status,
    CASE 
      WHEN uuc.upgrade_status = 'pending' THEN true
      WHEN COALESCE(uuc.trial_end_date, au.created_at + INTERVAL '30 days') < now() 
           AND COALESCE(uuc.is_trial_active, true) 
           AND NOT COALESCE(uuc.is_premium, false) THEN true
      ELSE false
    END as needs_attention
  FROM auth.users au
  LEFT JOIN public.user_usage_control uuc ON au.id = uuc.user_id
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id AND ur.role = 'admin'
  WHERE au.email IS NOT NULL 
    AND ur.user_id IS NULL  -- Excluir admins da lista
  ORDER BY 
    CASE WHEN uuc.upgrade_status = 'pending' THEN 1 ELSE 2 END,
    COALESCE(uuc.trial_end_date, au.created_at + INTERVAL '30 days') ASC;
END;
$$;

-- Função para solicitar upgrade premium
CREATE OR REPLACE FUNCTION public.request_premium_upgrade()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário está logado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated.';
  END IF;
  
  -- Verificar se o usuário já tem solicitação pendente ou já é premium
  IF EXISTS (
    SELECT 1 FROM public.user_usage_control 
    WHERE user_id = auth.uid() 
    AND (upgrade_status = 'pending' OR is_premium = true)
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Criar ou atualizar registro na tabela user_usage_control
  INSERT INTO public.user_usage_control (user_id, upgrade_request_date, upgrade_status)
  VALUES (auth.uid(), now(), 'pending')
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    upgrade_request_date = now(),
    upgrade_status = 'pending',
    updated_at = now();
  
  RETURN TRUE;
END;
$$;

-- Função para aprovar/rejeitar upgrade
CREATE OR REPLACE FUNCTION public.process_user_upgrade(
  target_user_id UUID, 
  new_status TEXT, 
  make_premium BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Verificar se o status é válido
  IF new_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status. Must be approved or rejected.';
  END IF;
  
  -- Atualizar status da solicitação
  UPDATE public.user_usage_control
  SET 
    upgrade_status = new_status,
    is_premium = CASE WHEN make_premium THEN true ELSE is_premium END,
    is_trial_active = CASE WHEN make_premium THEN false ELSE is_trial_active END,
    updated_at = now()
  WHERE user_id = target_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;
