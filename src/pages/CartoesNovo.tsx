import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCardFormModal } from './CreditCardFormModal';
import { CreditCardType } from '@/types';

export default function CartoesNovo() {
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | undefined>(undefined);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: cards, refetch } = useQuery(['credit_cards'], async () => {
    const { data, error } = await supabase.from('credit_cards').select('*');
    if (error) throw error;
    return data as CreditCardType[];
  });

  const filtered = cards?.filter((card) =>
    card.card_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveCard = async (data: Partial<CreditCardType>, id?: number) => {
    if (id) {
      await supabase.from('credit_cards').update(data).eq('id', id);
    } else {
      await supabase.from('credit_cards').insert(data);
    }
    await queryClient.invalidateQueries(['credit_cards']);
  };

  const handleEditCard = (card: CreditCardType) => {
    setEditingCard(card);
    setTimeout(() => setShowCardForm(true), 0);
  };

  const handleCloseForm = () => {
    setEditingCard(undefined);
    setShowCardForm(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Buscar cartão"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => {
          setEditingCard(undefined);
          setShowCardForm(true);
        }}>
          Novo Cartão
        </Button>
      </div>

      {filtered && filtered.length > 0 ? (
        <ul className="space-y-2">
          {filtered.map((card) => (
            <li
              key={card.id}
              className="border p-4 rounded shadow cursor-pointer hover:bg-gray-100"
              onClick={() => handleEditCard(card)}
            >
              <div className="font-bold">{card.card_name}</div>
              <div className="text-sm">{card.card_number}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div>Nenhum cartão encontrado.</div>
      )}

      <CreditCardFormModal
        show={showCardForm}
        onClose={handleCloseForm}
        onSave={handleSaveCard}
        card={editingCard}
      />
    </div>
  );
}
