
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

  // Efeito separado para quando o modal abre/fecha
  useEffect(() => {
    console.log('=== Modal isOpen change ===', isOpen);
    
    if (!isOpen) {
      // Apenas resetar quando o modal fechar
      console.log('Modal fechando - resetando form');
      setFormData({
        description: '',
        amount: 0,
        category: '',
        dueDate: '',
        type: 'despesa',
        status: 'pendente'
      });
    }
  }, [isOpen]);

  // Efeito separado para carregar dados da conta
  useEffect(() => {
    console.log('=== Account data change ===');
    console.log('Account received:', account);
    console.log('Modal is open:', isOpen);
    
    // Só processar se o modal estiver aberto
    if (!isOpen) {
      console.log('Modal não está aberto, ignorando mudança de account');
      return;
    }

    if (account && account.id) {
      console.log('=== CARREGANDO DADOS PARA EDIÇÃO ===');
      console.log('Account ID:', account.id);
      console.log('Account data:', account);
      
      // Formatação da data para o input date (YYYY-MM-DD)
      const formattedDueDate = account.dueDate ? account.dueDate.split('T')[0] : '';
      
      const editFormData = {
        id: account.id,
        description: account.description || '',
        amount: Math.abs(account.amount) || 0,
        category: account.category || '',
        dueDate: formattedDueDate,
        type: account.type || 'despesa',
        status: account.status || 'pendente'
      };
      
      console.log('Definindo dados do formulário para edição:', editFormData);
      setFormData(editFormData);
    } else if (isOpen) {
      console.log('=== MODO NOVA CONTA ===');
      setFormData({
        description: '',
        amount: 0,
        category: '',
        dueDate: '',
        type: 'despesa',
        status: 'pendente'
      });
    }
  }, [account, isOpen]);

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

  const isEditing = !!(account && account.id);

  console.log('=== RENDERIZANDO MODAL ===');
  console.log('Current formData:', formData);
  console.log('Is editing?', isEditing);
  console.log('Account prop:', account);

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

        <AccountForm
          formData={formData}
          setFormData={setFormData}
          categories={categoriesFromDB}
          onRefreshCategories={handleRefreshCategories}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
};
