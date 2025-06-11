export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Only POST allowed' });
    return;
  }
  let message;
  try {
    message = req.body?.message || (await req.json())?.message;
  } catch (e) {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }
  if (!message) {
    res.status(400).json({ error: 'No message provided' });
    return;
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: "user", content: message }],
      max_tokens: 40,
      temperature: 0.7,
    })
  });
  const data = await apiRes.json();
  const content = data.choices?.[0]?.message?.content || "AI error";
  res.status(200).json({ text: content });
}
