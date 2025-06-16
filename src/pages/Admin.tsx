
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAdminControl } from '@/hooks/useAdminControl';
import { usePremiumRequests } from '@/hooks/usePremiumRequests';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Trash2, 
  Crown, 
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import AdminManagement from '@/components/Admin/AdminManagement';
import PremiumRequestsManagement from '@/components/Admin/PremiumRequestsManagement';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const { users, admins, loading, isAdmin, deleteUser, makeUserAdmin, removeAdminRole, fetchAllUsers, fetchAllAdmins } = useAdminControl();
  const { requests, processRequest, fetchPendingRequests } = usePremiumRequests();
  const { toast } = useToast();
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Combinar dados de usuários com solicitações pendentes
  const usersWithRequests = users.map(user => {
    const pendingRequest = requests.find(req => req.user_id === user.user_id);
    return {
      ...user,
      hasPendingRequest: !!pendingRequest,
      requestId: pendingRequest?.id
    };
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    console.log('Atualizando lista de usuários manualmente...');
    await Promise.all([fetchAllUsers(), fetchAllAdmins(), fetchPendingRequests()]);
    setRefreshing(false);
    toast({
      title: "Lista atualizada",
      description: "A lista de usuários, administradores e solicitações foi recarregada.",
    });
  };

  const handleProcessUpgradeRequest = async (requestId: string, action: 'approved' | 'rejected', userEmail: string) => {
    setProcessingUserId(requestId);
    const success = await processRequest(requestId, action);
    
    if (success) {
      toast({
        title: action === 'approved' ? "Upgrade aprovado" : "Upgrade rejeitado",
        description: `O upgrade de ${userEmail} foi ${action === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso.`,
      });
      await Promise.all([fetchAllUsers(), fetchPendingRequests()]);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível processar a solicitação.",
        variant: "destructive"
      });
    }
    
    setProcessingUserId(null);
  };

  const handleAddAdmin = async (email: string): Promise<boolean> => {
    try {
      // Primeiro, buscar o usuário pelo email usando admin.listUsers()
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('Erro ao buscar usuários:', userError);
        return false;
      }

      const targetUser = userData.users.find(u => u.email === email);
      
      if (!targetUser) {
        toast({
          title: "Usuário não encontrado",
          description: "Não foi possível encontrar um usuário com este email.",
          variant: "destructive"
        });
        return false;
      }

      // Verificar se já é admin
      const { data: existingRole, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', targetUser.id)
        .eq('role', 'admin')
        .single();

      if (!roleError && existingRole) {
        toast({
          title: "Usuário já é admin",
          description: "Este usuário já possui privilégios de administrador.",
          variant: "destructive"
        });
        return false;
      }

      // Adicionar role de admin
      const success = await makeUserAdmin(targetUser.id);
      return success;
    } catch (error) {
      console.error('Erro ao adicionar admin:', error);
      return false;
    }
  };

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

  const handleRemoveAdmin = async (userId: string, userEmail: string): Promise<boolean> => {
    const success = await removeAdminRole(userId);
    return success;
  };

  const getStatusBadge = (user: any) => {
    if (user.hasPendingRequest) {
      return <Badge className="bg-orange-100 text-orange-800">Upgrade Pendente</Badge>;
    }
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">Painel Administrativo</h1>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar Lista
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
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

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-slate-600">Administradores</p>
                  <p className="text-2xl font-bold text-slate-800">{admins.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-slate-600">Upgrades Pendentes</p>
                  <p className="text-2xl font-bold text-slate-800">{requests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
              {requests.length > 0 && (
                <Badge className="ml-1 bg-orange-100 text-orange-800">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Administradores
            </TabsTrigger>
            <TabsTrigger value="premium-requests" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Solicitações Premium
              {requests.length > 0 && (
                <Badge className="ml-1 bg-orange-100 text-orange-800">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gerenciamento de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Nenhum usuário encontrado</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Verifique o console do navegador para mais detalhes
                    </p>
                  </div>
                ) : (
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
                        {usersWithRequests.map((user) => (
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
                                {user.hasPendingRequest ? (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleProcessUpgradeRequest(user.requestId!, 'approved', user.email)}
                                      disabled={processingUserId === user.requestId}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      Aprovar
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleProcessUpgradeRequest(user.requestId!, 'rejected', user.email)}
                                      disabled={processingUserId === user.requestId}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Rejeitar
                                    </Button>
                                  </div>
                                ) : !user.is_premium && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMakeAdmin(user.user_id, user.email)}
                                  >
                                    <Crown className="h-4 w-4 mr-1" />
                                    Admin
                                  </Button>
                                )}
                                
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="space-y-6">
            <AdminManagement
              admins={admins}
              onRemoveAdmin={handleRemoveAdmin}
              onAddAdmin={handleAddAdmin}
              refreshAdmins={fetchAllAdmins}
            />
          </TabsContent>

          <TabsContent value="premium-requests" className="space-y-6">
            <PremiumRequestsManagement
              requests={requests}
              onProcessRequest={processRequest}
              refreshRequests={fetchPendingRequests}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
