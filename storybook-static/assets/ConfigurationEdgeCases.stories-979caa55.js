import{C as n,j as e,c as a,S as ne,a as se}from"./CLACalendar-a752fb7f.js";import"./index-8a57d176.js";import"./_commonjsHelpers-725317a4.js";import"./index-6700e26c.js";/* empty css                           */const ce={title:"Calendar/Configuration Edge Cases",component:n,parameters:{layout:"padded",docs:{description:{component:"This collection demonstrates how the calendar handles various edge cases and null/undefined configurations gracefully."}}}},r={render:()=>e.jsx(n,{settings:a(null)}),parameters:{docs:{description:{story:"Calendar with null settings - should use all defaults gracefully."}}}},s={render:()=>e.jsx(n,{settings:a(void 0)}),parameters:{docs:{description:{story:"Calendar with undefined settings - should use all defaults gracefully."}}}},t={render:()=>e.jsx(n,{settings:a({})}),parameters:{docs:{description:{story:"Calendar with empty settings object - should use all defaults."}}}},i={render:()=>e.jsx(n,{settings:a({visibleMonths:-5,monthWidth:50})}),parameters:{docs:{description:{story:"Calendar with invalid numeric values - should sanitize to safe defaults."}}}},l={render:()=>e.jsx(n,{settings:a({layers:null})}),parameters:{docs:{description:{story:"Calendar with null layers array - should provide default Calendar layer."}}}},d={render:()=>e.jsx(n,{settings:a({layers:[]})}),parameters:{docs:{description:{story:"Calendar with empty layers array - should provide default Calendar layer."}}}},o={render:()=>e.jsx(n,{settings:a({displayMode:void 0,visibleMonths:null,layers:void 0,colors:null,showHeader:void 0})}),parameters:{docs:{description:{story:"Calendar with mixed null/undefined properties - should filter them out and use defaults."}}}},c={render:()=>e.jsx(ne,{config:null}),parameters:{docs:{description:{story:"SimpleCalendar with null config - should work with minimal defaults."}}}},u={render:()=>e.jsx(ne,{config:{visibleMonths:void 0,displayMode:null,selectionMode:"range"}}),parameters:{docs:{description:{story:"SimpleCalendar with partial config containing nulls - should handle gracefully."}}}},p={render:()=>e.jsx(n,{settings:se({onSubmit:(ae,re)=>console.log("Selected:",ae,re),defaultRange:{start:"2024-01-10"}})}),parameters:{docs:{description:{story:"Using createMinimalCalendar helper for the simplest possible setup."}}}},m={render:()=>e.jsx(n,{settings:a({defaultRange:{start:"2024-01-20",end:"2024-01-10"}})}),parameters:{docs:{description:{story:"Calendar with invalid date range - should handle gracefully."}}}},g={render:()=>e.jsx(n,{settings:a({layers:[null,{name:"Valid Layer",title:"This layer is valid",description:"Should work fine"},void 0,{name:""}]})}),parameters:{docs:{description:{story:"Calendar with malformed layers array containing nulls and invalid objects."}}}},y={render:()=>e.jsx(n,{settings:a({visibleMonths:999,monthWidth:-100,colors:{primary:null,success:"",warning:"invalid-color"}})}),parameters:{docs:{description:{story:"Calendar with extreme/invalid values - should sanitize to safe bounds."}}}};var h,C,f;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <CLACalendar settings={createCalendarSettings(null as any)} />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar with null settings - should use all defaults gracefully.'
      }
    }
  }
}`,...(f=(C=r.parameters)==null?void 0:C.docs)==null?void 0:f.source}}};var S,v,w;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <CLACalendar settings={createCalendarSettings(undefined)} />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar with undefined settings - should use all defaults gracefully.'
      }
    }
  }
}`,...(w=(v=s.parameters)==null?void 0:v.docs)==null?void 0:w.source}}};var x,M,b;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <CLACalendar settings={createCalendarSettings({})} />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar with empty settings object - should use all defaults.'
      }
    }
  }
}`,...(b=(M=t.parameters)==null?void 0:M.docs)==null?void 0:b.source}}};var j,L,A;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <CLACalendar settings={createCalendarSettings({
    visibleMonths: -5,
    // Invalid: negative
    monthWidth: 50 // Invalid: too small
  })} />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar with invalid numeric values - should sanitize to safe defaults.'
      }
    }
  }
}`,...(A=(L=i.parameters)==null?void 0:L.docs)==null?void 0:A.source}}};var E,N,R;l.parameters={...l.parameters,docs:{...(E=l.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => <CLACalendar settings={createCalendarSettings({
    layers: null as any
  })} />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar with null layers array - should provide default Calendar layer.'
      }
    }
  }
}`,...(R=(N=l.parameters)==null?void 0:N.docs)==null?void 0:R.source}}};var I,k,z;d.parameters={...d.parameters,docs:{...(I=d.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => <CLACalendar settings={createCalendarSettings({
    layers: []
  })} />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar with empty layers array - should provide default Calendar layer.'
      }
    }
  }
}`,...(z=(k=d.parameters)==null?void 0:k.docs)==null?void 0:z.source}}};var H,P,T;o.parameters={...o.parameters,docs:{...(H=o.parameters)==null?void 0:H.docs,source:{originalSource:`{
  render: () => <CLACalendar settings={createCalendarSettings({
    displayMode: undefined,
    visibleMonths: null as any,
    layers: undefined,
    colors: null as any,
    showHeader: undefined
  })} />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar with mixed null/undefined properties - should filter them out and use defaults.'
      }
    }
  }
}`,...(T=(P=o.parameters)==null?void 0:P.docs)==null?void 0:T.source}}};var U,V,W;c.parameters={...c.parameters,docs:{...(U=c.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => <SimpleCalendar config={null as any} />,
  parameters: {
    docs: {
      description: {
        story: 'SimpleCalendar with null config - should work with minimal defaults.'
      }
    }
  }
}`,...(W=(V=c.parameters)==null?void 0:V.docs)==null?void 0:W.source}}};var D,_,q;u.parameters={...u.parameters,docs:{...(D=u.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <SimpleCalendar config={{
    visibleMonths: undefined,
    displayMode: null as any,
    selectionMode: 'range'
  }} />,
  parameters: {
    docs: {
      description: {
        story: 'SimpleCalendar with partial config containing nulls - should handle gracefully.'
      }
    }
  }
}`,...(q=(_=u.parameters)==null?void 0:_.docs)==null?void 0:q.source}}};var O,B,F;p.parameters={...p.parameters,docs:{...(O=p.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <CLACalendar settings={createMinimalCalendar({
    onSubmit: (start, end) => console.log('Selected:', start, end),
    defaultRange: {
      start: '2024-01-10'
    }
  })} />,
  parameters: {
    docs: {
      description: {
        story: 'Using createMinimalCalendar helper for the simplest possible setup.'
      }
    }
  }
}`,...(F=(B=p.parameters)==null?void 0:B.docs)==null?void 0:F.source}}};var G,J,K;m.parameters={...m.parameters,docs:{...(G=m.parameters)==null?void 0:G.docs,source:{originalSource:`{
  render: () => <CLACalendar settings={createCalendarSettings({
    defaultRange: {
      start: '2024-01-20',
      end: '2024-01-10' // End before start
    }
  })} />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar with invalid date range - should handle gracefully.'
      }
    }
  }
}`,...(K=(J=m.parameters)==null?void 0:J.docs)==null?void 0:K.source}}};var Q,X,Y;g.parameters={...g.parameters,docs:{...(Q=g.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  render: () => <CLACalendar settings={createCalendarSettings({
    layers: [null as any, {
      name: 'Valid Layer',
      title: 'This layer is valid',
      description: 'Should work fine'
    }, undefined as any, {
      // Missing required fields
      name: ''
    } as any]
  })} />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar with malformed layers array containing nulls and invalid objects.'
      }
    }
  }
}`,...(Y=(X=g.parameters)==null?void 0:X.docs)==null?void 0:Y.source}}};var Z,$,ee;y.parameters={...y.parameters,docs:{...(Z=y.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  render: () => <CLACalendar settings={createCalendarSettings({
    visibleMonths: 999,
    // Too high
    monthWidth: -100,
    // Negative
    colors: {
      primary: null as any,
      success: '',
      // Empty string
      warning: 'invalid-color'
    }
  })} />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar with extreme/invalid values - should sanitize to safe bounds.'
      }
    }
  }
}`,...(ee=($=y.parameters)==null?void 0:$.docs)==null?void 0:ee.source}}};const ue=["NullSettings","UndefinedSettings","EmptySettings","InvalidNumbers","NullArrays","EmptyLayers","MixedNullProperties","SimpleNullConfig","SimplePartialConfig","MinimalCalendarHelper","InvalidDateRange","MalformedLayers","ExtremeValues"];export{d as EmptyLayers,t as EmptySettings,y as ExtremeValues,m as InvalidDateRange,i as InvalidNumbers,g as MalformedLayers,p as MinimalCalendarHelper,o as MixedNullProperties,l as NullArrays,r as NullSettings,c as SimpleNullConfig,u as SimplePartialConfig,s as UndefinedSettings,ue as __namedExportsOrder,ce as default};
