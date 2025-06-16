
import React from 'react';
import { Layout } from './Layout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Clock, Crown } from 'lucide-react';
import PremiumUpgradeButton from './PremiumUpgradeButton';

export const TrialExpiredScreen: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <Clock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-slate-800">
              Período de Teste Expirado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-600">
              Seu período de teste de 30 dias expirou. Para continuar usando todas as funcionalidades do aplicativo, 
              solicite o upgrade para premium.
            </p>
            
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <Crown className="h-5 w-5" />
                  <span className="font-semibold">Conta Premium</span>
                </div>
                <ul className="text-sm text-amber-700 mt-2 space-y-1 text-left">
                  <li>• Acesso ilimitado a todas as funcionalidades</li>
                  <li>• Gerenciamento completo de finanças</li>
                  <li>• Relatórios avançados</li>
                  <li>• Suporte prioritário</li>
                </ul>
              </div>
              
              <PremiumUpgradeButton />
            </div>
            
            <p className="text-sm text-slate-500">
              Sua solicitação será analisada pelos administradores e você receberá uma notificação quando aprovada.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
