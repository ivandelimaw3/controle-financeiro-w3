
-- Criar tabela para armazenar o saldo anterior de cada mês/ano
CREATE TABLE IF NOT EXISTS public.saldo_mes_anterior (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  automatico BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ano, mes)
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.saldo_mes_anterior ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para saldo_mes_anterior
CREATE POLICY "Users can view their own previous balance" 
  ON public.saldo_mes_anterior 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own previous balance" 
  ON public.saldo_mes_anterior 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own previous balance" 
  ON public.saldo_mes_anterior 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own previous balance" 
  ON public.saldo_mes_anterior 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_saldo_mes_anterior_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_saldo_mes_anterior_updated_at
  BEFORE UPDATE ON public.saldo_mes_anterior
  FOR EACH ROW
  EXECUTE FUNCTION update_saldo_mes_anterior_updated_at();
