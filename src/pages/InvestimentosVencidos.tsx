
import React, { useState, useEffect } from 'react';
import { Archive, TrendingDown, Calendar, Building2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface ExpiredInvestment {
  id: number;
  name: string;
  investor_name: string | null;
  invested_amount: number;
  current_value: number;
  purchase_date: string;
  maturity_date: string;
  moved_at: string;
  institution_id: number | null;
  type_id: number | null;
  institution: {
    id: number;
    name: string;
  } | null;
  type: {
    id: number;
    name: string;
    category: string;
  } | null;
}

const InvestimentosVencidos = () => {
  const [expiredInvestments, setExpiredInvestments] = useState<ExpiredInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiredInvestments();
  }, []);

  const fetchExpiredInvestments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('investimentos_vencidos')
        .select(`
          *,
          institution:investimento_institutions(id, name),
          type:investimento_types(id, name, category)
        `)
        .order('moved_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar investimentos vencidos:', error);
        return;
      }

      // Transform data to match expected type
      const transformedData = data?.map(item => ({
        ...item,
        institution: item.institution && !('error' in item.institution) ? item.institution : null,
        type: item.type && !('error' in item.type) ? item.type : null
      })) || [];

      setExpiredInvestments(transformedData);
    } catch (error) {
      console.error('Erro ao carregar investimentos vencidos:', error);
    } finally {
      setLoading(false);
    }
  };

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
  const totalInvestments = expiredInvestments.length;
  const totalInvested = expiredInvestments.reduce((sum, inv) => sum + Number(inv.invested_amount), 0);
  const totalCurrent = expiredInvestments.reduce((sum, inv) => sum + Number(inv.current_value), 0);
  const totalGain = totalCurrent - totalInvested;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Investimentos Vencidos</h1>
            <p className="text-slate-600 mt-1">
              Histórico de aplicações que foram removidas por vencimento
            </p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Aplicações</p>
                <p className="text-2xl font-bold text-slate-800">{totalInvestments}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Archive className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Investido</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalInvested)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-blue-600" />
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
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Resultado</p>
                <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totalGain)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
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
                  <th className="text-left p-4 font-semibold text-slate-700">Compra</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Vencimento</th>
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
                        <span className="font-medium text-slate-800">
                          {investment.institution?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-800">
                          {investment.type?.name || 'N/A'}
                        </Badge>
                        {investment.type?.category && (
                          <p className="text-xs text-slate-500 mt-1">
                            {getCategoryLabel(investment.type.category)}
                          </p>
                        )}
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
                        {formatDate(investment.purchase_date)}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {formatDate(investment.maturity_date)}
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
              <p className="text-slate-500">
                As aplicações vencidas aparecerão aqui quando forem removidas da lista principal.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InvestimentosVencidos;
