// src/components/CardAccount/StatusBadge.tsx
import React from 'react';

export type StatusType = 'pendente' | 'pago';

interface StatusBadgeProps {
  status: StatusType;
}

const statusColors: Record<StatusType, string> = {
  pago: 'bg-green-100 text-green-800',
  pendente: 'bg-yellow-100 text-yellow-800'
};

const statusLabels: Record<StatusType, string> = {
  pago: 'Pago',
  pendente: 'Pendente'
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const color = statusColors[status];
  const label = statusLabels[status];

  return (
    <span aria-label={`Status: ${label}`} className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
