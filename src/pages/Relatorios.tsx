
import React from 'react';
import { Layout } from '@/components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Relatorios: React.FC = () => {
  // Dados simulados para os gráficos
  const monthlyData = [
    { month: 'Jan', receitas: 4000, despesas: 2400 },
    { month: 'Fev', receitas: 3000, despesas: 1398 },
    { month: 'Mar', receitas: 5000, despesas: 2000 },
    { month: 'Abr', receitas: 2780, despesas: 3908 },
    { month: 'Mai', receitas: 1890, despesas: 4800 },
    { month: 'Jun', receitas: 2390, despesas: 3800 },
  ];

  const categoryData = [
    { name: 'Moradia', value: 1200, color: '#EF4444' },
    { name: 'Alimentação', value: 800, color: '#8B5CF6' },
    { name: 'Transporte', value: 300, color: '#EC4899' },
    { name: 'Lazer', value: 400, color: '#6366F1' },
    { name: 'Utilidades', value: 200, color: '#F59E0B' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Relatórios</h1>
            <p className="text-slate-600">Análise detalhada das suas finanças</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
            <Download size={20} className="mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-slate-600 text-sm">Total de Receitas</h3>
                <p className="text-2xl font-bold text-green-600">R$ 18.060,00</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">+12% vs mês anterior</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <TrendingDown className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-slate-600 text-sm">Total de Despesas</h3>
                <p className="text-2xl font-bold text-red-600">R$ 18.306,00</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">+5% vs mês anterior</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-slate-600 text-sm">Saldo do Período</h3>
                <p className="text-2xl font-bold text-slate-800">R$ -246,00</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">-18% vs mês anterior</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras - Receitas vs Despesas */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Receitas vs Despesas - Últimos 6 Meses
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, '']} />
                <Legend />
                <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza - Despesas por Categoria */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Despesas por Categoria
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de Resumo por Categoria */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Resumo por Categoria</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Categoria</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Tipo</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Valor Total</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Transações</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Média</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium text-slate-800">Trabalho</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Receita</span>
                  </td>
                  <td className="p-4 text-green-600 font-semibold">R$ 5.800,00</td>
                  <td className="p-4 text-slate-600">3</td>
                  <td className="p-4 text-slate-600">R$ 1.933,33</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium text-slate-800">Moradia</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Despesa</span>
                  </td>
                  <td className="p-4 text-red-600 font-semibold">R$ 1.200,00</td>
                  <td className="p-4 text-slate-600">1</td>
                  <td className="p-4 text-slate-600">R$ 1.200,00</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium text-slate-800">Alimentação</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Despesa</span>
                  </td>
                  <td className="p-4 text-red-600 font-semibold">R$ 800,00</td>
                  <td className="p-4 text-slate-600">12</td>
                  <td className="p-4 text-slate-600">R$ 66,67</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Relatorios;
