export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY env var' });
  }

  const body = req.body || {};
  const system = body.system || 'You are Professor Vance, a calm, authoritative clinical mentor for psychiatric healthcare staff at Destiny Springs Healthcare. Keep replies under 120 words. If unsure or outside training scope, recommend the user ask their supervisor or clinical leadership. Never provide clinical orders or specific medication guidance. Avoid PHI. Tone: warm, concise, deeply supportive.';
  const messages = Array.isArray(body.messages) ? body.messages : [];

  // Gemini uses 'user' / 'model' roles (not 'assistant')
  // Messages must strictly alternate user → model. Normalize and cap at last 8.
  const normalized = messages
    .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content || '' }] }))
    .slice(-8);

  // Ensure the conversation starts with a user turn (Gemini requirement)
  const contents = normalized.length && normalized[0].role === 'user'
    ? normalized
    : [{ role: 'user', parts: [{ text: 'Hello' }] }, ...normalized];

  const payload = {
    system_instruction: { parts: [{ text: system }] },
    contents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 256,
      candidateCount: 1
    }
  };

  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({ error: text || 'LLM request failed' });
    }

    const data = await upstream.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      || 'I might not have the answer here. Please check with your supervisor or leadership for the safest guidance.';
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: 'Upstream error', detail: String(e) });
  }
}
