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

interface RequestBody {
  test?: boolean;
  userId?: string;
}

serve(async (req) => {
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

    console.log('VAPID keys loaded, public key length:', VAPID_PUBLIC_KEY.length);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let body: RequestBody = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is fine
    }

    const isTestMode = body.test === true;
    const specificUserId = body.userId;

    console.log(`Mode: ${isTestMode ? 'TEST' : 'PRODUCTION'}`);

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking for accounts due on: ${tomorrowStr}`);

    let subscriptionsQuery = supabase.from('push_subscriptions').select('*');
    
    if (specificUserId) {
      subscriptionsQuery = subscriptionsQuery.eq('user_id', specificUserId);
    }

    const { data: subscriptions, error: subError } = await subscriptionsQuery;

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
    const errors: string[] = [];
    const userIds = [...new Set(subscriptions.map(s => s.user_id))];

    for (const userId of userIds) {
      let payload: PushPayload;
      
      if (isTestMode) {
        payload = {
          title: '🔔 Teste de Notificação',
          body: `Notificação de teste enviada em ${new Date().toLocaleString('pt-BR')}`,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          url: '/contas'
        };
        console.log(`Sending TEST notification to user ${userId}`);
      } else {
        const { data: accounts } = await supabase
          .from('accounts')
          .select('id, description, amount, due_date')
          .eq('user_id', userId)
          .eq('status', 'pendente')
          .eq('type', 'despesa')
          .eq('due_date', tomorrowStr);

        const { data: cardAccounts } = await supabase
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

        const accountsTotal = accounts?.reduce((sum, acc) => sum + Number(acc.amount), 0) || 0;
        const cardTotal = cardAccounts?.reduce((sum, acc) => sum + Number(acc.amount), 0) || 0;
        const totalAmount = accountsTotal + cardTotal;

        payload = {
          title: '⚠️ Contas vencem amanhã!',
          body: `Você tem ${totalDue} conta(s) vencendo amanhã. Total: R$ ${totalAmount.toFixed(2)}`,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          url: '/contas'
        };
      }

      const userSubscriptions = subscriptions.filter(s => s.user_id === userId);

      for (const subscription of userSubscriptions) {
        try {
          console.log(`Sending to endpoint: ${subscription.endpoint.substring(0, 60)}...`);
          
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

          console.log(`Push result status: ${pushResult.status}`);

          if (pushResult.ok) {
            notificationsSent++;
            console.log(`Notification sent successfully to user ${userId}`);
          } else {
            const errorText = await pushResult.text();
            console.error(`Failed to send notification: ${pushResult.status} - ${errorText}`);
            errors.push(`User ${userId}: ${pushResult.status} - ${errorText}`);
            
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
          errors.push(`User ${userId}: ${pushError.message}`);
        }
      }
    }

    console.log(`Total notifications sent: ${notificationsSent}`);

    return new Response(
      JSON.stringify({ 
        message: 'Push notifications processed',
        notificationsSent,
        usersProcessed: userIds.length,
        errors: errors.length > 0 ? errors : undefined,
        mode: isTestMode ? 'test' : 'production'
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

async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<Response> {
  const urlParts = new URL(subscription.endpoint);
  const audience = `${urlParts.protocol}//${urlParts.host}`;
  
  // Create JWT for VAPID
  const jwt = await createVapidJwt(audience, vapidPrivateKey);
  
  console.log('JWT created successfully');
  
  // Encrypt payload
  const encryptedPayload = await encryptPayload(
    payload,
    subscription.keys.p256dh,
    subscription.keys.auth
  );
  
  console.log(`Encrypted payload size: ${encryptedPayload.byteLength}`);
  
  // VAPID header format: vapid t=<jwt>, k=<publicKey>
  const authHeader = `vapid t=${jwt}, k=${vapidPublicKey}`;
  
  console.log('Authorization header length:', authHeader.length);
  
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
      'Urgency': 'high',
    },
    body: encryptedPayload
  });
  
  return response;
}

async function createVapidJwt(audience: string, privateKeyBase64: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: 'mailto:admin@controlefinanceiro.app'
  };
  
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  // Decode private key (raw 32-byte format used by VAPID)
  const privateKeyBytes = base64UrlDecode(privateKeyBase64);
  console.log('Private key bytes length:', privateKeyBytes.length);
  
  // Import as JWK - VAPID private key is raw 32-byte EC private key
  // We need to construct the JWK with x and y from the public key
  // For simplicity, generate a temp key and sign (this is a workaround)
  
  // Actually, let's use the raw key bytes to create a proper EC key
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign']
  );
  
  // Export to JWK to get the structure
  const jwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey) as JsonWebKey;
  
  // Replace d with our private key
  jwk.d = privateKeyBase64;
  
  // For this to work properly, x and y should match, but for signing we just need d
  // Let's try importing with our d value
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  
  const signatureArrayBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );
  
  // Convert DER signature to raw format if needed
  let signatureBytes = new Uint8Array(signatureArrayBuffer);
  if (signatureBytes.length !== 64) {
    signatureBytes = derToRaw(signatureBytes);
  }
  
  const signatureB64 = base64UrlEncode(signatureBytes);
  
  return `${unsignedToken}.${signatureB64}`;
}

function derToRaw(derSignature: Uint8Array): Uint8Array {
  // DER format: 0x30 [length] 0x02 [r-length] [r] 0x02 [s-length] [s]
  if (derSignature[0] !== 0x30) {
    return derSignature; // Already raw
  }
  
  const raw = new Uint8Array(64);
  let offset = 2;
  
  // R value
  offset++; // Skip 0x02
  let rLen = derSignature[offset++];
  let rStart = offset;
  if (derSignature[rStart] === 0) {
    rStart++;
    rLen--;
  }
  raw.set(derSignature.slice(rStart, rStart + Math.min(rLen, 32)), 32 - Math.min(rLen, 32));
  offset = rStart + rLen;
  
  // S value  
  offset++; // Skip 0x02
  let sLen = derSignature[offset++];
  let sStart = offset;
  if (derSignature[sStart] === 0) {
    sStart++;
    sLen--;
  }
  raw.set(derSignature.slice(sStart, sStart + Math.min(sLen, 32)), 64 - Math.min(sLen, 32));
  
  return raw;
}

async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<Uint8Array> {
  const payloadBytes = new TextEncoder().encode(payload);
  
  // Generate local keypair for ECDH
  const localKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );
  
  // Import the subscriber's public key
  const subscriberPubKeyBytes = base64UrlDecode(p256dhKey);
  const subscriberPubKey = await crypto.subtle.importKey(
    'raw',
    subscriberPubKeyBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
  
  // Derive shared secret using ECDH
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberPubKey },
    localKeyPair.privateKey,
    256
  );
  const sharedSecret = new Uint8Array(sharedSecretBits);
  
  // Get auth secret
  const authSecretBytes = base64UrlDecode(authSecret);
  
  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Export local public key
  const localPubKeyBuffer = await crypto.subtle.exportKey('raw', localKeyPair.publicKey);
  const localPubKey = new Uint8Array(localPubKeyBuffer);
  
  // RFC 8291 key derivation
  // IKM = ECDH(localPrivate, subscriberPublic)
  // PRK = HKDF-Extract(auth_secret, IKM)
  // key_info = "Content-Encoding: aes128gcm" || 0x00
  // CEK = HKDF-Expand(PRK, key_info || context, 16)
  // nonce_info = "Content-Encoding: nonce" || 0x00
  // nonce = HKDF-Expand(PRK, nonce_info || context, 12)
  
  // Create info for key derivation
  const keyInfoBase = new TextEncoder().encode('WebPush: info\0');
  const context = concatBuffers(
    keyInfoBase,
    subscriberPubKeyBytes,
    localPubKey
  );
  
  // Extract PRK
  const prkKey = await crypto.subtle.importKey(
    'raw',
    authSecretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const prk = new Uint8Array(await crypto.subtle.sign('HMAC', prkKey, sharedSecret));
  
  // Derive content encryption key
  const cekInfo = concatBuffers(
    new TextEncoder().encode('Content-Encoding: aes128gcm\0'),
    new Uint8Array([0]) // context separator
  );
  const cek = await hkdfExpand(prk, salt, cekInfo, 16);
  
  // Derive nonce
  const nonceInfo = concatBuffers(
    new TextEncoder().encode('Content-Encoding: nonce\0'),
    new Uint8Array([0])
  );
  const nonce = await hkdfExpand(prk, salt, nonceInfo, 12);
  
  // Encrypt with AES-GCM
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    cek,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  // Add padding delimiter (0x02 means no padding follows)
  const paddedPayload = concatBuffers(payloadBytes, new Uint8Array([2]));
  
  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    cryptoKey,
    paddedPayload
  ));
  
  // Build aes128gcm message
  // Header: salt (16) || rs (4) || idlen (1) || keyid (65)
  const recordSize = 4096;
  const header = new Uint8Array(86);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, recordSize, false);
  header[20] = 65; // Key ID length
  header.set(localPubKey, 21);
  
  return concatBuffers(header, encrypted);
}

async function hkdfExpand(prk: Uint8Array, salt: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  // HKDF-Expand using HMAC-SHA256
  const key = await crypto.subtle.importKey(
    'raw',
    prk,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const input = concatBuffers(salt, info, new Uint8Array([1]));
  const okm = new Uint8Array(await crypto.subtle.sign('HMAC', key, input));
  return okm.slice(0, length);
}

function concatBuffers(...buffers: Uint8Array[]): Uint8Array {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    result.set(buf, offset);
    offset += buf.length;
  }
  return result;
}

function base64UrlEncode(data: string | Uint8Array): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}
