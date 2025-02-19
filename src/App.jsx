import { useState, useEffect } from 'react';
import './bootstrap.min.css'

import { SETTINGS, getDefaultSettings, DISPLAY_MODE_CONSTRAINTS } from './components/DateRangePicker.config';
import DateRangePickerNew from './components/DateRangePickerNew';

// Import package.json to access version, description, and name
import packageInfo from '../package.json';

const SAMPLE_EVENTS_DATA = [
  { date: '2025-02-15', title: 'Team Meeting', type: 'work', time: '10:00 AM', description: 'Weekly sync' },
  { date: '2025-02-20', title: 'Lunch with Client', type: 'work', time: '12:30 PM', description: 'Project discussion' },
  { date: '2025-02-25', title: 'Birthday Party', type: 'personal', time: '7:00 PM', description: 'Cake and presents!' },
  { date: '2025-03-05', title: 'Conference', type: 'work', time: '9:00 AM', description: 'Annual tech summit' },
  { date: '2025-03-12', title: 'Dentist', type: 'personal', time: '2:00 PM', description: 'Regular checkup' },
  { date: '2025-03-18', title: 'Project Deadline', type: 'work', time: '5:00 PM', description: 'Final deliverables due' },
  { date: '2025-03-22', title: 'Weekend Trip', type: 'personal', time: 'All day', description: 'Beach getaway' }
];

function App() {
  const [settings, setSettings] = useState({
    ...getDefaultSettings(),
    isOpen: true  // Force calendar to be open on initial load
  });

  const [activeTab, setActiveTab] = useState('core');

  // Initialize layers with data
  useEffect(() => {
    console.log('=== Initial Settings ===');
    console.log('Before update:', settings.layers);
    
    setSettings(prev => {
      const updatedSettings = {
        ...prev,
        layers: prev.layers.map(layer => {
          if (layer.name === 'Events') {
            console.log('Adding events data to Events layer');
            return { ...layer, data: SAMPLE_EVENTS_DATA };
          }
          return layer;
        })
      };
      console.log('After update:', updatedSettings.layers);
      return updatedSettings;
    });
  }, []);

  // Also log when settings change
  useEffect(() => {
    console.log('Settings changed:', settings);
  }, [settings]);

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
                  opacity: showMeta ? 1 : 0.6,
                  outline: 'none'
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

  const LayerDataEditor = ({ layer, onUpdate }) => {
    const [dataText, setDataText] = useState(
      JSON.stringify(layer.data || [], null, 2)
    );

    const handleApply = () => {
      try {
        const newData = JSON.parse(dataText);
        onUpdate(layer.name, newData);
      } catch (e) {
        alert('Invalid JSON format');
      }
    };

    return (
      <div style={{ marginTop: '12px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px' 
        }}>
          <h4 style={{ 
            margin: 0,
            fontSize: '14px',
            color: '#666'
          }}>
            Layer Data
          </h4>
          <button
            onClick={handleApply}
            style={{
              padding: '4px 12px',
              background: '#0366d6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Apply Changes
          </button>
        </div>

        <textarea
          value={dataText}
          onChange={(e) => setDataText(e.target.value)}
          style={{
            width: '100%',
            height: '200px',
            padding: '12px',
            fontFamily: 'monospace',
            fontSize: '12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            resize: 'vertical',
            backgroundColor: '#f6f8fa'
          }}
        />
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'core':
        return (
          <div style={{ display: 'grid', gap: '12px' }}>
            {Object.entries(SETTINGS.core).map(([key, config]) => (
              <SettingControl key={key} config={config} />
            ))}
          </div>
        );
      case 'features':
        return (
          <div style={{ display: 'grid', gap: '12px' }}>
            {Object.entries(SETTINGS.features).map(([key, config]) => (
              <SettingControl key={key} config={config} />
            ))}
          </div>
        );
      case 'layers':
        return (
          <div style={{ display: 'grid', gap: '24px' }}>
            {settings.layers.map((layer) => (
              <div key={layer.name} style={{ 
                padding: '16px',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                backgroundColor: '#fff'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div>
                    <h3 style={{ 
                      margin: '0 0 4px',
                      fontSize: '18px',
                      color: '#0366d6'
                    }}>
                      {layer.title}
                    </h3>
                    <p style={{ 
                      margin: '0',
                      color: '#666',
                      fontSize: '14px'
                    }}>
                      {layer.description}
                    </p>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    backgroundColor: layer.required ? '#e1e4e8' : '#f6f8fa',
                    borderRadius: '12px',
                    color: '#666'
                  }}>
                    {layer.type}
                  </div>
                </div>

                {/* Replace the old data display with the new editor */}
                <LayerDataEditor 
                  layer={layer} 
                  onUpdate={(layerName, newData) => {
                    setSettings(prev => ({
                      ...prev,
                      layers: prev.layers.map(l => 
                        l.name === layerName 
                          ? { ...l, data: newData }
                          : l
                      )
                    }));
                  }}
                />
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const handleExport = () => {
    const configString = JSON.stringify(settings, null, 2);
    navigator.clipboard.writeText(configString).then(() => {
      alert('Configuration copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1800px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ 
        padding: '20px', 
        borderBottom: '1px solid #dee2e6', 
        marginBottom: '24px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <h1 style={{ 
          margin: '0 0 8px', 
          color: '#0366d6', 
          fontSize: '36px',  // Larger font size
          fontWeight: 'bold',  // Bold font weight
          fontFamily: 'Arial, sans-serif',  // Change font family
          letterSpacing: '1.5px',  // Add letter spacing
          display: 'flex',  // Use flexbox for alignment
          justifyContent: 'center',  // Center content
          alignItems: 'flex-end',  // Align items to the bottom
          gap: '12px'  // Space between name and version
        }}>
          {packageInfo.name}
          <span style={{ 
            backgroundColor: '#e1e4e8',  // Light gray background
            color: '#0366d6',  // Blue text color
            padding: '4px 8px',  // Padding for pill effect
            borderRadius: '12px',  // Rounded corners
            fontSize: '14px',  // Font size for version
            fontWeight: 'normal',  // Normal font weight
            paddingBottom: '4px',
            marginBottom: '6px',
          }}>
            v{packageInfo.version}
          </span>
        </h1>
        <p style={{ margin: '0', color: '#666', fontSize: '16px' }}>
          {packageInfo.description}
        </p>
      </header>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        <div style={{ 
          padding: '20px',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          position: 'sticky',
          top: '20px'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: '16px', borderBottom: '1px solid #dee2e6' }}>
            {['core', 'features', 'layers'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #0366d6' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: activeTab === tab ? '#0366d6' : '#666',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === tab ? 'bold' : 'normal',
                  transition: 'color 0.2s ease',
                  marginRight: '8px',
                  outline: 'none'  // Remove default focus outline
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {renderTabContent()}

          {/* Export Button */}
          <button
            onClick={handleExport}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#0366d6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s ease',
              width: '100%'
            }}
          >
            Export Configuration
          </button>
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
            <DateRangePickerNew {...settings} />
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