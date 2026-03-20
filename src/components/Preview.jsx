export default function Preview({ html, image, loading, previewUrl }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: '#f0f1f2', overflow: 'hidden',
    }}>
      {/* Browser chrome */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        </div>

        <div style={{
          flex: 1, background: '#f5f6f7', border: '1px solid #e5e7eb',
          borderRadius: '8px', padding: '5px 12px',
          display: 'flex', alignItems: 'center', gap: '8px',
          maxWidth: '480px', margin: '0 auto',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{ fontSize: '12px', color: previewUrl ? '#6b7280' : '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {previewUrl || 'preview'}
          </span>
        </div>

        <div style={{ width: 60, flexShrink: 0 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#f0f1f2', zIndex: 10, gap: '20px',
          }}>
            <div style={{ position: 'relative', width: 44, height: 44 }}>
              <div style={{
                position: 'absolute', inset: 0,
                border: '2px solid #e5e7eb', borderTopColor: '#3d7a57',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#374151', marginBottom: '4px', fontWeight: 500 }}>Generating your site...</p>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>This may take a moment</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {!loading && !html && !image && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '16px',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '16px',
              background: 'linear-gradient(135deg, #e8f3ed, #d1e8db)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px',
            }}>🌐</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '15px', color: '#374151', fontWeight: 600, marginBottom: '6px' }}>No preview yet</p>
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>Fill in the details and generate a site</p>
            </div>
          </div>
        )}

        {!loading && (html || image) && (
          html ? (
            <iframe srcDoc={html} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              title="Preview" sandbox="allow-scripts" />
          ) : (
            <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          )
        )}
      </div>
    </div>
  )
}
