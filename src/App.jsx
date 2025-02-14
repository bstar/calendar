import { useState } from 'react';
import './bootstrap.min.css'

import DateRangePicker from './components/DateRangePicker';
import { SETTINGS, getDefaultSettings } from './components/DateRangePicker.config';

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

  const SettingControl = ({ config }) => {
    const isOverridden = settings[config.id] !== config.default;
    const [showMeta, setShowMeta] = useState(false);

    return (
      <div style={{ 
        padding: '12px',
        border: '1px solid #eee',
        borderRadius: '6px',
        backgroundColor: isOverridden ? '#fff' : '#fafafa',
        width: '100%'
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

        {/* Control Input */}
        <div>
          {config.type === 'boolean' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings[config.id]}
                onChange={handleChange(config.id)}
              />
              <span style={{ fontSize: '14px' }}>Enable</span>
            </label>
          )}
          {config.type === 'number' && (
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
          )}
          {config.type === 'select' && (
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
          )}
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
    </div>
  );
}

export default App;