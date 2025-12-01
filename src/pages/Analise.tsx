
import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAccounts } from '@/contexts/AccountsContext';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useIsMobile } from '@/hooks/use-mobile';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format, parseISO, getMonth, getYear, subMonths, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Analise: React.FC = () => {
  const { accounts } = useAccounts();
  const { categories } = useCategoriesData();
  const isMobile = useIsMobile();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  // Dados para gráfico de barras (últimos 6 meses)
  const barChartData = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);
    
    const monthlyData: { [key: string]: { receitas: number; despesas: number } } = {};
    
    // Inicializar os últimos 6 meses com valores zero
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthKey = format(date, 'MMM yyyy', { locale: ptBR });
      monthlyData[monthKey] = { receitas: 0, despesas: 0 };
    }
    
    accounts.forEach(account => {
      const date = parseISO(account.dueDate);
      
      // Filtrar apenas contas dos últimos 6 meses
      if (isAfter(date, sixMonthsAgo) && isBefore(date, now)) {
        const monthKey = format(date, 'MMM yyyy', { locale: ptBR });
        
        if (monthlyData[monthKey]) {
          if (account.type === 'receita') {
            monthlyData[monthKey].receitas += account.amount;
          } else {
            monthlyData[monthKey].despesas += Math.abs(account.amount);
          }
        }
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      receitas: data.receitas,
      despesas: data.despesas,
    }));
  }, [accounts]);

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
      label: "Receitas",
      color: "#22c55e",
    },
    despesas: {
      label: "Despesas",
      color: "#ef4444",
    },
  };

  // Componente customizado para labels do gráfico de pizza
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.03) return null; // Não mostrar label para fatias muito pequenas (menos de 3%)
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25; // Posicionar fora do círculo
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#334155" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={isMobile ? "11" : "13"}
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <Layout>
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Análise Gráfica</h1>
        </div>

        {/* Cards de Resumo */}
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

        {/* Gráfico de Barras - Últimos 6 Meses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Receitas vs Despesas - Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[350px] md:min-h-[400px]">
              <ResponsiveContainer width="100%" height={isMobile ? 350 : 400}>
                <BarChart 
                  data={barChartData} 
                  margin={{ top: 20, right: isMobile ? 10 : 30, left: isMobile ? 0 : 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: isMobile ? 11 : 13, fill: '#64748b' }}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? 'end' : 'middle'}
                    height={isMobile ? 80 : 60}
                  />
                  <YAxis 
                    tick={{ fontSize: isMobile ? 11 : 13, fill: '#64748b' }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
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
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="despesas" 
                    fill="var(--color-despesas)" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Controles e Gráfico de Pizza */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg md:text-xl">Despesas por Categoria</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <div className="space-y-6">
                <div className="text-base md:text-lg font-medium text-slate-700 text-center">
                  Despesas de {months[selectedMonth].label} de {selectedYear}
                </div>
                <ResponsiveContainer width="100%" height={isMobile ? 400 : 500}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={{
                        stroke: '#94a3b8',
                        strokeWidth: 1,
                      }}
                      label={renderCustomizedLabel}
                      outerRadius={isMobile ? 120 : 160}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={3}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        name
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.96)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: isMobile ? '13px' : '14px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Legenda das categorias - Melhorada */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-8">
                  {pieChartData.map((category, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200"
                    >
                      <div 
                        className="w-6 h-6 rounded-full flex-shrink-0 shadow-sm" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-semibold text-slate-800 block truncate">
                          {category.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                          <span className="font-medium">{category.percentage.toFixed(1)}%</span>
                          <span className="text-slate-400">•</span>
                          <span>R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] md:h-[500px] text-slate-500">
                <p className="text-lg md:text-xl font-medium mb-2">Nenhuma despesa encontrada</p>
                <p className="text-sm md:text-base text-center">
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
