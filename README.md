# CLA Calendar

A flexible and feature-rich date range picker component for React with drag selection support.

## Features

- 📅 **Date Range Selection**: Support for both single date and date range selection modes
- 🎯 **Drag Selection**: Intuitive drag-to-select functionality for date ranges
- 🌍 **UTC-First Design**: Built-in UTC timezone handling to prevent date display issues
- 🎨 **Customizable**: Extensive theming options and style customization
- 📱 **Responsive**: Works seamlessly across different screen sizes
- 🚀 **TypeScript**: Full TypeScript support with comprehensive type definitions
- 🔒 **Date Restrictions**: Multiple restriction types (boundary, date ranges, weekdays)
- 📊 **Data Layers**: Support for events, backgrounds, and custom visualizations
- 🪟 **Display Modes**: Both embedded and popup calendar modes
- ♿ **Accessible**: Keyboard navigation and screen reader support

## Installation

```bash
npm install cla-calendar
# or
yarn add cla-calendar
# or
pnpm add cla-calendar
```

## Peer Dependencies

This package requires the following peer dependencies:

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

function App() {
  const handleDateSubmit = (start: string | null, end: string | null) => {
    console.log('Selected dates:', start, end);
  };

  return (
    <CLACalendar 
      settings={{
        ...getDefaultSettings(),
        onSubmit: handleDateSubmit
      }}
    />
  );
}
```

## Basic Usage

### Single Date Selection

```tsx
<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    selectionMode: 'single',
    onSubmit: (start, end) => {
      console.log('Selected date:', start);
    }
  }}
/>
```

### Date Range Selection

```tsx
<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    selectionMode: 'range',
    onSubmit: (start, end) => {
      console.log('Date range:', start, 'to', end);
    }
  }}
/>
```

### Popup Mode

```tsx
<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'popup',
    position: 'bottom-left',
    onSubmit: (start, end) => {
      console.log('Selected:', start, end);
    }
  }}
/>
```

## Advanced Features

### Date Restrictions

```tsx
<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    restrictionConfigFactory: () => ({
      restrictions: [
        {
          type: 'boundary',
          enabled: true,
          direction: 'before',
          date: '2024-01-01',
          message: 'Please select a date after January 1, 2024'
        },
        {
          type: 'weekday',
          enabled: true,
          days: [0, 6], // Disable weekends
          message: 'Weekends are not available'
        }
      ]
    })
  }}
/>
```

### Custom Theming

```tsx
<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    colors: {
      primary: '#007bff',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545'
    },
    monthWidth: 350,
    baseFontSize: '16px'
  }}
/>
```

### Event Layers

```tsx
<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    layers: [
      {
        name: 'holidays',
        title: 'Public Holidays',
        description: 'Federal holidays',
        visible: true,
        data: {
          events: [
            {
              date: '2024-12-25',
              title: 'Christmas',
              type: 'holiday',
              time: 'All day',
              description: 'Federal holiday',
              color: '#dc3545'
            }
          ]
        }
      }
    ]
  }}
/>
```

### External Input Binding

```tsx
const dateInputRef = useRef<HTMLInputElement>(null);

return (
  <>
    <input 
      ref={dateInputRef} 
      type="text" 
      placeholder="Select date"
    />
    <CLACalendar 
      settings={{
        ...getDefaultSettings(),
        displayMode: 'popup',
        externalInput: dateInputRef
      }}
    />
  </>
);
```

## Configuration Options

The calendar accepts a comprehensive settings object. Here are the key options:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `displayMode` | `'embedded' \| 'popup'` | `'embedded'` | How the calendar is displayed |
| `selectionMode` | `'single' \| 'range'` | `'range'` | Date selection mode |
| `visibleMonths` | `number` | `2` | Number of months to display (1-12) |
| `monthWidth` | `number` | `500` | Width of each month in pixels |
| `timezone` | `string` | `'UTC'` | Timezone for date operations |
| `showHeader` | `boolean` | `true` | Show calendar header |
| `showFooter` | `boolean` | `true` | Show calendar footer |
| `showTooltips` | `boolean` | `true` | Show hover tooltips |
| `startWeekOnSunday` | `boolean` | `false` | Start week on Sunday vs Monday |
| `onSubmit` | `function` | - | Callback when dates are submitted |

For a complete list of options, see the TypeScript definitions.

## Restriction Types

The calendar supports five types of date restrictions:

1. **Boundary**: Set minimum/maximum selectable dates
2. **Date Range**: Block specific date ranges
3. **Allowed Ranges**: Only allow selection within specific ranges
4. **Restricted Boundary**: Complex rules with exceptions
5. **Weekday**: Block specific days of the week

## UTC Date Handling

The calendar enforces UTC timezone by default for all date operations to ensure consistent behavior across different timezones. This prevents the "day off bug" where dates appear on wrong calendar days due to timezone conversions.

Key benefits:
- Dates always appear on the correct calendar day regardless of user timezone
- Date selections are preserved accurately across timezone boundaries
- No daylight saving time transition issues

The calendar can be configured to use other timezones by setting the `timezone` property in settings.

## CSS Customization

The calendar uses CSS classes that can be overridden for custom styling:

```css
/* Calendar container */
.cla-calendar-wrapper { }

/* Month grid */
.calendar-month { }

/* Day cells */
.calendar-day { }
.calendar-day.selected { }
.calendar-day.restricted { }
.calendar-day.today { }

/* Popup mode */
.cla-calendar-portal { }
```

## TypeScript Support

This package includes comprehensive TypeScript definitions. Import types as needed:

```tsx
import type { 
  CalendarSettings, 
  Layer, 
  Event,
  RestrictionConfig 
} from 'cla-calendar';
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build library
npm run build

# Run Storybook
npm run storybook
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/your-org/cla-calendar/issues).