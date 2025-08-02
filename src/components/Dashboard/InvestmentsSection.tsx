import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign, Calendar, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvestmentCard } from './InvestmentCard';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentFilters from './InvestmentFilters';
import { useInvestmentsData, Investment } from '@/hooks/useInvestmentsData';

export const InvestmentsSection = () => {
  const {
    investments,
    institutions,
    investmentTypes,
    loading,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    addInstitution,
    addInvestmentType
  } = useInvestmentsData();

  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | undefined>();
  const [filters, setFilters] = useState({
    institution: '',
    type: '',
    dateRange: 'all'
  });

  const filteredInvestments = investments.filter(investment => {
    const institutionFilter = filters.institution ? investment.institution === filters.institution : true;
    const typeFilter = filters.type ? investment.type === filters.type : true;

    let dateFilter = true;
    if (filters.dateRange !== 'all') {
      const today = new Date();
      const investmentDate = new Date(investment.startDate);

      if (filters.dateRange === 'today') {
        dateFilter = investmentDate.toDateString() === today.toDateString();
      } else if (filters.dateRange === 'thisWeek') {
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        dateFilter = investmentDate >= startOfWeek && investmentDate <= today;
      } else if (filters.dateRange === 'thisMonth') {
        dateFilter = investmentDate.getMonth() === today.getMonth() && investmentDate.getFullYear() === today.getFullYear();
      }
    }

    return institutionFilter && typeFilter && dateFilter;
  });

  const totalInvested = investments.reduce((sum, investment) => sum + investment.amount, 0);
  const averageReturn = investments.length > 0 ? investments.reduce((sum, investment) => sum + investment.returnRate, 0) / investments.length : 0;

  const handleCreate = async (investmentData: Omit<Investment, 'id'>) => {
    await createInvestment(investmentData);
    setShowForm(false);
  };

  const handleUpdate = async (investmentData: Investment) => {
    await updateInvestment(investmentData);
    setShowForm(false);
    setEditingInvestment(undefined);
  };

  const handleDelete = async (id: number) => {
    await deleteInvestment(id);
  };

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInvestment(undefined);
  };

  const handleAddInstitution = async (name: string) => {
    await addInstitution(name);
  };

  const handleAddType = async (name: string) => {
    await addInvestmentType(name);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Investimentos</h2>
            <p className="text-gray-600">Gerencie seus investimentos e acompanhe a rentabilidade</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Investimento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Investido</p>
              <p className="text-2xl font-bold text-gray-900">${totalInvested.toFixed(2)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Retorno Médio</p>
              <p className="text-2xl font-bold text-gray-900">{averageReturn.toFixed(2)}%</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximo Vencimento</p>
              <p className="text-2xl font-bold text-gray-900">Em breve</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <InvestmentFilters
        institutions={institutions}
        investmentTypes={investmentTypes}
        filters={filters}
        setFilters={setFilters}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvestments.map((investment) => (
          <InvestmentCard
            key={investment.id}
            investment={investment}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {showForm && (
        <InvestmentForm
          onSubmit={editingInvestment ? handleUpdate : handleCreate}
          onCancel={handleCancel}
          onAddInstitution={handleAddInstitution}
          onAddType={handleAddType}
          investment={editingInvestment}
          institutions={institutions}
          investmentTypes={investmentTypes}
          isLoading={loading}
        />
      )}
    </div>
  );
};
