import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from '../components/CLACalendar';
import { createCalendarSettings } from '../components/CLACalendar.config';
import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';
import { format } from '../utils/DateUtils';

const meta = {
  title: 'Features/Submission Formatter',
  component: CLACalendar,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CLACalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Different Visual and Submission Formats
export const DifferentFormats: Story = {
  render: () => {
    const SubmissionFormatterDemo = () => {
      const [submittedData, setSubmittedData] = useState<{
        display: string;
        submission: { start: string | null; end: string | null };
      } | null>(null);
      
      const dateFormatter = (date: Date) => format(date, 'MMM dd, yyyy'); // Visual: "Jan 15, 2025"
      const submissionFormatter = (date: Date) => format(date, 'MM/dd/yyyy'); // Submit: "01/15/2025"
      
      const handleSubmit = (start: string | null, end: string | null) => {
        const input = document.querySelector('.cla-input-custom') as HTMLInputElement;
        setSubmittedData({
          display: input?.value || '',
          submission: { start, end }
        });
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h2>Different Visual and Submission Formats</h2>
          <p>
            Visual format: <code>MMM dd, yyyy</code> (e.g., "Jan 15, 2025")<br />
            Submission format: <code>MM/dd/yyyy</code> (e.g., "01/15/2025")
          </p>
          
          <CLACalendar
            settings={createCalendarSettings({
              displayMode: 'popup',
              selectionMode: 'range',
              dateFormatter,
              submissionFormatter,
              onSubmit: handleSubmit,
              showSubmitButton: true,
              showFooter: true,
              defaultRange: {
                start: '2025-01-15',
                end: '2025-01-20'
              }
            })}
          />
          
          {submittedData && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              fontFamily: 'monospace'
            }}>
              <h3>Submitted Data:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
                <strong>Visual Display:</strong>
                <span>{submittedData.display}</span>
                
                <strong>Submitted Start:</strong>
                <span style={{ color: '#0066cc' }}>{submittedData.submission.start}</span>
                
                <strong>Submitted End:</strong>
                <span style={{ color: '#0066cc' }}>{submittedData.submission.end}</span>
              </div>
            </div>
          )}
        </div>
      );
    };
    
    return <SubmissionFormatterDemo />;
  }
};

// Timestamp Submission
export const TimestampSubmission: Story = {
  render: () => {
    const TimestampDemo = () => {
      const [submittedData, setSubmittedData] = useState<{
        display: string;
        timestamps: { start: string | null; end: string | null };
        parsed: { start: string | null; end: string | null };
      } | null>(null);
      
      const dateFormatter = (date: Date) => format(date, 'dd MMM yyyy');
      const submissionFormatter = (date: Date) => date.getTime().toString();
      
      const handleSubmit = (start: string | null, end: string | null) => {
        const input = document.querySelector('.cla-input-custom') as HTMLInputElement;
        setSubmittedData({
          display: input?.value || '',
          timestamps: { start, end },
          parsed: {
            start: start ? new Date(parseInt(start)).toLocaleDateString() : null,
            end: end ? new Date(parseInt(end)).toLocaleDateString() : null
          }
        });
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h2>Timestamp Submission Format</h2>
          <p>
            Visual format: <code>dd MMM yyyy</code> (e.g., "15 Jan 2025")<br />
            Submission format: Unix timestamp in milliseconds
          </p>
          
          <CLACalendar
            settings={createCalendarSettings({
              displayMode: 'popup',
              selectionMode: 'range',
              dateFormatter,
              submissionFormatter,
              onSubmit: handleSubmit,
              showSubmitButton: true,
              showFooter: true
            })}
          />
          
          {submittedData && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              fontFamily: 'monospace'
            }}>
              <h3>Submitted Data:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '10px' }}>
                <strong>Visual Display:</strong>
                <span>{submittedData.display}</span>
                
                <strong>Start Timestamp:</strong>
                <span style={{ color: '#0066cc' }}>{submittedData.timestamps.start}</span>
                
                <strong>End Timestamp:</strong>
                <span style={{ color: '#0066cc' }}>{submittedData.timestamps.end}</span>
                
                <strong>Parsed Start Date:</strong>
                <span style={{ color: '#008800' }}>{submittedData.parsed.start}</span>
                
                <strong>Parsed End Date:</strong>
                <span style={{ color: '#008800' }}>{submittedData.parsed.end}</span>
              </div>
            </div>
          )}
        </div>
      );
    };
    
    return <TimestampDemo />;
  }
};

// API-Specific Format
export const APISpecificFormat: Story = {
  render: () => {
    const APIFormatDemo = () => {
      const [submittedData, setSubmittedData] = useState<{
        display: string;
        apiFormat: { checkIn: string | null; checkOut: string | null };
      } | null>(null);
      const [apiResponse, setApiResponse] = useState<string | null>(null);
      
      const dateFormatter = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = { 
          weekday: 'short', 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
      };
      
      // API requires ISO 8601 format with time set to noon
      const submissionFormatter = (date: Date) => {
        const apiDate = new Date(date);
        apiDate.setHours(12, 0, 0, 0);
        return apiDate.toISOString();
      };
      
      const handleSubmit = (start: string | null, end: string | null) => {
        const input = document.querySelector('.cla-input-custom') as HTMLInputElement;
        setSubmittedData({
          display: input?.value || '',
          apiFormat: { checkIn: start, checkOut: end }
        });
        
        // Simulate API call
        setTimeout(() => {
          setApiResponse(`✅ Booking confirmed for check-in: ${start?.split('T')[0]}, check-out: ${end?.split('T')[0]}`);
        }, 500);
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h2>API-Specific Format (Hotel Booking)</h2>
          <p>
            Visual format: Localized date string<br />
            Submission format: ISO 8601 with time set to 12:00 PM (API requirement)
          </p>
          
          <CLACalendar
            settings={createCalendarSettings({
              displayMode: 'popup',
              selectionMode: 'range',
              dateFormatter,
              submissionFormatter,
              onSubmit: handleSubmit,
              showSubmitButton: true,
              showFooter: true
            })}
          />
          
          {submittedData && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              fontFamily: 'monospace'
            }}>
              <h3>API Request Payload:</h3>
              <pre style={{ 
                backgroundColor: '#333', 
                color: '#0f0', 
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto'
              }}>
{JSON.stringify({
  bookingRequest: {
    checkIn: submittedData.apiFormat.checkIn,
    checkOut: submittedData.apiFormat.checkOut,
    guests: 2,
    roomType: 'standard'
  }
}, null, 2)}
              </pre>
              
              {apiResponse && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#d4ffd4',
                  borderRadius: '4px',
                  color: '#006600'
                }}>
                  {apiResponse}
                </div>
              )}
            </div>
          )}
        </div>
      );
    };
    
    return <APIFormatDemo />;
  }
};

// Backward Compatibility (No submissionFormatter)
export const BackwardCompatibility: Story = {
  render: () => {
    const BackwardCompatDemo = () => {
      const [submittedData, setSubmittedData] = useState<{
        display: string;
        submission: { start: string | null; end: string | null };
      } | null>(null);
      
      const dateFormatter = (date: Date) => format(date, 'dd/MM/yyyy');
      
      const handleSubmit = (start: string | null, end: string | null) => {
        const input = document.querySelector('.cla-input-custom') as HTMLInputElement;
        setSubmittedData({
          display: input?.value || '',
          submission: { start, end }
        });
      };
      
      return (
        <div style={{ padding: '20px' }}>
          <h2>Backward Compatibility (Default Behavior)</h2>
          <p>
            Visual format: <code>dd/MM/yyyy</code> (e.g., "15/01/2025")<br />
            Submission format: <strong>ISO format (default)</strong> - No submissionFormatter provided
          </p>
          
          <CLACalendar
            settings={createCalendarSettings({
              displayMode: 'popup',
              selectionMode: 'range',
              dateFormatter,
              // Note: NO submissionFormatter - uses default ISO format
              onSubmit: handleSubmit,
              showSubmitButton: true,
              showFooter: true,
              defaultRange: {
                start: '2025-03-10',
                end: '2025-03-15'
              }
            })}
          />
          
          {submittedData && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              fontFamily: 'monospace'
            }}>
              <h3>Submitted Data (Default ISO Format):</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
                <strong>Visual Display:</strong>
                <span>{submittedData.display}</span>
                
                <strong>Submitted Start:</strong>
                <span style={{ color: '#0066cc' }}>{submittedData.submission.start}</span>
                
                <strong>Submitted End:</strong>
                <span style={{ color: '#0066cc' }}>{submittedData.submission.end}</span>
              </div>
              <div style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#fff3cd',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                ⚠️ Note: Without submissionFormatter, dates are submitted in ISO format (YYYY-MM-DD), maintaining backward compatibility.
              </div>
            </div>
          )}
        </div>
      );
    };
    
    return <BackwardCompatDemo />;
  }
};