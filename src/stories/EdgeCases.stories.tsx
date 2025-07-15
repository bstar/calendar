import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from '../components/CLACalendar';
import { calendarArgTypes } from './shared/storyControls';
import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';

const meta: Meta<typeof CLACalendar> = {
  title: 'Edge Cases/Configuration Stress Tests/Stories',
  component: CLACalendar,
  argTypes: calendarArgTypes,
  parameters: {
    docs: {
      description: {
        component: 'Testing edge cases and problematic configurations to ensure the calendar handles them gracefully.'
      },
      source: {
        type: 'dynamic'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NegativeVisibleMonths: Story = {
  name: 'Negative Visible Months',
  render: () => (
    <CalendarStoryWrapper 
      args={{
        displayMode: 'embedded',
        visibleMonths: -5,  // THIS IS THE KEY CONFIG FOR THIS TEST
        monthWidth: 500,
        selectionMode: 'range',
        position: 'bottom-left',
        useDynamicPosition: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: false,
        showTooltips: true,
        showLayersNavigation: false,
        showDateInputs: true,
        closeOnClickAway: true,
        startWeekOnSunday: false,
        primaryColor: '#0366d6',
        successColor: '#28a745',
        warningColor: '#f6c23e',
        dangerColor: '#dc3545',
        timezone: 'UTC',
        dateRangeSeparator: ' - ',
        baseFontSize: '1rem'
      }}
      title="Negative Visible Months"
      description="Testing with visibleMonths: -5 (should clamp to valid range)"
    />
  )
};

export const ExcessiveVisibleMonths: Story = {
  name: 'Excessive Visible Months (100)',
  render: () => (
    <CalendarStoryWrapper 
      args={{
        displayMode: 'embedded',
        visibleMonths: 100,  // THIS IS THE KEY CONFIG FOR THIS TEST
        monthWidth: 500,
        selectionMode: 'range',
        position: 'bottom-left',
        useDynamicPosition: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: false,
        showTooltips: true,
        showLayersNavigation: false,
        showDateInputs: true,
        closeOnClickAway: true,
        startWeekOnSunday: false,
        primaryColor: '#0366d6',
        successColor: '#28a745',
        warningColor: '#f6c23e',
        dangerColor: '#dc3545',
        timezone: 'UTC',
        dateRangeSeparator: ' - ',
        baseFontSize: '1rem'
      }}
      title="Excessive Visible Months"
      description="Testing with visibleMonths: 100"
    />
  )
};

export const ZeroVisibleMonths: Story = {
  name: 'Zero Visible Months',
  render: () => (
    <CalendarStoryWrapper 
      args={{
        displayMode: 'embedded',
        visibleMonths: 0,  // THIS IS THE KEY CONFIG FOR THIS TEST
        monthWidth: 500,
        selectionMode: 'range',
        position: 'bottom-left',
        useDynamicPosition: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: false,
        showTooltips: true,
        showLayersNavigation: false,
        showDateInputs: true,
        closeOnClickAway: true,
        startWeekOnSunday: false,
        primaryColor: '#0366d6',
        successColor: '#28a745',
        warningColor: '#f6c23e',
        dangerColor: '#dc3545',
        timezone: 'UTC',
        dateRangeSeparator: ' - ',
        baseFontSize: '1rem'
      }}
      title="Zero Visible Months"
      description="Testing with visibleMonths: 0"
    />
  )
};

export const InvalidDateRange: Story = {
  name: 'Invalid Date Range (End Before Start)',
  render: () => (
    <CalendarStoryWrapper 
      args={{
        displayMode: 'embedded',
        visibleMonths: 2,
        monthWidth: 500,
        selectionMode: 'range',
        position: 'bottom-left',
        useDynamicPosition: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: false,
        showTooltips: true,
        showLayersNavigation: false,
        showDateInputs: true,
        closeOnClickAway: true,
        startWeekOnSunday: false,
        primaryColor: '#0366d6',
        successColor: '#28a745',
        warningColor: '#f6c23e',
        dangerColor: '#dc3545',
        timezone: 'UTC',
        dateRangeSeparator: ' - ',
        baseFontSize: '1rem',
        defaultRange: {  // THIS IS THE KEY CONFIG FOR THIS TEST
          start: '2025-12-31',
          end: '2025-01-01'
        }
      }}
      title="Invalid Date Range"
      description="End date is before start date"
    />
  )
};

export const MalformedDates: Story = {
  name: 'Malformed Date Strings',
  render: () => (
    <CalendarStoryWrapper 
      args={{
        displayMode: 'embedded',
        visibleMonths: 2,
        monthWidth: 500,
        selectionMode: 'range',
        position: 'bottom-left',
        useDynamicPosition: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: false,
        showTooltips: true,
        showLayersNavigation: false,
        showDateInputs: true,
        closeOnClickAway: true,
        startWeekOnSunday: false,
        primaryColor: '#0366d6',
        successColor: '#28a745',
        warningColor: '#f6c23e',
        dangerColor: '#dc3545',
        timezone: 'UTC',
        dateRangeSeparator: ' - ',
        baseFontSize: '1rem',
        defaultRange: {  // THIS IS THE KEY CONFIG FOR THIS TEST
          start: 'not-a-date',
          end: '2025-13-45'
        }
      }}
      title="Malformed Date Strings"
      description="Testing with invalid date formats"
    />
  )
};

export const ConflictingRestrictions: Story = {
  name: 'Conflicting Restrictions',
  render: () => {
    const restrictionConfig = {
      restrictions: [
        {
          type: 'boundary' as const,
          enabled: true,
          minDate: '2025-06-01',
          maxDate: '2025-06-30'
        },
        {
          type: 'daterange' as const,
          enabled: true,
          startDate: '2025-06-01',
          endDate: '2025-06-30'
        }
      ]
    };

    return (
      <CalendarStoryWrapper 
        args={{
          displayMode: 'embedded',
          visibleMonths: 2,
          monthWidth: 500,
          selectionMode: 'range',
          position: 'bottom-left',
          useDynamicPosition: true,
          showHeader: true,
          showFooter: true,
          showSubmitButton: false,
          showTooltips: true,
          showLayersNavigation: false,
          showDateInputs: true,
          closeOnClickAway: true,
          startWeekOnSunday: false,
          primaryColor: '#0366d6',
          successColor: '#28a745',
          warningColor: '#f6c23e',
          dangerColor: '#dc3545',
          timezone: 'UTC',
          dateRangeSeparator: ' - ',
          baseFontSize: '1rem'
        }}
        title="Conflicting Restrictions"
        description="Boundary allows June 2025, but daterange blocks the entire month"
        restrictionConfigFactory={() => restrictionConfig}
      />
    );
  }
};

export const NegativeMonthWidth: Story = {
  name: 'Negative Month Width',
  render: () => (
    <CalendarStoryWrapper 
      args={{
        displayMode: 'embedded',
        visibleMonths: 2,
        monthWidth: -500,  // THIS IS THE KEY CONFIG FOR THIS TEST
        selectionMode: 'range',
        position: 'bottom-left',
        useDynamicPosition: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: false,
        showTooltips: true,
        showLayersNavigation: false,
        showDateInputs: true,
        closeOnClickAway: true,
        startWeekOnSunday: false,
        primaryColor: '#0366d6',
        successColor: '#28a745',
        warningColor: '#f6c23e',
        dangerColor: '#dc3545',
        timezone: 'UTC',
        dateRangeSeparator: ' - ',
        baseFontSize: '1rem'
      }}
      title="Negative Month Width"
      description="Testing with monthWidth: -500"
    />
  )
};

export const ExtremelySmallMonthWidth: Story = {
  name: 'Extremely Small Month Width',
  render: () => (
    <CalendarStoryWrapper 
      args={{
        displayMode: 'embedded',
        visibleMonths: 2,
        monthWidth: 10,  // THIS IS THE KEY CONFIG FOR THIS TEST
        selectionMode: 'range',
        position: 'bottom-left',
        useDynamicPosition: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: false,
        showTooltips: true,
        showLayersNavigation: false,
        showDateInputs: true,
        closeOnClickAway: true,
        startWeekOnSunday: false,
        primaryColor: '#0366d6',
        successColor: '#28a745',
        warningColor: '#f6c23e',
        dangerColor: '#dc3545',
        timezone: 'UTC',
        dateRangeSeparator: ' - ',
        baseFontSize: '1rem'
      }}
      title="Extremely Small Month Width"
      description="Testing with monthWidth: 10px"
    />
  )
};

export const InvalidTimezone: Story = {
  name: 'Invalid Timezone',
  render: () => (
    <CalendarStoryWrapper 
      args={{
        displayMode: 'embedded',
        visibleMonths: 2,
        monthWidth: 500,
        selectionMode: 'range',
        position: 'bottom-left',
        useDynamicPosition: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: false,
        showTooltips: true,
        showLayersNavigation: false,
        showDateInputs: true,
        closeOnClickAway: true,
        startWeekOnSunday: false,
        primaryColor: '#0366d6',
        successColor: '#28a745',
        warningColor: '#f6c23e',
        dangerColor: '#dc3545',
        timezone: 'Not/A/Real/Timezone',  // THIS IS THE KEY CONFIG FOR THIS TEST
        dateRangeSeparator: ' - ',
        baseFontSize: '1rem'
      }}
      title="Invalid Timezone"
      description="Testing with an invalid timezone string"
    />
  )
};

export const EmptyLayersWithNavigation: Story = {
  name: 'Empty Layers with Navigation Enabled',
  render: () => (
    <CalendarStoryWrapper 
      args={{
        displayMode: 'embedded',
        visibleMonths: 2,
        monthWidth: 500,
        selectionMode: 'range',
        position: 'bottom-left',
        useDynamicPosition: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: false,
        showTooltips: true,
        showLayersNavigation: true,  // THIS IS THE KEY CONFIG FOR THIS TEST
        showDateInputs: true,
        closeOnClickAway: true,
        startWeekOnSunday: false,
        primaryColor: '#0366d6',
        successColor: '#28a745',
        warningColor: '#f6c23e',
        dangerColor: '#dc3545',
        timezone: 'UTC',
        dateRangeSeparator: ' - ',
        baseFontSize: '1rem',
        layers: []  // THIS IS THE KEY CONFIG FOR THIS TEST
      }}
      title="Empty Layers with Navigation"
      description="Layer navigation enabled but no layers provided"
    />
  )
};

export const DuplicateLayerNames: Story = {
  name: 'Duplicate Layer Names',
  render: () => (
    <CalendarStoryWrapper 
      args={{
        displayMode: 'embedded',
        visibleMonths: 2,
        monthWidth: 500,
        selectionMode: 'range',
        position: 'bottom-left',
        useDynamicPosition: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: false,
        showTooltips: true,
        showLayersNavigation: true,
        showDateInputs: true,
        closeOnClickAway: true,
        startWeekOnSunday: false,
        primaryColor: '#0366d6',
        successColor: '#28a745',
        warningColor: '#f6c23e',
        dangerColor: '#dc3545',
        timezone: 'UTC',
        dateRangeSeparator: ' - ',
        baseFontSize: '1rem',
        layers: [  // THIS IS THE KEY CONFIG FOR THIS TEST
          {
            name: 'duplicate',
            title: 'First Layer',
            description: 'This is the first layer',
            visible: true,
            enabled: true
          },
          {
            name: 'duplicate',
            title: 'Second Layer',
            description: 'This has the same name as the first',
            visible: true,
            enabled: true
          }
        ]
      }}
      title="Duplicate Layer Names"
      description="Multiple layers with the same name identifier"
    />
  )
};

export const InvalidColorValues: Story = {
  name: 'Invalid Color Values',
  render: () => (
    <CalendarStoryWrapper 
      args={{
        displayMode: 'embedded',
        visibleMonths: 2,
        monthWidth: 500,
        selectionMode: 'range',
        position: 'bottom-left',
        useDynamicPosition: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: false,
        showTooltips: true,
        showLayersNavigation: false,
        showDateInputs: true,
        closeOnClickAway: true,
        startWeekOnSunday: false,
        primaryColor: '#0366d6',
        successColor: '#28a745',
        warningColor: '#f6c23e',
        dangerColor: '#dc3545',
        timezone: 'UTC',
        dateRangeSeparator: ' - ',
        baseFontSize: '1rem',
        colors: {  // THIS IS THE KEY CONFIG FOR THIS TEST
          primary: 'not-a-color',
          success: '#GGGGGG',
          warning: 'rgb(999, 999, 999)',
          danger: '12345'
        }
      }}
      title="Invalid Color Values"
      description="Testing with malformed color values"
    />
  )
};

export const CircularDateFormatter: Story = {
  name: 'Throwing Date Formatter',
  render: () => (
    <CalendarStoryWrapper 
      args={{
        displayMode: 'embedded',
        visibleMonths: 2,
        monthWidth: 500,
        selectionMode: 'range',
        position: 'bottom-left',
        useDynamicPosition: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: false,
        showTooltips: true,
        showLayersNavigation: false,
        showDateInputs: true,
        closeOnClickAway: true,
        startWeekOnSunday: false,
        primaryColor: '#0366d6',
        successColor: '#28a745',
        warningColor: '#f6c23e',
        dangerColor: '#dc3545',
        timezone: 'UTC',
        dateRangeSeparator: ' - ',
        baseFontSize: '1rem',
        dateFormatter: (date: Date) => {  // THIS IS THE KEY CONFIG FOR THIS TEST
          throw new Error('Date formatter error!');
        }
      }}
      title="Throwing Date Formatter"
      description="Date formatter function that throws an error"
    />
  )
};

export const NullAndUndefinedValues: Story = {
  name: 'Null and Undefined Values',
  render: () => (
    <CalendarStoryWrapper 
      args={{
        displayMode: 'embedded',
        visibleMonths: 2,
        monthWidth: 500,
        selectionMode: 'range',
        position: 'bottom-left',
        useDynamicPosition: true,
        showHeader: true,
        showFooter: true,
        showSubmitButton: false,
        showTooltips: true,
        showLayersNavigation: false,
        showDateInputs: true,
        closeOnClickAway: true,
        startWeekOnSunday: false,
        primaryColor: '#0366d6',
        successColor: '#28a745',
        warningColor: '#f6c23e',
        dangerColor: '#dc3545',
        timezone: 'UTC',
        dateRangeSeparator: ' - ',
        baseFontSize: '1rem',
        defaultRange: null,  // THIS IS A KEY CONFIG FOR THIS TEST
        dateFormatter: undefined,  // THIS IS A KEY CONFIG FOR THIS TEST
        colors: null  // THIS IS A KEY CONFIG FOR THIS TEST
      }}
      title="Null and Undefined Values"
      description="Testing with null and undefined for various properties"
    />
  )
};

export const ExtremeFontSize: Story = {
  name: 'Extreme Font Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <CalendarStoryWrapper 
        args={{
          displayMode: 'embedded',
          visibleMonths: 2,
          monthWidth: 500,
          selectionMode: 'range',
          position: 'bottom-left',
          useDynamicPosition: true,
          showHeader: true,
          showFooter: true,
          showSubmitButton: false,
          showTooltips: true,
          showLayersNavigation: false,
          showDateInputs: true,
          closeOnClickAway: true,
          startWeekOnSunday: false,
          primaryColor: '#0366d6',
          successColor: '#28a745',
          warningColor: '#f6c23e',
          dangerColor: '#dc3545',
          timezone: 'UTC',
          dateRangeSeparator: ' - ',
          baseFontSize: '0.1rem'  // THIS IS THE KEY CONFIG FOR THIS TEST
        }}
        title="Tiny Font Size"
        description="baseFontSize: 0.1rem"
      />
      <CalendarStoryWrapper 
        args={{
          displayMode: 'embedded',
          visibleMonths: 2,
          monthWidth: 500,
          selectionMode: 'range',
          position: 'bottom-left',
          useDynamicPosition: true,
          showHeader: true,
          showFooter: true,
          showSubmitButton: false,
          showTooltips: true,
          showLayersNavigation: false,
          showDateInputs: true,
          closeOnClickAway: true,
          startWeekOnSunday: false,
          primaryColor: '#0366d6',
          successColor: '#28a745',
          warningColor: '#f6c23e',
          dangerColor: '#dc3545',
          timezone: 'UTC',
          dateRangeSeparator: ' - ',
          baseFontSize: '5rem'  // THIS IS THE KEY CONFIG FOR THIS TEST
        }}
        title="Huge Font Size"
        description="baseFontSize: 5rem"
      />
    </div>
  )
};