import{C as f,c as k,j as e,S as t}from"./CLACalendar-a752fb7f.js";import{r as w}from"./index-8a57d176.js";import"./index-6700e26c.js";import"./_commonjsHelpers-725317a4.js";/* empty css                           */const F={title:"Calendar/Interactive Playground",component:f,parameters:{layout:"padded",docs:{description:{component:"Interactive playground for testing all calendar features with live controls."}}}},r={render:n=>{const[o,l]=w.useState({start:null,end:null}),d=k({displayMode:n.displayMode||"embedded",visibleMonths:n.visibleMonths||2,selectionMode:n.selectionMode||"range",showSubmitButton:n.showSubmitButton||!1,showHeader:n.showHeader??!0,showFooter:n.showFooter??!0,showTooltips:n.showTooltips??!0,startWeekOnSunday:n.startWeekOnSunday||!1,colors:{primary:n.primaryColor||"#0366d6",success:n.successColor||"#28a745",warning:n.warningColor||"#f6c23e",danger:n.dangerColor||"#dc3545"},layers:n.showEvents?[{name:"Events",title:"Sample Events",description:"Example events layer",visible:!0,data:{events:[{date:"2024-01-15",title:"Team Meeting",type:"meeting",time:"10:00 AM",description:"Weekly team sync",color:"#3B82F6"},{date:"2024-01-20",title:"Project Deadline",type:"deadline",time:"5:00 PM",description:"Sprint deadline",color:"#EF4444"}],background:[{startDate:"2024-01-10",endDate:"2024-01-12",color:"#FEF3C7"}]}}]:void 0});return e.jsxs("div",{style:{padding:"20px"},children:[e.jsx(f,{settings:d,onSubmit:(c,j)=>{l({start:c,end:j})}}),o.start&&e.jsxs("div",{style:{marginTop:"20px",padding:"10px",backgroundColor:"#f0f0f0",borderRadius:"4px"},children:[e.jsx("strong",{children:"Selected Range:"}),e.jsx("br",{}),"Start: ",o.start,e.jsx("br",{}),"End: ",o.end]})]})},args:{displayMode:"embedded",visibleMonths:2,selectionMode:"range",showSubmitButton:!0,showHeader:!0,showFooter:!0,showTooltips:!0,startWeekOnSunday:!1,showEvents:!0,primaryColor:"#0366d6",successColor:"#28a745",warningColor:"#f6c23e",dangerColor:"#dc3545"},argTypes:{displayMode:{control:{type:"select"},options:["embedded","popup"],description:"Calendar display mode"},visibleMonths:{control:{type:"range",min:1,max:6},description:"Number of months to display"},selectionMode:{control:{type:"select"},options:["single","range"],description:"Date selection mode"},showSubmitButton:{control:"boolean",description:"Show submit button"},showHeader:{control:"boolean",description:"Show calendar header"},showFooter:{control:"boolean",description:"Show calendar footer"},showTooltips:{control:"boolean",description:"Show tooltips on hover"},startWeekOnSunday:{control:"boolean",description:"Start week on Sunday"},showEvents:{control:"boolean",description:"Show sample events layer"},primaryColor:{control:"color",description:"Primary theme color"},successColor:{control:"color",description:"Success theme color"},warningColor:{control:"color",description:"Warning theme color"},dangerColor:{control:"color",description:"Danger theme color"}}},s={render:n=>{const[o,l]=w.useState({start:null,end:null});return e.jsxs("div",{style:{padding:"20px"},children:[e.jsx(t,{config:{displayMode:n.displayMode||"embedded",visibleMonths:n.visibleMonths||1,selectionMode:n.selectionMode||"range",showSubmitButton:n.showSubmitButton||!1,startWeekOnSunday:n.startWeekOnSunday||!1,colors:{primary:n.primaryColor||"#0366d6"}},onSubmit:(d,c)=>{l({start:d,end:c})}}),o.start&&e.jsxs("div",{style:{marginTop:"20px",padding:"10px",backgroundColor:"#f0f0f0",borderRadius:"4px"},children:[e.jsx("strong",{children:"Selected:"}),e.jsx("br",{}),n.selectionMode==="single"?`Date: ${o.start}`:`Range: ${o.start} to ${o.end}`]})]})},args:{displayMode:"embedded",visibleMonths:1,selectionMode:"range",showSubmitButton:!0,startWeekOnSunday:!1,primaryColor:"#0366d6"},argTypes:{displayMode:{control:{type:"select"},options:["embedded","popup"],description:"Calendar display mode"},visibleMonths:{control:{type:"range",min:1,max:3},description:"Number of months to display"},selectionMode:{control:{type:"select"},options:["single","range"],description:"Date selection mode"},showSubmitButton:{control:"boolean",description:"Show submit button"},startWeekOnSunday:{control:"boolean",description:"Start week on Sunday"},primaryColor:{control:"color",description:"Primary theme color"}}},i={render:()=>e.jsxs("div",{style:{padding:"20px"},children:[e.jsx("h3",{children:"Configuration Comparison"}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))",gap:"20px"},children:[e.jsxs("div",{children:[e.jsx("h4",{children:"Minimal Configuration"}),e.jsx(t,{})]}),e.jsxs("div",{children:[e.jsx("h4",{children:"Single Date Selection"}),e.jsx(t,{config:{selectionMode:"single",visibleMonths:1,showSubmitButton:!0}})]}),e.jsxs("div",{children:[e.jsx("h4",{children:"Multiple Months"}),e.jsx(t,{config:{visibleMonths:2,selectionMode:"range"}})]}),e.jsxs("div",{children:[e.jsx("h4",{children:"Custom Theme"}),e.jsx(t,{config:{visibleMonths:1,colors:{primary:"#9333EA",success:"#059669"}}})]})]})]}),parameters:{layout:"fullscreen"}},a={render:()=>e.jsxs("div",{style:{padding:"20px"},children:[e.jsx("h3",{children:"Performance Test - Multiple Calendars"}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",gap:"20px"},children:Array.from({length:6},(n,o)=>e.jsxs("div",{children:[e.jsxs("h4",{children:["Calendar ",o+1]}),e.jsx(t,{config:{visibleMonths:1,selectionMode:o%2===0?"single":"range",colors:{primary:`hsl(${o*60}, 70%, 50%)`}}})]},o))})]}),parameters:{layout:"fullscreen"}};var p,u,m;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: args => {
    const [selectedRange, setSelectedRange] = useState<{
      start: string | null;
      end: string | null;
    }>({
      start: null,
      end: null
    });
    const settings = createCalendarSettings({
      displayMode: args.displayMode || 'embedded',
      visibleMonths: args.visibleMonths || 2,
      selectionMode: args.selectionMode || 'range',
      showSubmitButton: args.showSubmitButton || false,
      showHeader: args.showHeader ?? true,
      showFooter: args.showFooter ?? true,
      showTooltips: args.showTooltips ?? true,
      startWeekOnSunday: args.startWeekOnSunday || false,
      colors: {
        primary: args.primaryColor || '#0366d6',
        success: args.successColor || '#28a745',
        warning: args.warningColor || '#f6c23e',
        danger: args.dangerColor || '#dc3545'
      },
      layers: args.showEvents ? [{
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
      }] : undefined
    });
    return <div style={{
      padding: '20px'
    }}>
        <CLACalendar settings={settings} onSubmit={(start, end) => {
        setSelectedRange({
          start,
          end
        });
      }} />
        {selectedRange.start && <div style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px'
      }}>
            <strong>Selected Range:</strong>
            <br />
            Start: {selectedRange.start}
            <br />
            End: {selectedRange.end}
          </div>}
      </div>;
  },
  args: {
    displayMode: 'embedded',
    visibleMonths: 2,
    selectionMode: 'range',
    showSubmitButton: true,
    showHeader: true,
    showFooter: true,
    showTooltips: true,
    startWeekOnSunday: false,
    showEvents: true,
    primaryColor: '#0366d6',
    successColor: '#28a745',
    warningColor: '#f6c23e',
    dangerColor: '#dc3545'
  },
  argTypes: {
    displayMode: {
      control: {
        type: 'select'
      },
      options: ['embedded', 'popup'],
      description: 'Calendar display mode'
    },
    visibleMonths: {
      control: {
        type: 'range',
        min: 1,
        max: 6
      },
      description: 'Number of months to display'
    },
    selectionMode: {
      control: {
        type: 'select'
      },
      options: ['single', 'range'],
      description: 'Date selection mode'
    },
    showSubmitButton: {
      control: 'boolean',
      description: 'Show submit button'
    },
    showHeader: {
      control: 'boolean',
      description: 'Show calendar header'
    },
    showFooter: {
      control: 'boolean',
      description: 'Show calendar footer'
    },
    showTooltips: {
      control: 'boolean',
      description: 'Show tooltips on hover'
    },
    startWeekOnSunday: {
      control: 'boolean',
      description: 'Start week on Sunday'
    },
    showEvents: {
      control: 'boolean',
      description: 'Show sample events layer'
    },
    primaryColor: {
      control: 'color',
      description: 'Primary theme color'
    },
    successColor: {
      control: 'color',
      description: 'Success theme color'
    },
    warningColor: {
      control: 'color',
      description: 'Warning theme color'
    },
    dangerColor: {
      control: 'color',
      description: 'Danger theme color'
    }
  }
}`,...(m=(u=r.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var g,h,y;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: args => {
    const [selectedRange, setSelectedRange] = useState<{
      start: string | null;
      end: string | null;
    }>({
      start: null,
      end: null
    });
    return <div style={{
      padding: '20px'
    }}>
        <SimpleCalendar config={{
        displayMode: args.displayMode || 'embedded',
        visibleMonths: args.visibleMonths || 1,
        selectionMode: args.selectionMode || 'range',
        showSubmitButton: args.showSubmitButton || false,
        startWeekOnSunday: args.startWeekOnSunday || false,
        colors: {
          primary: args.primaryColor || '#0366d6'
        }
      }} onSubmit={(start, end) => {
        setSelectedRange({
          start,
          end
        });
      }} />
        {selectedRange.start && <div style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px'
      }}>
            <strong>Selected:</strong>
            <br />
            {args.selectionMode === 'single' ? \`Date: \${selectedRange.start}\` : \`Range: \${selectedRange.start} to \${selectedRange.end}\`}
          </div>}
      </div>;
  },
  args: {
    displayMode: 'embedded',
    visibleMonths: 1,
    selectionMode: 'range',
    showSubmitButton: true,
    startWeekOnSunday: false,
    primaryColor: '#0366d6'
  },
  argTypes: {
    displayMode: {
      control: {
        type: 'select'
      },
      options: ['embedded', 'popup'],
      description: 'Calendar display mode'
    },
    visibleMonths: {
      control: {
        type: 'range',
        min: 1,
        max: 3
      },
      description: 'Number of months to display'
    },
    selectionMode: {
      control: {
        type: 'select'
      },
      options: ['single', 'range'],
      description: 'Date selection mode'
    },
    showSubmitButton: {
      control: 'boolean',
      description: 'Show submit button'
    },
    startWeekOnSunday: {
      control: 'boolean',
      description: 'Start week on Sunday'
    },
    primaryColor: {
      control: 'color',
      description: 'Primary theme color'
    }
  }
}`,...(y=(h=s.parameters)==null?void 0:h.docs)==null?void 0:y.source}}};var b,S,v;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => {
    return <div style={{
      padding: '20px'
    }}>
        <h3>Configuration Comparison</h3>
        <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
          
          <div>
            <h4>Minimal Configuration</h4>
            <SimpleCalendar />
          </div>
          
          <div>
            <h4>Single Date Selection</h4>
            <SimpleCalendar config={{
            selectionMode: 'single',
            visibleMonths: 1,
            showSubmitButton: true
          }} />
          </div>
          
          <div>
            <h4>Multiple Months</h4>
            <SimpleCalendar config={{
            visibleMonths: 2,
            selectionMode: 'range'
          }} />
          </div>
          
          <div>
            <h4>Custom Theme</h4>
            <SimpleCalendar config={{
            visibleMonths: 1,
            colors: {
              primary: '#9333EA',
              success: '#059669'
            }
          }} />
          </div>
          
        </div>
      </div>;
  },
  parameters: {
    layout: 'fullscreen'
  }
}`,...(v=(S=i.parameters)==null?void 0:S.docs)==null?void 0:v.source}}};var M,x,C;a.parameters={...a.parameters,docs:{...(M=a.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => {
    return <div style={{
      padding: '20px'
    }}>
        <h3>Performance Test - Multiple Calendars</h3>
        <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
          {Array.from({
          length: 6
        }, (_, i) => <div key={i}>
              <h4>Calendar {i + 1}</h4>
              <SimpleCalendar config={{
            visibleMonths: 1,
            selectionMode: i % 2 === 0 ? 'single' : 'range',
            colors: {
              primary: \`hsl(\${i * 60}, 70%, 50%)\`
            }
          }} />
            </div>)}
        </div>
      </div>;
  },
  parameters: {
    layout: 'fullscreen'
  }
}`,...(C=(x=a.parameters)==null?void 0:x.docs)==null?void 0:C.source}}};const O=["FullPlayground","SimplePlayground","ConfigurationComparison","PerformanceTest"];export{i as ConfigurationComparison,r as FullPlayground,a as PerformanceTest,s as SimplePlayground,O as __namedExportsOrder,F as default};
