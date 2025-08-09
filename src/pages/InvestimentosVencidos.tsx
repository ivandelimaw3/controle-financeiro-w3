
import React, { useState, useEffect } from 'react';
import { Archive, TrendingUp, Building2, Eye, Trash2, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface ExpiredInvestment {
  id: number;
  institution_id: number;
  type_id: number;
  name: string;
  invested_amount: number;
  current_value: number;
  yield_percentage: number | null;
  purchase_date: string;
  maturity_date: string | null;
  investor_name: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  moved_at: string;
  institution?: {
    id: number;
    name: string;
  };
  type?: {
    id: number;
    name: string;
    category: string;
  };
}

const InvestimentosVencidos = () => {
  const [expiredInvestments, setExpiredInvestments] = useState<ExpiredInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchExpiredInvestments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investimentos_vencidos')
        .select(`
          *,
          institution:investment_institutions(id, name),
          type:investment_types(id, name, category)
        `)
        .eq('user_id', user.id)
        .order('moved_at', { ascending: false });

      if (error) {
        console.error('fetchExpiredInvestments error:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os investimentos vencidos.",
          variant: "destructive"
        });
        return;
      }
      
      setExpiredInvestments(data || []);
    } catch (error) {
      console.error('Erro ao buscar investimentos vencidos:', error);
      toast({
        title: "Erro", 
        description: "Erro ao carregar investimentos vencidos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteExpiredInvestment = async (id: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('investimentos_vencidos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('deleteExpiredInvestment error:', error);
        toast({
          title: "Erro",
          description: "Não foi possível remover o investimento vencido.",
          variant: "destructive"
        });
        return;
      }
      
      await fetchExpiredInvestments();
      toast({
        title: "Sucesso",
        description: "Investimento vencido removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao remover investimento vencido:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover investimento vencido",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchExpiredInvestments();
    }
  }, [user]);

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

  // Cálculos para os cards de resumo
  const totalInvested = expiredInvestments.reduce((sum, inv) => sum + Number(inv.invested_amount), 0);
  const totalCurrent = expiredInvestments.reduce((sum, inv) => sum + Number(inv.current_value), 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Carregando investimentos vencidos...</p>
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
            <div className="flex items-center gap-4">
              <Link
                to="/investimentos"
                className="flex items-center text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Investimentos
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Archive className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Investimentos Vencidos</h1>
              <p className="text-slate-600 mt-1">
                Histórico de aplicações que já foram vencidas e removidas da carteira ativa
              </p>
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
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Valor Final</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalCurrent)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Archive className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Aplicações Vencidas</p>
                <p className="text-2xl font-bold text-slate-800">{expiredInvestments.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Rendimento Total</p>
                <p className={`text-2xl font-bold ${gainPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {gainPercentage.toFixed(2)}%
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Investimentos Vencidos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Investimento</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Instituição</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Tipo</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Investido</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Valor Final</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Rendimento</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Data Vencimento</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Removido em</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {expiredInvestments.map((investment, index) => {
                  const investedAmount = Number(investment.invested_amount);
                  const currentValue = Number(investment.current_value);
                  const gain = currentValue - investedAmount;
                  const gainPercentage = investedAmount > 0 ? (gain / investedAmount) * 100 : 0;
                  
                  return (
                    <tr key={investment.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Archive className="h-5 w-5 text-orange-600" />
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
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
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
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {investment.maturity_date ? formatDate(investment.maturity_date) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {formatDate(investment.moved_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExpiredInvestment(investment.id)}
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
          
          {expiredInvestments.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Archive className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-600 mb-2">
                Nenhum investimento vencido encontrado
              </p>
              <p className="text-slate-500 mb-4">
                Quando você remover aplicações vencidas, elas aparecerão aqui.
              </p>
              <Link to="/investimentos">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Investimentos Ativos
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InvestimentosVencidos;
