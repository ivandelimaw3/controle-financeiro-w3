// src/pages/CreditCardAccounts.tsx
import React, { useState } from 'react';
import { useCreditCardAccounts } from '../hooks/useCreditCardAccounts';
import CreditCardAccountForm from '../components/CardAccount/CreditCardAccountForm';
import AccountTable from '../components/CardAccount/AccountTable';

const CreditCardAccounts: React.FC = () => {
  const {
    accounts,
    categories,
    creditCards,
    loading,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts,
  } = useCreditCardAccounts();

  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  const handleCreate = async ( any) => {
    try {
      await createAccount(data);
      setShowForm(false);
      refreshAccounts();
    } catch (error) {
      alert('Erro ao salvar conta.');
    }
  };

  const handleUpdate = async ( any) => {
    try {
      await updateAccount(editingAccount.id, data);
      setEditingAccount(null);
      setShowForm(false);
      refreshAccounts();
    } catch (error) {
      alert('Erro ao atualizar conta.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await deleteAccount(id);
        refreshAccounts();
      } catch (error) {
        alert('Erro ao excluir conta.');
      }
    }
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const handleFormSubmit = ( any) => {
    if (editingAccount) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Contas de Cartão</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Nova Conta
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600">Total Recebido</div>
            <div className="text-2xl font-bold text-green-800">R$ 0,00</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600">Total Pago</div>
            <div className="text-2xl font-bold text-red-800">R$ 199,40</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600">Saldo Final</div>
            <div className="text-2xl font-bold text-blue-800">-R$ 199,40</div>
          </div>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="mb-6">
            <CreditCardAccountForm
              onSubmit={handleFormSubmit}
              initialData={editingAccount}
              onCancel={handleCloseForm}
            />
          </div>
        )}

        {/* Tabela */}
        <AccountTable
          accounts={accounts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default CreditCardAccounts;
