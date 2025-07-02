import{C as n,j as s}from"./CLACalendar-552bce46.js";import"./index-8a57d176.js";import"./_commonjsHelpers-725317a4.js";import"./index-6700e26c.js";/* empty css                           */const F={title:"Calendar/Layers & Navigation",component:n,parameters:{layout:"padded",docs:{description:{component:"Examples showcasing layer management, navigation, and background colors with visible layer tabs."}}},argTypes:{displayMode:{control:{type:"select"},options:["embedded","popup"],description:"How the calendar should be displayed"},isOpen:{control:"boolean",description:"Whether the calendar is open (for popup mode)"},visibleMonths:{control:{type:"range",min:1,max:6},description:"Number of months to display"},showLayersNavigation:{control:"boolean",description:"Show layer navigation tabs"}}},t={render:e=>s.jsx(n,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,showLayersNavigation:e.showLayersNavigation??!0,showSubmitButton:!0,defaultLayer:"Events",defaultRange:{start:"2024-01-01",end:"2024-01-03"},layers:[{name:"Events",title:"Team Events",description:"Company meetings and events",visible:!0,data:{events:[{date:"2024-01-08",title:"All Hands Meeting",type:"meeting",time:"10:00 AM",description:"Monthly company meeting",color:"#3B82F6"},{date:"2024-01-15",title:"Team Lunch",type:"social",time:"12:00 PM",description:"Team building lunch",color:"#10B981"}]}},{name:"Holidays",title:"Holidays",description:"Company holidays and time off",visible:!0,data:{events:[{date:"2024-01-01",title:"New Year's Day",type:"holiday",time:"All Day",description:"Public holiday",color:"#EF4444"},{date:"2024-01-15",title:"MLK Day",type:"holiday",time:"All Day",description:"Martin Luther King Jr. Day",color:"#EF4444"}]}},{name:"Deadlines",title:"Project Deadlines",description:"Important project milestones",visible:!0,data:{events:[{date:"2024-01-20",title:"Sprint Review",type:"deadline",time:"3:00 PM",description:"End of sprint demonstration",color:"#F59E0B"},{date:"2024-01-30",title:"Q1 Planning",type:"deadline",time:"2:00 PM",description:"Quarterly planning session",color:"#F59E0B"}]}},{name:"Personal",title:"Personal Events",description:"Personal appointments and reminders",visible:!1,data:{events:[{date:"2024-01-12",title:"Doctor Appointment",type:"personal",time:"2:30 PM",description:"Annual checkup",color:"#8B5CF6"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,showLayersNavigation:!0}},i={render:e=>s.jsx(n,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,showLayersNavigation:e.showLayersNavigation??!0,showSubmitButton:!0,defaultLayer:"Vacations",defaultRange:{start:"2024-01-01",end:"2024-01-03"},layers:[{name:"Vacations",title:"Team Vacations",description:"Planned time off periods",visible:!0,data:{background:[{startDate:"2024-01-15",endDate:"2024-01-19",color:"#FEF3C7"},{startDate:"2024-02-05",endDate:"2024-02-09",color:"#DBEAFE"}],events:[{date:"2024-01-15",title:"John - Vacation Start",type:"vacation",time:"All Day",description:"Winter vacation",color:"#F59E0B"}]}},{name:"BusyPeriods",title:"Busy Periods",description:"High-intensity work periods",visible:!0,data:{background:[{startDate:"2024-01-22",endDate:"2024-01-26",color:"#FEE2E2"},{startDate:"2024-02-12",endDate:"2024-02-16",color:"#FCE7F3"}],events:[{date:"2024-01-22",title:"Crunch Week",type:"busy",time:"All Week",description:"Release preparation",color:"#DC2626"}]}},{name:"Conferences",title:"Conference Season",description:"Industry conferences and events",visible:!0,data:{background:[{startDate:"2024-02-20",endDate:"2024-02-23",color:"#F3E8FF"}],events:[{date:"2024-02-20",title:"Tech Conference 2024",type:"conference",time:"9:00 AM",description:"Annual technology summit",color:"#7C3AED"},{date:"2024-02-22",title:"Keynote Speech",type:"conference",time:"11:00 AM",description:"CEO keynote presentation",color:"#7C3AED"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,showLayersNavigation:!0}},a={render:e=>s.jsx(n,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,showLayersNavigation:e.showLayersNavigation??!0,showSubmitButton:!0,defaultLayer:"WorkSchedule",defaultRange:{start:"2024-02-01",end:"2024-02-03"},layers:[{name:"WorkSchedule",title:"Work Schedule",description:"Regular work patterns and special periods",visible:!0,data:{background:[{startDate:"2024-01-01",endDate:"2024-01-05",color:"#F0FDF4"},{startDate:"2024-01-08",endDate:"2024-01-12",color:"#F0FDF4"},{startDate:"2024-01-29",endDate:"2024-02-02",color:"#FEF3C7"}],events:[{date:"2024-01-03",title:"Team Standup",type:"meeting",time:"9:00 AM",description:"Daily team synchronization",color:"#059669"},{date:"2024-01-10",title:"Sprint Planning",type:"meeting",time:"10:00 AM",description:"Plan next sprint work",color:"#059669"}]}},{name:"ClientMeetings",title:"Client Meetings",description:"External client interactions",visible:!0,data:{events:[{date:"2024-01-09",title:"Client Demo - TechCorp",type:"client",time:"2:00 PM",description:"Product demonstration",color:"#2563EB"},{date:"2024-01-16",title:"Requirements Review",type:"client",time:"11:00 AM",description:"Review new feature requirements",color:"#2563EB"},{date:"2024-02-06",title:"Contract Renewal",type:"client",time:"3:00 PM",description:"Annual contract discussion",color:"#2563EB"}]}},{name:"Maintenance",title:"System Maintenance",description:"Scheduled maintenance windows",visible:!0,data:{background:[{startDate:"2024-01-27",endDate:"2024-01-28",color:"#FEE2E2"}],events:[{date:"2024-01-27",title:"Database Maintenance",type:"maintenance",time:"11:00 PM",description:"Scheduled database updates",color:"#DC2626"},{date:"2024-02-10",title:"Server Updates",type:"maintenance",time:"12:00 AM",description:"Monthly server patches",color:"#DC2626"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,showLayersNavigation:!0}},o={render:e=>s.jsx(n,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||1,showLayersNavigation:e.showLayersNavigation??!0,showSubmitButton:!0,defaultLayer:"AlwaysVisible",defaultRange:{start:"2024-01-01",end:"2024-01-03"},layers:[{name:"AlwaysVisible",title:"Core Events",description:"Essential events that are always shown",visible:!0,required:!0,data:{events:[{date:"2024-01-05",title:"Important Deadline",type:"deadline",time:"5:00 PM",description:"Critical project milestone",color:"#DC2626"}]}},{name:"Optional1",title:"Team Events",description:"Team-related activities (toggle me!)",visible:!0,data:{background:[{startDate:"2024-01-08",endDate:"2024-01-12",color:"#DBEAFE"}],events:[{date:"2024-01-10",title:"Team Building",type:"team",time:"2:00 PM",description:"Quarterly team building activity",color:"#3B82F6"}]}},{name:"Optional2",title:"Social Events",description:"Social and informal events (toggle me!)",visible:!1,data:{background:[{startDate:"2024-01-15",endDate:"2024-01-19",color:"#F3E8FF"}],events:[{date:"2024-01-17",title:"Happy Hour",type:"social",time:"5:30 PM",description:"Monthly team social event",color:"#8B5CF6"}]}},{name:"Optional3",title:"Training",description:"Learning and development (toggle me!)",visible:!1,data:{events:[{date:"2024-01-22",title:"React Workshop",type:"training",time:"9:00 AM",description:"Advanced React patterns workshop",color:"#059669"},{date:"2024-01-29",title:"Security Training",type:"training",time:"1:00 PM",description:"Cybersecurity awareness session",color:"#059669"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:1,showLayersNavigation:!0},parameters:{docs:{description:{story:"Demonstrates layer visibility controls. Toggle different layers on/off using the layer navigation tabs."}}}};var r,l,d;t.parameters={...t.parameters,docs:{...(r=t.parameters)==null?void 0:r.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    showLayersNavigation: args.showLayersNavigation ?? true,
    showSubmitButton: true,
    defaultLayer: 'Events',
    defaultRange: {
      start: '2024-01-01',
      end: '2024-01-03'
    },
    layers: [{
      name: 'Events',
      title: 'Team Events',
      description: 'Company meetings and events',
      visible: true,
      data: {
        events: [{
          date: '2024-01-08',
          title: 'All Hands Meeting',
          type: 'meeting',
          time: '10:00 AM',
          description: 'Monthly company meeting',
          color: '#3B82F6'
        }, {
          date: '2024-01-15',
          title: 'Team Lunch',
          type: 'social',
          time: '12:00 PM',
          description: 'Team building lunch',
          color: '#10B981'
        }]
      }
    }, {
      name: 'Holidays',
      title: 'Holidays',
      description: 'Company holidays and time off',
      visible: true,
      data: {
        events: [{
          date: '2024-01-01',
          title: 'New Year\\'s Day',
          type: 'holiday',
          time: 'All Day',
          description: 'Public holiday',
          color: '#EF4444'
        }, {
          date: '2024-01-15',
          title: 'MLK Day',
          type: 'holiday',
          time: 'All Day',
          description: 'Martin Luther King Jr. Day',
          color: '#EF4444'
        }]
      }
    }, {
      name: 'Deadlines',
      title: 'Project Deadlines',
      description: 'Important project milestones',
      visible: true,
      data: {
        events: [{
          date: '2024-01-20',
          title: 'Sprint Review',
          type: 'deadline',
          time: '3:00 PM',
          description: 'End of sprint demonstration',
          color: '#F59E0B'
        }, {
          date: '2024-01-30',
          title: 'Q1 Planning',
          type: 'deadline',
          time: '2:00 PM',
          description: 'Quarterly planning session',
          color: '#F59E0B'
        }]
      }
    }, {
      name: 'Personal',
      title: 'Personal Events',
      description: 'Personal appointments and reminders',
      visible: false,
      // Start hidden to demonstrate layer toggle
      data: {
        events: [{
          date: '2024-01-12',
          title: 'Doctor Appointment',
          type: 'personal',
          time: '2:30 PM',
          description: 'Annual checkup',
          color: '#8B5CF6'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    showLayersNavigation: true
  }
}`,...(d=(l=t.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var p,c,u;i.parameters={...i.parameters,docs:{...(p=i.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    showLayersNavigation: args.showLayersNavigation ?? true,
    showSubmitButton: true,
    defaultLayer: 'Vacations',
    defaultRange: {
      start: '2024-01-01',
      end: '2024-01-03'
    },
    layers: [{
      name: 'Vacations',
      title: 'Team Vacations',
      description: 'Planned time off periods',
      visible: true,
      data: {
        background: [{
          startDate: '2024-01-15',
          endDate: '2024-01-19',
          color: '#FEF3C7' // Light yellow
        }, {
          startDate: '2024-02-05',
          endDate: '2024-02-09',
          color: '#DBEAFE' // Light blue
        }],
        events: [{
          date: '2024-01-15',
          title: 'John - Vacation Start',
          type: 'vacation',
          time: 'All Day',
          description: 'Winter vacation',
          color: '#F59E0B'
        }]
      }
    }, {
      name: 'BusyPeriods',
      title: 'Busy Periods',
      description: 'High-intensity work periods',
      visible: true,
      data: {
        background: [{
          startDate: '2024-01-22',
          endDate: '2024-01-26',
          color: '#FEE2E2' // Light red
        }, {
          startDate: '2024-02-12',
          endDate: '2024-02-16',
          color: '#FCE7F3' // Light pink
        }],
        events: [{
          date: '2024-01-22',
          title: 'Crunch Week',
          type: 'busy',
          time: 'All Week',
          description: 'Release preparation',
          color: '#DC2626'
        }]
      }
    }, {
      name: 'Conferences',
      title: 'Conference Season',
      description: 'Industry conferences and events',
      visible: true,
      data: {
        background: [{
          startDate: '2024-02-20',
          endDate: '2024-02-23',
          color: '#F3E8FF' // Light purple
        }],
        events: [{
          date: '2024-02-20',
          title: 'Tech Conference 2024',
          type: 'conference',
          time: '9:00 AM',
          description: 'Annual technology summit',
          color: '#7C3AED'
        }, {
          date: '2024-02-22',
          title: 'Keynote Speech',
          type: 'conference',
          time: '11:00 AM',
          description: 'CEO keynote presentation',
          color: '#7C3AED'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    showLayersNavigation: true
  }
}`,...(u=(c=i.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var m,y,g;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    showLayersNavigation: args.showLayersNavigation ?? true,
    showSubmitButton: true,
    defaultLayer: 'WorkSchedule',
    defaultRange: {
      start: '2024-02-01',
      end: '2024-02-03'
    },
    layers: [{
      name: 'WorkSchedule',
      title: 'Work Schedule',
      description: 'Regular work patterns and special periods',
      visible: true,
      data: {
        background: [{
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          color: '#F0FDF4' // Very light green - normal work week
        }, {
          startDate: '2024-01-08',
          endDate: '2024-01-12',
          color: '#F0FDF4'
        }, {
          startDate: '2024-01-29',
          endDate: '2024-02-02',
          color: '#FEF3C7' // Light yellow - light work week
        }],
        events: [{
          date: '2024-01-03',
          title: 'Team Standup',
          type: 'meeting',
          time: '9:00 AM',
          description: 'Daily team synchronization',
          color: '#059669'
        }, {
          date: '2024-01-10',
          title: 'Sprint Planning',
          type: 'meeting',
          time: '10:00 AM',
          description: 'Plan next sprint work',
          color: '#059669'
        }]
      }
    }, {
      name: 'ClientMeetings',
      title: 'Client Meetings',
      description: 'External client interactions',
      visible: true,
      data: {
        events: [{
          date: '2024-01-09',
          title: 'Client Demo - TechCorp',
          type: 'client',
          time: '2:00 PM',
          description: 'Product demonstration',
          color: '#2563EB'
        }, {
          date: '2024-01-16',
          title: 'Requirements Review',
          type: 'client',
          time: '11:00 AM',
          description: 'Review new feature requirements',
          color: '#2563EB'
        }, {
          date: '2024-02-06',
          title: 'Contract Renewal',
          type: 'client',
          time: '3:00 PM',
          description: 'Annual contract discussion',
          color: '#2563EB'
        }]
      }
    }, {
      name: 'Maintenance',
      title: 'System Maintenance',
      description: 'Scheduled maintenance windows',
      visible: true,
      data: {
        background: [{
          startDate: '2024-01-27',
          endDate: '2024-01-28',
          color: '#FEE2E2' // Light red - maintenance period
        }],
        events: [{
          date: '2024-01-27',
          title: 'Database Maintenance',
          type: 'maintenance',
          time: '11:00 PM',
          description: 'Scheduled database updates',
          color: '#DC2626'
        }, {
          date: '2024-02-10',
          title: 'Server Updates',
          type: 'maintenance',
          time: '12:00 AM',
          description: 'Monthly server patches',
          color: '#DC2626'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    showLayersNavigation: true
  }
}`,...(g=(y=a.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var v,h,M;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 1,
    showLayersNavigation: args.showLayersNavigation ?? true,
    showSubmitButton: true,
    defaultLayer: 'AlwaysVisible',
    defaultRange: {
      start: '2024-01-01',
      end: '2024-01-03'
    },
    layers: [{
      name: 'AlwaysVisible',
      title: 'Core Events',
      description: 'Essential events that are always shown',
      visible: true,
      required: true,
      data: {
        events: [{
          date: '2024-01-05',
          title: 'Important Deadline',
          type: 'deadline',
          time: '5:00 PM',
          description: 'Critical project milestone',
          color: '#DC2626'
        }]
      }
    }, {
      name: 'Optional1',
      title: 'Team Events',
      description: 'Team-related activities (toggle me!)',
      visible: true,
      data: {
        background: [{
          startDate: '2024-01-08',
          endDate: '2024-01-12',
          color: '#DBEAFE'
        }],
        events: [{
          date: '2024-01-10',
          title: 'Team Building',
          type: 'team',
          time: '2:00 PM',
          description: 'Quarterly team building activity',
          color: '#3B82F6'
        }]
      }
    }, {
      name: 'Optional2',
      title: 'Social Events',
      description: 'Social and informal events (toggle me!)',
      visible: false,
      data: {
        background: [{
          startDate: '2024-01-15',
          endDate: '2024-01-19',
          color: '#F3E8FF'
        }],
        events: [{
          date: '2024-01-17',
          title: 'Happy Hour',
          type: 'social',
          time: '5:30 PM',
          description: 'Monthly team social event',
          color: '#8B5CF6'
        }]
      }
    }, {
      name: 'Optional3',
      title: 'Training',
      description: 'Learning and development (toggle me!)',
      visible: false,
      data: {
        events: [{
          date: '2024-01-22',
          title: 'React Workshop',
          type: 'training',
          time: '9:00 AM',
          description: 'Advanced React patterns workshop',
          color: '#059669'
        }, {
          date: '2024-01-29',
          title: 'Security Training',
          type: 'training',
          time: '1:00 PM',
          description: 'Cybersecurity awareness session',
          color: '#059669'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 1,
    showLayersNavigation: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates layer visibility controls. Toggle different layers on/off using the layer navigation tabs.'
      }
    }
  }
}`,...(M=(h=o.parameters)==null?void 0:h.docs)==null?void 0:M.source}}};const f=["MultipleLayers","BackgroundColors","MixedContent","LayerToggleDemo"];export{i as BackgroundColors,o as LayerToggleDemo,a as MixedContent,t as MultipleLayers,f as __namedExportsOrder,F as default};
