
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const usePremiumRequests = () => {
  const { user } = useAuth();
  const [userHasPendingRequest, setUserHasPendingRequest] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkUserPendingRequest = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_usage_control')
        .select('upgrade_status')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao verificar solicitação pendente:', error);
        return;
      }

      setUserHasPendingRequest(data?.upgrade_status === 'pending');
    } catch (error) {
      console.error('Erro ao verificar status da solicitação:', error);
    }
  };

  const requestPremiumUpgrade = async () => {
    if (!user) return false;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('request_premium_upgrade');

      if (error) {
        console.error('Erro ao solicitar upgrade:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Erro ao solicitar upgrade:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserPendingRequest();
  }, [user]);

  return {
    userHasPendingRequest,
    requestPremiumUpgrade,
    checkUserPendingRequest,
    loading
  };
};
