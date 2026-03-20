import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Preview from './components/Preview'
import DashboardView from './components/DashboardView'

export default function App() {
  const [mode, setMode] = useState('revamp')
  const [previewHtml, setPreviewHtml] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [projectId, setProjectId] = useState(null)
  const [screenId, setScreenId] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  // Dashboard-specific
  const [dashHtml, setDashHtml] = useState(null)
  const [dashInitialAnalysis, setDashInitialAnalysis] = useState(null)
  const [dashDataSummary, setDashDataSummary] = useState(null)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f6f7' }}>
      <Sidebar
        mode={mode}
        setMode={setMode}
        setPreviewHtml={setPreviewHtml}
        setPreviewImage={setPreviewImage}
        setPreviewUrl={setPreviewUrl}
        setDashHtml={setDashHtml}
        setDashInitialAnalysis={setDashInitialAnalysis}
        setDashDataSummary={setDashDataSummary}
        loading={loading}
        setLoading={setLoading}
        error={error}
        setError={setError}
        projectId={projectId}
        setProjectId={setProjectId}
        screenId={screenId}
        setScreenId={setScreenId}
      />
      {mode === 'dashboard' ? (
        <DashboardView
          htmlContent={dashHtml}
          initialAnalysis={dashInitialAnalysis}
          dataSummary={dashDataSummary}
          loading={loading}
        />
      ) : (
        <Preview
          html={previewHtml}
          image={previewImage}
          loading={loading}
          previewUrl={previewUrl}
        />
      )}
    </div>
  )
}
