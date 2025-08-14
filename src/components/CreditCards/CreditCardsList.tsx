
import React from 'react';
import { CreditCardItem } from './CreditCardItem';
import { CreditCardData } from '@/hooks/useCreditCardsData';

interface CreditCardsListProps {
  cards: CreditCardData[];
  onEdit: (card: CreditCardData) => void;
  onDelete: (id: number) => void;
}

export const CreditCardsList: React.FC<CreditCardsListProps> = ({
  cards,
  onEdit,
  onDelete
}) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-4xl mb-4">💳</div>
          <div className="text-lg sm:text-xl text-gray-600 mb-4 font-medium">
            Nenhum cartão encontrado
          </div>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Comece adicionando seu primeiro cartão de crédito para organizar melhor suas finanças.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {cards.map((card) => (
        <CreditCardItem
          key={card.id}
          card={card}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
