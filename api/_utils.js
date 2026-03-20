export function injectLogo(html, logoDataUrl) {
  if (!logoDataUrl) return html
  const logoTag = `<img src="${logoDataUrl}" alt="Logo" style="height:48px;object-fit:contain;display:block;" />`
  if (html.includes('<header')) return html.replace(/(<header[^>]*>)/, `$1\n  ${logoTag}`)
  if (html.includes('<nav')) return html.replace(/(<nav[^>]*>)/, `$1\n  ${logoTag}`)
  return html.replace('<body>', `<body>\n  ${logoTag}`)
}
