
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AccountForm } from './AccountForm';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { CreateAccountData } from '@/hooks/useAccountsData';

interface Account {
  id?: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  dataConta?: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  qtd_parcelas?: number;
  bank_id?: number;
  payment_source?: 'bank';
  payment_source_id?: number;
  payment_source_name?: string;
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: CreateAccountData | Account) => void;
  account?: Account;
  categories?: string[];
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  account
}) => {
  const { categories: categoriesFromDB, refreshCategories, loading: categoriesLoading, addCategory } = useCategoriesData();
  const [formData, setFormData] = useState<Account>({
    description: '',
    amount: 0,
    category: '',
    dueDate: '',
    dataConta: '',
    type: 'despesa',
    status: 'pendente',
    qtd_parcelas: 1,
    bank_id: undefined,
    payment_source: 'bank',
    payment_source_id: undefined,
    payment_source_name: undefined
  });
  const [isFormReady, setIsFormReady] = useState(false);

  const formatDateForInput = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    try {
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
      const formattedDataConta = formatDateForInput(account.dataConta);
      
      console.log('AccountModal: original due date', account.dueDate);
      console.log('AccountModal: formatted due date', formattedDueDate);
      console.log('AccountModal: original data conta', account.dataConta);
      console.log('AccountModal: formatted data conta', formattedDataConta);
      
      const newFormData: Account = {
        id: account.id,
        description: account.description || '',
        amount: Math.abs(account.amount) || 0,
        category: account.category || '',
        dueDate: formattedDueDate,
        dataConta: formattedDataConta,
        type: account.type || 'despesa',
        status: account.status || 'pendente',
        qtd_parcelas: 1,
        bank_id: account.bank_id,
        payment_source: 'bank' as const,
        payment_source_id: account.payment_source_id,
        payment_source_name: account.payment_source_name
      };
      setFormData(newFormData);
    } else {
      setFormData({
        description: '',
        amount: 0,
        category: '',
        dueDate: '',
        dataConta: '',
        type: 'despesa',
        status: 'pendente',
        qtd_parcelas: 1,
        bank_id: undefined,
        payment_source: 'bank',
        payment_source_id: undefined,
        payment_source_name: undefined
      });
    }

    refreshCategories().finally(() => {
      setIsFormReady(true);
    });
  }, [isOpen, account, refreshCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalAmount = Math.abs(formData.amount);
    
    if (formData.type === 'despesa') {
      finalAmount = -finalAmount;
    }
    
    console.log('AccountModal: Saving account with type:', formData.type);
    console.log('AccountModal: Original amount:', formData.amount);
    console.log('AccountModal: Final amount:', finalAmount);
    
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
      console.log('Categories refreshed successfully');
    } catch (error) {
      console.error('Error refreshing categories:', error);
    }
  };

  const handleAddCategory = async (categoryData: { name: string; type: 'receita' | 'despesa'; color: string }) => {
    try {
      await addCategory(categoryData);
      console.log('New category added, refreshing list...');
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  if (!isOpen) {
    return null;
  }

  const isEditing = !!(account?.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-slate-800">
            {isEditing ? 'Editar Conta' : 'Nova Conta'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
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
                onAddCategory={handleAddCategory}
                onSubmit={handleSubmit}
                onCancel={onClose}
                isEditing={isEditing}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
