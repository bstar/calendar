import React, { useState, useEffect, useRef } from 'react';
import { CLACalendar } from './CLACalendar';
import { getDefaultSettings } from './CLACalendar.config';

export const DebugPopup = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDebugInfo({
          input: {
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right,
            width: rect.width,
            height: rect.height
          },
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        });
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '50px' }}>
      <h3>Debug Popup Positioning</h3>
      
      <div ref={inputRef} style={{ display: 'inline-block' }}>
        <CLACalendar 
          settings={{
            ...getDefaultSettings(),
            displayMode: 'popup',
            selectionMode: 'single',
            visibleMonths: 1,
            position: 'bottom-left',
            useDynamicPosition: false
          }}
          _onSettingsChange={() => {}}
        />
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', fontFamily: 'monospace' }}>
        <h4>Debug Info:</h4>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>
    </div>
  );
};