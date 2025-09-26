import { useMemo } from 'react';
import { Account } from '@/contexts/AccountsContext';

interface PaymentSourcePreviousBalanceParams {
  accounts: Account[];
  searchTerm: string;
  currentMonth: number;
  currentYear: number;
  isSearchingForPaymentSource: boolean;
}

export const usePaymentSourcePreviousBalance = ({
  accounts,
  searchTerm,
  currentMonth,
  currentYear,
  isSearchingForPaymentSource
}: PaymentSourcePreviousBalanceParams) => {
  
  const paymentSourcePreviousBalance = useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    // Se não está pesquisando por fonte específica, usar o saldo anterior geral
    if (!isSearchingForPaymentSource) {
      const found = accounts.find(acc => {
        if (!acc.dueDate) return false;
        const d = new Date(acc.dueDate + "T00:00:00");
        return acc.description === "Saldo Anterior" && 
               d.getFullYear() === currentYear && 
               d.getMonth() === currentMonth;
      });

      if (!found) return 0;
      return found.type === "receita" ? found.amount : -Math.abs(found.amount);
    }
    
    // Pesquisa por fonte específica - calcular saldo apenas dessa fonte
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Encontrar todas as contas da fonte de pagamento específica até o mês anterior
    const targetDate = new Date(currentYear, currentMonth, 1);
    const previousMonthLastDay = new Date(targetDate.getTime() - 1); // Último dia do mês anterior
    
    const paymentSourceAccounts = accounts.filter(acc => {
      if (!acc.dueDate || !acc.payment_source_name) return false;
      
      const accDate = new Date(acc.dueDate + "T00:00:00");
      const paymentSourceLower = acc.payment_source_name.toLowerCase();
      
      // Verificar se é da fonte de pagamento específica e se é anterior ao mês atual
      return paymentSourceLower.includes(searchLower) && 
             accDate <= previousMonthLastDay &&
             acc.description !== "Saldo Anterior"; // Excluir registros de saldo anterior
    });
    
    // Calcular saldo final dessa fonte específica
    let totalReceived = 0;
    let totalPaid = 0;
    
    paymentSourceAccounts.forEach(acc => {
      if (acc.type === 'receita' && acc.status === 'recebido') {
        totalReceived += acc.amount || 0;
      } else if (acc.type === 'despesa' && acc.status === 'pago') {
        totalPaid += Math.abs(acc.amount || 0);
      }
    });
    
    const finalBalance = totalReceived - totalPaid;
    
    console.log(`💰 Saldo anterior da fonte "${searchTerm}":`, {
      totalReceived,
      totalPaid,
      finalBalance,
      accountsFound: paymentSourceAccounts.length
    });
    
    return finalBalance;
  }, [accounts, searchTerm, currentMonth, currentYear, isSearchingForPaymentSource]);
  
  return paymentSourcePreviousBalance;
};