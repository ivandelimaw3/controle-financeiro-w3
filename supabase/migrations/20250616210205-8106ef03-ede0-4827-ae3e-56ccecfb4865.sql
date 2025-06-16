
-- Criar enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Criar tabela de roles de usuário
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se um usuário tem uma role específica
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Política para que admins vejam todas as roles e usuários vejam apenas as suas
CREATE POLICY "Users can view roles based on permissions" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Política para inserção de roles (apenas admins)
CREATE POLICY "Only admins can insert roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Política para atualização de roles (apenas admins)
CREATE POLICY "Only admins can update roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Política para deleção de roles (apenas admins)
CREATE POLICY "Only admins can delete roles" 
  ON public.user_roles 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Atualizar política da tabela user_usage_control para admins verem todos os dados
DROP POLICY IF EXISTS "Users can view their own usage control" ON public.user_usage_control;
CREATE POLICY "Users can view usage control based on permissions" 
  ON public.user_usage_control 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin')
  );

-- Política para admins poderem atualizar dados de qualquer usuário
CREATE POLICY "Admins can update any usage control" 
  ON public.user_usage_control 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Política para admins poderem deletar dados de qualquer usuário
CREATE POLICY "Admins can delete any usage control" 
  ON public.user_usage_control 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'admin'));

-- Função para listar todos os usuários com informações de trial (apenas para admins)
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
    au.email,
    au.created_at,
    uuc.trial_start_date,
    uuc.trial_end_date,
    uuc.is_trial_active,
    uuc.is_premium,
    CASE 
      WHEN uuc.trial_end_date > now() AND uuc.is_trial_active THEN
        EXTRACT(DAY FROM (uuc.trial_end_date - now()))::INTEGER
      ELSE 
        0
    END as days_remaining
  FROM auth.users au
  LEFT JOIN public.user_usage_control uuc ON au.id = uuc.user_id
  ORDER BY au.created_at DESC;
END;
$$;

-- Função para deletar um usuário (apenas para admins)
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Não permitir que admin delete a si mesmo
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account.';
  END IF;
  
  -- Deletar dados relacionados primeiro (devido às foreign keys)
  DELETE FROM public.user_usage_control WHERE user_id = target_user_id;
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- O usuário será deletado automaticamente devido ao CASCADE
  -- mas vamos fazer isso explicitamente para ter controle
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Criar um usuário admin padrão (opcional - você pode ajustar o email)
-- Substitua 'admin@exemplo.com' pelo email que você quer que seja admin
-- Nota: Este usuário precisa existir primeiro, então execute isso apenas se necessário
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::app_role 
-- FROM auth.users 
-- WHERE email = 'admin@exemplo.com'
-- ON CONFLICT (user_id, role) DO NOTHING;
