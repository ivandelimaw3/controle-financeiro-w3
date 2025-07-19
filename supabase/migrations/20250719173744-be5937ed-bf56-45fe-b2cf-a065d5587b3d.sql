
-- Adicionar campo bank_id na tabela cards
ALTER TABLE public.cards 
ADD COLUMN bank_id bigint REFERENCES public.banks(id);
