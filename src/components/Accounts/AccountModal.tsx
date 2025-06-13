
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AccountForm } from './AccountForm';
import { useCategoriesData } from '@/hooks/useCategoriesData';

interface Account {
  id?: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Account) => void;
  account?: Account;
  categories?: string[];
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  account
}) => {
  const { categories: categoriesFromDB, refreshCategories, loading: categoriesLoading } = useCategoriesData();
  const [formData, setFormData] = useState<Account>({
    description: '',
    amount: 0,
    category: '',
    dueDate: '',
    type: 'despesa',
    status: 'pendente'
  });
  const [isFormReady, setIsFormReady] = useState(false);

  // Formatação da data para input
  const formatDateForInput = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    
    // Se a data já estiver no formato YYYY-MM-DD, retorna como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    try {
      // Cria a data como local para evitar problemas de timezone
      const date = new Date(dateStr + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    
    return '';
  };

  useEffect(() => {
    if (!isOpen) {
      setIsFormReady(false);
      return;
    }

    if (account?.id) {
      const formattedDueDate = formatDateForInput(account.dueDate);
      
      console.log('AccountModal: original date', account.dueDate);
      console.log('AccountModal: formatted date', formattedDueDate);
      
      const newFormData = {
        id: account.id,
        description: account.description || '',
        amount: Math.abs(account.amount) || 0,
        category: account.category || '',
        dueDate: formattedDueDate,
        type: account.type || 'despesa',
        status: account.status || 'pendente'
      };
      setFormData(newFormData);
    } else {
      setFormData({
        description: '',
        amount: 0,
        category: '',
        dueDate: '',
        type: 'despesa',
        status: 'pendente'
      });
    }

    // Refresh das categorias e marcar como pronto
    refreshCategories().finally(() => {
      setIsFormReady(true);
    });
  }, [isOpen, account, refreshCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAmount = formData.type === 'despesa' ? -Math.abs(formData.amount) : Math.abs(formData.amount);
    
    const accountToSave = {
      ...formData,
      amount: finalAmount
    };
    
    onSave(accountToSave);
    onClose();
  };

  const handleRefreshCategories = async () => {
    try {
      await refreshCategories();
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (!isOpen) {
    return null;
  }

  const isEditing = !!(account?.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {isEditing ? 'Editar Conta' : 'Nova Conta'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {!isFormReady ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-600">Carregando...</div>
          </div>
        ) : (
          <AccountForm
            formData={formData}
            setFormData={setFormData}
            categories={categoriesFromDB || []}
            onRefreshCategories={handleRefreshCategories}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isEditing={isEditing}
          />
        )}
      </div>
    </div>
  );
};
