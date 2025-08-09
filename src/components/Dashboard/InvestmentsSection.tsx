
import React, { useState } from 'react';
import { Plus, TrendingUp, AlertTriangle, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentTable } from './InvestmentTable';
import { useInvestmentsData, Investment } from '@/hooks/useInvestmentsData';
import { Badge } from '@/components/ui/badge';

export const InvestmentsSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | undefined>();
  
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

  const handleSubmit = async (investmentData: any) => {
    if (editingInvestment) {
      await updateInvestment({ ...investmentData, id: editingInvestment.id });
    } else {
      await addInvestment(investmentData);
    }
    setShowForm(false);
    setEditingInvestment(undefined);
  };

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowForm(true);
  };

  const handleRemoveExpired = async () => {
    const count = await moveExpiredInvestments();
    console.log(`${count} investimentos vencidos foram removidos`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Carregando investimentos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary data
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.invested_amount), 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + Number(inv.current_value), 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  // Check for expired investments
  const expiredInvestments = investments.filter(inv => 
    inv.maturity_date && new Date(inv.maturity_date) <= new Date()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle>Investimentos</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie sua carteira de investimentos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expiredInvestments.length > 0 && (
              <Button
                onClick={handleRemoveExpired}
                variant="outline"
                size="sm"
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <Archive className="h-4 w-4 mr-2" />
                Remover Vencidas ({expiredInvestments.length})
              </Button>
            )}
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Investimento
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Investido</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(totalInvested)}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Valor Atual</p>
                <p className="text-xl font-bold text-slate-800">{formatCurrency(totalCurrent)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Rendimento</p>
                <p className={`text-xl font-bold ${gainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gainPercentage.toFixed(2)}%
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Aplicações</p>
                <p className="text-xl font-bold text-slate-800">{investments.length}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Expired Investments Alert */}
        {expiredInvestments.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900">
                  Aplicações Vencidas ({expiredInvestments.length})
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  As seguintes aplicações atingiram o vencimento e podem ser removidas da carteira ativa:
                </p>
                <div className="mt-3 space-y-2">
                  {expiredInvestments.map((inv) => (
                    <div key={inv.id} className="bg-white border border-orange-200 rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800">{inv.name}</p>
                          <p className="text-sm text-slate-600">
                            {inv.institution?.name} • Venceu em {new Date(inv.maturity_date!).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-800">{formatCurrency(Number(inv.current_value))}</p>
                          <Badge variant="destructive" className="text-xs">
                            Vencida
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Investments Table */}
        <InvestmentTable
          investments={investments}
          institutions={institutions}
          investmentTypes={investmentTypes}
          onEdit={handleEdit}
          onDelete={deleteInvestment}
        />
      </CardContent>

      {showForm && (
        <InvestmentForm
          onClose={() => {
            setShowForm(false);
            setEditingInvestment(undefined);
          }}
          onSubmit={handleSubmit}
          onAddInstitution={addInstitution}
          onAddType={addInvestmentType}
          investment={editingInvestment}
          institutions={institutions}
          investmentTypes={investmentTypes}
        />
      )}
    </Card>
  );
};
