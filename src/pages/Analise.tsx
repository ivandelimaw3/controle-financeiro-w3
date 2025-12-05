
import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { useAccounts } from '@/contexts/AccountsContext';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useIsMobile } from '@/hooks/use-mobile';
import { TrendingUp, TrendingDown, DollarSign, Menu } from 'lucide-react';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnalysisSummaryCardsMobile } from '@/components/Dashboard/AnalysisSummaryCardsMobile';
import { MonthYearStepperMobile } from '@/components/Accounts/MonthYearStepperMobile';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Analise: React.FC = () => {
  const { accounts } = useAccounts();
  const { categories } = useCategoriesData();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAll, setShowAll] = useState(true);

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

  // Dados para gráfico de barras - Janeiro a Dezembro ou mês selecionado
  const barChartData = useMemo(() => {
    const monthlyData: { month: string; monthKey: string; receitas: number; despesas: number; year: number; monthNum: number }[] = [];
    
    if (showAll) {
      // Gerar de Janeiro a Dezembro do ano selecionado
      for (let i = 0; i < 12; i++) {
        const date = new Date(selectedYear, i);
        const monthKey = format(date, 'MMM', { locale: ptBR });
        monthlyData.push({
          month: monthKey,
          monthKey,
          receitas: 0,
          despesas: 0,
          year: selectedYear,
          monthNum: i
        });
      }
    } else {
      // Apenas o mês selecionado
      const date = new Date(selectedYear, selectedMonth);
      const monthKey = format(date, 'MMMM', { locale: ptBR });
      monthlyData.push({
        month: monthKey,
        monthKey,
        receitas: 0,
        despesas: 0,
        year: selectedYear,
        monthNum: selectedMonth
      });
    }
    
    // Preencher com dados das contas
    accounts.forEach(account => {
      const date = parseISO(account.dueDate);
      const accountYear = getYear(date);
      const accountMonth = getMonth(date);
      
      if (accountYear === selectedYear) {
        const monthData = monthlyData.find(m => m.monthNum === accountMonth);
        
        if (monthData) {
          if (account.type === 'receita') {
            monthData.receitas += account.amount;
          } else {
            monthData.despesas += Math.abs(account.amount);
          }
        }
      }
    });

    return monthlyData;
  }, [accounts, selectedYear, selectedMonth, showAll]);

  // Dados para despesas por categoria - filtrar por mês/ano selecionado
  const despesasPorCategoria = useMemo(() => {
    const filteredAccounts = accounts.filter(account => {
      const date = parseISO(account.dueDate);
      const accountMonth = getMonth(date);
      const accountYear = getYear(date);
      return account.type === 'despesa' && accountMonth === selectedMonth && accountYear === selectedYear;
    });
    
    const categoryTotals: { [key: string]: number } = {};
    filteredAccounts.forEach(account => {
      const category = account.category;
      if (!categoryTotals[category]) categoryTotals[category] = 0;
      categoryTotals[category] += Math.abs(account.amount);
    });

    const result = Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
        percentage: 0
      }));

    const total = result.reduce((sum, item) => sum + item.value, 0);
    result.forEach(item => {
      item.percentage = total > 0 ? (item.value / total) * 100 : 0;
    });
    
    return result;
  }, [accounts, selectedMonth, selectedYear]);

  // Dados para receitas por categoria - filtrar por mês/ano selecionado
  const receitasPorCategoria = useMemo(() => {
    const filteredAccounts = accounts.filter(account => {
      const date = parseISO(account.dueDate);
      const accountMonth = getMonth(date);
      const accountYear = getYear(date);
      return account.type === 'receita' && accountMonth === selectedMonth && accountYear === selectedYear;
    });
    
    const categoryTotals: { [key: string]: number } = {};
    filteredAccounts.forEach(account => {
      const category = account.category;
      if (!categoryTotals[category]) categoryTotals[category] = 0;
      categoryTotals[category] += account.amount;
    });

    const result = Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
        percentage: 0
      }));

    const total = result.reduce((sum, item) => sum + item.value, 0);
    result.forEach(item => {
      item.percentage = total > 0 ? (item.value / total) * 100 : 0;
    });
    
    return result;
  }, [accounts, selectedMonth, selectedYear]);

  // Calcular totais - baseado na seleção (todos ou mês específico)
  const totals = useMemo(() => {
    const filteredAccounts = showAll 
      ? accounts.filter(account => {
          const date = parseISO(account.dueDate);
          return getYear(date) === selectedYear;
        })
      : accounts.filter(account => {
          const date = parseISO(account.dueDate);
          return getMonth(date) === selectedMonth && getYear(date) === selectedYear;
        });

    const receitas = filteredAccounts
      .filter(account => account.type === 'receita')
      .reduce((sum, account) => sum + account.amount, 0);
    
    const despesas = filteredAccounts
      .filter(account => account.type === 'despesa')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);

    return { receitas, despesas, saldo: receitas - despesas };
  }, [accounts, showAll, selectedMonth, selectedYear]);

  const chartConfig = {
    receitas: {
      label: "Recebido",
      color: "#22c55e",
    },
    despesas: {
      label: "Pago",
      color: "#ef4444",
    },
  } satisfies ChartConfig;

  return (
    <Layout>
      <div className="space-y-4 pb-8">
        {/* Card Menu Principal */}
        {isMobile && (
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Menu className="h-5 w-5" />
            Menu Principal
          </Button>
        )}

        {/* Card Título */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl md:text-3xl font-bold text-slate-800">
              Análise Gráfica
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Navegador de Mês/Ano - Desktop com dois steppers e botão Todos */}
        {!isMobile && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-8">
                {/* Botão Todos */}
                <Button
                  variant={showAll ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAll(true)}
                >
                  Todos
                </Button>

                {/* Stepper de Mês */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 mr-1">Mês:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
                      const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
                      handleMonthChange(new Date(newYear, newMonth), new Date(newYear, newMonth), newMonth, newYear);
                      setShowAll(false);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={!showAll ? "default" : "outline"}
                    size="sm"
                    className="min-w-[90px]"
                    onClick={() => setShowAll(false)}
                  >
                    {months[selectedMonth].label}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
                      const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
                      handleMonthChange(new Date(newYear, newMonth), new Date(newYear, newMonth), newMonth, newYear);
                      setShowAll(false);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Stepper de Ano */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 mr-1">Ano:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedYear(prev => prev - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-semibold text-slate-800 min-w-[50px] text-center">
                    {selectedYear}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedYear(prev => prev + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  R$ {totals.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total de Despesas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-600">
                  R$ {totals.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${totals.saldo >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Saldo</CardTitle>
                <DollarSign className={`h-4 w-4 ${totals.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${totals.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  R$ {totals.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráfico de Barras */}
        <Card>
          <CardHeader className={isMobile ? "pb-3 space-y-2" : ""}>
            <div className="flex items-center justify-between">
              <CardTitle className={isMobile ? "text-base" : "text-lg md:text-xl"}>
                {showAll 
                  ? `Receitas vs Despesas - ${selectedYear}` 
                  : `Receitas vs Despesas - ${months[selectedMonth].label}/${selectedYear}`}
              </CardTitle>
            </div>
            {isMobile && (
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant={showAll ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAll(true)}
                  className="text-xs"
                >
                  Todos
                </Button>
                <MonthYearStepperMobile
                  currentMonth={selectedMonth}
                  currentYear={selectedYear}
                  onMonthChange={(startDate, endDate, month, year) => {
                    handleMonthChange(startDate, endDate, month, year);
                    setShowAll(false);
                  }}
                  isShowingAll={false}
                />
              </div>
            )}
          </CardHeader>
          <CardContent className={isMobile ? "px-2 pb-3" : ""}>
            <ChartContainer config={chartConfig} className={isMobile ? "min-h-[85px]" : "min-h-[127px]"}>
              <ResponsiveContainer width="100%" height={isMobile ? 85 : 127}>
                <BarChart 
                  data={barChartData} 
                  margin={{ top: 10, right: isMobile ? 5 : 20, left: isMobile ? -10 : 10, bottom: isMobile ? 5 : 5 }}
                  barGap={isMobile ? 0 : 6}
                  barCategoryGap={isMobile ? '15%' : '20%'}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: isMobile ? 9 : 10, fill: '#64748b' }}
                    angle={isMobile ? 0 : -45}
                    textAnchor={isMobile ? "middle" : "end"}
                    height={isMobile ? 40 : 80}
                  />
                  <YAxis 
                    tick={{ fontSize: isMobile ? 9 : 13, fill: '#64748b' }}
                    tickFormatter={(value) => isMobile ? `${(value / 1000).toFixed(0)}k` : `R$ ${(value / 1000).toFixed(0)}k`}
                    width={isMobile ? 32 : 60}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent labelKey="month" />}
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

        {/* Receitas e Despesas por Categoria - Duas colunas em Desktop */}
        {isMobile ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {despesasPorCategoria.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-700 mb-2">
                    {months[selectedMonth].label} de {selectedYear}
                  </div>
                  {despesasPorCategoria.map((category, index) => (
                    <div key={index} className="bg-card border rounded-lg p-2.5 flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: category.color }}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate mb-0.5">{category.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600">R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <span className="text-xs font-medium text-slate-600">{category.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[150px] text-slate-500">
                  <p className="text-sm font-medium mb-1">Nenhuma despesa encontrada</p>
                  <p className="text-xs text-center">Não há despesas cadastradas para {months[selectedMonth].label} de {selectedYear}.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Receitas por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl text-green-600">Receitas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {receitasPorCategoria.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-700 mb-4">
                      {months[selectedMonth].label} de {selectedYear}
                    </div>
                    {receitasPorCategoria.map((category, index) => (
                      <div key={index} className="bg-card border rounded-lg p-2.5 flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: category.color }}></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800 truncate mb-0.5">{category.name}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-600">R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <span className="text-xs font-medium text-slate-600">{category.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[150px] text-slate-500">
                    <p className="text-sm font-medium mb-1">Nenhuma receita encontrada</p>
                    <p className="text-xs text-center">Não há receitas cadastradas para {months[selectedMonth].label} de {selectedYear}.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Despesas por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl text-red-600">Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {despesasPorCategoria.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-700 mb-4">
                      {months[selectedMonth].label} de {selectedYear}
                    </div>
                    {despesasPorCategoria.map((category, index) => (
                      <div key={index} className="bg-card border rounded-lg p-2.5 flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: category.color }}></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800 truncate mb-0.5">{category.name}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-600">R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <span className="text-xs font-medium text-slate-600">{category.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[150px] text-slate-500">
                    <p className="text-sm font-medium mb-1">Nenhuma despesa encontrada</p>
                    <p className="text-xs text-center">Não há despesas cadastradas para {months[selectedMonth].label} de {selectedYear}.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analise;
