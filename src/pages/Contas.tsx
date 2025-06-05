
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { AccountsTable } from '@/components/Accounts/AccountsTable';
import { AccountModal } from '@/components/Accounts/AccountModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Account {
  id: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
}

const Contas: React.FC = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');

  // Dados simulados
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: 1,
      description: 'Aluguel',
      amount: -1200,
      category: 'Moradia',
      dueDate: '2024-12-10',
      type: 'despesa',
      status: 'pago'
    },
    {
      id: 2,
      description: 'Salário',
      amount: 5000,
      category: 'Trabalho',
      dueDate: '2024-12-15',
      type: 'receita',
      status: 'recebido'
    },
    {
      id: 3,
      description: 'Conta de Luz',
      amount: -150,
      category: 'Utilidades',
      dueDate: '2024-12-20',
      type: 'despesa',
      status: 'pendente'
    },
    {
      id: 4,
      description: 'Freelance',
      amount: 800,
      category: 'Trabalho',
      dueDate: '2024-12-18',
      type: 'receita',
      status: 'pendente'
    }
  ]);

  const categories = ['Trabalho', 'Moradia', 'Utilidades', 'Alimentação', 'Transporte', 'Lazer'];

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || account.status === statusFilter;
    const matchesType = typeFilter === 'todos' || account.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSave = (accountData: Account) => {
    if (editingAccount) {
      setAccounts(prev => prev.map(acc => 
        acc.id === editingAccount.id 
          ? { ...accountData, id: editingAccount.id }
          : acc
      ));
      toast({
        title: "Conta atualizada",
        description: "A conta foi atualizada com sucesso.",
      });
    } else {
      const newAccount = {
        ...accountData,
        id: Math.max(...accounts.map(a => a.id)) + 1
      };
      setAccounts(prev => [...prev, newAccount]);
      toast({
        title: "Conta criada",
        description: "Nova conta adicionada com sucesso.",
      });
    }
    setEditingAccount(undefined);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
    toast({
      title: "Conta excluída",
      description: "A conta foi removida com sucesso.",
    });
  };

  const handleStatusChange = (id: number, status: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id 
        ? { ...acc, status: status as 'pendente' | 'pago' | 'recebido' }
        : acc
    ));
    toast({
      title: "Status atualizado",
      description: `Status da conta alterado para ${status}.`,
    });
  };

  const handleNewAccount = () => {
    setEditingAccount(undefined);
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Contas</h1>
            <p className="text-slate-600">Gerencie suas contas a pagar e receber</p>
          </div>
          <Button
            onClick={handleNewAccount}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            <Plus size={20} className="mr-2" />
            Nova Conta
          </Button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Pesquisar contas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AccountsTable
            accounts={filteredAccounts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </div>

        <AccountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          account={editingAccount}
          categories={categories}
        />
      </div>
    </Layout>
  );
};

export default Contas;
