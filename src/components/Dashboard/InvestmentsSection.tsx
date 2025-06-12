
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InvestmentCard } from './InvestmentCard';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentTable } from './InvestmentTable';
import { useInvestmentsData, Investment } from '@/hooks/useInvestmentsData';
import { Plus, TrendingUp, DollarSign, PieChart, Target } from 'lucide-react';

export const InvestmentsSection: React.FC = () => {
  const {
    investments,
    institutions,
    types,
    loading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addInstitution
  } = useInvestmentsData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  const handleAddInvestment = () => {
    setEditingInvestment(null);
    setIsFormOpen(true);
  };

  const handleEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingInvestment) {
      await updateInvestment(editingInvestment.id, data);
    } else {
      await addInvestment(data);
    }
  };

  const calculateTotals = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.invested_amount, 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + inv.current_value, 0);
    const totalReturn = totalCurrent - totalInvested;
    const averageYield = investments.length > 0 
      ? investments.reduce((sum, inv) => sum + (inv.yield_percentage || 0), 0) / investments.length 
      : 0;

    return { totalInvested, totalCurrent, totalReturn, averageYield };
  };

  const { totalInvested, totalCurrent, totalReturn, averageYield } = calculateTotals();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Investimentos</h2>
        </div>
        <div className="text-center py-8 text-slate-500">Carregando investimentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Investimentos</h2>
        <Button onClick={handleAddInvestment} className="flex items-center gap-2">
          <Plus size={20} />
          Novo Investimento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InvestmentCard
          title="Total Investido"
          value={`R$ ${totalInvested.toFixed(2)}`}
          icon={DollarSign}
          bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        
        <InvestmentCard
          title="Valor Atual"
          value={`R$ ${totalCurrent.toFixed(2)}`}
          icon={TrendingUp}
          bgColor="bg-gradient-to-r from-green-500 to-green-600"
        />
        
        <InvestmentCard
          title="Retorno Total"
          value={`R$ ${totalReturn.toFixed(2)}`}
          icon={Target}
          trend={`${((totalReturn / totalInvested) * 100 || 0).toFixed(2)}%`}
          trendUp={totalReturn >= 0}
          bgColor={totalReturn >= 0 ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-red-500 to-red-600"}
        />
        
        <InvestmentCard
          title="Carteira"
          value={investments.length.toString()}
          icon={PieChart}
          bgColor="bg-gradient-to-r from-purple-500 to-purple-600"
        />
      </div>

      <InvestmentTable
        investments={investments}
        onEdit={handleEditInvestment}
        onDelete={deleteInvestment}
      />

      <InvestmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        onAddInstitution={addInstitution}
        investment={editingInvestment}
        institutions={institutions}
        types={types}
      />
    </div>
  );
};
