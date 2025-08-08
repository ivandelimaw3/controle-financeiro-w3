
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CreditCard, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreditCards, CreditCardInput } from '@/hooks/useCreditCards';
import { CreditCardItem } from '@/components/CreditCards/CreditCardItem';
import { CreditCardFormModal } from '@/components/CreditCards/CreditCardFormModal';
import { useAuth } from '@/contexts/AuthContext';

const CartoesNovo: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { cards, loading, addCard, updateCard, deleteCard } = useCreditCards();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [showCardNumbers, setShowCardNumbers] = useState(false);

  // Se ainda está carregando a autenticação, mostrar loading
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-slate-600">Carregando...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Se não há usuário, mostrar erro
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-red-600">Erro: Usuário não autenticado</p>
            <p className="text-sm text-slate-500 mt-2">Faça login novamente</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (data: CreditCardInput) => {
    try {
      if (editingCard) {
        await updateCard({ ...editingCard, ...data });
        toast.success('Cartão atualizado com sucesso!');
      } else {
        await addCard(data);
        toast.success('Cartão cadastrado com sucesso!');
      }
      
      setIsModalOpen(false);
      setEditingCard(null);
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
      toast.error('Erro ao salvar cartão');
    }
  };

  const handleEdit = (card: any) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCard(id);
      toast.success('Cartão excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      toast.error('Erro ao excluir cartão');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCard(null);
  };

  const toggleCardNumbers = () => {
    setShowCardNumbers(!showCardNumbers);
  };

  // Se ainda está carregando os cartões
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-slate-600">Carregando cartões...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Cartões de Crédito</h1>
            <p className="text-slate-600">Gerencie seus cartões de crédito</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={toggleCardNumbers}
              variant="outline"
              className="flex items-center gap-2"
            >
              {showCardNumbers ? <EyeOff size={16} /> : <Eye size={16} />}
              {showCardNumbers ? 'Ocultar' : 'Mostrar'} números
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 flex items-center gap-2"
            >
              <Plus size={16} />
              Novo Cartão
            </Button>
          </div>
        </div>

        {/* Cards Grid */}
        {cards.length === 0 ? (
          <Card className="p-8 text-center">
            <CardHeader>
              <CreditCard className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <CardTitle className="text-slate-600">Nenhum cartão cadastrado</CardTitle>
              <CardDescription>
                Adicione seu primeiro cartão de crédito para começar a controlar seus gastos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                <Plus size={16} className="mr-2" />
                Cadastrar Primeiro Cartão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <CreditCardItem
                key={card.id}
                card={card}
                showCardNumber={showCardNumbers}
                onEdit={() => handleEdit(card)}
                onDelete={() => handleDelete(card.id)}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
              </DialogTitle>
              <DialogDescription>
                {editingCard 
                  ? 'Atualize as informações do seu cartão de crédito'
                  : 'Cadastre um novo cartão de crédito'
                }
              </DialogDescription>
            </DialogHeader>
            
            <CreditCardFormModal
              card={editingCard}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              isLoading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CartoesNovo;
