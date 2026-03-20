import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Preview from './components/Preview'

export default function App() {
  const [previewHtml, setPreviewHtml] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [projectId, setProjectId] = useState(null)
  const [screenId, setScreenId] = useState(null)

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar
        setPreviewHtml={setPreviewHtml}
        setPreviewImage={setPreviewImage}
        loading={loading}
        setLoading={setLoading}
        error={error}
        setError={setError}
        projectId={projectId}
        setProjectId={setProjectId}
        screenId={screenId}
        setScreenId={setScreenId}
      />
      <Preview html={previewHtml} image={previewImage} loading={loading} />
    </div>
  )
}
