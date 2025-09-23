import React from 'react';
import { Layout } from '@/components/Layout';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSearch, Receipt, CreditCard, Building2, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const isMobile = useIsMobile();

  const quickActions = [
    { 
      icon: FileSearch, 
      title: 'Dashboard', 
      description: 'Visão geral das finanças',
      path: '/dashboard',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      icon: Receipt, 
      title: 'Contas', 
      description: 'Gerenciar receitas e despesas',
      path: '/contas',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      icon: CreditCard, 
      title: 'Cartões', 
      description: 'Cartões de crédito',
      path: '/cartoes-credito',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    { 
      icon: Building2, 
      title: 'Bancos', 
      description: 'Contas bancárias',
      path: '/bancos',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    { 
      icon: TrendingUp, 
      title: 'Investimentos', 
      description: 'Controle de investimentos',
      path: '/investimentos',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
  ];

  return (
    <AccessControlWrapper requiresAccess={false}>
      <Layout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              Controle Financeiro W3
            </h1>
            <p className="text-slate-600">
              {isMobile ? 'Use a barra lateral para navegar' : 'Selecione uma opção para começar'}
            </p>
          </div>

          {!isMobile && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.path} to={action.path}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-3`}>
                          <Icon className={`h-6 w-6 ${action.color}`} />
                        </div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {isMobile && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">👈</div>
              <p className="text-lg text-slate-600">
                Abra o menu lateral para navegar
              </p>
            </div>
          )}
        </div>
      </Layout>
    </AccessControlWrapper>
  );
};

export default Home;