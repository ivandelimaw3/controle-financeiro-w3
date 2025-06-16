
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
}

export interface AdminData {
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

export const useAdminControl = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async () => {
    if (!user) return false;

    try {
      console.log('Verificando status admin para usuário:', user.id);
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Erro ao verificar status admin:', error);
        return false;
      }

      console.log('Status admin retornado:', data);
      setIsAdmin(data || false);
      return data || false;
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      return false;
    }
  };

  const fetchAllUsers = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Buscando todos os usuários...');
      const { data, error } = await supabase.rpc('get_all_users_with_trial_info');

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
      }

      console.log('Usuários retornados:', data);
      console.log('Número de usuários encontrados:', data?.length || 0);
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar dados de usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAdmins = async () => {
    if (!user) return;

    try {
      console.log('Buscando todos os administradores...');
      
      // Buscar roles de admin com informações dos usuários
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at
        `)
        .eq('role', 'admin');

      if (error) {
        console.error('Erro ao buscar administradores:', error);
        return;
      }

      // Para cada admin, buscar o email do usuário
      const adminsWithEmails = await Promise.all(
        (data || []).map(async (admin) => {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(admin.user_id);
          
          if (userError) {
            console.error('Erro ao buscar dados do usuário:', userError);
            return {
              ...admin,
              email: 'Email não disponível'
            };
          }

          return {
            ...admin,
            email: userData.user?.email || 'Email não disponível'
          };
        })
      );

      console.log('Administradores encontrados:', adminsWithEmails);
      setAdmins(adminsWithEmails);
    } catch (error) {
      console.error('Erro ao buscar administradores:', error);
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    if (!user || !isAdmin) return false;

    try {
      const { data, error } = await supabase.rpc('delete_user_account', {
        target_user_id: userId
      });

      if (error) {
        console.error('Erro ao deletar usuário:', error);
        return false;
      }

      if (data) {
        await fetchAllUsers(); // Recarregar lista
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  };

  const makeUserAdmin = async (userId: string): Promise<boolean> => {
    if (!user || !isAdmin) return false;

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (error) {
        console.error('Erro ao tornar usuário admin:', error);
        return false;
      }

      await fetchAllAdmins(); // Recarregar lista de admins
      return true;
    } catch (error) {
      console.error('Erro ao promover usuário:', error);
      return false;
    }
  };

  const removeAdminRole = async (userId: string): Promise<boolean> => {
    if (!user || !isAdmin) return false;

    // Não permitir que admin remova seu próprio role
    if (userId === user.id) {
      console.error('Admin não pode remover seu próprio role');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        console.error('Erro ao remover role admin:', error);
        return false;
      }

      await fetchAllAdmins(); // Recarregar lista de admins
      return true;
    } catch (error) {
      console.error('Erro ao remover admin:', error);
      return false;
    }
  };

  useEffect(() => {
    const initAdmin = async () => {
      console.log('Inicializando painel admin...');
      const adminStatus = await checkAdminStatus();
      console.log('É admin?', adminStatus);
      
      if (adminStatus) {
        await Promise.all([fetchAllUsers(), fetchAllAdmins()]);
      } else {
        console.log('Usuário não é admin, não carregando lista de usuários');
        setLoading(false);
      }
    };

    initAdmin();
  }, [user]);

  return {
    users,
    admins,
    loading,
    isAdmin,
    fetchAllUsers,
    fetchAllAdmins,
    deleteUser,
    makeUserAdmin,
    removeAdminRole,
    checkAdminStatus
  };
};
