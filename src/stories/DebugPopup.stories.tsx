import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from '../components/CLACalendar';
import { calendarArgTypes, defaultArgs } from './shared/storyControls';
import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';

const meta = {
  title: 'Debug/Popup Positioning',
  component: CLACalendar,
  argTypes: calendarArgTypes,
  args: defaultArgs,
  parameters: {
    controls: { expanded: true }
  }
} satisfies Meta<typeof CLACalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DebugPositioning: Story = {
  name: 'Debug Popup Position',
  args: {
    ...defaultArgs,
    displayMode: 'popup',
    selectionMode: 'single',
    visibleMonths: 1,
    position: 'bottom-left',
    useDynamicPosition: false
  },
  render: (args) => (
    <div style={{ padding: '200px', border: '2px solid red' }}>
      <h3>Debug Popup Positioning</h3>
      <p>The calendar should appear directly below this input:</p>
      
      <div style={{ border: '2px solid blue', padding: '20px', display: 'inline-block' }}>
        <CalendarStoryWrapper 
          args={args}
          showSelectedDate={false}
        />
      </div>
      
      <div style={{ marginTop: '50px' }}>
        <p>Expected: Calendar popup should appear directly below the input field (aligned left)</p>
        <p>Use the controls to test different positioning options</p>
      </div>
    </div>
  ),
};