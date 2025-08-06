import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreditCardFormModal } from '@/components/credit-card/CreditCardFormModal';
import { useCreditCards, CreditCard } from '@/hooks/useCreditCards';
import { Card, CardContent } from '@/components/ui/card';

const CartoesNovo = () => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    creditCards,
    isLoading,
    createCreditCard,
    updateCreditCard,
    refetch,
  } = useCreditCards();

  useEffect(() => {
    refetch(); // Atualiza a lista sempre que abrir a página
  }, [refetch]);

  const handleEdit = (card: CreditCard) => {
    setEditingCard(card);
    setShowCardForm(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingCard) {
        await updateCreditCard(editingCard.id, data);
      } else {
        await createCreditCard(data);
      }
      await refetch();
      setShowCardForm(false);
      setEditingCard(undefined);
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
    }
  };

  const filteredCards = creditCards?.filter(card => {
    const term = searchTerm.toLowerCase();
    return (
      card.card_name?.toLowerCase().includes(term) ||
      card.holder_name?.toLowerCase().includes(term) ||
      card.bank_name?.toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Input
          type="text"
          placeholder="Buscar cartão..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/2"
        />
        <Button onClick={() => setShowCardForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Novo Cartão
        </Button>
      </div>

      {isLoading ? (
        <p>Carregando cartões...</p>
      ) : filteredCards.length === 0 ? (
        <p>Nenhum cartão encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map(card => (
            <Card key={card.id} className="cursor-pointer" onClick={() => handleEdit(card)}>
              <CardContent className="p-4 space-y-1">
                <h3 className="text-lg font-semibold">{card.card_name}</h3>
                <p className="text-sm text-muted-foreground">{card.holder_name}</p>
                <p className="text-sm">Limite: R$ {card.credit_limit.toFixed(2)}</p>
                <p className="text-sm">Valor atual: R$ {card.current_value.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCardForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <CreditCardFormModal
              card={editingCard}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowCardForm(false);
                setEditingCard(undefined);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartoesNovo;
