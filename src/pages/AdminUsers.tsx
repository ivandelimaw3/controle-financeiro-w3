
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminUsersTable } from '@/components/Admin/AdminUsersTable';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const AdminUsers = () => {
  const { users, loading, approveUser, rejectUser } = useAdminUsers();
  const { toast } = useToast();

  const handleApprove = async (userId: string): Promise<boolean> => {
    const success = await approveUser(userId);
    
    if (success) {
      toast({
        title: "Usuário aprovado",
        description: "O usuário foi promovido para premium com sucesso.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o usuário. Tente novamente.",
        variant: "destructive"
      });
    }

    return success;
  };

  const handleReject = async (userId: string): Promise<boolean> => {
    const success = await rejectUser(userId);
    
    if (success) {
      toast({
        title: "Solicitação rejeitada",
        description: "A solicitação de upgrade foi rejeitada.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    }

    return success;
  };

  const stats = {
    total: users.length,
    pending: users.filter(u => u.upgrade_status === 'pending').length,
    expired: users.filter(u => u.days_remaining <= 0 && !u.is_premium).length,
    needsAttention: users.filter(u => u.needs_attention).length
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-slate-600">Carregando usuários...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Administração de Usuários</h1>
          <p className="text-slate-600 mt-1">
            Gerencie solicitações de upgrade e usuários que precisam de atenção
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trials Expirados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Precisam Atenção</CardTitle>
              <CheckCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.needsAttention}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Usuários para Revisão</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminUsersTable 
              users={users}
              onApprove={handleApprove}
              onReject={handleReject}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminUsers;
