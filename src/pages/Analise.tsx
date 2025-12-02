
import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAccounts } from '@/contexts/AccountsContext';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useIsMobile } from '@/hooks/use-mobile';
import { TrendingUp, TrendingDown, DollarSign, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, getMonth, getYear, subMonths, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnalysisSummaryCardsMobile } from '@/components/Dashboard/AnalysisSummaryCardsMobile';
import { MonthYearStepperMobile } from '@/components/Accounts/MonthYearStepperMobile';
import { useNavigate } from 'react-router-dom';

const Analise: React.FC = () => {
  const { accounts } = useAccounts();
  const { categories } = useCategoriesData();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleMonthChange = (startDate: Date, endDate: Date, month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Cores diversificadas para o gráfico de pizza - expandida para mais categorias
  const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#AED6F1', '#A9DFBF', '#F9E79F', '#F5B7B1', '#D2B4DE',
    '#A3E4D7', '#F4D03F', '#EC7063', '#AF7AC5', '#5DADE2',
    '#58D68D', '#F7DC6F', '#F1948A', '#BB8FCE', '#76D7C4'
  ];

  // Gerar opções de meses e anos
  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' },
  ];

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    accounts.forEach(account => {
      const year = getYear(parseISO(account.dueDate));
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [accounts]);

  // Dados para gráfico de barras - apenas 2 meses baseado na seleção
  const barChartData = useMemo(() => {
    const monthlyData: { month: string; monthKey: string; receitas: number; despesas: number; year: number; monthNum: number }[] = [];
    
    // Gerar os 2 meses: o selecionado e o anterior
    const selectedDate = new Date(selectedYear, selectedMonth);
    const previousDate = subMonths(selectedDate, 1);
    
    [previousDate, selectedDate].forEach(date => {
      const monthKey = format(date, 'MMM yyyy', { locale: ptBR });
      monthlyData.push({
        month: monthKey,
        monthKey,
        receitas: 0,
        despesas: 0,
        year: getYear(date),
        monthNum: getMonth(date)
      });
    });
    
    // Preencher com dados das contas
    accounts.forEach(account => {
      const date = parseISO(account.dueDate);
      const accountYear = getYear(date);
      const accountMonth = getMonth(date);
      
      const monthData = monthlyData.find(m => m.year === accountYear && m.monthNum === accountMonth);
      
      if (monthData) {
        if (account.type === 'receita') {
          monthData.receitas += account.amount;
        } else {
          monthData.despesas += Math.abs(account.amount);
        }
      }
    });

    return monthlyData;
  }, [accounts, selectedMonth, selectedYear]);

  // Dados para gráfico de pizza - filtrar por mês/ano selecionado
  const pieChartData = useMemo(() => {
    console.log('=== DEBUG GRÁFICO DE PIZZA ===');
    console.log('Mês selecionado:', selectedMonth, 'Ano selecionado:', selectedYear);
    console.log('Total de contas:', accounts.length);
    
    // Filtrar contas do mês/ano selecionado que são despesas
    const filteredAccounts = accounts.filter(account => {
      const date = parseISO(account.dueDate);
      const accountMonth = getMonth(date);
      const accountYear = getYear(date);
      
      const isExpense = account.type === 'despesa';
      const matchesMonth = accountMonth === selectedMonth;
      const matchesYear = accountYear === selectedYear;
      
      return isExpense && matchesMonth && matchesYear;
    });

    console.log('Contas filtradas (despesas do período):', filteredAccounts.length);
    
    // Agrupar por categoria
    const categoryTotals: { [key: string]: number } = {};
    
    filteredAccounts.forEach(account => {
      const category = account.category;
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += Math.abs(account.amount);
    });

    console.log('Totais por categoria:', categoryTotals);

    // Converter para array, ordenar por valor (maior para menor) e adicionar cores
    const result = Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .sort(([, a], [, b]) => b - a) // Ordenar por valor decrescente
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
        percentage: 0 // Será calculado após ter todos os dados
      }));

    // Calcular porcentagens
    const total = result.reduce((sum, item) => sum + item.value, 0);
    result.forEach(item => {
      item.percentage = total > 0 ? (item.value / total) * 100 : 0;
    });

    console.log('Dados finais do gráfico:', result);
    console.log('=== FIM DEBUG ===');
    
    return result;
  }, [accounts, selectedMonth, selectedYear]);

  // Calcular totais
  const totals = useMemo(() => {
    const receitas = accounts
      .filter(account => account.type === 'receita')
      .reduce((sum, account) => sum + account.amount, 0);
    
    const despesas = accounts
      .filter(account => account.type === 'despesa')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);

    return { receitas, despesas, saldo: receitas - despesas };
  }, [accounts]);

  const chartConfig = {
    receitas: {
      label: "Recebido",
      color: "#22c55e",
    },
    despesas: {
      label: "Pago",
      color: "#ef4444",
    },
  };

  return (
    <Layout>
      <div className="space-y-4 pb-8">
        {/* Header com título e botão menu */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl md:text-3xl font-bold text-slate-800">
            {isMobile ? 'Análise' : 'Análise Gráfica'}
          </h1>
          {isMobile && (
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs px-2 py-1 h-8"
            >
              <Menu size={16} />
              Menu
            </Button>
          )}
        </div>

        {/* Cards de Resumo */}
        {isMobile ? (
          <AnalysisSummaryCardsMobile
            receitas={totals.receitas}
            despesas={totals.despesas}
            saldo={totals.saldo}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total de Receitas</CardTitle>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-green-600">
                  R$ {totals.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total de Despesas</CardTitle>
                <TrendingDown className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-red-600">
                  R$ {totals.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${totals.saldo >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Saldo</CardTitle>
                <DollarSign className={`h-5 w-5 ${totals.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl md:text-4xl font-bold ${totals.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  R$ {totals.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráfico de Barras */}
        <Card>
          <CardHeader className={isMobile ? "pb-3 space-y-2" : ""}>
            <CardTitle className={isMobile ? "text-base" : "text-lg md:text-xl"}>
              {isMobile ? 'Recebido vs Pago' : 'Receitas vs Despesas'}
            </CardTitle>
            {isMobile && (
              <div className="flex items-center justify-center gap-2 bg-card border rounded-lg p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    let newMonth = selectedMonth - 1;
                    let newYear = selectedYear;
                    if (newMonth < 0) {
                      newMonth = 11;
                      newYear = selectedYear - 1;
                    }
                    const startDate = new Date(newYear, newMonth, 1);
                    const endDate = new Date(newYear, newMonth + 1, 0);
                    handleMonthChange(startDate, endDate, newMonth, newYear);
                  }}
                  className="h-7 w-7 p-0 flex-shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-xs font-semibold text-center min-w-[100px]">
                  {months[selectedMonth].label} {selectedYear}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    let newMonth = selectedMonth + 1;
                    let newYear = selectedYear;
                    if (newMonth > 11) {
                      newMonth = 0;
                      newYear = selectedYear + 1;
                    }
                    const startDate = new Date(newYear, newMonth, 1);
                    const endDate = new Date(newYear, newMonth + 1, 0);
                    handleMonthChange(startDate, endDate, newMonth, newYear);
                  }}
                  className="h-7 w-7 p-0 flex-shrink-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className={isMobile ? "px-2 pb-3" : ""}>
            <ChartContainer config={chartConfig} className={isMobile ? "min-h-[200px]" : "min-h-[300px]"}>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                <BarChart 
                  data={barChartData} 
                  margin={{ top: 10, right: isMobile ? 5 : 20, left: isMobile ? -10 : 10, bottom: isMobile ? 5 : 5 }}
                  barGap={isMobile ? 0 : 6}
                  barCategoryGap={isMobile ? '15%' : '20%'}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: isMobile ? 9 : 13, fill: '#64748b' }}
                    angle={0}
                    textAnchor="middle"
                    height={isMobile ? 40 : 60}
                  />
                  <YAxis 
                    tick={{ fontSize: isMobile ? 9 : 13, fill: '#64748b' }}
                    tickFormatter={(value) => isMobile ? `${(value / 1000).toFixed(0)}k` : `R$ ${(value / 1000).toFixed(0)}k`}
                    width={isMobile ? 32 : 60}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [
                      `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                      ''
                    ]}
                  />
                  <Bar 
                    dataKey="receitas" 
                    fill="var(--color-receitas)" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={isMobile ? 24 : 40}
                  />
                  <Bar 
                    dataKey="despesas" 
                    fill="var(--color-despesas)" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={isMobile ? 24 : 40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Despesas por Categoria - Cards em Barras */}
        <Card>
          <CardHeader className={isMobile ? "pb-3" : ""}>
            <CardTitle className={isMobile ? "text-base" : "text-lg md:text-xl"}>
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? "px-3 pb-3" : ""}>
            {pieChartData.length > 0 ? (
              <div className="space-y-2">
                <div className={`text-xs font-medium text-slate-700 text-center ${isMobile ? 'mb-2' : 'mb-4'}`}>
                  {months[selectedMonth].label} de {selectedYear}
                </div>
                {pieChartData.map((category, index) => (
                  <div 
                    key={index} 
                    className="bg-card border rounded-lg p-2.5 flex items-center gap-2.5"
                  >
                    <div 
                      className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {category.name}
                        </span>
                        <span className="text-xs font-medium text-slate-600 flex-shrink-0">
                          {category.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">
                        R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[150px] text-slate-500">
                <p className="text-sm font-medium mb-1">Nenhuma despesa encontrada</p>
                <p className="text-xs text-center">
                  Não há despesas cadastradas para {months[selectedMonth].label} de {selectedYear}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analise;
