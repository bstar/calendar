import{C as o,j as t}from"./CLACalendar-552bce46.js";import"./index-8a57d176.js";import"./_commonjsHelpers-725317a4.js";import"./index-6700e26c.js";/* empty css                           */const K={title:"Calendar/CLACalendar",component:o,parameters:{layout:"padded",docs:{description:{component:"CLACalendar is a flexible date range picker component for React with drag selection support."}}},argTypes:{displayMode:{control:{type:"select"},options:["embedded","popup"],description:"How the calendar should be displayed"},isOpen:{control:"boolean",description:"Whether the calendar is open (for popup mode)"},visibleMonths:{control:{type:"range",min:1,max:6},description:"Number of months to display"},selectionMode:{control:{type:"select"},options:["single","range"],description:"Calendar selection mode"},startWeekOnSunday:{control:"boolean",description:"Whether to start the week on Sunday (vs Monday)"},showSubmitButton:{control:"boolean",description:"Whether to show the submit button"},showTooltips:{control:"boolean",description:"Whether to show tooltips on calendar items"},showHeader:{control:"boolean",description:"Whether to show the calendar header"},showFooter:{control:"boolean",description:"Whether to show the calendar footer"},showLayersNavigation:{control:"boolean",description:"Whether to show layer navigation tabs"}}},s={render:e=>t.jsx(o,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,selectionMode:e.selectionMode||"range",showSubmitButton:e.showSubmitButton??!0,showHeader:e.showHeader??!0,showFooter:e.showFooter??!0,showTooltips:e.showTooltips??!0,startWeekOnSunday:e.startWeekOnSunday||!1}},"default-story"),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,selectionMode:"range",showSubmitButton:!0,showHeader:!0,showFooter:!0,showTooltips:!0,startWeekOnSunday:!1}},n={render:e=>t.jsx(o,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||1,selectionMode:e.selectionMode||"range",showSubmitButton:e.showSubmitButton??!0,startWeekOnSunday:e.startWeekOnSunday||!1,showHeader:e.showHeader??!0,showFooter:e.showFooter??!0,showTooltips:e.showTooltips??!0},onSubmit:(R,_)=>{console.log("Date range selected:",{start:R,end:_})}},"simple-story"),args:{displayMode:"popup",isOpen:!0,visibleMonths:1,selectionMode:"range",showSubmitButton:!0,startWeekOnSunday:!1,showHeader:!0,showFooter:!0,showTooltips:!0}},r={render:e=>t.jsx(o,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||1,selectionMode:e.selectionMode||"single",showSubmitButton:e.showSubmitButton??!0,showHeader:e.showHeader??!0,showFooter:e.showFooter??!0,showTooltips:e.showTooltips??!0,startWeekOnSunday:e.startWeekOnSunday||!1}},"single-selection-story"),args:{displayMode:"popup",isOpen:!0,visibleMonths:1,selectionMode:"single",showSubmitButton:!0,showHeader:!0,showFooter:!0,showTooltips:!0,startWeekOnSunday:!1}},a={render:e=>t.jsx(o,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||3,selectionMode:e.selectionMode||"range",showHeader:e.showHeader??!0,showFooter:e.showFooter??!0,showTooltips:e.showTooltips??!0,startWeekOnSunday:e.startWeekOnSunday||!1,showSubmitButton:e.showSubmitButton??!0}},"multiple-months-story"),args:{displayMode:"popup",isOpen:!0,visibleMonths:3,selectionMode:"range",showHeader:!0,showFooter:!0,showTooltips:!0,startWeekOnSunday:!1,showSubmitButton:!0}},i={render:e=>t.jsx(o,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,selectionMode:e.selectionMode||"range",showHeader:e.showHeader??!0,showFooter:e.showFooter??!0,showTooltips:e.showTooltips??!0,startWeekOnSunday:e.startWeekOnSunday||!1,showSubmitButton:e.showSubmitButton??!0,colors:{primary:"#8B5CF6",success:"#10B981",warning:"#F59E0B",danger:"#EF4444"}}},"custom-colors-story"),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,selectionMode:"range",showHeader:!0,showFooter:!0,showTooltips:!0,startWeekOnSunday:!1,showSubmitButton:!0}},u={render:e=>t.jsx(o,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||1,selectionMode:e.selectionMode||"range",startWeekOnSunday:e.startWeekOnSunday??!0,showHeader:e.showHeader??!0,showFooter:e.showFooter??!0,showTooltips:e.showTooltips??!0,showSubmitButton:e.showSubmitButton??!0}},"week-start-sunday-story"),args:{displayMode:"popup",isOpen:!0,visibleMonths:1,selectionMode:"range",startWeekOnSunday:!0,showHeader:!0,showFooter:!0,showTooltips:!0,showSubmitButton:!0}},d={render:e=>t.jsx(o,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||2,selectionMode:e.selectionMode||"range",showHeader:e.showHeader??!0,showFooter:e.showFooter??!0,showTooltips:e.showTooltips??!0,startWeekOnSunday:e.startWeekOnSunday||!1,showSubmitButton:e.showSubmitButton??!0,showLayersNavigation:e.showLayersNavigation??!0,defaultLayer:"Events",defaultRange:{start:"2024-01-01",end:"2024-01-05"},layers:[{name:"Events",title:"Sample Events",description:"Example events layer",visible:!0,data:{events:[{date:"2024-01-15",title:"Team Meeting",type:"meeting",time:"10:00 AM",description:"Weekly team sync",color:"#3B82F6"},{date:"2024-01-20",title:"Project Deadline",type:"deadline",time:"5:00 PM",description:"Sprint deadline",color:"#EF4444"}],background:[{startDate:"2024-01-10",endDate:"2024-01-12",color:"#FEF3C7"}]}}]}},"with-events-story"),args:{displayMode:"popup",isOpen:!0,visibleMonths:2,selectionMode:"range",showHeader:!0,showFooter:!0,showTooltips:!0,startWeekOnSunday:!1,showSubmitButton:!0,showLayersNavigation:!0}},l={render:e=>t.jsx(o,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||1,selectionMode:e.selectionMode||"range",showHeader:e.showHeader??!0,showFooter:e.showFooter??!0,showTooltips:e.showTooltips??!0,startWeekOnSunday:e.startWeekOnSunday||!1,showSubmitButton:e.showSubmitButton??!0,defaultLayer:"Calendar"}},"minimal-story"),args:{displayMode:"popup",isOpen:!0,visibleMonths:1,selectionMode:"range",showHeader:!0,showFooter:!0,showTooltips:!0,startWeekOnSunday:!1,showSubmitButton:!0}},p={render:e=>t.jsx(o,{settings:{displayMode:e.displayMode||"popup",isOpen:e.isOpen??!0,visibleMonths:e.visibleMonths||1,selectionMode:e.selectionMode||"range",showHeader:e.showHeader??!0,showFooter:e.showFooter??!0,showTooltips:e.showTooltips??!0,startWeekOnSunday:e.startWeekOnSunday||!1,showSubmitButton:!1}},"no-submit-button-story"),args:{displayMode:"popup",isOpen:!0,visibleMonths:1,selectionMode:"range",showHeader:!0,showFooter:!0,showTooltips:!0,startWeekOnSunday:!1,showSubmitButton:!1}};var h,w,c;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: args => <CLACalendar key="default-story" settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    selectionMode: args.selectionMode || 'range',
    showSubmitButton: args.showSubmitButton ?? true,
    showHeader: args.showHeader ?? true,
    showFooter: args.showFooter ?? true,
    showTooltips: args.showTooltips ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    selectionMode: 'range',
    showSubmitButton: true,
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false
  }
}`,...(c=(w=s.parameters)==null?void 0:w.docs)==null?void 0:c.source}}};var M,y,m;n.parameters={...n.parameters,docs:{...(M=n.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: args => <CLACalendar key="simple-story" settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 1,
    selectionMode: args.selectionMode || 'range',
    showSubmitButton: args.showSubmitButton ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false,
    showHeader: args.showHeader ?? true,
    showFooter: args.showFooter ?? true,
    showTooltips: args.showTooltips ?? true
  }} onSubmit={(start, end) => {
    console.log('Date range selected:', {
      start,
      end
    });
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false,
    showHeader: true,
    showFooter: true,
    showTooltips: true
  }
}`,...(m=(y=n.parameters)==null?void 0:y.docs)==null?void 0:m.source}}};var S,b,g;r.parameters={...r.parameters,docs:{...(S=r.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: args => <CLACalendar key="single-selection-story" settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 1,
    selectionMode: args.selectionMode || 'single',
    showSubmitButton: args.showSubmitButton ?? true,
    showHeader: args.showHeader ?? true,
    showFooter: args.showFooter ?? true,
    showTooltips: args.showTooltips ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 1,
    selectionMode: 'single',
    showSubmitButton: true,
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false
  }
}`,...(g=(b=r.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var O,v,k;a.parameters={...a.parameters,docs:{...(O=a.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: args => <CLACalendar key="multiple-months-story" settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 3,
    selectionMode: args.selectionMode || 'range',
    showHeader: args.showHeader ?? true,
    showFooter: args.showFooter ?? true,
    showTooltips: args.showTooltips ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false,
    showSubmitButton: args.showSubmitButton ?? true
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 3,
    selectionMode: 'range',
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
    showSubmitButton: true
  }
}`,...(k=(v=a.parameters)==null?void 0:v.docs)==null?void 0:k.source}}};var F,W,B;i.parameters={...i.parameters,docs:{...(F=i.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: args => <CLACalendar key="custom-colors-story" settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    selectionMode: args.selectionMode || 'range',
    showHeader: args.showHeader ?? true,
    showFooter: args.showFooter ?? true,
    showTooltips: args.showTooltips ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false,
    showSubmitButton: args.showSubmitButton ?? true,
    colors: {
      primary: '#8B5CF6',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444'
    }
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    selectionMode: 'range',
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
    showSubmitButton: true
  }
}`,...(B=(W=i.parameters)==null?void 0:W.docs)==null?void 0:B.source}}};var T,H,f;u.parameters={...u.parameters,docs:{...(T=u.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: args => <CLACalendar key="week-start-sunday-story" settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 1,
    selectionMode: args.selectionMode || 'range',
    startWeekOnSunday: args.startWeekOnSunday ?? true,
    showHeader: args.showHeader ?? true,
    showFooter: args.showFooter ?? true,
    showTooltips: args.showTooltips ?? true,
    showSubmitButton: args.showSubmitButton ?? true
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 1,
    selectionMode: 'range',
    startWeekOnSunday: true,
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    showSubmitButton: true
  }
}`,...(f=(H=u.parameters)==null?void 0:H.docs)==null?void 0:f.source}}};var C,L,E;d.parameters={...d.parameters,docs:{...(C=d.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: args => <CLACalendar key="with-events-story" settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 2,
    selectionMode: args.selectionMode || 'range',
    showHeader: args.showHeader ?? true,
    showFooter: args.showFooter ?? true,
    showTooltips: args.showTooltips ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false,
    showSubmitButton: args.showSubmitButton ?? true,
    showLayersNavigation: args.showLayersNavigation ?? true,
    defaultLayer: 'Events',
    defaultRange: {
      start: '2024-01-01',
      end: '2024-01-05'
    },
    layers: [{
      name: 'Events',
      title: 'Sample Events',
      description: 'Example events layer',
      visible: true,
      data: {
        events: [{
          date: '2024-01-15',
          title: 'Team Meeting',
          type: 'meeting',
          time: '10:00 AM',
          description: 'Weekly team sync',
          color: '#3B82F6'
        }, {
          date: '2024-01-20',
          title: 'Project Deadline',
          type: 'deadline',
          time: '5:00 PM',
          description: 'Sprint deadline',
          color: '#EF4444'
        }],
        background: [{
          startDate: '2024-01-10',
          endDate: '2024-01-12',
          color: '#FEF3C7'
        }]
      }
    }]
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 2,
    selectionMode: 'range',
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
    showSubmitButton: true,
    showLayersNavigation: true
  }
}`,...(E=(L=d.parameters)==null?void 0:L.docs)==null?void 0:E.source}}};var x,A,j;l.parameters={...l.parameters,docs:{...(x=l.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: args => <CLACalendar key="minimal-story" settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 1,
    selectionMode: args.selectionMode || 'range',
    showHeader: args.showHeader ?? true,
    showFooter: args.showFooter ?? true,
    showTooltips: args.showTooltips ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false,
    showSubmitButton: args.showSubmitButton ?? true,
    defaultLayer: 'Calendar'
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 1,
    selectionMode: 'range',
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
    showSubmitButton: true
  }
}`,...(j=(A=l.parameters)==null?void 0:A.docs)==null?void 0:j.source}}};var D,N,P;p.parameters={...p.parameters,docs:{...(D=p.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: args => <CLACalendar key="no-submit-button-story" settings={{
    displayMode: args.displayMode || 'popup',
    isOpen: args.isOpen ?? true,
    visibleMonths: args.visibleMonths || 1,
    selectionMode: args.selectionMode || 'range',
    showHeader: args.showHeader ?? true,
    showFooter: args.showFooter ?? true,
    showTooltips: args.showTooltips ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false,
    showSubmitButton: false // Explicitly testing submit OFF
  }} />,
  args: {
    displayMode: 'popup',
    isOpen: true,
    visibleMonths: 1,
    selectionMode: 'range',
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
    showSubmitButton: false
  }
}`,...(P=(N=p.parameters)==null?void 0:N.docs)==null?void 0:P.source}}};const Q=["Default","Simple","SingleSelection","MultipleMonths","CustomColors","WeekStartSunday","WithEvents","Minimal","NoSubmitButton"];export{i as CustomColors,s as Default,l as Minimal,a as MultipleMonths,p as NoSubmitButton,n as Simple,r as SingleSelection,u as WeekStartSunday,d as WithEvents,Q as __namedExportsOrder,K as default};
