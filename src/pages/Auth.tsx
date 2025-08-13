
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus, AlertTriangle } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Recupera tentativas do localStorage
    const attempts = localStorage.getItem('loginAttempts');
    const lastAttempt = localStorage.getItem('lastLoginAttempt');
    
    if (attempts && lastAttempt) {
      const attemptsCount = parseInt(attempts);
      const lastAttemptTime = new Date(lastAttempt);
      const now = new Date();
      const timeDiff = now.getTime() - lastAttemptTime.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Reset tentativas após 1 hora
      if (hoursDiff >= 1) {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lastLoginAttempt');
        setLoginAttempts(0);
        setIsBlocked(false);
      } else if (attemptsCount >= 3) {
        setLoginAttempts(attemptsCount);
        setIsBlocked(true);
      } else {
        setLoginAttempts(attemptsCount);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      navigate('/forgot-password');
      return;
    }

    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        if (isLogin) {
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          localStorage.setItem('loginAttempts', newAttempts.toString());
          localStorage.setItem('lastLoginAttempt', new Date().toISOString());
          
          if (newAttempts >= 3) {
            setIsBlocked(true);
            toast({
              title: "Muitas tentativas",
              description: "Você será redirecionado para redefinir sua senha.",
              variant: "destructive"
            });
            setTimeout(() => {
              navigate('/forgot-password');
            }, 2000);
            return;
          } else {
            toast({
              title: "Erro",
              description: `${error.message}. Tentativa ${newAttempts} de 3.`,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Erro",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        // Reset tentativas em caso de sucesso
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lastLoginAttempt');
        setLoginAttempts(0);
        setIsBlocked(false);
        
        if (isLogin) {
          toast({
            title: "Sucesso",
            description: "Login realizado com sucesso!"
          });
          navigate('/');
        } else {
          toast({
            title: "Cadastro realizado",
            description: "Verifique seu email para confirmar a conta."
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetMode = () => {
    setIsLogin(!isLogin);
    // Reset tentativas ao mudar para cadastro
    if (!isLogin) {
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('lastLoginAttempt');
      setLoginAttempts(0);
      setIsBlocked(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Controle Financeiro W3
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Faça login em sua conta' : 'Crie sua nova conta'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isBlocked && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle size={16} />
                <span className="text-sm font-medium">Conta temporariamente bloqueada</span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                Muitas tentativas de login. Você será redirecionado para redefinir sua senha.
              </p>
            </div>
          )}
          
          {isLogin && loginAttempts > 0 && loginAttempts < 3 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertTriangle size={16} />
                <span className="text-sm">Tentativa {loginAttempts} de 3</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isBlocked}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isBlocked}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              disabled={loading || isBlocked}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isBlocked ? (
                    "Redirecionando..."
                  ) : isLogin ? (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Entrar
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Cadastrar
                    </>
                  )}
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center space-y-2">
            {isLogin && !isBlocked && (
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 underline block"
              >
                Esqueceu sua senha?
              </Link>
            )}
            
            <button
              type="button"
              onClick={resetMode}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
              disabled={isBlocked}
            >
              {isLogin 
                ? 'Não tem uma conta? Cadastre-se' 
                : 'Já tem uma conta? Faça login'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
