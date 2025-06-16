
-- Corrigir a função get_all_users_with_trial_info para resolver o erro de tipo
CREATE OR REPLACE FUNCTION public.get_all_users_with_trial_info()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  is_trial_active BOOLEAN,
  is_premium BOOLEAN,
  days_remaining INTEGER
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
    au.email::TEXT,  -- Cast explícito para TEXT
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
    END as days_remaining
  FROM auth.users au
  LEFT JOIN public.user_usage_control uuc ON au.id = uuc.user_id
  WHERE au.email IS NOT NULL  -- Filtrar usuários sem email
  ORDER BY au.created_at DESC;
END;
$$;
