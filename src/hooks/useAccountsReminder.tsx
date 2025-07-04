import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Account } from '@/contexts/AccountsContext';
import { Button } from '@/components/ui/button';

export const useAccountsReminder = (accounts: Account[]) => {
  const { toast, dismiss } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isReminderActive, setIsReminderActive] = useState(true);

  const checkDueAccounts = () => {
    if (!isReminderActive) return;

    const today = new Date().toISOString().split('T')[0];
    const dueAccounts = accounts.filter(account => 
      account.status === 'pendente' && account.dueDate === today
    );

    if (dueAccounts.length > 0) {
      const accountNames = dueAccounts.map(acc => acc.description).join(', ');
      
      toast({
        title: "⚠️ Lembrete de Pagamento",
        description: "Hoje é a data para Pagamento desta Conta!!",
        duration: 2000,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsReminderActive(false);
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
            }}
          >
            Cancelar Alertas
          </Button>
        )
      });
    }
  };

  useEffect(() => {
    if (!isReminderActive) return;

    // Verificar imediatamente ao carregar
    checkDueAccounts();

    // Configurar intervalo de 30 minutos (30 * 60 * 1000 ms)
    intervalRef.current = setInterval(checkDueAccounts, 30 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [accounts, isReminderActive]);

  const reactivateReminder = () => {
    setIsReminderActive(true);
  };

  return {
    isReminderActive,
    reactivateReminder
  };
};