
import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePremiumRequests } from '@/hooks/usePremiumRequests';

const PremiumUpgradeButton: React.FC = () => {
  const { toast } = useToast();
  const { userHasPendingRequest, requestPremiumUpgrade, checkUserPendingRequest, loading } = usePremiumRequests();

  const handleUpgradeRequest = async () => {
    const success = await requestPremiumUpgrade();
    
    if (success) {
      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de upgrade premium foi enviada para análise dos administradores.",
      });
      await checkUserPendingRequest();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a solicitação. Você pode já ter uma solicitação pendente ou já ser premium.",
        variant: "destructive"
      });
    }
  };

  if (userHasPendingRequest) {
    return (
      <Button disabled className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Aguardando Aprovação
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleUpgradeRequest} 
      className="flex items-center gap-2"
      disabled={loading}
    >
      <Crown className="h-4 w-4" />
      Solicitar Premium
    </Button>
  );
};

export default PremiumUpgradeButton;
