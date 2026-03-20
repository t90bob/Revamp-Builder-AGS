import { Stitch, StitchToolClient } from '@google/stitch-sdk'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { projectId, screenId, prompt } = req.body
  if (!projectId || !screenId || !prompt) return res.status(400).json({ error: 'projectId, screenId and prompt required' })

  try {
    const stitchClient = new StitchToolClient({ apiKey: process.env.STITCH_API_KEY })
    const stitch = new Stitch(stitchClient)

    const project = stitch.project(projectId)
    const screen = await project.getScreen(screenId)
    const edited = await screen.edit(prompt)

    const htmlUrl = await edited.getHtml()
    const imageUrl = await edited.getImage()
    const htmlRes = await fetch(htmlUrl)
    const htmlContent = await htmlRes.text()

    res.json({ htmlContent, imageUrl, screenId: edited.screenId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
