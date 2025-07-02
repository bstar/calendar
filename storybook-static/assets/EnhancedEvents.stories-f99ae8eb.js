import{C as t,j as r}from"./CLACalendar-a752fb7f.js";import"./index-8a57d176.js";import"./_commonjsHelpers-725317a4.js";import"./index-6700e26c.js";/* empty css                           */const A={title:"Calendar/Enhanced Events",component:t,parameters:{layout:"padded",docs:{description:{component:"Rich examples showcasing different event types, dense calendars, and complex event configurations."}}},argTypes:{displayMode:{control:{type:"select"},options:["embedded","popup"],description:"How the calendar should be displayed"},isOpen:{control:"boolean",description:"Whether the calendar is open (for popup mode)"},visibleMonths:{control:{type:"range",min:1,max:6},description:"Number of months to display"},showTooltips:{control:"boolean",description:"Show event tooltips on hover"},showLayersNavigation:{control:"boolean",description:"Show layer navigation tabs"}}},n={render:e=>r.jsx(t,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,showTooltips:e.showTooltips??!0,showLayersNavigation:e.showLayersNavigation??!0,showSubmitButton:!0,defaultLayer:"Meetings",defaultRange:{start:"2024-01-01",end:"2024-02-29"},layers:[{name:"Meetings",title:"Meetings & Calls",description:"Internal and external meetings",visible:!0,data:{events:[{date:"2024-01-03",title:"Daily Standup",type:"meeting",time:"9:00 AM",description:"Team synchronization meeting with status updates and blockers discussion",color:"#3B82F6"},{date:"2024-01-08",title:"Client Call - TechCorp",type:"meeting",time:"2:00 PM",description:"Quarterly business review with our largest client",color:"#1E40AF"},{date:"2024-01-15",title:"All Hands Meeting",type:"meeting",time:"11:00 AM",description:"Company-wide meeting with Q4 results and Q1 planning",color:"#2563EB"},{date:"2024-01-22",title:"1:1 with Manager",type:"meeting",time:"3:30 PM",description:"Monthly one-on-one performance and career discussion",color:"#3B82F6"}]}},{name:"Deadlines",title:"Deadlines & Milestones",description:"Project deadlines and important milestones",visible:!0,data:{events:[{date:"2024-01-05",title:"Sprint Planning Complete",type:"deadline",time:"5:00 PM",description:"Complete sprint planning for the next two-week iteration",color:"#F59E0B"},{date:"2024-01-19",title:"Feature Freeze",type:"deadline",time:"11:59 PM",description:"No new features after this date for v2.1 release",color:"#D97706"},{date:"2024-02-02",title:"Code Review Deadline",type:"deadline",time:"3:00 PM",description:"All pull requests must be reviewed and approved",color:"#F59E0B"},{date:"2024-02-15",title:"Product Launch",type:"milestone",time:"10:00 AM",description:"Official v2.1 product launch and announcement",color:"#DC2626"}]}},{name:"Learning",title:"Training & Development",description:"Learning opportunities and skill development",visible:!0,data:{events:[{date:"2024-01-10",title:"React Advanced Patterns",type:"training",time:"9:00 AM",description:"Workshop on advanced React patterns including hooks, context, and performance optimization",color:"#059669"},{date:"2024-01-17",title:"Security Best Practices",type:"training",time:"1:00 PM",description:"Cybersecurity awareness training and secure coding practices",color:"#047857"},{date:"2024-01-24",title:"Design System Workshop",type:"training",time:"10:00 AM",description:"Hands-on workshop for implementing our new design system",color:"#059669"},{date:"2024-02-07",title:"Tech Talk: AI/ML Trends",type:"training",time:"4:00 PM",description:"Industry expert presentation on latest AI and machine learning trends",color:"#047857"}]}},{name:"Social",title:"Social & Team Building",description:"Social events and team building activities",visible:!0,data:{events:[{date:"2024-01-12",title:"Team Lunch",type:"social",time:"12:30 PM",description:"Monthly team lunch at the new Italian restaurant downtown",color:"#8B5CF6"},{date:"2024-01-26",title:"Happy Hour",type:"social",time:"5:30 PM",description:"End of sprint celebration at the rooftop bar",color:"#7C3AED"},{date:"2024-02-09",title:"Game Tournament",type:"social",time:"4:00 PM",description:"Office ping pong tournament with prizes for winners",color:"#8B5CF6"},{date:"2024-02-23",title:"Team Outing",type:"social",time:"1:00 PM",description:"Team building escape room followed by dinner",color:"#7C3AED"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,showTooltips:!0,showLayersNavigation:!0},parameters:{docs:{description:{story:"Comprehensive gallery showing different event types: meetings, deadlines, training, and social events. Hover over events to see detailed tooltips."}}}},i={render:e=>r.jsx(t,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||1,showTooltips:e.showTooltips??!0,showLayersNavigation:e.showLayersNavigation??!1,showSubmitButton:!0,defaultLayer:"BusyMonth",defaultRange:{start:"2024-01-01",end:"2024-01-31"},layers:[{name:"BusyMonth",title:"Busy January",description:"High-density month with many events",visible:!0,data:{events:[{date:"2024-01-02",title:"Project Kickoff",type:"meeting",time:"9:00 AM",description:"Q1 project kickoff meeting",color:"#3B82F6"},{date:"2024-01-02",title:"Design Review",type:"review",time:"2:00 PM",description:"UI/UX design review session",color:"#8B5CF6"},{date:"2024-01-03",title:"Daily Standup",type:"meeting",time:"9:15 AM",description:"Team sync meeting",color:"#3B82F6"},{date:"2024-01-03",title:"Code Review",type:"review",time:"3:30 PM",description:"PR review session",color:"#059669"},{date:"2024-01-04",title:"Client Demo",type:"demo",time:"11:00 AM",description:"Product demo for stakeholders",color:"#DC2626"},{date:"2024-01-04",title:"Team Training",type:"training",time:"4:00 PM",description:"New tools workshop",color:"#059669"},{date:"2024-01-05",title:"Sprint Planning",type:"planning",time:"10:00 AM",description:"Plan next sprint work",color:"#F59E0B"},{date:"2024-01-08",title:"Architecture Review",type:"review",time:"9:00 AM",description:"System architecture discussion",color:"#8B5CF6"},{date:"2024-01-08",title:"Customer Feedback",type:"feedback",time:"2:00 PM",description:"Review customer feedback",color:"#DC2626"},{date:"2024-01-09",title:"Performance Review",type:"review",time:"1:00 PM",description:"Application performance analysis",color:"#059669"},{date:"2024-01-10",title:"Security Audit",type:"audit",time:"10:30 AM",description:"Security compliance review",color:"#DC2626"},{date:"2024-01-10",title:"Team Lunch",type:"social",time:"12:30 PM",description:"Team building lunch",color:"#8B5CF6"},{date:"2024-01-11",title:"Bug Triage",type:"triage",time:"3:00 PM",description:"Weekly bug review and prioritization",color:"#F59E0B"},{date:"2024-01-12",title:"Documentation Day",type:"docs",time:"9:00 AM",description:"Update project documentation",color:"#059669"},{date:"2024-01-15",title:"Release Candidate",type:"milestone",time:"12:00 PM",description:"RC build deployment",color:"#DC2626"},{date:"2024-01-16",title:"QA Testing",type:"testing",time:"9:00 AM",description:"Quality assurance testing",color:"#F59E0B"},{date:"2024-01-17",title:"Load Testing",type:"testing",time:"10:00 AM",description:"Performance load testing",color:"#F59E0B"},{date:"2024-01-18",title:"User Acceptance",type:"testing",time:"2:00 PM",description:"UAT with business users",color:"#8B5CF6"},{date:"2024-01-19",title:"Go/No-Go Meeting",type:"decision",time:"4:00 PM",description:"Release decision meeting",color:"#DC2626"},{date:"2024-01-22",title:"Production Deploy",type:"deployment",time:"11:00 PM",description:"Production deployment",color:"#DC2626"},{date:"2024-01-23",title:"Monitoring Setup",type:"ops",time:"8:00 AM",description:"Post-deploy monitoring",color:"#059669"},{date:"2024-01-24",title:"Retrospective",type:"retrospective",time:"3:00 PM",description:"Sprint retrospective meeting",color:"#8B5CF6"},{date:"2024-01-25",title:"Next Sprint Planning",type:"planning",time:"10:00 AM",description:"Plan next iteration",color:"#F59E0B"},{date:"2024-01-26",title:"Team Celebration",type:"social",time:"5:00 PM",description:"Celebrate successful release",color:"#8B5CF6"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:1,showTooltips:!0,showLayersNavigation:!1},parameters:{docs:{description:{story:"Dense calendar showing a busy month with multiple events per day. Tests event rendering and tooltip performance."}}}},o={render:e=>r.jsx(t,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,showTooltips:e.showTooltips??!0,showLayersNavigation:e.showLayersNavigation??!0,showSubmitButton:!0,defaultLayer:"Daily",defaultRange:{start:"2024-01-01",end:"2024-02-29"},layers:[{name:"Daily",title:"Daily Recurring",description:"Events that happen every day",visible:!0,data:{events:[{date:"2024-01-02",title:"Daily Standup",type:"meeting",time:"9:00 AM",description:"Daily team synchronization",color:"#3B82F6"},{date:"2024-01-03",title:"Daily Standup",type:"meeting",time:"9:00 AM",description:"Daily team synchronization",color:"#3B82F6"},{date:"2024-01-04",title:"Daily Standup",type:"meeting",time:"9:00 AM",description:"Daily team synchronization",color:"#3B82F6"},{date:"2024-01-05",title:"Daily Standup",type:"meeting",time:"9:00 AM",description:"Daily team synchronization",color:"#3B82F6"},{date:"2024-01-08",title:"Daily Standup",type:"meeting",time:"9:00 AM",description:"Daily team synchronization",color:"#3B82F6"},{date:"2024-01-09",title:"Daily Standup",type:"meeting",time:"9:00 AM",description:"Daily team synchronization",color:"#3B82F6"},{date:"2024-01-10",title:"Daily Standup",type:"meeting",time:"9:00 AM",description:"Daily team synchronization",color:"#3B82F6"}]}},{name:"Weekly",title:"Weekly Recurring",description:"Events that happen every week",visible:!0,data:{events:[{date:"2024-01-05",title:"Weekly Review",type:"review",time:"4:00 PM",description:"Weekly progress review and planning",color:"#059669"},{date:"2024-01-12",title:"Weekly Review",type:"review",time:"4:00 PM",description:"Weekly progress review and planning",color:"#059669"},{date:"2024-01-19",title:"Weekly Review",type:"review",time:"4:00 PM",description:"Weekly progress review and planning",color:"#059669"},{date:"2024-01-26",title:"Weekly Review",type:"review",time:"4:00 PM",description:"Weekly progress review and planning",color:"#059669"},{date:"2024-02-02",title:"Weekly Review",type:"review",time:"4:00 PM",description:"Weekly progress review and planning",color:"#059669"},{date:"2024-01-02",title:"1:1 with Manager",type:"meeting",time:"2:00 PM",description:"Weekly one-on-one meeting",color:"#8B5CF6"},{date:"2024-01-09",title:"1:1 with Manager",type:"meeting",time:"2:00 PM",description:"Weekly one-on-one meeting",color:"#8B5CF6"},{date:"2024-01-16",title:"1:1 with Manager",type:"meeting",time:"2:00 PM",description:"Weekly one-on-one meeting",color:"#8B5CF6"},{date:"2024-01-23",title:"1:1 with Manager",type:"meeting",time:"2:00 PM",description:"Weekly one-on-one meeting",color:"#8B5CF6"},{date:"2024-01-30",title:"1:1 with Manager",type:"meeting",time:"2:00 PM",description:"Weekly one-on-one meeting",color:"#8B5CF6"}]}},{name:"Monthly",title:"Monthly Recurring",description:"Events that happen monthly",visible:!0,data:{events:[{date:"2024-01-15",title:"All Hands Meeting",type:"meeting",time:"11:00 AM",description:"Monthly company-wide meeting",color:"#DC2626"},{date:"2024-02-15",title:"All Hands Meeting",type:"meeting",time:"11:00 AM",description:"Monthly company-wide meeting",color:"#DC2626"},{date:"2024-01-31",title:"Monthly Retrospective",type:"retrospective",time:"3:00 PM",description:"Monthly team retrospective",color:"#F59E0B"},{date:"2024-02-29",title:"Monthly Retrospective",type:"retrospective",time:"3:00 PM",description:"Monthly team retrospective",color:"#F59E0B"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,showTooltips:!0,showLayersNavigation:!0},parameters:{docs:{description:{story:"Simulates recurring event patterns: daily standups, weekly reviews and 1:1s, and monthly meetings."}}}},a={render:e=>r.jsx(t,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||1,showTooltips:e.showTooltips??!0,showLayersNavigation:e.showLayersNavigation??!1,showSubmitButton:!0,defaultLayer:"DetailedEvents",defaultRange:{start:"2024-01-01",end:"2024-01-31"},layers:[{name:"DetailedEvents",title:"Events with Rich Details",description:"Events with comprehensive information for tooltips",visible:!0,data:{events:[{date:"2024-01-05",title:"Product Strategy Meeting",type:"meeting",time:"10:00 AM - 12:00 PM",description:"Comprehensive product strategy session covering Q1 roadmap, competitive analysis, user feedback review, and feature prioritization. Attendees include product managers, engineering leads, and design team. Location: Conference Room A. Pre-reading materials were sent on January 2nd.",color:"#3B82F6"},{date:"2024-01-10",title:"Technical Architecture Review",type:"review",time:"2:00 PM - 4:00 PM",description:"Deep dive into the proposed microservices architecture for the new user management system. Review includes performance implications, security considerations, database design, API contracts, and deployment strategies. Technical leads from each team will present their domain-specific requirements.",color:"#059669"},{date:"2024-01-15",title:"Customer Advisory Board",type:"external",time:"9:00 AM - 5:00 PM",description:"Quarterly customer advisory board meeting with our top 10 enterprise clients. Agenda includes product roadmap presentation, feature request prioritization, customer success stories, and networking lunch. Key customers: TechCorp, InnovateLabs, GlobalSoft, and others. Virtual attendance option available.",color:"#DC2626"},{date:"2024-01-20",title:"Security Compliance Audit",type:"audit",time:"9:00 AM - 6:00 PM",description:"Annual SOC 2 Type II compliance audit conducted by external auditors. Full day assessment covering data security, availability, processing integrity, confidentiality, and privacy. All engineering and IT staff must be available for interviews. Documentation review starts at 9 AM.",color:"#F59E0B"},{date:"2024-01-25",title:"Team Building Workshop",type:"social",time:"1:00 PM - 5:00 PM",description:"Facilitated team building workshop focusing on communication styles, conflict resolution, and collaborative problem-solving. Professional facilitator will guide activities including personality assessments, group challenges, and action planning. Followed by team dinner at 6 PM.",color:"#8B5CF6"},{date:"2024-01-30",title:"Board of Directors Meeting",type:"executive",time:"8:00 AM - 12:00 PM",description:"Quarterly board meeting with executive presentations on financial performance, strategic initiatives, market analysis, and operational updates. CEO, CFO, CTO, and VP Sales will present. Board package distributed 48 hours prior. Executive session follows main meeting.",color:"#7C2D12"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:1,showTooltips:!0,showLayersNavigation:!1},parameters:{docs:{description:{story:"Events with comprehensive descriptions that showcase rich tooltip content. Hover over events to see detailed information."}}}};var s,l,d;n.parameters={...n.parameters,docs:{...(s=n.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    showTooltips: args.showTooltips ?? true,
    showLayersNavigation: args.showLayersNavigation ?? true,
    showSubmitButton: true,
    defaultLayer: 'Meetings',
    defaultRange: {
      start: '2024-01-01',
      end: '2024-02-29'
    },
    layers: [{
      name: 'Meetings',
      title: 'Meetings & Calls',
      description: 'Internal and external meetings',
      visible: true,
      data: {
        events: [{
          date: '2024-01-03',
          title: 'Daily Standup',
          type: 'meeting',
          time: '9:00 AM',
          description: 'Team synchronization meeting with status updates and blockers discussion',
          color: '#3B82F6'
        }, {
          date: '2024-01-08',
          title: 'Client Call - TechCorp',
          type: 'meeting',
          time: '2:00 PM',
          description: 'Quarterly business review with our largest client',
          color: '#1E40AF'
        }, {
          date: '2024-01-15',
          title: 'All Hands Meeting',
          type: 'meeting',
          time: '11:00 AM',
          description: 'Company-wide meeting with Q4 results and Q1 planning',
          color: '#2563EB'
        }, {
          date: '2024-01-22',
          title: '1:1 with Manager',
          type: 'meeting',
          time: '3:30 PM',
          description: 'Monthly one-on-one performance and career discussion',
          color: '#3B82F6'
        }]
      }
    }, {
      name: 'Deadlines',
      title: 'Deadlines & Milestones',
      description: 'Project deadlines and important milestones',
      visible: true,
      data: {
        events: [{
          date: '2024-01-05',
          title: 'Sprint Planning Complete',
          type: 'deadline',
          time: '5:00 PM',
          description: 'Complete sprint planning for the next two-week iteration',
          color: '#F59E0B'
        }, {
          date: '2024-01-19',
          title: 'Feature Freeze',
          type: 'deadline',
          time: '11:59 PM',
          description: 'No new features after this date for v2.1 release',
          color: '#D97706'
        }, {
          date: '2024-02-02',
          title: 'Code Review Deadline',
          type: 'deadline',
          time: '3:00 PM',
          description: 'All pull requests must be reviewed and approved',
          color: '#F59E0B'
        }, {
          date: '2024-02-15',
          title: 'Product Launch',
          type: 'milestone',
          time: '10:00 AM',
          description: 'Official v2.1 product launch and announcement',
          color: '#DC2626'
        }]
      }
    }, {
      name: 'Learning',
      title: 'Training & Development',
      description: 'Learning opportunities and skill development',
      visible: true,
      data: {
        events: [{
          date: '2024-01-10',
          title: 'React Advanced Patterns',
          type: 'training',
          time: '9:00 AM',
          description: 'Workshop on advanced React patterns including hooks, context, and performance optimization',
          color: '#059669'
        }, {
          date: '2024-01-17',
          title: 'Security Best Practices',
          type: 'training',
          time: '1:00 PM',
          description: 'Cybersecurity awareness training and secure coding practices',
          color: '#047857'
        }, {
          date: '2024-01-24',
          title: 'Design System Workshop',
          type: 'training',
          time: '10:00 AM',
          description: 'Hands-on workshop for implementing our new design system',
          color: '#059669'
        }, {
          date: '2024-02-07',
          title: 'Tech Talk: AI/ML Trends',
          type: 'training',
          time: '4:00 PM',
          description: 'Industry expert presentation on latest AI and machine learning trends',
          color: '#047857'
        }]
      }
    }, {
      name: 'Social',
      title: 'Social & Team Building',
      description: 'Social events and team building activities',
      visible: true,
      data: {
        events: [{
          date: '2024-01-12',
          title: 'Team Lunch',
          type: 'social',
          time: '12:30 PM',
          description: 'Monthly team lunch at the new Italian restaurant downtown',
          color: '#8B5CF6'
        }, {
          date: '2024-01-26',
          title: 'Happy Hour',
          type: 'social',
          time: '5:30 PM',
          description: 'End of sprint celebration at the rooftop bar',
          color: '#7C3AED'
        }, {
          date: '2024-02-09',
          title: 'Game Tournament',
          type: 'social',
          time: '4:00 PM',
          description: 'Office ping pong tournament with prizes for winners',
          color: '#8B5CF6'
        }, {
          date: '2024-02-23',
          title: 'Team Outing',
          type: 'social',
          time: '1:00 PM',
          description: 'Team building escape room followed by dinner',
          color: '#7C3AED'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    showTooltips: true,
    showLayersNavigation: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive gallery showing different event types: meetings, deadlines, training, and social events. Hover over events to see detailed tooltips.'
      }
    }
  }
}`,...(d=(l=n.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var p,c,m;i.parameters={...i.parameters,docs:{...(p=i.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 1,
    showTooltips: args.showTooltips ?? true,
    showLayersNavigation: args.showLayersNavigation ?? false,
    showSubmitButton: true,
    defaultLayer: 'BusyMonth',
    defaultRange: {
      start: '2024-01-01',
      end: '2024-01-31'
    },
    layers: [{
      name: 'BusyMonth',
      title: 'Busy January',
      description: 'High-density month with many events',
      visible: true,
      data: {
        events: [
        // Week 1
        {
          date: '2024-01-02',
          title: 'Project Kickoff',
          type: 'meeting',
          time: '9:00 AM',
          description: 'Q1 project kickoff meeting',
          color: '#3B82F6'
        }, {
          date: '2024-01-02',
          title: 'Design Review',
          type: 'review',
          time: '2:00 PM',
          description: 'UI/UX design review session',
          color: '#8B5CF6'
        }, {
          date: '2024-01-03',
          title: 'Daily Standup',
          type: 'meeting',
          time: '9:15 AM',
          description: 'Team sync meeting',
          color: '#3B82F6'
        }, {
          date: '2024-01-03',
          title: 'Code Review',
          type: 'review',
          time: '3:30 PM',
          description: 'PR review session',
          color: '#059669'
        }, {
          date: '2024-01-04',
          title: 'Client Demo',
          type: 'demo',
          time: '11:00 AM',
          description: 'Product demo for stakeholders',
          color: '#DC2626'
        }, {
          date: '2024-01-04',
          title: 'Team Training',
          type: 'training',
          time: '4:00 PM',
          description: 'New tools workshop',
          color: '#059669'
        }, {
          date: '2024-01-05',
          title: 'Sprint Planning',
          type: 'planning',
          time: '10:00 AM',
          description: 'Plan next sprint work',
          color: '#F59E0B'
        },
        // Week 2
        {
          date: '2024-01-08',
          title: 'Architecture Review',
          type: 'review',
          time: '9:00 AM',
          description: 'System architecture discussion',
          color: '#8B5CF6'
        }, {
          date: '2024-01-08',
          title: 'Customer Feedback',
          type: 'feedback',
          time: '2:00 PM',
          description: 'Review customer feedback',
          color: '#DC2626'
        }, {
          date: '2024-01-09',
          title: 'Performance Review',
          type: 'review',
          time: '1:00 PM',
          description: 'Application performance analysis',
          color: '#059669'
        }, {
          date: '2024-01-10',
          title: 'Security Audit',
          type: 'audit',
          time: '10:30 AM',
          description: 'Security compliance review',
          color: '#DC2626'
        }, {
          date: '2024-01-10',
          title: 'Team Lunch',
          type: 'social',
          time: '12:30 PM',
          description: 'Team building lunch',
          color: '#8B5CF6'
        }, {
          date: '2024-01-11',
          title: 'Bug Triage',
          type: 'triage',
          time: '3:00 PM',
          description: 'Weekly bug review and prioritization',
          color: '#F59E0B'
        }, {
          date: '2024-01-12',
          title: 'Documentation Day',
          type: 'docs',
          time: '9:00 AM',
          description: 'Update project documentation',
          color: '#059669'
        },
        // Week 3
        {
          date: '2024-01-15',
          title: 'Release Candidate',
          type: 'milestone',
          time: '12:00 PM',
          description: 'RC build deployment',
          color: '#DC2626'
        }, {
          date: '2024-01-16',
          title: 'QA Testing',
          type: 'testing',
          time: '9:00 AM',
          description: 'Quality assurance testing',
          color: '#F59E0B'
        }, {
          date: '2024-01-17',
          title: 'Load Testing',
          type: 'testing',
          time: '10:00 AM',
          description: 'Performance load testing',
          color: '#F59E0B'
        }, {
          date: '2024-01-18',
          title: 'User Acceptance',
          type: 'testing',
          time: '2:00 PM',
          description: 'UAT with business users',
          color: '#8B5CF6'
        }, {
          date: '2024-01-19',
          title: 'Go/No-Go Meeting',
          type: 'decision',
          time: '4:00 PM',
          description: 'Release decision meeting',
          color: '#DC2626'
        },
        // Week 4
        {
          date: '2024-01-22',
          title: 'Production Deploy',
          type: 'deployment',
          time: '11:00 PM',
          description: 'Production deployment',
          color: '#DC2626'
        }, {
          date: '2024-01-23',
          title: 'Monitoring Setup',
          type: 'ops',
          time: '8:00 AM',
          description: 'Post-deploy monitoring',
          color: '#059669'
        }, {
          date: '2024-01-24',
          title: 'Retrospective',
          type: 'retrospective',
          time: '3:00 PM',
          description: 'Sprint retrospective meeting',
          color: '#8B5CF6'
        }, {
          date: '2024-01-25',
          title: 'Next Sprint Planning',
          type: 'planning',
          time: '10:00 AM',
          description: 'Plan next iteration',
          color: '#F59E0B'
        }, {
          date: '2024-01-26',
          title: 'Team Celebration',
          type: 'social',
          time: '5:00 PM',
          description: 'Celebrate successful release',
          color: '#8B5CF6'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 1,
    showTooltips: true,
    showLayersNavigation: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Dense calendar showing a busy month with multiple events per day. Tests event rendering and tooltip performance.'
      }
    }
  }
}`,...(m=(c=i.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var y,u,g;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    showTooltips: args.showTooltips ?? true,
    showLayersNavigation: args.showLayersNavigation ?? true,
    showSubmitButton: true,
    defaultLayer: 'Daily',
    defaultRange: {
      start: '2024-01-01',
      end: '2024-02-29'
    },
    layers: [{
      name: 'Daily',
      title: 'Daily Recurring',
      description: 'Events that happen every day',
      visible: true,
      data: {
        events: [
        // Daily standups for January
        {
          date: '2024-01-02',
          title: 'Daily Standup',
          type: 'meeting',
          time: '9:00 AM',
          description: 'Daily team synchronization',
          color: '#3B82F6'
        }, {
          date: '2024-01-03',
          title: 'Daily Standup',
          type: 'meeting',
          time: '9:00 AM',
          description: 'Daily team synchronization',
          color: '#3B82F6'
        }, {
          date: '2024-01-04',
          title: 'Daily Standup',
          type: 'meeting',
          time: '9:00 AM',
          description: 'Daily team synchronization',
          color: '#3B82F6'
        }, {
          date: '2024-01-05',
          title: 'Daily Standup',
          type: 'meeting',
          time: '9:00 AM',
          description: 'Daily team synchronization',
          color: '#3B82F6'
        }, {
          date: '2024-01-08',
          title: 'Daily Standup',
          type: 'meeting',
          time: '9:00 AM',
          description: 'Daily team synchronization',
          color: '#3B82F6'
        }, {
          date: '2024-01-09',
          title: 'Daily Standup',
          type: 'meeting',
          time: '9:00 AM',
          description: 'Daily team synchronization',
          color: '#3B82F6'
        }, {
          date: '2024-01-10',
          title: 'Daily Standup',
          type: 'meeting',
          time: '9:00 AM',
          description: 'Daily team synchronization',
          color: '#3B82F6'
        }]
      }
    }, {
      name: 'Weekly',
      title: 'Weekly Recurring',
      description: 'Events that happen every week',
      visible: true,
      data: {
        events: [
        // Weekly reviews every Friday
        {
          date: '2024-01-05',
          title: 'Weekly Review',
          type: 'review',
          time: '4:00 PM',
          description: 'Weekly progress review and planning',
          color: '#059669'
        }, {
          date: '2024-01-12',
          title: 'Weekly Review',
          type: 'review',
          time: '4:00 PM',
          description: 'Weekly progress review and planning',
          color: '#059669'
        }, {
          date: '2024-01-19',
          title: 'Weekly Review',
          type: 'review',
          time: '4:00 PM',
          description: 'Weekly progress review and planning',
          color: '#059669'
        }, {
          date: '2024-01-26',
          title: 'Weekly Review',
          type: 'review',
          time: '4:00 PM',
          description: 'Weekly progress review and planning',
          color: '#059669'
        }, {
          date: '2024-02-02',
          title: 'Weekly Review',
          type: 'review',
          time: '4:00 PM',
          description: 'Weekly progress review and planning',
          color: '#059669'
        },
        // Weekly 1:1s every Tuesday
        {
          date: '2024-01-02',
          title: '1:1 with Manager',
          type: 'meeting',
          time: '2:00 PM',
          description: 'Weekly one-on-one meeting',
          color: '#8B5CF6'
        }, {
          date: '2024-01-09',
          title: '1:1 with Manager',
          type: 'meeting',
          time: '2:00 PM',
          description: 'Weekly one-on-one meeting',
          color: '#8B5CF6'
        }, {
          date: '2024-01-16',
          title: '1:1 with Manager',
          type: 'meeting',
          time: '2:00 PM',
          description: 'Weekly one-on-one meeting',
          color: '#8B5CF6'
        }, {
          date: '2024-01-23',
          title: '1:1 with Manager',
          type: 'meeting',
          time: '2:00 PM',
          description: 'Weekly one-on-one meeting',
          color: '#8B5CF6'
        }, {
          date: '2024-01-30',
          title: '1:1 with Manager',
          type: 'meeting',
          time: '2:00 PM',
          description: 'Weekly one-on-one meeting',
          color: '#8B5CF6'
        }]
      }
    }, {
      name: 'Monthly',
      title: 'Monthly Recurring',
      description: 'Events that happen monthly',
      visible: true,
      data: {
        events: [{
          date: '2024-01-15',
          title: 'All Hands Meeting',
          type: 'meeting',
          time: '11:00 AM',
          description: 'Monthly company-wide meeting',
          color: '#DC2626'
        }, {
          date: '2024-02-15',
          title: 'All Hands Meeting',
          type: 'meeting',
          time: '11:00 AM',
          description: 'Monthly company-wide meeting',
          color: '#DC2626'
        }, {
          date: '2024-01-31',
          title: 'Monthly Retrospective',
          type: 'retrospective',
          time: '3:00 PM',
          description: 'Monthly team retrospective',
          color: '#F59E0B'
        }, {
          date: '2024-02-29',
          title: 'Monthly Retrospective',
          type: 'retrospective',
          time: '3:00 PM',
          description: 'Monthly team retrospective',
          color: '#F59E0B'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    showTooltips: true,
    showLayersNavigation: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates recurring event patterns: daily standups, weekly reviews and 1:1s, and monthly meetings.'
      }
    }
  }
}`,...(g=(u=o.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var v,h,M;a.parameters={...a.parameters,docs:{...(v=a.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 1,
    showTooltips: args.showTooltips ?? true,
    showLayersNavigation: args.showLayersNavigation ?? false,
    showSubmitButton: true,
    defaultLayer: 'DetailedEvents',
    defaultRange: {
      start: '2024-01-01',
      end: '2024-01-31'
    },
    layers: [{
      name: 'DetailedEvents',
      title: 'Events with Rich Details',
      description: 'Events with comprehensive information for tooltips',
      visible: true,
      data: {
        events: [{
          date: '2024-01-05',
          title: 'Product Strategy Meeting',
          type: 'meeting',
          time: '10:00 AM - 12:00 PM',
          description: 'Comprehensive product strategy session covering Q1 roadmap, competitive analysis, user feedback review, and feature prioritization. Attendees include product managers, engineering leads, and design team. Location: Conference Room A. Pre-reading materials were sent on January 2nd.',
          color: '#3B82F6'
        }, {
          date: '2024-01-10',
          title: 'Technical Architecture Review',
          type: 'review',
          time: '2:00 PM - 4:00 PM',
          description: 'Deep dive into the proposed microservices architecture for the new user management system. Review includes performance implications, security considerations, database design, API contracts, and deployment strategies. Technical leads from each team will present their domain-specific requirements.',
          color: '#059669'
        }, {
          date: '2024-01-15',
          title: 'Customer Advisory Board',
          type: 'external',
          time: '9:00 AM - 5:00 PM',
          description: 'Quarterly customer advisory board meeting with our top 10 enterprise clients. Agenda includes product roadmap presentation, feature request prioritization, customer success stories, and networking lunch. Key customers: TechCorp, InnovateLabs, GlobalSoft, and others. Virtual attendance option available.',
          color: '#DC2626'
        }, {
          date: '2024-01-20',
          title: 'Security Compliance Audit',
          type: 'audit',
          time: '9:00 AM - 6:00 PM',
          description: 'Annual SOC 2 Type II compliance audit conducted by external auditors. Full day assessment covering data security, availability, processing integrity, confidentiality, and privacy. All engineering and IT staff must be available for interviews. Documentation review starts at 9 AM.',
          color: '#F59E0B'
        }, {
          date: '2024-01-25',
          title: 'Team Building Workshop',
          type: 'social',
          time: '1:00 PM - 5:00 PM',
          description: 'Facilitated team building workshop focusing on communication styles, conflict resolution, and collaborative problem-solving. Professional facilitator will guide activities including personality assessments, group challenges, and action planning. Followed by team dinner at 6 PM.',
          color: '#8B5CF6'
        }, {
          date: '2024-01-30',
          title: 'Board of Directors Meeting',
          type: 'executive',
          time: '8:00 AM - 12:00 PM',
          description: 'Quarterly board meeting with executive presentations on financial performance, strategic initiatives, market analysis, and operational updates. CEO, CFO, CTO, and VP Sales will present. Board package distributed 48 hours prior. Executive session follows main meeting.',
          color: '#7C2D12'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 1,
    showTooltips: true,
    showLayersNavigation: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Events with comprehensive descriptions that showcase rich tooltip content. Hover over events to see detailed information.'
      }
    }
  }
}`,...(M=(h=a.parameters)==null?void 0:h.docs)==null?void 0:M.source}}};const D=["EventTypesGallery","DenseEventCalendar","RecurringPatterns","RichEventTooltips"];export{i as DenseEventCalendar,n as EventTypesGallery,o as RecurringPatterns,a as RichEventTooltips,D as __namedExportsOrder,A as default};
