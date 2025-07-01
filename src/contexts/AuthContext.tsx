
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserStatus {
  is_trial_active: boolean;
  is_premium: boolean;
  days_remaining: number;
  trial_end_date: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userStatus: UserStatus | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkUserStatus(session.user.id);
        } else {
          setUserStatus(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkUserStatus(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('check_user_trial_status', {
        user_uuid: userId
      });

      if (error) {
        console.error('Erro ao verificar status do usuário:', error);
        return;
      }

      if (data && data.length > 0) {
        const status = data[0];
        setUserStatus(status);
        
        // Se o usuário estiver expirado, fazer logout
        if (!status.is_premium && !status.is_trial_active) {
          console.log('Usuário expirado, fazendo logout...');
          await signOut();
          throw new Error('Sua conta expirou. Entre em contato com o administrador.');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status do usuário:', error);
      throw error;
    }
  };

  const refreshUserStatus = async () => {
    if (user?.id) {
      await checkUserStatus(user.id);
    }
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error };
      }

      // Verificar status do usuário após login bem-sucedido
      if (data.user) {
        try {
          await checkUserStatus(data.user.id);
        } catch (statusError) {
          // Se houver erro no status (usuário expirado), retornar esse erro
          return { error: statusError };
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    setUserStatus(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      userStatus,
      signUp,
      signIn,
      signOut,
      refreshUserStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};
