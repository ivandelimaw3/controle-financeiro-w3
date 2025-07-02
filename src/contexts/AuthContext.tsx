
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserStatus {
  is_trial_active: boolean;
  is_premium: boolean;
  days_remaining: number;
  trial_end_date: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userStatus: UserStatus | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkUserStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('check_user_trial_status', {
        user_uuid: userId
      });

      if (error) {
        console.error('Erro ao verificar status:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return null;
    }
  };

  const handleUserStatusCheck = async (user: User | null) => {
    if (!user) {
      setUserStatus(null);
      return;
    }

    const status = await checkUserStatus(user.id);
    setUserStatus(status);
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await handleUserStatusCheck(session.user);
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
        await handleUserStatusCheck(session.user);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);


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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { error };
    }

    // Verificar status do usuário após login bem-sucedido
    if (data.user) {
      const status = await checkUserStatus(data.user.id);
      
      if (status && !status.is_premium && !status.is_trial_active) {
        // Usuário expirado, fazer logout imediatamente
        await supabase.auth.signOut();
        return { 
          error: { 
            message: "Sua conta expirou. Entre em contato com o administrador para renovar seu acesso.",
            name: "AccountExpiredError"
          } 
        };
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userStatus,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};
