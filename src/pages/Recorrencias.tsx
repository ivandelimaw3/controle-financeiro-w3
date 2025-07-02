import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus, RotateCcw } from 'lucide-react';
import { RecorrenciaForm } from '@/components/Recorrencias/RecorrenciaForm';
import { RecorrenciasTable } from '@/components/Recorrencias/RecorrenciasTable';
import { useRecorrenciasData, Recorrencia } from '@/hooks/useRecorrenciasData';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function Recorrencias() {
  const { recorrencias, loading, createRecorrencia, updateRecorrencia, deleteRecorrencia } = useRecorrenciasData();
  const [showForm, setShowForm] = useState(false);
  const [editingRecorrencia, setEditingRecorrencia] = useState<Recorrencia | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async (data: Omit<Recorrencia, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const success = await createRecorrencia(data);
    if (success) {
      setShowForm(false);
    }
    return success;
  };

  const handleEdit = (recorrencia: Recorrencia) => {
    setEditingRecorrencia(recorrencia);
  };

  const handleUpdate = async (data: Omit<Recorrencia, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingRecorrencia) return false;
    
    const success = await updateRecorrencia(editingRecorrencia.id, data);
    if (success) {
      setEditingRecorrencia(null);
    }
    return success;
  };

  const handleDelete = async (id: string) => {
    const success = await deleteRecorrencia(id);
    if (success) {
      setDeleteId(null);
    }
  };

  const getSummary = () => {
    const totalReceitas = recorrencias
      .filter(r => r.tipo === 'receita')
      .reduce((sum, r) => sum + r.valor, 0);
    
    const totalDespesas = recorrencias
      .filter(r => r.tipo === 'despesa')
      .reduce((sum, r) => sum + r.valor, 0);

    return { totalReceitas, totalDespesas, saldo: totalReceitas - totalDespesas };
  };

  const summary = getSummary();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <RotateCcw className="text-blue-600" size={32} />
              Recorrências
            </h1>
            <p className="text-slate-600 mt-2">Gerencie suas receitas e despesas recorrentes</p>
          </div>
          
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                <Plus size={20} className="mr-2" />
                Nova Recorrência
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <RecorrenciaForm
                onSubmit={handleCreate}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Receitas Mensais</h3>
            <p className="text-2xl font-bold text-green-600">R$ {summary.totalReceitas.toFixed(2)}</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Despesas Mensais</h3>
            <p className="text-2xl font-bold text-red-600">R$ {summary.totalDespesas.toFixed(2)}</p>
          </div>
          
          <div className={`border rounded-xl p-6 ${summary.saldo >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${summary.saldo >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
              Saldo Previsto
            </h3>
            <p className={`text-2xl font-bold ${summary.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              R$ {summary.saldo.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <RecorrenciasTable
            recorrencias={recorrencias}
            onEdit={handleEdit}
            onDelete={setDeleteId}
          />
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingRecorrencia} onOpenChange={() => setEditingRecorrencia(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {editingRecorrencia && (
              <RecorrenciaForm
                onSubmit={handleUpdate}
                onCancel={() => setEditingRecorrencia(null)}
                initialData={editingRecorrencia}
                isEditing
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta recorrência? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}