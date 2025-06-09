
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
  const { categories: categoriesFromDB, refreshCategories } = useCategoriesData();
  const [formData, setFormData] = useState<Account>({
    description: '',
    amount: 0,
    category: '',
    dueDate: '',
    type: 'despesa',
    status: 'pendente'
  });

  // Separar o useEffect para melhor controle
  useEffect(() => {
    console.log('=== AccountModal useEffect ===');
    console.log('Modal is open:', isOpen);
    console.log('Account received:', account);
    console.log('Account has ID:', account?.id);
    
    if (isOpen && account?.id) {
      console.log('=== EDITING MODE ===');
      console.log('Account data:', {
        id: account.id,
        description: account.description,
        amount: account.amount,
        category: account.category,
        dueDate: account.dueDate,
        type: account.type,
        status: account.status
      });
      
      // Formatação da data para o input date (YYYY-MM-DD)
      const formattedDueDate = account.dueDate ? account.dueDate.split('T')[0] : '';
      
      const newFormData = {
        id: account.id,
        description: account.description || '',
        amount: Math.abs(account.amount) || 0,
        category: account.category || '',
        dueDate: formattedDueDate,
        type: account.type || 'despesa',
        status: account.status || 'pendente'
      };
      
      console.log('Setting form data:', newFormData);
      setFormData(newFormData);
    } else if (isOpen && !account?.id) {
      console.log('=== NEW ACCOUNT MODE ===');
      const newFormData = {
        description: '',
        amount: 0,
        category: '',
        dueDate: '',
        type: 'despesa' as const,
        status: 'pendente' as const
      };
      console.log('Resetting form data for new account:', newFormData);
      setFormData(newFormData);
    }
  }, [isOpen, account?.id, account?.description, account?.amount, account?.category, account?.dueDate, account?.type, account?.status]);

  useEffect(() => {
    if (isOpen) {
      refreshCategories();
    }
  }, [isOpen, refreshCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAmount = formData.type === 'despesa' ? -Math.abs(formData.amount) : Math.abs(formData.amount);
    
    onSave({
      ...formData,
      amount: finalAmount
    });
    onClose();
  };

  const handleRefreshCategories = () => {
    refreshCategories();
  };

  if (!isOpen) return null;

  console.log('=== RENDERING MODAL ===');
  console.log('Current formData:', formData);
  console.log('Is editing?', !!account?.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {account?.id ? 'Editar Conta' : 'Nova Conta'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <AccountForm
          formData={formData}
          setFormData={setFormData}
          categories={categoriesFromDB}
          onRefreshCategories={handleRefreshCategories}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isEditing={!!account?.id}
        />
      </div>
    </div>
  );
};
