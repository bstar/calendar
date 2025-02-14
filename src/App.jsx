import { useState } from 'react';
import './bootstrap.min.css'

import DateRangePicker from './components/DateRangePicker';
import { SETTINGS, getDefaultSettings, DISPLAY_MODE_CONSTRAINTS } from './components/DateRangePicker.config';

function App() {
  const [settings, setSettings] = useState(getDefaultSettings());

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
    const [styleText, setStyleText] = useState(
      value ? JSON.stringify(value, null, 2) : ''
    );

    // Determine which presets are currently active by comparing their styles
    const getActivePresets = () => {
      if (!value) return ['Default'];
      
      return Object.entries(config.presets)
        .filter(([name, presetStyles]) => {
          if (name === 'Default') return false;
          if (!presetStyles) return false;
          
          // Check if all styles from this preset are present in current value
          return Object.entries(presetStyles).every(([key, val]) => 
            value[key] === val
          );
        })
        .map(([name]) => name);
    };

    const handlePresetChange = (e) => {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      
      // Combine all selected presets
      const combinedStyles = selectedOptions.reduce((styles, presetName) => {
        if (presetName === 'Default') return null;
        return {
          ...styles,
          ...config.presets[presetName]
        };
      }, {});

      onChange({ target: { value: combinedStyles } });
      setStyleText(combinedStyles ? JSON.stringify(combinedStyles, null, 2) : '');
    };

    const activePresets = getActivePresets();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <select
            multiple
            size={4}
            value={activePresets}
            onChange={handlePresetChange}
            style={{ 
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              width: '100%'
            }}
          >
            {Object.keys(config.presets).map(preset => (
              <option 
                key={preset} 
                value={preset}
                style={{
                  padding: '4px 8px',
                  cursor: 'pointer',
                  backgroundColor: activePresets.includes(preset) ? '#f0f7ff' : undefined
                }}
              >
                {preset}
                {activePresets.includes(preset) && ' ✓'}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              backgroundColor: '#fff',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              height: 'fit-content'
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
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ 
        marginBottom: '20px', 
        padding: '20px',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa'
      }}>
        {/* Core Settings */}
        <div style={{ marginBottom: '24px' }}>
          <h5 style={{ marginBottom: '16px', color: '#666' }}>Core Settings</h5>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '12px',
            alignItems: 'start'
          }}>
            {Object.entries(SETTINGS.core).map(([key, config]) => (
              <SettingControl key={key} config={config} />
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h5 style={{ marginBottom: '16px', color: '#666' }}>Features</h5>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '12px' 
          }}>
            {Object.entries(SETTINGS.features).map(([key, config]) => (
              <SettingControl key={key} config={config} />
            ))}
          </div>
        </div>
      </div>

      <DateRangePicker {...settings} />

      {/* Documentation */}
      <div style={{ marginTop: '40px', padding: '20px' }}>
        <h2 style={{ marginBottom: '24px', color: '#333' }}>Documentation</h2>

        {/* Core Props */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ 
            marginBottom: '16px', 
            color: '#444',
            paddingBottom: '8px',
            borderBottom: '1px solid #eee'
          }}>
            Core Properties
          </h3>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
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

        {/* Features */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ 
            marginBottom: '16px', 
            color: '#444',
            paddingBottom: '8px',
            borderBottom: '1px solid #eee'
          }}>
            Features
          </h3>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Feature</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Default</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(SETTINGS.features).map(([key, config]) => (
                <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', color: '#0366d6' }}>{config.id}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', color: '#666' }}>
                    {config.type}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', color: '#666' }}>
                    {String(config.default)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {config.description}
                    {config.id in DISPLAY_MODE_CONSTRAINTS.embedded && (
                      <div style={{ 
                        marginTop: '4px', 
                        color: '#664d03',
                        backgroundColor: '#fff3cd',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        Note: Behavior is constrained in embedded mode
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Style Presets */}
        <div>
          <h3 style={{ 
            marginBottom: '16px', 
            color: '#444',
            paddingBottom: '8px',
            borderBottom: '1px solid #eee'
          }}>
            Style Presets
          </h3>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Preset</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Styles</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(SETTINGS.core.containerStyle.presets).map(([name, styles]) => (
                <tr key={name} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', color: '#0366d6' }}>{name}</td>
                  <td style={{ padding: '12px' }}>
                    {styles ? (
                      <pre style={{ 
                        margin: 0,
                        padding: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {JSON.stringify(styles, null, 2)}
                      </pre>
                    ) : (
                      <span style={{ color: '#666', fontStyle: 'italic' }}>Default styles</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;