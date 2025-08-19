// src/components/CardAccount/AccountTable.tsx
import React from 'react';
import { CreditCardAccount } from '../../hooks/useCreditCardAccounts';
import StatusBadge from './StatusBadge';

interface AccountTableProps {
  accounts: CreditCardAccount[];
  onEdit: (account: CreditCardAccount) => void;
  onDelete: (id: string) => void;
}

const AccountTable: React.FC<AccountTableProps> = ({ accounts, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor (R$)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonte</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lançada</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vence em</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcela</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {accounts.map((account) => (
            <tr key={account.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">{account.description}</td>
              <td className="px-6 py-4 whitespace-nowrap">{account.category_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-red-600 font-medium">
                {account.amount < 0 ? '-' : ''}R$ {Math.abs(account.amount).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {account.payment_source === 'card' && account.payment_source_id && (
                  <span className="text-sm text-gray-500">Cartão</span>
                )}
                {account.payment_source === 'bank' && <span className="text-sm text-gray-500">Banco</span>}
                {account.payment_source === 'cash' && <span className="text-sm text-gray-500">Dinheiro</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.posted_at}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.due_date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {account.parcela}/{account.total_parcelas}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={account.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(account)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(account.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccountTable;
