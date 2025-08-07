import { useState } from 'react';
import { CreditCardFormModal } from '@/components/CreditCardFormModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { CreditCardType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CartoesNovo = () => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: cards, isLoading } = useQuery({
    queryKey: ['credit_cards'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cards').select('*').order('id', { ascending: false });
      if (error) throw error;
      return data as CreditCardType[];
    },
  });

  const filteredCards = cards?.filter((card) =>
    card.card_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Buscar cartão..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => { setEditingCard(undefined); setShowCardForm(true); }}>Novo Cartão</Button>
      </div>

      {isLoading ? (
        <p>Carregando...</p>
      ) : filteredCards && filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card) => (
            <div key={card.id} className="border rounded p-4 shadow">
              <h2 className="text-lg font-bold">{card.card_name}</h2>
              <p><strong>Limite:</strong> R$ {card.limit.toFixed(2)}</p>
              <p><strong>Valor Atual:</strong> R$ {card.current_value.toFixed(2)}</p>
              <p><strong>Vencimento:</strong> Dia {card.due_day}</p>
              <Button variant="outline" onClick={() => { setEditingCard(card); setShowCardForm(true); }}>Editar</Button>
            </div>
          ))}
        </div>
      ) : (
        <p>Nenhum cartão encontrado.</p>
      )}

      <CreditCardFormModal
        open={showCardForm}
        onOpenChange={setShowCardForm}
        editingCard={editingCard}
      />
    </div>
  );
};

export default CartoesNovo;
