import React from 'react';
import { CLACalendar } from '../CLACalendar';
import { Layer } from '../CLACalendar.types';
import { StoryContainer, baseCalendarSettings } from '../utils/story-helpers';
import {
  weekdayRestriction,
  dateRangeRestriction,
  boundaryRestriction,
  combinedRestrictions,
  allowedRangesRestriction,
  restrictedBoundaryRestriction,
  createBusinessHoursRestriction,
  createMaintenanceRestriction,
  createCustomRestriction,
} from './restrictions-data';

const holidayLayer: Layer = {
  name: 'Holidays',
  title: 'Holiday Calendar',
  description: 'Company holidays and blackout dates',
  visible: true,
  data: {
    events: [
      {
        date: '2024-02-14',
        title: "Valentine's Day",
        type: 'holiday',
        time: 'All day',
        description: 'Office closed',
        color: '#EF4444',
      },
      {
        date: '2024-02-19',
        title: "President's Day",
        type: 'holiday',
        time: 'All day',
        description: 'Federal holiday',
        color: '#EF4444',
      },
    ],
  },
};

export const WeekdayRestrictionsStory = () => (
  <StoryContainer>
    <CLACalendar
      settings={{
        ...baseCalendarSettings,
        visibleMonths: 2,
        showSelectionAlert: true,
        defaultRange: {
          start: '2024-01-08',
          end: '2024-01-10',
        },
      }}
      restrictionConfigFactory={() => weekdayRestriction}
      _onSettingsChange={() => {}}
    />
  </StoryContainer>
);

export const DateRangeRestrictionsStory = () => (
  <StoryContainer>
    <CLACalendar
      settings={{
        ...baseCalendarSettings,
        visibleMonths: 3,
        showSelectionAlert: true,
        defaultRange: {
          start: '2024-02-01',
          end: '2024-02-05',
        },
        layers: [holidayLayer],
      }}
      restrictionConfigFactory={() => dateRangeRestriction}
      _onSettingsChange={() => {}}
    />
  </StoryContainer>
);

export const BoundaryRestrictionsStory = () => (
  <StoryContainer>
    <CLACalendar
      settings={{
        ...baseCalendarSettings,
        visibleMonths: 3,
        showSelectionAlert: true,
        defaultRange: {
          start: '2024-01-15',
          end: '2024-01-20',
        },
      }}
      restrictionConfigFactory={() => boundaryRestriction}
      _onSettingsChange={() => {}}
    />
  </StoryContainer>
);

export const CombinedRestrictionsStory = () => (
  <StoryContainer>
    <CLACalendar
      settings={{
        ...baseCalendarSettings,
        visibleMonths: 3,
        showSelectionAlert: true,
        defaultRange: {
          start: '2024-02-05',
          end: '2024-02-07',
        },
      }}
      restrictionConfigFactory={() => combinedRestrictions}
      _onSettingsChange={() => {}}
    />
  </StoryContainer>
);

export const AllowedRangesOnlyStory = () => (
  <StoryContainer>
    <CLACalendar
      settings={{
        ...baseCalendarSettings,
        visibleMonths: 2,
        showSelectionAlert: true,
        defaultRange: {
          start: '2024-01-15',
          end: '2024-01-17',
        },
      }}
      restrictionConfigFactory={() => allowedRangesRestriction}
      _onSettingsChange={() => {}}
    />
  </StoryContainer>
);

export const DynamicRestrictionsStory = () => {
  const [restrictionType, setRestrictionType] = React.useState<'business' | 'maintenance' | 'custom'>('business');

  const getRestrictions = () => {
    switch (restrictionType) {
      case 'business':
        return createBusinessHoursRestriction();
      case 'maintenance':
        return createMaintenanceRestriction();
      case 'custom':
        return createCustomRestriction();
      default:
        return { restrictions: [] };
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
        <label style={{ marginRight: '1rem' }}>
          <strong>Restriction Mode:</strong>
        </label>
        <select
          value={restrictionType}
          onChange={(e) => setRestrictionType(e.target.value as any)}
          style={{
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        >
          <option value="business">Business Days Only</option>
          <option value="maintenance">Maintenance Windows</option>
          <option value="custom">Custom Rules</option>
        </select>
      </div>
      <StoryContainer>
        <CLACalendar
          key={restrictionType}
          settings={{
            ...baseCalendarSettings,
            visibleMonths: 2,
            showSelectionAlert: true,
          }}
          restrictionConfigFactory={() => getRestrictions()}
          _onSettingsChange={() => {}}
        />
      </StoryContainer>
    </div>
  );
};

export const RestrictedBoundaryStory = () => (
  <StoryContainer>
    <CLACalendar
      settings={{
        ...baseCalendarSettings,
        visibleMonths: 3,
        showSelectionAlert: true,
        defaultRange: {
          start: '2024-02-12',
          end: '2024-02-14',
        },
      }}
      restrictionConfigFactory={() => restrictedBoundaryRestriction}
      _onSettingsChange={() => {}}
    />
  </StoryContainer>
);