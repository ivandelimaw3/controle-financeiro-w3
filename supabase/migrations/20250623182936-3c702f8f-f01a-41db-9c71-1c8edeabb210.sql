
-- Adicionar user_id à tabela accounts se não existir
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Para dados existentes, podemos deletá-los para começar limpo
DELETE FROM public.accounts WHERE user_id IS NULL;

-- Agora tornar user_id obrigatório e adicionar a foreign key se não existir
ALTER TABLE public.accounts 
ALTER COLUMN user_id SET NOT NULL;

-- Adicionar constraint apenas se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'accounts_user_id_fkey' 
        AND table_name = 'accounts'
    ) THEN
        ALTER TABLE public.accounts 
        ADD CONSTRAINT accounts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Habilitar RLS na tabela accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para accounts apenas se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Users can view their own accounts') THEN
        EXECUTE 'CREATE POLICY "Users can view their own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Users can create their own accounts') THEN
        EXECUTE 'CREATE POLICY "Users can create their own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Users can update their own accounts') THEN
        EXECUTE 'CREATE POLICY "Users can update their own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Users can delete their own accounts') THEN
        EXECUTE 'CREATE POLICY "Users can delete their own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id)';
    END IF;
END $$;

-- Habilitar RLS nas outras tabelas
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_institutions ENABLE ROW LEVEL SECURITY;
