import React, { useState, useEffect } from 'react';
import './bootstrap.min.css'

import { 
  SETTINGS, 
  getDefaultSettings, 
  DISPLAY_MODE_CONSTRAINTS,
  CalendarSettings,
  Layer,
  EventData,
  BackgroundData,
  SettingControl,
  DEFAULT_COLORS,
  validateLayers
} from './components/DateRangePicker.config';
import { RestrictionConfig, RestrictionType } from './components/DateRangePickerNew/restrictions/types';
import DateRangePickerNew from './components/CLACalendar';

// Import package.json to access version, description, and name
import packageInfo from '../package.json';

// CSS-in-JS types
interface ExtendedCSSProperties extends React.CSSProperties {
  '&:hover'?: React.CSSProperties;
  '&:focus'?: React.CSSProperties;
}

type BorderCollapse = 'collapse' | 'separate';
type TextAlign = 'left' | 'center' | 'right';

interface TableStyles {
  width: string;
  borderCollapse: BorderCollapse;
  fontSize: string;
}

interface TableHeaderStyles {
  backgroundColor: string;
  padding: string;
  textAlign: TextAlign;
  borderBottom: string;
}

// Initial settings that exactly match the export structure
const getInitialSettings = (): CalendarSettings => ({
  displayMode: "embedded",
  visibleMonths: 2,
  singleMonthWidth: 500,
  showMonthHeadings: true,
  selectionMode: "range",
  showTooltips: true,
  showHeader: true,
  closeOnClickAway: true,
  showSubmitButton: false,
  showFooter: true,
  enableOutOfBoundsScroll: true,
  suppressTooltipsOnSelection: false,
  showSelectionAlert: false,
  startWeekOnSunday: false,
  layers: [
    {
      name: "Calendar",
      title: "Base Calendar",
      description: "Basic calendar functionality",
      required: true,
      visible: true,
      data: {
        events: [],
        background: []
      }
    },
    {
      name: "sample-events",
      title: "Event Calendar",
      description: "Display events and appointments",
      visible: true,
      data: {
        events: [
          {
            date: "2025-02-15",
            title: "Team Meeting",
            type: "meeting",
            time: "10:00 AM",
            description: "Weekly sync",
            color: "#0366d6"
          },
          {
            date: "2025-02-20",
            title: "Lunch with Client",
            type: "meeting",
            time: "12:30 PM",
            description: "Project discussion",
            color: "#6f42c1"
          },
          {
            date: "2025-02-25",
            title: "Birthday Party",
            type: "meeting",
            time: "7:00 PM",
            description: "Cake and presents!",
            color: "#e83e8c"
          },
          {
            date: "2025-03-05",
            title: "Conference",
            type: "meeting",
            time: "9:00 AM",
            description: "Annual tech summit",
            color: "#20c997"
          },
          {
            date: "2025-03-12",
            title: "Dentist",
            type: "meeting",
            time: "2:00 PM",
            description: "Regular checkup",
            color: "#fd7e14"
          },
          {
            date: "2025-03-18",
            title: "Project Deadline",
            type: "meeting",
            time: "5:00 PM",
            description: "Final deliverables due",
            color: "#dc3545"
          },
          {
            date: "2025-03-22",
            title: "Weekend Trip",
            type: "meeting",
            time: "All day",
            description: "Beach getaway",
            color: "#28a745"
          }
        ],
        background: []
      }
    },
    {
      name: "sample-background",
      title: "Background Colors",
      description: "Display date range backgrounds",
      visible: true,
      data: {
        background: [
          {
            startDate: "2025-01-05",
            endDate: "2025-01-15",
            color: "#0366d633"
          },
          {
            startDate: "2025-02-10",
            endDate: "2025-02-20",
            color: "#dc354533"
          },
          {
            startDate: "2025-03-01",
            endDate: "2025-03-10",
            color: "#28a74533"
          }
        ]
      }
    },
    {
      name: "combined-layer",
      title: "Combined View",
      description: "Events with background highlighting",
      visible: true,
      data: {
        events: [
          {
            date: "2025-02-01",
            title: "Sprint Planning",
            type: "meeting",
            time: "10:00 AM",
            description: "Two-week sprint kickoff",
            color: "#0366d6"
          },
          {
            date: "2025-02-14",
            title: "Sprint Review",
            type: "meeting",
            time: "4:00 PM",
            description: "Sprint demo and retrospective",
            color: "#28a745"
          }
        ],
        background: [
          {
            startDate: "2025-02-01",
            endDate: "2025-02-14",
            color: "#f6c23e33"
          },
          {
            startDate: "2025-02-05",
            endDate: "2025-02-07",
            color: "#28a74533"
          }
        ]
      }
    }
  ],
  showLayersNavigation: true,
  defaultLayer: "Calendar",
  colors: {
    primary: "#0366d6",
    success: "#28a745",
    warning: "#f6c23e",
    danger: "#dc3545",
    purple: "#6f42c1",
    teal: "#20c997",
    orange: "#fd7e14",
    pink: "#e83e8c"
  },
  restrictionConfig: {
    restrictions: [
      {
        type: "daterange",
        enabled: true,
        ranges: [
          {
            start: "2025-01-01",
            end: "2025-01-15",
            message: "This date range is restricted"
          }
        ]
      },
      {
        type: "daterange",
        enabled: true,
        ranges: [
          {
            start: "2025-01-20",
            end: "2025-01-25",
            message: "This date range is restricted"
          }
        ]
      },
      {
        type: "restricted_boundary",
        enabled: true,
        ranges: [
          {
            start: "2025-02-01",
            end: "2025-02-15",
            message: "This boundary range is restricted (Feb 1-15)"
          },
          {
            start: "2025-02-20",
            end: "2025-02-28",
            message: "This boundary range is restricted (Feb 20-28)"
          }
        ]
      }
    ]
  }
});

const baseButtonStyle = {
  padding: '4px 12px',
  fontSize: '13px',
  border: '1px solid #cfd4d9',
  borderRadius: '4px',
  backgroundColor: '#fff',
  color: '#666',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  transition: 'all 0.2s ease',
  minHeight: '32px'
};

// Add proper types for styles
interface StyleProps {
  style: ExtendedCSSProperties;
}

// Update the style objects to use proper types
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
    appearance: 'none' as const, // Type assertion for appearance
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
  } as ExtendedCSSProperties,
  textarea: {
    width: '100%',
    padding: '6px 10px',
    fontSize: '13px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#444',
    fontFamily: 'monospace',
    resize: 'vertical',
    minHeight: '100px',
    '&:hover': {
      borderColor: '#0366d6'
    },
    '&:focus': {
      outline: 'none',
      borderColor: '#0366d6',
      boxShadow: '0 0 0 2px rgba(3, 102, 214, 0.2)'
    }
  } as ExtendedCSSProperties,
  label: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '12px',
    color: '#666',
    fontWeight: '600'
  },
  button: {
    padding: '6px 12px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    margin: '4px',
    '&:hover': {
      backgroundColor: '#e9ecef'
    }
  },
  confirmButton: {
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: '1px solid #28a745',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    margin: '4px',
    '&:hover': {
      backgroundColor: '#218838'
    }
  },
  // Button variants
  buttonVariants: {
    primary: {
      backgroundColor: '#0366d6',
      color: '#fff',
      border: 'none',
      '&:hover': {
        backgroundColor: '#0256b9'
      }
    },
    secondary: {
      backgroundColor: '#f8f9fa',
      '&:hover': {
        backgroundColor: '#e9ecef'
      }
    },
    import: {
      backgroundColor: '#e3f2fd',
      '&:hover': {
        backgroundColor: '#bbdefb',
        color: '#1565c0'
      }
    },
    export: {
      backgroundColor: '#e6f4ea',
      '&:hover': {
        backgroundColor: '#d4eede',
        color: '#1a7f37'
      }
    },
    remove: {
      backgroundColor: '#ffe6e6',  // Light red background
      '&:hover': {
        backgroundColor: '#ffcccc',
        color: '#dc3545'
      }
    }
  },
  containerStyleButton: baseButtonStyle,
  containerStyleButtonSelected: {
    backgroundColor: '#e3f2fd',
    color: '#0366d6'
  },
  jsonEditButton: {
    ...baseButtonStyle,
    marginLeft: 'auto',
    backgroundColor: '#e3f2fd',
    '&:hover': {
      backgroundColor: '#bbdefb',
      color: '#0366d6'
    }
  },
  input: {
    width: '100%',
    padding: '6px 10px',
    fontSize: '13px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#444',
    '&:hover': {
      borderColor: '#0366d6'
    },
    '&:focus': {
      outline: 'none',
      borderColor: '#0366d6',
      boxShadow: '0 0 0 2px rgba(3, 102, 214, 0.2)'
    }
  } as ExtendedCSSProperties,
  tabContent: {
    padding: '20px',
    border: '1px solid #cfd4d9',
    borderRadius: '8px',
    backgroundColor: '#fff'
  },
  heading: {
    marginBottom: '24px',
    color: '#333',
    fontSize: '20px'
  },
  labelCell: {
    width: '70%',
    paddingRight: '24px'
  },
  controlCell: {
    width: '30%',
    textAlign: 'right',
    verticalAlign: 'top',
    paddingTop: '4px'
  }
};

// Documentation styles
const docStyles = {
  section: {
    marginBottom: '24px'
  },
  mainHeading: {
    marginBottom: '24px',
    color: '#333',
    fontSize: '20px'
  },
  sectionHeading: {
    color: '#444',
    fontSize: '16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  subHeading: {
    color: '#444',
    fontSize: '14px',
    marginBottom: '12px'
  },
  badge: {
    fontSize: '12px',
    color: '#666',
    fontWeight: 'normal',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  // Pastel color variants for badges
  badgeVariants: {
    blue: { backgroundColor: '#e3f2fd' },
    green: { backgroundColor: '#e6f4ea' },
    purple: { backgroundColor: '#f3e8fd' },
    yellow: { backgroundColor: '#fff8e1' }
  },
  description: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '16px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as BorderCollapse,
    fontSize: '14px'
  } as TableStyles,
  tableHeader: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left' as TextAlign,
    borderBottom: '2px solid #dee2e6'
  } as TableHeaderStyles,
  tableCell: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6'
  },
  code: {
    backgroundColor: '#f6f8fa',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'monospace'
  },
  codeBlock: {
    margin: 0,
    padding: '16px',
    backgroundColor: '#f6f8fa',
    borderRadius: '6px',
    fontSize: '13px',
    lineHeight: '1.45',
    overflow: 'auto',
    fontFamily: 'monospace'
  },
  container: {
    padding: '20px',
    border: '1px solid #cfd4d9',
    borderRadius: '8px',
    backgroundColor: '#fff'
  }
};

function App() {
  const [settings, setSettings] = useState<CalendarSettings>(getInitialSettings());

  const [activeTab, setActiveTab] = useState('core');
  const [activeLayer, setActiveLayer] = useState<string>(settings.defaultLayer || '');
  const [restrictionConfig, setRestrictionConfig] = useState<RestrictionConfig>({
    restrictions: settings.restrictionConfig?.restrictions || [],
  });

  // Add new state for import modal
  const [showImportModal, setShowImportModal] = useState(false);

  // Add state for draft changes
  const [draftRestrictionConfig, setDraftRestrictionConfig] = useState(restrictionConfig);

  // Update active layer when default layer changes in settings
  useEffect(() => {
    setActiveLayer(settings.defaultLayer || '');
  }, [settings.defaultLayer]);

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
          // Check if all properties in the preset match the current value
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
        {!isEditing && (
          <>
            {/* Preset buttons container */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {Object.entries(config.presets)
                .filter(([name]) => name !== 'Default')  // Remove Default from presets
                .map(([name]) => (
                  <button
                    key={name}
                    onClick={() => handlePresetToggle(name)}
                    style={{
                      ...styles.containerStyleButton,
                      ...(value === config.presets[name] ? styles.containerStyleButtonSelected : {})
                    }}
                  >
                    {value === config.presets[name] && (
                      <span style={{ fontSize: '16px', marginRight: '4px' }}>✓</span>
                    )}
                    {name}
                  </button>
                ))}
            </div>

            {/* Action buttons container */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handlePresetToggle('Default')}
                style={{
                  ...styles.containerStyleButton,
                  backgroundColor: '#e6f4ea',  // Light green background
                  color: '#1a7f37',  // Green text
                  '&:hover': {
                    backgroundColor: '#d4eede',
                    color: '#1a7f37'
                  }
                }}
              >
                <span style={{ fontSize: '14px', marginRight: '4px' }}>↺</span>
                Reset to Default
              </button>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  ...styles.containerStyleButton,
                  backgroundColor: '#f3e8fd',  // Light purple background
                  color: '#6f42c1',  // Purple text
                  '&:hover': {
                    backgroundColor: '#e9d5fc',
                    color: '#6f42c1'
                  }
                }}
              >
                <span style={{ fontSize: '14px', marginRight: '4px' }}>{ }︎</span>
                Edit JSON
              </button>
            </div>
          </>
        )}

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
              style={styles.containerStyleButton}
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
      JSON.stringify(layer.data || { events: [], background: [] }, null, 2)
    );

    const handleApply = () => {
      try {
        const newData = JSON.parse(dataText);
        onUpdate(newData);
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

  const LayerManager = ({ layers, onUpdate }: { layers: Layer[], onUpdate: (layers: Layer[]) => void }) => {
    return (
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '10px' 
          }}>
            <label style={{
              ...styles.label,
              marginBottom: 0,
              whiteSpace: 'nowrap'
            }}>
              Default Layer:
            </label>
            <select
              value={activeLayer}
              onChange={(e) => {
                handleDefaultLayerChange(e.target.value);
              }}
              style={{
                ...styles.select,
                minWidth: '180px'
              }}
            >
              {layers.length === 0 && (
                <option value="" disabled>No layers available</option>
              )}
              {layers.map(layer => (
                <option key={layer.name} value={layer.name}>
                  {layer.title || layer.name} {layer.required ? '(Required)' : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              const newLayer = {
                ...SETTINGS.layers.actions.newLayerTemplate,
                name: `Layer_${Date.now()}`,
                title: `New Layer ${layers.length + 1}`,
                data: {
                  events: [],
                  background: []
                }
              };
              onUpdate([...layers, newLayer]);
            }}
            style={styles.button}
          >
            Add Layer
          </button>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {layers.map(layer => (
            <div key={layer.name} style={{ 
              padding: '16px',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              position: 'relative'  // Add this to position the button
            }}>
              {!layer.required && (
                <button
                  onClick={() => onUpdate(layers.filter(l => l.name !== layer.name))}
                  style={{
                    ...styles.button,
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: '#ffe6e6',
                    color: '#dc3545',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: '1px solid #dee2e6',
                    borderBottom: '1px solid #dee2e6',
                    borderBottomLeftRadius: '6px',    // Keep bottom left rounded
                    borderTopRightRadius: '8px',      // Keep top right rounded
                    borderBottomRightRadius: '0',     // Remove bottom right rounding
                    padding: '4px 8px',
                    fontSize: '12px',
                    '&:hover': {
                      backgroundColor: '#ffcccc'
                    }
                  }}
                >
                  Remove
                </button>
              )}
              <div>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <h4 style={{ margin: 0 }}>
                    {layer.title}
                    {layer.required && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        color: '#666',
                        fontWeight: 'normal',
                        backgroundColor: '#f8f9fa',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        Required
                      </span>
                    )}
                  </h4>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Title</label>
                  <input
                    type="text"
                    value={layer.title}
                    onChange={(e) => {
                      const updatedLayer = { ...layer, title: e.target.value };
                      onUpdate(layers.map(l => l.name === layer.name ? updatedLayer : l));
                    }}
                    style={styles.input}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={styles.label}>Description</label>
                  <input
                    type="text"
                    value={layer.description}
                    onChange={(e) => {
                      const updatedLayer = { ...layer, description: e.target.value };
                      onUpdate(layers.map(l => l.name === layer.name ? updatedLayer : l));
                    }}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Layer Data</label>
                  <LayerDataEditor 
                    layer={layer}
                    onUpdate={(newData) => {
                      const updatedLayer = { ...layer, data: newData };
                      onUpdate(layers.map(l => l.name === layer.name ? updatedLayer : l));
                    }}
                  />
                </div>
              </div>
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
          <div style={styles.tabContent}>
            <h3 style={{
              ...styles.heading,
              fontSize: '18px',
              fontWeight: '500',
              color: '#2c3e50',
              marginBottom: '16px'
            }}>
              Features
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              Toggle various calendar features and behaviors. Changes are applied immediately.
            </p>
            <table style={{
              ...styles.table,
              width: '100%',
              borderSpacing: '0 12px',
              borderCollapse: 'separate'
            }}>
              <tbody>
                {Object.entries(SETTINGS.features).map(([key, setting]) => (
                  <tr key={key}>
                    <td style={{
                      ...styles.labelCell,
                      width: '70%',
                      paddingRight: '24px'
                    }}>
                      <label style={{
                        ...styles.label,
                        display: 'block',
                        marginBottom: '4px',
                        fontWeight: '400',
                        fontSize: '15px',
                        color: '#334155'
                      }}>
                        {setting.label}
                      </label>
                      <span style={{
                        fontSize: '13px',
                        color: '#64748b',
                        display: 'block',
                        lineHeight: '1.5'
                      }}>
                        {setting.description}
                      </span>
                    </td>
                    <td style={{
                      ...styles.controlCell,
                      width: '30%',
                      textAlign: 'right',
                      verticalAlign: 'top',
                      paddingTop: '4px'
                    }}>
                      <input
                        type="checkbox"
                        checked={settings[key] as boolean}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }));
                        }}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer'
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  // Handle submit if needed
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0366d6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  '&:hover': {
                    backgroundColor: '#0256b9'
                  }
                } as ExtendedCSSProperties}
              >
                Apply Changes
              </button>
            </div>
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
      case 'restrictions':
        return (
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => setDraftRestrictionConfig(prev => ({
                  restrictions: [
                    ...prev.restrictions,
                    {
                      type: 'daterange',
                      enabled: true,
                      ranges: []
                    }
                  ]
                }))}
                style={styles.button}
              >
                Add Restriction
              </button>
            </div>

            {draftRestrictionConfig.restrictions.map((restriction, restrictionIndex) => (
              <div key={restrictionIndex} style={{ marginBottom: '24px', padding: '16px', border: '1px solid #dee2e6' }}>
                <div style={{ 
                  marginBottom: '16px', 
                  display: 'flex', 
                  gap: '16px', 
                  alignItems: 'center',
                  justifyContent: 'space-between' 
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <select
                      value={restriction.type}
                      onChange={(e) => {
                        const newRestrictions = [...draftRestrictionConfig.restrictions];
                        const newType = e.target.value as RestrictionType;
                        newRestrictions[restrictionIndex] = newType === 'daterange' 
                          ? { type: 'daterange', enabled: true, ranges: [] }
                          : newType === 'boundary'
                          ? { type: 'boundary', enabled: true, date: '', direction: 'before', message: '' }
                          : newType === 'allowedranges'
                          ? { type: 'allowedranges', enabled: true, ranges: [] }
                          : newType === 'restricted_boundary'
                          ? { type: 'restricted_boundary', enabled: true, ranges: [] }
                          : { ...restriction, type: newType };
                        setDraftRestrictionConfig({ restrictions: newRestrictions });
                      }}
                      style={{
                        ...styles.select,
                        minWidth: '160px',
                        width: 'auto'
                      }}
                    >
                      <option value="daterange">Restricted Range</option>
                      <option value="boundary">Date Boundary</option>
                      <option value="allowedranges">Allowed Ranges</option>
                      <option value="restricted_boundary">Restricted Boundary</option>
                    </select>

                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      margin: 0,
                      fontSize: '14px',
                      color: '#444'
                    }}>
                      <input
                        type="checkbox"
                        checked={restriction.enabled}
                        onChange={(e) => {
                          const newRestrictions = [...draftRestrictionConfig.restrictions];
                          newRestrictions[restrictionIndex] = {
                            ...restriction,
                            enabled: e.target.checked
                          };
                          setDraftRestrictionConfig({ restrictions: newRestrictions });
                        }}
                      />
                      Enable
                    </label>
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        const newRestrictions = draftRestrictionConfig.restrictions.filter(
                          (_, index) => index !== restrictionIndex
                        );
                        setDraftRestrictionConfig({ restrictions: newRestrictions });
                      }}
                      style={styles.button}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {(restriction.type === 'daterange' || restriction.type === 'allowedranges' || restriction.type === 'restricted_boundary') && (
                  <div>
                    <h4 style={docStyles.subHeading}>
                      {restriction.type === 'daterange' ? 'Restricted Ranges' : 
                       restriction.type === 'restricted_boundary' ? 'Boundary Ranges' :
                       'Allowed Ranges'}
                    </h4>
                    {restriction.ranges.map((range, rangeIndex) => (
                      <div key={rangeIndex} style={{ marginBottom: '12px', padding: '8px', border: '1px solid #dee2e6' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={styles.label}>Start Date</label>
                            <input
                              type="text"
                              placeholder="YYYY-MM-DD"
                              value={range.start}
                              onChange={(e) => {
                                const newRanges = [...restriction.ranges];
                                newRanges[rangeIndex] = { ...range, start: e.target.value };
                                setDraftRestrictionConfig(prev => ({
                                  restrictions: prev.restrictions.map(r =>
                                    r === restriction ? { ...r, ranges: newRanges } : r
                                  )
                                }));
                              }}
                              style={styles.input}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={styles.label}>End Date</label>
                            <input
                              type="text"
                              placeholder="YYYY-MM-DD"
                              value={range.end}
                              onChange={(e) => {
                                const newRanges = [...restriction.ranges];
                                newRanges[rangeIndex] = { ...range, end: e.target.value };
                                setDraftRestrictionConfig(prev => ({
                                  restrictions: prev.restrictions.map(r =>
                                    r === restriction ? { ...r, ranges: newRanges } : r
                                  )
                                }));
                              }}
                              style={styles.input}
                            />
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Message when selection is restricted"
                          value={range.message}
                          onChange={(e) => {
                            const newRanges = [...restriction.ranges];
                            newRanges[rangeIndex] = { ...range, message: e.target.value };
                            setDraftRestrictionConfig(prev => ({
                              restrictions: prev.restrictions.map(r =>
                                r === restriction ? { ...r, ranges: newRanges } : r
                              )
                            }));
                          }}
                          style={styles.input}
                        />
                        <button
                          onClick={() => {
                            const newRanges = [...restriction.ranges];
                            newRanges.splice(rangeIndex, 1);
                            setDraftRestrictionConfig(prev => ({
                              restrictions: prev.restrictions.map(r =>
                                r === restriction ? { ...r, ranges: newRanges } : r
                              )
                            }));
                          }}
                          style={styles.button}
                        >
                          Remove Range
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newRestrictions = [...draftRestrictionConfig.restrictions];
                        const newRanges = [
                          ...newRestrictions[restrictionIndex].ranges,
                          { start: '', end: '', message: '' }
                        ];
                        newRestrictions[restrictionIndex] = {
                          ...restriction,
                          ranges: newRanges
                        };
                        setDraftRestrictionConfig({ restrictions: newRestrictions });
                      }}
                      style={styles.button}
                    >
                      Add Range
                    </button>
                  </div>
                )}
                {restriction.type === 'boundary' && (
                  <div>
                    <h4 style={docStyles.subHeading}>Date Boundary</h4>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>Boundary Date</label>
                        <input
                          type="text"
                          placeholder="YYYY-MM-DD"
                          value={restriction.date}
                          onChange={(e) => {
                            const newRestrictions = [...draftRestrictionConfig.restrictions];
                            newRestrictions[restrictionIndex] = {
                              ...restriction,
                              date: e.target.value
                            };
                            setDraftRestrictionConfig({ restrictions: newRestrictions });
                          }}
                          style={styles.input}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>Direction</label>
                        <select
                          value={restriction.direction}
                          onChange={(e) => {
                            const newRestrictions = [...draftRestrictionConfig.restrictions];
                            newRestrictions[restrictionIndex] = {
                              ...restriction,
                              direction: e.target.value as 'before' | 'after'
                            };
                            setDraftRestrictionConfig({ restrictions: newRestrictions });
                          }}
                          style={styles.select}
                        >
                          <option value="before">Before Date</option>
                          <option value="after">After Date</option>
                        </select>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Message when selection is restricted"
                      value={restriction.message}
                      onChange={(e) => {
                        const newRestrictions = [...draftRestrictionConfig.restrictions];
                        newRestrictions[restrictionIndex] = {
                          ...restriction,
                          message: e.target.value
                        };
                        setDraftRestrictionConfig({ restrictions: newRestrictions });
                      }}
                      style={styles.input}
                    />
                  </div>
                )}
              </div>
            ))}

            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              borderTop: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px'
            }}>
              <button
                onClick={() => setDraftRestrictionConfig(restrictionConfig)}
                style={styles.button}
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setSettings(prev => ({
                    ...prev,
                    restrictionConfig: {
                      ...draftRestrictionConfig  // Create new object to ensure state update
                    }
                  }));
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0366d6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#0256b9'
                  }
                } as ExtendedCSSProperties}
              >
                Apply Changes
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleExport = () => {
    // Ensure we're exporting the most current state of all settings
    const exportConfig = {
      ...settings,
      restrictionConfig,
      // Remove any internal or unnecessary fields
      isOpen: undefined
    };
    
    // Log export for debugging purposes
    console.log('Exporting configuration:', exportConfig);
    
    const configString = JSON.stringify(exportConfig, null, 2);
    navigator.clipboard.writeText(configString).then(() => {
      alert('Configuration copied to clipboard!');
    }).catch(err => {
      console.error('Export error:', err);
      alert('Failed to copy configuration. Please try again.');
    });
  };

  // Update the import handler to handle restrictions
  const handleImport = (configText) => {
    try {
      const newConfig = JSON.parse(configText);
      
      // Ensure we maintain any required layers (like Calendar)
      const requiredLayers = settings.layers.filter(l => l.name === 'Calendar');
      const importedLayers = newConfig.layers || [];
      
      // Merge the configurations, keeping required layers
      const mergedConfig = {
        ...getDefaultSettings(), // Start with defaults
        ...newConfig, // Apply imported settings
        layers: [
          ...requiredLayers, // Keep required layers
          ...importedLayers.filter(l => l.name !== 'Calendar') // Add new layers
        ]
      };

      setSettings(mergedConfig);
      // Import restrictions if they exist
      if (newConfig.restrictionConfig) {
        setRestrictionConfig(newConfig.restrictionConfig);
        setDraftRestrictionConfig(newConfig.restrictionConfig);
      }
      setShowImportModal(false);
    } catch (e) {
      console.error('Import error:', e);
      alert('Invalid configuration format. Please check the JSON structure.');
    }
  };

  // Add Import Modal component
  const ImportModal = ({ onClose, onImport }) => {
    const [configText, setConfigText] = useState('');
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          width: '500px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={docStyles.sectionHeading}>Import Configuration</h3>
          <textarea
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            placeholder="Paste configuration JSON here..."
            style={{
              width: '100%',
              height: '200px',
              padding: '12px',
              marginBottom: '16px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '13px',
              fontFamily: 'monospace'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onImport(configText)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                background: '#0366d6',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Import
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add layer validation to layer updates
  const handleLayerUpdate = (layers: Layer[]) => {
    if (!validateLayers(layers)) {
      alert('Invalid layer configuration. Must have exactly one base layer named "Calendar".');
      return;
    }
    setSettings(prev => ({
      ...prev,
      layers
    }));
  };

  // Update the default layer selection handler
  const handleDefaultLayerChange = (layerName: string) => {
    setSettings(prev => ({
      ...prev,
      defaultLayer: layerName
    }));
    // Also update the active layer so the calendar immediately reflects the change
    setActiveLayer(layerName);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1800px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ 
        padding: '20px', 
        borderBottom: '1px solid #cfd4d9',
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
          border: '1px solid #cfd4d9',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          position: 'sticky',
          top: '20px'
        }}>
          {/* Export/Import Buttons */}
          <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex' }}>
            <button
              onClick={() => setShowImportModal(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#e3f2fd',
                color: '#666',
                borderWidth: '0 1px 1px 1px',
                borderStyle: 'solid',
                borderColor: '#cfd4d9',
                borderRadius: '0 0 0 4px',
                cursor: 'pointer',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#bbdefb',
                  color: '#1565c0'
                }
              }}
            >
              Import
            </button>
            <button
              onClick={handleExport}
              style={{
                padding: '6px 12px',
                backgroundColor: '#e6f4ea',
                color: '#666',
                borderWidth: '0 1px 1px 0',
                borderStyle: 'solid',
                borderColor: '#cfd4d9',
                borderRadius: '0 8px 0 0',
                cursor: 'pointer',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#d4eede',
                  color: '#1a7f37'
                }
              }}
            >
              Export
            </button>
          </div>

          {/* Tabs container */}
          <div style={{ 
            position: 'relative', 
            marginBottom: '16px',
            marginTop: '16px'  // Reduced from 32px to 16px for minimal spacing
          }}>
            {/* Tabs */}
            <div style={{ 
              display: 'flex', 
              marginBottom: '16px',
              position: 'relative',
              maxWidth: '400px',
              width: '100%',
              gap: '0'
            }}>
              {['core', 'features', 'layers', 'restrictions'].map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'core' | 'features' | 'layers' | 'restrictions')}
                  style={{
                    padding: '10px 0',
                    width: '100px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: activeTab === tab ? '#0366d6' : '#666',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'color 0.2s ease',
                    outline: 'none',
                    textAlign: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              {/* Single animated line */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '89.5px',  // Match the actual button width
                height: '2px',
                backgroundColor: '#0366d6',
                transform: `translateX(${(index => {
                  const buttonWidth = 89.5;  // Actual width of each button (400px / 4)
                  const buttonIndex = ['core', 'features', 'layers', 'restrictions'].indexOf(activeTab);
                  return buttonIndex * buttonWidth;  // No need for centering since line width matches button
                })()}px)`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'transform'
              }} />
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
            border: '1px solid #cfd4d9',
            borderRadius: '8px',
            backgroundColor: '#fff',
            marginBottom: '24px'
          }}>
            <DateRangePickerNew
              settings={settings}
              onSettingsChange={setSettings}
              initialActiveLayer={activeLayer}
            />
          </div>

          {/* Documentation */}
          <div style={docStyles.container}>
            <h2 style={docStyles.mainHeading}>Documentation</h2>
            <div style={{ display: 'grid', gap: '24px' }}>
              {/* Core Settings */}
              <div style={docStyles.section}>
                <h3 style={docStyles.sectionHeading}>
                  Core Settings
                  <span style={{ ...docStyles.badge, ...docStyles.badgeVariants.blue }}>
                    Required
                  </span>
                </h3>
                <p style={docStyles.description}>
                  Essential configuration options that define the calendar's basic behavior and appearance.
                </p>
                <table style={docStyles.table}>
                  <thead>
                    <tr>
                      <th style={docStyles.tableHeader}>Property</th>
                      <th style={docStyles.tableHeader}>Type</th>
                      <th style={docStyles.tableHeader}>Default</th>
                      <th style={docStyles.tableHeader}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>displayMode</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>'popup' | 'embedded'</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>'embedded'</code>
                      </td>
                      <td style={docStyles.tableCell}>How the calendar should be displayed</td>
                    </tr>
                    <tr>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>visibleMonths</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>number</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>2</code>
                      </td>
                      <td style={docStyles.tableCell}>Number of months to display</td>
                    </tr>
                    <tr>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>showMonthHeadings</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>boolean</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>true</code>
                      </td>
                      <td style={docStyles.tableCell}>Display month names above each month</td>
                    </tr>
                    <tr>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>singleMonthWidth</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>number</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>500</code>
                      </td>
                      <td style={docStyles.tableCell}>Width of a single month in pixels</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Layer Configuration */}
              <div style={docStyles.section}>
                <h3 style={docStyles.sectionHeading}>
                  Layer Configuration
                  <span style={{ ...docStyles.badge, ...docStyles.badgeVariants.purple }}>
                    Advanced
                  </span>
                </h3>
                <p style={docStyles.description}>
                  Layers provide a way to organize and display different types of calendar data.
                </p>
                <table style={docStyles.table}>
                  <thead>
                    <tr>
                      <th style={docStyles.tableHeader}>Property</th>
                      <th style={docStyles.tableHeader}>Type</th>
                      <th style={docStyles.tableHeader}>Required</th>
                      <th style={docStyles.tableHeader}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>name</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>string</code>
                      </td>
                      <td style={docStyles.tableCell}>Yes</td>
                      <td style={docStyles.tableCell}>Unique identifier for the layer</td>
                    </tr>
                    <tr>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>title</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>string</code>
                      </td>
                      <td style={docStyles.tableCell}>Yes</td>
                      <td style={docStyles.tableCell}>Display name for the layer</td>
                    </tr>
                    <tr>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>description</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>string</code>
                      </td>
                      <td style={docStyles.tableCell}>Yes</td>
                      <td style={docStyles.tableCell}>Brief description of the layer's purpose</td>
                    </tr>
                    <tr>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>data</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>LayerData</code>
                      </td>
                      <td style={docStyles.tableCell}>No</td>
                      <td style={docStyles.tableCell}>Layer-specific data (events or background colors)</td>
                    </tr>
                    <tr>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>required</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>boolean</code>
                      </td>
                      <td style={docStyles.tableCell}>No</td>
                      <td style={docStyles.tableCell}>Whether the layer can be removed</td>
                    </tr>
                  </tbody>
                </table>

                {/* Add margin after the table */}
                <div style={{ marginTop: '32px' }}>
                  <h3 style={docStyles.sectionHeading}>
                    Layer Data Types
                    <span style={{ ...docStyles.badge, ...docStyles.badgeVariants.purple }}>
                      Data Structure
                    </span>
                  </h3>
                  <p style={docStyles.description}>
                    Layers can contain two types of data: Events and Background Colors. These can be used independently or combined.
                  </p>
                  
                  <div style={{ display: 'grid', gap: '24px', marginTop: '16px' }}>
                    {/* EventData */}
                    <div style={{ 
                      border: '1px solid #e1e4e8',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        backgroundColor: '#f6f8fa',
                        padding: '12px 16px',
                        borderBottom: '1px solid #e1e4e8'
                      }}>
                        <h5 style={{
                          margin: 0,
                          color: '#24292e',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          EventData
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '12px',
                            color: '#666',
                            fontWeight: 'normal'
                          }}>
                            Single-day events with details
                          </span>
                        </h5>
                      </div>
                      <div style={{ padding: '16px' }}>
                        <pre style={{
                          ...docStyles.codeBlock,
                          margin: 0,
                          backgroundColor: '#ffffff',
                          border: '1px solid #e1e4e8'
                        }}>
{`interface EventData {
  date: string;        // ISO date string (e.g., "2025-02-15")
  title: string;       // Event title (e.g., "Team Meeting")
  type: string;        // Event category (e.g., "work", "personal")
  time: string;        // Event time (e.g., "10:00 AM", "All day")
  description: string; // Event details
}`}
                        </pre>
                        <div style={{ 
                          marginTop: '12px',
                          fontSize: '13px',
                          color: '#666'
                        }}>
                          <p style={{ margin: '0 0 8px 0' }}>Example:</p>
                          <pre style={{
                            ...docStyles.codeBlock,
                            margin: 0,
                            backgroundColor: '#f8f9fa'
                          }}>
{`{
  "date": "2025-02-15",
  "title": "Team Meeting",
  "type": "work",
  "time": "10:00 AM",
  "description": "Weekly sync with the development team"
}`}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* BackgroundData */}
                    <div style={{ 
                      border: '1px solid #e1e4e8',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        backgroundColor: '#f6f8fa',
                        padding: '12px 16px',
                        borderBottom: '1px solid #e1e4e8'
                      }}>
                        <h5 style={{
                          margin: 0,
                          color: '#24292e',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          BackgroundData
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '12px',
                            color: '#666',
                            fontWeight: 'normal'
                          }}>
                            Date range highlighting
                          </span>
                        </h5>
                      </div>
                      <div style={{ padding: '16px' }}>
                        <pre style={{
                          ...docStyles.codeBlock,
                          margin: 0,
                          backgroundColor: '#ffffff',
                          border: '1px solid #e1e4e8'
                        }}>
{`interface BackgroundData {
  startDate: string;  // ISO date string (e.g., "2025-02-01")
  endDate: string;    // ISO date string (e.g., "2025-02-14")
  color: string;      // CSS color value (e.g., "#e3f2fd")
}`}
                        </pre>
                        <div style={{ 
                          marginTop: '12px',
                          fontSize: '13px',
                          color: '#666'
                        }}>
                          <p style={{ margin: '0 0 8px 0' }}>Example:</p>
                          <pre style={{
                            ...docStyles.codeBlock,
                            margin: 0,
                            backgroundColor: '#f8f9fa'
                          }}>
{`{
  "startDate": "2025-02-01",
  "endDate": "2025-02-14",
  "color": "#e3f2fd"  // Light blue background
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Settings */}
              <div style={docStyles.section}>
                <h3 style={docStyles.sectionHeading}>
                  Feature Settings
                  <span style={{ ...docStyles.badge, ...docStyles.badgeVariants.green }}>
                    Optional
                  </span>
                </h3>
                <p style={docStyles.description}>
                  Additional features that can be enabled or disabled to customize the calendar's functionality.
                </p>
                <table style={docStyles.table}>
                  <thead>
                    <tr>
                      <th style={docStyles.tableHeader}>Property</th>
                      <th style={docStyles.tableHeader}>Type</th>
                      <th style={docStyles.tableHeader}>Default</th>
                      <th style={docStyles.tableHeader}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(SETTINGS.features).map(([key, setting]) => (
                      <tr key={key}>
                        <td style={docStyles.tableCell}>
                          <code style={docStyles.code}>{key}</code>
                        </td>
                        <td style={docStyles.tableCell}>
                          <code style={docStyles.code}>{setting.type}</code>
                        </td>
                        <td style={docStyles.tableCell}>
                          <code style={docStyles.code}>{String(setting.default)}</code>
                        </td>
                        <td style={docStyles.tableCell}>{setting.description}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>showLayersNavigation</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>boolean</code>
                      </td>
                      <td style={docStyles.tableCell}>
                        <code style={docStyles.code}>true</code>
                      </td>
                      <td style={docStyles.tableCell}>Display layers navigation panel in the calendar</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
}

export default App;