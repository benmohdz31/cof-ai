export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  try {
    const { messages, system } = req.body;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          { role: "system", content: system },
          ...messages
        ],
      }),
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch(e) { return res.status(500).json({ error: "Reponse invalide: " + text.slice(0,200) }); }
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Erreur: " + response.status });
    }
    const content = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ content: [{ type: "text", text: content }] });
  } catch(e) {
    return res.status(500).json({ error: e.message || "Erreur inconnue" });
  }
}
