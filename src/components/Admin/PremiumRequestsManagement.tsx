
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Crown, 
  Check, 
  X,
  Clock,
  Calendar 
} from 'lucide-react';
import { PremiumUpgradeRequest } from '@/hooks/usePremiumRequests';

interface PremiumRequestsManagementProps {
  requests: PremiumUpgradeRequest[];
  onProcessRequest: (requestId: string, status: 'approved' | 'rejected', notes?: string) => Promise<boolean>;
  refreshRequests: () => Promise<void>;
}

const PremiumRequestsManagement: React.FC<PremiumRequestsManagementProps> = ({
  requests,
  onProcessRequest,
  refreshRequests
}) => {
  const { toast } = useToast();
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PremiumUpgradeRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');

  const handleProcessRequest = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    setProcessingRequestId(requestId);
    const success = await onProcessRequest(requestId, status, notes);
    
    if (success) {
      toast({
        title: status === 'approved' ? "Solicitação aprovada" : "Solicitação rejeitada",
        description: `A solicitação foi ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso.`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível processar a solicitação.",
        variant: "destructive"
      });
    }
    
    setProcessingRequestId(null);
  };

  const openNotesDialog = (request: PremiumUpgradeRequest, action: 'approved' | 'rejected') => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNotes('');
    setIsNotesDialogOpen(true);
  };

  const handleNotesSubmit = async () => {
    if (!selectedRequest) return;

    await handleProcessRequest(selectedRequest.id, actionType, adminNotes.trim() || undefined);
    setIsNotesDialogOpen(false);
    setSelectedRequest(null);
    setAdminNotes('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Solicitações de Upgrade Premium
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Nenhuma solicitação pendente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email do Usuário</TableHead>
                    <TableHead>Data da Solicitação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.user_email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          {formatDate(request.requested_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
                          <Clock className="h-3 w-3" />
                          Pendente
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => openNotesDialog(request, 'approved')}
                            disabled={processingRequestId === request.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openNotesDialog(request, 'rejected')}
                            disabled={processingRequestId === request.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
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

      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approved' ? 'Aprovar' : 'Rejeitar'} Solicitação
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approved' 
                ? `Confirmar aprovação da solicitação de ${selectedRequest?.user_email}?`
                : `Confirmar rejeição da solicitação de ${selectedRequest?.user_email}?`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações sobre esta decisão..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNotesDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleNotesSubmit}
              className={actionType === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionType === 'approved' ? 'Aprovar' : 'Rejeitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PremiumRequestsManagement;
