
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CardAccountForm } from './CardAccountForm';
import type { CardAccountData, CardAccountFormData } from '@/hooks/useCardAccountsData';

interface CardAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: CardAccountData | null;
  onSubmit: (data: CardAccountFormData) => void;
  isLoading: boolean;
}

export const CardAccountModal = ({
  isOpen,
  onClose,
  account,
  onSubmit,
  isLoading
}: CardAccountModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Editar Conta do Cartão' : 'Nova Conta do Cartão'}
          </DialogTitle>
        </DialogHeader>
        
        <CardAccountForm
          account={account}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
