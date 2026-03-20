/**
 * Analyzes parsed CSV/Excel rows and returns insights for dashboard generation.
 */
export function analyzeData(rows) {
  if (!rows.length) return null

  const headers = Object.keys(rows[0])
  const columns = {}

  for (const header of headers) {
    const values = rows.map(r => r[header]).filter(v => v !== null && v !== undefined && v !== '')
    const numeric = values.filter(v => !isNaN(parseFloat(v)) && isFinite(v))
    const dates = values.filter(v => !isNaN(Date.parse(v)) && isNaN(parseFloat(v)))
    const isNumeric = numeric.length / values.length > 0.8
    const isDate = dates.length / values.length > 0.8

    columns[header] = {
      type: isDate ? 'date' : isNumeric ? 'numeric' : 'categorical',
      uniqueCount: new Set(values).size,
      sample: values.slice(0, 5),
      ...(isNumeric && {
        min: Math.min(...numeric.map(Number)),
        max: Math.max(...numeric.map(Number)),
        sum: numeric.reduce((a, b) => a + Number(b), 0),
        avg: numeric.reduce((a, b) => a + Number(b), 0) / numeric.length,
      }),
    }
  }

  const numericCols = headers.filter(h => columns[h].type === 'numeric')
  const dateCols = headers.filter(h => columns[h].type === 'date')
  const categoricalCols = headers.filter(h => columns[h].type === 'categorical')

  // Build KPI cards from numeric columns
  const kpis = numericCols.slice(0, 4).map(col => ({
    label: col,
    value: columns[col].sum?.toLocaleString() ?? columns[col].avg?.toFixed(2),
    type: 'sum',
  }))

  // Build chart suggestions
  const charts = []

  if (dateCols.length && numericCols.length) {
    charts.push({
      type: 'line',
      label: `${numericCols[0]} over time`,
      xCol: dateCols[0],
      yCol: numericCols[0],
      data: buildTimeSeriesData(rows, dateCols[0], numericCols[0]),
    })
  }

  if (categoricalCols.length && numericCols.length) {
    const catCol = categoricalCols[0]
    const numCol = numericCols[0]
    charts.push({
      type: 'bar',
      label: `${numCol} by ${catCol}`,
      data: buildGroupedData(rows, catCol, numCol),
    })
  }

  if (numericCols.length >= 2) {
    charts.push({
      type: 'bar',
      label: `${numericCols[1]} by ${categoricalCols[0] || 'category'}`,
      data: categoricalCols.length
        ? buildGroupedData(rows, categoricalCols[0], numericCols[1])
        : { labels: numericCols.slice(0, 6), values: numericCols.slice(0, 6).map(c => columns[c].avg) },
    })
  }

  if (categoricalCols.length) {
    const catCol = categoricalCols[0]
    const countMap = {}
    rows.forEach(r => { const v = r[catCol]; countMap[v] = (countMap[v] || 0) + 1 })
    const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
    charts.push({
      type: 'pie',
      label: `Distribution of ${catCol}`,
      data: { labels: sorted.map(([k]) => k), values: sorted.map(([, v]) => v) },
    })
  }

  return { headers, columns, numericCols, dateCols, categoricalCols, kpis, charts, rowCount: rows.length }
}

function buildTimeSeriesData(rows, dateCol, numCol) {
  const map = {}
  rows.forEach(r => {
    const d = r[dateCol]?.substring(0, 10)
    if (!d) return
    map[d] = (map[d] || 0) + Number(r[numCol] || 0)
  })
  const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(0, 30)
  return { labels: sorted.map(([k]) => k), values: sorted.map(([, v]) => v) }
}

function buildGroupedData(rows, catCol, numCol) {
  const map = {}
  rows.forEach(r => {
    const k = r[catCol]
    map[k] = (map[k] || 0) + Number(r[numCol] || 0)
  })
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10)
  return { labels: sorted.map(([k]) => k), values: sorted.map(([, v]) => parseFloat(v.toFixed(2))) }
}
