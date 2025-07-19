import React, { useState } from 'react';
import { Plus, CreditCard, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CardForm } from '@/components/Cards/CardForm';
import { useCardsData, Card, CardInput } from '@/hooks/useCardsData';
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

  const handleCreateCard = (cardData: CardInput) => {
    createCard(cardData);
    setShowCardForm(false);
    toast({
      title: "Cartão criado com sucesso!",
      duration: 2000,
    });
  };

  const handleUpdateCard = (cardData: CardInput) => {
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

  // Função segura para formatar moeda
  const safeFormatCurrency = (value: any) => {
    try {
      if (value === null || value === undefined || isNaN(value)) {
        return 'R$ 0,00';
      }
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(Number(value));
    } catch (error) {
      return 'R$ 0,00';
    }
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

        {/* Debug: mostrar dados */}
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Debug - Dados dos Cartões:</h3>
          <pre className="text-sm">
            {JSON.stringify(cards, null, 2)}
          </pre>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 mb-2">
              Nenhum cartão cadastrado
            </h3>
            <p className="text-slate-500 mb-6">
              Adicione seu primeiro cartão para começar a gerenciar suas finanças.
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
            {cards.map((card) => (
              <div key={card.id} className="border rounded-lg p-4 bg-white hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-lg">{card.name || 'Nome não informado'}</h3>
                      <p className="text-sm text-gray-600">{card.card_number || '**** **** **** ****'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {card.card_brand || 'Desconhecida'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Validade:</span>
                    <span>{card.expiry_date || 'MM/AA'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Banco:</span>
                    <span>{card.bank_name || 'Não informado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pagamento:</span>
                    <span>{card.payment_date || 0}º dia</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Débito Atual:</span>
                      <span className={`font-bold ${(Number(card.current_balance) || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {safeFormatCurrency(card.current_balance)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCard(card)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

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