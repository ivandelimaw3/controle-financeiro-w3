
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

  // Carregar dados quando o modal abre
  useEffect(() => {
    if (isOpen) {
      console.log('=== Modal aberto ===');
      
      // Primeiro, fazer refresh das categorias
      try {
        refreshCategories();
        console.log('Refresh de categorias realizado');
      } catch (error) {
        console.error('Erro ao fazer refresh das categorias:', error);
      }
      
      // Depois, processar dados da conta
      if (account && account.id) {
        console.log('=== MODO EDIÇÃO ===');
        console.log('Dados da conta:', account);
        
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
        
        console.log('Carregando dados para edição:', editFormData);
        setFormData(editFormData);
      } else {
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
    }
  }, [isOpen, account]);

  // Reset quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      console.log('Modal fechando - resetando formulário');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalAmount = formData.type === 'despesa' ? -Math.abs(formData.amount) : Math.abs(formData.amount);
    
    onSave({
      ...formData,
      amount: finalAmount
    });
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

  if (!isOpen) return null;

  const isEditing = !!(account && account.id);

  console.log('=== RENDERIZANDO MODAL ===');
  console.log('FormData atual:', formData);
  console.log('É edição?', isEditing);
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

        <AccountForm
          formData={formData}
          setFormData={setFormData}
          categories={categoriesFromDB || []}
          onRefreshCategories={handleRefreshCategories}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
};
