
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Account } from '@/contexts/AccountsContext';

interface ReminderOptions {
  type?: 'accounts' | 'cards';
}

export const useAccountsReminder = (accounts: Account[], options: ReminderOptions = {}) => {
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isReminderActive, setIsReminderActive] = useState(true);
  const lastCheckRef = useRef<string>('');
  const lastCheck1DayRef = useRef<string>('');

  const { type = 'accounts' } = options;

  const checkDueAccounts = () => {
    if (!isReminderActive || accounts.length === 0) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Calcular data de amanhã
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Filtrar apenas despesas pendentes que vencem hoje
    const dueToday = accounts.filter(account => 
      account.type === 'despesa' && 
      account.status === 'pendente' && 
      account.dueDate === today
    );

    // Filtrar despesas pendentes que vencem amanhã (1 dia antes)
    const dueTomorrow = accounts.filter(account => 
      account.type === 'despesa' && 
      account.status === 'pendente' && 
      account.dueDate === tomorrowStr
    );

    // Aviso para contas que vencem HOJE
    const checkKeyToday = `today-${today}-${dueToday.length}`;
    if (dueToday.length > 0 && lastCheckRef.current !== checkKeyToday) {
      lastCheckRef.current = checkKeyToday;
      
      const expenseNames = dueToday.map(acc => acc.description).join(', ');
      
      console.log(`📅 Lembrete: ${dueToday.length} despesa(s) vencem hoje: ${expenseNames}`);
      
      const message = type === 'cards' 
        ? `Hoje é a data de vencimento de ${dueToday.length} conta(s) de cartão!`
        : `Hoje é a data de vencimento de ${dueToday.length} conta(s)!`;
      
      toast({
        title: "🚨 Vencimento HOJE!",
        description: message,
        duration: 5000,
        variant: "destructive",
      });
    }

    // Aviso para contas que vencem AMANHÃ (1 dia antes)
    const checkKey1Day = `1day-${tomorrowStr}-${dueTomorrow.length}`;
    if (dueTomorrow.length > 0 && lastCheck1DayRef.current !== checkKey1Day) {
      lastCheck1DayRef.current = checkKey1Day;
      
      const expenseNames = dueTomorrow.map(acc => acc.description).join(', ');
      
      console.log(`📅 Aviso: ${dueTomorrow.length} despesa(s) vencem amanhã: ${expenseNames}`);
      
      const message = type === 'cards' 
        ? `${dueTomorrow.length} conta(s) de cartão vence(m) amanhã!`
        : `${dueTomorrow.length} conta(s) vence(m) amanhã!`;
      
      toast({
        title: "⚠️ Vencimento em 1 dia",
        description: message,
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    if (!isReminderActive) return;

    // Pequeno delay para garantir que o componente está montado
    const timeoutId = setTimeout(() => {
      checkDueAccounts();
    }, 500);

    // Configurar intervalo de 30 minutos
    intervalRef.current = setInterval(checkDueAccounts, 30 * 60 * 1000);

    return () => {
      clearTimeout(timeoutId);
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
