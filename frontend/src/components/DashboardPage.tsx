import { useState, useEffect } from 'react'
import WorldMap from './WorldMap'
import Stats from './Stats'
import Controls from './Controls'
import './DashboardPage.css'

export interface SalesData {
  [country: string]: number
}

export default function DashboardPage() {
  const [salesData, setSalesData] = useState<SalesData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visualizationMode, setVisualizationMode] = useState<'choropleth' | 'dots'>('choropleth')
  const [debugData, setDebugData] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  const fetchSalesData = async (forceRefresh = false) => {
    setLoading(true)
    setError(null)
    
    try {
      const url = forceRefresh ? '/api/sales-data?refresh=true' : '/api/sales-data'
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
    fetchSalesData()
  }, [])

  const handleRefresh = () => {
    fetchSalesData(true)
  }

  const handleLogout = () => {
    // Clear any local state and redirect to logout endpoint
    window.location.href = '/api/auth/logout'
  }

  const fetchDebugData = async () => {
    try {
      const response = await fetch('/api/debug')
      if (response.ok) {
        const data = await response.json()
        setDebugData(data)
      }
    } catch (err) {
      console.error('Failed to fetch debug data:', err)
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
          <h1>Email Sales Map</h1>
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
        <div className="dashboard-controls">
          <Controls 
            mode={visualizationMode}
            onModeChange={setVisualizationMode}
          />
        </div>

        {showDebug && (
          <div className="debug-panel">
            <h3>🐛 Debug Information</h3>
            {debugData ? (
              <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
                {JSON.stringify(debugData, null, 2)}
              </pre>
            ) : (
              <p>Loading debug data...</p>
            )}
          </div>
        )}

        <div className="dashboard-content">
          <div className="map-section">
            <WorldMap 
              salesData={salesData}
              mode={visualizationMode}
            />
          </div>
          
          <div className="stats-section">
            <Stats salesData={salesData} />
          </div>
        </div>
      </main>
    </div>
  )
}
