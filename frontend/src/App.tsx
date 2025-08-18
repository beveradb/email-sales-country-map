import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, Suspense, lazy } from 'react'
import LoginPage from './components/LoginPage'
import './App.css'

// Lazy load heavy components to reduce initial bundle size
const DashboardPage = lazy(() => import('./components/DashboardPage'))
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./components/TermsOfService'))

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user has a valid session
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setIsAuthenticated(data.authenticated || false))
      .catch(() => setIsAuthenticated(false))
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <Suspense fallback={
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading page...</p>
          </div>
        }>
          <Routes>
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/privacy" 
              element={<PrivacyPolicy />} 
            />
            <Route 
              path="/tos" 
              element={<TermsOfService />} 
            />
            {/* Legacy redirect for any existing /login bookmarks */}
            <Route 
              path="/login" 
              element={<Navigate to="/" />} 
            />
          </Routes>
        </Suspense>
      </div>
    </Router>
  )
}

export default App
