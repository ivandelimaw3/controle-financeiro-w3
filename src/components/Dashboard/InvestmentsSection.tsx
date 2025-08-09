
import React, { useState } from 'react';
import { Plus, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvestmentCard } from './InvestmentCard';
import { InvestmentTable } from './InvestmentTable';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentFilters } from './InvestmentFilters';
import { useInvestmentsData } from '@/hooks/useInvestmentsData';

export const InvestmentsSection = () => {
  const {
    investments,
    institutions,
    investmentTypes,
    loading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addInstitution,
    addInvestmentType,
    moveExpiredInvestments
  } = useInvestmentsData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [filters, setFilters] = useState({
    institution: '',
    type: '',
    dateRange: { from: null, to: null }
  });

  const handleSubmit = async (investmentData: any) => {
    try {
      if (editingInvestment) {
        await updateInvestment({ ...investmentData, id: editingInvestment.id });
      } else {
        await addInvestment(investmentData);
      }
      setIsFormOpen(false);
      setEditingInvestment(null);
    } catch (error) {
      console.error('Erro ao salvar investimento:', error);
    }
  };

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este investimento?')) {
      await deleteInvestment(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingInvestment(null);
  };

  const handleMoveExpiredInvestments = async () => {
    if (window.confirm('Tem certeza que deseja remover todas as aplicações vencidas? Esta ação não pode ser desfeita.')) {
      await moveExpiredInvestments();
    }
  };

  const filteredInvestments = investments.filter(investment => {
    const institutionMatch = !filters.institution || investment.institution_id?.toString() === filters.institution;
    const typeMatch = !filters.type || investment.type_id?.toString() === filters.type;
    
    let dateMatch = true;
    if (filters.dateRange.from || filters.dateRange.to) {
      const investmentDate = new Date(investment.purchase_date);
      if (filters.dateRange.from) {
        dateMatch = dateMatch && investmentDate >= new Date(filters.dateRange.from);
      }
      if (filters.dateRange.to) {
        dateMatch = dateMatch && investmentDate <= new Date(filters.dateRange.to);
      }
    }
    
    return institutionMatch && typeMatch && dateMatch;
  });

  const totalInvested = filteredInvestments.reduce((sum, inv) => sum + parseFloat(inv.invested_amount.toString()), 0);
  const totalCurrent = filteredInvestments.reduce((sum, inv) => sum + parseFloat(inv.current_value.toString()), 0);
  const totalReturn = totalCurrent - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  // Contar aplicações vencidas
  const expiredInvestments = investments.filter(inv => 
    inv.maturity_date && new Date(inv.maturity_date) <= new Date()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-slate-600">Carregando investimentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Investimentos</h2>
          <p className="text-slate-600 mt-1">Gerencie seus investimentos e acompanhe o desempenho</p>
        </div>
        <div className="flex gap-2">
          {expiredInvestments.length > 0 && (
            <Button 
              onClick={handleMoveExpiredInvestments}
              variant="outline"
              className="border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <Archive size={20} className="mr-2" />
              Remover Aplicações Vencidas ({expiredInvestments.length})
            </Button>
          )}
          <Button 
            onClick={() => setIsFormOpen(true)} 
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            <Plus size={20} className="mr-2" />
            Novo Investimento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InvestmentCard
          title="Total Investido"
          value={totalInvested}
          type="invested"
        />
        <InvestmentCard
          title="Valor Atual"
          value={totalCurrent}
          type="current"
        />
        <InvestmentCard
          title="Rendimento"
          value={totalReturn}
          type={totalReturn >= 0 ? 'gain' : 'loss'}
        />
        <InvestmentCard
          title="Rentabilidade"
          value={returnPercentage}
          type={returnPercentage >= 0 ? 'gain' : 'loss'}
          isPercentage
        />
      </div>

      <InvestmentFilters
        institutions={institutions}
        investmentTypes={investmentTypes}
        onFiltersChange={setFilters}
      />

      <InvestmentTable
        investments={filteredInvestments}
        institutions={institutions}
        investmentTypes={investmentTypes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <InvestmentForm
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        onAddInstitution={addInstitution}
        onAddType={addInvestmentType}
        investment={editingInvestment}
        institutions={institutions}
        investmentTypes={investmentTypes}
      />
    </div>
  );
};
