import { Layer } from '../CLACalendar.types';

export const teamEventsLayer: Layer = {
  name: 'Events',
  title: 'Team Events',
  description: 'Company meetings and events',
  visible: true,
  data: {
    events: [
      {
        date: '2024-01-08',
        title: 'All Hands Meeting',
        type: 'meeting',
        time: '10:00 AM',
        description: 'Monthly company meeting',
        color: '#3B82F6',
      },
      {
        date: '2024-01-15',
        title: 'Product Launch',
        type: 'milestone',
        time: '2:00 PM',
        description: 'New feature release',
        color: '#8B5CF6',
      },
      {
        date: '2024-01-22',
        title: 'Team Building',
        type: 'social',
        time: '3:00 PM',
        description: 'Offsite team activity',
        color: '#10B981',
      },
    ],
    background: [
      {
        startDate: '2024-01-08',
        endDate: '2024-01-10',
        color: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  },
};

export const holidaysLayer: Layer = {
  name: 'Holidays',
  title: 'Public Holidays',
  description: 'National and company holidays',
  visible: true,
  color: '#EF4444',
  data: {
    events: [
      {
        date: '2024-01-01',
        title: "New Year's Day",
        type: 'holiday',
        time: 'All day',
        description: 'Public holiday',
        color: '#EF4444',
      },
      {
        date: '2024-01-15',
        title: 'MLK Jr. Day',
        type: 'holiday',
        time: 'All day',
        description: 'Public holiday',
        color: '#EF4444',
      },
    ],
    background: [
      {
        startDate: '2024-01-01',
        endDate: '2024-01-01',
        color: 'rgba(239, 68, 68, 0.1)',
      },
      {
        startDate: '2024-01-15',
        endDate: '2024-01-15',
        color: 'rgba(239, 68, 68, 0.1)',
      },
    ],
  },
};

export const deadlinesLayer: Layer = {
  name: 'Deadlines',
  title: 'Project Deadlines',
  description: 'Important due dates',
  visible: true,
  color: '#F59E0B',
  data: {
    events: [
      {
        date: '2024-01-05',
        title: 'Q4 Report Due',
        type: 'deadline',
        time: '5:00 PM',
        description: 'Quarterly financial report',
        color: '#F59E0B',
      },
      {
        date: '2024-01-19',
        title: 'Sprint Review',
        type: 'deadline',
        time: '4:00 PM',
        description: 'End of sprint demos',
        color: '#F59E0B',
      },
    ],
  },
};

export const sprintsLayer: Layer = {
  name: 'Sprints',
  title: 'Sprint Schedule',
  description: 'Two-week development sprints',
  visible: true,
  color: '#6366F1',
  data: {
    events: [
      {
        date: '2024-02-01',
        title: 'Sprint 23 Start',
        type: 'milestone',
        time: '9:00 AM',
        description: 'Planning & kickoff',
        color: '#6366F1',
      },
      {
        date: '2024-02-14',
        title: 'Sprint 23 End',
        type: 'milestone',
        time: '5:00 PM',
        description: 'Review & retrospective',
        color: '#6366F1',
      },
    ],
    background: [
      {
        startDate: '2024-02-01',
        endDate: '2024-02-14',
        color: 'rgba(99, 102, 241, 0.1)',
      },
      {
        startDate: '2024-02-15',
        endDate: '2024-02-28',
        color: 'rgba(99, 102, 241, 0.05)',
      },
    ],
  },
};

export const availabilityLayer: Layer = {
  name: 'Availability',
  title: 'Team Availability',
  description: 'Out of office and busy periods',
  visible: true,
  color: '#EC4899',
  data: {
    events: [],
    background: [
      {
        startDate: '2024-02-05',
        endDate: '2024-02-07',
        color: 'rgba(236, 72, 153, 0.15)',
      },
      {
        startDate: '2024-02-19',
        endDate: '2024-02-21',
        color: 'rgba(236, 72, 153, 0.15)',
      },
    ],
  },
};

export const developmentLayer: Layer = {
  name: 'Development',
  title: 'Dev Schedule',
  description: 'Development milestones and code freezes',
  visible: true,
  color: '#8B5CF6',
  data: {
    events: [
      {
        date: '2024-03-04',
        title: 'Feature Freeze',
        type: 'milestone',
        time: '5:00 PM',
        description: 'No new features after this date',
        color: '#8B5CF6',
      },
      {
        date: '2024-03-11',
        title: 'Code Review',
        type: 'meeting',
        time: '2:00 PM',
        description: 'Final code review session',
        color: '#8B5CF6',
      },
      {
        date: '2024-03-15',
        title: 'Release Day',
        type: 'milestone',
        time: '10:00 AM',
        description: 'Version 2.0 release',
        color: '#8B5CF6',
      },
    ],
    background: [
      {
        startDate: '2024-03-01',
        endDate: '2024-03-04',
        color: 'rgba(139, 92, 246, 0.1)',
      },
      {
        startDate: '2024-03-04',
        endDate: '2024-03-11',
        color: 'rgba(239, 68, 68, 0.1)',
      },
      {
        startDate: '2024-03-11',
        endDate: '2024-03-15',
        color: 'rgba(34, 197, 94, 0.1)',
      },
    ],
  },
};

export const marketingLayer: Layer = {
  name: 'Marketing',
  title: 'Marketing Calendar',
  description: 'Campaigns and content schedule',
  visible: true,
  color: '#EC4899',
  data: {
    events: [
      {
        date: '2024-03-01',
        title: 'Campaign Launch',
        type: 'marketing',
        time: '9:00 AM',
        description: 'Spring campaign begins',
        color: '#EC4899',
      },
      {
        date: '2024-03-08',
        title: 'Blog Post',
        type: 'content',
        time: '10:00 AM',
        description: 'Feature announcement post',
        color: '#EC4899',
      },
      {
        date: '2024-03-15',
        title: 'Press Release',
        type: 'announcement',
        time: '8:00 AM',
        description: 'Version 2.0 announcement',
        color: '#EC4899',
      },
    ],
    background: [
      {
        startDate: '2024-03-01',
        endDate: '2024-03-07',
        color: 'rgba(236, 72, 153, 0.1)',
      },
      {
        startDate: '2024-03-08',
        endDate: '2024-03-15',
        color: 'rgba(236, 72, 153, 0.15)',
      },
    ],
  },
};