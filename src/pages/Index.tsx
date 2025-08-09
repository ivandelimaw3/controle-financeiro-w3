
import React from 'react';
import { Layout } from '@/components/Layout';
import { InvestmentsSection } from '@/components/Dashboard/InvestmentsSection';

const Index = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Controle Financeiro W3</h1>
            <p className="text-xl text-blue-100 mb-6">
              Gerencie suas finanças e investimentos com facilidade e eficiência
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="font-semibold text-lg mb-2">Controle Total</h3>
                <p className="text-blue-100 text-sm">Acompanhe todas suas contas e movimentações</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="font-semibold text-lg mb-2">Investimentos</h3>
                <p className="text-blue-100 text-sm">Monitore o desempenho de seus investimentos</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="font-semibold text-lg mb-2">Relatórios</h3>
                <p className="text-blue-100 text-sm">Análises detalhadas de sua situação financeira</p>
              </div>
            </div>
          </div>
        </div>

        <InvestmentsSection />
      </div>
    </Layout>
  );
};

export default Index;
