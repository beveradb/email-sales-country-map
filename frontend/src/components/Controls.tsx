import './Controls.css'

interface ControlsProps {
  mode: 'choropleth' | 'dots'
  onModeChange: (mode: 'choropleth' | 'dots') => void
}

export default function Controls({ mode, onModeChange }: ControlsProps) {
  return (
    <div className="controls">
      <div className="controls-card">
        <h3>Visualization Mode</h3>
        <div className="mode-toggles">
          <button
            className={`mode-button ${mode === 'choropleth' ? 'active' : ''}`}
            onClick={() => onModeChange('choropleth')}
          >
            <span className="mode-icon">🗺️</span>
            <span className="mode-info">
              <span className="mode-title">Color Map</span>
              <span className="mode-description">Countries colored by sales volume</span>
            </span>
          </button>
          
          <button
            className={`mode-button ${mode === 'dots' ? 'active' : ''}`}
            onClick={() => onModeChange('dots')}
          >
            <span className="mode-icon">📍</span>
            <span className="mode-info">
              <span className="mode-title">Dot Size</span>
              <span className="mode-description">Dots sized by sales volume</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
