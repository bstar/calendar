import React from 'react';
import { CLACalendar } from '../CLACalendar';
import { getDefaultSettings } from '../CLACalendar.config';
import { StoryContainer, baseCalendarSettings } from '../utils/story-helpers';
import {
  teamEventsLayer,
  holidaysLayer,
  deadlinesLayer,
  sprintsLayer,
  availabilityLayer,
  developmentLayer,
  marketingLayer,
} from './layers-data';

export const MultipleLayersStory = () => (
  <StoryContainer>
    <CLACalendar
      settings={{
        ...baseCalendarSettings,
        showLayersNavigation: true,
        defaultLayer: 'Events',
        defaultRange: {
          start: '2024-01-01',
          end: '2024-01-03',
        },
        layers: [teamEventsLayer, holidaysLayer, deadlinesLayer],
      }}
      _onSettingsChange={() => {}}
    />
  </StoryContainer>
);

export const BackgroundHighlightsStory = () => (
  <StoryContainer>
    <CLACalendar
      settings={{
        ...baseCalendarSettings,
        showLayersNavigation: true,
        defaultLayer: 'Sprints',
        defaultRange: {
          start: '2024-02-01',
          end: '2024-02-15',
        },
        layers: [sprintsLayer, availabilityLayer],
      }}
      _onSettingsChange={() => {}}
    />
  </StoryContainer>
);

export const SingleLayerStory = () => (
  <StoryContainer>
    <CLACalendar
      settings={{
        ...baseCalendarSettings,
        showLayersNavigation: false, // Hide navigation for single layer
        layers: [
          {
            name: 'Calendar',
            title: 'My Calendar',
            description: 'Personal schedule',
            visible: true,
            data: {
              events: [
                {
                  date: '2024-01-10',
                  title: 'Doctor Appointment',
                  type: 'appointment',
                  time: '10:00 AM',
                  description: 'Annual checkup',
                  color: '#0EA5E9',
                },
                {
                  date: '2024-01-12',
                  title: 'Team Lunch',
                  type: 'social',
                  time: '12:30 PM',
                  description: 'Monthly team gathering',
                  color: '#10B981',
                },
                {
                  date: '2024-01-18',
                  title: 'Project Deadline',
                  type: 'deadline',
                  time: '5:00 PM',
                  description: 'Final deliverable due',
                  color: '#F59E0B',
                },
              ],
            },
          },
        ],
      }}
      _onSettingsChange={() => {}}
    />
  </StoryContainer>
);

export const MixedContentStory = () => (
  <StoryContainer>
    <CLACalendar
      settings={{
        ...baseCalendarSettings,
        showLayersNavigation: true,
        visibleMonths: 2,
        defaultLayer: 'Development',
        defaultRange: {
          start: '2024-03-01',
          end: '2024-03-15',
        },
        layers: [developmentLayer, marketingLayer],
      }}
      _onSettingsChange={() => {}}
    />
  </StoryContainer>
);

export const DynamicLayerControlStory = () => {
  const [activeLayer, setActiveLayer] = React.useState('Important');

  return (
    <div>
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
        <strong>Active Layer:</strong> {activeLayer}
      </div>
      <StoryContainer>
        <CLACalendar
          settings={{
            ...baseCalendarSettings,
            showLayersNavigation: true,
            defaultLayer: activeLayer,
            layers: [
              {
                name: 'Important',
                title: '⭐ Important',
                description: 'Cannot be hidden',
                visible: true,
                required: true, // Cannot be hidden
                color: '#EF4444',
                data: {
                  events: [
                    {
                      date: '2024-01-15',
                      title: 'Critical Deadline',
                      type: 'deadline',
                      time: '5:00 PM',
                      description: 'Must be completed',
                      color: '#EF4444',
                    },
                  ],
                },
              },
              {
                name: 'Optional',
                title: 'Optional Events',
                description: 'Can be toggled',
                visible: true,
                enabled: true,
                color: '#3B82F6',
                data: {
                  events: [
                    {
                      date: '2024-01-20',
                      title: 'Optional Meeting',
                      type: 'meeting',
                      time: '2:00 PM',
                      description: 'Attendance optional',
                      color: '#3B82F6',
                    },
                  ],
                },
              },
              {
                name: 'ReadOnly',
                title: '🔒 Read Only',
                description: 'View only, no interaction',
                visible: true,
                enabled: false,
                color: '#6B7280',
                data: {
                  events: [
                    {
                      date: '2024-01-25',
                      title: 'System Maintenance',
                      type: 'maintenance',
                      time: '12:00 AM',
                      description: 'Scheduled downtime',
                      color: '#6B7280',
                    },
                  ],
                },
              },
            ],
          }}
          initialActiveLayer={activeLayer}
          _onSettingsChange={(settings) => {
            console.log('Settings changed:', settings);
          }}
        />
      </StoryContainer>
    </div>
  );
};