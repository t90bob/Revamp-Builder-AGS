const CHART_COLORS = [
  '#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e',
  '#8b5cf6', '#3b82f6', '#84cc16', '#fb923c', '#e879f9'
]

export function buildDashboardHtml({ analysis, dashboardType, density, theme, showKpis }) {
  const dark = theme === 'dark'
  const bg = dark ? '#0f172a' : '#f1f5f9'
  const surface = dark ? '#1e293b' : '#ffffff'
  const text = dark ? '#f1f5f9' : '#0f172a'
  const subtext = dark ? '#94a3b8' : '#64748b'
  const border = dark ? '#334155' : '#e2e8f0'
  const compact = density === 'compact'

  const kpiHtml = showKpis && analysis.kpis.length ? `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:${compact ? '12px' : '16px'};margin-bottom:${compact ? '16px' : '24px'}">
      ${analysis.kpis.map(k => `
        <div style="background:${surface};border:1px solid ${border};border-radius:12px;padding:${compact ? '16px' : '20px'}">
          <div style="font-size:12px;color:${subtext};margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em">${k.label}</div>
          <div style="font-size:${compact ? '22px' : '28px'};font-weight:700;color:${text}">${k.value}</div>
        </div>
      `).join('')}
    </div>` : ''

  const chartHtml = analysis.charts.map((chart, i) => `
    <div style="background:${surface};border:1px solid ${border};border-radius:12px;padding:${compact ? '16px' : '20px'}">
      <div style="font-size:14px;font-weight:600;color:${text};margin-bottom:12px">${chart.label}</div>
      <canvas id="chart${i}" style="max-height:260px"></canvas>
    </div>`).join('')

  const chartScripts = analysis.charts.map((chart, i) => {
    const labels = JSON.stringify(chart.data.labels)
    const values = JSON.stringify(chart.data.values)
    const color = CHART_COLORS[i % CHART_COLORS.length]
    const gridColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
    const textColor = dark ? '#94a3b8' : '#64748b'

    if (chart.type === 'pie') {
      return `
        new Chart(document.getElementById('chart${i}'), {
          type: 'doughnut',
          data: { labels: ${labels}, datasets: [{ data: ${values}, backgroundColor: ${JSON.stringify(CHART_COLORS.slice(0, chart.data.labels.length))}, borderWidth: 0 }] },
          options: { plugins: { legend: { position: 'right', labels: { color: '${textColor}', font: { size: 12 } } } } }
        });`
    }

    return `
      new Chart(document.getElementById('chart${i}'), {
        type: '${chart.type}',
        data: { labels: ${labels}, datasets: [{ label: '${chart.label}', data: ${values}, backgroundColor: '${color}22', borderColor: '${color}', borderWidth: 2, fill: ${chart.type === 'line'}, tension: 0.4, pointRadius: 3 }] },
        options: {
          responsive: true, maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: { x: { grid: { color: '${gridColor}' }, ticks: { color: '${textColor}', maxRotation: 45, font: { size: 11 } } }, y: { grid: { color: '${gridColor}' }, ticks: { color: '${textColor}', font: { size: 11 } } } }
        }
      });`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${dashboardType} Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"><\/script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, -apple-system, sans-serif; background: ${bg}; color: ${text}; min-height: 100vh; }
  .header { background: ${surface}; border-bottom: 1px solid ${border}; padding: ${compact ? '14px 24px' : '20px 32px'}; display: flex; align-items: center; justify-content: space-between; }
  .header h1 { font-size: ${compact ? '18px' : '22px'}; font-weight: 700; }
  .header span { font-size: 13px; color: ${subtext}; }
  .main { padding: ${compact ? '16px 24px' : '24px 32px'}; }
  .charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: ${compact ? '12px' : '16px'}; }
</style>
</head>
<body>
<div class="header">
  <h1>${dashboardType} Dashboard</h1>
  <span>${analysis.rowCount.toLocaleString()} records · ${analysis.headers.length} columns</span>
</div>
<div class="main">
  ${kpiHtml}
  <div class="charts">${chartHtml}</div>
</div>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    ${chartScripts}
  });
<\/script>
</body>
</html>`
}
