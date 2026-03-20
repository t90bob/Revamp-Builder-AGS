import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { analyzeData } from './_analyzeData.js'
import { buildDashboardHtml } from './_buildDashboard.js'
import { Stitch, StitchToolClient } from '@google/stitch-sdk'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { fileData, fileName, dashboardType, chartPreference, timeGranularity, showKpis, density, theme, prompt } = req.body
  if (!fileData) return res.status(400).json({ error: 'File data is required' })

  try {
    // Decode base64 file
    const buffer = Buffer.from(fileData, 'base64')
    const ext = fileName?.split('.').pop()?.toLowerCase()

    let rows = []
    if (ext === 'csv') {
      const text = buffer.toString('utf-8')
      const result = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: false })
      rows = result.data
    } else if (ext === 'xlsx' || ext === 'xls') {
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use CSV or Excel.' })
    }

    if (!rows.length) return res.status(400).json({ error: 'No data found in file' })

    // Analyze the data
    const analysis = analyzeData(rows)

    // Build functional dashboard HTML with Chart.js
    const htmlContent = buildDashboardHtml({ analysis, dashboardType, density, theme, showKpis })

    // Generate a visual design with Stitch for the image preview
    let imageUrl = null
    try {
      const stitchClient = new StitchToolClient({ apiKey: process.env.STITCH_API_KEY })
      const stitch = new Stitch(stitchClient)

      const stitchPrompt = `Design a professional ${dashboardType} analytics dashboard UI.
Data summary: ${analysis.rowCount} rows, columns: ${analysis.headers.join(', ')}.
Key metrics: ${analysis.kpis.map(k => `${k.label}: ${k.value}`).join(', ')}.
Charts: ${analysis.charts.map(c => `${c.type} chart for ${c.label}`).join(', ')}.
Theme: ${theme}. Layout: ${density}. Show KPI cards: ${showKpis}.
${prompt ? `Additional: ${prompt}` : ''}
Create a clean, data-focused dashboard with KPI cards at the top, charts below.`

      const project = await stitch.createProject(`Dashboard: ${dashboardType}`)
      const screen = await project.generate(stitchPrompt, 'DESKTOP')
      imageUrl = await screen.getImage()
    } catch (e) {
      console.warn('Stitch preview failed:', e.message)
    }

    res.json({ htmlContent, imageUrl, analysis: { rowCount: analysis.rowCount, headers: analysis.headers, chartCount: analysis.charts.length } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
