import React from 'react';

export const AccountsHeaderBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-4 shadow-lg">
      <h1 className="text-xl font-bold text-white mb-1">
        Controle Financeiro W3
      </h1>
      <p className="text-white/90 text-sm">
        Gerencie suas contas de forma inteligente
      </p>
    </div>
  );
};
