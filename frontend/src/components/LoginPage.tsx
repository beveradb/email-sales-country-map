import { useState, useEffect } from 'react'
import { EMAIL_TEMPLATES, type EmailTemplate, getDefaultTemplate } from '../config/emailTemplates'
import './LoginPage.css'

export default function LoginPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(getDefaultTemplate())
  const [customSubject, setCustomSubject] = useState('')
  const [customRegex, setCustomRegex] = useState('')
  const [showCustomHelp, setShowCustomHelp] = useState(false)

  useEffect(() => {
    // Load saved template from localStorage
    const savedTemplate = localStorage.getItem('selectedEmailTemplate')
    if (savedTemplate) {
      try {
        const parsed = JSON.parse(savedTemplate)
        setSelectedTemplate(parsed)
        if (parsed.id === 'custom') {
          setCustomSubject(parsed.subjectQuery || '')
          setCustomRegex(parsed.countryRegex || '')
        }
      } catch {
        // If parsing fails, use default template
        setSelectedTemplate(getDefaultTemplate())
      }
    }
  }, [])

  const getCurrentTemplate = (): EmailTemplate => {
    if (selectedTemplate.id === 'custom') {
      return {
        ...selectedTemplate,
        subjectQuery: customSubject.trim(),
        countryRegex: customRegex.trim()
      }
    }
    return selectedTemplate
  }

  const handleLogin = () => {
    const template = getCurrentTemplate()
    
    // Validate custom template
    if (template.id === 'custom' && (!customSubject.trim() || !customRegex.trim())) {
      alert('Please fill in both the subject query and country regex pattern for your custom configuration.')
      return
    }

    // Save template selection
    localStorage.setItem('selectedEmailTemplate', JSON.stringify(template))
    
    // Include template config in the login URL so backend can use it
    const templateParam = `?template=${encodeURIComponent(JSON.stringify(template))}`
    window.location.href = `/api/auth/login${templateParam}`
  }

  const handleTemplateChange = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      if (template.id === 'custom') {
        setCustomSubject('')
        setCustomRegex('')
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header Section */}
        <div className="login-header">
          <div className="logo-title">
            <img src="/logo.svg" alt="Email Sales Map Logo" className="logo" />
            <h1>Email Sales Map</h1>
          </div>
          <p className="tagline">
            A free, open-source data visualization tool that helps content creators understand their 
            global customer base by analyzing sales notification emails from any platform. 
            Visualize your sales data on beautiful, interactive world maps.
          </p>
        </div>



        {/* App Features */}
        <div className="app-overview">
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">🔍</span>
              <h3>Smart Email Scanning</h3>
              <p>Securely scans your Gmail for sales notification emails matching your configured criteria</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌍</span>
              <h3>Geographic Analysis</h3>
              <p>Extracts country information from sale emails to understand your global customer distribution</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <h3>Interactive Visualization</h3>
              <p>Displays your sales data on beautiful world maps with multiple visualization modes</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <h3>Sales Analytics</h3>
              <p>Provides statistics, leaderboards, and insights about your top-performing countries</p>
            </div>
          </div>
        </div>

        {/* Quick Login Section */}
        <div className="quick-login-section">
          <h2>Ready to Visualize Your Sales?</h2>
          <p>First, choose your email platform or create a custom configuration:</p>
          
          {/* Template Selection */}
          <div className="template-selection-inline">
            <div className="template-selector">
              <label htmlFor="template-select">Email Platform:</label>
              <select 
                id="template-select"
                value={selectedTemplate.id}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="template-dropdown"
              >
                {EMAIL_TEMPLATES.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate.id !== 'custom' && (
              <div className="template-info-inline">
                <p><strong>Platform:</strong> {selectedTemplate.description}</p>
                {selectedTemplate.exampleEmail && (
                  <p><strong>Example:</strong> "{selectedTemplate.exampleEmail.subject}"</p>
                )}
              </div>
            )}

            {selectedTemplate.id === 'custom' && (
              <div className="custom-config-inline">
                <div className="custom-fields">
                  <div className="custom-field">
                    <label htmlFor="custom-subject">
                      Gmail Search Query:
                      <button 
                        type="button" 
                        className="help-button"
                        onClick={() => setShowCustomHelp(!showCustomHelp)}
                      >
                        ?
                      </button>
                    </label>
                    <input
                      id="custom-subject"
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder='e.g., subject:"Sale confirmation" OR from:sales@mystore.com'
                      className="custom-input"
                    />
                  </div>

                  <div className="custom-field">
                    <label htmlFor="custom-regex">Country Extraction Pattern (Regex):</label>
                    <input
                      id="custom-regex"
                      type="text"
                      value={customRegex}
                      onChange={(e) => setCustomRegex(e.target.value)}
                      placeholder="e.g., Country:\\s*([A-Za-z\\s]+)"
                      className="custom-input"
                    />
                  </div>
                </div>

                {showCustomHelp && (
                  <div className="custom-help-inline">
                    <div className="help-content">
                      <div className="help-column">
                        <h4>Gmail Search Examples:</h4>
                        <ul>
                          <li><code>subject:"Sale confirmation"</code></li>
                          <li><code>from:sales@mystore.com</code></li>
                          <li><code>subject:"Order" AND from:shop@example.com</code></li>
                        </ul>
                      </div>
                      <div className="help-column">
                        <h4>Regex Pattern Examples:</h4>
                        <ul>
                          <li><code>Country:\\s*([A-Za-z\\s]+)</code></li>
                          <li><code>Location:\\s*([^\\n]+)</code></li>
                          <li><code>Shipping to:\\s*([A-Za-z\\s,]+)</code></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <p>You'll get a Google warning; click <strong>"Advanced"</strong>, <strong>"Go to mailsalesmap.org (unsafe)"</strong>, then <strong>"Continue"</strong> to proceed:</p>
          
          <button 
            className="login-button"
            onClick={handleLogin}
            disabled={selectedTemplate.id === 'custom' && (!customSubject.trim() || !customRegex.trim())}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <div className="security-notice">
            <p>
              <strong>🔒 Your privacy is our priority:</strong> We only access emails matching your configured criteria, 
              process data securely, and never store your personal information permanently. Or scroll down to learn more about how it works.
            </p>
          </div>
        </div>

        {/* Why We Need Gmail Access */}
        <div className="data-usage-explanation">
          <h2>Why We Need Gmail Access</h2>
          <p>
            Email Sales Map requires <strong>read-only access to your Gmail</strong> to search for and analyze 
            sales notification emails. Here's exactly what we do:
          </p>
          <ul className="data-usage-list">
            <li>Search for emails matching your configured criteria</li>
            <li>Read the email content to extract country information using your specified pattern</li>
            <li>Count and aggregate sales by country for visualization</li>
            <li><strong>We never store your emails or personal data permanently</strong></li>
            <li><strong>We only read emails matching your exact configuration</strong></li>
            <li><strong>Your data is processed securely and never shared with third parties</strong></li>
          </ul>
        </div>

        {/* Walkthrough with Screenshots */}
        <div className="walkthrough-section">
          <h2>How to Get Started</h2>
          <p>Since this app hasn't been verified by Google yet, you'll see a couple of warning screens. Don't worry - this is normal for new apps!</p>
          
          <div className="walkthrough-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>First Warning Screen</h3>
                <p>You'll see Google's unverified app warning. Click <strong>"Advanced"</strong> then <strong>"Go to mailsalesmap.org (unsafe)"</strong>:</p>
                <div className="screenshot-placeholder">
                  <img src="/screenshots/google-warning-1.avif" alt="Google warning screen 1 - Click Advanced then Go to mailsalesmap.org (unsafe)" />
                  <p className="screenshot-caption">Click "Advanced" then "Go to mailsalesmap.org (unsafe)"</p>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Second Permission Screen</h3>
                <p>You'll see another screen asking for Gmail permissions. Click <strong>"Continue"</strong> to proceed:</p>
                <div className="screenshot-placeholder">
                  <img src="/screenshots/google-warning-2.avif" alt="Google warning screen 2 - Click Continue to grant Gmail access" />
                  <p className="screenshot-caption">Click "Continue" to grant read-only Gmail access</p>
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Your Sales Dashboard</h3>
                <p>After granting access, you'll see your interactive world map with sales data visualized:</p>
                <div className="screenshot-placeholder">
                  <img src="/screenshots/dashboard-example.avif" alt="Example dashboard showing world map with sales data" />
                  <p className="screenshot-caption">Your personalized sales map and statistics</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Developer and Open Source Info */}
        <div className="developer-section">
          <h2>About the Developer</h2>
          <p>
            Email Sales Map is a free, open-source project created by <a href="https://www.linkedin.com/in/andrewbeveridge/" target="_blank" rel="noopener noreferrer">Andrew Beveridge</a>, 
            a software engineer passionate about data visualization and helping content creators understand their businesses better.
          </p>
          <div className="open-source-info">
            <h3>🔓 Fully Open Source</h3>
            <p>
              All code for this application is freely available on GitHub. You can review the source code, 
              suggest improvements, or even run your own instance:
            </p>
            <a href="https://github.com/beveradb/mailsalesmap" target="_blank" rel="noopener noreferrer" className="github-link">
              <svg className="github-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View Source Code on GitHub
            </a>
          </div>
        </div>

        {/* Login Section */}
        <div className="login-section">
          <h2>Ready to Visualize Your Sales?</h2>
          <p>Click below to securely connect your Gmail account and start exploring your global sales data:</p>
          
          <button 
            className="login-button"
            onClick={handleLogin}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <div className="security-notice">
            <p>
              <strong>🔒 Your privacy is our priority:</strong> We only access emails matching your configuration, 
              process data securely, and never store your personal information permanently.
            </p>
          </div>
        </div>

        {/* Legal Links */}
        <div className="legal-section">
          <div className="legal-links">
            <a href="/privacy">Privacy Policy</a>
            <span>•</span>
            <a href="/tos">Terms of Service</a>
            <span>•</span>
            <a href="https://github.com/beveradb/mailsalesmap" target="_blank" rel="noopener noreferrer">Source Code</a>
          </div>
        </div>
      </div>
    </div>
  )
}
