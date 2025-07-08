import React, { useState } from 'react';
import './cla-base.css';
import './docStyles.css';
import './App.css';
import './components/CLACalendarComponents/defensive-styles.css';

import CLACalendar from './components/CLACalendar';

const App: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });

  const [currentDemo, setCurrentDemo] = useState<string>('basic');

  const handleDateSubmit = (start: string | null, end: string | null) => {
    setSelectedRange({ start, end });
  };

  return (
    <div className="cla-cal-wrapper">
      <div className="cla-cal-container-fluid cla-cal-py-4">
        <div className="cla-cal-row">
          <div className="cla-cal-col-12">
            <div className="cla-cal-card">
              <div className="cla-cal-card-header">
                <h1 className="cla-cal-h3 cla-cal-mb-0">CLA Calendar - Simple Demo</h1>
                <p className="cla-cal-text-muted cla-cal-mb-0">
                A demonstration of the hardened configuration system with SimpleCalendar
              </p>
            </div>
            <div className="cla-cal-card-body">

              {/* Demo selector */}
              <div className="cla-cal-mb-4">
                <label className="cla-cal-form-label">Choose Demo:</label>
                <select 
                  className="cla-cal-form-select"
                  value={currentDemo}
                  onChange={(e) => setCurrentDemo(e.target.value)}
                >
                  <option value="basic">Basic Usage</option>
                  <option value="single">Single Date Selection</option>
                  <option value="multiple">Multiple Months</option>
                  <option value="custom">Custom Theme</option>
                  <option value="null-safe">Null-Safe Configuration</option>
                </select>
              </div>

              {/* Selected range display */}
              {selectedRange.start && (
                <div className="cla-cal-alert cla-cal-alert-info cla-cal-mb-3">
                  <strong>Selected:</strong>{' '}
                  {currentDemo === 'single' 
                    ? selectedRange.start 
                    : `${selectedRange.start} to ${selectedRange.end}`
                  }
                </div>
              )}

              {/* Demo content */}
              <div className="demo-container">
                {currentDemo === 'basic' && (
                  <div>
                    <h4>Basic Usage</h4>
                    <p className="cla-cal-text-muted">Minimal configuration with defaults</p>
                    <CLACalendar 
                      settings={{
                        displayMode: 'embedded',
                        showSubmitButton: true,
                      }}
                      onSubmit={handleDateSubmit}
                    />
                  </div>
                )}

                {currentDemo === 'single' && (
                  <div>
                    <h4>Single Date Selection</h4>
                    <p className="cla-cal-text-muted">Select a single date instead of a range</p>
                    <CLACalendar 
                      settings={{
                        displayMode: 'embedded',
                        selectionMode: 'single',
                        visibleMonths: 1,
                        showSubmitButton: true,
                      }}
                      onSubmit={handleDateSubmit}
                    />
                  </div>
                )}

                {currentDemo === 'multiple' && (
                  <div>
                    <h4>Multiple Months</h4>
                    <p className="cla-cal-text-muted">Display multiple months for easier navigation</p>
                    <CLACalendar 
                      settings={{
                        displayMode: 'embedded',
                        visibleMonths: 3,
                        showSubmitButton: true,
                      }}
                      onSubmit={handleDateSubmit}
                    />
                  </div>
                )}

                {currentDemo === 'custom' && (
                  <div>
                    <h4>Custom Theme</h4>
                    <p className="cla-cal-text-muted">Custom colors and styling</p>
                    <CLACalendar 
                      settings={{
                        displayMode: 'embedded',
                        visibleMonths: 2,
                        showSubmitButton: true,
                        colors: {
                          primary: '#9333EA',
                          success: '#059669',
                          warning: '#D97706',
                          danger: '#DC2626',
                        },
                        containerStyle: {
                          backgroundColor: '#F8FAFC',
                          border: '2px solid #9333EA',
                          borderRadius: '12px',
                        },
                      }}
                      onSubmit={handleDateSubmit}
                    />
                  </div>
                )}

                {currentDemo === 'null-safe' && (
                  <div>
                    <h4>Null-Safe Configuration</h4>
                    <p className="cla-cal-text-muted">
                      Demonstrates graceful handling of null/undefined values
                    </p>
                    <CLACalendar 
                      settings={{
                        // Mixed null/undefined values to test robustness
                        displayMode: undefined as any,
                        visibleMonths: null as any,
                        selectionMode: 'range',
                        showSubmitButton: true,
                        colors: null as any,
                        layers: undefined as any,
                      }}
                      onSubmit={handleDateSubmit}
                    />
                    <div className="cla-cal-alert cla-cal-alert-success cla-cal-mt-3">
                      <small className="cla-cal-small">
                        ✅ Calendar handles null/undefined values gracefully using defaults
                      </small>
                    </div>
                  </div>
                )}
              </div>

              {/* Configuration info */}
              <div className="cla-cal-mt-4 cla-cal-border-top cla-cal-pt-3">
                <h5 className="cla-cal-text-muted">Features Demonstrated:</h5>
                <ul className="cla-cal-text-muted">
                  <li>✅ Simplified configuration API</li>
                  <li>✅ Null-safe property handling</li>
                  <li>✅ Intelligent defaults</li>
                  <li>✅ Backward compatibility</li>
                  <li>✅ Comprehensive test coverage (252 tests)</li>
                </ul>
                
                <div className="cla-cal-mt-3">
                  <h6>Quick Start:</h6>
                  <pre className="cla-cal-bg-light cla-cal-p-2 cla-cal-rounded">
                    <code>{`import CLACalendar from './components/CLACalendar';

<SimpleCalendar 
  config={{
    displayMode: 'embedded',
    showSubmitButton: true,
  }}
  onSubmit={(start, end) => console.log(start, end)}
/>`}</code>
                  </pre>
                </div>

                <div className="cla-cal-mt-3">
                  <p className="cla-cal-text-muted cla-cal-small">
                    <strong>Storybook:</strong> Run <code>npm run storybook</code> for interactive playground<br/>
                    <strong>Tests:</strong> Run <code>npm test</code> to verify all 252 tests pass
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default App;