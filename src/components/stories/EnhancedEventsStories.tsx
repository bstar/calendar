import React from 'react';
import { CLACalendar } from '../CLACalendar';
import { getDefaultSettings } from '../CLACalendar.config';

// Event types data
const meetingsLayerData = {
  name: 'Meetings',
  title: 'Meetings & Calls',
  description: 'Internal and external meetings',
  visible: true,
  data: {
    events: [
      {
        date: '2024-01-03',
        title: 'Daily Standup',
        type: 'meeting',
        time: '9:00 AM',
        description: 'Team synchronization meeting with status updates and blockers discussion',
        color: '#3B82F6',
      },
      {
        date: '2024-01-08',
        title: 'Client Call - TechCorp',
        type: 'meeting',
        time: '2:00 PM',
        description: 'Quarterly business review with our largest client',
        color: '#1E40AF',
      },
      {
        date: '2024-01-15',
        title: 'All Hands Meeting',
        type: 'meeting',
        time: '11:00 AM',
        description: 'Company-wide meeting with Q4 results and Q1 planning',
        color: '#2563EB',
      },
      {
        date: '2024-01-22',
        title: '1:1 with Manager',
        type: 'meeting',
        time: '3:30 PM',
        description: 'Monthly one-on-one performance and career discussion',
        color: '#3B82F6',
      },
    ],
  },
};

const deadlinesLayerData = {
  name: 'Deadlines',
  title: 'Deadlines & Milestones',
  description: 'Project deadlines and important milestones',
  visible: true,
  data: {
    events: [
      {
        date: '2024-01-05',
        title: 'Sprint Planning Complete',
        type: 'deadline',
        time: '5:00 PM',
        description: 'Complete sprint planning for the next two-week iteration',
        color: '#F59E0B',
      },
      {
        date: '2024-01-19',
        title: 'Feature Freeze',
        type: 'deadline',
        time: '11:59 PM',
        description: 'No new features after this date for v2.1 release',
        color: '#D97706',
      },
      {
        date: '2024-02-02',
        title: 'Code Review Deadline',
        type: 'deadline',
        time: '3:00 PM',
        description: 'All pull requests must be reviewed and approved',
        color: '#F59E0B',
      },
      {
        date: '2024-02-15',
        title: 'Product Launch',
        type: 'milestone',
        time: '10:00 AM',
        description: 'Official v2.1 product launch and announcement',
        color: '#DC2626',
      },
    ],
  },
};

const learningLayerData = {
  name: 'Learning',
  title: 'Training & Development',
  description: 'Learning opportunities and skill development',
  visible: true,
  data: {
    events: [
      {
        date: '2024-01-10',
        title: 'React Advanced Patterns',
        type: 'training',
        time: '9:00 AM',
        description: 'Workshop on advanced React patterns including hooks, context, and performance optimization',
        color: '#059669',
      },
      {
        date: '2024-01-17',
        title: 'Security Best Practices',
        type: 'training',
        time: '1:00 PM',
        description: 'Cybersecurity awareness training and secure coding practices',
        color: '#047857',
      },
      {
        date: '2024-01-24',
        title: 'Design System Workshop',
        type: 'training',
        time: '10:00 AM',
        description: 'Hands-on workshop for implementing our new design system',
        color: '#059669',
      },
      {
        date: '2024-02-07',
        title: 'Tech Talk: AI/ML Trends',
        type: 'training',
        time: '4:00 PM',
        description: 'Industry expert presentation on latest AI and machine learning trends',
        color: '#047857',
      },
    ],
  },
};

const socialLayerData = {
  name: 'Social',
  title: 'Social & Team Building',
  description: 'Social events and team building activities',
  visible: true,
  data: {
    events: [
      {
        date: '2024-01-12',
        title: 'Team Lunch',
        type: 'social',
        time: '12:30 PM',
        description: 'Monthly team lunch at the new Italian restaurant downtown',
        color: '#8B5CF6',
      },
      {
        date: '2024-01-26',
        title: 'Happy Hour',
        type: 'social',
        time: '5:30 PM',
        description: 'End of sprint celebration at the rooftop bar',
        color: '#7C3AED',
      },
      {
        date: '2024-02-09',
        title: 'Game Tournament',
        type: 'social',
        time: '4:00 PM',
        description: 'Office ping pong tournament with prizes for winners',
        color: '#8B5CF6',
      },
      {
        date: '2024-02-23',
        title: 'Team Outing',
        type: 'social',
        time: '1:00 PM',
        description: 'Team building escape room followed by dinner',
        color: '#7C3AED',
      },
    ],
  },
};

export const EventTypesGalleryStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      displayMode: 'embedded',
      visibleMonths: 2,
      showTooltips: true,
      showLayersNavigation: true,
      showSubmitButton: true,
      defaultLayer: 'Meetings',
      defaultRange: {
        start: '2024-01-01',
        end: '2024-01-05',
      },
      layers: [meetingsLayerData, deadlinesLayerData, learningLayerData, socialLayerData],
    }}
    _onSettingsChange={() => {}}
  />
);

// Dense calendar data generation
const generateDenseEvents = () => {
  const events = [];
  const eventTypes = [
    { type: 'meeting', color: '#3B82F6', prefix: 'Meeting:' },
    { type: 'review', color: '#8B5CF6', prefix: 'Review:' },
    { type: 'demo', color: '#DC2626', prefix: 'Demo:' },
    { type: 'training', color: '#059669', prefix: 'Training:' },
    { type: 'planning', color: '#F59E0B', prefix: 'Planning:' },
    { type: 'testing', color: '#F59E0B', prefix: 'Testing:' },
    { type: 'social', color: '#8B5CF6', prefix: 'Social:' },
  ];

  // Week 1
  events.push(
    { date: '2024-01-02', title: 'Project Kickoff', type: 'meeting', time: '9:00 AM', description: 'Q1 project kickoff meeting', color: '#3B82F6' },
    { date: '2024-01-02', title: 'Design Review', type: 'review', time: '2:00 PM', description: 'UI/UX design review session', color: '#8B5CF6' },
    { date: '2024-01-03', title: 'Daily Standup', type: 'meeting', time: '9:15 AM', description: 'Team sync meeting', color: '#3B82F6' },
    { date: '2024-01-03', title: 'Code Review', type: 'review', time: '3:30 PM', description: 'PR review session', color: '#059669' },
    { date: '2024-01-04', title: 'Client Demo', type: 'demo', time: '11:00 AM', description: 'Product demo for stakeholders', color: '#DC2626' },
    { date: '2024-01-04', title: 'Team Training', type: 'training', time: '4:00 PM', description: 'New tools workshop', color: '#059669' },
    { date: '2024-01-05', title: 'Sprint Planning', type: 'planning', time: '10:00 AM', description: 'Plan next sprint work', color: '#F59E0B' }
  );

  // Week 2
  events.push(
    { date: '2024-01-08', title: 'Architecture Review', type: 'review', time: '9:00 AM', description: 'System architecture discussion', color: '#8B5CF6' },
    { date: '2024-01-08', title: 'Customer Feedback', type: 'feedback', time: '2:00 PM', description: 'Review customer feedback', color: '#DC2626' },
    { date: '2024-01-09', title: 'Performance Review', type: 'review', time: '1:00 PM', description: 'Application performance analysis', color: '#059669' },
    { date: '2024-01-10', title: 'Security Audit', type: 'audit', time: '10:30 AM', description: 'Security compliance review', color: '#DC2626' },
    { date: '2024-01-10', title: 'Team Lunch', type: 'social', time: '12:30 PM', description: 'Team building lunch', color: '#8B5CF6' },
    { date: '2024-01-11', title: 'Bug Triage', type: 'triage', time: '3:00 PM', description: 'Weekly bug review and prioritization', color: '#F59E0B' },
    { date: '2024-01-12', title: 'Documentation Day', type: 'docs', time: '9:00 AM', description: 'Update project documentation', color: '#059669' }
  );

  // Week 3
  events.push(
    { date: '2024-01-15', title: 'Release Candidate', type: 'milestone', time: '12:00 PM', description: 'RC build deployment', color: '#DC2626' },
    { date: '2024-01-16', title: 'QA Testing', type: 'testing', time: '9:00 AM', description: 'Quality assurance testing', color: '#F59E0B' },
    { date: '2024-01-17', title: 'Load Testing', type: 'testing', time: '10:00 AM', description: 'Performance load testing', color: '#F59E0B' },
    { date: '2024-01-18', title: 'User Acceptance', type: 'testing', time: '2:00 PM', description: 'UAT with business users', color: '#8B5CF6' },
    { date: '2024-01-19', title: 'Go/No-Go Meeting', type: 'decision', time: '4:00 PM', description: 'Release decision meeting', color: '#DC2626' }
  );

  // Week 4
  events.push(
    { date: '2024-01-22', title: 'Production Deploy', type: 'deployment', time: '11:00 PM', description: 'Production deployment', color: '#DC2626' },
    { date: '2024-01-23', title: 'Monitoring Setup', type: 'ops', time: '8:00 AM', description: 'Post-deploy monitoring', color: '#059669' },
    { date: '2024-01-24', title: 'Retrospective', type: 'retrospective', time: '3:00 PM', description: 'Sprint retrospective meeting', color: '#8B5CF6' },
    { date: '2024-01-25', title: 'Next Sprint Planning', type: 'planning', time: '10:00 AM', description: 'Plan next iteration', color: '#F59E0B' },
    { date: '2024-01-26', title: 'Team Celebration', type: 'social', time: '5:00 PM', description: 'Celebrate successful release', color: '#8B5CF6' }
  );

  return events;
};

export const DenseEventCalendarStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      displayMode: 'embedded',
      visibleMonths: 1,
      showTooltips: true,
      showLayersNavigation: false,
      showSubmitButton: true,
      defaultLayer: 'BusyMonth',
      defaultRange: {
        start: '2024-01-01',
        end: '2024-01-05',
      },
      layers: [
        {
          name: 'BusyMonth',
          title: 'Busy January',
          description: 'High-density month with many events',
          visible: true,
          data: {
            events: generateDenseEvents(),
          },
        },
      ],
    }}
    _onSettingsChange={() => {}}
  />
);

// Recurring patterns data
const generateRecurringEvents = () => {
  const dailyEvents = [];
  const weeklyEvents = [];
  const monthlyEvents = [];

  // Daily standups (weekdays only)
  const dailyDates = ['2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', 
                      '2024-01-08', '2024-01-09', '2024-01-10', '2024-01-11', '2024-01-12',
                      '2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19',
                      '2024-01-22', '2024-01-23', '2024-01-24', '2024-01-25', '2024-01-26'];
  
  dailyDates.forEach(date => {
    dailyEvents.push({
      date,
      title: 'Daily Standup',
      type: 'meeting',
      time: '9:00 AM',
      description: 'Daily team synchronization',
      color: '#3B82F6',
    });
  });

  // Weekly reviews (Fridays)
  const fridayDates = ['2024-01-05', '2024-01-12', '2024-01-19', '2024-01-26', '2024-02-02'];
  fridayDates.forEach(date => {
    weeklyEvents.push({
      date,
      title: 'Weekly Review',
      type: 'review',
      time: '4:00 PM',
      description: 'Weekly progress review and planning',
      color: '#059669',
    });
  });

  // Weekly 1:1s (Tuesdays)
  const tuesdayDates = ['2024-01-02', '2024-01-09', '2024-01-16', '2024-01-23', '2024-01-30'];
  tuesdayDates.forEach(date => {
    weeklyEvents.push({
      date,
      title: '1:1 with Manager',
      type: 'meeting',
      time: '2:00 PM',
      description: 'Weekly one-on-one meeting',
      color: '#8B5CF6',
    });
  });

  // Monthly events
  monthlyEvents.push(
    {
      date: '2024-01-15',
      title: 'All Hands Meeting',
      type: 'meeting',
      time: '11:00 AM',
      description: 'Monthly company-wide meeting',
      color: '#DC2626',
    },
    {
      date: '2024-02-15',
      title: 'All Hands Meeting',
      type: 'meeting',
      time: '11:00 AM',
      description: 'Monthly company-wide meeting',
      color: '#DC2626',
    },
    {
      date: '2024-01-31',
      title: 'Monthly Retrospective',
      type: 'retrospective',
      time: '3:00 PM',
      description: 'Monthly team retrospective',
      color: '#F59E0B',
    },
    {
      date: '2024-02-29',
      title: 'Monthly Retrospective',
      type: 'retrospective',
      time: '3:00 PM',
      description: 'Monthly team retrospective',
      color: '#F59E0B',
    }
  );

  return { dailyEvents, weeklyEvents, monthlyEvents };
};

export const RecurringPatternsStory = () => {
  const { dailyEvents, weeklyEvents, monthlyEvents } = generateRecurringEvents();
  
  return (
    <CLACalendar 
      settings={{
        ...getDefaultSettings(),
        displayMode: 'embedded',
        visibleMonths: 2,
        showTooltips: true,
        showLayersNavigation: true,
        showSubmitButton: true,
        defaultLayer: 'Daily',
        defaultRange: {
          start: '2024-01-01',
          end: '2024-01-05',
        },
        layers: [
          {
            name: 'Daily',
            title: 'Daily Recurring',
            description: 'Events that happen every day',
            visible: true,
            data: {
              events: dailyEvents,
            },
          },
          {
            name: 'Weekly',
            title: 'Weekly Recurring',
            description: 'Events that happen every week',
            visible: true,
            data: {
              events: weeklyEvents,
            },
          },
          {
            name: 'Monthly',
            title: 'Monthly Recurring',
            description: 'Events that happen monthly',
            visible: true,
            data: {
              events: monthlyEvents,
            },
          },
        ],
      }}
      _onSettingsChange={() => {}}
    />
  );
};

// Rich tooltips data
const richTooltipsEvents = [
  {
    date: '2024-01-05',
    title: 'Product Strategy Meeting',
    type: 'meeting',
    time: '10:00 AM - 12:00 PM',
    description: 'Comprehensive product strategy session covering Q1 roadmap, competitive analysis, user feedback review, and feature prioritization. Attendees include product managers, engineering leads, and design team. Location: Conference Room A. Pre-reading materials were sent on January 2nd.',
    color: '#3B82F6',
  },
  {
    date: '2024-01-10',
    title: 'Technical Architecture Review',
    type: 'review',
    time: '2:00 PM - 4:00 PM',
    description: 'Deep dive into the proposed microservices architecture for the new user management system. Review includes performance implications, security considerations, database design, API contracts, and deployment strategies. Technical leads from each team will present their domain-specific requirements.',
    color: '#059669',
  },
  {
    date: '2024-01-15',
    title: 'Customer Advisory Board',
    type: 'external',
    time: '9:00 AM - 5:00 PM',
    description: 'Quarterly customer advisory board meeting with our top 10 enterprise clients. Agenda includes product roadmap presentation, feature request prioritization, customer success stories, and networking lunch. Key customers: TechCorp, InnovateLabs, GlobalSoft, and others. Virtual attendance option available.',
    color: '#DC2626',
  },
  {
    date: '2024-01-20',
    title: 'Security Compliance Audit',
    type: 'audit',
    time: '9:00 AM - 6:00 PM',
    description: 'Annual SOC 2 Type II compliance audit conducted by external auditors. Full day assessment covering data security, availability, processing integrity, confidentiality, and privacy. All engineering and IT staff must be available for interviews. Documentation review starts at 9 AM.',
    color: '#F59E0B',
  },
  {
    date: '2024-01-25',
    title: 'Team Building Workshop',
    type: 'social',
    time: '1:00 PM - 5:00 PM',
    description: 'Facilitated team building workshop focusing on communication styles, conflict resolution, and collaborative problem-solving. Professional facilitator will guide activities including personality assessments, group challenges, and action planning. Followed by team dinner at 6 PM.',
    color: '#8B5CF6',
  },
  {
    date: '2024-01-30',
    title: 'Board of Directors Meeting',
    type: 'executive',
    time: '8:00 AM - 12:00 PM',
    description: 'Quarterly board meeting with executive presentations on financial performance, strategic initiatives, market analysis, and operational updates. CEO, CFO, CTO, and VP Sales will present. Board package distributed 48 hours prior. Executive session follows main meeting.',
    color: '#7C2D12',
  },
];

export const RichEventTooltipsStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      displayMode: 'embedded',
      visibleMonths: 1,
      showTooltips: true,
      showLayersNavigation: false,
      showSubmitButton: true,
      defaultLayer: 'DetailedEvents',
      defaultRange: {
        start: '2024-01-01',
        end: '2024-01-05',
      },
      layers: [
        {
          name: 'DetailedEvents',
          title: 'Events with Rich Details',
          description: 'Events with comprehensive information for tooltips',
          visible: true,
          data: {
            events: richTooltipsEvents,
          },
        },
      ],
    }}
    _onSettingsChange={() => {}}
  />
);

// Multi-layer visualization
export const MultiLayerVisualizationStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      displayMode: 'embedded',
      visibleMonths: 2,
      showTooltips: true,
      showLayersNavigation: true,
      showSubmitButton: false,
      defaultLayer: 'Meetings',
      defaultRange: {
        start: '2024-01-08',
        end: '2024-01-12',
      },
      layers: [
        {
          name: 'Meetings',
          title: 'Meetings',
          description: 'All meetings and calls',
          visible: true,
          color: '#3B82F6',
          data: {
            events: meetingsLayerData.data.events,
            background: [
              {
                startDate: '2024-01-01',
                endDate: '2024-01-05',
                color: 'rgba(59, 130, 246, 0.1)',
              },
              {
                startDate: '2024-01-15',
                endDate: '2024-01-19',
                color: 'rgba(59, 130, 246, 0.1)',
              },
            ],
          },
        },
        {
          name: 'Development',
          title: 'Development',
          description: 'Development activities',
          visible: true,
          color: '#059669',
          data: {
            events: [
              {
                date: '2024-01-03',
                title: 'Code Review',
                type: 'review',
                time: '10:00 AM',
                description: 'Review pull requests',
                color: '#059669',
              },
              {
                date: '2024-01-10',
                title: 'Sprint Demo',
                type: 'demo',
                time: '3:00 PM',
                description: 'Demo completed features',
                color: '#059669',
              },
              {
                date: '2024-01-17',
                title: 'Release Planning',
                type: 'planning',
                time: '2:00 PM',
                description: 'Plan next release',
                color: '#059669',
              },
            ],
            background: [
              {
                startDate: '2024-01-08',
                endDate: '2024-01-12',
                color: 'rgba(5, 150, 105, 0.1)',
              },
            ],
          },
        },
        {
          name: 'Important',
          title: 'Important Dates',
          description: 'Critical deadlines and milestones',
          visible: true,
          required: true,
          color: '#DC2626',
          data: {
            events: [
              {
                date: '2024-01-15',
                title: 'Contract Deadline',
                type: 'deadline',
                time: '5:00 PM',
                description: 'Client contract must be signed',
                color: '#DC2626',
              },
              {
                date: '2024-01-31',
                title: 'Quarterly Close',
                type: 'milestone',
                time: '11:59 PM',
                description: 'Q4 financial close',
                color: '#DC2626',
              },
            ],
            background: [
              {
                startDate: '2024-01-15',
                endDate: '2024-01-15',
                color: 'rgba(220, 38, 38, 0.2)',
              },
              {
                startDate: '2024-01-31',
                endDate: '2024-01-31',
                color: 'rgba(220, 38, 38, 0.2)',
              },
            ],
          },
        },
      ],
    }}
    _onSettingsChange={() => {}}
  />
);

// Event conflicts example
export const EventConflictsStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      displayMode: 'embedded',
      visibleMonths: 1,
      showTooltips: true,
      showLayersNavigation: false,
      showSubmitButton: true,
      defaultLayer: 'ConflictingSchedule',
      defaultRange: {
        start: '2024-01-08',
        end: '2024-01-10',
      },
      layers: [
        {
          name: 'ConflictingSchedule',
          title: 'Schedule with Conflicts',
          description: 'Multiple events at the same time',
          visible: true,
          data: {
            events: [
              // January 10 - Triple conflict at 10:00 AM
              {
                date: '2024-01-10',
                title: 'Client Meeting',
                type: 'meeting',
                time: '10:00 AM',
                description: 'Important client presentation - PRIORITY',
                color: '#DC2626',
              },
              {
                date: '2024-01-10',
                title: 'Team Standup',
                type: 'meeting',
                time: '10:00 AM',
                description: 'Daily team sync - Can be rescheduled',
                color: '#3B82F6',
              },
              {
                date: '2024-01-10',
                title: 'Training Session',
                type: 'training',
                time: '10:00 AM',
                description: 'Optional training - Recording available',
                color: '#059669',
              },
              // January 15 - Double conflict at 2:00 PM
              {
                date: '2024-01-15',
                title: 'Board Presentation',
                type: 'meeting',
                time: '2:00 PM',
                description: 'Quarterly board update - MANDATORY',
                color: '#DC2626',
              },
              {
                date: '2024-01-15',
                title: 'Product Demo',
                type: 'demo',
                time: '2:00 PM',
                description: 'New feature demo - Can be recorded',
                color: '#8B5CF6',
              },
              // January 20 - Back-to-back meetings
              {
                date: '2024-01-20',
                title: 'Strategy Session',
                type: 'meeting',
                time: '9:00 AM - 11:00 AM',
                description: '2-hour strategy planning session',
                color: '#F59E0B',
              },
              {
                date: '2024-01-20',
                title: 'Emergency Meeting',
                type: 'meeting',
                time: '10:30 AM',
                description: 'Urgent issue discussion',
                color: '#DC2626',
              },
            ],
          },
        },
      ],
    }}
    _onSettingsChange={() => {}}
  />
);