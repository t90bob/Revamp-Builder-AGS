import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import Anthropic from '@anthropic-ai/sdk'
import { analyzeData } from './_analyzeData.js'
import { buildDashboardHtml } from './_buildDashboard.js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export function buildDataSummary(analysis, fileName) {
  const sampleRows = analysis.rowCount > 5 ? 5 : analysis.rowCount
  return `File: ${fileName}
Rows: ${analysis.rowCount}
Columns: ${analysis.headers.join(', ')}

Column types:
${analysis.headers.map(h => `- ${h}: ${analysis.columns[h].type}${analysis.columns[h].type === 'numeric' ? ` (min: ${analysis.columns[h].min?.toFixed(2)}, max: ${analysis.columns[h].max?.toFixed(2)}, avg: ${analysis.columns[h].avg?.toFixed(2)}, total: ${analysis.columns[h].sum?.toFixed(2)})` : ` (${analysis.columns[h].uniqueCount} unique values)`}`).join('\n')}

Key metrics:
${analysis.kpis.map(k => `- ${k.label}: ${k.value}`).join('\n')}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { fileData, fileName, dashboardType, density, theme, showKpis, prompt } = req.body
  if (!fileData) return res.status(400).json({ error: 'File data is required' })

  try {
    const buffer = Buffer.from(fileData, 'base64')
    const ext = fileName?.split('.').pop()?.toLowerCase()

    let rows = []
    if (ext === 'csv') {
      const text = buffer.toString('utf-8')
      rows = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: false }).data
    } else if (ext === 'xlsx' || ext === 'xls') {
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use CSV or Excel.' })
    }

    if (!rows.length) return res.status(400).json({ error: 'No data found in file' })

    const analysis = analyzeData(rows)
    const dataSummary = buildDataSummary(analysis, fileName)
    const htmlContent = buildDashboardHtml({ analysis, dashboardType, density, theme, showKpis })

    // Get Claude's initial analysis
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are an expert data analyst. Analyze the provided dataset and give a sharp, useful initial analysis. Be direct and specific — point out the most important insights, trends, and anomalies. Format your response in short paragraphs, no bullet points. Keep it under 200 words.`,
      messages: [{
        role: 'user',
        content: `Analyze this dataset and tell me what's most important:\n\n${dataSummary}${prompt ? `\n\nFocus on: ${prompt}` : ''}`,
      }],
    })

    res.json({
      htmlContent,
      dataSummary,
      initialAnalysis: claudeResponse.content[0].text,
      analysis: { rowCount: analysis.rowCount, headers: analysis.headers, chartCount: analysis.charts.length },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
