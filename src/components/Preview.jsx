export default function Preview({ html, image, loading, previewUrl }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#0d1117',
      overflow: 'hidden',
    }}>
      {/* Browser chrome */}
      <div style={{
        background: '#161b22',
        borderBottom: '1px solid #21262d',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
      }}>
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        </div>

        {/* URL bar */}
        <div style={{
          flex: 1,
          background: '#0d1117',
          border: '1px solid #21262d',
          borderRadius: '8px',
          padding: '5px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: '480px',
          margin: '0 auto',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{ fontSize: '12px', color: previewUrl ? '#94a3b8' : '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {previewUrl || 'preview'}
          </span>
        </div>

        <div style={{ width: 60, flexShrink: 0 }} />
      </div>

      {/* Preview content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Loading */}
        {loading && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#0d1117', zIndex: 10, gap: '20px',
          }}>
            <div style={{ position: 'relative', width: 48, height: 48 }}>
              <div style={{
                position: 'absolute', inset: 0,
                border: '2px solid #1e293b',
                borderTopColor: '#6366f1',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>Generating your site...</p>
              <p style={{ fontSize: '12px', color: '#374151' }}>This may take a moment</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Empty state */}
        {!loading && !html && !image && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '16px',
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px',
            }}>🌐</div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '16px', color: '#e2e8f0', fontWeight: 600, marginBottom: '6px' }}>No preview yet</p>
              <p style={{ fontSize: '13px', color: '#4b5563' }}>Fill in the details and generate a site</p>
            </div>
          </div>
        )}

        {/* Preview */}
        {!loading && (html || image) && (
          html ? (
            <iframe
              srcDoc={html}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              title="Preview"
              sandbox="allow-scripts"
            />
          ) : (
            <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          )
        )}
      </div>
    </div>
  )
}
