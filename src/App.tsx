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
                  onChange={(e) => setCurrentDemo(e.target.value)}
                >
                  <option value="basic">Basic Usage</option>
                  <option value="single">Single Date Selection</option>
                  <option value="multiple">Multiple Months</option>
                  <option value="custom">Custom Theme</option>
                  <option value="popup">Popup Mode</option>
                  <option value="popup-positions">Popup Positioning Tests</option>
                  <option value="dynamic-positioning">Dynamic Positioning Demo</option>
                  <option value="null-safe">Null-Safe Configuration</option>
                  <option value="restrictions">Restriction Testing</option>
                  <option value="accessibility">Accessibility Features</option>
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
                          <li><kbd>Tab</kbd> - Move to calendar, then to other controls</li>
                          <li><kbd>Arrow Keys</kbd> - Navigate between days</li>
                          <li><kbd>Home</kbd> - Go to first day of week</li>
                          <li><kbd>End</kbd> - Go to last day of week</li>
                          <li><kbd>Ctrl+Home</kbd> - Go to first day of month</li>
                          <li><kbd>Ctrl+End</kbd> - Go to last day of month</li>
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