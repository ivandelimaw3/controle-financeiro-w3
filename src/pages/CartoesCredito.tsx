import React, { useState } from 'react';
import { Plus, CreditCard as CreditCardIcon, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCardCard } from '@/components/CreditCards/CreditCardCard';
import { CreditCardForm } from '@/components/CreditCards/CreditCardForm';
import { useCreditCardsData, CreditCard, CreditCardInput } from '@/hooks/useCreditCardsData';
import { useToast } from '@/hooks/use-toast';

const CartoesCredito = () => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | undefined>();

  const { toast } = useToast();

  const {
    creditCards,
    isLoading,
    error,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    isCreating,
    isUpdating
  } = useCreditCardsData();

  const handleCreateCard = async (cardData: CreditCardInput) => {
    await createCreditCard(cardData);
    setShowCardForm(false);
    toast({
      title: "Cartão criado com sucesso!",
      duration: 2000,
    });
  };

  const handleUpdateCard = async (cardData: CreditCardInput) => {
    if (editingCard) {
      await updateCreditCard({ id: editingCard.id, ...cardData });
      setEditingCard(undefined);
      setShowCardForm(false);
      toast({
        title: "Cartão atualizado com sucesso!",
        duration: 2000,
      });
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      await deleteCreditCard(id);
      toast({
        title: "Cartão excluído com sucesso!",
        duration: 2000,
      });
    }
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setShowCardForm(true);
  };

  const closeCardForm = () => {
    setShowCardForm(false);
    setEditingCard(undefined);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Carregando cartões...</p>
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
            Erro ao carregar cartões. Tente novamente.
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
                onClick={() => setShowCardForm(true)}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cartão
              </Button>
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Meus Cartões de Crédito</h1>
              <p className="text-slate-600">Gerencie seus cartões de crédito</p>
            </div>
            
            <div className="flex-1"></div>
          </div>
        </div>

        {creditCards.length === 0 ? (
          <div className="text-center py-12">
            <CreditCardIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 mb-2">
              Nenhum cartão cadastrado
            </h3>
            <p className="text-slate-500 mb-6">
              Adicione seu primeiro cartão de crédito para começar a gerenciar seus gastos.
            </p>
            <Button
              onClick={() => setShowCardForm(true)}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Cartão
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creditCards.map((card) => (
              <CreditCardCard
                key={card.id}
                card={card}
                onEdit={handleEditCard}
                onDelete={handleDeleteCard}
              />
            ))}
          </div>
        )}

        {/* Dialog para Formulário de Cartão */}
        <Dialog open={showCardForm} onOpenChange={closeCardForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? 'Editar Cartão' : 'Adicionar Novo Cartão'}
              </DialogTitle>
            </DialogHeader>
            <CreditCardForm
              card={editingCard}
              onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
              onCancel={closeCardForm}
              isLoading={isCreating || isUpdating}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CartoesCredito; 