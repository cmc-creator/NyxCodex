/**
 * POST /api/whisper
 * Body: { audio: "<base64 string>", mimeType?: "audio/webm" }
 * Returns: { text: "transcribed text" }
 *
 * Requires OPENAI_API_KEY environment variable (Vercel project settings).
 */
export default async function handler(req, res) {
  // CORS — allow same origin and GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });

  const { audio, mimeType } = req.body || {};
  if (!audio || typeof audio !== 'string') {
    return res.status(400).json({ error: 'audio (base64) required' });
  }

  // Enforce reasonable size limit: ~3MB base64 ≈ ~2.25MB audio ≈ ~2.5 min at 128kbps
  if (audio.length > 4_000_000) {
    return res.status(413).json({ error: 'Audio too large. Max ~3 MB.' });
  }

  try {
    const audioBuffer = Buffer.from(audio, 'base64');
    const ext = (mimeType || 'audio/webm').includes('mp4') ? 'mp4'
              : (mimeType || '').includes('ogg') ? 'ogg' : 'webm';

    // Build multipart request for OpenAI Whisper
    const form = new FormData();
    form.append('file', new Blob([audioBuffer], { type: mimeType || 'audio/webm' }), `recording.${ext}`);
    form.append('model', 'whisper-1');
    form.append('language', 'en');

    const upstream = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('Whisper API error:', upstream.status, errText);
      return res.status(502).json({ error: 'Transcription service error', detail: upstream.status });
    }

    const data = await upstream.json();
    return res.status(200).json({ text: data.text || '' });

  } catch (err) {
    console.error('whisper handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
