
import React from 'react';
import { Crown, Clock, CheckCircle } from 'lucide-react';
import { useUserStatus } from '@/hooks/useUserStatus';

export const UserStatusBadge: React.FC = () => {
  const { userStatus, loading } = useUserStatus();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg">
        <div className="w-4 h-4 bg-slate-300 rounded animate-pulse"></div>
        <span className="text-sm text-slate-500">Carregando...</span>
      </div>
    );
  }

  if (!userStatus) {
    return null;
  }

  const { isPremium, isTrialActive, daysRemaining } = userStatus;

  if (isPremium) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 rounded-lg border border-yellow-300">
        <Crown size={16} className="text-yellow-600" />
        <span className="text-sm font-medium">Premium</span>
      </div>
    );
  }

  if (isTrialActive) {
    const isExpiringSoon = daysRemaining <= 3;
    
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
        isExpiringSoon 
          ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
          : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300'
      }`}>
        <Clock size={16} className={isExpiringSoon ? 'text-red-600' : 'text-blue-600'} />
        <span className="text-sm font-medium">
          Trial - {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-lg border border-gray-300">
      <CheckCircle size={16} className="text-gray-600" />
      <span className="text-sm font-medium">Trial Expirado</span>
    </div>
  );
};
