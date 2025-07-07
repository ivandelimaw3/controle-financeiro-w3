
import React, { useState } from 'react';
import { Plus, Building2, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BankCard } from '@/components/Banks/BankCard';
import { BankForm } from '@/components/Banks/BankForm';
import { DepositForm } from '@/components/Banks/DepositForm';
import { useBanksData, Bank, BankInput } from '@/hooks/useBanksData';
import { useDepositsData } from '@/hooks/useDepositsData';

const Bancos = () => {
  const [showBankForm, setShowBankForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | undefined>();
  const [selectedBankForDeposit, setSelectedBankForDeposit] = useState<Bank | undefined>();

  const {
    banks,
    isLoading,
    error,
    createBank,
    updateBank,
    deleteBank,
    isCreating,
    isUpdating
  } = useBanksData();

  const { createDeposit, isCreating: isCreatingDeposit } = useDepositsData();

  const handleCreateBank = (bankData: BankInput) => {
    createBank(bankData);
    setShowBankForm(false);
  };

  const handleUpdateBank = (bankData: BankInput) => {
    if (editingBank) {
      updateBank({ id: editingBank.id, ...bankData });
      setEditingBank(undefined);
      setShowBankForm(false);
    }
  };

  const handleDeleteBank = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este banco?')) {
      deleteBank(id);
    }
  };

  const handleEditBank = (bank: Bank) => {
    setEditingBank(bank);
    setShowBankForm(true);
  };

  const handleAddDeposit = (bank: Bank) => {
    setSelectedBankForDeposit(bank);
    setShowDepositForm(true);
  };

  const handleCreateDeposit = (depositData: any) => {
    createDeposit(depositData);
    setShowDepositForm(false);
    setSelectedBankForDeposit(undefined);
  };

  const closeBankForm = () => {
    setShowBankForm(false);
    setEditingBank(undefined);
  };

  const closeDepositForm = () => {
    setShowDepositForm(false);
    setSelectedBankForDeposit(undefined);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Carregando bancos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar bancos. Tente novamente.
          </AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-start">
              <Button
                onClick={() => setShowBankForm(true)}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Banco
              </Button>
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Meus Bancos</h1>
              <p className="text-slate-600">Gerencie suas contas bancárias e registre depósitos</p>
            </div>
            
            <div className="flex-1"></div>
          </div>
        </div>

        {banks.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 mb-2">
              Nenhum banco cadastrado
            </h3>
            <p className="text-slate-500 mb-6">
              Adicione sua primeira conta bancária para começar a gerenciar seus depósitos.
            </p>
            <Button
              onClick={() => setShowBankForm(true)}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Banco
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banks.map((bank) => (
              <BankCard
                key={bank.id}
                bank={bank}
                onEdit={handleEditBank}
                onDelete={handleDeleteBank}
                onAddDeposit={handleAddDeposit}
              />
            ))}
          </div>
        )}

        {/* Dialog para Formulário de Banco */}
        <Dialog open={showBankForm} onOpenChange={closeBankForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBank ? 'Editar Banco' : 'Adicionar Novo Banco'}
              </DialogTitle>
            </DialogHeader>
            <BankForm
              bank={editingBank}
              onSubmit={editingBank ? handleUpdateBank : handleCreateBank}
              onCancel={closeBankForm}
              isLoading={isCreating || isUpdating}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog para Formulário de Depósito */}
        <Dialog open={showDepositForm} onOpenChange={closeDepositForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Depósito</DialogTitle>
            </DialogHeader>
            {selectedBankForDeposit && (
              <DepositForm
                bank={selectedBankForDeposit}
                onSubmit={handleCreateDeposit}
                onCancel={closeDepositForm}
                isLoading={isCreatingDeposit}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Bancos;
