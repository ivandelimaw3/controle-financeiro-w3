
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStatus {
  isTrialActive: boolean;
  isPremium: boolean;
  daysRemaining: number;
  trialEndDate: string;
}

export const useUserStatus = () => {
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserStatus();
    } else {
      setUserStatus(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserStatus = async () => {
    try {
      console.log('Buscando status do usuário:', user?.id);
      
      const { data, error } = await supabase.rpc('check_user_trial_status', {
        user_uuid: user?.id
      });

      if (error) {
        console.error('Erro ao buscar status do usuário:', error);
        return;
      }

      if (data && data.length > 0) {
        const status = data[0];
        console.log('Status do usuário:', status);
        setUserStatus({
          isTrialActive: status.is_trial_active,
          isPremium: status.is_premium,
          daysRemaining: status.days_remaining,
          trialEndDate: status.trial_end_date
        });
      }
    } catch (error) {
      console.error('Erro ao buscar status do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  return { userStatus, loading, refreshStatus: fetchUserStatus };
};
