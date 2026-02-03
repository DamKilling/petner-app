import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("DEEPSEEK_API_KEY environment variable is required. Please set it in Vercel project settings.");

    const { petType, messages } = req.body;
    const lastMsg = messages?.[messages.length - 1]?.text || "Hello";

    const systemInstruction = 
      `You are a comforting AI companion, speaking as a beloved ${petType || 'pet'} who has passed away. Provide emotional support and speak naturally.`;

    const payload = {
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: lastMsg }
      ]
    };

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "No response.";

    return res.status(200).json({ text });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
