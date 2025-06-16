
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUsageControl } from '@/hooks/useUsageControl';
import { Crown, Lock, Clock } from 'lucide-react';

export const TrialExpiredScreen: React.FC = () => {
  const { upgradeToPremium, usageData } = useUsageControl();

  const handleUpgrade = async () => {
    const success = await upgradeToPremium();
    if (success) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-red-100">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
            Período de Teste Expirado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-slate-500" />
              <span className="text-slate-600">30 dias de teste utilizados</span>
            </div>
            <p className="text-slate-600">
              Seu período de teste gratuito de 30 dias chegou ao fim. 
              Para continuar usando todas as funcionalidades do app, 
              faça upgrade para a versão premium.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Benefícios Premium:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Acesso ilimitado a todas as funcionalidades</li>
              <li>• Sem limite de contas e investimentos</li>
              <li>• Relatórios avançados</li>
              <li>• Suporte prioritário</li>
            </ul>
          </div>

          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            size="lg"
          >
            <Crown className="h-5 w-5 mr-2" />
            Fazer Upgrade para Premium
          </Button>

          <p className="text-xs text-center text-slate-500">
            Data de expiração: {usageData?.trialEndDate ? 
              new Date(usageData.trialEndDate).toLocaleDateString('pt-BR') : 'N/A'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
