
-- Atualizar a tabela card_accounts para usar os mesmos status que a tabela accounts
ALTER TABLE card_accounts 
DROP CONSTRAINT IF EXISTS card_accounts_status_check;

ALTER TABLE card_accounts 
ADD CONSTRAINT card_accounts_status_check 
CHECK (status IN ('pendente', 'pago', 'recebido'));

-- Criar função trigger para atualizar saldos de cartões automaticamente
CREATE OR REPLACE FUNCTION update_card_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- ===================================
    -- TRIGGER: Atualiza saldos de cartões para card_accounts
    -- INSERT: cartão sempre adiciona valor à dívida (independe do status)
    -- UPDATE: ajusta se status muda ou se valor mudou
    -- DELETE: remove o valor aplicado
    -- ===================================

    IF TG_OP = 'INSERT' THEN
        -- Cartões: sempre adiciona no INSERT (independe do status)
        IF NEW.creditcard_id IS NOT NULL THEN
            UPDATE public.creditcards
            SET current_value = current_value + ABS(NEW.amount),
                updated_at = NOW()
            WHERE id = NEW.creditcard_id;
        END IF;

        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        -- =========================
        -- REVERTER O QUE FOI APLICADO ANTES
        -- =========================

        -- 1. Reverter por status anterior (se estava efetivado)
        IF OLD.status IN ('pago', 'recebido') 
           AND OLD.creditcard_id IS NOT NULL THEN
            UPDATE public.creditcards
            SET current_value = current_value + ABS(OLD.amount), -- Volta à dívida
                updated_at = NOW()
            WHERE id = OLD.creditcard_id;
        END IF;

        -- 2. Reverter mudança de valor (se o amount mudou)
        IF OLD.amount <> NEW.amount 
           AND NEW.creditcard_id IS NOT NULL THEN
            -- Se o novo valor já foi contabilizado como efetivado, reverte ele
            IF NEW.status IN ('pago', 'recebido') THEN
                UPDATE public.creditcards
                SET current_value = current_value + ABS(NEW.amount),
                    updated_at = NOW()
                WHERE id = NEW.creditcard_id;
            END IF;
        END IF;

        -- =========================
        -- APLICAR NOVOS VALORES
        -- =========================

        -- 1. Aplicar novo valor se status for 'pago'/'recebido'
        IF NEW.status IN ('pago', 'recebido') 
           AND NEW.creditcard_id IS NOT NULL THEN
            UPDATE public.creditcards
            SET current_value = current_value - ABS(NEW.amount), -- Pago: reduz dívida
                updated_at = NOW()
            WHERE id = NEW.creditcard_id;
        END IF;

        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        -- Cartões: sempre reverte o valor inserido se estava pendente
        IF OLD.creditcard_id IS NOT NULL 
           AND OLD.status NOT IN ('pago', 'recebido') THEN
            UPDATE public.creditcards
            SET current_value = current_value - ABS(OLD.amount),
                updated_at = NOW()
            WHERE id = OLD.creditcard_id;
        END IF;
        
        -- Se estava pago/recebido, adiciona de volta à dívida
        IF OLD.creditcard_id IS NOT NULL 
           AND OLD.status IN ('pago', 'recebido') THEN
            UPDATE public.creditcards
            SET current_value = current_value + ABS(OLD.amount),
                updated_at = NOW()
            WHERE id = OLD.creditcard_id;
        END IF;
        
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger
DROP TRIGGER IF EXISTS card_accounts_balance_trigger ON card_accounts;
CREATE TRIGGER card_accounts_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON card_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_card_account_balance();
