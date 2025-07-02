import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard, Trash2, Edit } from 'lucide-react';
import { PaymentMethodForm } from '@/components/PaymentMethods/PaymentMethodForm';
import { usePaymentMethodsData, PaymentMethod } from '@/hooks/usePaymentMethodsData';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PAYMENT_TYPE_LABELS = {
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  pix: 'PIX',
  transferencia: 'Transferência',
  dinheiro: 'Dinheiro',
  boleto: 'Boleto',
};

export default function MetodosPagamento() {
  const { paymentMethods, loading, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } = usePaymentMethodsData();
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async (data: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const success = await createPaymentMethod(data);
    if (success) {
      setShowForm(false);
    }
    return success;
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
  };

  const handleUpdate = async (data: Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingMethod) return false;
    
    const success = await updatePaymentMethod(editingMethod.id, data);
    if (success) {
      setEditingMethod(null);
    }
    return success;
  };

  const handleDelete = async (id: string) => {
    const success = await deletePaymentMethod(id);
    if (success) {
      setDeleteId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <CreditCard className="text-blue-600" size={32} />
              Métodos de Pagamento
            </h1>
            <p className="text-slate-600 mt-2">Gerencie seus métodos de pagamento</p>
          </div>
          
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                <Plus size={20} className="mr-2" />
                Novo Método
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <PaymentMethodForm
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Payment Methods Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">{method.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(method)}
                    >
                      <Edit size={16} />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este método de pagamento? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(method.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    {PAYMENT_TYPE_LABELS[method.type]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingMethod} onOpenChange={() => setEditingMethod(null)}>
          <DialogContent className="max-w-2xl">
            {editingMethod && (
              <PaymentMethodForm
                onSubmit={handleUpdate}
                onCancel={() => setEditingMethod(null)}
                initialData={editingMethod}
                isEditing
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}