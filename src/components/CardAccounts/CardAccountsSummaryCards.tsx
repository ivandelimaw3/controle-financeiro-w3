
import React from 'react';
import { CreditCard, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { CardAccountData } from '@/hooks/useCardAccountsData';

interface CardAccountsSummaryCardsProps {
  accounts: CardAccountData[];
}

export const CardAccountsSummaryCards = ({ accounts }: CardAccountsSummaryCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalAccounts = accounts.length;
  const totalAmount = accounts.reduce((sum, account) => sum + account.amount, 0);
  const paidAccounts = accounts.filter(account => account.status === 'pago');
  const pendingAccounts = accounts.filter(account => account.status === 'pendente');
  
  const totalPaid = paidAccounts.reduce((sum, account) => sum + account.amount, 0);
  const totalPending = pendingAccounts.reduce((sum, account) => sum + account.amount, 0);

  const summaryCards = [
    {
      title: 'Total de Contas',
      value: totalAccounts,
      icon: CreditCard,
      color: 'blue',
      format: 'number'
    },
    {
      title: 'Valor Total',
      value: totalAmount,
      icon: DollarSign,
      color: 'purple',
      format: 'currency'
    },
    {
      title: 'Pagas',
      value: totalPaid,
      icon: TrendingUp,
      color: 'green',
      format: 'currency'
    },
    {
      title: 'Pendentes',
      value: totalPending,
      icon: TrendingDown,
      color: 'orange',
      format: 'currency'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryCards.map((card, index) => {
        const Icon = card.icon;
        const colorClasses = {
          blue: 'bg-blue-100 text-blue-600',
          purple: 'bg-purple-100 text-purple-600',
          green: 'bg-green-100 text-green-600',
          orange: 'bg-orange-100 text-orange-600'
        };

        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.format === 'currency' 
                      ? formatCurrency(card.value)
                      : card.value
                    }
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${colorClasses[card.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
