
-- Adicionar campo saldo_anterior na tabela accounts
ALTER TABLE public.accounts 
ADD COLUMN saldo_anterior numeric DEFAULT 0;
