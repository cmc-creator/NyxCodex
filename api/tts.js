export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing ELEVENLABS_API_KEY env var' });

  const { text } = req.body || {};
  if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text required' });

  // Strip HTML tags, collapse whitespace, cap at 500 chars for budget control
  const clean = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 500);

  // Voice ID can be overridden via env var; default = Josh (calm, professional male)
  // Use voice set in Vercel env, fallback to Professor Vance (custom)
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'NFG5qt843uXKj4pFvR7C';

  try {
    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: clean,
        model_id: 'eleven_turbo_v2_5',   // cheapest + fastest model
        voice_settings: {
          stability: 0.58,
          similarity_boost: 0.78,
          style: 0.18,
          use_speaker_boost: true
        }
      })
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('ElevenLabs error:', upstream.status, errText);
      return res.status(upstream.status).json({ error: `ElevenLabs: ${upstream.status}` });
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Length', buf.length);
    res.send(buf);
  } catch (e) {
    console.error('TTS handler error:', e);
    res.status(500).json({ error: e.message });
  }
}
