# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# CLA Calendar Widget

A flexible date range picker component for React with drag selection support.

## Features

- Date range selection with drag support
- Flexible date restrictions
- Multiple calendar layouts
- UTC timezone enforcement for consistent date handling

## UTC Date Handling

The application enforces UTC timezone for all date operations through a dedicated utility layer:

- All dates are handled in UTC timezone regardless of the user's local timezone
- Date creation, parsing, and formatting operations are wrapped with UTC handling
- The utility prevents timezone-related issues where the user's local timezone might affect date selection

### Technical Implementation

The UTC date handling approach in this application addresses several critical issues that can occur when working with dates in JavaScript:

1. **Timezone Inconsistencies**: JavaScript Date objects are affected by the user's local timezone, which can lead to inconsistent behavior across different timezones.

2. **DST Transitions**: Date calculations that span Daylight Saving Time transitions can introduce errors when days are skipped or duplicated.

3. **Calendar Display Issues**: When generating calendar days, timezone issues can result in showing too few days or missing days altogether.

Our solution employs several key techniques:

- **Clean Date Objects**: We create dates with only year/month/day components to avoid time-related timezone complications.
- **Manual Day Iteration**: For generating days in a date range, we use a custom implementation that ensures all days are properly included.
- **UTC Date Construction**: We consistently use `Date.UTC()` to create dates in UTC timezone.
- **Direct Component Comparison**: Functions like `isSameMonth()` compare the actual components (year, month) rather than relying on date equality.

The core implementation resides in `src/utils/UTCDateUtils.ts`, which provides UTC-aware versions of common date-fns functions:

```typescript
// Example of our robust date interval function that fixed calendar display issues
export const eachDayOfInterval = (interval: { start: Date; end: Date }): Date[] => {
  // Create clean dates without time components to avoid timezone issues
  const startDate = new Date(
    interval.start.getFullYear(),
    interval.start.getMonth(),
    interval.start.getDate()
  );
  
  const endDate = new Date(
    interval.end.getFullYear(),
    interval.end.getMonth(),
    interval.end.getDate()
  );
  
  // Manual day-by-day iteration ensures reliable results
  const days = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    days.push(new Date(currentDate)); // Clone to avoid mutation
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};
```

## Usage

```jsx
import { CLACalendar } from 'cla-calendar';

function App() {
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  
  return (
    <CLACalendar 
      onChange={setDateRange} 
      value={dateRange}
    />
  );
}
```

### Custom Date Formatting

You can customize how dates are displayed in the calendar input field by providing a `dateFormatter` function in the settings:

```jsx
import { CLACalendar } from 'cla-calendar';
import { getDefaultSettings } from 'cla-calendar';

function CustomFormattingExample() {
  const [settings, setSettings] = useState({
    ...getDefaultSettings(),
    // Custom formatter that displays dates in YYYY-MM-DD format
    dateFormatter: (date) => {
      const pad = (num) => String(num).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
  });
  
  return (
    <CLACalendar 
      settings={settings}
      onSettingsChange={setSettings}
    />
  );
}
```

The `dateFormatter` function receives a Date object and should return a formatted string. This allows you to implement any custom date formatting logic you need, such as:

- Different date formats (YYYY-MM-DD, DD/MM/YYYY, etc.)
- Localized date formats
- Custom date representations with additional context

## Date Functions

To ensure UTC timezone handling, all date operations should use the utility functions from `src/utils/UTCDateUtils.ts` instead of directly using date-fns:

```js
// Import from the utility layer instead of date-fns directly
import { 
  format, 
  parseISO, 
  addDaysUTC 
} from '../utils/UTCDateUtils';

// Creates a date in UTC
const today = now();

// Format a date in UTC
const formattedDate = format(today, 'yyyy-MM-dd');

// Parse an ISO string to a UTC date
const parsedDate = parseISO('2023-12-31');
```
