import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from '../../components/CLACalendar';
import { calendarArgTypes, defaultArgs } from './storyControls';
import { CalendarStoryWrapper } from './CalendarStoryWrapper';
import type { CalendarSettings } from '../../components/CLACalendar.config';

/**
 * IMPORTANT: When using these helpers, NEVER spread defaultArgs in your story args.
 * Only specify the properties you want to override from the defaults.
 * 
 * WRONG: args: { ...defaultArgs, visibleMonths: 3 }
 * RIGHT: args: { visibleMonths: 3 }
 * 
 * Spreading defaultArgs breaks Storybook controls because it creates a new
 * object that overrides the meta's args, preventing controls from working.
 */

/**
 * Standard meta configuration for all calendar stories.
 * This ensures consistency across all story files.
 */
export const createCalendarMeta = (config: {
  title: string;
  description?: string;
}) => {
  const meta: Meta<typeof CLACalendar> = {
    title: config.title,
    component: CLACalendar,
    argTypes: calendarArgTypes,
    args: defaultArgs,
    parameters: {
      docs: {
        description: {
          component: config.description
        },
        source: {
          type: 'dynamic'
        }
      }
    }
  };
  return meta;
};

/**
 * Standard story configuration that ensures args are properly passed.
 * Use this for all stories to maintain consistency.
 */
export const createCalendarStory = (config: {
  name: string;
  description: string;
  args?: Partial<CalendarSettings>;
  settingsOverrides?: Partial<CalendarSettings>;
  containerStyle?: React.CSSProperties;
  showSelectedDate?: boolean;
}): StoryObj<typeof CLACalendar> => ({
  name: config.name,
  render: (args) => (
    <CalendarStoryWrapper
      args={args}  // Pass args directly, no merging here
      title={config.name}
      description={config.description}
      settingsOverrides={config.settingsOverrides}
      containerStyle={config.containerStyle}
      showSelectedDate={config.showSelectedDate}
    />
  ),
  args: config.args  // Only specify overrides, never spread defaultArgs
});

/**
 * Create a story with custom render logic while still ensuring args are passed.
 * Use this for complex stories that need additional setup.
 */
export const createCustomCalendarStory = (config: {
  name: string;
  render: (args: Partial<CalendarSettings>) => React.ReactElement;
  args?: Partial<CalendarSettings>;
}): StoryObj<typeof CLACalendar> => ({
  name: config.name,
  render: (args) => config.render(args),
  args: config.args
});

/**
 * Type-safe story export helper
 */
export type CalendarStory = StoryObj<Meta<typeof CLACalendar>>;