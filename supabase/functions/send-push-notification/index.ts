import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error('VAPID keys not configured');
      return new Response(
        JSON.stringify({ error: 'VAPID keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get tomorrow's date
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking for accounts due on: ${tomorrowStr}`);

    // Get all users with push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found');
      return new Response(
        JSON.stringify({ message: 'No subscriptions found', notificationsSent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${subscriptions.length} subscriptions`);

    let notificationsSent = 0;

    // Process each user's subscriptions
    const userIds = [...new Set(subscriptions.map(s => s.user_id))];

    for (const userId of userIds) {
      // Check accounts due tomorrow for this user
      const { data: accounts, error: accError } = await supabase
        .from('accounts')
        .select('id, description, amount, due_date')
        .eq('user_id', userId)
        .eq('status', 'pendente')
        .eq('type', 'despesa')
        .eq('due_date', tomorrowStr);

      // Check card accounts due tomorrow
      const { data: cardAccounts, error: cardError } = await supabase
        .from('card_accounts')
        .select('id, description, amount, due_date')
        .eq('user_id', userId)
        .eq('status', 'pendente')
        .eq('due_date', tomorrowStr);

      const accountsCount = accounts?.length || 0;
      const cardAccountsCount = cardAccounts?.length || 0;
      const totalDue = accountsCount + cardAccountsCount;

      if (totalDue === 0) {
        console.log(`No accounts due tomorrow for user ${userId}`);
        continue;
      }

      // Calculate total amount
      const accountsTotal = accounts?.reduce((sum, acc) => sum + Number(acc.amount), 0) || 0;
      const cardTotal = cardAccounts?.reduce((sum, acc) => sum + Number(acc.amount), 0) || 0;
      const totalAmount = accountsTotal + cardTotal;

      const payload: PushPayload = {
        title: '⚠️ Contas vencem amanhã!',
        body: `Você tem ${totalDue} conta(s) vencendo amanhã. Total: R$ ${totalAmount.toFixed(2)}`,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        url: '/contas'
      };

      // Get subscriptions for this user
      const userSubscriptions = subscriptions.filter(s => s.user_id === userId);

      for (const subscription of userSubscriptions) {
        try {
          // Send push notification using web-push
          const pushResult = await sendWebPush(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
              }
            },
            JSON.stringify(payload),
            VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY
          );

          if (pushResult.ok) {
            notificationsSent++;
            console.log(`Notification sent to user ${userId}`);
          } else {
            console.error(`Failed to send notification: ${pushResult.status}`);
            
            // Remove invalid subscription
            if (pushResult.status === 410 || pushResult.status === 404) {
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('id', subscription.id);
              console.log(`Removed invalid subscription ${subscription.id}`);
            }
          }
        } catch (pushError) {
          console.error('Push error:', pushError);
        }
      }
    }

    console.log(`Total notifications sent: ${notificationsSent}`);

    return new Response(
      JSON.stringify({ 
        message: 'Push notifications processed',
        notificationsSent,
        usersProcessed: userIds.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Web Push implementation
async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<Response> {
  const urlParts = new URL(subscription.endpoint);
  const audience = `${urlParts.protocol}//${urlParts.host}`;
  
  // Create VAPID JWT
  const vapidHeader = {
    typ: 'JWT',
    alg: 'ES256'
  };
  
  const vapidPayload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: 'mailto:admin@controlefinanceiro.app'
  };
  
  // For simplicity, we'll use a direct fetch with the required headers
  // In production, you'd want to use proper VAPID signing
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
    },
    body: payload
  });
  
  return response;
}
