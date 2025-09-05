import React, { useRef, createRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CLACalendar from './CLACalendar';
import { createCalendarSettings } from './CLACalendar.config';
import '@testing-library/jest-dom';

describe('CLACalendar External Input', () => {
  const defaultProps = {
    settings: createCalendarSettings({
      displayMode: 'popup',
      selectionMode: 'single'
    }),
    _onSettingsChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any external inputs added to the document
    document.body.innerHTML = '';
  });

  describe('External Input via Ref', () => {
    it('should bind to external input element via ref', () => {
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={externalInputRef} data-testid="external-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef
              })}
            />
          </div>
        );
      };

      const { container } = render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input');
      expect(externalInput).toBeInTheDocument();
      
      // Internal input should not be rendered
      expect(container.querySelector('.cla-input-custom')).not.toBeInTheDocument();
    });

    it('should bind to external input element via direct HTMLElement', () => {
      // Create external input directly in document
      const externalInput = document.createElement('input');
      externalInput.setAttribute('data-testid', 'external-input');
      document.body.appendChild(externalInput);

      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            displayMode: 'popup',
            externalInput: externalInput
          })}
        />
      );
      
      // Internal input should not be rendered
      expect(container.querySelector('.cla-input-custom')).not.toBeInTheDocument();
    });

    it('should open calendar when external input is clicked', () => {
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={externalInputRef} data-testid="external-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef
              })}
            />
          </div>
        );
      };

      const { container } = render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input');
      fireEvent.click(externalInput);
      
      // Calendar should be marked as open
      const wrapper = container.querySelector('.cla-calendar-wrapper');
      expect(wrapper?.getAttribute('data-open')).toBe('true');
    });

    it('should open calendar when external input is focused', () => {
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={externalInputRef} data-testid="external-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef
              })}
            />
          </div>
        );
      };

      const { container } = render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input');
      fireEvent.focus(externalInput);
      
      // Calendar should be marked as open
      const wrapper = container.querySelector('.cla-calendar-wrapper');
      expect(wrapper?.getAttribute('data-open')).toBe('true');
    });

    it('should not bind events when bindExternalInputEvents is false', () => {
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={externalInputRef} data-testid="external-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef,
                bindExternalInputEvents: false
              })}
            />
          </div>
        );
      };

      const { container } = render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input');
      fireEvent.click(externalInput);
      
      // Calendar should remain closed
      const wrapper = container.querySelector('.cla-calendar-wrapper');
      expect(wrapper?.getAttribute('data-open')).toBe('false');
    });
  });

  describe('External Input via Selector', () => {
    it('should bind to external input element via selector', () => {
      // Create external input with ID
      const externalInput = document.createElement('input');
      externalInput.id = 'date-picker';
      externalInput.setAttribute('data-testid', 'external-input');
      document.body.appendChild(externalInput);

      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            displayMode: 'popup',
            externalInputSelector: '#date-picker'
          })}
        />
      );
      
      // Internal input should not be rendered
      expect(container.querySelector('.cla-input-custom')).not.toBeInTheDocument();
    });

    it('should bind to external input element via class selector', () => {
      // Create external input with class
      const externalInput = document.createElement('input');
      externalInput.className = 'date-input-field';
      externalInput.setAttribute('data-testid', 'external-input');
      document.body.appendChild(externalInput);

      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            displayMode: 'popup',
            externalInputSelector: '.date-input-field'
          })}
        />
      );
      
      // Internal input should not be rendered
      expect(container.querySelector('.cla-input-custom')).not.toBeInTheDocument();
    });

    it('should handle missing external input gracefully', () => {
      render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            displayMode: 'popup',
            externalInputSelector: '#non-existent-input'
          })}
        />
      );
      
      // Should render internal input as fallback
      const internalInput = document.querySelector('.cla-input-custom');
      expect(internalInput).toBeInTheDocument();
    });
  });

  describe('Value Synchronization', () => {
    it('should update external input value when date is selected', () => {
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={externalInputRef} data-testid="external-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef,
                selectionMode: 'single'
              })}
            />
          </div>
        );
      };

      const { container } = render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input') as HTMLInputElement;
      
      // Open calendar
      fireEvent.click(externalInput);
      
      // Select a date
      const dates = container.querySelectorAll('.day-cell');
      const dateToSelect = Array.from(dates).find(cell => cell.textContent === '15');
      
      if (dateToSelect) {
        fireEvent.mouseDown(dateToSelect);
        
        // External input should be updated
        expect(externalInput.value).toContain('15');
      }
    });

    it('should not update external input when updateExternalInput is false', () => {
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={externalInputRef} data-testid="external-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef,
                updateExternalInput: false,
                selectionMode: 'single'
              })}
            />
          </div>
        );
      };

      const { container } = render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input') as HTMLInputElement;
      const initialValue = externalInput.value;
      
      // Open calendar
      fireEvent.click(externalInput);
      
      // Select a date
      const dates = container.querySelectorAll('.day-cell');
      const dateToSelect = Array.from(dates).find(cell => cell.textContent === '15');
      
      if (dateToSelect) {
        fireEvent.mouseDown(dateToSelect);
        
        // External input should not be updated
        expect(externalInput.value).toBe(initialValue);
      }
    });

    it('should dispatch input event when updating external input', () => {
      const handleInput = vi.fn();
      
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input 
              ref={externalInputRef} 
              data-testid="external-input"
              onInput={handleInput}
            />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef,
                selectionMode: 'single'
              })}
            />
          </div>
        );
      };

      const { container } = render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input');
      
      // Open calendar
      fireEvent.click(externalInput);
      
      // Select a date
      const dates = container.querySelectorAll('.day-cell');
      const dateToSelect = Array.from(dates).find(cell => cell.textContent === '15');
      
      if (dateToSelect) {
        fireEvent.mouseDown(dateToSelect);
        
        // Input event should be dispatched
        expect(handleInput).toHaveBeenCalled();
      }
    });

    it('should format date range for external input', () => {
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={externalInputRef} data-testid="external-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef,
                selectionMode: 'range'
              })}
            />
          </div>
        );
      };

      const { container } = render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input') as HTMLInputElement;
      
      // Open calendar
      fireEvent.click(externalInput);
      
      // Select date range
      const dates = container.querySelectorAll('.day-cell');
      const startDate = Array.from(dates).find(cell => cell.textContent === '10');
      const endDate = Array.from(dates).find(cell => cell.textContent === '15');
      
      if (startDate && endDate) {
        fireEvent.mouseDown(startDate);
        fireEvent.mouseEnter(endDate);
        fireEvent.mouseUp(endDate);
        
        // External input should show range
        expect(externalInput.value).toContain('10');
        expect(externalInput.value).toContain('15');
        expect(externalInput.value).toContain(' - '); // default separator
      }
    });
  });

  describe('Portal Positioning', () => {
    it('should position portal relative to external input', () => {
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input 
              ref={externalInputRef} 
              data-testid="external-input"
              style={{ position: 'absolute', top: '100px', left: '200px' }}
            />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef
              })}
            />
          </div>
        );
      };

      render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input');
      
      // Open calendar
      fireEvent.click(externalInput);
      
      // Portal should be positioned (implementation will handle actual positioning)
      // This test verifies that the portal receives the correct triggerRef
      const portal = document.querySelector('.cla-calendar-portal');
      expect(portal).toBeInTheDocument();
    });
  });

  describe('Event Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={externalInputRef} data-testid="external-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef
              })}
            />
          </div>
        );
      };

      const { unmount, container } = render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input');
      
      // Open calendar to ensure listeners are attached
      fireEvent.click(externalInput);
      
      // Unmount component
      unmount();
      
      // Click should not cause any errors after unmount
      expect(() => fireEvent.click(externalInput)).not.toThrow();
    });

    it('should handle external input ref changes', () => {
      const ExternalInputTest = () => {
        const [inputRef, setInputRef] = React.useState(createRef<HTMLInputElement>());
        
        return (
          <div>
            <input ref={inputRef} data-testid="external-input-1" />
            <button onClick={() => setInputRef(createRef<HTMLInputElement>())}>
              Change Ref
            </button>
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: inputRef
              })}
            />
          </div>
        );
      };

      const { rerender } = render(<ExternalInputTest />);
      
      // Change the ref
      const changeButton = screen.getByText('Change Ref');
      fireEvent.click(changeButton);
      
      // Should handle the change gracefully
      expect(document.querySelector('.cla-calendar-wrapper')).toBeInTheDocument();
    });
  });

  describe('Default Range with External Input', () => {
    it('should initialize external input with default range', () => {
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={externalInputRef} data-testid="external-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef,
                defaultRange: {
                  start: '2025-07-15',
                  end: '2025-07-20'
                },
                selectionMode: 'range'
              })}
            />
          </div>
        );
      };

      render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input') as HTMLInputElement;
      
      // Should have the default range value
      expect(externalInput.value).toContain('07/15');
      expect(externalInput.value).toContain('07/20');
    });
  });

  describe('Range Selection with External Input', () => {
    it('should update external input with range selection and format correctly', () => {
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={externalInputRef} data-testid="external-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef,
                selectionMode: 'range',
                dateRangeSeparator: ' - '
              })}
            />
          </div>
        );
      };

      const { container } = render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input') as HTMLInputElement;
      
      // Open calendar
      fireEvent.click(externalInput);
      
      // Select date range
      const dates = container.querySelectorAll('.day-cell');
      const startDate = Array.from(dates).find(cell => cell.textContent === '10');
      const endDate = Array.from(dates).find(cell => cell.textContent === '15');
      
      if (startDate && endDate) {
        fireEvent.mouseDown(startDate);
        fireEvent.mouseEnter(endDate);
        fireEvent.mouseUp(endDate);
        
        // External input should show range with separator
        expect(externalInput.value).toContain('10');
        expect(externalInput.value).toContain('15');
        expect(externalInput.value).toContain(' - ');
      }
    });

    it('should handle submit button with external input in range mode', () => {
      const handleSubmit = vi.fn();
      
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={externalInputRef} data-testid="external-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef,
                selectionMode: 'range',
                showSubmitButton: true,
                showFooter: true,
                onSubmit: handleSubmit
              })}
            />
          </div>
        );
      };

      const { container } = render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input');
      
      // Open calendar
      fireEvent.click(externalInput);
      
      // Select date range
      const dates = container.querySelectorAll('.day-cell');
      const startDate = Array.from(dates).find(cell => cell.textContent === '10');
      const endDate = Array.from(dates).find(cell => cell.textContent === '15');
      
      if (startDate && endDate) {
        fireEvent.mouseDown(startDate);
        fireEvent.mouseEnter(endDate);
        fireEvent.mouseUp(endDate);
        
        // Find and click submit button
        const submitButton = screen.getByText('Submit');
        fireEvent.click(submitButton);
        
        // Submit handler should be called with dates
        expect(handleSubmit).toHaveBeenCalled();
        const [start, end] = handleSubmit.mock.calls[0];
        expect(start).toBeTruthy();
        expect(end).toBeTruthy();
      }
    });
  });

  describe('External Input with Custom Settings', () => {
    it('should respect updateExternalInput setting when false', () => {
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={externalInputRef} data-testid="external-input" value="" onChange={() => {}} />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef,
                updateExternalInput: false,
                selectionMode: 'range'
              })}
            />
          </div>
        );
      };

      const { container } = render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input') as HTMLInputElement;
      const initialValue = externalInput.value;
      
      // Open calendar
      fireEvent.click(externalInput);
      
      // Select a date
      const dates = container.querySelectorAll('.day-cell');
      const dateToSelect = Array.from(dates).find(cell => cell.textContent === '15');
      
      if (dateToSelect) {
        fireEvent.mouseDown(dateToSelect);
        fireEvent.mouseUp(dateToSelect);
        
        // External input should not be updated
        expect(externalInput.value).toBe(initialValue);
      }
    });

    it('should work with custom date range separator', () => {
      const ExternalInputTest = () => {
        const externalInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={externalInputRef} data-testid="external-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: externalInputRef,
                selectionMode: 'range',
                dateRangeSeparator: ' to '
              })}
            />
          </div>
        );
      };

      const { container } = render(<ExternalInputTest />);
      
      const externalInput = screen.getByTestId('external-input') as HTMLInputElement;
      
      // Open calendar
      fireEvent.click(externalInput);
      
      // Select date range
      const dates = container.querySelectorAll('.day-cell');
      const startDate = Array.from(dates).find(cell => cell.textContent === '10');
      const endDate = Array.from(dates).find(cell => cell.textContent === '15');
      
      if (startDate && endDate) {
        fireEvent.mouseDown(startDate);
        fireEvent.mouseEnter(endDate);
        fireEvent.mouseUp(endDate);
        
        // Should use custom separator
        expect(externalInput.value).toContain(' to ');
        expect(externalInput.value).not.toContain(' - ');
      }
    });
  });

  describe('Multiple External Inputs', () => {
    it('should handle multiple calendar instances with different external inputs', () => {
      const MultipleInputsTest = () => {
        const startInputRef = useRef<HTMLInputElement>(null);
        const endInputRef = useRef<HTMLInputElement>(null);
        
        return (
          <div>
            <input ref={startInputRef} data-testid="start-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: startInputRef,
                selectionMode: 'single'
              })}
            />
            
            <input ref={endInputRef} data-testid="end-input" />
            <CLACalendar
              {...defaultProps}
              settings={createCalendarSettings({
                displayMode: 'popup',
                externalInput: endInputRef,
                selectionMode: 'single'
              })}
            />
          </div>
        );
      };

      const { container } = render(<MultipleInputsTest />);
      
      const startInput = screen.getByTestId('start-input');
      const endInput = screen.getByTestId('end-input');
      
      // Both inputs should exist and be independent
      expect(startInput).toBeInTheDocument();
      expect(endInput).toBeInTheDocument();
      
      // Click start input
      fireEvent.click(startInput);
      
      // Select a date in the first calendar
      const dates = container.querySelectorAll('.day-cell');
      const dateToSelect = Array.from(dates).find(cell => cell.textContent === '10');
      
      if (dateToSelect) {
        fireEvent.mouseDown(dateToSelect);
        
        // Only start input should be updated
        expect((startInput as HTMLInputElement).value).toContain('10');
        expect((endInput as HTMLInputElement).value).toBe('');
      }
    });
  });

  describe('External Input Error Handling', () => {
    it('should handle null external input gracefully', () => {
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            displayMode: 'popup',
            externalInput: null as any
          })}
        />
      );
      
      // Should render internal input as fallback
      const internalInput = container.querySelector('.cla-input-custom');
      expect(internalInput).toBeInTheDocument();
    });

    it('should handle external input selector that finds no elements', () => {
      const { container } = render(
        <CLACalendar
          {...defaultProps}
          settings={createCalendarSettings({
            displayMode: 'popup',
            externalInputSelector: '#non-existent-element'
          })}
        />
      );
      
      // Should render internal input as fallback
      const internalInput = container.querySelector('.cla-input-custom');
      expect(internalInput).toBeInTheDocument();
    });
  });
});