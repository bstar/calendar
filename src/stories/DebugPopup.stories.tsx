import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from '../components/CLACalendar';
import { getDefaultSettings } from '../components/CLACalendar.config';

const meta = {
  title: 'Debug/Popup Positioning',
  component: CLACalendar,
} satisfies Meta<typeof CLACalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DebugPositioning: Story = {
  name: 'Debug Popup Position',
  render: () => {
    return (
      <div style={{ padding: '200px', border: '2px solid red' }}>
        <h3>Debug Popup Positioning</h3>
        <p>The calendar should appear directly below this input:</p>
        
        <div style={{ border: '2px solid blue', padding: '20px', display: 'inline-block' }}>
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
        
        <div style={{ marginTop: '50px' }}>
          <p>Expected: Calendar popup should appear directly below the input field (aligned left)</p>
          <p>Check console for positioning debug info</p>
        </div>
      </div>
    );
  },
};