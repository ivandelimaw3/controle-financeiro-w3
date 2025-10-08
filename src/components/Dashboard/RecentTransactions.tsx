
import React from 'react';
import { Calendar, Building2 } from 'lucide-react';
import { useBanksData } from '@/hooks/useBanksData';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const RecentTransactions: React.FC = () => {
  const { banks, isLoading } = useBanksData();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Saldo dos Bancos</h3>
        <div className="flex items-center justify-center py-8">
          <span className="text-sm text-slate-500">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Saldo dos Bancos</h3>
      <div className="space-y-4">
        {banks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">Nenhum banco cadastrado</p>
          </div>
        ) : (
          banks.map((bank) => (
            <div key={bank.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Building2 size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{bank.name}</p>
                  <p className="text-sm text-slate-500">
                    {bank.nickname || `${bank.account_type} - ${bank.account_number}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${bank.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(bank.balance || 0)}
                </p>
                <span className="text-xs text-slate-500 flex items-center gap-1 justify-end mt-1">
                  <Calendar size={12} />
                  {format(new Date(bank.updated_at), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
