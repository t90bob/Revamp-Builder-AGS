import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { FirecrawlAppV1 as FirecrawlApp } from '@mendable/firecrawl-js'
import { Stitch, StitchToolClient } from '@google/stitch-sdk'

const app = express()
app.use(cors())
app.use(express.json())

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })
const stitchClient = new StitchToolClient({ apiKey: process.env.STITCH_API_KEY })
const stitch = new Stitch(stitchClient)

// Inject logo into generated HTML
function injectLogo(html, logoDataUrl) {
  if (!logoDataUrl) return html
  const logoTag = `<img src="${logoDataUrl}" alt="Logo" style="height:48px;object-fit:contain;display:block;" />`
  // Try to insert after opening <header> or <nav>, otherwise prepend to <body>
  if (html.includes('<header')) {
    return html.replace(/(<header[^>]*>)/, `$1\n  ${logoTag}`)
  }
  if (html.includes('<nav')) {
    return html.replace(/(<nav[^>]*>)/, `$1\n  ${logoTag}`)
  }
  return html.replace('<body>', `<body>\n  ${logoTag}`)
}

// Scrape + generate
app.post('/api/revamp', async (req, res) => {
  const { url, prompt, logoDataUrl, deviceType } = req.body
  if (!url) return res.status(400).json({ error: 'URL is required' })

  try {
    // Scrape the website
    console.log('Scraping:', url)
    const scrapeResult = await firecrawl.scrapeUrl(url, {
      formats: ['markdown'],
    })

    if (!scrapeResult.success) {
      return res.status(500).json({ error: 'Failed to scrape URL' })
    }

    const content = scrapeResult.markdown || scrapeResult.content || ''
    const title = scrapeResult.metadata?.title || 'Website'

    // Build the Stitch prompt
    const stitchPrompt = `Revamp this website as a modern, clean, professional design.

Website title: ${title}
Website URL: ${url}

Content:
${content.slice(0, 3000)}

${prompt ? `Additional instructions: ${prompt}` : ''}
${logoDataUrl ? 'A custom logo image has been provided — include a prominent logo placement in the header.' : ''}

Create a full, beautiful desktop website design.`

    // Generate with Stitch
    console.log('Generating with Stitch...')
    const project = await stitch.createProject(`Revamp: ${title}`)
    const screen = await project.generate(stitchPrompt, deviceType || 'DESKTOP')

    const htmlUrl = await screen.getHtml()
    const imageUrl = await screen.getImage()

    // Fetch actual HTML content so the frontend can render it directly
    const htmlRes = await fetch(htmlUrl)
    const htmlContent = injectLogo(await htmlRes.text(), logoDataUrl)

    res.json({
      htmlContent,
      imageUrl,
      projectId: project.projectId,
      screenId: screen.screenId,
      title,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Edit existing screen
app.post('/api/edit', async (req, res) => {
  const { projectId, screenId, prompt } = req.body
  if (!projectId || !screenId || !prompt) {
    return res.status(400).json({ error: 'projectId, screenId and prompt required' })
  }

  try {
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
})

// Regenerate (new variant)
app.post('/api/regenerate', async (req, res) => {
  const { projectId, screenId } = req.body
  if (!projectId || !screenId) {
    return res.status(400).json({ error: 'projectId and screenId required' })
  }

  try {
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
})

// Build brand new site
app.post('/api/new', async (req, res) => {
  const { businessName, businessDesc, prompt, logoDataUrl, deviceType, pages } = req.body
  if (!businessName) return res.status(400).json({ error: 'Business name is required' })

  try {
    const pageList = pages?.length ? pages.join(', ') : 'Home'
    const stitchPrompt = `Design a brand new, modern, professional website for the following business.

Business name: ${businessName}
${businessDesc ? `Description: ${businessDesc}` : ''}
Pages to design: ${pageList}

${prompt ? `Additional instructions: ${prompt}` : ''}

Create a full, beautiful ${(deviceType || 'DESKTOP').toLowerCase()} website design with all the sections a real business site would have.`

    console.log('Generating new site with Stitch...')
    const project = await stitch.createProject(`New Site: ${businessName}`)
    const screen = await project.generate(stitchPrompt, deviceType || 'DESKTOP')

    const htmlUrl = await screen.getHtml()
    const imageUrl = await screen.getImage()
    const htmlRes = await fetch(htmlUrl)
    const htmlContent = injectLogo(await htmlRes.text(), logoDataUrl)

    res.json({
      htmlContent,
      imageUrl,
      projectId: project.projectId,
      screenId: screen.screenId,
      title: businessName,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

const PORT = 3001
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
