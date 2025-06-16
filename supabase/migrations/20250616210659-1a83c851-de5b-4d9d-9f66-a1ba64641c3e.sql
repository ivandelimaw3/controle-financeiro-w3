
-- Função para garantir que administradores sejam sempre premium
CREATE OR REPLACE FUNCTION public.ensure_admin_is_premium()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se o usuário está sendo promovido a admin
  IF NEW.role = 'admin' THEN
    -- Atualizar ou inserir registro na tabela user_usage_control para torná-lo premium
    INSERT INTO public.user_usage_control (user_id, is_premium, is_trial_active)
    VALUES (NEW.user_id, true, false)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      is_premium = true,
      is_trial_active = false,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar a função quando uma role admin é inserida
CREATE TRIGGER on_admin_role_created
  AFTER INSERT ON public.user_roles
  FOR EACH ROW 
  WHEN (NEW.role = 'admin')
  EXECUTE FUNCTION public.ensure_admin_is_premium();

-- Atualizar usuários admin existentes para serem premium
UPDATE public.user_usage_control 
SET is_premium = true, is_trial_active = false, updated_at = now()
WHERE user_id IN (
  SELECT user_id 
  FROM public.user_roles 
  WHERE role = 'admin'
);
