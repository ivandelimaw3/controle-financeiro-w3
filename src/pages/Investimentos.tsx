import React, { useState } from 'react';
import { Plus, TrendingUp, AlertCircle, Search, Edit, Trash2, DollarSign, CheckCircle, Building2, Archive } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { InvestmentForm } from '@/components/Dashboard/InvestmentForm';
import { useInvestmentsData, Investment, InvestmentInstitution, InvestmentType } from '@/hooks/useInvestmentsData';
import { useToast } from '@/hooks/use-toast';

const Investimentos = () => {
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { toast } = useToast();

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

  // Funções de formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      'renda_fixa': 'Renda Fixa',
      'renda_variavel': 'Renda Variável',
      'fundos': 'Fundos'
    };
    return categories[category] || category;
  };

  const getStatusLabel = (invested: number, current: number) => {
    return current >= invested ? 'Lucrativo' : 'Prejuízo';
  };

  const getStatusColor = (invested: number, current: number) => {
    return current >= invested ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Cálculos para os cards de resumo
  const totalInvestments = investments.length;
  const profitableInvestments = investments.filter(inv => 
    Number(inv.current_value) >= Number(inv.invested_amount)
  ).length;
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.invested_amount), 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + Number(inv.current_value), 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  // Contar aplicações vencidas
  const expiredInvestments = investments.filter(inv => 
    inv.maturity_date && new Date(inv.maturity_date) <= new Date()
  );

  // Filtros
  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.investor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.institution?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'profitable' && Number(investment.current_value) >= Number(investment.invested_amount)) ||
                         (statusFilter === 'loss' && Number(investment.current_value) < Number(investment.invested_amount));
    
    const matchesCategory = categoryFilter === 'all' || investment.type?.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreateInvestment = async (investmentData: any) => {
    await addInvestment(investmentData);
    setShowInvestmentForm(false);
    toast({
      title: "Investimento criado com sucesso!",
      duration: 2000,
    });
  };

  const handleUpdateInvestment = async (investmentData: any) => {
    if (editingInvestment) {
      await updateInvestment({ ...investmentData, id: editingInvestment.id });
      setEditingInvestment(undefined);
      setShowInvestmentForm(false);
      toast({
        title: "Investimento atualizado com sucesso!",
        duration: 2000,
      });
    }
  };

  const handleDeleteInvestment = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
      await deleteInvestment(id);
      toast({
        title: "Investimento excluído com sucesso!",
        duration: 2000,
      });
    }
  };

  const handleEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowInvestmentForm(true);
  };

  const handleMoveExpiredInvestments = async () => {
    if (confirm('Tem certeza que deseja remover todas as aplicações vencidas? Esta ação não pode ser desfeita.')) {
      await moveExpiredInvestments();
    }
  };

  const closeInvestmentForm = () => {
    setShowInvestmentForm(false);
    setEditingInvestment(undefined);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Carregando investimentos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Gestão de Investimentos</h1>
              <p className="text-slate-600 mt-1">
                Gerencie sua carteira de investimentos e acompanhe a performance
              </p>
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
                onClick={() => setShowInvestmentForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Investimento
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Investido</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalInvested)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Valor Atual</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalCurrent)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Investimentos</p>
                <p className="text-2xl font-bold text-slate-800">{totalInvestments}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Rentabilidade</p>
                <p className={`text-2xl font-bold ${gainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gainPercentage.toFixed(2)}%
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar investimentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="profitable">Lucrativos</SelectItem>
                <SelectItem value="loss">Com Prejuízo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas as Categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="renda_fixa">Renda Fixa</SelectItem>
                <SelectItem value="renda_variavel">Renda Variável</SelectItem>
                <SelectItem value="fundos">Fundos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela de Investimentos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Investimento</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Instituição</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Tipo</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Investido</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Valor Atual</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Rendimento</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Compra</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvestments.map((investment, index) => {
                  const investedAmount = Number(investment.invested_amount);
                  const currentValue = Number(investment.current_value);
                  const gain = currentValue - investedAmount;
                  const gainPercentage = investedAmount > 0 ? (gain / investedAmount) * 100 : 0;
                  
                  return (
                    <tr key={investment.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{investment.name}</p>
                            <p className="text-sm text-slate-500">{investment.investor_name || 'Sem investidor'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{investment.institution?.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {investment.type?.name}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">
                          {getCategoryLabel(investment.type?.category || '')}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(investedAmount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(currentValue)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className={`font-semibold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(Math.abs(gain))}
                          </span>
                          <span className={`text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {gainPercentage.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${gain >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`text-sm ${getStatusColor(investedAmount, currentValue)}`}>
                            {getStatusLabel(investedAmount, currentValue)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {formatDate(investment.purchase_date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditInvestment(investment)}
                            className="text-slate-600 hover:text-slate-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInvestment(investment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredInvestments.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-600 mb-2">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                  ? 'Nenhum investimento encontrado' 
                  : 'Nenhum investimento cadastrado'}
              </p>
              <p className="text-slate-500 mb-4">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Adicione seu primeiro investimento para começar.'}
              </p>
              {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
                <Button
                  onClick={() => setShowInvestmentForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Investimento
                </Button>
              )}
            </div>
          )}
        </div>

        {showInvestmentForm && (
          <InvestmentForm
            onClose={closeInvestmentForm}
            onSubmit={editingInvestment ? handleUpdateInvestment : handleCreateInvestment}
            onAddInstitution={addInstitution}
            onAddType={addInvestmentType}
            investment={editingInvestment}
            institutions={institutions}
            investmentTypes={investmentTypes}
          />
        )}
      </div>
    </Layout>
  );
};

export default Investimentos;
