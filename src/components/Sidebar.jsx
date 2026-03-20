import { useState, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || '/api'

const INDUSTRIES = [
  'SaaS', 'E-commerce', 'Restaurant', 'Portfolio', 'Agency',
  'Healthcare', 'Real Estate', 'Education', 'Nonprofit', 'Fitness', 'Other'
]

const STYLES = [
  'Minimalist', 'Bold', 'Corporate', 'Playful', 'Luxury', 'Techy', 'Warm & Friendly'
]

const PAGES = ['Home', 'About', 'Services', 'Portfolio', 'Pricing', 'Blog', 'Contact']

export default function Sidebar({
  setPreviewHtml,
  setPreviewImage,
  loading,
  setLoading,
  error,
  setError,
  projectId,
  setProjectId,
  screenId,
  setScreenId,
}) {
  const [mode, setMode] = useState('revamp') // 'revamp' | 'new'
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

  // Advanced options
  const [deviceType, setDeviceType] = useState('DESKTOP')
  const [colorTheme, setColorTheme] = useState('light')
  const [industry, setIndustry] = useState('')
  const [style, setStyle] = useState('')
  const [selectedPages, setSelectedPages] = useState(['Home'])

  function togglePage(page) {
    setSelectedPages(prev =>
      prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]
    )
  }

  function handleLogoFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setLogo({ name: file.name, dataUrl: e.target.result })
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleLogoFile(e.dataTransfer.files[0])
  }

  function buildAdvancedContext() {
    const parts = []
    if (colorTheme === 'dark') parts.push('Use a dark color scheme.')
    if (colorTheme === 'light') parts.push('Use a light color scheme.')
    if (industry) parts.push(`Industry: ${industry}.`)
    if (style) parts.push(`Design style: ${style}.`)
    if (logo) parts.push('A custom logo has been provided — include it prominently in the header.')
    return parts.join(' ')
  }

  async function handleRevamp() {
    if (!url) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/revamp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          prompt: [prompt, buildAdvancedContext()].filter(Boolean).join(' '),
          logoDataUrl: logo?.dataUrl,
          deviceType,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPreviewHtml(data.htmlContent)
      setPreviewImage(data.imageUrl)
      setProjectId(data.projectId)
      setScreenId(data.screenId)
      setHasResult(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleNewSite() {
    if (!businessName) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          businessDesc,
          prompt: [prompt, buildAdvancedContext()].filter(Boolean).join(' '),
          logoDataUrl: logo?.dataUrl,
          deviceType,
          pages: selectedPages,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPreviewHtml(data.htmlContent)
      setPreviewImage(data.imageUrl)
      setProjectId(data.projectId)
      setScreenId(data.screenId)
      setHasResult(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerate() {
    if (!screenId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, screenId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPreviewHtml(data.htmlContent)
      setPreviewImage(data.imageUrl)
      setScreenId(data.screenId)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEdit() {
    if (!screenId || !editPrompt) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, screenId, prompt: editPrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPreviewHtml(data.htmlContent)
      setPreviewImage(data.imageUrl)
      setScreenId(data.screenId)
      setEditPrompt('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-80 min-w-80 h-screen bg-gray-900 border-r border-gray-800 flex flex-col p-4 gap-4 overflow-y-auto">
      <div>
        <h1 className="text-lg font-semibold text-white">Site Builder</h1>
        <p className="text-xs text-gray-400 mt-1">Revamp or create websites with AI</p>
      </div>

      {/* Mode tabs */}
      <div className="flex bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => { setMode('revamp'); setHasResult(false) }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            mode === 'revamp' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Revamp Site
        </button>
        <button
          onClick={() => { setMode('new'); setHasResult(false) }}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
            mode === 'new' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          New Site
        </button>
      </div>

      {/* Revamp: URL input */}
      {mode === 'revamp' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-300 font-medium">Website URL</label>
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRevamp()}
            disabled={loading}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>
      )}

      {/* New site: business info */}
      {mode === 'new' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300 font-medium">Business Name</label>
            <input
              type="text"
              placeholder="e.g. Acme Studio"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={loading}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300 font-medium">Description <span className="text-gray-500">(optional)</span></label>
            <textarea
              placeholder="e.g. A creative agency specializing in brand identity"
              value={businessDesc}
              onChange={(e) => setBusinessDesc(e.target.value)}
              disabled={loading}
              rows={2}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
            />
          </div>
        </div>
      )}

      {/* Logo Upload */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-300 font-medium">Logo <span className="text-gray-500">(optional)</span></label>
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            dragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500'
          }`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {logo ? (
            <div className="flex flex-col items-center gap-2">
              <img src={logo.dataUrl} alt="Logo" className="max-h-12 max-w-full object-contain" />
              <span className="text-xs text-gray-400">{logo.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setLogo(null) }}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">🖼️</span>
              <span className="text-xs text-gray-400">Drop logo or click to upload</span>
              <span className="text-xs text-gray-600">PNG, SVG, JPG</span>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleLogoFile(e.target.files[0])} />
      </div>

      {/* Style prompt */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-300 font-medium">Style prompt <span className="text-gray-500">(optional)</span></label>
        <textarea
          placeholder="e.g. Make it modern and minimal with dark mode"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          rows={2}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
        />
      </div>

      {/* Advanced options toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors"
      >
        <span>Advanced options</span>
        <span>{showAdvanced ? '▲' : '▼'}</span>
      </button>

      {showAdvanced && (
        <div className="flex flex-col gap-4 bg-gray-800/50 rounded-lg p-3">

          {/* Device type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Device</label>
            <div className="flex gap-2">
              {['DESKTOP', 'MOBILE', 'TABLET'].map(d => (
                <button
                  key={d}
                  onClick={() => setDeviceType(d)}
                  className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                    deviceType === d
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {d === 'DESKTOP' ? '🖥' : d === 'MOBILE' ? '📱' : '📟'} {d.charAt(0) + d.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Color theme */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Color Theme</label>
            <div className="flex gap-2">
              {[{ id: 'light', label: '☀️ Light' }, { id: 'dark', label: '🌙 Dark' }, { id: 'auto', label: '✨ Auto' }].map(t => (
                <button
                  key={t.id}
                  onClick={() => setColorTheme(t.id)}
                  className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                    colorTheme === t.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Industry */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select industry...</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {/* Style */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Design Style</label>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map(s => (
                <button
                  key={s}
                  onClick={() => setStyle(style === s ? '' : s)}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    style === s
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Pages — new site only */}
          {mode === 'new' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pages</label>
              <div className="flex flex-wrap gap-1.5">
                {PAGES.map(p => (
                  <button
                    key={p}
                    onClick={() => togglePage(p)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      selectedPages.includes(p)
                        ? 'bg-green-700 border-green-700 text-white'
                        : 'border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={mode === 'revamp' ? handleRevamp : handleNewSite}
        disabled={loading || (mode === 'revamp' ? !url : !businessName)}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
      >
        {loading && !hasResult
          ? (mode === 'revamp' ? 'Revamping...' : 'Building...')
          : (mode === 'revamp' ? 'Revamp Site' : 'Build Site')}
      </button>

      {/* Actions after generation */}
      {hasResult && (
        <div className="flex flex-col gap-3 border-t border-gray-800 pt-4">
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Regenerating...' : 'Regenerate'}
          </button>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300 font-medium">Request a change</label>
            <textarea
              placeholder="e.g. Make the header blue, remove testimonials"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              disabled={loading}
              rows={3}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
            />
            <button
              onClick={handleEdit}
              disabled={loading || !editPrompt}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Applying...' : 'Apply Changes'}
            </button>
          </div>

          <button
            disabled={loading}
            className="bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors mt-2"
          >
            Push to GitHub & Vercel
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  )
}
