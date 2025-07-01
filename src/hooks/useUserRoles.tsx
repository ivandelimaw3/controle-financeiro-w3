
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface AdminUser {
  user_id: string;
  email: string;
  created_at: string;
  trial_start_date: string;
  trial_end_date: string;
  is_trial_active: boolean;
  is_premium: boolean;
  days_remaining: number;
}

export const useUserRoles = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      console.log('Verificando status de admin para usuário:', user?.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar role de admin:', error);
        setIsAdmin(false);
      } else {
        const adminStatus = !!data;
        console.log('Status de admin:', adminStatus);
        setIsAdmin(adminStatus);
        
        if (adminStatus) {
          await fetchAllUsers();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status de admin:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      console.log('Buscando todos os usuários...');
      
      const { data, error } = await supabase.rpc('get_all_users_with_trial_info');

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
      }

      console.log('Usuários encontrados:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const makeUserAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (error) {
        console.error('Erro ao tornar usuário admin:', error);
        throw error;
      }

      await fetchAllUsers();
    } catch (error) {
      console.error('Erro ao tornar usuário admin:', error);
      throw error;
    }
  };

  const removeAdminRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        console.error('Erro ao remover role de admin:', error);
        throw error;
      }

      await fetchAllUsers();
    } catch (error) {
      console.error('Erro ao remover role de admin:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.log('Deletando usuário:', userId);
      
      const { data, error } = await supabase.rpc('delete_user_account', {
        target_user_id: userId
      });

      if (error) {
        console.error('Erro ao deletar usuário:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Falha ao deletar usuário');
      }

      await fetchAllUsers();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  };

  const updateUserStatus = async (
    userId: string, 
    isPremium: boolean, 
    isTrialActive: boolean,
    extendTrialDays: number = 0
  ) => {
    try {
      console.log('Atualizando status do usuário:', { userId, isPremium, isTrialActive, extendTrialDays });
      
      const { data, error } = await supabase.rpc('update_user_status', {
        target_user_id: userId,
        is_premium: isPremium,
        is_trial_active: isTrialActive,
        extend_trial_days: extendTrialDays
      });

      if (error) {
        console.error('Erro ao atualizar status do usuário:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Falha ao atualizar status do usuário');
      }

      await fetchAllUsers();
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      throw error;
    }
  };

  return {
    loading,
    isAdmin,
    users,
    makeUserAdmin,
    removeAdminRole,
    deleteUser,
    updateUserStatus,
    refreshUsers: fetchAllUsers
  };
};
