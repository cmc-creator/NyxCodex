/**
 * DSH Training Platform — Web Push Notification Endpoint
 *
 * Handles two actions:
 *   subscribe  → acknowledges a new push subscription (client already wrote
 *                subscription to Firebase; this endpoint is a no-op hook for
 *                server-side logging / future server-managed lists)
 *   send       → sends a push notification to a single subscription object
 *                passed in the request body (used by admin reminder automation)
 *
 * Required Vercel environment variables:
 *   VAPID_PUBLIC_KEY   — generated via web-push generate-vapid-keys
 *   VAPID_PRIVATE_KEY  — as above
 *   VAPID_SUBJECT      — mailto:admin@yourorg.com or https://yourorg.com
 */
import webpush from 'web-push';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(503).json({ error: 'Push notifications not configured (missing VAPID keys)' });
  }

  webpush.setVapidDetails(
    VAPID_SUBJECT || 'mailto:admin@destinysprings.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );

  const { action, subscription, message, uid } = req.body || {};

  // ── subscribe ────────────────────────────────────────────────────────────
  if (action === 'subscribe') {
    // The client already persisted the subscription to Firebase.
    // Log receipt and return the VAPID public key for confirmation.
    console.log(`[push] New subscription registered for uid=${uid || 'unknown'}`);
    return res.status(200).json({ ok: true, vapidPublicKey: VAPID_PUBLIC_KEY });
  }

  // ── send ─────────────────────────────────────────────────────────────────
  if (action === 'send') {
    if (!subscription) {
      return res.status(400).json({ error: 'Missing subscription object' });
    }

    const payload = JSON.stringify({
      title: message?.title || 'Training Reminder — Destiny Springs',
      body:  message?.body  || 'Your annual de-escalation training is due soon. Complete it today.',
      icon:  message?.icon  || '/dsh.png',
      badge: message?.badge || '/dsh.png',
      url:   message?.url   || '/',
    });

    try {
      const sub = typeof subscription === 'string' ? JSON.parse(subscription) : subscription;
      await webpush.sendNotification(sub, payload);
      return res.status(200).json({ ok: true });
    } catch (err) {
      // 410 Gone = subscription expired / user unsubscribed — caller should
      // delete the stored subscription from Firebase
      if (err.statusCode === 410) {
        return res.status(410).json({ ok: false, expired: true, error: 'Subscription expired' });
      }
      console.error('[push] sendNotification error:', err.message);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
}
