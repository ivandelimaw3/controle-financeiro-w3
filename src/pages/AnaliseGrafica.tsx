
import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccounts } from '@/contexts/AccountsContext';
import { Calendar, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const AnaliseGrafica: React.FC = () => {
  const { accounts } = useAccounts();
  const [selectedMonth, setSelectedMonth] = useState('1');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Gerar lista de anos disponíveis
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(
      accounts.map(account => new Date(account.dueDate).getFullYear())
    ));
    return years.length > 0 ? years.sort((a, b) => b - a) : [new Date().getFullYear()];
  }, [accounts]);

  // Dados para o gráfico de barras (despesas e receitas por mês)
  const monthlyData = useMemo(() => {
    const monthsData = Array.from({ length: 12 }, (_, index) => ({
      month: new Date(0, index).toLocaleDateString('pt-BR', { month: 'short' }),
      monthNumber: index + 1,
      receitas: 0,
      despesas: 0
    }));

    accounts
      .filter(account => {
        const accountDate = new Date(account.dueDate);
        return accountDate.getFullYear() === parseInt(selectedYear);
      })
      .forEach(account => {
        const accountDate = new Date(account.dueDate);
        const monthIndex = accountDate.getMonth();
        
        if (account.type === 'receita' && account.status === 'recebido') {
          monthsData[monthIndex].receitas += account.amount;
        } else if (account.type === 'despesa' && account.status === 'pago') {
          monthsData[monthIndex].despesas += Math.abs(account.amount);
        }
      });

    return monthsData;
  }, [accounts, selectedYear]);

  // Dados para o gráfico de pizza (despesas por categoria no mês selecionado)
  const categoryData = useMemo(() => {
    const categories = new Map<string, number>();
    
    accounts
      .filter(account => {
        const accountDate = new Date(account.dueDate);
        return (
          account.type === 'despesa' &&
          account.status === 'pago' &&
          accountDate.getMonth() + 1 === parseInt(selectedMonth) &&
          accountDate.getFullYear() === parseInt(selectedYear)
        );
      })
      .forEach(account => {
        const category = account.category;
        categories.set(category, (categories.get(category) || 0) + Math.abs(account.amount));
      });

    const colors = [
      '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#F59E0B',
      '#10B981', '#F97316', '#06B6D4', '#84CC16', '#A855F7'
    ];

    return Array.from(categories.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  }, [accounts, selectedMonth, selectedYear]);

  const chartConfig = {
    receitas: {
      label: "Receitas",
      color: "#10B981",
    },
    despesas: {
      label: "Despesas", 
      color: "#EF4444",
    },
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Análise Gráfica</h1>
            <p className="text-slate-600">Visualização gráfica das suas finanças</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 items-center">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-48">
              <Calendar size={16} className="mr-2" />
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <Calendar size={16} className="mr-2" />
              <SelectValue placeholder="Mês para pizza" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Janeiro</SelectItem>
              <SelectItem value="2">Fevereiro</SelectItem>
              <SelectItem value="3">Março</SelectItem>
              <SelectItem value="4">Abril</SelectItem>
              <SelectItem value="5">Maio</SelectItem>
              <SelectItem value="6">Junho</SelectItem>
              <SelectItem value="7">Julho</SelectItem>
              <SelectItem value="8">Agosto</SelectItem>
              <SelectItem value="9">Setembro</SelectItem>
              <SelectItem value="10">Outubro</SelectItem>
              <SelectItem value="11">Novembro</SelectItem>
              <SelectItem value="12">Dezembro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras - Receitas vs Despesas por Mês */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Receitas vs Despesas - {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']} 
                    />
                    <Bar dataKey="receitas" fill="var(--color-receitas)" name="Receitas" />
                    <Bar dataKey="despesas" fill="var(--color-despesas)" name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Pizza - Despesas por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon size={20} />
                Despesas por Categoria - {new Date(0, parseInt(selectedMonth) - 1).toLocaleDateString('pt-BR', { month: 'long' })} {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <PieChartIcon size={48} className="mx-auto mb-4 text-slate-300" />
                    <p>Nenhuma despesa encontrada para</p>
                    <p>{new Date(0, parseInt(selectedMonth) - 1).toLocaleDateString('pt-BR', { month: 'long' })} de {selectedYear}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo dos dados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-slate-600">Total Receitas {selectedYear}</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {monthlyData.reduce((sum, month) => sum + month.receitas, 0).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-slate-600">Total Despesas {selectedYear}</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {monthlyData.reduce((sum, month) => sum + month.despesas, 0).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-slate-600">Saldo {selectedYear}</p>
                <p className={`text-2xl font-bold ${
                  (monthlyData.reduce((sum, month) => sum + month.receitas, 0) - 
                   monthlyData.reduce((sum, month) => sum + month.despesas, 0)) >= 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  R$ {(
                    monthlyData.reduce((sum, month) => sum + month.receitas, 0) - 
                    monthlyData.reduce((sum, month) => sum + month.despesas, 0)
                  ).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AnaliseGrafica;
