const fetch = require('node-fetch');

export default async function handler(req, res) {
  // Obsługa CORS – wymagane dla Webflow!
  res.setHeader('Access-Control-Allow-Origin', '*'); // możesz ograniczyć domenę jak chcesz
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Obsłuż zapytanie OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Only POST allowed' });
    return;
  }

  // UWAGA: w Vercel/Next API czasem req.body nie jest sparsowany! 
  // Jeśli masz błędy z body = undefined, dodaj:  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { message } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  if (!message) {
    res.status(400).json({ error: 'No message provided' });
    return;
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: 'No API key' });
    return;
  }

  try {
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: "user", content: message }],
        max_tokens: 80,
        temperature: 0.7,
      })
    });
    const data = await apiRes.json();
    const content = data.choices?.[0]?.message?.content || "AI error";
    res.status(200).json({ text: content });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch from OpenAI", detail: e.message });
  }
}
