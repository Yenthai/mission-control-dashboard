import OpenAI from 'openai'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const message = req.body?.message?.trim()

  if (!message) {
    return res.status(400).json({ error: 'message krävs' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY saknas på serversidan' })
  }

  try {
    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: 'Du är en varm, enkel och hjälpsam AI-assistent i en dashboard. Svara kort, tydligt och pedagogiskt på svenska.',
            },
          ],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: message }],
        },
      ],
    })

    const reply = response.output_text?.trim() || 'Jag kunde inte formulera ett svar just nu.'
    return res.status(200).json({ reply })
  } catch (error) {
    console.error('Chat API error', error)
    return res.status(500).json({ error: 'Kunde inte hämta svar från OpenAI' })
  }
}
