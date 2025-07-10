import type { Meta, StoryObj } from '@storybook/react';
import { CLACalendar } from '../components/CLACalendar';
import { getDefaultSettings } from '../components/CLACalendar.config';

const meta = {
  title: 'Examples/Embedded Widgets',
  component: CLACalendar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Examples of embedding CLACalendar as a widget in different contexts.',
      },
    },
  },
} satisfies Meta<typeof CLACalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Year Round Calendar Display
export const YearRoundCalendar: Story = {
  name: 'Year Round Calendar Display',
  parameters: {
    layout: 'fullscreen',
  },
  render: () => {
    const yearSettings = {
      ...getDefaultSettings(),
      displayMode: 'embedded' as const,
      visibleMonths: 12,
      monthWidth: 280,
      showSubmitButton: false,
      showHeader: false,
      showFooter: false,
      showLayersNavigation: false,
      showDateInputs: false,
      selectionMode: 'single' as const,
      baseFontSize: '0.875rem',
      containerStyle: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '24px',
      },
      colors: {
        primary: '#6366f1',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      layers: [
        {
          name: 'holidays',
          title: 'Holidays',
          description: 'Public holidays and observances',
          visible: true,
          color: '#ef4444',
          data: {
            events: [
              // January
              { date: '2024-01-01', title: "New Year's Day", type: 'holiday', time: 'All day', description: 'Public Holiday', color: '#ef4444' },
              { date: '2024-01-15', title: 'MLK Day', type: 'holiday', time: 'All day', description: 'Federal Holiday', color: '#ef4444' },
              
              // February
              { date: '2024-02-14', title: "Valentine's Day", type: 'other', time: 'All day', description: 'Observance', color: '#ec4899' },
              { date: '2024-02-19', title: "Presidents' Day", type: 'holiday', time: 'All day', description: 'Federal Holiday', color: '#ef4444' },
              
              // March
              { date: '2024-03-17', title: "St. Patrick's Day", type: 'other', time: 'All day', description: 'Observance', color: '#10b981' },
              
              // April
              { date: '2024-04-01', title: "April Fool's Day", type: 'other', time: 'All day', description: 'Observance', color: '#f59e0b' },
              
              // May
              { date: '2024-05-27', title: 'Memorial Day', type: 'holiday', time: 'All day', description: 'Federal Holiday', color: '#ef4444' },
              
              // June
              { date: '2024-06-19', title: 'Juneteenth', type: 'holiday', time: 'All day', description: 'Federal Holiday', color: '#ef4444' },
              
              // July
              { date: '2024-07-04', title: 'Independence Day', type: 'holiday', time: 'All day', description: 'Federal Holiday', color: '#ef4444' },
              
              // September
              { date: '2024-09-02', title: 'Labor Day', type: 'holiday', time: 'All day', description: 'Federal Holiday', color: '#ef4444' },
              
              // October
              { date: '2024-10-14', title: 'Columbus Day', type: 'holiday', time: 'All day', description: 'Federal Holiday', color: '#ef4444' },
              { date: '2024-10-31', title: 'Halloween', type: 'other', time: 'All day', description: 'Observance', color: '#f97316' },
              
              // November
              { date: '2024-11-11', title: "Veterans Day", type: 'holiday', time: 'All day', description: 'Federal Holiday', color: '#ef4444' },
              { date: '2024-11-28', title: 'Thanksgiving', type: 'holiday', time: 'All day', description: 'Federal Holiday', color: '#ef4444' },
              
              // December
              { date: '2024-12-25', title: 'Christmas Day', type: 'holiday', time: 'All day', description: 'Federal Holiday', color: '#ef4444' },
              { date: '2024-12-31', title: "New Year's Eve", type: 'other', time: 'All day', description: 'Observance', color: '#6366f1' },
            ],
            background: [
              // Summer vacation period
              { startDate: '2024-06-15', endDate: '2024-08-31', color: '#fef3c7' },
              // Winter holiday period
              { startDate: '2024-12-20', endDate: '2024-12-31', color: '#dbeafe' },
            ],
          },
        },
      ],
    };

    return (
      <div style={{ padding: '40px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
            2024 Calendar Overview
          </h2>
          <p style={{ marginBottom: '32px', color: '#6b7280' }}>
            A full year view showing all holidays and special dates. Click any date to select it.
          </p>
          <CLACalendar 
            settings={yearSettings}
            _onSettingsChange={() => {}}
          />
          <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '8px' }}>Legend</h3>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>Federal Holidays</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#fef3c7', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>Summer Period</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#dbeafe', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>Winter Holidays</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Compact Widget
export const CompactWidget: Story = {
  name: 'Compact Calendar Widget',
  render: () => {
    const compactSettings = {
      ...getDefaultSettings(),
      displayMode: 'embedded' as const,
      visibleMonths: 1,
      monthWidth: 300,
      showSubmitButton: false,
      showHeader: false,
      showFooter: false,
      showLayersNavigation: false,
      showDateInputs: false,
      selectionMode: 'single' as const,
      baseFontSize: '0.875rem',
      containerStyle: {
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
      },
    };

    return (
      <div style={{ maxWidth: '320px' }}>
        <CLACalendar 
          settings={compactSettings}
          _onSettingsChange={() => {}}
        />
      </div>
    );
  },
};

// Dashboard Widget
export const DashboardWidget: Story = {
  name: 'Dashboard Calendar Widget',
  render: () => {
    const dashboardSettings = {
      ...getDefaultSettings(),
      displayMode: 'embedded' as const,
      visibleMonths: 2,
      monthWidth: 280,
      showSubmitButton: false,
      showHeader: true,
      showFooter: false,
      showLayersNavigation: true,
      showDateInputs: true,
      selectionMode: 'range' as const,
      baseFontSize: '0.875rem',
      containerStyle: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      layers: [
        {
          name: 'meetings',
          title: 'Meetings',
          description: 'Scheduled meetings',
          visible: true,
          color: '#3b82f6',
          data: {
            events: [
              { date: '2024-01-10', title: 'Team Standup', type: 'meeting', time: '9:00 AM', description: 'Daily sync', color: '#3b82f6' },
              { date: '2024-01-15', title: 'Client Review', type: 'meeting', time: '2:00 PM', description: 'Quarterly review', color: '#3b82f6' },
              { date: '2024-01-22', title: 'Planning Session', type: 'meeting', time: '10:00 AM', description: 'Sprint planning', color: '#3b82f6' },
            ],
          },
        },
        {
          name: 'deadlines',
          title: 'Deadlines',
          description: 'Project deadlines',
          visible: true,
          color: '#ef4444',
          data: {
            events: [
              { date: '2024-01-12', title: 'Report Due', type: 'deadline', time: '5:00 PM', description: 'Monthly report', color: '#ef4444' },
              { date: '2024-01-26', title: 'Project Milestone', type: 'deadline', time: '11:59 PM', description: 'Phase 1 complete', color: '#ef4444' },
            ],
          },
        },
      ],
    };

    return (
      <div style={{ maxWidth: '700px' }}>
        <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '4px' }}>Team Calendar</h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>View meetings and deadlines for the team</p>
        </div>
        <CLACalendar 
          settings={dashboardSettings}
          _onSettingsChange={() => {}}
        />
      </div>
    );
  },
};