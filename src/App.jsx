import { useState } from 'react';
import './bootstrap.min.css'

import DateRangePicker from './components/DateRangePicker';

function App() {
  const [settings, setSettings] = useState({
    visibleMonths: 2,            // default: 2
    showMonthHeadings: true,     // overridden from default: false
    selectionMode: 'range',      // default: 'range'
    showTooltips: false,         // overridden from default: true
    showHeader: true,            // default: true
    closeOnClickAway: false,      // default: true
    showSubmitButton: false,     // default: false
    showFooter: true,            // default: true
    singleMonthWidth: 500,       // default: 500
    enableOutOfBoundsScroll: true // default: true
  });

  const handleChange = (prop) => (event) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.type === 'number'
        ? parseInt(event.target.value)
        : event.target.value;

    setSettings(prev => ({ ...prev, [prop]: value }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        marginBottom: '20px', 
        padding: '20px',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        backgroundColor: '#f8f9fa'
      }}>
        <h4>DateRangePicker Controls</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Visible Months (1-6):
              <input
                type="number"
                min="1"
                max="6"
                value={settings.visibleMonths}
                onChange={handleChange('visibleMonths')}
                style={{ 
                  marginLeft: '8px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}
              />
            </label>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Selection Mode:
              <select
                value={settings.selectionMode}
                onChange={handleChange('selectionMode')}
                style={{ 
                  marginLeft: '8px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}
              >
                <option value="single">Single</option>
                <option value="range">Range</option>
              </select>
            </label>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.showMonthHeadings}
                onChange={handleChange('showMonthHeadings')}
              />
              Show Month Headings
            </label>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.showTooltips}
                onChange={handleChange('showTooltips')}
              />
              Show Tooltips
            </label>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.showHeader}
                onChange={handleChange('showHeader')}
              />
              Show Header
            </label>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.closeOnClickAway}
                onChange={handleChange('closeOnClickAway')}
              />
              Close on Click Away
            </label>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.showSubmitButton}
                onChange={handleChange('showSubmitButton')}
              />
              Show Submit Button
            </label>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.showFooter}
                onChange={handleChange('showFooter')}
              />
              Show Footer
            </label>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Single Month Width:
              <input
                type="number"
                min="300"
                max="800"
                value={settings.singleMonthWidth}
                onChange={handleChange('singleMonthWidth')}
                style={{ 
                  marginLeft: '8px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}
              />
            </label>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.enableOutOfBoundsScroll}
                onChange={handleChange('enableOutOfBoundsScroll')}
              />
              Enable Out of Bounds Scroll
            </label>
          </div>
        </div>
      </div>

      <DateRangePicker 
        visibleMonths={settings.visibleMonths}
        showMonthHeadings={settings.showMonthHeadings}
        selectionMode={settings.selectionMode}
        showTooltips={settings.showTooltips}
        showHeader={settings.showHeader}
        closeOnClickAway={settings.closeOnClickAway}
        showSubmitButton={settings.showSubmitButton}
        showFooter={settings.showFooter}
        singleMonthWidth={settings.singleMonthWidth}
        enableOutOfBoundsScroll={settings.enableOutOfBoundsScroll}
      />
    </div>
  );
}

export default App;