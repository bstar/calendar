import { useState, useEffect } from 'react';
import './bootstrap.min.css'

import DateRangePicker from './components/DateRangePicker';
import { SETTINGS, getDefaultSettings, DISPLAY_MODE_CONSTRAINTS } from './components/DateRangePicker.config';

function App() {
  const [settings, setSettings] = useState({
    ...getDefaultSettings(),
    isOpen: true  // Force calendar to be open on initial load
  });

  const handleChange = (prop) => (event) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.type === 'number'
        ? parseInt(event.target.value)
        : event.target.value;

    setSettings(prev => ({ ...prev, [prop]: value }));
  };

  const StyleEditor = ({ config, value, onChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPresets, setSelectedPresets] = useState([]);
    const [styleText, setStyleText] = useState(
      value ? JSON.stringify(value, null, 2) : ''
    );

    // Initialize selected presets on mount and when value changes
    useEffect(() => {
      if (!value) {
        setSelectedPresets(['Default']);
        return;
      }

      const activePresets = Object.entries(config.presets)
        .filter(([name, presetStyles]) => {
          if (name === 'Default' || !presetStyles) return false;
          return Object.entries(presetStyles).every(([key, val]) => 
            value[key] === val
          );
        })
        .map(([name]) => name);

      setSelectedPresets(activePresets.length ? activePresets : ['Default']);
    }, [value, config.presets]);

    const handlePresetToggle = (presetName) => {
      let newPresets;
      if (presetName === 'Default') {
        newPresets = ['Default'];
      } else {
        // Remove Default from selection
        newPresets = selectedPresets.filter(p => p !== 'Default');
        
        // Handle mutually exclusive presets
        if (presetName === 'No Shadow' || presetName === 'Shadow') {
          newPresets = newPresets.filter(p => p !== 'No Shadow' && p !== 'Shadow');
        }
        if (presetName === 'Rounded Corners' || presetName === 'Rigid Corners') {
          newPresets = newPresets.filter(p => p !== 'Rounded Corners' && p !== 'Rigid Corners');
        }
        
        if (newPresets.includes(presetName)) {
          newPresets = newPresets.filter(p => p !== presetName);
        } else {
          newPresets.push(presetName);
        }
        
        if (newPresets.length === 0) newPresets = ['Default'];
      }

      setSelectedPresets(newPresets);

      // Mix the styles from all selected presets
      const mixedStyles = newPresets.reduce((styles, name) => {
        if (name === 'Default') return null;
        return {
          ...styles,
          ...config.presets[name]
        };
      }, {});

      onChange({ target: { value: mixedStyles } });
      setStyleText(mixedStyles ? JSON.stringify(mixedStyles, null, 2) : '');
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.keys(config.presets).map(preset => (
            <button
              key={preset}
              onClick={() => handlePresetToggle(preset)}
              style={{
                padding: '4px 12px',
                borderRadius: '16px',
                border: '1px solid #dee2e6',
                backgroundColor: selectedPresets.includes(preset) ? '#e7f3ff' : '#fff',
                color: selectedPresets.includes(preset) ? '#0366d6' : '#666',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                width: '120px',
                height: '40px',
                justifyContent: 'center'
              }}
            >
              {selectedPresets.includes(preset) && (
                <span style={{ fontSize: '16px' }}>✓</span>
              )}
              {preset}
            </button>
          ))}
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '4px 12px',
              borderRadius: '16px',
              border: '1px solid #dee2e6',
              backgroundColor: isEditing ? '#fff3cd' : '#fff',
              color: '#666',
              cursor: 'pointer',
              fontSize: '13px',
              marginLeft: 'auto'
            }}
          >
            {isEditing ? 'Cancel' : 'Edit JSON'}
          </button>
        </div>

        {isEditing && (
          <>
            <textarea
              value={styleText}
              onChange={(e) => setStyleText(e.target.value)}
              placeholder="Enter styles in JSON format..."
              style={{
                width: '100%',
                height: '100px',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}
            />
            <button
              onClick={() => {
                try {
                  const styleObj = styleText ? JSON.parse(styleText) : null;
                  onChange({ target: { value: styleObj } });
                  setIsEditing(false);
                } catch (e) {
                  alert('Invalid style format. Please use valid JSON.');
                }
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              Apply Styles
            </button>
          </>
        )}

        {value && !isEditing && (
          <div style={{ 
            fontSize: '12px', 
            fontFamily: 'monospace',
            padding: '8px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #eee'
          }}>
            {JSON.stringify(value, null, 2)}
          </div>
        )}
      </div>
    );
  };

  const SettingControl = ({ config }) => {
    const isOverridden = settings[config.id] !== config.default;
    const [showMeta, setShowMeta] = useState(false);

    // Check if control should be disabled based on display mode
    const isDisabled = settings.displayMode === 'embedded' && 
      DISPLAY_MODE_CONSTRAINTS.embedded.hasOwnProperty(config.id);

    // Get constraint message if applicable
    const constraintMessage = isDisabled ? 
      `This feature is ${DISPLAY_MODE_CONSTRAINTS.embedded[config.id] ? 'enabled' : 'disabled'} in embedded mode` : 
      null;

    return (
      <div style={{ 
        padding: '12px',
        border: '1px solid #eee',
        borderRadius: '6px',
        backgroundColor: isDisabled ? '#f5f5f5' : isOverridden ? '#fff' : '#fafafa',
        width: '100%',
        opacity: isDisabled ? 0.7 : 1
      }}>
        {/* Control Header */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 500 }}>{config.label}</span>
              <button
                onClick={() => setShowMeta(prev => !prev)}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: '2px 6px',
                  cursor: 'pointer',
                  color: '#666',
                  fontSize: '12px',
                  opacity: showMeta ? 1 : 0.6
                }}
              >
                ⓘ
              </button>
            </div>
            {isOverridden && (
              <span style={{ 
                fontSize: '12px', 
                color: '#666',
                backgroundColor: '#f0f0f0',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                Modified
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {config.description}
          </div>
        </div>

        {/* Metadata */}
        {showMeta && (
          <div style={{ 
            fontSize: '12px', 
            color: '#888',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '4px 12px',
            marginBottom: '12px',
            padding: '8px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}>
            <span>ID:</span>
            <code style={{ color: '#666' }}>{config.id}</code>
            <span>Type:</span>
            <code style={{ color: '#666' }}>{config.type}</code>
            <span>Default:</span>
            <code style={{ color: '#666' }}>{String(config.default)}</code>
            <span>Current:</span>
            <code style={{ color: '#666' }}>{String(settings[config.id])}</code>
          </div>
        )}

        {constraintMessage && (
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            fontStyle: 'italic',
            marginTop: '4px' 
          }}>
            {constraintMessage}
          </div>
        )}

        {/* Control Input */}
        <div style={{ pointerEvents: isDisabled ? 'none' : 'auto' }}>
          {config.type === 'style-editor' ? (
            <StyleEditor
              config={config}
              value={settings[config.id]}
              onChange={handleChange(config.id)}
            />
          ) : config.type === 'boolean' ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings[config.id]}
                onChange={handleChange(config.id)}
              />
              <span style={{ fontSize: '14px' }}>Enable</span>
            </label>
          ) : config.type === 'number' ? (
            <input
              type="number"
              min={config.min}
              max={config.max}
              value={settings[config.id]}
              onChange={handleChange(config.id)}
              style={{ 
                width: config.width,
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}
            />
          ) : config.type === 'select' ? (
            <select
              value={settings[config.id]}
              onChange={handleChange(config.id)}
              style={{ 
                width: config.width,
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}
            >
              {config.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1800px', margin: '0 auto' }}>
      {/* Split into two columns */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Controls Column */}
        <div style={{ 
          padding: '20px',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          position: 'sticky',
          top: '20px'
        }}>
          {/* Core Settings */}
          <div style={{ marginBottom: '24px' }}>
            <h5 style={{ marginBottom: '16px', color: '#666' }}>Core Settings</h5>
            <div style={{ display: 'grid', gap: '12px' }}>
              {Object.entries(SETTINGS.core).map(([key, config]) => (
                <SettingControl key={key} config={config} />
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h5 style={{ marginBottom: '16px', color: '#666' }}>Features</h5>
            <div style={{ display: 'grid', gap: '12px' }}>
              {Object.entries(SETTINGS.features).map(([key, config]) => (
                <SettingControl key={key} config={config} />
              ))}
            </div>
          </div>
        </div>

        {/* Preview and Documentation Column */}
        <div>
          {/* Calendar Preview */}
          <div style={{ 
            padding: '20px',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            backgroundColor: '#fff',
            marginBottom: '24px'
          }}>
            <h5 style={{ marginBottom: '16px', color: '#666' }}>Preview</h5>
            <DateRangePicker {...settings} />
          </div>

          {/* Documentation */}
          <div style={{ 
            padding: '20px',
            border: '1px solid #eee',
            borderRadius: '8px',
            backgroundColor: '#fff'
          }}>
            <h2 style={{ marginBottom: '24px', color: '#333', fontSize: '20px' }}>Documentation</h2>

            {/* Documentation sections in a horizontal layout */}
            <div style={{ display: 'grid', gap: '24px' }}>
              {/* Core Props */}
              <div>
                <h3 style={{ 
                  marginBottom: '12px', 
                  color: '#444',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>Core Properties</span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    fontWeight: 'normal',
                    backgroundColor: '#f8f9fa',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    Required configuration
                  </span>
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Property</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Default</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(SETTINGS.core).map(([key, config]) => (
                      <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', color: '#0366d6' }}>{config.id}</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#666' }}>
                          {config.type === 'style-editor' ? 'object' : config.type}
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#666' }}>
                          {config.type === 'select' 
                            ? config.default
                            : String(config.default)}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {config.description}
                          {config.type === 'select' && (
                            <div style={{ marginTop: '4px', color: '#666' }}>
                              Options: {config.options?.map(opt => opt.value).join(' | ')}
                            </div>
                          )}
                          {config.type === 'number' && (
                            <div style={{ marginTop: '4px', color: '#666' }}>
                              Range: {config.min} - {config.max}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Features in a grid */}
              <div>
                <h3 style={{ 
                  marginBottom: '12px', 
                  color: '#444',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>Features</span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    fontWeight: 'normal',
                    backgroundColor: '#f8f9fa',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    Optional toggles
                  </span>
                </h3>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '12px'
                }}>
                  {Object.entries(SETTINGS.features).map(([key, config]) => (
                    <div key={key} style={{ 
                      padding: '12px',
                      border: '1px solid #eee',
                      borderRadius: '6px',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '4px'
                      }}>
                        <span style={{ 
                          color: '#0366d6',
                          fontWeight: 500,
                          fontSize: '14px'
                        }}>
                          {config.id}
                        </span>
                        <span style={{ 
                          fontSize: '12px',
                          color: '#666',
                          padding: '2px 6px',
                          backgroundColor: '#fff',
                          borderRadius: '4px',
                          border: '1px solid #eee'
                        }}>
                          {String(config.default)}
                        </span>
                      </div>
                      <p style={{ 
                        fontSize: '13px',
                        color: '#666',
                        margin: '4px 0'
                      }}>
                        {config.description}
                      </p>
                      {config.id in DISPLAY_MODE_CONSTRAINTS.embedded && (
                        <div style={{ 
                          marginTop: '4px',
                          fontSize: '12px',
                          color: '#664d03',
                          backgroundColor: '#fff3cd',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}>
                          Constrained in embedded mode
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Style Presets in a grid */}
              <div>
                <h3 style={{ 
                  marginBottom: '12px', 
                  color: '#444',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>Style Presets</span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    fontWeight: 'normal',
                    backgroundColor: '#f8f9fa',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    Appearance customization
                  </span>
                </h3>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '12px'
                }}>
                  {Object.entries(SETTINGS.core.containerStyle.presets).map(([name, styles]) => (
                    <div key={name} style={{ 
                      padding: '12px',
                      border: '1px solid #eee',
                      borderRadius: '6px',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <div style={{ 
                        marginBottom: '8px',
                        color: '#0366d6',
                        fontWeight: 500,
                        fontSize: '14px'
                      }}>
                        {name}
                      </div>
                      {styles ? (
                        <pre style={{ 
                          margin: 0,
                          padding: '8px',
                          backgroundColor: '#fff',
                          borderRadius: '4px',
                          fontSize: '12px',
                          border: '1px solid #eee',
                          maxHeight: '120px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(styles, null, 2)}
                        </pre>
                      ) : (
                        <div style={{ 
                          padding: '8px',
                          color: '#666',
                          fontStyle: 'italic',
                          fontSize: '13px',
                          backgroundColor: '#fff',
                          borderRadius: '4px',
                          border: '1px solid #eee'
                        }}>
                          Uses default container styles
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;