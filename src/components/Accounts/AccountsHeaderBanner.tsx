import React from 'react';

export const AccountsHeaderBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 shadow-lg">
      <h1 className="text-2xl font-bold text-primary-foreground mb-1">
        Controle Financeiro W3
      </h1>
      <p className="text-primary-foreground/90 text-sm">
        Gerencie suas contas de forma inteligente
      </p>
    </div>
  );
};
