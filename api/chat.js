import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages, dataSummary } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'Messages required' })

  try {
    const systemPrompt = `You are an expert data analyst AI. You have been given a dataset and your job is to help the user understand and get value from their data.

${dataSummary ? `Here is a summary of the dataset you are working with:\n\n${dataSummary}` : ''}

Guidelines:
- Give clear, actionable insights based on the actual data
- Point out trends, anomalies, and patterns
- Make specific recommendations the user can act on
- When referencing numbers, be precise
- Keep responses concise but thorough
- If asked something you can't answer from the data, say so clearly`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })

    res.json({ reply: response.content[0].text })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
