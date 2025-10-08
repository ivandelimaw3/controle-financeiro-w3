import React from 'react';
import { CreditCard } from 'lucide-react';
import { useCardAccounts } from '@/hooks/useCardAccounts';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CreditCardPendingSummary: React.FC = () => {
  const { cardAccounts, loading } = useCardAccounts();

  // Agrupar contas pendentes por cartão e calcular totais
  const cardSummary = React.useMemo(() => {
    const pendingAccounts = cardAccounts.filter(acc => acc.status === 'pendente');
    
    const summary = pendingAccounts.reduce((acc, account) => {
      const cardName = account.card_name || 'Cartão sem nome';
      
      if (!acc[cardName]) {
        acc[cardName] = {
          cardName,
          total: 0,
          count: 0
        };
      }
      
      acc[cardName].total += account.amount;
      acc[cardName].count += 1;
      
      return acc;
    }, {} as Record<string, { cardName: string; total: number; count: number }>);
    
    return Object.values(summary).sort((a, b) => b.total - a.total);
  }, [cardAccounts]);

  const totalPending = cardSummary.reduce((sum, card) => sum + card.total, 0);

  if (loading) {
    return (
      <Card className="bg-white shadow-lg border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Valores Pendentes por Cartão
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (cardSummary.length === 0) {
    return (
      <Card className="bg-white shadow-lg border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Valores Pendentes por Cartão
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">Nenhuma conta pendente</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border border-slate-200">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Valores Pendentes por Cartão
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {cardSummary.map((card) => (
            <div
              key={card.cardName}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{card.cardName}</p>
                  <p className="text-sm text-slate-600">
                    {card.count} {card.count === 1 ? 'conta' : 'contas'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(card.total)}
                </p>
              </div>
            </div>
          ))}
          
          <div className="pt-4 mt-4 border-t-2 border-slate-300">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <p className="font-bold text-slate-800 text-lg">Total Geral</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(totalPending)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
