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

    let content = ''
    let title = 'Website'

    // Try Firecrawl first
    try {
      const scrapeResult = await firecrawl.scrapeUrl(url, {
        formats: ['markdown'],
        waitFor: 2000,
      })
      if (scrapeResult.success) {
        content = scrapeResult.markdown || scrapeResult.content || ''
        title = scrapeResult.metadata?.title || 'Website'
      }
    } catch (e) {
      console.warn('Firecrawl failed, falling back to direct fetch:', e.message)
    }

    // Fallback: direct fetch if Firecrawl got nothing
    if (!content) {
      try {
        const fallbackRes = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' }
        })
        const html = await fallbackRes.text()
        // Extract text content from HTML
        content = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        if (titleMatch) title = titleMatch[1].trim()
      } catch (e) {
        console.warn('Direct fetch also failed:', e.message)
      }
    }

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
