import { Stitch, StitchToolClient } from '@google/stitch-sdk'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { projectId, screenId } = req.body
  if (!projectId || !screenId) return res.status(400).json({ error: 'projectId and screenId required' })

  try {
    const stitchClient = new StitchToolClient({ apiKey: process.env.STITCH_API_KEY })
    const stitch = new Stitch(stitchClient)

    const project = stitch.project(projectId)
    const screen = await project.getScreen(screenId)
    const variants = await screen.variants('Regenerate with a fresh modern design', {
      variantCount: 1,
      creativeRange: 'REIMAGINE',
    })

    const newScreen = variants[0]
    const htmlUrl = await newScreen.getHtml()
    const imageUrl = await newScreen.getImage()
    const htmlRes = await fetch(htmlUrl)
    const htmlContent = await htmlRes.text()

    res.json({ htmlContent, imageUrl, screenId: newScreen.screenId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
