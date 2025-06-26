
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, Wrench, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: 'Clientes',
      icon: Users,
      description: 'Gerenciar cadastro de clientes',
      path: '/clientes',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Produtos',
      icon: Package,
      description: 'Gerenciar cadastro de produtos',
      path: '/produtos',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Ordens de Serviço',
      icon: Wrench,
      description: 'Controlar ordens de serviço',
      path: '/ordens',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Relatórios',
      icon: TrendingUp,
      description: 'Visualizar relatórios e estatísticas',
      path: '/relatorios',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-600">Bem-vindo ao sistema de controle de assistência técnica</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardItems.map((item) => (
            <Card 
              key={item.title}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center mb-3`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-800">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">
                Resumo do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Status do Sistema</span>
                  <span className="text-green-600 font-medium">Operacional</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Última Atualização</span>
                  <span className="text-slate-800 font-medium">Hoje</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/clientes')}
                  className="w-full text-left p-2 rounded-lg hover:bg-white/50 transition-colors text-slate-700"
                >
                  + Novo Cliente
                </button>
                <button 
                  onClick={() => navigate('/produtos')}
                  className="w-full text-left p-2 rounded-lg hover:bg-white/50 transition-colors text-slate-700"
                >
                  + Novo Produto
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
