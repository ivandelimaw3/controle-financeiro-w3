-- Adicionar campo status na tabela recorrencias
ALTER TABLE public.recorrencias 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pendente';

-- Comentário: Este campo vai armazenar o status da recorrência (pendente, pago, recebido)