import { onRequest } from "firebase-functions/v2/https";

const DEFAULT_SYSTEM = "You are Professor Vance, a calm, authoritative clinical mentor for psychiatric healthcare staff at Destiny Springs Healthcare. Keep replies under 120 words. If unsure or outside training scope, recommend the user ask their supervisor or clinical leadership. Never provide clinical orders or specific medication guidance. Avoid PHI. Tone: warm, concise, deeply supportive.";

export const paxChat = onRequest({ cors: true, region: "us-central1", secrets:["GEMINI_API_KEY"] }, async (req, res) => {
  if (req.method !== "POST") {
    res.set("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  const body = req.body || {};
  const sys = body.system || DEFAULT_SYSTEM;
  const msgs = Array.isArray(body.messages) ? body.messages : [];

  // Gemini uses 'user' / 'model' roles — map and normalize
  const normalized = msgs
    .map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content || "" }] }))
    .slice(-8);
  const contents = normalized.length && normalized[0].role === "user"
    ? normalized
    : [{ role: "user", parts: [{ text: "Hello" }] }, ...normalized];

  const payload = {
    system_instruction: { parts: [{ text: sys }] },
    contents,
    generationConfig: { temperature: 0.6, maxOutputTokens: 256, candidateCount: 1 }
  };

  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: text || "LLM request failed" });
    }

    const data = await r.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      || "I might not have the answer here. Please check with your supervisor or leadership for the safest guidance.";
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "Upstream error", detail: String(e) });
  }
});
