
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';
import { AdminUserData } from '@/hooks/useAdminUsers';

interface AdminUsersTableProps {
  users: AdminUserData[];
  onApprove: (userId: string) => Promise<boolean>;
  onReject: (userId: string) => Promise<boolean>;
  loading?: boolean;
}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  users,
  onApprove,
  onReject,
  loading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (user: AdminUserData) => {
    if (user.is_premium) {
      return <Badge className="bg-green-100 text-green-800">Premium</Badge>;
    }
    
    if (user.upgrade_status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    }
    
    if (user.upgrade_status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
    }
    
    if (user.days_remaining <= 0) {
      return <Badge className="bg-red-100 text-red-800">Expirado</Badge>;
    }
    
    return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
  };

  const getNeedsAttentionIcon = (user: AdminUserData) => {
    if (user.needs_attention) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    return null;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Dias Restantes</TableHead>
            <TableHead>Solicitação</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                Nenhum usuário necessita revisão no momento
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getNeedsAttentionIcon(user)}
                    {getStatusBadge(user)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell>
                  {user.is_premium ? (
                    <span className="text-green-600">∞ (Premium)</span>
                  ) : user.days_remaining > 0 ? (
                    <span className={user.days_remaining <= 7 ? 'text-orange-600' : 'text-blue-600'}>
                      {user.days_remaining} dias
                    </span>
                  ) : (
                    <span className="text-red-600">Expirado</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.upgrade_request_date ? (
                    <div className="text-sm">
                      <div>{formatDate(user.upgrade_request_date)}</div>
                      <div className="text-gray-500 capitalize">{user.upgrade_status}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Nenhuma</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {user.upgrade_status === 'pending' || user.days_remaining <= 0 ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => onApprove(user.user_id)}
                          disabled={loading}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        {user.upgrade_status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => onReject(user.user_id)}
                            disabled={loading}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm">Nenhuma ação necessária</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
