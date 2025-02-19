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

// Common styles we can reuse
const styles = {
  sectionHeading: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    color: '#444',
    fontWeight: '600'
  },
  select: {
    width: '100%',
    padding: '6px 10px',
    fontSize: '13px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#444',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '16px',
    '&:hover': {
      borderColor: '#0366d6'
    },
    '&:focus': {
      outline: 'none',
      borderColor: '#0366d6',
      boxShadow: '0 0 0 2px rgba(3, 102, 214, 0.2)'
    }
  },
  label: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '12px',
    color: '#666',
    fontWeight: '600'
  }
};

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
      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px' }}>
          <label style={styles.label}>
            {config.label}
          </label>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {config.description}
          </div>
        </div>

        <div>
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
              <span style={{ fontSize: '13px', color: '#444' }}>Enable</span>
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
                ...styles.select,
                backgroundImage: 'none'
              }}
            />
          ) : config.type === 'select' ? (
            <select
              value={settings[config.id]}
              onChange={handleChange(config.id)}
              style={styles.select}
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
              padding: '4px 8px',
              background: 'transparent',
              color: '#0366d6',
              border: '1px solid #0366d6',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            Apply
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

  const LayerMetadataEditor = ({ layer, onUpdate }) => {
    const handleChange = (field) => (event) => {
      const value = event.target.type === 'checkbox' 
        ? event.target.checked 
        : event.target.value;

      onUpdate(layer.name, {
        ...layer,
        [field]: value
      });
    };

    return (
      <div style={{ marginBottom: '16px' }}>
        {Object.entries(SETTINGS.layers.controls).map(([field, control]) => (
          <div key={field} style={{ marginBottom: '8px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '4px',
              fontSize: '12px',
              color: '#666'
            }}>
              {control.label}
              {control.required && <span style={{ color: '#dc3545' }}> *</span>}
            </label>
            {control.type === 'text' ? (
              <input
                type="text"
                value={layer[field] || ''}
                onChange={handleChange(field)}
                disabled={field === 'name' && layer.required} // Prevent editing name of required layers
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  fontSize: '12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px'
                }}
              />
            ) : control.type === 'select' ? (
              <select
                value={layer[field] || ''}
                onChange={handleChange(field)}
                disabled={field === 'type' && layer.required} // Prevent editing type of required layers
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  fontSize: '12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px'
                }}
              >
                {control.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : control.type === 'boolean' ? (
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '12px',
                cursor: layer.required ? 'not-allowed' : 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={layer[field] || false}
                  onChange={handleChange(field)}
                  disabled={layer.required} // Prevent editing required status of required layers
                />
                <span>Enable</span>
              </label>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  const LayerManager = ({ layers, onUpdate }) => {
    const handleAddLayer = () => {
      const newLayer = {
        ...SETTINGS.layers.actions.newLayerTemplate,
        name: `Layer_${Date.now()}`,
        title: `New Layer ${layers.length + 1}`
      };
      onUpdate([...layers, newLayer]);
    };

    const handleRemoveLayer = (layerName) => {
      // Prevent removing the base layer
      if (layerName === 'Calendar') return;
      onUpdate(layers.filter(l => l.name !== layerName));
    };

    return (
      <div style={{ marginBottom: '24px' }}>
        {/* Global Layer Controls */}
        <div style={{ 
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={styles.sectionHeading}>Layer Settings</h3>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={styles.label}>Default Layer</label>
              <select
                value={settings.defaultLayer}
                onChange={(e) => {
                  setSettings(prev => ({
                    ...prev,
                    defaultLayer: e.target.value
                  }));
                }}
                style={styles.select}
              >
                {layers.map(layer => (
                  <option key={layer.name} value={layer.name}>
                    {layer.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={settings.showLayerControls}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      showLayerControls: e.target.checked
                    }));
                  }}
                  style={{ marginRight: '8px' }}
                />
                Show Layer Controls
              </label>
            </div>
          </div>
        </div>

        {/* Layer List Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={styles.sectionHeading}>Layers</h3>
          <button
            onClick={handleAddLayer}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              color: '#0366d6',
              border: '1px solid #0366d6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#f6f8fa'
              }
            }}
          >
            Add Layer
          </button>
        </div>

        {/* Layer List */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {layers.map((layer) => (
            <div key={layer.name} style={{ 
              padding: '16px',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              backgroundColor: '#fff',
              position: 'relative'
            }}>
              {layer.name !== 'Calendar' && (
                <button
                  onClick={() => handleRemoveLayer(layer.name)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '4px 8px',
                    background: 'transparent',
                    color: '#dc3545',
                    border: '1px solid #dc3545',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Remove
                </button>
              )}
              
              <LayerMetadataEditor 
                layer={layer}
                onUpdate={(layerName, updatedLayer) => {
                  onUpdate(layers.map(l => 
                    l.name === layerName ? updatedLayer : l
                  ));
                }}
              />
              <LayerDataEditor 
                layer={layer} 
                onUpdate={(layerName, newData) => {
                  onUpdate(layers.map(l => 
                    l.name === layerName 
                      ? { ...l, data: newData }
                      : l
                  ));
                }}
              />
            </div>
          ))}
        </div>
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
          <LayerManager 
            layers={settings.layers}
            onUpdate={(updatedLayers) => {
              setSettings(prev => ({
                ...prev,
                layers: updatedLayers
              }));
            }}
          />
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
          {/* Export Button - Moved outside the relative container */}
          <button
            onClick={handleExport}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              padding: '4px 8px',
              backgroundColor: '#e6f4ea',  // Pastel green
              color: '#666',
              borderWidth: '0 1px 1px 0',
              borderStyle: 'solid',
              borderColor: '#dee2e6',
              borderRadius: '0 8px 0 8px',  // Only round bottom-right and top-right
              cursor: 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#d4eede',
                color: '#1a7f37'
              }
            }}
          >
            Export
          </button>

          <div style={{ 
            position: 'relative', 
            marginBottom: '16px' 
          }}>
            {/* Tabs */}
            <div style={{ 
              display: 'flex', 
              marginBottom: '16px', 
              borderBottom: '1px solid #dee2e6' 
            }}>
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
                    outline: 'none'
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
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
            <DateRangePickerNew 
              {...settings} 
              defaultLayer={settings.defaultLayer}
              showLayerControls={settings.showLayerControls}
            />
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