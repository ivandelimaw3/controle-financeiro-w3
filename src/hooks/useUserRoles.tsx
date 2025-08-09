
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
  is_admin?: boolean;
}

export const useUserRoles = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
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
          await fetchUserRoles();
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

  const fetchUserRoles = async () => {
    try {
      console.log('Buscando roles dos usuários...');
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');

      if (error) {
        console.error('Erro ao buscar roles:', error);
        return;
      }

      console.log('Roles encontradas:', data);
      setUserRoles(data || []);
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
    }
  };

  const isUserAdminRole = (userId: string) => {
    return userRoles.some(role => role.user_id === userId && role.role === 'admin');
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
      await fetchUserRoles();
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
      await fetchUserRoles();
    } catch (error) {
      console.error('Erro ao remover role de admin:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.log('=== INICIANDO PROCESSO DE DELEÇÃO ===');
      console.log('ID do usuário a ser deletado:', userId);
      console.log('ID do usuário logado:', user?.id);
      
      // Verificar se não está tentando deletar um admin
      const isTargetAdmin = isUserAdminRole(userId);
      console.log('Usuário alvo é admin?', isTargetAdmin);
      
      if (isTargetAdmin) {
        console.error('ERRO: Tentativa de deletar usuário administrador bloqueada');
        throw new Error('Não é possível deletar um usuário administrador');
      }
      
      // Verificar se não está tentando deletar a si mesmo
      if (userId === user?.id) {
        console.error('ERRO: Tentativa de auto-deletar bloqueada');
        throw new Error('Não é possível deletar sua própria conta');
      }
      
      console.log('=== CHAMANDO FUNÇÃO RPC ===');
      console.log('Chamando delete_user_account com parâmetro:', userId);
      
      const { data, error } = await supabase.rpc('delete_user_account', {
        target_user_id: userId
      });

      console.log('=== RESPOSTA DA FUNÇÃO RPC ===');
      console.log('Data retornada:', data);
      console.log('Error retornado:', error);
      console.log('Tipo de data:', typeof data);
      console.log('Valor exato de data:', JSON.stringify(data));

      if (error) {
        console.error('=== ERRO NA FUNÇÃO RPC ===');
        console.error('Erro completo:', JSON.stringify(error, null, 2));
        console.error('Mensagem do erro:', error.message);
        console.error('Código do erro:', error.code);
        throw new Error(`Erro ao executar função de exclusão: ${error.message || 'Erro desconhecido'}`);
      }

      // Log mais detalhado sobre o retorno
      console.log('=== ANÁLISE DO RETORNO ===');
      if (data === null) {
        console.log('Data é null');
      } else if (data === undefined) {
        console.log('Data é undefined');
      } else if (data === true) {
        console.log('Data é true (sucesso)');
      } else if (data === false) {
        console.log('Data é false (falha)');
      } else {
        console.log('Data tem valor inesperado:', data);
      }

      // Aceitar tanto true quanto null como sucesso (dependendo de como a função RPC retorna)
      if (data !== true && data !== null) {
        console.error('=== FUNÇÃO RPC NÃO RETORNOU SUCESSO ===');
        console.error('Valor retornado:', data);
        throw new Error(`A operação de exclusão falhou. Retorno: ${JSON.stringify(data)}`);
      }

      console.log('=== EXCLUSÃO APARENTEMENTE BEM-SUCEDIDA ===');
      console.log('Atualizando listas de usuários...');
      
      // Atualizar as listas após deletar
      await fetchAllUsers();
      await fetchUserRoles();
      
      console.log('=== PROCESSO CONCLUÍDO COM SUCESSO ===');
      
    } catch (error) {
      console.error('=== ERRO COMPLETO NO PROCESSO DE DELEÇÃO ===');
      console.error('Tipo do erro:', typeof error);
      console.error('Erro completo:', error);
      
      if (error instanceof Error) {
        console.error('Mensagem do erro:', error.message);
        console.error('Stack trace:', error.stack);
      } else {
        console.error('Erro não é uma instância de Error:', JSON.stringify(error));
      }
      
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
    userRoles,
    isUserAdminRole,
    makeUserAdmin,
    removeAdminRole,
    deleteUser,
    updateUserStatus,
    refreshUsers: fetchAllUsers
  };
};
