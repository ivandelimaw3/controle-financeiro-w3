import React, { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Trash2, 
  Plus,
  Crown,
  Calendar 
} from 'lucide-react';
import { AdminData } from '@/hooks/useAdminControl';

interface AdminManagementProps {
  admins: AdminData[];
  onRemoveAdmin: (userId: string, userEmail: string) => Promise<boolean>;
  onAddAdmin: (email: string) => Promise<boolean>;
  refreshAdmins: () => Promise<void>;
}

const AdminManagement: React.FC<AdminManagementProps> = ({
  admins,
  onRemoveAdmin,
  onAddAdmin,
  refreshAdmins
}) => {
  const { toast } = useToast();
  const [removingAdminId, setRemovingAdminId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  const handleRemoveAdmin = async (userId: string, email: string) => {
    setRemovingAdminId(userId);
    const success = await onRemoveAdmin(userId, email);
    
    if (success) {
      toast({
        title: "Administrador removido",
        description: `${email} não é mais administrador.`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível remover o administrador.",
        variant: "destructive"
      });
    }
    
    setRemovingAdminId(null);
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return;
    }

    setIsAddingAdmin(true);
    const success = await onAddAdmin(newAdminEmail.trim());
    
    if (success) {
      toast({
        title: "Administrador adicionado",
        description: `${newAdminEmail} agora é administrador.`,
      });
      setNewAdminEmail('');
      setIsAddDialogOpen(false);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o administrador. Verifique se o email está correto.",
        variant: "destructive"
      });
    }
    
    setIsAddingAdmin(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciamento de Administradores
          </CardTitle>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Administrador</DialogTitle>
                <DialogDescription>
                  Digite o email do usuário que deseja promover a administrador.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email do usuário</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddAdmin();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isAddingAdmin}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddAdmin}
                  disabled={isAddingAdmin}
                >
                  {isAddingAdmin ? 'Adicionando...' : 'Adicionar Admin'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {admins.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Nenhum administrador encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Data de Promoção</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.user_id}>
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                        <Crown className="h-3 w-3" />
                        Administrador
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        {formatDate(admin.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={removingAdminId === admin.user_id}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover <strong>{admin.email}</strong> do cargo de administrador? 
                              Esta ação irá revogar todas as permissões administrativas deste usuário.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveAdmin(admin.user_id, admin.email)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remover Admin
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminManagement;
