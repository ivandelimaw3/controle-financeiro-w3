import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const PWAUpdatePrompt = () => {
  const isMobile = useIsMobile();
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log('Service Worker registrado:', swUrl);
      
      // Verifica atualizações a cada 1 hora
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Erro ao registrar SW:', error);
    },
  });

  useEffect(() => {
    if (needRefresh && isMobile && !hasShownPrompt) {
      setHasShownPrompt(true);
      
      toast(
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="font-medium">Nova versão disponível!</p>
            <p className="text-sm text-muted-foreground">Clique para atualizar</p>
          </div>
        </div>,
        {
          duration: 10000,
          action: {
            label: 'Atualizar',
            onClick: () => {
              updateServiceWorker(true);
            },
          },
          onDismiss: () => {
            setHasShownPrompt(false);
          },
        }
      );
    }
  }, [needRefresh, isMobile, hasShownPrompt, updateServiceWorker]);

  return null;
};
