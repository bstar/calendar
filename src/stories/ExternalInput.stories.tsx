import React, { useRef, useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CLACalendar from '../components/CLACalendar';
import { calendarArgTypes, defaultArgs } from './shared/storyControls';
import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';
import { createCalendarSettings } from '../components/CLACalendar.config';

const meta: Meta<typeof CLACalendar> = {
  title: 'External Input/Stories',
  component: CLACalendar,
  argTypes: calendarArgTypes,
  args: defaultArgs,
  parameters: {
    docs: {
      description: {
        component: 'Examples of using CLACalendar with external input elements'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic External Input Example
export const BasicExternalInput: Story = {
  render: (args) => {
    const ExternalInputExample = () => {
      const externalInputRef = useRef<HTMLInputElement>(null);
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>External Input Example</h3>
          <p>The calendar is bound to the external input below with range selection:</p>
          
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="external-date-input" style={{ display: 'block', marginBottom: '5px' }}>
              Select Date Range:
            </label>
            <input
              ref={externalInputRef}
              id="external-date-input"
              type="text"
              placeholder="Click to select date range"
              style={{
                padding: '8px 12px',
                border: '2px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                width: '400px'
              }}
            />
          </div>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'popup',
              externalInput: externalInputRef,
              selectionMode: 'range',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit
            })}
          />
          
          {submittedDates && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Submitted Date Range:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
        </div>
      );
    };
    
    return <ExternalInputExample />;
  }
};

// External Input with Validation
export const ExternalInputWithValidation: Story = {
  render: (args) => {
    const ValidatedInputExample = () => {
      const externalInputRef = useRef<HTMLInputElement>(null);
      const [validationMessages, setValidationMessages] = useState<string[]>([]);
      const [validationType, setValidationType] = useState<'warning' | 'error' | 'info' | ''>('');
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      
      // Monitor external input for validation
      useEffect(() => {
        if (!externalInputRef.current) return;
        
        const handleInput = () => {
          const value = externalInputRef.current?.value || '';
          
          if (!value) {
            setValidationMessages([]);
            setValidationType('');
            return;
          }
          
          // Parse date range (expecting format like "Jan 1, 2025 - Jan 15, 2025")
          const dates = value.split(' - ').map(d => d.trim());
          const messages: string[] = [];
          let overallType: typeof validationType = 'info';
          
          dates.forEach((dateStr, index) => {
            try {
              const date = new Date(dateStr);
              if (isNaN(date.getTime())) return;
              
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const selectedDate = new Date(date);
              selectedDate.setHours(0, 0, 0, 0);
              
              const daysDiff = Math.floor((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const dateLabel = index === 0 ? 'Start date' : 'End date';
              
              if (daysDiff > 90) {
                messages.push(`⚠️ ${dateLabel} is ${daysDiff} days in the future`);
                overallType = 'warning';
              } else if (daysDiff < -90) {
                messages.push(`⚠️ ${dateLabel} is ${Math.abs(daysDiff)} days in the past`);
                overallType = 'warning';
              } else if (daysDiff < 0) {
                messages.push(`ℹ️ ${dateLabel} is in the past`);
              }
            } catch (e) {
              // Invalid date format
            }
          });
          
          // Check if end is before start
          if (dates.length === 2) {
            try {
              const startDate = new Date(dates[0]);
              const endDate = new Date(dates[1]);
              if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                if (endDate < startDate) {
                  messages.push('❌ End date is before start date');
                  overallType = 'error';
                } else {
                  const rangeDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                  messages.push(`✓ Range spans ${rangeDays + 1} days`);
                }
              }
            } catch (e) {
              // Invalid date format
            }
          }
          
          setValidationMessages(messages);
          setValidationType(overallType);
        };
        
        const input = externalInputRef.current;
        input.addEventListener('input', handleInput);
        
        return () => {
          input.removeEventListener('input', handleInput);
        };
      }, []);
      
      const getValidationColor = () => {
        switch (validationType) {
          case 'warning': return '#f6c23e';
          case 'error': return '#dc3545';
          case 'info': return '#0366d6';
          default: return '#666';
        }
      };
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>External Input with Date Range Validation</h3>
          <p>This example validates date ranges and shows warnings for dates too far in the past or future.</p>
          
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="validated-date-input" style={{ display: 'block', marginBottom: '5px' }}>
              Select Date Range:
            </label>
            <input
              ref={externalInputRef}
              id="validated-date-input"
              type="text"
              placeholder="Click to select date range"
              style={{
                padding: '8px 12px',
                border: `2px solid ${validationMessages.length ? getValidationColor() : '#ccc'}`,
                borderRadius: '4px',
                fontSize: '16px',
                width: '400px',
                transition: 'border-color 0.3s'
              }}
            />
            {validationMessages.length > 0 && (
              <div style={{
                marginTop: '5px',
                fontSize: '14px'
              }}>
                {validationMessages.map((msg, index) => (
                  <div key={index} style={{ color: getValidationColor(), marginTop: '2px' }}>
                    {msg}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'popup',
              externalInput: externalInputRef,
              selectionMode: 'range',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit
            })}
          />
          
          {submittedDates && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Submitted Date Range:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
        </div>
      );
    };
    
    return <ValidatedInputExample />;
  }
};

// Multiple External Inputs
export const MultipleExternalInputs: Story = {
  render: (args) => {
    const MultipleInputsExample = () => {
      const startInputRef = useRef<HTMLInputElement>(null);
      const endInputRef = useRef<HTMLInputElement>(null);
      const [activeInput, setActiveInput] = useState<'start' | 'end'>('start');
      const [submittedStart, setSubmittedStart] = useState<string | null>(null);
      const [submittedEnd, setSubmittedEnd] = useState<string | null>(null);
      
      const handleStartSubmit = (start: string | null) => {
        setSubmittedStart(start);
      };
      
      const handleEndSubmit = (end: string | null) => {
        setSubmittedEnd(end);
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>Multiple External Inputs</h3>
          <p>Two separate inputs with their own calendars for start and end dates (single selection mode).</p>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label htmlFor="start-date" style={{ display: 'block', marginBottom: '5px' }}>
                Start Date:
              </label>
              <input
                ref={startInputRef}
                id="start-date"
                type="text"
                placeholder="Select start date"
                onFocus={() => setActiveInput('start')}
                style={{
                  padding: '8px 12px',
                  border: `2px solid ${activeInput === 'start' ? '#0366d6' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '16px',
                  width: '200px'
                }}
              />
              <CLACalendar
                settings={createCalendarSettings({
                  ...args,
                  displayMode: 'popup',
                  externalInput: startInputRef,
                  selectionMode: 'single',
                  showSubmitButton: true,
                  showFooter: true,
                  onSubmit: handleStartSubmit
                })}
              />
            </div>
            
            <div>
              <label htmlFor="end-date" style={{ display: 'block', marginBottom: '5px' }}>
                End Date:
              </label>
              <input
                ref={endInputRef}
                id="end-date"
                type="text"
                placeholder="Select end date"
                onFocus={() => setActiveInput('end')}
                style={{
                  padding: '8px 12px',
                  border: `2px solid ${activeInput === 'end' ? '#0366d6' : '#ccc'}`,
                  borderRadius: '4px',
                  fontSize: '16px',
                  width: '200px'
                }}
              />
              <CLACalendar
                settings={createCalendarSettings({
                  ...args,
                  displayMode: 'popup',
                  externalInput: endInputRef,
                  selectionMode: 'single',
                  showSubmitButton: true,
                  showFooter: true,
                  onSubmit: handleEndSubmit
                })}
              />
            </div>
          </div>
          
          {(submittedStart || submittedEnd) && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Submitted Dates:</strong>
              <div>Start Date: {submittedStart || 'Not selected'}</div>
              <div>End Date: {submittedEnd || 'Not selected'}</div>
              {submittedStart && submittedEnd && (
                <div style={{ marginTop: '5px', fontStyle: 'italic' }}>
                  Range: {submittedStart} to {submittedEnd}
                </div>
              )}
            </div>
          )}
        </div>
      );
    };
    
    return <MultipleInputsExample />;
  }
};

// External Input via Selector
export const ExternalInputViaSelector: Story = {
  render: (args) => {
    const SelectorExample = () => {
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      
      useEffect(() => {
        const container = document.getElementById('external-input-container');
        if (!container) return;
        
        // Check if input already exists
        let input = document.getElementById('external-calendar-input') as HTMLInputElement;
        
        if (!input) {
          // Create the input element in the DOM
          input = document.createElement('input');
          input.id = 'external-calendar-input';
          input.type = 'text';
          input.placeholder = 'Click to select date range';
          input.style.cssText = `
            padding: 8px 12px;
            border: 2px solid #ccc;
            border-radius: 4px;
            font-size: 16px;
            width: 400px;
          `;
          container.appendChild(input);
        }
        
        return () => {
          // Only remove if it's still in the container
          const existingInput = document.getElementById('external-calendar-input');
          if (existingInput && existingInput.parentElement === container) {
            existingInput.remove();
          }
        };
      }, []);
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>External Input via CSS Selector</h3>
          <p>The calendar finds and binds to an input using a CSS selector (range selection).</p>
          
          <div id="external-input-container" style={{ marginBottom: '20px' }}>
            <label htmlFor="external-calendar-input" style={{ display: 'block', marginBottom: '5px' }}>
              Select Date Range:
            </label>
          </div>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'popup',
              externalInputSelector: '#external-calendar-input',
              selectionMode: 'range',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit
            })}
          />
          
          {submittedDates && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Submitted Date Range:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
        </div>
      );
    };
    
    return <SelectorExample />;
  }
};

// Custom Styled External Input
export const CustomStyledExternalInput: Story = {
  render: (args) => {
    const CustomStyledExample = () => {
      const externalInputRef = useRef<HTMLInputElement>(null);
      const [isFocused, setIsFocused] = useState(false);
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>Custom Styled External Input</h3>
          <p>Demonstrates integration with a highly customized input field (range selection).</p>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              position: 'relative',
              width: '450px'
            }}>
              <input
                ref={externalInputRef}
                type="text"
                placeholder="Select date range"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: '#f7f7f7',
                  boxShadow: isFocused ? '0 0 0 3px rgba(3, 102, 214, 0.3)' : 'none',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
              />
              <div style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#666'
              }}>
                📅
              </div>
            </div>
          </div>
          
          <CLACalendar
            settings={createCalendarSettings({
              ...args,
              displayMode: 'popup',
              externalInput: externalInputRef,
              position: 'bottom-left',
              selectionMode: 'range',
              showSubmitButton: true,
              showFooter: true,
              onSubmit: handleSubmit
            })}
          />
          
          {submittedDates && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>Submitted Date Range:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
        </div>
      );
    };
    
    return <CustomStyledExample />;
  }
};

// Migration Example
export const MigrationExample: Story = {
  render: (args) => {
    const MigrationDemo = () => {
      const [showLegacy, setShowLegacy] = useState(true);
      const legacyInputRef = useRef<HTMLInputElement>(null);
      const [submittedDates, setSubmittedDates] = useState<{start: string | null, end: string | null} | null>(null);
      
      const handleSubmit = (start: string | null, end: string | null) => {
        setSubmittedDates({ start, end });
        // In a real app, this would submit to your form handler
        console.log('Form submission with dates:', { start, end });
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h3>Migration from Legacy Calendar</h3>
          <p>This example shows how to migrate from an existing calendar implementation with form integration.</p>
          
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setShowLegacy(!showLegacy)}
              style={{
                padding: '8px 16px',
                marginBottom: '10px',
                backgroundColor: '#0366d6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showLegacy ? 'Switch to CLACalendar' : 'Switch to Legacy'}
            </button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            alert(`Form submitted with value: ${legacyInputRef.current?.value}`);
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Date Range Input (shared between implementations):
              </label>
              <input
                ref={legacyInputRef}
                type="text"
                name="dateRange"
                placeholder="Select date range"
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  width: '400px'
                }}
              />
            </div>
            
            {showLegacy ? (
              <div style={{
                padding: '10px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                border: '1px solid #ddd',
                marginBottom: '20px'
              }}>
                <p style={{ margin: 0, color: '#666' }}>
                  Legacy calendar would be rendered here.
                  The same input element above would be used.
                </p>
              </div>
            ) : (
              <CLACalendar
                settings={createCalendarSettings({
                  ...args,
                  displayMode: 'popup',
                  externalInput: legacyInputRef,
                  selectionMode: 'range',
                  showSubmitButton: true,
                  showFooter: true,
                  onSubmit: handleSubmit
                })}
              />
            )}
            
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                marginTop: '10px'
              }}
            >
              Submit Form
            </button>
          </form>
          
          {submittedDates && !showLegacy && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              border: '1px solid #0366d6'
            }}>
              <strong>CLACalendar Submitted:</strong>
              <div>Start: {submittedDates.start || 'Not selected'}</div>
              <div>End: {submittedDates.end || 'Not selected'}</div>
            </div>
          )}
          
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p><strong>Migration Benefits:</strong></p>
            <ul>
              <li>No HTML changes required - reuse existing form structure</li>
              <li>Form validation and submission continue to work</li>
              <li>Easy A/B testing between implementations</li>
              <li>Gradual rollout possible</li>
              <li>Input events properly dispatched for form libraries</li>
            </ul>
          </div>
        </div>
      );
    };
    
    return <MigrationDemo />;
  }
};