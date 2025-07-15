import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from '../components/CLACalendar';
import { getDefaultSettings } from '../components/CLACalendar.config';

const meta = {
  title: 'Getting Started',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic embedded calendar example
export const BasicCalendar: Story = {
  name: 'Basic Calendar',
  render: () => {
    const [selectedDates, setSelectedDates] = useState<{start: string, end: string} | null>(null);
    
    return (
      <div>
        <h3>Basic Calendar</h3>
        <p>A simple embedded calendar with date range selection.</p>
        
        {selectedDates && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#e8f5e9', 
            borderRadius: '4px',
            marginBottom: '20px' 
          }}>
            <strong>Selected:</strong> {selectedDates.start} to {selectedDates.end}
          </div>
        )}
        
        <CLACalendar 
          settings={getDefaultSettings()}
          onSubmit={(start, end) => {
            setSelectedDates({ start, end });
          }}
          _onSettingsChange={() => {}}
        />
        
        <div style={{ marginTop: '30px' }}>
          <h4>Code:</h4>
          <pre style={{ 
            backgroundColor: '#f6f8fa', 
            padding: '16px', 
            borderRadius: '6px',
            overflow: 'auto'
          }}>
            <code>{`import { CLACalendar, getDefaultSettings } from 'cla-calendar';

function MyCalendar() {
  const [selectedDates, setSelectedDates] = useState(null);
  
  return (
    <CLACalendar 
      settings={getDefaultSettings()}
      onSubmit={(start, end) => {
        setSelectedDates({ start, end });
      }}
      _onSettingsChange={() => {}}
    />
  );
}`}</code>
          </pre>
        </div>
      </div>
    );
  },
};

// Popup calendar example
export const PopupCalendar: Story = {
  name: 'Popup Calendar',
  render: () => {
    const [date, setDate] = useState<string>('');
    
    return (
      <div style={{ padding: '50px' }}>
        <h3>Popup Calendar</h3>
        <p>Click the input below to open the calendar:</p>
        
        <CLACalendar 
          settings={{
            ...getDefaultSettings(),
            displayMode: 'popup',
            selectionMode: 'single',
            visibleMonths: 1,
          }}
          onSubmit={(selectedDate) => {
            setDate(selectedDate);
          }}
          _onSettingsChange={() => {}}
        />
        
        {date && (
          <p style={{ marginTop: '10px', color: '#666' }}>
            You selected: {date}
          </p>
        )}
        
        <div style={{ marginTop: '30px' }}>
          <h4>Code:</h4>
          <pre style={{ 
            backgroundColor: '#f6f8fa', 
            padding: '16px', 
            borderRadius: '6px',
            overflow: 'auto'
          }}>
            <code>{`<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'popup',
    selectionMode: 'single',
    visibleMonths: 1,
  }}
  onSubmit={(selectedDate) => {
    setDate(selectedDate);
  }}
  _onSettingsChange={() => {}}
/>`}</code>
          </pre>
        </div>
      </div>
    );
  },
};

// Simple sandbox for experimentation
export const SimpleSandbox: Story = {
  name: 'Calendar Sandbox',
  render: () => {
    return (
      <div>
        <h3>Live Calendar Sandbox</h3>
        <p>Experiment with the calendar - select some dates!</p>
        
        <div style={{ 
          border: '2px dashed #e1e4e8', 
          borderRadius: '8px', 
          padding: '30px',
          marginTop: '20px',
          backgroundColor: '#fafbfc'
        }}>
          <CLACalendar 
            settings={{
              ...getDefaultSettings(),
              displayMode: 'embedded',
              selectionMode: 'range',
              visibleMonths: 2,
            }}
            _onSettingsChange={() => {}}
          />
        </div>
      </div>
    );
  },
};