import { useState, useRef, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || '/api'

const C = {
  green: '#3d7a57',
  greenLight: '#f0f7f3',
  white: '#ffffff',
  bg: '#f5f6f7',
  border: '#e5e7eb',
  text: '#1a1a1a',
  subtext: '#6b7280',
  muted: '#9ca3af',
}

export default function DashboardView({ htmlContent, initialAnalysis, dataSummary, loading }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (initialAnalysis && messages.length === 0) {
      setMessages([{ role: 'assistant', content: initialAnalysis }])
    }
  }, [initialAnalysis])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || chatLoading) return
    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setChatLoading(true)

    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, dataSummary }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }])
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, background: C.bg }}>
        <div style={{ width: 44, height: 44, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, border: '2px solid #e5e7eb', borderTopColor: C.green, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>Analyzing your data...</p>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Claude is reviewing your dataset</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!htmlContent) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: C.bg }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: C.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📊</div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: C.text, fontWeight: 600, marginBottom: 6 }}>No data yet</p>
          <p style={{ fontSize: 13, color: C.muted }}>Upload a CSV or Excel file to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
      {/* Dashboard iframe — top 60% */}
      <div style={{ flex: '0 0 58%', borderBottom: `1px solid ${C.border}`, overflow: 'hidden', background: C.white }}>
        <iframe
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title="Dashboard"
          sandbox="allow-scripts"
        />
      </div>

      {/* Chat — bottom 40% */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Chat header */}
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, background: C.white, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff' }}>✦</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Ask about your data</span>
          <span style={{ fontSize: 11, color: C.muted, marginLeft: 4 }}>Powered by Claude</span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%',
                padding: '9px 13px',
                borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                background: m.role === 'user' ? C.green : C.white,
                color: m.role === 'user' ? '#fff' : C.text,
                fontSize: 13,
                lineHeight: '1.5',
                border: m.role === 'assistant' ? `1px solid ${C.border}` : 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '10px 14px', borderRadius: '12px 12px 12px 3px', background: C.white, border: `1px solid ${C.border}`, display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: C.muted, animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, background: C.white, display: 'flex', gap: 8, flexShrink: 0 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask a question about your data..."
            disabled={chatLoading}
            style={{
              flex: 1, background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: '8px 12px', fontSize: 13,
              color: C.text, outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={chatLoading || !input.trim()}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: chatLoading || !input.trim() ? C.border : C.green,
              color: chatLoading || !input.trim() ? C.muted : '#fff',
              fontSize: 13, fontWeight: 600, cursor: chatLoading || !input.trim() ? 'not-allowed' : 'pointer',
              flexShrink: 0,
            }}
          >
            Send
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  )
}
