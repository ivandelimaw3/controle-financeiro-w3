
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAdminControl } from '@/hooks/useAdminControl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Trash2, 
  Crown, 
  Calendar,
  Clock,
  Shield,
  AlertTriangle 
} from 'lucide-react';

const Admin = () => {
  const { users, loading, isAdmin, deleteUser, makeUserAdmin } = useAdminControl();
  const { toast } = useToast();
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando dados administrativos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-slate-600">
              Você não tem permissões de administrador para acessar esta página.
            </p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    setDeletingUserId(userId);
    const success = await deleteUser(userId);
    
    if (success) {
      toast({
        title: "Usuário deletado",
        description: `O usuário ${userEmail} foi removido com sucesso.`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o usuário.",
        variant: "destructive"
      });
    }
    
    setDeletingUserId(null);
  };

  const handleMakeAdmin = async (userId: string, userEmail: string) => {
    const success = await makeUserAdmin(userId);
    
    if (success) {
      toast({
        title: "Usuário promovido",
        description: `${userEmail} agora é administrador.`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível promover o usuário.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (user: any) => {
    if (user.is_premium) {
      return <Badge className="bg-amber-100 text-amber-800">Premium</Badge>;
    }
    if (user.is_trial_active) {
      return <Badge className="bg-blue-100 text-blue-800">Trial Ativo</Badge>;
    }
    return <Badge variant="destructive">Trial Expirado</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-800">Painel Administrativo</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-slate-800">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-amber-600" />
                <div>
                  <p className="text-sm text-slate-600">Usuários Premium</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {users.filter(u => u.is_premium).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-slate-600">Trials Ativos</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {users.filter(u => u.is_trial_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciamento de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dias Restantes</TableHead>
                    <TableHead>Data de Expiração</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          user.days_remaining <= 7 ? 'text-red-600' : 
                          user.days_remaining <= 14 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {user.days_remaining} dias
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(user.trial_end_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMakeAdmin(user.user_id, user.email)}
                          >
                            <Crown className="h-4 w-4 mr-1" />
                            Admin
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deletingUserId === user.user_id}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Deletar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja deletar o usuário <strong>{user.email}</strong>? 
                                  Esta ação não pode ser desfeita e todos os dados do usuário serão removidos permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.user_id, user.email)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Deletar Usuário
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;
