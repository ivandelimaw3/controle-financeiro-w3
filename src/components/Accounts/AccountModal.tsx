
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

  console.log('=== AccountModal Render ===');
  console.log('isOpen:', isOpen);
  console.log('account prop:', account);
  console.log('formData:', formData);
  console.log('isFormReady:', isFormReady);

  useEffect(() => {
    if (!isOpen) {
      console.log('Modal fechado, resetando estado');
      setIsFormReady(false);
      return;
    }

    console.log('Modal aberto, preparando dados...');

    // Formatação da data para input
    const formatDateForInput = (dateStr: string) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Erro ao formatar data:', error);
        return '';
      }
    };

    if (account?.id) {
      console.log('Modo edição - carregando dados da conta:', account);
      const newFormData = {
        id: account.id,
        description: account.description || '',
        amount: Math.abs(account.amount) || 0,
        category: account.category || '',
        dueDate: formatDateForInput(account.dueDate),
        type: account.type || 'despesa',
        status: account.status || 'pendente'
      };
      console.log('Dados preparados para edição:', newFormData);
      setFormData(newFormData);
    } else {
      console.log('Modo nova conta - dados padrão');
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
      console.log('Categorias carregadas, formulário pronto');
      setIsFormReady(true);
    });
  }, [isOpen, account, refreshCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submetendo formulário:', formData);
    
    const finalAmount = formData.type === 'despesa' ? -Math.abs(formData.amount) : Math.abs(formData.amount);
    
    const accountToSave = {
      ...formData,
      amount: finalAmount
    };
    
    console.log('Salvando conta:', accountToSave);
    onSave(accountToSave);
    onClose();
  };

  const handleRefreshCategories = async () => {
    try {
      console.log('Fazendo refresh manual das categorias...');
      await refreshCategories();
      console.log('Refresh manual concluído');
    } catch (error) {
      console.error('Erro no refresh manual das categorias:', error);
    }
  };

  if (!isOpen) {
    console.log('Modal não está aberto, retornando null');
    return null;
  }

  const isEditing = !!(account?.id);

  console.log('Renderizando modal - isEditing:', isEditing);
  console.log('FormData final:', formData);
  console.log('Categorias disponíveis:', categoriesFromDB?.length || 0);

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
