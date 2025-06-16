
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useUsageControl } from '@/hooks/useUsageControl';
import { Clock, Crown, AlertTriangle } from 'lucide-react';
import PremiumUpgradeButton from './PremiumUpgradeButton';

export const TrialStatusBanner: React.FC = () => {
  const { usageData, loading } = useUsageControl();

  if (loading || !usageData) {
    return null;
  }

  if (usageData.isPremium) {
    return (
      <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800">Conta Premium</h3>
                <p className="text-sm text-amber-700">
                  Você tem acesso completo a todas as funcionalidades
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usageData.isTrialActive) {
    return (
      <Card className="mb-6 border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Período de Teste Expirado</h3>
                <p className="text-sm text-red-700">
                  Seu período de teste de 30 dias expirou. Faça upgrade para continuar usando o app.
                </p>
              </div>
            </div>
            <PremiumUpgradeButton />
          </div>
        </CardContent>
      </Card>
    );
  }

  const isWarning = usageData.daysRemaining <= 7;

  return (
    <Card className={`mb-6 ${
      isWarning 
        ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-red-50' 
        : 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className={`h-6 w-6 ${isWarning ? 'text-orange-600' : 'text-blue-600'}`} />
            <div>
              <h3 className={`font-semibold ${isWarning ? 'text-orange-800' : 'text-blue-800'}`}>
                Período de Teste Ativo
              </h3>
              <p className={`text-sm ${isWarning ? 'text-orange-700' : 'text-blue-700'}`}>
                {usageData.daysRemaining} dias restantes do seu período de teste
                {isWarning && ' - Tempo acabando!'}
              </p>
            </div>
          </div>
          <PremiumUpgradeButton />
        </div>
      </CardContent>
    </Card>
  );
};
