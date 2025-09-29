/**
 * @fileoverview Demo application for the CLA Calendar component
 * 
 * This file contains a comprehensive demonstration application that showcases
 * various features and configurations of the CLA Calendar component. It includes:
 * 
 * - Basic calendar usage with default settings
 * - Single date vs date range selection modes
 * - Multiple month displays
 * - Custom theming and colors
 * - Popup mode with different positioning options
 * - Dynamic positioning based on viewport
 * - Null-safe configuration handling
 * - External input binding
 * - Date restrictions and validation
 * - Event layers and custom data
 * 
 * The demo app serves as both a development testbed and a reference
 * implementation for developers integrating the calendar into their applications.
 * 
 * @module App
 */

import React, { useState } from 'react';
import './cla-base.css';
import './docStyles.css';
import './App.css';
import './components/CLACalendarComponents/defensive-styles.css';

import CLACalendar from './components/CLACalendar';
import { useEffect as _useEffect, useState as _useState } from 'react';

const App: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });

  const [currentDemo, setCurrentDemo] = useState<string>('basic');
  
  // For range-single-day demo - track submit count too
  const [submitResult, setSubmitResult] = useState<{
    start: string | null;
    end: string | null;
    timestamp: string;
  } | null>(null);
  
  const [submitCount, setSubmitCount] = useState(0);
  
  // For submission formatter demo - Example 1
  const [submissionFormatResult, setSubmissionFormatResult] = useState<{
    display: string;
    submitted: { start: string | null; end: string | null };
    timestamp: string;
  } | null>(null);
  
  // For dynamic formatter demo - Example 2
  const [selectedFormatType, setSelectedFormatType] = useState<string>('us');
  const [dynamicFormatResult, setDynamicFormatResult] = useState<{
    visual: string;
    start: string | null;
    end: string | null;
  } | null>(null);
  
  // For API format demo - Example 4
  const [apiFormatResult, setApiFormatResult] = useState<{
    visual: string;
    checkIn: string | null;
    checkOut: string | null;
  } | null>(null);

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
                A demonstration of the hardened configuration system with CLACalendar
              </p>
            </div>
            <div className="cla-cal-card-body">

              {/* Demo selector */}
              <div className="cla-cal-mb-4">
                <label className="cla-cal-form-label">Choose Demo:</label>
                <select 
                  className="cla-cal-form-select"
                  value={currentDemo}
                  onChange={(e) => {
                    setCurrentDemo(e.target.value);
                    // Only reset if switching AWAY from range-single-day
                    if (currentDemo === 'range-single-day' && e.target.value !== 'range-single-day') {
                      setSubmitResult(null);
                    }
                  }}
                >
                  <option value="basic">Basic Usage</option>
                  <option value="single">Single Date Selection</option>
                  <option value="range-single-day">Range Mode - Single Day Selection</option>
                  <option value="no-clear">No Clear Button Demo</option>
                  <option value="footer-alignment">Footer Button Alignment</option>
                  <option value="multiple">Multiple Months</option>
                  <option value="custom">Custom Theme</option>
                  <option value="popup">Popup Mode</option>
                  <option value="popup-positions">Popup Positioning Tests</option>
                  <option value="dynamic-positioning">Dynamic Positioning Demo</option>
                  <option value="null-safe">Null-Safe Configuration</option>
                  <option value="restrictions">Restriction Testing</option>
                  <option value="nav-restrictions">Navigation Restrictions</option>
                  <option value="events">Event Display Treatments</option>
                  <option value="accessibility">Accessibility Features</option>
                  <option value="submissionFormatter">Submission Formatter</option>
                </select>
              </div>

              {/* Selected range display */}
              {selectedRange.start && currentDemo !== 'range-single-day' && (
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

                {currentDemo === 'range-single-day' && (
                  <div>
                    <h4>Testing Single Day Selection in Range Mode</h4>
                    
                    {/* BIG VISIBLE OUTPUT */}
                    <div style={{
                      backgroundColor: '#000',
                      color: '#0f0',
                      padding: '30px',
                      marginBottom: '20px',
                      fontSize: '20px',
                      fontFamily: 'monospace',
                      border: '3px solid #0f0'
                    }}>
                      <div>Submit Count: {submitCount}</div>
                      <div>Last Result:</div>
                      <pre>{submitResult ? JSON.stringify({
                        startDate: submitResult.start,
                        endDate: submitResult.end
                      }, null, 2) : 'NOTHING YET'}</pre>
                    </div>

                    {/* Simple test button */}
                    <button 
                      onClick={() => {
                        const testResult = {
                          start: '2025-01-01',
                          end: '2025-01-01',
                          timestamp: new Date().toISOString()
                        };
                        setSubmitResult(testResult);
                        setSubmitCount(c => c + 1);
                      }}
                      style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        marginBottom: '20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      TEST: Manually trigger state update
                    </button>

                    {/* Calendar */}
                    <CLACalendar 
                      settings={{
                        displayMode: 'embedded',
                        selectionMode: 'range',
                        visibleMonths: 2,
                        showSubmitButton: true,
                        onSubmit: (start, end) => {
                          console.log('onSubmit called with:', { start, end });
                          
                          const result = {
                            start,
                            end,
                            timestamp: new Date().toISOString()
                          };
                          
                          setSubmitResult(result);
                          setSubmitCount(prev => prev + 1);
                        }
                      }}
                    />
                  </div>
                )}

                {currentDemo === 'no-clear' && (
                  <div>
                    <h4>No Clear Button Demo</h4>
                    <p className="cla-cal-text-muted">
                      Demonstrating the calendar with <code>showClearButton: false</code>. 
                      Only the Submit button will be shown in the footer.
                    </p>
                    <CLACalendar 
                      settings={{
                        displayMode: 'embedded',
                        selectionMode: 'range',
                        visibleMonths: 2,
                        showSubmitButton: true,
                        showClearButton: false,
                        onSubmit: (start, end) => {
                          alert(`Selected: ${start} to ${end}`);
                        }
                      }}
                    />
                  </div>
                )}

                {currentDemo === 'footer-alignment' && (
                  <div>
                    <h4>Footer Button Alignment Examples</h4>
                    <p className="cla-cal-text-muted">
                      Demonstrating different footer button alignment options
                    </p>
                    
                    <div className="cla-cal-row">
                      <div className="cla-cal-col-6">
                        <h5>Default: Clear (Left) & Submit (Right)</h5>
                        <div className="cla-cal-code-block cla-cal-mb-2">
                          <code>{`{
  showClearButton: true,
  showSubmitButton: true,
  footerButtonAlignment: 'space-between'
}`}</code>
                        </div>
                        <CLACalendar 
                          settings={{
                            displayMode: 'embedded',
                            visibleMonths: 1,
                            showClearButton: true,
                            showSubmitButton: true,
                            footerButtonAlignment: 'space-between',
                            onSubmit: (start, end) => {
                              alert(`Selected: ${start} to ${end}`);
                            }
                          }}
                        />
                      </div>
                      
                      <div className="cla-cal-col-6">
                        <h5>Submit Only (Auto Right-Aligned)</h5>
                        <div className="cla-cal-code-block cla-cal-mb-2">
                          <code>{`{
  showClearButton: false,
  showSubmitButton: true,
  footerButtonAlignment: 'space-between'
  // Auto-aligns to 'flex-end'
}`}</code>
                        </div>
                        <CLACalendar 
                          settings={{
                            displayMode: 'embedded',
                            visibleMonths: 1,
                            showClearButton: false,
                            showSubmitButton: true,
                            footerButtonAlignment: 'space-between',
                            onSubmit: (start, end) => {
                              alert(`Selected: ${start} to ${end}`);
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="cla-cal-row cla-cal-mt-4">
                      <div className="cla-cal-col-6">
                        <h5>Both Buttons (Center Aligned)</h5>
                        <div className="cla-cal-code-block cla-cal-mb-2">
                          <code>{`{
  showClearButton: true,
  showSubmitButton: true,
  footerButtonAlignment: 'center'
}`}</code>
                        </div>
                        <CLACalendar 
                          settings={{
                            displayMode: 'embedded',
                            visibleMonths: 1,
                            showClearButton: true,
                            showSubmitButton: true,
                            footerButtonAlignment: 'center',
                            onSubmit: (start, end) => {
                              alert(`Selected: ${start} to ${end}`);
                            }
                          }}
                        />
                      </div>
                      
                      <div className="cla-cal-col-6">
                        <h5>Both Buttons (Left Aligned)</h5>
                        <div className="cla-cal-code-block cla-cal-mb-2">
                          <code>{`{
  showClearButton: true,
  showSubmitButton: true,
  footerButtonAlignment: 'flex-start'
}`}</code>
                        </div>
                        <CLACalendar 
                          settings={{
                            displayMode: 'embedded',
                            visibleMonths: 1,
                            showClearButton: true,
                            showSubmitButton: true,
                            footerButtonAlignment: 'flex-start',
                            onSubmit: (start, end) => {
                              alert(`Selected: ${start} to ${end}`);
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="cla-cal-row cla-cal-mt-4">
                      <div className="cla-cal-col-6">
                        <h5>Both Buttons (Right Aligned)</h5>
                        <div className="cla-cal-code-block cla-cal-mb-2">
                          <code>{`{
  showClearButton: true,
  showSubmitButton: true,
  footerButtonAlignment: 'flex-end'
}`}</code>
                        </div>
                        <CLACalendar 
                          settings={{
                            displayMode: 'embedded',
                            visibleMonths: 1,
                            showClearButton: true,
                            showSubmitButton: true,
                            footerButtonAlignment: 'flex-end',
                            onSubmit: (start, end) => {
                              alert(`Selected: ${start} to ${end}`);
                            }
                          }}
                        />
                      </div>
                      
                      <div className="cla-cal-col-6">
                        <h5>Clear Only (Left Aligned)</h5>
                        <div className="cla-cal-code-block cla-cal-mb-2">
                          <code>{`{
  showClearButton: true,
  showSubmitButton: false,
  footerButtonAlignment: 'space-between'
  // Stays at 'flex-start' naturally
}`}</code>
                        </div>
                        <CLACalendar 
                          settings={{
                            displayMode: 'embedded',
                            visibleMonths: 1,
                            showClearButton: true,
                            showSubmitButton: false,
                            footerButtonAlignment: 'space-between',
                            onSubmit: (start, end) => {
                              alert(`Selected: ${start} to ${end}`);
                            }
                          }}
                        />
                      </div>
                    </div>
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

                {currentDemo === 'popup' && (
                  <div>
                    <h4>Popup Mode</h4>
                    <p className="cla-cal-text-muted">Calendar appears as a popup when clicking the input field</p>
                    
                    <div style={{ 
                      border: '2px dashed #ccc', 
                      padding: '40px', 
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9',
                      marginBottom: '20px'
                    }}>
                      <p style={{ marginBottom: '20px' }}>Click the input below to open the calendar:</p>
                      
                      <CLACalendar 
                        settings={{
                          displayMode: 'popup',
                          selectionMode: 'range',
                          visibleMonths: 2,
                          showSubmitButton: false,
                          position: 'bottom-left',
                          useDynamicPosition: false,
                          closeOnClickAway: true,
                        }}
                        onSubmit={handleDateSubmit}
                      />
                    </div>
                    
                    <div className="cla-cal-alert cla-cal-alert-info">
                      <small>
                        <strong>Debug Info:</strong> Check console for positioning logs. 
                        The calendar should appear directly below the input field, aligned to the left edge.
                      </small>
                    </div>
                  </div>
                )}

                {currentDemo === 'popup-positions' && (
                  <div>
                    <h4>Fixed Positioning Tests</h4>
                    <p className="cla-cal-text-muted">Test different fixed popup positions (useDynamicPosition: false)</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
                      {/* Bottom-left test */}
                      <div style={{ 
                        border: '1px solid #ddd', 
                        padding: '20px', 
                        borderRadius: '8px'
                      }}>
                        <h5 style={{ fontSize: '16px', marginBottom: '10px' }}>Bottom-Left (Default)</h5>
                        <CLACalendar 
                          settings={{
                            displayMode: 'popup',
                            selectionMode: 'single',
                            visibleMonths: 1,
                            position: 'bottom-left',
                            useDynamicPosition: false,
                          }}
                          onSubmit={handleDateSubmit}
                        />
                      </div>

                      {/* Bottom-right test */}
                      <div style={{ 
                        border: '1px solid #ddd', 
                        padding: '20px', 
                        borderRadius: '8px'
                      }}>
                        <h5 style={{ fontSize: '16px', marginBottom: '10px' }}>Bottom-Right</h5>
                        <CLACalendar 
                          settings={{
                            displayMode: 'popup',
                            selectionMode: 'single',
                            visibleMonths: 1,
                            position: 'bottom-right',
                            useDynamicPosition: false,
                          }}
                          onSubmit={handleDateSubmit}
                        />
                      </div>

                      {/* Top-left test */}
                      <div style={{ 
                        border: '1px solid #ddd', 
                        padding: '20px', 
                        borderRadius: '8px'
                      }}>
                        <h5 style={{ fontSize: '16px', marginBottom: '10px' }}>Top-Left</h5>
                        <CLACalendar 
                          settings={{
                            displayMode: 'popup',
                            selectionMode: 'single',
                            visibleMonths: 1,
                            position: 'top-left',
                            useDynamicPosition: false,
                          }}
                          onSubmit={handleDateSubmit}
                        />
                      </div>

                      {/* Top-right test */}
                      <div style={{ 
                        border: '1px solid #ddd', 
                        padding: '20px', 
                        borderRadius: '8px'
                      }}>
                        <h5 style={{ fontSize: '16px', marginBottom: '10px' }}>Top-Right</h5>
                        <CLACalendar 
                          settings={{
                            displayMode: 'popup',
                            selectionMode: 'single',
                            visibleMonths: 1,
                            position: 'top-right',
                            useDynamicPosition: false,
                          }}
                          onSubmit={handleDateSubmit}
                        />
                      </div>
                    </div>

                    <div className="cla-cal-alert cla-cal-alert-warning cla-cal-mt-3">
                      <small>
                        <strong>Fixed Positioning:</strong> Each calendar appears in the specified position regardless of viewport constraints.
                        Compare with the Dynamic Positioning demo to see the difference.
                      </small>
                    </div>
                  </div>
                )}

                {currentDemo === 'dynamic-positioning' && (
                  <div>
                    <h4>Dynamic Positioning Demo</h4>
                    <p className="cla-cal-text-muted">
                      The calendar automatically repositions itself based on available space. 
                      Try opening calendars near the edges of the viewport!
                    </p>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
                      gridTemplateRows: 'repeat(3, 150px)',
                      gap: '20px',
                      padding: '20px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px',
                      marginTop: '20px'
                    }}>
                      {/* Top row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: '12px', marginBottom: '5px' }}>Top-Left Corner</p>
                          <CLACalendar 
                            settings={{
                              displayMode: 'popup',
                              selectionMode: 'single',
                              visibleMonths: 1,
                              useDynamicPosition: true,
                            }}
                            onSubmit={handleDateSubmit}
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                        <div>
                          <p style={{ fontSize: '12px', marginBottom: '5px' }}>Top-Center</p>
                          <CLACalendar 
                            settings={{
                              displayMode: 'popup',
                              selectionMode: 'single',
                              visibleMonths: 1,
                              useDynamicPosition: true,
                            }}
                            onSubmit={handleDateSubmit}
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                        <div>
                          <p style={{ fontSize: '12px', marginBottom: '5px' }}>Top-Right Corner</p>
                          <CLACalendar 
                            settings={{
                              displayMode: 'popup',
                              selectionMode: 'single',
                              visibleMonths: 1,
                              useDynamicPosition: true,
                            }}
                            onSubmit={handleDateSubmit}
                          />
                        </div>
                      </div>

                      {/* Middle row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: '12px', marginBottom: '5px' }}>Middle-Left</p>
                          <CLACalendar 
                            settings={{
                              displayMode: 'popup',
                              selectionMode: 'single',
                              visibleMonths: 1,
                              useDynamicPosition: true,
                            }}
                            onSubmit={handleDateSubmit}
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div>
                          <p style={{ fontSize: '12px', marginBottom: '5px' }}>Center</p>
                          <CLACalendar 
                            settings={{
                              displayMode: 'popup',
                              selectionMode: 'single',
                              visibleMonths: 2,
                              useDynamicPosition: true,
                            }}
                            onSubmit={handleDateSubmit}
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <div>
                          <p style={{ fontSize: '12px', marginBottom: '5px' }}>Middle-Right</p>
                          <CLACalendar 
                            settings={{
                              displayMode: 'popup',
                              selectionMode: 'single',
                              visibleMonths: 1,
                              useDynamicPosition: true,
                            }}
                            onSubmit={handleDateSubmit}
                          />
                        </div>
                      </div>

                      {/* Bottom row */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: '12px', marginBottom: '5px' }}>Bottom-Left Corner</p>
                          <CLACalendar 
                            settings={{
                              displayMode: 'popup',
                              selectionMode: 'single',
                              visibleMonths: 1,
                              useDynamicPosition: true,
                            }}
                            onSubmit={handleDateSubmit}
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <div>
                          <p style={{ fontSize: '12px', marginBottom: '5px' }}>Bottom-Center</p>
                          <CLACalendar 
                            settings={{
                              displayMode: 'popup',
                              selectionMode: 'single',
                              visibleMonths: 1,
                              useDynamicPosition: true,
                            }}
                            onSubmit={handleDateSubmit}
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <div>
                          <p style={{ fontSize: '12px', marginBottom: '5px' }}>Bottom-Right Corner</p>
                          <CLACalendar 
                            settings={{
                              displayMode: 'popup',
                              selectionMode: 'single',
                              visibleMonths: 1,
                              useDynamicPosition: true,
                            }}
                            onSubmit={handleDateSubmit}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="cla-cal-alert cla-cal-alert-info cla-cal-mt-3">
                      <small>
                        <strong>How it works:</strong>
                        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                          <li>Top inputs: Calendar appears below when there's space, otherwise above</li>
                          <li>Bottom inputs: Calendar appears above when there's no space below</li>
                          <li>Right-edge inputs: Calendar aligns to the right edge to stay in viewport</li>
                          <li>The center calendar has 2 months to show how it handles larger calendars</li>
                        </ul>
                      </small>
                    </div>
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

                {currentDemo === 'restrictions' && (
                  <div>
                    <h4>Restriction Testing</h4>
                    <p className="cla-cal-text-muted">
                      Comprehensive testing of all 5 restriction types with visual restrictions
                    </p>
                    
                    
                    {/* Restriction Type 1: Date Range */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>1. Date Range Restrictions</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Blocks specific date ranges (e.g., holidays, maintenance periods)
                      </p>
                      <CLACalendar 
                        settings={{
                          displayMode: 'embedded',
                          visibleMonths: 2,
                          monthWidth: 300,
                          selectionMode: 'range',
                          showSubmitButton: true,
                          restrictionConfigFactory: () => ({
                            restrictions: [
                              {
                                type: 'daterange',
                                enabled: true,
                                ranges: [
                                  { 
                                    startDate: '2025-08-10', 
                                    endDate: '2025-08-15',
                                    message: 'Company retreat - dates unavailable'
                                  },
                                  { 
                                    startDate: '2025-08-25', 
                                    endDate: '2025-08-27',
                                    message: 'System maintenance window'
                                  }
                                ]
                              }
                            ]
                          })
                        }}
                        onSubmit={handleDateSubmit}
                      />
                      <div className="cla-cal-alert cla-cal-alert-warning cla-cal-mt-2">
                        <small>🚫 Aug 10-15 and Aug 25-27 are restricted (dimmed)</small>
                      </div>
                    </div>

                    {/* Restriction Type 2: Boundary */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>2. Boundary Restrictions</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Sets min/max selectable dates (e.g., only future dates, within 90 days)
                      </p>
                      <CLACalendar 
                        settings={{
                          displayMode: 'embedded',
                          visibleMonths: 2,
                          monthWidth: 300,
                          selectionMode: 'range',
                          showSubmitButton: true,
                          restrictionConfigFactory: () => ({
                            restrictions: [
                              {
                                type: 'boundary',
                                enabled: true,
                                minDate: '2025-08-05',
                                maxDate: '2025-09-15',
                                message: 'Please select dates between Aug 5 and Sep 15, 2025'
                              }
                            ]
                          })
                        }}
                        onSubmit={handleDateSubmit}
                      />
                      <div className="cla-cal-alert cla-cal-alert-info cla-cal-mt-2">
                        <small>📅 Only dates between Aug 5 - Sep 15 are selectable</small>
                      </div>
                    </div>

                    {/* Restriction Type 3: Allowed Ranges */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>3. Allowed Ranges</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Only specific date ranges are selectable (inverse of date range restriction)
                      </p>
                      <CLACalendar 
                        settings={{
                          displayMode: 'embedded',
                          visibleMonths: 2,
                          monthWidth: 300,
                          selectionMode: 'range',
                          showSubmitButton: true,
                          restrictionConfigFactory: () => ({
                            restrictions: [
                              {
                                type: 'allowedranges',
                                enabled: true,
                                ranges: [
                                  { 
                                    startDate: '2025-08-01', 
                                    endDate: '2025-08-07'
                                  },
                                  { 
                                    startDate: '2025-08-20', 
                                    endDate: '2025-08-24'
                                  },
                                  { 
                                    startDate: '2025-09-01', 
                                    endDate: '2025-09-10'
                                  }
                                ]
                              }
                            ]
                          })
                        }}
                        onSubmit={handleDateSubmit}
                      />
                      <div className="cla-cal-alert cla-cal-alert-success cla-cal-mt-2">
                        <small>✅ Only Aug 1-7, Aug 20-24, and Sep 1-10 are available</small>
                      </div>
                    </div>

                    {/* Restriction Type 4: Weekday */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>4. Weekday Restrictions</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Block specific days of the week (e.g., weekends only, weekdays only)
                      </p>
                      <CLACalendar 
                        settings={{
                          displayMode: 'embedded',
                          visibleMonths: 2,
                          monthWidth: 300,
                          selectionMode: 'range',
                          showSubmitButton: true,
                          restrictionConfigFactory: () => ({
                            restrictions: [
                              {
                                type: 'weekday',
                                enabled: true,
                                days: [0, 6], // 0 = Sunday, 6 = Saturday
                                message: 'Weekends are not available for booking'
                              }
                            ]
                          })
                        }}
                        onSubmit={handleDateSubmit}
                      />
                      <div className="cla-cal-alert cla-cal-alert-warning cla-cal-mt-2">
                        <small>🚫 All Saturdays and Sundays are dimmed</small>
                      </div>
                    </div>

                    {/* Restriction Type 5: Restricted Boundary */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>5. Restricted Boundary (Complex)</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Multiple boundary zones with different rules (e.g., peak/off-peak periods)
                      </p>
                      <CLACalendar 
                        settings={{
                          displayMode: 'embedded',
                          visibleMonths: 3,
                          monthWidth: 300,
                          selectionMode: 'range',
                          showSubmitButton: true,
                          restrictionConfigFactory: () => ({
                            restrictions: [
                              {
                                type: 'restricted_boundary',
                                enabled: true,
                                ranges: [
                                  {
                                    startDate: '2025-08-01',
                                    endDate: '2025-08-14',
                                    message: 'Peak season - selections must stay within this period'
                                  },
                                  {
                                    startDate: '2025-08-15',
                                    endDate: '2025-08-31',
                                    message: 'Off-peak - selections must stay within this period'
                                  },
                                  {
                                    startDate: '2025-09-01',
                                    endDate: '2025-09-30',
                                    message: 'Regular season - selections must stay within this period'
                                  }
                                ]
                              }
                            ]
                          })
                        }}
                        onSubmit={handleDateSubmit}
                      />
                      <div className="cla-cal-alert cla-cal-alert-info cla-cal-mt-2">
                        <small>
                          🔒 Three zones: Peak (Aug 1-14), Off-peak (Aug 15-31), Regular (Sep 1-30)<br/>
                          Selections cannot cross zone boundaries
                        </small>
                      </div>
                    </div>

                    {/* Combined Restrictions Demo */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>Combined Restrictions</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Multiple restriction types working together
                      </p>
                      <CLACalendar 
                        settings={{
                          displayMode: 'embedded',
                          visibleMonths: 2,
                          monthWidth: 300,
                          selectionMode: 'range',
                          showSubmitButton: true,
                          restrictionConfigFactory: () => ({
                            restrictions: [
                              {
                                type: 'boundary',
                                enabled: true,
                                minDate: '2025-08-01',
                                maxDate: '2025-09-30'
                              },
                              {
                                type: 'weekday',
                                enabled: true,
                                days: [0, 6],
                                message: 'Weekends unavailable'
                              },
                              {
                                type: 'daterange',
                                enabled: true,
                                ranges: [
                                  { 
                                    startDate: '2025-08-15', 
                                    endDate: '2025-08-18',
                                    message: 'Company holiday'
                                  }
                                ]
                              }
                            ]
                          })
                        }}
                        onSubmit={handleDateSubmit}
                      />
                      <div className="cla-cal-alert cla-cal-alert-secondary cla-cal-mt-2">
                        <small>
                          🔀 Combined: Aug-Sep only + No weekends + Aug 15-18 blocked<br/>
                          Notice how restrictions combine
                        </small>
                      </div>
                    </div>

                  </div>
                )}

                {currentDemo === 'nav-restrictions' && (
                  <div>
                    <h4>Navigation Restrictions (Month-Level, UTC)</h4>
                    <p className="cla-cal-text-muted">
                      Blocks navigation beyond a configured month window. Dates typed into inputs also respect these month limits.
                      The configured dates represent the <strong>last visible month</strong> and are inclusive of that month.
                    </p>

                    {/* Live editor for navigation restrictions */}
                    <div className="cla-cal-alert cla-cal-alert-secondary cla-cal-mb-3" style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div>
                        <label className="cla-cal-form-label">Visible Months</label>
                        <input id="nav-demo-visible" type="number" min={1} max={6} defaultValue={2} className="cla-cal-form-control" style={{ width: 120 }} />
                      </div>
                      <div>
                        <label className="cla-cal-form-label">Before (min first month)</label>
                        <input id="nav-demo-before" type="date" defaultValue="2025-09-01" className="cla-cal-form-control" />
                      </div>
                      <div>
                        <label className="cla-cal-form-label">After (max last month)</label>
                        <input id="nav-demo-after" type="date" defaultValue="2025-12-31" className="cla-cal-form-control" />
                      </div>
                      <button
                        className="cla-button cla-button-primary"
                        onClick={() => {
                          const visible = Number((document.getElementById('nav-demo-visible') as HTMLInputElement)?.value || 2);
                          const before = (document.getElementById('nav-demo-before') as HTMLInputElement)?.value || '';
                          const after = (document.getElementById('nav-demo-after') as HTMLInputElement)?.value || '';
                          const ev = new CustomEvent('nav-restrictions-update', { detail: { visibleMonths: visible, before, after } });
                          window.dispatchEvent(ev);
                        }}
                      >Apply</button>
                    </div>

                    <div className="cla-cal-alert cla-cal-alert-info cla-cal-mb-3">
                      <small>
                        <strong>Config:</strong> Min first visible month = Sep 2025; Max last visible month = Dec 2025; visibleMonths = 2<br/>
                        Expected: first visible month cannot be earlier than Sep 2025 and the last cannot be later than Dec 2025. Buttons and PageUp/Down disabled at edges. Inputs blocked outside window.
                      </small>
                    </div>

                    {/* Controlled calendar via window event to avoid heavy demo state */}
                    <NavRestrictionsDemoCalendar onSubmit={handleDateSubmit} />

                    <div className="cla-cal-alert cla-cal-alert-secondary cla-cal-mt-3">
                      <small>
                        Try typing a date like <code>2025-08-15</code> (blocked) or <code>2026-01-05</code> (blocked).
                        Try navigating with the buttons and with <kbd>PageUp</kbd>/<kbd>PageDown</kbd>.
                      </small>
                    </div>
                  </div>
                )}

                {currentDemo === 'events' && (
                  <div>
                    <h4>Event Display Treatments</h4>
                    <p className="cla-cal-text-muted">
                      Compare solid vs stroke display treatments for events. Both preserve event colors for categorization.
                    </p>

                    <div className="cla-cal-row">
                      <div className="cla-cal-col-6">
                        <h5>Solid Treatment (Default)</h5>
                        <p>displayTreatment: 'solid'</p>
                        <CLACalendar 
                          settings={{
                            displayMode: 'embedded',
                            visibleMonths: 1,
                            showSubmitButton: false,
                            showTooltips: true,
                            layersFactory: () => [{
                              name: 'events',
                              title: 'Events',
                              description: 'Calendar events',
                              visible: true,
                              data: {
                                events: [
                                  {
                                    date: '2025-09-15',
                                    title: 'Meeting',
                                    type: 'meeting', 
                                    time: '10:00 AM',
                                    description: 'Team meeting',
                                    color: '#0366d6',
                                    displayTreatment: 'solid'
                                  }
                                ]
                              }
                            }]
                          }}
                          onSubmit={handleDateSubmit}
                        />
                        <p className="cla-cal-text-muted cla-cal-small">
                          Filled background with event color
                        </p>
                      </div>
                      
                      <div className="cla-cal-col-6">
                        <h5>Stroke Treatment (New)</h5>
                        <p>displayTreatment: 'stroke'</p>
                        <CLACalendar 
                          settings={{
                            displayMode: 'embedded',
                            visibleMonths: 1,
                            showSubmitButton: false,
                            showTooltips: true,
                            layersFactory: () => [{
                              name: 'events',
                              title: 'Events', 
                              description: 'Calendar events',
                              visible: true,
                              data: {
                                events: [
                                  {
                                    date: '2025-09-15',
                                    title: 'Meeting',
                                    type: 'meeting',
                                    time: '10:00 AM', 
                                    description: 'Team meeting',
                                    color: '#0366d6',
                                    displayTreatment: 'stroke'
                                  }
                                ]
                              }
                            }]
                          }}
                          onSubmit={handleDateSubmit}
                        />
                        <p className="cla-cal-text-muted cla-cal-small">
                          Dark gray circle outline
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentDemo === 'accessibility' && (
                  <div>
                    <h4>Accessibility Features (WCAG 2.1 AA Compliant)</h4>
                    <p className="cla-cal-text-muted">
                      Test the calendar's accessibility features including keyboard navigation, 
                      screen reader support, and ARIA attributes.
                    </p>

                    {/* Keyboard Navigation Demo */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>1. Keyboard Navigation</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Try navigating with your keyboard! Focus the calendar and use:
                      </p>
                      <div className="cla-cal-alert cla-cal-alert-info cla-cal-mb-3">
                        <strong>Keyboard Shortcuts:</strong>
                        <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                          <li><kbd>Tab</kbd> - Move through inputs, navigation buttons, layers, and calendar months</li>
                          <li><kbd>Arrow Keys</kbd> - Navigate between days:
                            <ul style={{ paddingLeft: '20px', fontSize: '13px', marginTop: '5px' }}>
                              <li><kbd>Left/Right</kbd> - Move between days, automatically moving to adjacent months at edges</li>
                              <li><kbd>Up/Down</kbd> - Move between weeks, intelligently navigating to months above/below in grid layouts</li>
                              <li>Navigation maintains column position when moving between months</li>
                              <li>Works with any number of visible months (1-N)</li>
                            </ul>
                          </li>
                          <li><kbd>Home</kbd> - Go to first day of week</li>
                          <li><kbd>End</kbd> - Go to last day of week</li>
                          <li><kbd>Ctrl+Home</kbd> - Go to first day of month</li>
                          <li><kbd>Ctrl+End</kbd> - Go to last day of month</li>
                          <li><kbd>Page Up</kbd> - Navigate to previous month</li>
                          <li><kbd>Page Down</kbd> - Navigate to next month</li>
                          <li><kbd>Enter</kbd> or <kbd>Space</kbd> - Select a date</li>
                          <li><kbd>Esc</kbd> - Close popup (in popup mode)</li>
                        </ul>
                      </div>
                      <CLACalendar 
                        settings={{
                          displayMode: 'embedded',
                          visibleMonths: 1,
                          monthWidth: 300,
                          selectionMode: 'range',
                          showSubmitButton: true,
                          showSelectionAlert: true,
                          onSubmit: handleDateSubmit
                        }}
                      />
                    </div>

                    {/* Multi-Month Keyboard Navigation Demo */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>1.1 Multi-Month Keyboard Navigation</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Test keyboard navigation with multiple visible months. Use arrow keys to navigate seamlessly between months:
                      </p>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>2 Months (Horizontal)</p>
                          <CLACalendar 
                            settings={{
                              displayMode: 'embedded',
                              visibleMonths: 2,
                              monthWidth: 250,
                              selectionMode: 'range',
                              showSubmitButton: true,
                              showSelectionAlert: true,
                              onSubmit: handleDateSubmit
                            }}
                          />
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>4 Months</p>
                          <CLACalendar 
                            settings={{
                              displayMode: 'embedded',
                              visibleMonths: 4,
                              monthWidth: 200,
                              selectionMode: 'range',
                              showSubmitButton: true,
                              showSelectionAlert: true,
                              onSubmit: handleDateSubmit
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>6 Months</p>
                        <CLACalendar 
                          settings={{
                            displayMode: 'embedded',
                            visibleMonths: 6,
                            monthWidth: 150,
                            selectionMode: 'range',
                            showSubmitButton: true,
                            showSelectionAlert: true,
                            onSubmit: handleDateSubmit
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>9 Months</p>
                        <CLACalendar 
                          settings={{
                            displayMode: 'embedded',
                            visibleMonths: 9,
                            monthWidth: 120,
                            selectionMode: 'range',
                            showSubmitButton: true,
                            showSelectionAlert: true,
                            onSubmit: handleDateSubmit
                          }}
                        />
                      </div>
                    </div>

                    {/* Screen Reader Support Demo */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>2. Screen Reader Support</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        The calendar provides comprehensive ARIA labels and live regions for screen readers.
                      </p>
                      <div className="cla-cal-alert cla-cal-alert-success cla-cal-mb-3">
                        <strong>ARIA Features:</strong>
                        <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                          <li>Calendar grid with proper <code>role="grid"</code> structure</li>
                          <li>Live regions for month changes and notifications</li>
                          <li>Descriptive labels for all interactive elements</li>
                          <li>Error announcements with <code>role="alert"</code></li>
                          <li>Selected date announcements</li>
                          <li>Restriction messages for unavailable dates</li>
                        </ul>
                      </div>
                      <CLACalendar 
                        settings={{
                          displayMode: 'popup',
                          visibleMonths: 1,
                          monthWidth: 300,
                          selectionMode: 'single',
                          showSubmitButton: true,
                          showTooltips: true,
                          restrictionConfigFactory: () => ({
                            restrictions: [
                              {
                                type: 'weekday',
                                enabled: true,
                                days: [0, 6],
                                message: 'Weekends are not available for booking'
                              }
                            ]
                          })
                        }}
                        onSubmit={handleDateSubmit}
                      />
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                        <em>Tip: Enable a screen reader to hear the announcements when navigating</em>
                      </p>
                    </div>

                    {/* Focus Management Demo */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>3. Focus Management</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Clear focus indicators and proper focus trapping in popup mode.
                      </p>
                      <CLACalendar 
                        settings={{
                          displayMode: 'embedded',
                          visibleMonths: 2,
                          monthWidth: 250,
                          selectionMode: 'range',
                          showSubmitButton: true,
                          showLayersNavigation: true,
                          layers: [
                            {
                              name: 'holidays',
                              title: 'Holidays',
                              description: 'Public holidays',
                              visible: true,
                              data: {
                                events: [
                                  {
                                    date: '2025-08-15',
                                    title: 'Independence Day',
                                    type: 'holiday',
                                    time: 'All day',
                                    description: 'National holiday',
                                    color: '#dc3545'
                                  }
                                ]
                              }
                            },
                            {
                              name: 'personal',
                              title: 'Personal',
                              description: 'Personal events',
                              visible: true,
                              data: {
                                events: [
                                  {
                                    date: '2025-08-20',
                                    title: 'Team Meeting',
                                    type: 'meeting',
                                    time: '10:00 AM',
                                    description: 'Monthly team sync',
                                    color: '#0366d6'
                                  }
                                ]
                              }
                            }
                          ],
                          showDateInputs: true,
                        }}
                        onSubmit={handleDateSubmit}
                      />
                      <div className="cla-cal-alert cla-cal-alert-warning cla-cal-mt-2">
                        <small>
                          <strong>Focus Features:</strong>
                          <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                            <li>Blue outline (2px) on focused elements</li>
                            <li>High contrast mode support with thicker outlines</li>
                            <li>Roving tabindex for efficient navigation</li>
                            <li>Focus returns to trigger when popup closes</li>
                          </ul>
                        </small>
                      </div>
                    </div>

                    {/* Form Integration Demo */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>4. Form Integration & Validation</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Proper form labels, error messages, and validation feedback.
                      </p>
                      <CLACalendar 
                        settings={{
                          displayMode: 'embedded',
                          visibleMonths: 1,
                          monthWidth: 300,
                          selectionMode: 'range',
                          showSubmitButton: true,
                          showDateInputs: true,
                          showFooter: true,
                          restrictionConfigFactory: () => ({
                            restrictions: [
                              {
                                type: 'boundary',
                                enabled: true,
                                minDate: new Date().toISOString().split('T')[0],
                                message: 'Please select a future date'
                              }
                            ]
                          })
                        }}
                        onSubmit={handleDateSubmit}
                      />
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                        Try typing an invalid date in the input fields to see error announcements
                      </p>
                    </div>

                    {/* Testing Tips */}
                    <div className="cla-cal-alert cla-cal-alert-secondary">
                      <h6>Testing Accessibility:</h6>
                      <ol style={{ marginBottom: 0, paddingLeft: '20px' }}>
                        <li>Use <strong>keyboard only</strong> navigation (no mouse)</li>
                        <li>Enable a <strong>screen reader</strong> (NVDA, JAWS, VoiceOver)</li>
                        <li>Use browser <strong>DevTools accessibility panel</strong></li>
                        <li>Check <strong>color contrast</strong> with browser extensions</li>
                        <li>Test with <strong>Windows High Contrast mode</strong></li>
                      </ol>
                    </div>
                  </div>
                )}

                {currentDemo === 'submissionFormatter' && (
                  <div>
                    <h4>Submission Formatter - Separate Visual & Submission Formats</h4>
                    <p className="cla-cal-text-muted">
                      The new <code>submissionFormatter</code> prop allows you to format dates differently for submission vs visual display.
                      This is useful when your API requires a specific format that differs from what users see.
                    </p>

                    {/* Example 1: Different Formats */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>1. Different Visual vs Submission Formats</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Visual: <code>MMM dd, yyyy</code> | Submission: <code>MM/dd/yyyy</code>
                      </p>
                      
                      <CLACalendar 
                        settings={{
                          displayMode: 'embedded',
                          visibleMonths: 1,
                          monthWidth: 300,
                          selectionMode: 'range',
                          showSubmitButton: true,
                          showFooter: true,
                          dateFormatter: (date: Date) => {
                            // Visual display format
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            return `${months[date.getUTCMonth()]} ${date.getUTCDate().toString().padStart(2, '0')}, ${date.getUTCFullYear()}`;
                          },
                          submissionFormatter: (date: Date) => {
                            // Submission format (US format)
                            const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
                            const day = date.getUTCDate().toString().padStart(2, '0');
                            return `${month}/${day}/${date.getUTCFullYear()}`;
                          },
                          onSubmit: (start: string | null, end: string | null) => {
                            const input = document.querySelector('.cla-input-custom') as HTMLInputElement;
                            setSubmissionFormatResult({
                              display: input?.value || '',
                              submitted: { start, end },
                              timestamp: new Date().toISOString()
                            });
                          },
                          defaultRange: { start: '2025-03-15', end: '2025-03-20' }
                        }}
                      />
                      
                      {submissionFormatResult && (
                        <div style={{
                          marginTop: '15px',
                          padding: '15px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #dee2e6'
                        }}>
                          <h6 style={{ marginBottom: '10px', color: '#495057' }}>Result:</h6>
                          <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>Visual Display:</strong> <span style={{ color: '#0066cc' }}>{submissionFormatResult.display}</span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <strong>Submitted Start:</strong> <span style={{ color: '#28a745' }}>{submissionFormatResult.submitted.start}</span>
                            </div>
                            <div>
                              <strong>Submitted End:</strong> <span style={{ color: '#28a745' }}>{submissionFormatResult.submitted.end}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Example 2: Dynamic Visual Format Switcher */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>2. Dynamic Visual Format Switcher</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Change the visual format using the dropdown - the input field updates immediately!
                        <br />
                        <strong>Note:</strong> This only affects the visual display, not the submission format (always ISO).
                      </p>
                      
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ marginRight: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                          Select Date Format:
                        </label>
                        <select 
                          value={selectedFormatType}
                          onChange={(e) => setSelectedFormatType(e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ced4da',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="us">US Format (MM/DD/YYYY)</option>
                          <option value="eu">European Format (DD.MM.YYYY)</option>
                          <option value="iso">ISO Format (YYYY-MM-DD)</option>
                          <option value="long">Long Format (Month DD, YYYY)</option>
                          <option value="full">Full Format (Weekday, Month DD, YYYY)</option>
                          <option value="compact">Compact (MMM DD, YY)</option>
                          <option value="japanese">Japanese Style (YYYY年MM月DD日)</option>
                          <option value="custom">Custom with Time (DD MMM @ 12:00 PM)</option>
                        </select>
                      </div>
                      
                      <div id="dynamic-format-example">
                        <CLACalendar 
                          key={selectedFormatType} // Force re-render when format changes
                          settings={{
                            displayMode: 'popup',
                            visibleMonths: 2,
                            monthWidth: 300,
                            selectionMode: 'range',
                            inputStyle: { width: '600px' }, // Make input field 2x wider
                            showSubmitButton: true,
                            showFooter: true,
                            dateFormatter: (date: Date) => {
                              switch(selectedFormatType) {
                                case 'us':
                                  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
                                case 'eu':
                                  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
                                case 'iso':
                                  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                                case 'long':
                                  const longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 
                                                     'July', 'August', 'September', 'October', 'November', 'December'];
                                  return `${longMonths[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
                                case 'full':
                                  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 
                                                     'July', 'August', 'September', 'October', 'November', 'December'];
                                  return `${days[date.getDay()]}, ${fullMonths[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
                                case 'compact':
                                  const compactMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                  return `${compactMonths[date.getMonth()]} ${date.getDate()}, '${date.getFullYear().toString().slice(-2)}`;
                                case 'japanese':
                                  return `${date.getFullYear()}年${(date.getMonth() + 1)}月${date.getDate()}日`;
                                case 'custom':
                                  const customMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                  return `${date.getDate()} ${customMonths[date.getMonth()]} @ 12:00 PM`;
                                default:
                                  return date.toLocaleDateString();
                              }
                            },
                            // Note: submissionFormatter is intentionally NOT provided
                            // This means submission will always be ISO format (YYYY-MM-DD)
                            onSubmit: (start: string | null, end: string | null) => {
                              const dynamicExample = document.getElementById('dynamic-format-example');
                              const input = dynamicExample?.querySelector('.cla-input-custom') as HTMLInputElement;
                              const visualDisplay = input?.value || '';
                              
                              // Update the state for this specific example
                              setDynamicFormatResult({
                                visual: visualDisplay,
                                start,
                                end
                              });
                            },
                            defaultRange: { start: '2025-03-15', end: '2025-03-20' }
                          }}
                        />
                      </div>
                      
                      {/* Result Display */}
                      <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        minHeight: '50px'
                      }}>
                        {dynamicFormatResult ? (
                          <>
                            <h6 style={{ marginBottom: '10px', color: '#495057' }}>Submission Results:</h6>
                            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Visual Display ({selectedFormatType}):</strong>{' '}
                                <span style={{ color: '#0066cc', background: '#f0f8ff', padding: '2px 6px', borderRadius: '3px' }}>
                                  {dynamicFormatResult.visual}
                                </span>
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Submitted Start (ISO):</strong>{' '}
                                <span style={{ color: '#28a745', background: '#d4edda', padding: '2px 6px', borderRadius: '3px' }}>
                                  {dynamicFormatResult.start}
                                </span>
                              </div>
                              <div>
                                <strong>Submitted End (ISO):</strong>{' '}
                                <span style={{ color: '#28a745', background: '#d4edda', padding: '2px 6px', borderRadius: '3px' }}>
                                  {dynamicFormatResult.end}
                                </span>
                              </div>
                            </div>
                            <div style={{ marginTop: '12px', padding: '10px', background: '#fff3cd', borderRadius: '4px', fontSize: '13px' }}>
                              ⚠️ Notice: The visual format changes with the dropdown, but submission always uses ISO format!
                            </div>
                          </>
                        ) : (
                          <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
                            Click the input field above, select dates, and submit to see the format difference...
                          </p>
                        )}
                      </div>
                      
                      <div style={{
                        marginTop: '15px',
                        padding: '12px',
                        backgroundColor: '#e8f4f8',
                        borderRadius: '6px',
                        border: '1px solid #b8daff',
                        fontSize: '13px'
                      }}>
                        <strong>Current Format Type:</strong> {(() => {
                          switch(selectedFormatType) {
                            case 'us': return 'US Format (MM/DD/YYYY)';
                            case 'eu': return 'European Format (DD.MM.YYYY)';
                            case 'iso': return 'ISO Format (YYYY-MM-DD)';
                            case 'long': return 'Long Format (Month DD, YYYY)';
                            case 'full': return 'Full Format (Weekday, Month DD, YYYY)';
                            case 'compact': return 'Compact (MMM DD, \'YY)';
                            case 'japanese': return 'Japanese Style (YYYY年MM月DD日)';
                            case 'custom': return 'Custom with Time';
                            default: return 'Unknown';
                          }
                        })()}
                        <br />
                        <span style={{ color: '#6c757d' }}>
                          Try selecting different formats to see how the input field display changes!
                        </span>
                      </div>
                    </div>

                    {/* Example 3: Timestamp Format */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>3. Unix Timestamp Submission</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Visual: <code>dd MMM yyyy</code> | Submission: Unix timestamp (milliseconds)
                      </p>
                      
                      <CLACalendar 
                        settings={{
                          displayMode: 'embedded',
                          visibleMonths: 1,
                          monthWidth: 300,
                          selectionMode: 'single',
                          showSubmitButton: true,
                          showFooter: true,
                          dateFormatter: (date: Date) => {
                            // Visual: "15 Mar 2025"
                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
                          },
                          submissionFormatter: (date: Date) => {
                            // Submit as timestamp
                            return date.getTime().toString();
                          },
                          onSubmit: (start: string | null, end: string | null) => {
                            if (start) {
                              const timestamp = parseInt(start);
                              const date = new Date(timestamp);
                              alert(`Submitted timestamp: ${start}\nParsed date: ${date.toLocaleString()}`);
                            }
                          }
                        }}
                      />
                    </div>

                    {/* Example 4: API Format */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>4. API-Specific ISO Format</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        Visual: Localized format | Submission: ISO 8601 with time
                      </p>
                      
                      <div id="api-format-example">
                        <CLACalendar 
                          settings={{
                            displayMode: 'embedded',
                            visibleMonths: 2,
                            monthWidth: 350,
                            selectionMode: 'range',
                          showSubmitButton: true,
                          showFooter: true,
                          dateFormatter: (date: Date) => {
                            // Localized display
                            return date.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            });
                          },
                          submissionFormatter: (date: Date) => {
                            // API expects ISO format with noon time
                            const apiDate = new Date(date);
                            apiDate.setUTCHours(12, 0, 0, 0);
                            return apiDate.toISOString();
                          },
                            onSubmit: (start: string | null, end: string | null) => {
                              console.log('API Payload:', { checkIn: start, checkOut: end });
                              // Update the state to show the API payload
                              const apiExample = document.getElementById('api-format-example');
                              const input = apiExample?.querySelector('.cla-input-custom') as HTMLInputElement;
                              const displayText = input?.value || '';
                              
                              // Update state for this specific example
                              setApiFormatResult({
                                visual: displayText,
                                checkIn: start,
                                checkOut: end
                              });
                            }
                          }}
                        />
                      </div>
                      
                      {/* API Result Display */}
                      <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        minHeight: '50px'
                      }}>
                        {apiFormatResult ? (
                          <>
                            <h6 style={{ marginBottom: '10px', color: '#495057' }}>API Payload:</h6>
                            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Visual Display:</strong>{' '}
                                <span style={{ color: '#0066cc' }}>{apiFormatResult.visual}</span>
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <strong>Check-in (ISO):</strong>{' '}
                                <span style={{ color: '#28a745' }}>{apiFormatResult.checkIn}</span>
                              </div>
                              <div>
                                <strong>Check-out (ISO):</strong>{' '}
                                <span style={{ color: '#28a745' }}>{apiFormatResult.checkOut}</span>
                              </div>
                            </div>
                            <div style={{
                              marginTop: '12px',
                              padding: '10px',
                              backgroundColor: '#e8f4f8',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              <strong>Raw API Request:</strong>
                              <pre style={{ margin: '5px 0 0 0', fontSize: '11px' }}>
{JSON.stringify({ 
  booking: { 
    checkIn: apiFormatResult.checkIn?.split('T')[0], 
    checkOut: apiFormatResult.checkOut?.split('T')[0],
    time: '12:00 PM' 
  } 
}, null, 2)}
                              </pre>
                            </div>
                          </>
                        ) : (
                          <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
                            Submit dates to see the API payload format...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Example 5: Backward Compatibility */}
                    <div className="cla-cal-mb-4">
                      <h5 style={{ fontSize: '18px', marginBottom: '10px' }}>5. Backward Compatibility (No submissionFormatter)</h5>
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                        When <code>submissionFormatter</code> is not provided, dates are submitted in ISO format (YYYY-MM-DD) as before.
                      </p>
                      
                      <CLACalendar 
                        settings={{
                          displayMode: 'embedded',
                          visibleMonths: 1,
                          monthWidth: 300,
                          selectionMode: 'range',
                          showSubmitButton: true,
                          showFooter: true,
                          dateFormatter: (date: Date) => {
                            // Custom visual format
                            const day = date.getDate().toString().padStart(2, '0');
                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                            return `${day}/${month}/${date.getFullYear()}`;
                          },
                          // Note: NO submissionFormatter - maintains backward compatibility
                          onSubmit: (start: string | null, end: string | null) => {
                            alert(`Default ISO Format:\nStart: ${start}\nEnd: ${end}`);
                          }
                        }}
                      />
                    </div>

                    {/* Code Example */}
                    <div className="cla-cal-alert cla-cal-alert-info">
                      <h6>Implementation Example:</h6>
                      <pre className="cla-cal-bg-light cla-cal-p-2 cla-cal-rounded" style={{ fontSize: '13px' }}>
                        <code>{`<CLACalendar 
  settings={{
    // Visual display format
    dateFormatter: (date) => format(date, "MMM dd, yyyy"),
    
    // Submission format (new feature!)
    submissionFormatter: (date) => format(date, "MM/dd/yyyy"),
    
    onSubmit: (start, end) => {
      // start = "03/15/2025" (submission format)
      // NOT "Mar 15, 2025" (display format)
      // NOT "2025-03-15" (default ISO format)
      
      api.submitDates({ start, end });
    }
  }}
/>`}</code>
                      </pre>
                    </div>

                    <div className="cla-cal-alert cla-cal-alert-warning cla-cal-mt-3">
                      <strong>Key Points:</strong>
                      <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                        <li><code>dateFormatter</code> - Controls visual display in the input field</li>
                        <li><code>submissionFormatter</code> - Controls the format passed to <code>onSubmit</code></li>
                        <li>When <code>submissionFormatter</code> is not provided, ISO format (YYYY-MM-DD) is used (backward compatible)</li>
                        <li>Both formatters work independently - you can use either, both, or neither</li>
                      </ul>
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

<CLACalendar 
  settings={{
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

// Helper component to allow live-updating nav restrictions via window event
const NavRestrictionsDemoCalendar: React.FC<{ onSubmit: (a: string|null, b: string|null) => void }> = ({ onSubmit }) => {
  const [cfg, setCfg] = _useState({ visibleMonths: 2, before: '2025-09-01', after: '2025-12-31' });

  _useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      setCfg(prev => ({
        visibleMonths: Math.min(6, Math.max(1, Number(detail.visibleMonths ?? prev.visibleMonths))),
        before: detail.before || prev.before,
        after: detail.after || prev.after
      }));
    };
    window.addEventListener('nav-restrictions-update' as any, handler as any);
    return () => window.removeEventListener('nav-restrictions-update' as any, handler as any);
  }, []);

  return (
    <CLACalendar
      settings={{
        displayMode: 'embedded',
        visibleMonths: cfg.visibleMonths,
        monthWidth: 260,
        selectionMode: 'range',
        showSubmitButton: true,
        showDateInputs: true,
        showSelectionAlert: true,
        navigationRestrictions: {
          restrictions: [
            { direction: 'before', date: cfg.before, message: 'Minimum month reached' },
            { direction: 'after', date: cfg.after, message: 'Maximum month reached' }
          ]
        }
      }}
      onSubmit={onSubmit}
    />
  );
};