
-- Criar tabela card_accounts para contas de cartões de crédito
CREATE TABLE IF NOT EXISTS card_accounts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creditcard_id BIGINT NOT NULL REFERENCES creditcards(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  due_date DATE NOT NULL,
  data_conta DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  parcela TEXT,
  recorrente_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE card_accounts ENABLE ROW LEVEL SECURITY;

-- Política para que usuários só vejam suas próprias contas
CREATE POLICY "Users can view their own card accounts" ON card_accounts
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que usuários só possam inserir suas próprias contas
CREATE POLICY "Users can insert their own card accounts" ON card_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que usuários só possam atualizar suas próprias contas
CREATE POLICY "Users can update their own card accounts" ON card_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para que usuários só possam deletar suas próprias contas
CREATE POLICY "Users can delete their own card accounts" ON card_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_card_accounts_updated_at
  BEFORE UPDATE ON card_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_card_accounts_user_id ON card_accounts(user_id);
CREATE INDEX idx_card_accounts_creditcard_id ON card_accounts(creditcard_id);
CREATE INDEX idx_card_accounts_due_date ON card_accounts(due_date);
CREATE INDEX idx_card_accounts_status ON card_accounts(status);
