export default function Preview({ html, image, loading }) {
  return (
    <div className="flex-1 h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="h-10 bg-gray-900 border-b border-gray-800 flex items-center px-4">
        <span className="text-xs text-gray-400">Preview</span>
      </div>

      {/* Preview area */}
      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 z-10 gap-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Generating your revamped site...</p>
          </div>
        )}

        {!loading && !html && !image && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="text-4xl">🌐</div>
            <p className="text-gray-400 text-sm">Enter a URL to get started</p>
          </div>
        )}

        {!loading && (html || image) && (
          <div className="w-full h-full">
            {html ? (
              <iframe
                srcDoc={html}
                className="w-full h-full border-0"
                title="Revamped site preview"
                sandbox="allow-scripts"
              />
            ) : (
              <img
                src={image}
                alt="Revamped site preview"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
