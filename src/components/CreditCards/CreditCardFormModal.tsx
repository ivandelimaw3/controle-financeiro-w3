import { useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { CreditCardType } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

interface CreditCardFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCard?: CreditCardType;
}

export const CreditCardFormModal = ({ open, onOpenChange, editingCard }: CreditCardFormModalProps) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<CreditCardType>();

  useEffect(() => {
    if (editingCard) {
      setValue('card_name', editingCard.card_name);
      setValue('limit', editingCard.limit);
      setValue('current_value', editingCard.current_value);
      setValue('due_day', editingCard.due_day);
    } else {
      reset();
    }
  }, [editingCard, setValue, reset]);

  const { mutate: saveCard, isLoading } = useMutation({
    mutationFn: async (data: CreditCardType) => {
      if (editingCard) {
        const { error } = await supabase
          .from('cards')
          .update(data)
          .eq('id', editingCard.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cards')
          .insert({ ...data, current_value: 0 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      onOpenChange(false);
      reset();
    },
  });

  const onSubmit = (data: CreditCardType) => {
    saveCard(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{editingCard ? 'Editar Cartão' : 'Novo Cartão'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input placeholder="Nome do Cartão" {...register('card_name', { required: true })} />
          <Input
            type="number"
            step="0.01"
            placeholder="Limite"
            {...register('limit', { required: true, valueAsNumber: true })}
          />
          <Input
            type="number"
            step="1"
            placeholder="Dia do vencimento"
            {...register('due_day', { required: true, valueAsNumber: true })}
          />
          <Button type="submit" disabled={isLoading}>
            {editingCard ? 'Salvar' : 'Cadastrar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
