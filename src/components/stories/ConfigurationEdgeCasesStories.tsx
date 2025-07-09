import React from 'react';
import CLACalendar from '../CLACalendar';
import { getDefaultSettings } from '../CLACalendar.config';

export const NullSettingsStory = () => (
  <CLACalendar settings={null as any} _onSettingsChange={() => {}} />
);

export const UndefinedSettingsStory = () => (
  <CLACalendar settings={undefined as any} _onSettingsChange={() => {}} />
);

export const EmptySettingsStory = () => (
  <CLACalendar settings={{} as any} _onSettingsChange={() => {}} />
);

export const InvalidNumbersStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      visibleMonths: -5, // Invalid: negative
      monthWidth: 50,   // Invalid: too small
    }} 
    _onSettingsChange={() => {}}
  />
);

export const NullArraysStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      layers: null as any,
    }} 
    _onSettingsChange={() => {}}
  />
);

export const EmptyLayersStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      layers: [],
    }} 
    _onSettingsChange={() => {}}
  />
);

export const MixedNullPropertiesStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      displayMode: undefined,
      visibleMonths: null as any,
      layers: undefined,
      colors: null as any,
      showHeader: undefined,
    }} 
    _onSettingsChange={() => {}}
  />
);

export const PartialConfigStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      visibleMonths: undefined,
      displayMode: null as any,
      selectionMode: 'range',
    }}
    _onSettingsChange={() => {}}
  />
);

export const MinimalSetupStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      displayMode: 'embedded',
      defaultRange: { start: '2024-01-10', end: '' },
    }} 
    onSubmit={(start, end) => console.log('Selected:', start, end)}
    _onSettingsChange={() => {}}
  />
);

export const InvalidDateRangeStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      defaultRange: {
        start: '2024-01-20',
        end: '2024-01-10', // End before start
      },
    }} 
    _onSettingsChange={() => {}}
  />
);

export const MalformedLayersStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      layers: [
        null as any,
        {
          name: 'Valid Layer',
          title: 'This layer is valid',
          description: 'Should work fine',
          visible: true,
        },
        undefined as any,
        {
          // Missing required fields
          name: '',
        } as any,
      ],
    }} 
    _onSettingsChange={() => {}}
  />
);

export const ExtremeValuesStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      visibleMonths: 999,  // Too high
      monthWidth: -100,    // Negative
      colors: {
        primary: null as any,
        success: '',       // Empty string
        warning: 'invalid-color',
        danger: '#dc3545',
      },
    }} 
    _onSettingsChange={() => {}}
  />
);

export const InvalidRestrictionsStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      visibleMonths: 2,
    }}
    restrictionConfigFactory={() => ({
      restrictions: [
        null as any,
        {
          type: 'invalid-type' as any,
          enabled: true,
        },
        {
          type: 'weekday',
          enabled: true,
          days: null as any,
        },
        {
          type: 'daterange',
          enabled: true,
          ranges: [
            null as any,
            {
              startDate: 'invalid-date',
              endDate: '2024-01-15',
            },
          ],
        },
      ],
    })}
    _onSettingsChange={() => {}}
  />
);

export const ConflictingRestrictionsStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      visibleMonths: 2,
    }}
    restrictionConfigFactory={() => ({
      restrictions: [
        {
          type: 'allowedranges',
          enabled: true,
          ranges: [
            {
              startDate: '2024-01-10',
              endDate: '2024-01-15',
              message: 'Only these dates allowed',
            },
          ],
        },
        {
          type: 'weekday',
          enabled: true,
          days: [1, 2, 3, 4, 5], // Block all weekdays
          message: 'Weekdays not allowed',
        },
      ],
    })}
    _onSettingsChange={() => {}}
  />
);

export const InvalidEventDataStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      layers: [
        {
          name: 'BadEvents',
          title: 'Malformed Events',
          description: 'Events with invalid data',
          visible: true,
          data: {
            events: [
              null as any,
              {
                date: 'invalid-date',
                title: 'Invalid Date Event',
                type: 'meeting',
              },
              {
                date: '2024-01-15',
                title: null as any,
                type: '',
              },
              {
                // Missing required fields
                title: 'Missing Date',
              } as any,
            ],
            background: [
              null as any,
              {
                startDate: '2024-01-20',
                endDate: '2024-01-10', // End before start
                color: 'invalid-color',
              },
              {
                startDate: null as any,
                endDate: '2024-01-15',
                color: '#FEF3C7',
              },
            ],
          },
        },
      ],
    }} 
    _onSettingsChange={() => {}}
  />
);