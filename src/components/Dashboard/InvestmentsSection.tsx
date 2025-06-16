
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { InvestmentCard } from './InvestmentCard';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentTable } from './InvestmentTable';
import { InvestmentFilters } from './InvestmentFilters';
import { useInvestmentsData, Investment } from '@/hooks/useInvestmentsData';
import { Plus, TrendingUp, DollarSign, PieChart, Target, Wallet } from 'lucide-react';

export const InvestmentsSection: React.FC = () => {
  console.log('InvestmentsSection: component rendering');
  
  const {
    investments,
    institutions,
    types,
    loading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addInstitution,
    addType
  } = useInvestmentsData();

  console.log('InvestmentsSection: hook data', { 
    investmentsCount: investments.length, 
    institutionsCount: institutions.length, 
    typesCount: types.length, 
    loading 
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  // Filtrar investimentos baseado nos critérios de pesquisa
  const filteredInvestments = useMemo(() => {
    return investments.filter((investment) => {
      // Filtro por texto de pesquisa
      const searchMatch = !searchTerm || 
        investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investment.institution?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investment.type?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investment.investor_name && investment.investor_name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro por mês
      const monthMatch = selectedMonth === 'all' || 
        (investment.purchase_date && investment.purchase_date.substring(5, 7) === selectedMonth);

      // Filtro por ano
      const yearMatch = selectedYear === 'all' || 
        (investment.purchase_date && investment.purchase_date.substring(0, 4) === selectedYear);

      return searchMatch && monthMatch && yearMatch;
    });
  }, [investments, searchTerm, selectedMonth, selectedYear]);

  const handleAddInvestment = () => {
    console.log('InvestmentsSection: opening form for new investment');
    setEditingInvestment(null);
    setIsFormOpen(true);
  };

  const handleEditInvestment = (investment: Investment) => {
    console.log('InvestmentsSection: opening form for edit investment', investment.id);
    setEditingInvestment(investment);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    console.log('InvestmentsSection: form submit', data);
    try {
      if (editingInvestment) {
        await updateInvestment(editingInvestment.id, data);
      } else {
        await addInvestment(data);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('InvestmentsSection: form submit error', error);
    }
  };

  const calculateTotals = (investmentsList: Investment[]) => {
    const totalInvested = investmentsList.reduce((sum, inv) => sum + inv.invested_amount, 0);
    const totalCurrent = investmentsList.reduce((sum, inv) => sum + inv.current_value, 0);
    const totalReturn = totalCurrent - totalInvested;
    const averageYield = investmentsList.length > 0 
      ? investmentsList.reduce((sum, inv) => sum + (inv.yield_percentage || 0), 0) / investmentsList.length 
      : 0;

    console.log('InvestmentsSection: calculated totals', { totalInvested, totalCurrent, totalReturn, averageYield });
    
    return { totalInvested, totalCurrent, totalReturn, averageYield };
  };

  const { totalInvested, totalCurrent, totalReturn, averageYield } = calculateTotals(filteredInvestments);

  if (loading) {
    console.log('InvestmentsSection: showing loading state');
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Investimentos</h2>
        </div>
        <div className="text-center py-8 text-slate-500">Carregando investimentos...</div>
      </div>
    );
  }

  console.log('InvestmentsSection: rendering main content');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Investimentos</h2>
          <Button onClick={handleAddInvestment} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus size={20} />
            Novo Investimento
          </Button>
        </div>
      </div>

      <InvestmentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <InvestmentCard
          title="Saldo Total"
          value={`R$ ${totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={Wallet}
          bgColor="bg-gradient-to-r from-indigo-500 to-indigo-600"
        />
        
        <InvestmentCard
          title="Total Investido"
          value={`R$ ${totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        
        <InvestmentCard
          title="Retorno Total"
          value={`R$ ${totalReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={Target}
          trend={totalInvested > 0 ? `${((totalReturn / totalInvested) * 100).toFixed(2)}%` : '0%'}
          trendUp={totalReturn >= 0}
          bgColor={totalReturn >= 0 ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-red-500 to-red-600"}
        />
        
        <InvestmentCard
          title="Rentabilidade"
          value={averageYield.toFixed(2) + '%'}
          icon={TrendingUp}
          bgColor="bg-gradient-to-r from-amber-500 to-amber-600"
        />
        
        <InvestmentCard
          title="Carteira"
          value={filteredInvestments.length.toString()}
          icon={PieChart}
          bgColor="bg-gradient-to-r from-purple-500 to-purple-600"
        />
      </div>

      <InvestmentTable
        investments={filteredInvestments}
        onEdit={handleEditInvestment}
        onDelete={deleteInvestment}
      />

      <InvestmentForm
        isOpen={isFormOpen}
        onClose={() => {
          console.log('InvestmentsSection: closing form');
          setIsFormOpen(false);
        }}
        onSubmit={handleFormSubmit}
        onAddInstitution={addInstitution}
        onAddType={addType}
        investment={editingInvestment}
        institutions={institutions}
        types={types}
      />
    </div>
  );
};
