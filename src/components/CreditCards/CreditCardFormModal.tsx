import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreditCardType } from '@/types';

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (card: Partial<CreditCardType>, id?: number) => void;
  card?: CreditCardType;
}

const emptyForm: Partial<CreditCardType> = {
  card_name: '',
  card_number: '',
  holder_name: '',
  expiry_date: '',
  due_date: '',
  credit_limit: 0,
  current_value: 0,
  bank_name: '',
  card_brand: 'visa'
};

export const CreditCardFormModal: React.FC<Props> = ({ show, onClose, onSave, card }) => {
  const [formData, setFormData] = useState<Partial<CreditCardType>>(emptyForm);

  useEffect(() => {
    if (card) {
      setFormData({
        card_name: card.card_name,
        card_number: card.card_number.replace(/\D/g, ''),
        holder_name: card.holder_name,
        expiry_date: card.expiry_date,
        due_date: card.due_date || '',
        credit_limit: card.credit_limit,
        current_value: card.current_value,
        bank_name: card.bank_name || '',
        card_brand: card.card_brand,
      });
    } else {
      setFormData(emptyForm);
    }
  }, [card, show]);

  const handleChange = (field: keyof CreditCardType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData, card?.id);
    onClose();
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card ? 'Editar Cartão' : 'Novo Cartão'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Nome do cartão"
            value={formData.card_name}
            onChange={(e) => handleChange('card_name', e.target.value)}
          />
          <Input
            placeholder="Número"
            value={formData.card_number}
            onChange={(e) => handleChange('card_number', e.target.value.replace(/\D/g, ''))}
          />
          <Input
            placeholder="Nome do titular"
            value={formData.holder_name}
            onChange={(e) => handleChange('holder_name', e.target.value)}
          />
          <Input
            placeholder="Validade (MM/AA)"
            value={formData.expiry_date}
            onChange={(e) => handleChange('expiry_date', e.target.value)}
          />
          <Input
            placeholder="Dia de vencimento"
            type="number"
            value={formData.due_date}
            onChange={(e) => handleChange('due_date', Number(e.target.value))}
          />
          <Input
            placeholder="Limite"
            type="number"
            value={formData.credit_limit}
            onChange={(e) => handleChange('credit_limit', Number(e.target.value))}
          />
          <Input
            placeholder="Valor atual"
            type="number"
            value={formData.current_value}
            onChange={(e) => handleChange('current_value', Number(e.target.value))}
          />
          <Input
            placeholder="Banco"
            value={formData.bank_name}
            onChange={(e) => handleChange('bank_name', e.target.value)}
          />
          <Input
            placeholder="Bandeira"
            value={formData.card_brand}
            onChange={(e) => handleChange('card_brand', e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
