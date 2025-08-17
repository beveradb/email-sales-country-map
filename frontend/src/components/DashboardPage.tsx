import { useState, useEffect } from 'react'
import WorldMap, { type VisualizationSettings } from './WorldMap'
import Stats from './Stats'
import Controls from './Controls'
import { type EmailTemplate, getDefaultTemplate } from '../config/emailTemplates'
import './DashboardPage.css'

export interface SalesData {
  [country: string]: {
    count: number
    firstSale: number  // timestamp
    lastSale: number   // timestamp
  }
}

export default function DashboardPage() {
  const [salesData, setSalesData] = useState<SalesData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visualizationMode, setVisualizationMode] = useState<'choropleth' | 'dots'>('choropleth')
  const [debugData, setDebugData] = useState<unknown>(null)
  const [showDebug, setShowDebug] = useState(false)
  const [copied, setCopied] = useState(false)
  const [template, setTemplate] = useState<EmailTemplate | null>(null)
  const [visualizationSettings, setVisualizationSettings] = useState<VisualizationSettings>({
    colorTheme: 'green',
    dotStyle: 'circle',
    dotEmoji: '💰',
    dotSizeMultiplier: 1,
    cutoffs: {
      low: 1,
      medium: 10,
      high: 100,
      veryHigh: 1000
    },
    opacity: 0.8
  })

  const fetchSalesData = async (forceRefresh = false) => {
    setLoading(true)
    setError(null)
    
    try {
      const searchParams = new URLSearchParams()
      if (forceRefresh) searchParams.set('refresh', 'true')
      if (template) searchParams.set('template', JSON.stringify(template))
      
      const url = `/api/sales-data?${searchParams.toString()}`
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login'
          return
        }
        throw new Error(`Failed to fetch sales data: ${response.statusText}`)
      }
      
      const data = await response.json()
      setSalesData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load template from localStorage
    const savedTemplate = localStorage.getItem('selectedEmailTemplate')
    if (savedTemplate) {
      try {
        const parsed = JSON.parse(savedTemplate)
        setTemplate(parsed)
      } catch {
        // If parsing fails, use default template
        setTemplate(getDefaultTemplate())
      }
    } else {
      // No saved template, use default
      setTemplate(getDefaultTemplate())
    }
  }, [])

  useEffect(() => {
    // Fetch sales data when template is available
    if (template) {
      fetchSalesData()
    }
  }, [template]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    fetchSalesData(true)
  }

  const handleLogout = () => {
    // Clear any local state and redirect to logout endpoint
    window.location.href = '/api/auth/logout'
  }

  const fetchDebugData = async () => {
    try {
      const searchParams = new URLSearchParams()
      if (template) searchParams.set('template', JSON.stringify(template))
      
      const url = `/api/debug?${searchParams.toString()}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setDebugData(data)
      }
    } catch (err) {
      console.error('Failed to fetch debug data:', err)
    }
  }

  const copyDebugData = async () => {
    if (!debugData) return
    
    try {
      const debugText = JSON.stringify(debugData, null, 2)
      await navigator.clipboard.writeText(debugText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy debug data:', err)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Scanning your emails for sales data...</p>
        <small>This may take a moment for large inboxes</small>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <button onClick={() => fetchSalesData()} className="retry-button">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="dashboard-title">
            <img src="/logo.svg" alt="Email Sales Map Logo" className="dashboard-logo" />
            <h1>Email Sales Map</h1>
          </div>
          <div className="header-actions">
            <button onClick={handleRefresh} className="refresh-button">
              🔄 Refresh Data
            </button>
            <button onClick={() => { setShowDebug(!showDebug); if (!showDebug) fetchDebugData(); }} className="debug-button">
              🐛 Debug
            </button>
            <button onClick={handleLogout} className="logout-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {showDebug && (
          <div className="debug-panel">
            <div className="debug-header">
              <h3>🐛 Debug Information</h3>
              {debugData != null && (
                <button 
                  onClick={copyDebugData}
                  className={`copy-button ${copied ? 'copied' : ''}`}
                  title="Copy all debug data to clipboard"
                >
                  {copied ? '✅ Copied!' : '📋 Copy All'}
                </button>
              )}
            </div>
            {debugData ? (
              <pre style={{ background: '#f5f5f5', color: '#000', padding: '1rem', borderRadius: '4px', fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
                {JSON.stringify(debugData, null, 2)}
              </pre>
            ) : (
              <p>Loading debug data...</p>
            )}
          </div>
        )}

        <div className="dashboard-content">
          <div className="main-section">
            <div className="sidebar">
              <Controls 
                mode={visualizationMode}
                onModeChange={setVisualizationMode}
                settings={visualizationSettings}
                onSettingsChange={setVisualizationSettings}
              />
            </div>
            
            <div className="content-area">
              <div className="map-section">
                <WorldMap 
                  salesData={salesData}
                  mode={visualizationMode}
                  settings={visualizationSettings}
                />
              </div>
              
              <div className="stats-section">
                <Stats salesData={salesData} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
