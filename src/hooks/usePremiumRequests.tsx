
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface PremiumUpgradeRequest {
  id: string;
  user_id: string;
  user_email: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export const usePremiumRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PremiumUpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHasPendingRequest, setUserHasPendingRequest] = useState(false);

  const fetchPendingRequests = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Buscando solicitações de upgrade pendentes...');
      const { data, error } = await supabase.rpc('get_pending_upgrade_requests');

      if (error) {
        console.error('Erro ao buscar solicitações:', error);
        return;
      }

      console.log('Solicitações encontradas:', data);
      // Garantir que o status seja do tipo correto
      const typedRequests = (data || []).map(request => ({
        ...request,
        status: request.status as 'pending' | 'approved' | 'rejected'
      }));
      setRequests(typedRequests);
    } catch (error) {
      console.error('Erro ao buscar solicitações de upgrade:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserPendingRequest = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('premium_upgrade_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar solicitação pendente:', error);
        return;
      }

      setUserHasPendingRequest(!!data);
    } catch (error) {
      console.error('Erro ao verificar solicitação pendente:', error);
    }
  };

  const requestPremiumUpgrade = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('premium_upgrade_requests')
        .insert({ user_id: user.id });

      if (error) {
        console.error('Erro ao solicitar upgrade:', error);
        return false;
      }

      await checkUserPendingRequest();
      return true;
    } catch (error) {
      console.error('Erro ao solicitar upgrade premium:', error);
      return false;
    }
  };

  const processRequest = async (
    requestId: string, 
    status: 'approved' | 'rejected', 
    notes?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('process_upgrade_request', {
        request_id: requestId,
        new_status: status,
        admin_notes: notes || null
      });

      if (error) {
        console.error('Erro ao processar solicitação:', error);
        return false;
      }

      if (data) {
        await fetchPendingRequests();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao processar solicitação:', error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPendingRequests();
      checkUserPendingRequest();
    }
  }, [user]);

  return {
    requests,
    loading,
    userHasPendingRequest,
    fetchPendingRequests,
    requestPremiumUpgrade,
    processRequest,
    checkUserPendingRequest
  };
};
