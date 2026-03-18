import { onRequest } from "firebase-functions/v2/https";

const DEFAULT_SYSTEM = "You are Professor Pax, a calm psychiatric training coach for Destiny Springs Healthcare staff. Keep replies under 120 words. If unsure or outside scope, recommend they ask their supervisor or leadership. Avoid PHI. Tone: supportive, concise.";

export const paxChat = onRequest({ cors: true, region: "us-central1", secrets:["OPENAI_API_KEY"] }, async (req, res) => {
  if (req.method !== "POST") {
    res.set("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.openai_apikey;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
  }

  const body = req.body || {};
  const sys = body.system || DEFAULT_SYSTEM;
  const msgs = Array.isArray(body.messages) ? body.messages : [];

  const payload = {
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: sys }, ...msgs.map(m => ({ role: m.role, content: m.content }))].slice(-9),
    temperature: 0.6,
    max_tokens: 256
  };

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: text || "LLM request failed" });
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "I might not have the answer here. Please check with your supervisor or leadership for the safest guidance.";
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "Upstream error", detail: String(e) });
  }
});
