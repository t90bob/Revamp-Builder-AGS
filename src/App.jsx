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
  const [previewUrl, setPreviewUrl] = useState('')

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#080a0f' }}>
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
        setPreviewUrl={setPreviewUrl}
      />
      <Preview
        html={previewHtml}
        image={previewImage}
        loading={loading}
        previewUrl={previewUrl}
      />
    </div>
  )
}
