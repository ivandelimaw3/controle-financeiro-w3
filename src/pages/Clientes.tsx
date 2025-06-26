
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus, Users, Loader2 } from 'lucide-react';
import { ClientsTable } from '@/components/Clients/ClientsTable';
import { ClientModal } from '@/components/Clients/ClientModal';
import { useClientsData, Client } from '@/hooks/useClientsData';

const Clientes: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  
  const {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    isAddingClient,
    isUpdatingClient
  } = useClientsData();

  const handleOpenModal = (client?: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(undefined);
  };

  const handleSubmit = (data: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editingClient) {
      updateClient({ id: editingClient.id, ...data });
    } else {
      addClient(data);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient(id);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
              <p className="text-slate-600">Gerencie os clientes da assistência técnica</p>
            </div>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            <Plus size={20} className="mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total de Clientes</p>
                <p className="text-2xl font-bold text-slate-900">{clients.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {clients.length > 0 ? (
          <ClientsTable
            clients={clients}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
          />
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <Users size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum cliente cadastrado</h3>
            <p className="text-slate-600 mb-4">Comece adicionando seu primeiro cliente.</p>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              <Plus size={20} className="mr-2" />
              Adicionar Cliente
            </Button>
          </div>
        )}
      </div>

      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        client={editingClient}
        onSubmit={handleSubmit}
        isLoading={isAddingClient || isUpdatingClient}
      />
    </Layout>
  );
};

export default Clientes;
