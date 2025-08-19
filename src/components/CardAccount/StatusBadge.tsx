// src/components/CardAccount/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  status: 'pendente' | 'pago';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {status === 'pago' ? 'Pago' : 'Pendente'}
    </span>
  );
};

export default StatusBadge;
