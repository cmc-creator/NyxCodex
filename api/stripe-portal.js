/**
 * /api/stripe-portal.js
 * Creates a Stripe Customer Portal session for subscription management.
 *
 * POST body: { stripeCustomerId, returnUrl }
 * Returns: { portalUrl }
 *
 * Required env vars (Vercel):
 *   STRIPE_SECRET_KEY
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(500).json({ error: 'Stripe not configured' });

  const { stripeCustomerId, returnUrl } = req.body || {};

  if (!stripeCustomerId) {
    return res.status(400).json({ error: 'stripeCustomerId is required' });
  }

  const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://nyxcodex.com';
  const safeReturnUrl = returnUrl || `${baseUrl}/trainer_pro.html`;

  try {
    const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: stripeCustomerId,
        return_url: safeReturnUrl,
      }).toString(),
    });

    if (!portalRes.ok) {
      const err = await portalRes.json();
      console.error('Stripe portal error:', err);
      return res.status(502).json({ error: 'Stripe error', detail: err?.error?.message });
    }

    const portal = await portalRes.json();
    return res.status(200).json({ portalUrl: portal.url });
  } catch (err) {
    console.error('stripe-portal exception:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
