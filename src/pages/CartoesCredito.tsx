
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCardsHeader } from '@/components/CreditCards/CreditCardsHeader';
import { CreditCardsSummary } from '@/components/CreditCards/CreditCardsSummary';
import { CreditCardsList } from '@/components/CreditCards/CreditCardsList';
import { CreditCardFormModal } from '@/components/CreditCards/CreditCardFormModal';
import { useCreditCardsData, CreditCardData, CreditCardFormData } from '@/hooks/useCreditCardsData';

const CartoesCredito = () => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardData | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    creditCards,
    isLoading,
    error,
    createCard,
    updateCard,
    deleteCard,
    isCreating,
    isUpdating,
    forceRefresh
  } = useCreditCardsData();

  // Fazer refresh dos dados quando a página é carregada
  useEffect(() => {
    console.log('CartoesCredito: Componente montado, fazendo refresh dos dados...');
    forceRefresh();
  }, [forceRefresh]);

  // Filtros
  const filteredCards = creditCards.filter(card => {
    return card.card_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (card.bank_name && card.bank_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
           card.card_number.includes(searchTerm);
  });

  const handleCreateCard = async (cardData: CreditCardFormData) => {
    try {
      await createCard(cardData);
      setShowCardForm(false);
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
    }
  };

  const handleUpdateCard = async (cardData: CreditCardFormData) => {
    if (editingCard) {
      try {
        await updateCard({ id: editingCard.id, cardData });
        setShowCardForm(false);
        setEditingCard(undefined);
      } catch (error) {
        console.error('Erro ao atualizar cartão:', error);
      }
    }
  };

  const handleDeleteCard = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      try {
        await deleteCard(id);
      } catch (error) {
        console.error('Erro ao excluir cartão:', error);
      }
    }
  };

  const handleEditCard = (card: CreditCardData) => {
    setEditingCard(card);
    setShowCardForm(true);
  };

  const handleNewCard = () => {
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
          <div className="text-lg">Carregando cartões...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <CreditCardsHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onNewCard={handleNewCard}
        />

        <CreditCardsSummary cards={filteredCards} />

        <CreditCardsList
          cards={filteredCards}
          onEdit={handleEditCard}
          onDelete={handleDeleteCard}
        />
      </div>

      {/* Modal de formulário */}
      <Dialog open={showCardForm} onOpenChange={setShowCardForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editingCard ? 'Editar Cartão' : 'Adicionar Novo Cartão'}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeCardForm}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <CreditCardFormModal
            card={editingCard}
            onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
            onCancel={closeCardForm}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CartoesCredito;
