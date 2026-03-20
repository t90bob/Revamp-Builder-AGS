import { useState, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || '/api'

const INDUSTRIES = ['SaaS', 'E-commerce', 'Restaurant', 'Portfolio', 'Agency', 'Healthcare', 'Real Estate', 'Education', 'Nonprofit', 'Fitness', 'Other']
const STYLES = ['Minimalist', 'Bold', 'Corporate', 'Playful', 'Luxury', 'Techy', 'Warm & Friendly']
const PAGES = ['Home', 'About', 'Services', 'Portfolio', 'Pricing', 'Blog', 'Contact']
const DASHBOARD_TYPES = ['Sales', 'Marketing', 'Finance', 'Operations', 'HR', 'Analytics', 'Custom']
const CHART_PREFS = ['Auto', 'Bar-heavy', 'Line-heavy', 'Mixed']
const TIME_GRANULARITY = ['Daily', 'Weekly', 'Monthly', 'Yearly']

// Color palette
const C = {
  green: '#3d7a57',
  greenLight: '#f0f7f3',
  greenMid: '#c8e0d3',
  greenDark: '#2e5e41',
  white: '#ffffff',
  bg: '#f5f6f7',
  border: '#e5e7eb',
  borderMid: '#d1d5db',
  text: '#1a1a1a',
  subtext: '#6b7280',
  muted: '#9ca3af',
  surface: '#ffffff',
  inputBg: '#f9fafb',
  purple: '#6d4fc2',
  purpleLight: '#f3f0fa',
}

const s = {
  sidebar: {
    width: '308px', minWidth: '308px', height: '100vh',
    background: C.white,
    borderRight: `1px solid ${C.border}`,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
  },
  header: {
    padding: '18px 18px 14px',
    borderBottom: `1px solid ${C.border}`,
    flexShrink: 0,
    background: C.white,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
  },
  logoIcon: {
    width: 34, height: 34, borderRadius: '9px',
    background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '17px', flexShrink: 0, color: '#fff',
    boxShadow: `0 2px 8px ${C.green}40`,
  },
  logoText: {
    fontSize: '15px', fontWeight: 700, color: C.text, letterSpacing: '-0.3px',
  },
  logoSub: {
    fontSize: '11px', color: C.muted, marginTop: '1px',
  },
  tabs: {
    display: 'flex', background: C.bg, borderRadius: '9px',
    padding: '3px', border: `1px solid ${C.border}`,
  },
  tab: (active) => ({
    flex: 1, padding: '7px 4px', fontSize: '11.5px', fontWeight: 600,
    borderRadius: '6px', border: 'none', cursor: 'pointer',
    transition: 'all 0.15s',
    background: active ? C.green : 'transparent',
    color: active ? '#fff' : C.subtext,
    boxShadow: active ? `0 1px 4px ${C.green}50` : 'none',
  }),
  scroll: {
    flex: 1, overflowY: 'auto', padding: '16px 18px',
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  label: {
    fontSize: '11px', fontWeight: 600, color: C.subtext,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: '5px', display: 'block',
  },
  input: {
    width: '100%', background: C.inputBg, border: `1px solid ${C.border}`,
    borderRadius: '8px', padding: '9px 11px', fontSize: '13px',
    color: C.text, outline: 'none', transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%', background: C.inputBg, border: `1px solid ${C.border}`,
    borderRadius: '8px', padding: '9px 11px', fontSize: '13px',
    color: C.text, outline: 'none', resize: 'none',
    fontFamily: 'inherit',
  },
  dropzone: (active) => ({
    border: `2px dashed ${active ? C.green : C.borderMid}`,
    borderRadius: '10px', padding: '14px', textAlign: 'center',
    cursor: 'pointer', transition: 'all 0.15s',
    background: active ? C.greenLight : C.inputBg,
  }),
  primaryBtn: (disabled) => ({
    width: '100%', padding: '11px', borderRadius: '9px', border: 'none',
    background: disabled ? C.border : C.green,
    color: disabled ? C.muted : '#fff',
    fontSize: '13px', fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s', letterSpacing: '0.01em',
    boxShadow: disabled ? 'none' : `0 2px 8px ${C.green}40`,
  }),
  secondaryBtn: (disabled) => ({
    width: '100%', padding: '9px', borderRadius: '9px',
    border: `1px solid ${C.border}`, background: C.white,
    color: disabled ? C.muted : C.subtext,
    fontSize: '13px', fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
  }),
  accentBtn: (disabled) => ({
    width: '100%', padding: '9px', borderRadius: '9px', border: 'none',
    background: disabled ? C.border : C.purple,
    color: disabled ? C.muted : '#fff',
    fontSize: '13px', fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '0 2px 6px rgba(109,79,194,0.3)',
  }),
  greenBtn: (disabled) => ({
    width: '100%', padding: '9px', borderRadius: '9px', border: 'none',
    background: disabled ? C.border : C.greenDark,
    color: disabled ? C.muted : '#fff',
    fontSize: '13px', fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }),
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
  chip: (active, color) => ({
    padding: '4px 10px', fontSize: '11.5px', borderRadius: '20px', cursor: 'pointer',
    border: `1px solid ${active ? (color || C.green) : C.border}`,
    background: active ? (color === C.purple ? C.purpleLight : C.greenLight) : C.white,
    color: active ? (color || C.green) : C.subtext,
    transition: 'all 0.15s', fontWeight: active ? 600 : 400,
  }),
  segRow: { display: 'flex', gap: '5px' },
  seg: (active) => ({
    flex: 1, padding: '6px 4px', fontSize: '11px', borderRadius: '7px',
    border: `1px solid ${active ? C.green : C.border}`,
    background: active ? C.greenLight : C.white,
    color: active ? C.green : C.subtext,
    cursor: 'pointer', transition: 'all 0.15s',
    fontWeight: active ? 600 : 400, textAlign: 'center',
  }),
  divider: { borderTop: `1px solid ${C.border}`, paddingTop: '14px', marginTop: '2px' },
  section: { display: 'flex', flexDirection: 'column', gap: '5px' },
  advancedPanel: {
    background: C.bg, border: `1px solid ${C.border}`,
    borderRadius: '10px', padding: '14px',
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: '8px', padding: '10px 12px',
    fontSize: '12px', color: '#dc2626',
  },
}

export default function Sidebar({
  mode, setMode,
  setPreviewHtml, setPreviewImage, setPreviewUrl,
  setDashHtml, setDashInitialAnalysis, setDashDataSummary,
  loading, setLoading, error, setError,
  projectId, setProjectId, screenId, setScreenId,
}) {
  // mode is lifted to App
  const [url, setUrl] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessDesc, setBusinessDesc] = useState('')
  const [prompt, setPrompt] = useState('')
  const [editPrompt, setEditPrompt] = useState('')
  const [hasResult, setHasResult] = useState(false)
  const [logo, setLogo] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const fileInputRef = useRef()
  const dataFileInputRef = useRef()

  const [deviceType, setDeviceType] = useState('DESKTOP')
  const [colorTheme, setColorTheme] = useState('light')
  const [industry, setIndustry] = useState('')
  const [siteStyle, setSiteStyle] = useState('')
  const [selectedPages, setSelectedPages] = useState(['Home'])

  const [dataFile, setDataFile] = useState(null)
  const [dataDragging, setDataDragging] = useState(false)
  const [dashboardType, setDashboardType] = useState('Analytics')
  const [showKpis, setShowKpis] = useState(true)
  const [dashDensity, setDashDensity] = useState('comfortable')
  const [dashTheme, setDashTheme] = useState('light')

  function togglePage(p) {
    setSelectedPages(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  function handleLogoFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setLogo({ name: file.name, dataUrl: e.target.result })
    reader.readAsDataURL(file)
  }

  function handleDataFile(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['csv', 'xlsx', 'xls'].includes(ext)) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = btoa(String.fromCharCode(...new Uint8Array(e.target.result)))
      setDataFile({ name: file.name, base64 })
    }
    reader.readAsArrayBuffer(file)
  }

  function buildAdvancedContext() {
    const parts = []
    if (colorTheme === 'dark') parts.push('Use a dark color scheme.')
    if (colorTheme === 'light') parts.push('Use a light color scheme.')
    if (industry) parts.push(`Industry: ${industry}.`)
    if (siteStyle) parts.push(`Design style: ${siteStyle}.`)
    if (logo) parts.push('A custom logo has been provided — include it prominently in the header.')
    return parts.join(' ')
  }

  async function post(endpoint, body) {
    const res = await fetch(`${API}/${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    let data
    try {
      data = await res.json()
    } catch {
      const text = await res.text().catch(() => 'Unknown error')
      throw new Error(res.status === 504 ? 'Request timed out — please try again' : text || `Server error (${res.status})`)
    }
    if (!res.ok) throw new Error(data.error || `Server error (${res.status})`)
    return data
  }

  async function run(fn) {
    setLoading(true); setError(null)
    try { await fn() } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  async function handleRevamp() {
    if (!url) return
    await run(async () => {
      const data = await post('revamp', { url, prompt: [prompt, buildAdvancedContext()].filter(Boolean).join(' '), logoDataUrl: logo?.dataUrl, deviceType })
      setPreviewHtml(data.htmlContent); setPreviewImage(data.imageUrl)
      setProjectId(data.projectId); setScreenId(data.screenId)
      setPreviewUrl(url); setHasResult(true)
    })
  }

  async function handleNewSite() {
    if (!businessName) return
    await run(async () => {
      const data = await post('new', { businessName, businessDesc, prompt: [prompt, buildAdvancedContext()].filter(Boolean).join(' '), logoDataUrl: logo?.dataUrl, deviceType, pages: selectedPages })
      setPreviewHtml(data.htmlContent); setPreviewImage(data.imageUrl)
      setProjectId(data.projectId); setScreenId(data.screenId)
      setPreviewUrl(`${businessName.toLowerCase().replace(/\s+/g, '-')}.com`); setHasResult(true)
    })
  }

  async function handleDashboard() {
    if (!dataFile) return
    await run(async () => {
      const data = await post('dashboard', { fileData: dataFile.base64, fileName: dataFile.name, dashboardType, density: dashDensity, theme: dashTheme, showKpis, prompt })
      setDashHtml(data.htmlContent)
      setDashInitialAnalysis(data.initialAnalysis)
      setDashDataSummary(data.dataSummary)
      setHasResult(true)
    })
  }

  async function handleRegenerate() {
    if (!screenId) return
    await run(async () => {
      const data = await post('regenerate', { projectId, screenId })
      setPreviewHtml(data.htmlContent); setPreviewImage(data.imageUrl); setScreenId(data.screenId)
    })
  }

  async function handleEdit() {
    if (!screenId || !editPrompt) return
    await run(async () => {
      const data = await post('edit', { projectId, screenId, prompt: editPrompt })
      setPreviewHtml(data.htmlContent); setPreviewImage(data.imageUrl)
      setScreenId(data.screenId); setEditPrompt('')
    })
  }

  function switchMode(m) { setMode(m); setHasResult(false); setError(null) }

  const canGenerate = mode === 'revamp' ? !!url : mode === 'new' ? !!businessName : !!dataFile
  const generateLabel = loading && !hasResult
    ? (mode === 'revamp' ? 'Revamping...' : mode === 'new' ? 'Building...' : 'Analyzing...')
    : (mode === 'revamp' ? 'Revamp Site' : mode === 'new' ? 'Build Site' : 'Build Dashboard')

  return (
    <div style={s.sidebar}>
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>✦</div>
          <div>
            <div style={s.logoText}>Site Builder</div>
            <div style={s.logoSub}>Powered by AI</div>
          </div>
        </div>
        <div style={s.tabs}>
          {[['revamp', '↺ Revamp'], ['new', '+ New Site'], ['dashboard', '▤ Dashboard']].map(([id, label]) => (
            <button key={id} onClick={() => switchMode(id)} style={s.tab(mode === id)}>{label}</button>
          ))}
        </div>
      </div>

      <div style={s.scroll}>

        {mode === 'revamp' && (
          <div style={s.section}>
            <label style={s.label}>Website URL</label>
            <input style={s.input} type="url" placeholder="https://example.com"
              value={url} onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRevamp()} disabled={loading} />
          </div>
        )}

        {mode === 'new' && (
          <>
            <div style={s.section}>
              <label style={s.label}>Business Name</label>
              <input style={s.input} type="text" placeholder="e.g. Acme Studio"
                value={businessName} onChange={(e) => setBusinessName(e.target.value)} disabled={loading} />
            </div>
            <div style={s.section}>
              <label style={s.label}>Description <span style={{ textTransform: 'none', fontWeight: 400, color: C.muted }}>(optional)</span></label>
              <textarea style={s.textarea} rows={2} placeholder="e.g. A creative agency specializing in brand identity"
                value={businessDesc} onChange={(e) => setBusinessDesc(e.target.value)} disabled={loading} />
            </div>
          </>
        )}

        {mode === 'dashboard' && (
          <>
            <div style={s.section}>
              <label style={s.label}>Data File</label>
              <div style={s.dropzone(dataDragging)}
                onClick={() => dataFileInputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDataDragging(true) }}
                onDragLeave={() => setDataDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDataDragging(false); handleDataFile(e.dataTransfer.files[0]) }}>
                {dataFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '20px' }}>📊</span>
                    <span style={{ fontSize: '12px', color: C.text, fontWeight: 600 }}>{dataFile.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); setDataFile(null) }}
                      style={{ fontSize: '11px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '20px' }}>📂</span>
                    <span style={{ fontSize: '12px', color: C.subtext }}>Drop CSV or Excel here</span>
                    <span style={{ fontSize: '11px', color: C.muted }}>.csv, .xlsx, .xls</span>
                  </div>
                )}
              </div>
              <input ref={dataFileInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }}
                onChange={(e) => handleDataFile(e.target.files[0])} />
            </div>

            <div style={s.section}>
              <label style={s.label}>Dashboard Type</label>
              <div style={s.chipRow}>
                {DASHBOARD_TYPES.map(t => <button key={t} onClick={() => setDashboardType(t)} style={s.chip(dashboardType === t)}>{t}</button>)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1, ...s.section }}>
                <label style={s.label}>Theme</label>
                <div style={s.segRow}>
                  {[['light', '☀️ Light'], ['dark', '🌙 Dark']].map(([id, label]) => (
                    <button key={id} onClick={() => setDashTheme(id)} style={s.seg(dashTheme === id)}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, ...s.section }}>
                <label style={s.label}>Layout</label>
                <div style={s.segRow}>
                  {[['compact', 'Compact'], ['comfortable', 'Airy']].map(([id, label]) => (
                    <button key={id} onClick={() => setDashDensity(id)} style={s.seg(dashDensity === id)}>{label}</button>
                  ))}
                </div>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={showKpis} onChange={(e) => setShowKpis(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: C.green }} />
              <span style={{ fontSize: '12px', color: C.subtext }}>Show KPI cards</span>
            </label>
          </>
        )}

        {mode !== 'dashboard' && (
          <div style={s.section}>
            <label style={s.label}>Logo <span style={{ textTransform: 'none', fontWeight: 400, color: C.muted }}>(optional)</span></label>
            <div style={s.dropzone(dragging)}
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleLogoFile(e.dataTransfer.files[0]) }}>
              {logo ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <img src={logo.dataUrl} alt="Logo" style={{ maxHeight: '38px', maxWidth: '100%', objectFit: 'contain' }} />
                  <span style={{ fontSize: '11px', color: C.muted }}>{logo.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setLogo(null) }}
                    style={{ fontSize: '11px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '20px' }}>🖼️</span>
                  <span style={{ fontSize: '12px', color: C.subtext }}>Drop logo or click to upload</span>
                  <span style={{ fontSize: '11px', color: C.muted }}>PNG, SVG, JPG</span>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => handleLogoFile(e.target.files[0])} />
          </div>
        )}

        <div style={s.section}>
          <label style={s.label}>
            {mode === 'dashboard' ? 'Additional instructions' : 'Style prompt'}{' '}
            <span style={{ textTransform: 'none', fontWeight: 400, color: C.muted }}>(optional)</span>
          </label>
          <textarea style={s.textarea} rows={2} disabled={loading}
            placeholder={mode === 'dashboard' ? 'e.g. Focus on monthly trends' : 'e.g. Modern, minimal, dark mode'}
            value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </div>

        {mode !== 'dashboard' && (
          <>
            <button onClick={() => setShowAdvanced(!showAdvanced)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: C.muted, fontSize: '12px', padding: '0', width: '100%' }}>
              <span>Advanced options</span>
              <span style={{ fontSize: '10px' }}>{showAdvanced ? '▲' : '▼'}</span>
            </button>

            {showAdvanced && (
              <div style={s.advancedPanel}>
                <div style={s.section}>
                  <label style={s.label}>Device</label>
                  <div style={s.segRow}>
                    {[['DESKTOP', '🖥 Desktop'], ['MOBILE', '📱 Mobile'], ['TABLET', '📟 Tablet']].map(([id, label]) => (
                      <button key={id} onClick={() => setDeviceType(id)} style={s.seg(deviceType === id)}>{label}</button>
                    ))}
                  </div>
                </div>
                <div style={s.section}>
                  <label style={s.label}>Color Theme</label>
                  <div style={s.segRow}>
                    {[['light', '☀️ Light'], ['dark', '🌙 Dark'], ['auto', '✨ Auto']].map(([id, label]) => (
                      <button key={id} onClick={() => setColorTheme(id)} style={s.seg(colorTheme === id)}>{label}</button>
                    ))}
                  </div>
                </div>
                <div style={s.section}>
                  <label style={s.label}>Industry</label>
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)}
                    style={{ ...s.input, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div style={s.section}>
                  <label style={s.label}>Design Style</label>
                  <div style={s.chipRow}>
                    {STYLES.map(st => (
                      <button key={st} onClick={() => setSiteStyle(siteStyle === st ? '' : st)}
                        style={s.chip(siteStyle === st, C.purple)}>{st}</button>
                    ))}
                  </div>
                </div>
                {mode === 'new' && (
                  <div style={s.section}>
                    <label style={s.label}>Pages</label>
                    <div style={s.chipRow}>
                      {PAGES.map(p => (
                        <button key={p} onClick={() => togglePage(p)}
                          style={s.chip(selectedPages.includes(p))}>{p}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <button onClick={mode === 'revamp' ? handleRevamp : mode === 'new' ? handleNewSite : handleDashboard}
          disabled={loading || !canGenerate} style={s.primaryBtn(loading || !canGenerate)}>
          {generateLabel}
        </button>

        {hasResult && (
          <div style={s.divider}>
            {mode !== 'dashboard' && (
              <>
                <button onClick={handleRegenerate} disabled={loading}
                  style={{ ...s.secondaryBtn(loading), marginBottom: '10px' }}>
                  {loading ? 'Regenerating...' : '↺ Regenerate'}
                </button>
                <div style={{ ...s.section, marginBottom: '10px' }}>
                  <label style={s.label}>Request a change</label>
                  <textarea style={{ ...s.textarea, marginBottom: '6px' }} rows={2} disabled={loading}
                    placeholder="e.g. Make the header blue, remove testimonials"
                    value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} />
                  <button onClick={handleEdit} disabled={loading || !editPrompt} style={s.accentBtn(loading || !editPrompt)}>
                    {loading ? 'Applying...' : 'Apply Changes'}
                  </button>
                </div>
              </>
            )}
            <button disabled={loading} style={s.greenBtn(loading)}>↑ Push to GitHub & Vercel</button>
          </div>
        )}

        {error && <div style={s.errorBox}>{error}</div>}
      </div>
    </div>
  )
}
