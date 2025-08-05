import React, { useState } from 'react';
import { Plus, CreditCard, Search, User, X } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CreditCardItem } from '@/components/CreditCards/CreditCardItem';
import { CreditCardFormModal } from '@/components/CreditCards/CreditCardFormModal';
import { useCreditCards, CreditCard as CreditCardType, CreditCardInput } from '@/hooks/useCreditCards';
import { useToast } from '@/hooks/use-toast';

const CartoesNovo = () => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

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
  } = useCreditCards();

  // Funções de formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Cálculos para os cards de resumo
  const totalCards = creditCards.length;
  const totalLimit = creditCards.reduce((sum, card) => sum + card.credit_limit, 0);
  const totalUsed = creditCards.reduce((sum, card) => sum + card.current_value, 0);

  // Filtros
  const filteredCards = creditCards.filter(card => {
    return card.card_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (card.bank_name && card.bank_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
           card.card_number.includes(searchTerm);
  });

  const handleCreateCard = async (cardData: CreditCardInput) => {
    try {
      await createCreditCard(cardData);
      setShowCardForm(false);
      toast({
        title: "Cartão criado com sucesso!",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Erro ao criar cartão",
        description: "Tente novamente",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleUpdateCard = async (cardData: CreditCardInput) => {
    if (editingCard) {
      try {
        await updateCreditCard({ id: editingCard.id, card: cardData });
        setShowCardForm(false);
        setEditingCard(undefined);
        toast({
          title: "Cartão atualizado com sucesso!",
          duration: 2000,
        });
      } catch (error) {
        toast({
          title: "Erro ao atualizar cartão",
          description: "Tente novamente",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const handleDeleteCard = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      try {
        await deleteCreditCard(id);
        toast({
          title: "Cartão excluído com sucesso!",
          duration: 2000,
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir cartão",
          description: "Tente novamente",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const handleEditCard = (card: CreditCardType) => {
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
          <div className="text-lg">Carregando cartões...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Controle de Cartões</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">João Silva</span>
          </div>
        </div>

        {/* Título principal e ações */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Meus Cartões de Crédito</h2>
            <p className="text-gray-600 mt-1">Gerencie seus cartões e acompanhe seus gastos</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cartões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={() => setShowCardForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cartão
            </Button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Cartões</p>
                <p className="text-2xl font-bold text-gray-900">{totalCards}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Limite Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalLimit)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Utilizado</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalUsed)}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de cartões */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCards.map((card) => (
            <CreditCardItem
              key={card.id}
              card={card}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
            />
          ))}
        </div>

        {filteredCards.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cartão encontrado</h3>
            <p className="text-gray-600">Comece adicionando seu primeiro cartão de crédito.</p>
          </div>
        )}
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

export default CartoesNovo;
