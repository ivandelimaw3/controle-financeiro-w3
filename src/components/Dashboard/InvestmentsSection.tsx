
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InvestmentCard } from './InvestmentCard';
import { InvestmentFilters } from './InvestmentFilters';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentTable } from './InvestmentTable';
import { useInvestmentsData } from '@/hooks/useInvestmentsData';

export const InvestmentsSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const {
    investments,
    institutions,
    types,
    isLoading,
    error,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    isCreating,
    isUpdating
  } = useInvestmentsData();

  const handleCreateInvestment = (investmentData) => {
    createInvestment(investmentData);
    setShowForm(false);
  };

  const handleUpdateInvestment = (investmentData) => {
    if (editingInvestment) {
      updateInvestment({ id: editingInvestment.id, ...investmentData });
      setEditingInvestment(null);
      setShowForm(false);
    }
  };

  const handleDeleteInvestment = (id) => {
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
      deleteInvestment(id);
    }
  };

  const handleEditInvestment = (investment) => {
    setEditingInvestment(investment);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingInvestment(null);
  };

  // Filter and sort investments
  const filteredInvestments = investments
    .filter(inv => {
      const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inv.investor_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || 
                             inv.investment_types?.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'value':
          return b.current_value - a.current_value;
        case 'date':
          return new Date(b.purchase_date) - new Date(a.purchase_date);
        default:
          return 0;
      }
    });

  // Calculate totals
  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested_amount, 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
          <p className="mt-2 text-slate-600">Carregando investimentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar investimentos. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-start">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              <Plus size={20} className="mr-2" />
              Novo Investimento
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Investimentos</h1>
            <p className="text-slate-600">Gerencie sua carteira de investimentos</p>
          </div>
          
          <div className="flex-1"></div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InvestmentCard
          title="Total Investido"
          value={`R$ ${totalInvested.toFixed(2)}`}
          icon={TrendingUp}
          bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <InvestmentCard
          title="Valor Atual"
          value={`R$ ${totalCurrent.toFixed(2)}`}
          icon={TrendingUp}
          bgColor="bg-gradient-to-r from-green-500 to-green-600"
        />
        <InvestmentCard
          title="Ganho/Perda"
          value={`R$ ${totalGain.toFixed(2)}`}
          icon={TrendingUp}
          bgColor={totalGain >= 0 ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-red-500 to-red-600"}
        />
        <InvestmentCard
          title="Rentabilidade"
          value={`${gainPercentage.toFixed(2)}%`}
          icon={TrendingUp}
          bgColor={gainPercentage >= 0 ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-red-500 to-red-600"}
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <InvestmentFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          types={types}
        />

        <div className="mb-4">
          <p className="text-sm text-slate-600 text-center">
            {filteredInvestments.length} {filteredInvestments.length === 1 ? 'investimento encontrado' : 'investimentos encontrados'}
          </p>
        </div>

        <InvestmentTable
          investments={filteredInvestments}
          institutions={institutions}
          types={types}
          onEdit={handleEditInvestment}
          onDelete={handleDeleteInvestment}
        />
      </div>

      {/* Investment Form Dialog */}
      <Dialog open={showForm} onOpenChange={closeForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingInvestment ? 'Editar Investimento' : 'Novo Investimento'}
            </DialogTitle>
          </DialogHeader>
          <InvestmentForm
            investment={editingInvestment}
            institutions={institutions}
            types={types}
            onSubmit={editingInvestment ? handleUpdateInvestment : handleCreateInvestment}
            onCancel={closeForm}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
