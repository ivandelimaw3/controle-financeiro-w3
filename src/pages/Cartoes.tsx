import React, { useState } from 'react';
import { Plus, CreditCard, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CardCard } from '@/components/Cards/CardCard';
import { CardForm } from '@/components/Cards/CardForm';
import { useCardsData, Card } from '@/hooks/useCardsData';
import { useToast } from '@/hooks/use-toast';

const Cartoes = () => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | undefined>();

  const { toast } = useToast();

  const {
    cards,
    isLoading,
    error,
    createCard,
    updateCard,
    deleteCard,
    isCreating,
    isUpdating
  } = useCardsData();

  // Debug: verificar dados
  console.log('Cartões carregados:', cards);
  console.log('Loading:', isLoading);
  console.log('Erro:', error);

  const handleCreateCard = (cardData: any) => {
    createCard(cardData);
    setShowCardForm(false);
    toast({
      title: "Cartão criado com sucesso!",
      duration: 2000,
    });
  };

  const handleUpdateCard = (cardData: any) => {
    if (editingCard) {
      updateCard({ id: editingCard.id, ...cardData });
      setEditingCard(undefined);
      setShowCardForm(false);
      toast({
        title: "Cartão atualizado com sucesso!",
        duration: 2000,
      });
    }
  };

  const handleDeleteCard = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      deleteCard(id);
      toast({
        title: "Cartão excluído com sucesso!",
        duration: 2000,
      });
    }
  };

  const handleEditCard = (card: Card) => {
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
            Erro ao carregar cartões: {error.message}
          </AlertDescription>
        </Alert>
      </Layout>
    );
  }

  // Debug: mostrar dados simples
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
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Meus Cartões</h1>
              <p className="text-slate-600">Gerencie seus cartões de crédito e débito</p>
            </div>
            
            <div className="flex-1"></div>
          </div>
        </div>

        {/* Debug: mostrar dados simples */}
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Debug - Dados dos Cartões:</h3>
          <pre className="text-sm">
            {JSON.stringify(cards, null, 2)}
          </pre>
        </div>

        {/* Versão simples dos cartões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="border rounded-lg p-4 bg-white">
              <h3 className="font-bold text-lg">{card.name || 'Nome não informado'}</h3>
              <p>Banco: {card.bank_name || 'Não informado'}</p>
              <p>Limite: R$ {(card.limit_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p>Vencimento: {card.due_date || 0}º dia</p>
              <p>Fechamento: {card.closing_date || 0}º dia</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditCard(card)}>
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteCard(card.id)}>
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Dialog para Formulário de Cartão */}
        <Dialog open={showCardForm} onOpenChange={closeCardForm}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? 'Editar Cartão' : 'Adicionar Novo Cartão'}
              </DialogTitle>
            </DialogHeader>
            <CardForm
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

export default Cartoes; 