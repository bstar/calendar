import{S as n,j as t}from"./CLACalendar-a752fb7f.js";import"./index-8a57d176.js";import"./_commonjsHelpers-725317a4.js";import"./index-6700e26c.js";/* empty css                           */const ee={title:"Calendar/SimpleCalendar",component:n,parameters:{layout:"padded",docs:{description:{component:"SimpleCalendar is a wrapper around CLACalendar that provides a simplified API for common use cases."}}},argTypes:{displayMode:{control:{type:"select"},options:["embedded","popup"],description:"How the calendar should be displayed"},visibleMonths:{control:{type:"range",min:1,max:6},description:"Number of months to display"},selectionMode:{control:{type:"select"},options:["single","range"],description:"Calendar selection mode"},showSubmitButton:{control:"boolean",description:"Whether to show the submit button"},startWeekOnSunday:{control:"boolean",description:"Whether to start the week on Sunday (vs Monday)"}}},o={render:e=>t.jsx(n,{config:{displayMode:e.displayMode||"embedded",visibleMonths:e.visibleMonths||1,selectionMode:e.selectionMode||"range",showSubmitButton:e.showSubmitButton??!0,startWeekOnSunday:e.startWeekOnSunday||!1}}),args:{displayMode:"embedded",visibleMonths:1,selectionMode:"range",showSubmitButton:!0,startWeekOnSunday:!1}},a={render:e=>t.jsx(n,{config:{displayMode:e.displayMode||"embedded",visibleMonths:e.visibleMonths||1,selectionMode:e.selectionMode||"range",showSubmitButton:e.showSubmitButton??!0,startWeekOnSunday:e.startWeekOnSunday||!1},onSubmit:(s,K)=>{alert(`Selected: ${s} to ${K}`)}}),args:{displayMode:"embedded",visibleMonths:1,selectionMode:"range",showSubmitButton:!0,startWeekOnSunday:!1}},d={render:e=>t.jsx(n,{config:{displayMode:e.displayMode||"embedded",visibleMonths:e.visibleMonths||1,selectionMode:e.selectionMode||"single",showSubmitButton:e.showSubmitButton??!0,startWeekOnSunday:e.startWeekOnSunday||!1},onSubmit:s=>{alert(`Selected date: ${s}`)}}),args:{displayMode:"embedded",visibleMonths:1,selectionMode:"single",showSubmitButton:!0,startWeekOnSunday:!1}},r={render:e=>t.jsx(n,{config:{displayMode:e.displayMode||"embedded",visibleMonths:e.visibleMonths||2,selectionMode:e.selectionMode||"range",showSubmitButton:e.showSubmitButton??!0,startWeekOnSunday:e.startWeekOnSunday||!1}}),args:{displayMode:"embedded",visibleMonths:2,selectionMode:"range",showSubmitButton:!0,startWeekOnSunday:!1}},i={render:e=>t.jsx(n,{config:{displayMode:e.displayMode||"embedded",visibleMonths:e.visibleMonths||1,selectionMode:e.selectionMode||"range",showSubmitButton:e.showSubmitButton??!0,startWeekOnSunday:e.startWeekOnSunday??!0}}),args:{displayMode:"embedded",visibleMonths:1,selectionMode:"range",showSubmitButton:!0,startWeekOnSunday:!0}},l={render:e=>t.jsx(n,{config:{displayMode:e.displayMode||"embedded",visibleMonths:e.visibleMonths||2,selectionMode:e.selectionMode||"range",showSubmitButton:e.showSubmitButton??!0,startWeekOnSunday:e.startWeekOnSunday||!1,defaultRange:{start:"2024-01-15",end:"2024-01-20"}}}),args:{displayMode:"embedded",visibleMonths:2,selectionMode:"range",showSubmitButton:!0,startWeekOnSunday:!1}},u={render:e=>t.jsx(n,{config:{displayMode:e.displayMode||"embedded",visibleMonths:e.visibleMonths||1,selectionMode:e.selectionMode||"range",showSubmitButton:e.showSubmitButton??!0,startWeekOnSunday:e.startWeekOnSunday||!1,colors:{primary:"#9333EA",success:"#059669",warning:"#D97706",danger:"#DC2626"}}}),args:{displayMode:"embedded",visibleMonths:1,selectionMode:"range",showSubmitButton:!0,startWeekOnSunday:!1}},m={render:e=>t.jsx(n,{config:{displayMode:e.displayMode||"embedded",visibleMonths:e.visibleMonths||1,selectionMode:e.selectionMode||"range",showSubmitButton:e.showSubmitButton??!0,startWeekOnSunday:e.startWeekOnSunday||!1,containerStyle:{backgroundColor:"#F3F4F6",border:"2px solid #6366F1",borderRadius:"12px",padding:"16px"},inputStyle:{fontSize:"16px",padding:"12px",borderRadius:"8px"}}}),args:{displayMode:"embedded",visibleMonths:1,selectionMode:"range",showSubmitButton:!0,startWeekOnSunday:!1}},c={render:e=>t.jsx(n,{config:{displayMode:e.displayMode||"embedded",visibleMonths:e.visibleMonths||1,selectionMode:e.selectionMode||"range",showSubmitButton:e.showSubmitButton??!0,startWeekOnSunday:e.startWeekOnSunday||!1}}),args:{displayMode:"embedded",visibleMonths:1,selectionMode:"range",showSubmitButton:!0,startWeekOnSunday:!1}},M={render:()=>t.jsx(n,{})},b={render:e=>t.jsx(n,{config:{displayMode:e.displayMode||"embedded",visibleMonths:e.visibleMonths||1,selectionMode:e.selectionMode||"range",showSubmitButton:e.showSubmitButton??!0,startWeekOnSunday:e.startWeekOnSunday||!1,dateFormatter:s=>s.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}}),args:{displayMode:"embedded",visibleMonths:1,selectionMode:"range",showSubmitButton:!0,startWeekOnSunday:!1}};var S,p,h;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: args => <SimpleCalendar config={{
    displayMode: args.displayMode || 'embedded',
    visibleMonths: args.visibleMonths || 1,
    selectionMode: args.selectionMode || 'range',
    showSubmitButton: args.showSubmitButton ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false
  }} />,
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false
  }
}`,...(h=(p=o.parameters)==null?void 0:p.docs)==null?void 0:h.source}}};var y,g,w;a.parameters={...a.parameters,docs:{...(y=a.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: args => <SimpleCalendar config={{
    displayMode: args.displayMode || 'embedded',
    visibleMonths: args.visibleMonths || 1,
    selectionMode: args.selectionMode || 'range',
    showSubmitButton: args.showSubmitButton ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false
  }} onSubmit={(start, end) => {
    alert(\`Selected: \${start} to \${end}\`);
  }} />,
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false
  }
}`,...(w=(g=a.parameters)==null?void 0:g.docs)==null?void 0:w.source}}};var f,W,k;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: args => <SimpleCalendar config={{
    displayMode: args.displayMode || 'embedded',
    visibleMonths: args.visibleMonths || 1,
    selectionMode: args.selectionMode || 'single',
    showSubmitButton: args.showSubmitButton ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false
  }} onSubmit={start => {
    alert(\`Selected date: \${start}\`);
  }} />,
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'single',
    showSubmitButton: true,
    startWeekOnSunday: false
  }
}`,...(k=(W=d.parameters)==null?void 0:W.docs)==null?void 0:k.source}}};var v,B,O;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: args => <SimpleCalendar config={{
    displayMode: args.displayMode || 'embedded',
    visibleMonths: args.visibleMonths || 2,
    selectionMode: args.selectionMode || 'range',
    showSubmitButton: args.showSubmitButton ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false
  }} />,
  args: {
    displayMode: 'embedded',
    visibleMonths: 2,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false
  }
}`,...(O=(B=r.parameters)==null?void 0:B.docs)==null?void 0:O.source}}};var C,x,j;i.parameters={...i.parameters,docs:{...(C=i.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: args => <SimpleCalendar config={{
    displayMode: args.displayMode || 'embedded',
    visibleMonths: args.visibleMonths || 1,
    selectionMode: args.selectionMode || 'range',
    showSubmitButton: args.showSubmitButton ?? true,
    startWeekOnSunday: args.startWeekOnSunday ?? true
  }} />,
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: true
  }
}`,...(j=(x=i.parameters)==null?void 0:x.docs)==null?void 0:j.source}}};var F,D,R;l.parameters={...l.parameters,docs:{...(F=l.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: args => <SimpleCalendar config={{
    displayMode: args.displayMode || 'embedded',
    visibleMonths: args.visibleMonths || 2,
    selectionMode: args.selectionMode || 'range',
    showSubmitButton: args.showSubmitButton ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false,
    defaultRange: {
      start: '2024-01-15',
      end: '2024-01-20'
    }
  }} />,
  args: {
    displayMode: 'embedded',
    visibleMonths: 2,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false
  }
}`,...(R=(D=l.parameters)==null?void 0:D.docs)==null?void 0:R.source}}};var $,T,A;u.parameters={...u.parameters,docs:{...($=u.parameters)==null?void 0:$.docs,source:{originalSource:`{
  render: args => <SimpleCalendar config={{
    displayMode: args.displayMode || 'embedded',
    visibleMonths: args.visibleMonths || 1,
    selectionMode: args.selectionMode || 'range',
    showSubmitButton: args.showSubmitButton ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false,
    colors: {
      primary: '#9333EA',
      success: '#059669',
      warning: '#D97706',
      danger: '#DC2626'
    }
  }} />,
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false
  }
}`,...(A=(T=u.parameters)==null?void 0:T.docs)==null?void 0:A.source}}};var E,L,N;m.parameters={...m.parameters,docs:{...(E=m.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: args => <SimpleCalendar config={{
    displayMode: args.displayMode || 'embedded',
    visibleMonths: args.visibleMonths || 1,
    selectionMode: args.selectionMode || 'range',
    showSubmitButton: args.showSubmitButton ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false,
    containerStyle: {
      backgroundColor: '#F3F4F6',
      border: '2px solid #6366F1',
      borderRadius: '12px',
      padding: '16px'
    },
    inputStyle: {
      fontSize: '16px',
      padding: '12px',
      borderRadius: '8px'
    }
  }} />,
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false
  }
}`,...(N=(L=m.parameters)==null?void 0:L.docs)==null?void 0:N.source}}};var z,U,_;c.parameters={...c.parameters,docs:{...(z=c.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: args => <SimpleCalendar config={{
    displayMode: args.displayMode || 'embedded',
    visibleMonths: args.visibleMonths || 1,
    selectionMode: args.selectionMode || 'range',
    showSubmitButton: args.showSubmitButton ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false
  }} />,
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false
  }
}`,...(_=(U=c.parameters)==null?void 0:U.docs)==null?void 0:_.source}}};var H,I,P;M.parameters={...M.parameters,docs:{...(H=M.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => <SimpleCalendar />
}`,...(P=(I=M.parameters)==null?void 0:I.docs)==null?void 0:P.source}}};var q,G,J;b.parameters={...b.parameters,docs:{...(q=b.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: args => <SimpleCalendar config={{
    displayMode: args.displayMode || 'embedded',
    visibleMonths: args.visibleMonths || 1,
    selectionMode: args.selectionMode || 'range',
    showSubmitButton: args.showSubmitButton ?? true,
    startWeekOnSunday: args.startWeekOnSunday || false,
    dateFormatter: (date: Date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  }} />,
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false
  }
}`,...(J=(G=b.parameters)==null?void 0:G.docs)==null?void 0:J.source}}};const ne=["Basic","WithSubmit","SingleDate","TwoMonths","SundayStart","WithDefaultRange","CustomTheme","CustomStyles","Minimal","NullConfig","CustomFormatter"];export{o as Basic,b as CustomFormatter,m as CustomStyles,u as CustomTheme,c as Minimal,M as NullConfig,d as SingleDate,i as SundayStart,r as TwoMonths,l as WithDefaultRange,a as WithSubmit,ne as __namedExportsOrder,ee as default};
