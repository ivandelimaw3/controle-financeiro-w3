
import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAccounts } from '@/contexts/AccountsContext';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Analise: React.FC = () => {
  const { accounts } = useAccounts();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  // Dados para gráfico de barras (receitas e despesas por mês)
  const barChartData = useMemo(() => {
    const monthlyData: { [key: string]: { receitas: number; despesas: number } } = {};
    
    accounts.forEach(account => {
      const date = parseISO(account.dueDate);
      const monthKey = format(date, 'MMM yyyy', { locale: ptBR });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { receitas: 0, despesas: 0 };
      }
      
      if (account.type === 'receita') {
        monthlyData[monthKey].receitas += account.amount;
      } else {
        monthlyData[monthKey].despesas += account.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      receitas: data.receitas,
      despesas: data.despesas,
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [accounts]);

  // Dados para gráfico de pizza (despesas por categoria no mês selecionado)
  const pieChartData = useMemo(() => {
    const categoryData: { [key: string]: number } = {};
    
    accounts
      .filter(account => {
        const date = parseISO(account.dueDate);
        return account.type === 'despesa' && 
               getMonth(date) === selectedMonth && 
               getYear(date) === selectedYear;
      })
      .forEach(account => {
        categoryData[account.category] = (categoryData[account.category] || 0) + account.amount;
      });

    return Object.entries(categoryData).map(([category, value]) => ({
      name: category,
      value,
    }));
  }, [accounts, selectedMonth, selectedYear]);

  // Calcular totais
  const totals = useMemo(() => {
    const receitas = accounts
      .filter(account => account.type === 'receita')
      .reduce((sum, account) => sum + account.amount, 0);
    
    const despesas = accounts
      .filter(account => account.type === 'despesa')
      .reduce((sum, account) => sum + account.amount, 0);

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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Análise Gráfica</h1>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totals.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totals.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className={`h-4 w-4 ${totals.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totals.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {totals.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Barras */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [
                      `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                      ''
                    ]}
                  />
                  <Bar dataKey="receitas" fill="var(--color-receitas)" />
                  <Bar dataKey="despesas" fill="var(--color-despesas)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Controles e Gráfico de Pizza */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Despesas por Categoria</CardTitle>
              <div className="flex gap-4">
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-40">
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
                  <SelectTrigger className="w-32">
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
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [
                      `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                      'Valor'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-slate-500">
                <p>Nenhuma despesa encontrada para o período selecionado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analise;
