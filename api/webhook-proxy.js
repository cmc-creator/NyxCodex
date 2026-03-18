/**
 * DSH Training Platform — Outbound Webhook Proxy
 *
 * Proxies webhook calls server-side to:
 *   1. Sign the payload with HMAC-SHA256 (X-DSH-Signature header)
 *   2. Bypass browser CORS restrictions on arbitrary webhook endpoints
 *
 * Works with: Zapier, Make.com, Workato, n8n, ADP Webhooks,
 *             BambooHR Webhooks, Paycor API, UKG Webhooks, custom HR endpoints
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url, event, secret, body } = req.body || {};

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Missing or invalid webhook URL' });
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-DSH-Event': event || 'unknown',
      'X-DSH-Version': '1.0',
      'User-Agent': 'DSH-Training-Platform/1.0'
    };

    // HMAC-SHA256 signature (compatible with Zapier/GitHub-style verification)
    if (secret && body) {
      const encoder = new TextEncoder();
      const keyData  = encoder.encode(secret);
      const msgData  = encoder.encode(body);
      const cryptoKey = await crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      );
      const sigBuf = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
      const hex = Array.from(new Uint8Array(sigBuf))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      headers['X-DSH-Signature'] = `sha256=${hex}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
      // 8-second timeout — long enough for slow webhooks, won't hang the UI
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined
    });

    return res.status(200).json({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    });

  } catch (e) {
    // Return 200 with ok:false so the client gets a usable error message
    // instead of a 5xx that might get swallowed
    return res.status(200).json({ ok: false, error: e.message });
  }
}
