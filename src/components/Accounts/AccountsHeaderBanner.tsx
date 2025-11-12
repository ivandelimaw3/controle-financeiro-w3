import React from 'react';

export const AccountsHeaderBanner: React.FC = () => {
  return (
    <div className="bg-card rounded-xl p-4 shadow-lg border border-border">
      <h1 className="text-xl font-bold text-card-foreground mb-1">
        Controle Financeiro W3
      </h1>
      <p className="text-muted-foreground text-sm">
        Gerencie suas contas de forma inteligente
      </p>
    </div>
  );
};
