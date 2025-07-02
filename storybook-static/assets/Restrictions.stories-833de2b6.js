import{C as n,j as t}from"./CLACalendar-a752fb7f.js";import"./index-8a57d176.js";import"./_commonjsHelpers-725317a4.js";import"./index-6700e26c.js";/* empty css                           */const x={title:"Calendar/Restrictions",component:n,parameters:{layout:"padded",docs:{description:{component:"Examples showcasing different types of date restrictions and validation rules."}}},argTypes:{displayMode:{control:{type:"select"},options:["embedded","popup"],description:"How the calendar should be displayed"},isOpen:{control:"boolean",description:"Whether the calendar is open (for popup mode)"},visibleMonths:{control:{type:"range",min:1,max:6},description:"Number of months to display"},showSelectionAlert:{control:"boolean",description:"Show alerts when restricted dates are selected"}}},o={render:e=>t.jsx(n,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,showSubmitButton:!0,showSelectionAlert:e.showSelectionAlert??!0,defaultRange:{start:"2024-01-01",end:"2024-02-29"},defaultLayer:"Holidays",restrictionConfig:{restrictions:[{type:"daterange",enabled:!0,ranges:[{start:"2024-01-15",end:"2024-01-19",message:"Company holiday week - no bookings allowed"},{start:"2024-02-10",end:"2024-02-14",message:"System maintenance period - unavailable"},{start:"2024-01-01",end:"2024-01-01",message:"New Year's Day - office closed"}]}]},layers:[{name:"Holidays",title:"Restricted Periods",description:"Periods when booking is not allowed",visible:!0,data:{background:[{startDate:"2024-01-15",endDate:"2024-01-19",color:"#FEE2E2"},{startDate:"2024-02-10",endDate:"2024-02-14",color:"#FEE2E2"},{startDate:"2024-01-01",endDate:"2024-01-01",color:"#FEE2E2"}],events:[{date:"2024-01-15",title:"Holiday Period",type:"restriction",time:"All Week",description:"Company holiday - no bookings",color:"#DC2626"},{date:"2024-02-10",title:"Maintenance",type:"restriction",time:"All Week",description:"System maintenance period",color:"#DC2626"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,showSelectionAlert:!0},parameters:{docs:{description:{story:"Try selecting dates in the red highlighted periods to see restriction messages."}}}},s={render:e=>t.jsx(n,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,showSubmitButton:!0,showSelectionAlert:e.showSelectionAlert??!0,defaultRange:{start:"2024-01-01",end:"2024-02-29"},defaultLayer:"BookingWindow",restrictionConfig:{restrictions:[{type:"boundary",enabled:!0,date:"2024-01-10",direction:"before",message:"Cannot select dates before January 10th - booking window opens then"},{type:"boundary",enabled:!0,date:"2024-02-20",direction:"after",message:"Cannot select dates after February 20th - booking window closes"}]},layers:[{name:"BookingWindow",title:"Booking Window",description:"Available booking period",visible:!0,data:{background:[{startDate:"2024-01-10",endDate:"2024-02-20",color:"#F0FDF4"}],events:[{date:"2024-01-10",title:"Booking Opens",type:"boundary",time:"12:00 AM",description:"Booking window opens",color:"#059669"},{date:"2024-02-20",title:"Booking Closes",type:"boundary",time:"11:59 PM",description:"Booking window closes",color:"#DC2626"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,showSelectionAlert:!0},parameters:{docs:{description:{story:"Try selecting dates before January 10th or after February 20th to see boundary restriction messages."}}}},i={render:e=>t.jsx(n,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,showSubmitButton:!0,showSelectionAlert:e.showSelectionAlert??!0,defaultRange:{start:"2024-01-01",end:"2024-02-29"},defaultLayer:"BusinessHours",restrictionConfig:{restrictions:[{type:"weekday",enabled:!0,days:[0,6],message:"Weekend bookings are not allowed - business hours only"}]},layers:[{name:"BusinessHours",title:"Business Days",description:"Weekdays only - no weekend bookings",visible:!0,data:{events:[{date:"2024-01-08",title:"Business Hours",type:"info",time:"9-5",description:"Monday-Friday bookings only",color:"#3B82F6"},{date:"2024-01-15",title:"Business Hours",type:"info",time:"9-5",description:"Monday-Friday bookings only",color:"#3B82F6"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,showSelectionAlert:!0},parameters:{docs:{description:{story:"Try selecting weekend dates (Saturday/Sunday) to see weekday restriction messages."}}}},r={render:e=>t.jsx(n,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,showSubmitButton:!0,showSelectionAlert:e.showSelectionAlert??!0,defaultRange:{start:"2024-01-01",end:"2024-02-29"},defaultLayer:"AvailableSlots",restrictionConfig:{restrictions:[{type:"allowedranges",enabled:!0,ranges:[{start:"2024-01-08",end:"2024-01-12",message:"Available for booking - Conference Room A"},{start:"2024-01-22",end:"2024-01-26",message:"Available for booking - Conference Room B"},{start:"2024-02-05",end:"2024-02-09",message:"Available for booking - Training Room"}]}]},layers:[{name:"AvailableSlots",title:"Available Booking Slots",description:"Only these periods are available for booking",visible:!0,data:{background:[{startDate:"2024-01-08",endDate:"2024-01-12",color:"#D1FAE5"},{startDate:"2024-01-22",endDate:"2024-01-26",color:"#D1FAE5"},{startDate:"2024-02-05",endDate:"2024-02-09",color:"#D1FAE5"}],events:[{date:"2024-01-08",title:"Conference Room A",type:"available",time:"All Week",description:"Available for booking",color:"#059669"},{date:"2024-01-22",title:"Conference Room B",type:"available",time:"All Week",description:"Available for booking",color:"#059669"},{date:"2024-02-05",title:"Training Room",type:"available",time:"All Week",description:"Available for booking",color:"#059669"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,showSelectionAlert:!0},parameters:{docs:{description:{story:"Only the green highlighted periods are available for selection. Try selecting dates outside these ranges."}}}},a={render:e=>t.jsx(n,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,showSubmitButton:!0,showSelectionAlert:e.showSelectionAlert??!0,defaultRange:{start:"2024-01-01",end:"2024-02-29"},defaultLayer:"ComplexRestrictions",restrictionConfig:{restrictions:[{type:"boundary",enabled:!0,date:"2024-01-05",direction:"before",message:"Cannot book before January 5th - system not ready"},{type:"weekday",enabled:!0,days:[0,6],message:"Weekend bookings not available"},{type:"daterange",enabled:!0,ranges:[{start:"2024-01-15",end:"2024-01-19",message:"Holiday week - office closed"},{start:"2024-02-12",end:"2024-02-16",message:"Maintenance week - system unavailable"}]}]},layers:[{name:"ComplexRestrictions",title:"Multiple Restrictions",description:"Combination of boundary, weekday, and date range restrictions",visible:!0,data:{background:[{startDate:"2024-01-01",endDate:"2024-01-04",color:"#FEE2E2"},{startDate:"2024-01-15",endDate:"2024-01-19",color:"#FEE2E2"},{startDate:"2024-02-12",endDate:"2024-02-16",color:"#FEE2E2"}],events:[{date:"2024-01-05",title:"System Ready",type:"info",time:"12:00 AM",description:"Booking system becomes available",color:"#059669"},{date:"2024-01-15",title:"Holiday Week",type:"restriction",time:"All Week",description:"Office closed for holidays",color:"#DC2626"},{date:"2024-02-12",title:"Maintenance",type:"restriction",time:"All Week",description:"System maintenance period",color:"#DC2626"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,showSelectionAlert:!0},parameters:{docs:{description:{story:"Complex example with multiple restriction types: boundary (before Jan 5), weekends blocked, and specific date ranges restricted."}}}},d={render:e=>t.jsx(n,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,showSubmitButton:!0,showSelectionAlert:e.showSelectionAlert??!0,defaultRange:{start:"2024-01-01",end:"2024-02-29"},defaultLayer:"ExecutivePeriods",restrictionConfig:{restrictions:[{type:"restricted_boundary",enabled:!0,ranges:[{start:"2024-01-10",end:"2024-01-15",message:"Executive meetings scheduled - no other bookings allowed"},{start:"2024-02-05",end:"2024-02-07",message:"Board meeting period - restricted access"}]}]},layers:[{name:"ExecutivePeriods",title:"Executive Meetings",description:"High-priority meetings block other bookings",visible:!0,data:{background:[{startDate:"2024-01-10",endDate:"2024-01-15",color:"#FEF3C7"},{startDate:"2024-02-05",endDate:"2024-02-07",color:"#FEF3C7"}],events:[{date:"2024-01-12",title:"Executive Summit",type:"executive",time:"9:00 AM",description:"Quarterly executive meetings",color:"#F59E0B"},{date:"2024-02-06",title:"Board Meeting",type:"executive",time:"10:00 AM",description:"Monthly board session",color:"#F59E0B"}]}}]}}),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,showSelectionAlert:!0},parameters:{docs:{description:{story:"Restricted boundary example - certain periods are blocked due to high-priority meetings."}}}};var l,c,p;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    showSubmitButton: true,
    showSelectionAlert: args.showSelectionAlert ?? true,
    defaultRange: {
      start: '2024-01-01',
      end: '2024-02-29'
    },
    defaultLayer: 'Holidays',
    restrictionConfig: {
      restrictions: [{
        type: 'daterange',
        enabled: true,
        ranges: [{
          start: '2024-01-15',
          end: '2024-01-19',
          message: 'Company holiday week - no bookings allowed'
        }, {
          start: '2024-02-10',
          end: '2024-02-14',
          message: 'System maintenance period - unavailable'
        }, {
          start: '2024-01-01',
          end: '2024-01-01',
          message: 'New Year\\'s Day - office closed'
        }]
      }]
    },
    layers: [{
      name: 'Holidays',
      title: 'Restricted Periods',
      description: 'Periods when booking is not allowed',
      visible: true,
      data: {
        background: [{
          startDate: '2024-01-15',
          endDate: '2024-01-19',
          color: '#FEE2E2' // Light red for restrictions
        }, {
          startDate: '2024-02-10',
          endDate: '2024-02-14',
          color: '#FEE2E2'
        }, {
          startDate: '2024-01-01',
          endDate: '2024-01-01',
          color: '#FEE2E2'
        }],
        events: [{
          date: '2024-01-15',
          title: 'Holiday Period',
          type: 'restriction',
          time: 'All Week',
          description: 'Company holiday - no bookings',
          color: '#DC2626'
        }, {
          date: '2024-02-10',
          title: 'Maintenance',
          type: 'restriction',
          time: 'All Week',
          description: 'System maintenance period',
          color: '#DC2626'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    showSelectionAlert: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Try selecting dates in the red highlighted periods to see restriction messages.'
      }
    }
  }
}`,...(p=(c=o.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};var u,y,g;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    showSubmitButton: true,
    showSelectionAlert: args.showSelectionAlert ?? true,
    defaultRange: {
      start: '2024-01-01',
      end: '2024-02-29'
    },
    defaultLayer: 'BookingWindow',
    restrictionConfig: {
      restrictions: [{
        type: 'boundary',
        enabled: true,
        date: '2024-01-10',
        direction: 'before',
        message: 'Cannot select dates before January 10th - booking window opens then'
      }, {
        type: 'boundary',
        enabled: true,
        date: '2024-02-20',
        direction: 'after',
        message: 'Cannot select dates after February 20th - booking window closes'
      }]
    },
    layers: [{
      name: 'BookingWindow',
      title: 'Booking Window',
      description: 'Available booking period',
      visible: true,
      data: {
        background: [{
          startDate: '2024-01-10',
          endDate: '2024-02-20',
          color: '#F0FDF4' // Light green for available period
        }],
        events: [{
          date: '2024-01-10',
          title: 'Booking Opens',
          type: 'boundary',
          time: '12:00 AM',
          description: 'Booking window opens',
          color: '#059669'
        }, {
          date: '2024-02-20',
          title: 'Booking Closes',
          type: 'boundary',
          time: '11:59 PM',
          description: 'Booking window closes',
          color: '#DC2626'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    showSelectionAlert: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Try selecting dates before January 10th or after February 20th to see boundary restriction messages.'
      }
    }
  }
}`,...(g=(y=s.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var b,m,h;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    showSubmitButton: true,
    showSelectionAlert: args.showSelectionAlert ?? true,
    defaultRange: {
      start: '2024-01-01',
      end: '2024-02-29'
    },
    defaultLayer: 'BusinessHours',
    restrictionConfig: {
      restrictions: [{
        type: 'weekday',
        enabled: true,
        days: [0, 6],
        // Sunday = 0, Saturday = 6
        message: 'Weekend bookings are not allowed - business hours only'
      }]
    },
    layers: [{
      name: 'BusinessHours',
      title: 'Business Days',
      description: 'Weekdays only - no weekend bookings',
      visible: true,
      data: {
        events: [{
          date: '2024-01-08',
          title: 'Business Hours',
          type: 'info',
          time: '9-5',
          description: 'Monday-Friday bookings only',
          color: '#3B82F6'
        }, {
          date: '2024-01-15',
          title: 'Business Hours',
          type: 'info',
          time: '9-5',
          description: 'Monday-Friday bookings only',
          color: '#3B82F6'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    showSelectionAlert: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Try selecting weekend dates (Saturday/Sunday) to see weekday restriction messages.'
      }
    }
  }
}`,...(h=(m=i.parameters)==null?void 0:m.docs)==null?void 0:h.source}}};var k,v,w;r.parameters={...r.parameters,docs:{...(k=r.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    showSubmitButton: true,
    showSelectionAlert: args.showSelectionAlert ?? true,
    defaultRange: {
      start: '2024-01-01',
      end: '2024-02-29'
    },
    defaultLayer: 'AvailableSlots',
    restrictionConfig: {
      restrictions: [{
        type: 'allowedranges',
        enabled: true,
        ranges: [{
          start: '2024-01-08',
          end: '2024-01-12',
          message: 'Available for booking - Conference Room A'
        }, {
          start: '2024-01-22',
          end: '2024-01-26',
          message: 'Available for booking - Conference Room B'
        }, {
          start: '2024-02-05',
          end: '2024-02-09',
          message: 'Available for booking - Training Room'
        }]
      }]
    },
    layers: [{
      name: 'AvailableSlots',
      title: 'Available Booking Slots',
      description: 'Only these periods are available for booking',
      visible: true,
      data: {
        background: [{
          startDate: '2024-01-08',
          endDate: '2024-01-12',
          color: '#D1FAE5' // Light green for available
        }, {
          startDate: '2024-01-22',
          endDate: '2024-01-26',
          color: '#D1FAE5'
        }, {
          startDate: '2024-02-05',
          endDate: '2024-02-09',
          color: '#D1FAE5'
        }],
        events: [{
          date: '2024-01-08',
          title: 'Conference Room A',
          type: 'available',
          time: 'All Week',
          description: 'Available for booking',
          color: '#059669'
        }, {
          date: '2024-01-22',
          title: 'Conference Room B',
          type: 'available',
          time: 'All Week',
          description: 'Available for booking',
          color: '#059669'
        }, {
          date: '2024-02-05',
          title: 'Training Room',
          type: 'available',
          time: 'All Week',
          description: 'Available for booking',
          color: '#059669'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    showSelectionAlert: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Only the green highlighted periods are available for selection. Try selecting dates outside these ranges.'
      }
    }
  }
}`,...(w=(v=r.parameters)==null?void 0:v.docs)==null?void 0:w.source}}};var f,M,A;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    showSubmitButton: true,
    showSelectionAlert: args.showSelectionAlert ?? true,
    defaultRange: {
      start: '2024-01-01',
      end: '2024-02-29'
    },
    defaultLayer: 'ComplexRestrictions',
    restrictionConfig: {
      restrictions: [{
        type: 'boundary',
        enabled: true,
        date: '2024-01-05',
        direction: 'before',
        message: 'Cannot book before January 5th - system not ready'
      }, {
        type: 'weekday',
        enabled: true,
        days: [0, 6],
        // No weekends
        message: 'Weekend bookings not available'
      }, {
        type: 'daterange',
        enabled: true,
        ranges: [{
          start: '2024-01-15',
          end: '2024-01-19',
          message: 'Holiday week - office closed'
        }, {
          start: '2024-02-12',
          end: '2024-02-16',
          message: 'Maintenance week - system unavailable'
        }]
      }]
    },
    layers: [{
      name: 'ComplexRestrictions',
      title: 'Multiple Restrictions',
      description: 'Combination of boundary, weekday, and date range restrictions',
      visible: true,
      data: {
        background: [{
          startDate: '2024-01-01',
          endDate: '2024-01-04',
          color: '#FEE2E2' // Red - before boundary
        }, {
          startDate: '2024-01-15',
          endDate: '2024-01-19',
          color: '#FEE2E2' // Red - holiday week
        }, {
          startDate: '2024-02-12',
          endDate: '2024-02-16',
          color: '#FEE2E2' // Red - maintenance
        }],
        events: [{
          date: '2024-01-05',
          title: 'System Ready',
          type: 'info',
          time: '12:00 AM',
          description: 'Booking system becomes available',
          color: '#059669'
        }, {
          date: '2024-01-15',
          title: 'Holiday Week',
          type: 'restriction',
          time: 'All Week',
          description: 'Office closed for holidays',
          color: '#DC2626'
        }, {
          date: '2024-02-12',
          title: 'Maintenance',
          type: 'restriction',
          time: 'All Week',
          description: 'System maintenance period',
          color: '#DC2626'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    showSelectionAlert: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex example with multiple restriction types: boundary (before Jan 5), weekends blocked, and specific date ranges restricted.'
      }
    }
  }
}`,...(A=(M=a.parameters)==null?void 0:M.docs)==null?void 0:A.source}}};var S,D,C;d.parameters={...d.parameters,docs:{...(S=d.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: args => <CLACalendar settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    showSubmitButton: true,
    showSelectionAlert: args.showSelectionAlert ?? true,
    defaultRange: {
      start: '2024-01-01',
      end: '2024-02-29'
    },
    defaultLayer: 'ExecutivePeriods',
    restrictionConfig: {
      restrictions: [{
        type: 'restricted_boundary',
        enabled: true,
        ranges: [{
          start: '2024-01-10',
          end: '2024-01-15',
          message: 'Executive meetings scheduled - no other bookings allowed'
        }, {
          start: '2024-02-05',
          end: '2024-02-07',
          message: 'Board meeting period - restricted access'
        }]
      }]
    },
    layers: [{
      name: 'ExecutivePeriods',
      title: 'Executive Meetings',
      description: 'High-priority meetings block other bookings',
      visible: true,
      data: {
        background: [{
          startDate: '2024-01-10',
          endDate: '2024-01-15',
          color: '#FEF3C7' // Light orange for high priority
        }, {
          startDate: '2024-02-05',
          endDate: '2024-02-07',
          color: '#FEF3C7'
        }],
        events: [{
          date: '2024-01-12',
          title: 'Executive Summit',
          type: 'executive',
          time: '9:00 AM',
          description: 'Quarterly executive meetings',
          color: '#F59E0B'
        }, {
          date: '2024-02-06',
          title: 'Board Meeting',
          type: 'executive',
          time: '10:00 AM',
          description: 'Monthly board session',
          color: '#F59E0B'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    showSelectionAlert: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Restricted boundary example - certain periods are blocked due to high-priority meetings.'
      }
    }
  }
}`,...(C=(D=d.parameters)==null?void 0:D.docs)==null?void 0:C.source}}};const W=["DateRangeRestrictions","BoundaryRestrictions","WeekdayRestrictions","AllowedRangesOnly","MixedRestrictions","RestrictedBoundary"];export{r as AllowedRangesOnly,s as BoundaryRestrictions,o as DateRangeRestrictions,a as MixedRestrictions,d as RestrictedBoundary,i as WeekdayRestrictions,W as __namedExportsOrder,x as default};
