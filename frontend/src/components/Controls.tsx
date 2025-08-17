
import type { VisualizationSettings } from './WorldMap'
import './Controls.css'

interface ControlsProps {
  mode: 'choropleth' | 'dots'
  onModeChange: (mode: 'choropleth' | 'dots') => void
  settings: VisualizationSettings
  onSettingsChange: (settings: VisualizationSettings) => void
}

export default function Controls({ mode, onModeChange, settings, onSettingsChange }: ControlsProps) {

  const updateSettings = (updates: Partial<VisualizationSettings>) => {
    onSettingsChange({ ...settings, ...updates })
  }

  const updateCutoffs = (field: keyof VisualizationSettings['cutoffs'], value: number) => {
    updateSettings({
      cutoffs: { ...settings.cutoffs, [field]: value }
    })
  }
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

      <div className="controls-card">
        <h3>Customization</h3>
        
        <div className="controls-expanded">
            
            {/* Color Theme */}
            <div className="control-group">
              <label>Color Theme</label>
              <div className="color-theme-grid">
                {(['green', 'blue', 'purple', 'orange', 'red'] as const).map(theme => (
                  <button
                    key={theme}
                    className={`color-theme-button ${settings.colorTheme === theme ? 'active' : ''}`}
                    onClick={() => updateSettings({ colorTheme: theme })}
                    style={{
                      background: theme === 'green' ? '#2d5a2d' :
                                 theme === 'blue' ? '#1e3a8a' :
                                 theme === 'purple' ? '#581c87' :
                                 theme === 'orange' ? '#c2410c' : '#991b1b'
                    }}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div className="control-group">
              <label>Opacity: {Math.round(settings.opacity * 100)}%</label>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.1"
                value={settings.opacity}
                onChange={(e) => updateSettings({ opacity: parseFloat(e.target.value) })}
              />
            </div>

            {/* Dot Settings (only show when in dots mode) */}
            {mode === 'dots' && (
              <>
                <div className="control-group">
                  <label>Dot Style</label>
                  <div className="dot-style-toggles">
                    <button
                      className={`style-button ${settings.dotStyle === 'circle' ? 'active' : ''}`}
                      onClick={() => updateSettings({ dotStyle: 'circle' })}
                    >
                      ⭕ Circle
                    </button>
                    <button
                      className={`style-button ${settings.dotStyle === 'emoji' ? 'active' : ''}`}
                      onClick={() => updateSettings({ dotStyle: 'emoji' })}
                    >
                      😀 Emoji
                    </button>
                  </div>
                </div>

                {settings.dotStyle === 'emoji' && (
                  <div className="control-group">
                    <label>Emoji</label>
                    <div className="emoji-grid">
                      {['💰', '💎', '🎯', '⭐', '🔥', '💚', '💙', '❤️', '🌟', '✨', '🎪', '🎭'].map(emoji => (
                        <button
                          key={emoji}
                          className={`emoji-button ${settings.dotEmoji === emoji ? 'active' : ''}`}
                          onClick={() => updateSettings({ dotEmoji: emoji })}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Custom emoji"
                      value={settings.dotEmoji}
                      onChange={(e) => updateSettings({ dotEmoji: e.target.value.slice(0, 2) })}
                      className="custom-emoji-input"
                    />
                  </div>
                )}

                <div className="control-group">
                  <label>Size Multiplier: {settings.dotSizeMultiplier}x</label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={settings.dotSizeMultiplier}
                    onChange={(e) => updateSettings({ dotSizeMultiplier: parseFloat(e.target.value) })}
                  />
                </div>
              </>
            )}

            {/* Sales Cutoffs */}
            <div className="control-group">
              <label>Sales Thresholds</label>
              <div className="cutoffs-grid">
                <div className="cutoff-item">
                  <label>Low</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.cutoffs.low}
                    onChange={(e) => updateCutoffs('low', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="cutoff-item">
                  <label>Medium</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.cutoffs.medium}
                    onChange={(e) => updateCutoffs('medium', parseInt(e.target.value) || 10)}
                  />
                </div>
                <div className="cutoff-item">
                  <label>High</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.cutoffs.high}
                    onChange={(e) => updateCutoffs('high', parseInt(e.target.value) || 100)}
                  />
                </div>
                <div className="cutoff-item">
                  <label>Very High</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.cutoffs.veryHigh}
                    onChange={(e) => updateCutoffs('veryHigh', parseInt(e.target.value) || 1000)}
                  />
                </div>
              </div>
              <small>Countries with sales at or above these levels will be colored differently</small>
            </div>

            {/* Preset Buttons */}
            <div className="control-group">
              <label>Quick Presets</label>
              <div className="preset-buttons">
                <button
                  className="preset-button"
                  onClick={() => updateSettings({
                    colorTheme: 'green',
                    opacity: 0.8,
                    dotStyle: 'circle',
                    dotSizeMultiplier: 1,
                    cutoffs: { low: 1, medium: 10, high: 100, veryHigh: 1000 }
                  })}
                >
                  🌱 Default
                </button>
                <button
                  className="preset-button"
                  onClick={() => updateSettings({
                    colorTheme: 'purple',
                    opacity: 0.9,
                    dotStyle: 'emoji',
                    dotEmoji: '💎',
                    dotSizeMultiplier: 1.5,
                    cutoffs: { low: 5, medium: 50, high: 500, veryHigh: 5000 }
                  })}
                >
                  💎 Premium
                </button>
                <button
                  className="preset-button"
                  onClick={() => updateSettings({
                    colorTheme: 'orange',
                    opacity: 0.7,
                    dotStyle: 'emoji',
                    dotEmoji: '🔥',
                    dotSizeMultiplier: 2,
                    cutoffs: { low: 1, medium: 25, high: 250, veryHigh: 2500 }
                  })}
                >
                  🔥 Heat Map
                </button>
              </div>
            </div>

        </div>
      </div>
    </div>
  )
}
