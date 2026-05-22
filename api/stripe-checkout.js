/**
 * /api/stripe-checkout.js
 * Creates a Stripe Checkout session for a new org subscription.
 *
 * POST body: { orgId, orgName, adminEmail, planId }
 *   planId: "small" | "medium" | "enterprise"
 *
 * Returns: { sessionUrl }
 *
 * Required env vars (Vercel):
 *   STRIPE_SECRET_KEY
 *   STRIPE_PRICE_SMALL   (Stripe Price ID for $199/mo plan)
 *   STRIPE_PRICE_MEDIUM  (Stripe Price ID for $499/mo plan)
 *   STRIPE_PRICE_ENTERPRISE (Stripe Price ID for $999/mo plan)
 *   NEXT_PUBLIC_BASE_URL or BASE_URL  (e.g. https://nyxcodex.com)
 */

const PLAN_PRICES = {
  small:      process.env.STRIPE_PRICE_SMALL,
  medium:     process.env.STRIPE_PRICE_MEDIUM,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

const SEAT_LIMITS = {
  small:      25,
  medium:     100,
  enterprise: -1,
};

const PLAN_NAMES = {
  small:      'NyxCodex Small (up to 25 seats)',
  medium:     'NyxCodex Medium (up to 100 seats)',
  enterprise: 'NyxCodex Enterprise (unlimited seats)',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(500).json({ error: 'Stripe not configured' });

  const { orgId, orgName, adminEmail, planId } = req.body || {};

  if (!orgId || !orgName || !adminEmail || !planId) {
    return res.status(400).json({ error: 'orgId, orgName, adminEmail, planId are required' });
  }

  if (!PLAN_PRICES[planId]) {
    return res.status(400).json({ error: 'Invalid planId. Must be small, medium, or enterprise' });
  }

  const priceId = PLAN_PRICES[planId];
  if (!priceId) {
    return res.status(500).json({ error: `Stripe price not configured for plan: ${planId}` });
  }

  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://nyxcodex.com';

  // Sanitize orgId: lowercase, alphanumeric + hyphens only
  const safeOrgId = orgId.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 40);

  try {
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'customer_email': adminEmail,
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'success_url': `${baseUrl}/trainer_pro.html?checkout=success&orgId=${encodeURIComponent(safeOrgId)}`,
        'cancel_url': `${baseUrl}/?checkout=canceled`,
        'subscription_data[metadata][orgId]': safeOrgId,
        'subscription_data[metadata][orgName]': orgName,
        'subscription_data[metadata][planId]': planId,
        'subscription_data[metadata][seatsMax]': String(SEAT_LIMITS[planId]),
        'metadata[orgId]': safeOrgId,
        'metadata[orgName]': orgName,
        'metadata[planId]': planId,
        'metadata[adminEmail]': adminEmail,
      }).toString(),
    });

    if (!stripeRes.ok) {
      const err = await stripeRes.json();
      console.error('Stripe checkout error:', err);
      return res.status(502).json({ error: 'Stripe error', detail: err?.error?.message });
    }

    const session = await stripeRes.json();
    return res.status(200).json({ sessionUrl: session.url, sessionId: session.id });
  } catch (err) {
    console.error('stripe-checkout exception:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
