
-- Criar tabela para contas de cartões
CREATE TABLE public.card_accounts (
  id BIGINT NOT NULL DEFAULT nextval('card_accounts_id_seq'::regclass) PRIMARY KEY,
  user_id UUID NOT NULL,
  creditcard_id BIGINT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  due_date DATE NOT NULL,
  data_conta DATE,
  status TEXT NOT NULL DEFAULT 'pendente',
  parcela TEXT,
  recorrente_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar sequence para a tabela
CREATE SEQUENCE IF NOT EXISTS card_accounts_id_seq;

-- Ativar RLS
ALTER TABLE public.card_accounts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para card_accounts
CREATE POLICY "Users can view their own card accounts" 
  ON public.card_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own card accounts" 
  ON public.card_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own card accounts" 
  ON public.card_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own card accounts" 
  ON public.card_accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_card_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER card_accounts_updated_at
  BEFORE UPDATE ON public.card_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_card_accounts_updated_at();

-- Trigger para atualizar o valor atual do cartão quando uma conta é criada/atualizada/deletada
CREATE OR REPLACE FUNCTION update_creditcard_balance_from_card_accounts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Adicionar valor à dívida do cartão
    UPDATE public.creditcards 
    SET current_value = current_value + NEW.amount, updated_at = NOW()
    WHERE id = NEW.creditcard_id;
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Ajustar valor no cartão (remover antigo e adicionar novo)
    UPDATE public.creditcards 
    SET current_value = current_value - OLD.amount + NEW.amount, updated_at = NOW()
    WHERE id = NEW.creditcard_id;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Remover valor da dívida do cartão
    UPDATE public.creditcards 
    SET current_value = current_value - OLD.amount, updated_at = NOW()
    WHERE id = OLD.creditcard_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER card_accounts_update_creditcard_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.card_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_creditcard_balance_from_card_accounts();
