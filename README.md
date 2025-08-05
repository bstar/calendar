<div align="center">
  <h1>CLA Calendar</h1>
  <p>
    <strong>Advanced React date picker with range selection, external input binding, restrictions, and layer support</strong>
  </p>
  <p>
    <a href="https://www.npmjs.com/package/cla-calendar">
      <img src="https://img.shields.io/npm/v/cla-calendar.svg" alt="npm version" />
    </a>
    <a href="https://bundlephobia.com/package/cla-calendar">
      <img src="https://img.shields.io/bundlephobia/minzip/cla-calendar.svg" alt="Bundle Size" />
    </a>
    <a href="https://github.com/your-org/cla-calendar/actions">
      <img src="https://github.com/your-org/cla-calendar/workflows/CI/badge.svg" alt="CI Status" />
    </a>
    <a href="https://codecov.io/gh/your-org/cla-calendar">
      <img src="https://codecov.io/gh/your-org/cla-calendar/branch/main/graph/badge.svg" alt="Coverage" />
    </a>
  </p>
  <p>
    <a href="#key-features">Features</a> •
    <a href="#installation">Installation</a> •
    <a href="#api-reference">Documentation</a> •
    <a href="#demo">Demo</a>
  </p>
</div>

---

## Key Features

- **Date Selection**: Single date and date range modes with drag-to-select interaction and keyboard navigation
- **External Input Binding**: Seamlessly integrate with existing form inputs without changing HTML
- **Display Modes**: Both embedded and popup calendar modes for flexible integration
- **Date Restrictions**: Min/max boundaries, blackout ranges, weekday restrictions, and business day calculations
- **Data Layers**: Visualize events and background highlights with dynamic layer toggling
- **UTC-First Design**: Eliminates timezone bugs - dates always appear on the correct calendar day
- **Customization**: Theme configuration, custom date formatting, and CSS variable overrides
- **TypeScript**: Full type definitions with comprehensive IDE support
- **Performance**: Optimized re-renders, lazy loading support, ~85KB minified + gzipped
- **Production-Ready**: 90%+ test coverage with extensive documentation

## Why CLA Calendar?

- **UTC-First Design**: Eliminates timezone bugs - dates always appear on the correct calendar day
- **External Input Binding**: Seamlessly integrate with existing forms without changing HTML
- **Flexible Display Modes**: Use as embedded component or popup - perfect for form fields
- **Modular Architecture**: Clean separation of concerns with TypeScript throughout
- **Production-Ready**: Battle-tested with comprehensive test coverage

## Installation

```bash
npm install cla-calendar
```


```bash
pnpm add cla-calendar
```

### Peer Dependencies

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "date-fns": "^4.1.0",
  "date-fns-tz": "^3.2.0",
  "lodash-es": "^4.17.0"
}
```

## Quick Start

```tsx
import { CLACalendar, getDefaultSettings } from 'cla-calendar';
import 'cla-calendar/dist/index.css';

function DateSelector() {
  const [settings, setSettings] = useState({
    ...getDefaultSettings(),
    displayMode: 'popup',
    visibleMonths: 2,
    selectionMode: 'range'
  });
  
  const handleDateSubmit = (start, end) => {
    console.log('Selected:', { start, end });
  };

  return (
    <CLACalendar 
      settings={{
        ...settings,
        onSubmit: handleDateSubmit
      }}
      _onSettingsChange={setSettings}
    />
  );
}
```

## Documentation

### Core Concepts

#### Display Modes

<table>
<tr>
<td>

**Embedded Mode**
```tsx
<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 2
  }}
/>
```

</td>
<td>

**Popup Mode**
```tsx
<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'popup',
    position: 'bottom-left',
    useDynamicPosition: true
  }}
/>
```

</td>
</tr>
</table>

#### External Input Binding

Seamlessly integrate with existing forms without changing your HTML:

```tsx
// Your existing form input
<input id="date-field" type="text" name="eventDate" />

// Add calendar functionality
<CLACalendar
  settings={{
    displayMode: 'popup',
    externalInputSelector: '#date-field',
    selectionMode: 'single',
    onSubmit: (date) => {
      console.log('Selected:', date);
    }
  }}
/>
```

#### Date Restrictions

Control which dates users can select:

```tsx
<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    restrictionConfigFactory: () => ({
      restrictions: [
        {
          type: 'boundary',
          enabled: true,
          minDate: '2024-01-01',
          maxDate: '2024-12-31'
        },
        {
          type: 'weekday',
          enabled: true,
          days: [0, 6], // Disable weekends
          message: 'Weekends are not available'
        },
        {
          type: 'daterange',
          enabled: true,
          ranges: [
            { start: '2024-12-24', end: '2024-12-26' }
          ],
          message: 'Holiday period'
        }
      ]
    })
  }}
/>
```

#### Event Layers

Visualize additional data on the calendar:

```tsx
<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    showLayersNavigation: true,
    layers: [
      {
        name: 'holidays',
        title: 'Public Holidays',
        description: 'Federal holidays',
        color: '#dc3545',
        visible: true,
        data: {
          events: [
            {
              date: '2024-12-25',
              title: 'Christmas',
              type: 'holiday',
              time: 'All day',
              description: 'Federal holiday'
            }
          ],
          background: [
            {
              startDate: '2024-12-24',
              endDate: '2024-12-26',
              color: 'rgba(220, 53, 69, 0.1)'
            }
          ]
        }
      }
    ]
  }}
/>
```

## API Reference

### CLACalendar Component

The main calendar component accepts the following props:

```typescript
interface CLACalendarProps {
  settings?: Partial<CalendarSettings>;
  _onSettingsChange?: (settings: CalendarSettings) => void;
  onMonthChange?: (visibleMonths: Date[]) => void;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `settings` | `Partial<CalendarSettings>` | No | Configuration object for the calendar |
| `_onSettingsChange` | `(settings: CalendarSettings) => void` | No | Callback when settings change internally |
| `onMonthChange` | `(visibleMonths: Date[]) => void` | No | Callback when visible months change |

### CalendarSettings

Complete configuration options for the calendar:

#### Core Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `displayMode` | `'popup' \| 'embedded'` | `'embedded'` | How the calendar is displayed |
| `timezone` | `string` | `'UTC'` | Timezone for date operations |
| `containerStyle` | `CSSProperties` | `undefined` | Custom styles for the container |
| `inputStyle` | `CSSProperties` | `undefined` | Custom styles for input field |
| `isOpen` | `boolean` | `false` | Control popup open state |
| `visibleMonths` | `number` | `2` | Number of months to display (1-12) |
| `monthWidth` | `number` | `500` | Width of each month in pixels |
| `showMonthHeadings` | `boolean` | `true` | Show month/year headers |
| `baseFontSize` | `string` | `'1rem'` | Base font size (e.g. '1rem', '16px') |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-left'` | Popup position relative to input |
| `useDynamicPosition` | `boolean` | `true` | Auto-adjust position based on viewport |

#### Selection Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `selectionMode` | `'single' \| 'range'` | `'range'` | Date selection mode |
| `showTooltips` | `boolean` | `true` | Show hover tooltips |
| `showHeader` | `boolean` | `true` | Show calendar header |
| `closeOnClickAway` | `boolean` | `true` | Close popup when clicking outside |
| `showSubmitButton` | `boolean` | `false` | Show submit button |
| `showFooter` | `boolean` | `true` | Show calendar footer |
| `enableOutOfBoundsScroll` | `boolean` | `false` | Allow scrolling beyond bounds |
| `suppressTooltipsOnSelection` | `boolean` | `false` | Hide tooltips during selection |
| `showSelectionAlert` | `boolean` | `false` | Show selection feedback |
| `startWeekOnSunday` | `boolean` | `false` | Week starts on Sunday vs Monday |
| `dateFormatter` | `(date: Date) => string` | `undefined` | Custom date formatter function |
| `dateRangeSeparator` | `string` | `' - '` | Separator for date ranges |
| `defaultRange` | `{ start: string; end: string }` | `undefined` | Initial selected date range |
| `showDateInputs` | `boolean` | `true` | Show Start/End Date input fields |
| `onSubmit` | `(startDate: string \| null, endDate: string \| null) => void` | `undefined` | Callback when dates are submitted |

#### External Input Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `externalInput` | `HTMLInputElement \| React.RefObject<HTMLInputElement>` | `undefined` | External input element to bind to |
| `externalInputSelector` | `string` | `undefined` | CSS selector to find external input |
| `updateExternalInput` | `boolean` | `true` | Update external input value on selection |
| `bindExternalInputEvents` | `boolean` | `true` | Bind click/focus events to external input |
| `inputClassName` | `string` | `undefined` | Custom className for calendar input field |
| `inputOnChange` | `(event: React.ChangeEvent<HTMLInputElement>) => void` | `undefined` | onChange handler for calendar input |

#### Layer Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `layers` | `Layer[]` | `[]` | Data layers to display |
| `showLayersNavigation` | `boolean` | `false` | Show layer toggle UI |
| `defaultLayer` | `string` | `undefined` | Initially active layer |
| `initialActiveLayer` | `string` | `undefined` | Initial active layer to display |
| `layersFactory` | `() => Layer[]` | `undefined` | Factory function for dynamic layers |

#### Style Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `colors` | `ColorTheme` | See below | Color theme configuration |
| `backgroundColors` | `BackgroundColors` | See below | Background color customization |

##### ColorTheme Interface

```typescript
interface ColorTheme {
  primary?: string;    // Default: '#0366d6'
  success?: string;    // Default: '#28a745'
  warning?: string;    // Default: '#f6c23e'
  danger?: string;     // Default: '#dc3545'
  purple?: string;     // Default: '#6f42c1'
  teal?: string;       // Default: '#20c997'
  orange?: string;     // Default: '#fd7e14'
  pink?: string;       // Default: '#e83e8c'
}
```

##### BackgroundColors Interface

```typescript
interface BackgroundColors {
  emptyRows?: string;        // Background for empty week rows
  monthHeader?: string;      // Background for month headers
  headerContainer?: string;  // Background for header input container
  dayCells?: string;         // Background for day cells
  selection?: string;        // Background for selected date range
  input?: string;            // Background for input fields
}
```

#### Restriction Settings

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `restrictionConfig` | `RestrictionConfig` | `undefined` | Date restriction configuration |
| `restrictionConfigFactory` | `() => RestrictionConfig` | `undefined` | Factory function for dynamic restrictions |

### Layer Interface

Layers allow overlaying additional data on the calendar:

```typescript
interface Layer {
  name: string;              // Unique identifier
  title: string;             // Display name
  description: string;       // Layer description
  required?: boolean;        // Cannot be hidden
  visible?: boolean;         // Initial visibility
  enabled?: boolean;         // Can be toggled
  color?: string;            // Layer theme color
  data?: LayerData;          // Layer data
}

interface LayerData {
  events?: EventData[];      // Event markers
  background?: BackgroundData[];  // Background highlights
}
```

#### EventData Interface

```typescript
interface EventData {
  date: string;              // YYYY-MM-DD format
  title: string;             // Event title
  type: string;              // Event type/category
  time: string;              // Time display string
  description: string;       // Event description
  color?: string;            // Custom color
}
```

#### BackgroundData Interface

```typescript
interface BackgroundData {
  startDate: string;         // YYYY-MM-DD format
  endDate: string;           // YYYY-MM-DD format
  color: string;             // Background color
}
```

### RestrictionConfig Interface

Configure date selection restrictions:

```typescript
interface RestrictionConfig {
  restrictions: Restriction[];
}
```

### Restriction Types

The calendar supports five types of restrictions:

#### 1. DateRangeRestriction

Block specific date ranges:

```typescript
interface DateRangeRestriction {
  type: 'daterange';
  enabled: boolean;
  ranges: {
    startDate: string;       // YYYY-MM-DD format
    endDate: string;         // YYYY-MM-DD format
    message?: string;        // Custom message for this range
  }[];
  message?: string;          // Default message for all ranges
}
```

#### 2. BoundaryRestriction

Set minimum or maximum selectable dates:

```typescript
interface BoundaryRestriction {
  type: 'boundary';
  enabled: boolean;
  date: string;              // YYYY-MM-DD format
  direction: 'before' | 'after';
  inclusive?: boolean;       // Include the boundary date
  message?: string;          // Restriction message
}
```

#### 3. AllowedRangesRestriction

Only allow selection within specific ranges:

```typescript
interface AllowedRangesRestriction {
  type: 'allowedranges';
  enabled: boolean;
  ranges: {
    startDate: string;       // YYYY-MM-DD format
    endDate: string;         // YYYY-MM-DD format
    message?: string;        // Custom message for this range
  }[];
  message?: string;          // Default message
}
```

#### 4. RestrictedBoundaryRestriction

Complex boundary rules with exceptions:

```typescript
interface RestrictedBoundaryRestriction {
  type: 'restricted_boundary';
  enabled: boolean;
  minDate?: string;          // YYYY-MM-DD format
  maxDate?: string;          // YYYY-MM-DD format
  ranges: {
    startDate: string;       // YYYY-MM-DD format
    endDate: string;         // YYYY-MM-DD format
    message?: string;
    restricted?: boolean;
    exceptions?: {
      startDate: string;
      endDate: string;
      message?: string;
    }[];
  }[];
  message?: string;          // Default message
}
```

#### 5. WeekdayRestriction

Block specific days of the week:

```typescript
interface WeekdayRestriction {
  type: 'weekday';
  enabled: boolean;
  days: number[];            // 0-6 for Sunday-Saturday
  message?: string;          // Restriction message
}
```

### Helper Functions

#### getDefaultSettings()

Returns default calendar settings:

```typescript
function getDefaultSettings(): CalendarSettings
```

The default settings include:
- Embedded display mode
- 2 visible months
- Range selection mode
- UTC timezone
- Standard color palette
- All UI elements visible

### Date Format

All dates in the API use the `YYYY-MM-DD` format (ISO 8601 date format) for consistency. The calendar handles timezone conversions internally based on the `timezone` setting.

### Advanced Features

<details>
<summary><strong>Custom Themes</strong></summary>

```tsx
const customTheme = {
  colors: {
    primary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    teal: '#14B8A6',
    orange: '#F97316',
    pink: '#EC4899'
  },
  baseFontSize: '14px',
  monthWidth: 350,
  containerStyle: {
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }
};

<CLACalendar settings={{ ...getDefaultSettings(), ...customTheme }} />
```

</details>

<details>
<summary><strong>Restriction Types</strong></summary>

| Type | Description | Use Case |
|------|-------------|----------|
| `boundary` | Min/max date limits | Booking windows |
| `daterange` | Block specific ranges | Holidays, maintenance |
| `allowedRanges` | Only allow certain ranges | Available slots |
| `restrictedBoundary` | Complex boundary rules | Business logic |
| `weekday` | Block days of week | Business days only |

</details>

<details>
<summary><strong>UTC Date Handling</strong></summary>

The calendar uses UTC by default to prevent timezone issues:

```tsx
// All dates are handled in UTC
const settings = {
  timezone: 'UTC', // Default
  onSubmit: (start, end) => {
    // start and end are YYYY-MM-DD strings in UTC
    console.log('UTC dates:', { start, end });
  }
};

// Or use a specific timezone
const settings = {
  timezone: 'America/New_York',
  onSubmit: (start, end) => {
    // Dates will be in New York timezone
    console.log('NY dates:', { start, end });
  }
};
```

</details>

## Demo

[Live Storybook Demo](https://your-org.github.io/cla-calendar/) - Interactive examples and documentation

### Example Implementations

- [Basic Date Range Picker](https://codesandbox.io/s/cla-calendar-basic)
- [External Input Integration](https://codesandbox.io/s/cla-calendar-external)
- [Custom Theme Example](https://codesandbox.io/s/cla-calendar-theme)
- [Event Layers Demo](https://codesandbox.io/s/cla-calendar-layers)

## Browser Support

| Browser | Version |
|---------|--------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| Mobile Safari | 14+ |
| Chrome Android | Latest |

## Development

### Prerequisites

- Node.js 18+
- npm 8+ or yarn 1.22+ or pnpm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/cla-calendar.git
cd cla-calendar

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Build library
npm run build

# Run Storybook
npm run storybook
```

### Project Structure

```
cla-calendar/
├── src/
│   ├── components/           # React components
│   │   ├── CLACalendar.tsx  # Main component
│   │   └── CLACalendarComponents/
│   │       ├── handlers/    # Event handlers
│   │       ├── layers/      # Layer system
│   │       ├── restrictions/# Date restrictions
│   │       └── selection/   # Selection logic
│   ├── utils/               # Utilities
│   │   └── DateUtils.ts     # UTC date handling
│   ├── stories/             # Storybook stories
│   └── index.ts             # Library entry
├── test/                    # Test files
├── .storybook/              # Storybook config
└── docs/                    # Documentation
```




