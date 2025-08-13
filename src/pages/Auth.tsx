
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const getCustomErrorMessage = (error: any) => {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid credentials')) {
      return 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
    }
    
    if (errorMessage.includes('email not confirmed')) {
      return 'Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.';
    }
    
    if (errorMessage.includes('user already registered') || errorMessage.includes('already registered')) {
      return 'Este email já está cadastrado. Tente fazer login ou use a opção "Esqueci minha senha".';
    }
    
    if (errorMessage.includes('password') && errorMessage.includes('weak')) {
      return 'Senha muito fraca. Use pelo menos 6 caracteres com letras e números.';
    }
    
    if (errorMessage.includes('invalid email')) {
      return 'Email inválido. Verifique o formato do email e tente novamente.';
    }
    
    if (errorMessage.includes('signup disabled')) {
      return 'Cadastro temporariamente desabilitado. Tente novamente mais tarde.';
    }
    
    if (errorMessage.includes('too many requests')) {
      return 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
    }

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    // Mensagem genérica para outros erros
    return error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);

        if (error) {
          toast({
            title: "Erro no Login",
            description: getCustomErrorMessage(error),
            variant: "destructive"
          });
        } else {
          toast({
            title: "Login realizado com sucesso! 🎉",
            description: `Bem-vindo de volta! Redirecionando para o dashboard...`
          });
          // Pequeno delay para mostrar a mensagem de sucesso
          setTimeout(() => navigate('/'), 1000);
        }
      } else {
        const { error } = await signUp(email, password);

        if (error) {
          toast({
            title: "Erro no Cadastro",
            description: getCustomErrorMessage(error),
            variant: "destructive"
          });
        } else {
          toast({
            title: "Cadastro realizado com sucesso! 📧",
            description: "Enviamos um email de confirmação. Verifique sua caixa de entrada e clique no link para ativar sua conta."
          });
          // Limpar formulário após cadastro bem-sucedido
          setEmail('');
          setPassword('');
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro Inesperado",
        description: "Algo deu errado. Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
            {isLogin ? 'Acesse sua conta para continuar' : 'Crie sua conta e comece a organizar suas finanças'}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isLogin ? 'Entrando...' : 'Cadastrando...'}
                </>
              ) : (
                <>
                  {isLogin ? (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Entrar
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Criar Conta
                    </>
                  )}
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
              disabled={loading}
            >
              {isLogin 
                ? 'Não tem uma conta? Criar conta gratuita' 
                : 'Já tem uma conta? Fazer login'
              }
            </button>
          </div>

          {isLogin && (
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  toast({
                    title: "Recuperação de Senha",
                    description: "Digite seu email acima e clique em 'Esqueci minha senha' para receber as instruções."
                  });
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
                disabled={loading}
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
