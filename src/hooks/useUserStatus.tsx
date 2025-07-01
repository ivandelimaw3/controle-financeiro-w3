
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserStatus {
  is_trial_active: boolean;
  is_premium: boolean;
  days_remaining: number;
  trial_end_date: string;
}

export const useUserStatus = () => {
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkUserStatus();
    } else {
      setUserStatus(null);
      setLoading(false);
    }
  }, [user]);

  const checkUserStatus = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase.rpc('check_user_trial_status', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Erro ao verificar status do usuário:', error);
        return;
      }

      if (data && data.length > 0) {
        setUserStatus(data[0]);
      }
    } catch (error) {
      console.error('Erro ao verificar status do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = () => {
    if (!userStatus) return 'Carregando...';
    
    if (userStatus.is_premium) {
      return 'Premium';
    }
    
    if (userStatus.is_trial_active) {
      return `Trial (${userStatus.days_remaining} dias restantes)`;
    }
    
    return 'Expirado';
  };

  const getStatusColor = () => {
    if (!userStatus) return 'text-gray-500';
    
    if (userStatus.is_premium) {
      return 'text-yellow-600';
    }
    
    if (userStatus.is_trial_active) {
      return 'text-green-600';
    }
    
    return 'text-red-600';
  };

  const isExpired = () => {
    if (!userStatus) return false;
    return !userStatus.is_premium && !userStatus.is_trial_active;
  };

  return {
    userStatus,
    loading,
    getStatusText,
    getStatusColor,
    isExpired,
    refreshStatus: checkUserStatus
  };
};
