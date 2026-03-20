import { FirecrawlAppV1 as FirecrawlApp } from '@mendable/firecrawl-js'
import { Stitch, StitchToolClient } from '@google/stitch-sdk'
import { injectLogo } from './_utils.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { url, prompt, logoDataUrl, deviceType } = req.body
  if (!url) return res.status(400).json({ error: 'URL is required' })

  try {
    const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })
    const stitchClient = new StitchToolClient({ apiKey: process.env.STITCH_API_KEY })
    const stitch = new Stitch(stitchClient)

    const scrapeResult = await firecrawl.scrapeUrl(url, { formats: ['markdown'] })
    if (!scrapeResult.success) return res.status(500).json({ error: 'Failed to scrape URL' })

    const content = scrapeResult.markdown || scrapeResult.content || ''
    const title = scrapeResult.metadata?.title || 'Website'

    const stitchPrompt = `Revamp this website as a modern, clean, professional design.

Website title: ${title}
Website URL: ${url}

Content:
${content.slice(0, 3000)}

${prompt ? `Additional instructions: ${prompt}` : ''}
${logoDataUrl ? 'A custom logo image has been provided — include a prominent logo placement in the header.' : ''}

Create a full, beautiful desktop website design.`

    const project = await stitch.createProject(`Revamp: ${title}`)
    const screen = await project.generate(stitchPrompt, deviceType || 'DESKTOP')

    const htmlUrl = await screen.getHtml()
    const imageUrl = await screen.getImage()
    const htmlRes = await fetch(htmlUrl)
    const htmlContent = injectLogo(await htmlRes.text(), logoDataUrl)

    res.json({ htmlContent, imageUrl, projectId: project.projectId, screenId: screen.screenId, title })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
