/**
 * /api/stripe-webhook.js
 * Handles Stripe webhook events and updates Firebase subscription records.
 *
 * Events handled:
 *   checkout.session.completed  → activate subscription
 *   customer.subscription.deleted → cancel subscription
 *   customer.subscription.updated → update plan/status
 *   invoice.payment_failed      → mark past_due
 *
 * Required env vars (Vercel):
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET     (from Stripe dashboard → Webhooks)
 *   FIREBASE_DATABASE_URL     (e.g. https://your-project.firebaseio.com)
 *   FIREBASE_SERVICE_ACCOUNT  (base64-encoded service account JSON)
 */

export const config = {
  api: {
    bodyParser: false,  // Required: Stripe needs raw body for signature verification
  },
};

const SEAT_LIMITS = { small: 25, medium: 100, enterprise: -1 };

// Read raw request body as Buffer
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Verify Stripe webhook signature (manual — no stripe-node dependency)
async function verifyStripeSignature(rawBody, signature, secret) {
  const parts = signature.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    if (!acc[k]) acc[k] = [];
    acc[k].push(v);
    return acc;
  }, {});

  const timestamp = parts.t?.[0];
  const v1sigs = parts.v1 || [];

  if (!timestamp || v1sigs.length === 0) throw new Error('Invalid signature format');

  const tolerance = 300; // 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > tolerance) {
    throw new Error('Webhook timestamp too old');
  }

  const signedPayload = `${timestamp}.${rawBody.toString()}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(signedPayload);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const expectedSig = Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  const valid = v1sigs.some(sig => sig === expectedSig);
  if (!valid) throw new Error('Signature mismatch');
}

// Write to Firebase Realtime Database via REST API (no Admin SDK needed)
async function writeToFirebase(path, data, serviceAccountBase64, dbUrl) {
  // Decode service account for auth
  const sa = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));

  // Create a signed JWT for Firebase (service account → access token)
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email',
  };

  const encodeB64Url = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const headerB64 = encodeB64Url(header);
  const payloadB64 = encodeB64Url(payload);
  const unsigned = `${headerB64}.${payloadB64}`;

  // Sign with RS256 using the private key
  const pemKey = sa.private_key;
  const keyBuffer = pemToArrayBuffer(pemKey);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );
  const sigBuffer = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    cryptoKey,
    new TextEncoder().encode(unsigned)
  );
  const sig = Buffer.from(sigBuffer).toString('base64url');
  const jwt = `${unsigned}.${sig}`;

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth2:grant_type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!tokenRes.ok) {
    const e = await tokenRes.text();
    throw new Error(`Token exchange failed: ${e}`);
  }
  const { access_token } = await tokenRes.json();

  // Write data via REST PATCH (merge, not overwrite)
  const url = `${dbUrl}/${path}.json?access_token=${access_token}`;
  const writeRes = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!writeRes.ok) {
    const e = await writeRes.text();
    throw new Error(`Firebase write failed: ${e}`);
  }
  return writeRes.json();
}

// Convert PEM private key to ArrayBuffer
function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  return Buffer.from(b64, 'base64');
}

// Map Stripe price ID to plan info
function getPlanFromPriceId(priceId) {
  const priceMap = {
    [process.env.STRIPE_PRICE_SMALL]:      { plan: 'small',      seatsMax: 25  },
    [process.env.STRIPE_PRICE_MEDIUM]:     { plan: 'medium',     seatsMax: 100 },
    [process.env.STRIPE_PRICE_ENTERPRISE]: { plan: 'enterprise', seatsMax: -1  },
  };
  return priceMap[priceId] || { plan: 'unknown', seatsMax: 25 };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  const dbUrl = process.env.FIREBASE_DATABASE_URL;

  if (!webhookSecret || !serviceAccount || !dbUrl) {
    console.error('Missing env vars: STRIPE_WEBHOOK_SECRET, FIREBASE_SERVICE_ACCOUNT, or FIREBASE_DATABASE_URL');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    return res.status(400).json({ error: 'Cannot read body' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) return res.status(400).json({ error: 'Missing stripe-signature header' });

  try {
    await verifyStripeSignature(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  console.log(`Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orgId = session.metadata?.orgId;
        if (!orgId) { console.warn('No orgId in session metadata'); break; }

        // Retrieve subscription details
        const subId = session.subscription;
        let planInfo = { plan: session.metadata?.planId || 'small', seatsMax: SEAT_LIMITS[session.metadata?.planId] || 25 };
        let currentPeriodEnd = null;

        if (subId) {
          const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subId}`, {
            headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` },
          });
          if (subRes.ok) {
            const sub = await subRes.json();
            const priceId = sub.items?.data?.[0]?.price?.id;
            if (priceId) planInfo = getPlanFromPriceId(priceId);
            currentPeriodEnd = sub.current_period_end;
          }
        }

        const subRecord = {
          status: 'active',
          plan: planInfo.plan,
          seatsMax: planInfo.seatsMax,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: subId,
          currentPeriodEnd: currentPeriodEnd,
          orgName: session.metadata?.orgName || '',
          adminEmail: session.metadata?.adminEmail || session.customer_details?.email || '',
          activatedAt: Math.floor(Date.now() / 1000),
        };

        await writeToFirebase(`orgs/${orgId}/subscription`, subRecord, serviceAccount, dbUrl);
        console.log(`Activated subscription for org: ${orgId}, plan: ${planInfo.plan}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const orgId = sub.metadata?.orgId;
        if (!orgId) { console.warn('No orgId in subscription metadata'); break; }

        await writeToFirebase(`orgs/${orgId}/subscription`, {
          status: 'canceled',
          canceledAt: Math.floor(Date.now() / 1000),
        }, serviceAccount, dbUrl);
        console.log(`Canceled subscription for org: ${orgId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const orgId = sub.metadata?.orgId;
        if (!orgId) { console.warn('No orgId in subscription metadata'); break; }

        const priceId = sub.items?.data?.[0]?.price?.id;
        const planInfo = getPlanFromPriceId(priceId);

        await writeToFirebase(`orgs/${orgId}/subscription`, {
          status: sub.status === 'active' ? 'active' : sub.status,
          plan: planInfo.plan,
          seatsMax: planInfo.seatsMax,
          currentPeriodEnd: sub.current_period_end,
        }, serviceAccount, dbUrl);
        console.log(`Updated subscription for org: ${orgId}, status: ${sub.status}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subId = invoice.subscription;
        if (!subId) break;

        // Get orgId from subscription metadata
        const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subId}`, {
          headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` },
        });
        if (subRes.ok) {
          const sub = await subRes.json();
          const orgId = sub.metadata?.orgId;
          if (orgId) {
            await writeToFirebase(`orgs/${orgId}/subscription`, {
              status: 'past_due',
            }, serviceAccount, dbUrl);
            console.log(`Marked past_due for org: ${orgId}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Handler failed' });
  }

  return res.status(200).json({ received: true });
}
