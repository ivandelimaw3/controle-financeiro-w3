import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Account } from '@/contexts/AccountsContext';
import { Button } from '@/components/ui/button';

export const useAccountsReminder = (accounts: Account[]) => {
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isReminderActive, setIsReminderActive] = useState(true);
  const lastCheckRef = useRef<string>('');

  const checkDueAccounts = () => {
    if (!isReminderActive || accounts.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const dueAccounts = accounts.filter(account => 
      account.status === 'pendente' && account.dueDate === today
    );

    // Evitar alertas duplicados - só mostrar se houver contas e não foi mostrado recentemente
    const checkKey = `${today}-${dueAccounts.length}`;
    if (dueAccounts.length > 0 && lastCheckRef.current !== checkKey) {
      lastCheckRef.current = checkKey;
      
      const accountNames = dueAccounts.map(acc => acc.description).join(', ');
      
      console.log(`📅 Lembrete: ${dueAccounts.length} conta(s) vencem hoje: ${accountNames}`);
      
      toast({
        title: "⚠️ Lembrete de Pagamento",
        description: `Hoje é a data para Pagamento desta Conta!! ${accountNames}`,
        duration: 2000,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('🚫 Alertas cancelados pelo usuário');
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