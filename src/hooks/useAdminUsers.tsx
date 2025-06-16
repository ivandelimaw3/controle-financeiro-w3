
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUserData {
  user_id: string;
  email: string;
  created_at: string;
  trial_start_date: string;
  trial_end_date: string;
  is_trial_active: boolean;
  is_premium: boolean;
  days_remaining: number;
  upgrade_request_date: string | null;
  upgrade_status: string;
  needs_attention: boolean;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_users_for_admin_review');
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar dados de usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('process_user_upgrade', {
        target_user_id: userId,
        new_status: 'approved',
        make_premium: true
      });

      if (error) {
        console.error('Erro ao aprovar usuário:', error);
        return false;
      }

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      return false;
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('process_user_upgrade', {
        target_user_id: userId,
        new_status: 'rejected',
        make_premium: false
      });

      if (error) {
        console.error('Erro ao rejeitar usuário:', error);
        return false;
      }

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    approveUser,
    rejectUser
  };
};
