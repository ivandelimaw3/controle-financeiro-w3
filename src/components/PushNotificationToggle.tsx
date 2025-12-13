import React from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationToggleProps {
  compact?: boolean;
}

export const PushNotificationToggle: React.FC<PushNotificationToggleProps> = ({ compact = false }) => {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!isSupported) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          {isSubscribed ? (
            <Bell className="h-4 w-4 text-primary" />
          ) : (
            <BellOff className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            Notificações Push
          </span>
        </div>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba alertas no seu celular quando contas estiverem próximas do vencimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        {permission === 'denied' ? (
          <div className="text-sm text-destructive">
            As notificações foram bloqueadas. Para ativá-las, acesse as configurações do navegador.
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {isSubscribed ? 'Notificações ativadas' : 'Notificações desativadas'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isSubscribed 
                  ? 'Você receberá alertas 1 dia antes do vencimento' 
                  : 'Ative para receber alertas de contas a vencer'}
              </p>
            </div>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Button
                variant={isSubscribed ? "outline" : "default"}
                size="sm"
                onClick={handleToggle}
                disabled={isLoading}
              >
                {isSubscribed ? (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Desativar
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Ativar
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
