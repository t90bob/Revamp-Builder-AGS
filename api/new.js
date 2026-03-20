import { Stitch, StitchToolClient } from '@google/stitch-sdk'
import { injectLogo } from './_utils.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { businessName, businessDesc, prompt, logoDataUrl, deviceType, pages } = req.body
  if (!businessName) return res.status(400).json({ error: 'Business name is required' })

  try {
    const stitchClient = new StitchToolClient({ apiKey: process.env.STITCH_API_KEY })
    const stitch = new Stitch(stitchClient)

    const pageList = pages?.length ? pages.join(', ') : 'Home'
    const stitchPrompt = `Design a brand new, modern, professional website for the following business.

Business name: ${businessName}
${businessDesc ? `Description: ${businessDesc}` : ''}
Pages to design: ${pageList}

${prompt ? `Additional instructions: ${prompt}` : ''}

Create a full, beautiful ${(deviceType || 'DESKTOP').toLowerCase()} website design with all the sections a real business site would have.`

    const project = await stitch.createProject(`New Site: ${businessName}`)
    const screen = await project.generate(stitchPrompt, deviceType || 'DESKTOP')

    const htmlUrl = await screen.getHtml()
    const imageUrl = await screen.getImage()
    const htmlRes = await fetch(htmlUrl)
    const htmlContent = injectLogo(await htmlRes.text(), logoDataUrl)

    res.json({ htmlContent, imageUrl, projectId: project.projectId, screenId: screen.screenId, title: businessName })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
