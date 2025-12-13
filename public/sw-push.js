// Service Worker para Push Notifications
self.addEventListener('push', function(event) {
  console.log('[SW] Push recebido:', event);

  let data = {
    title: 'Controle Financeiro W3',
    body: 'Você tem notificações pendentes',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    url: '/'
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    console.error('[SW] Erro ao processar dados do push:', e);
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'conta-vencimento',
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Ver contas'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notificação clicada:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Se já tem uma janela aberta, foca nela
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Se não tem janela aberta, abre uma nova
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[SW] Subscription changed:', event);
  // Aqui você pode reinscrever o usuário se necessário
});
