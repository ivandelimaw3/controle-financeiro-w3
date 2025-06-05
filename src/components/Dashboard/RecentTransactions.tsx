
import React from 'react';
import { Calendar, DollarSign } from 'lucide-react';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
      case 'recebido':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Transações Recentes</h3>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${transaction.type === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign size={16} className={transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'} />
              </div>
              <div>
                <p className="font-medium text-slate-800">{transaction.description}</p>
                <p className="text-sm text-slate-500">{transaction.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'receita' ? '+' : '-'}R$ {Math.abs(transaction.amount).toFixed(2)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar size={12} />
                  {transaction.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
