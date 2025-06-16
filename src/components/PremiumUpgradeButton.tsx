
import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PremiumUpgradeButton: React.FC = () => {
  const { toast } = useToast();

  const handleUpgradeRequest = async () => {
    toast({
      title: "Funcionalidade indisponível",
      description: "O sistema de upgrade premium não está disponível no momento.",
      variant: "destructive"
    });
  };

  return (
    <Button onClick={handleUpgradeRequest} className="flex items-center gap-2">
      <Crown className="h-4 w-4" />
      Solicitar Premium
    </Button>
  );
};

export default PremiumUpgradeButton;
