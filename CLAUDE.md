# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CLA Calendar is a flexible React date range picker component with drag selection support. The project has undergone significant TypeScript migration and now includes a robust UTC date handling system to ensure consistent behavior across timezones.

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build the library for distribution
npm run build

# Testing commands
npm test                # Run tests once
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage report

# Linting commands
npm run lint            # Lint specific example file
npm run lint:all        # Lint all TypeScript/JavaScript files
npm run lint:fix        # Auto-fix linting issues

# Install dependencies
npm install
```

## Architecture & Structure

### TypeScript Migration Status
The project is actively migrating to TypeScript. Current state:
- Build system configured for TypeScript (`.ts` and `.tsx` files)
- Entry point: `src/index.ts`
- Main app: `src/App.tsx` and `src/main.tsx`
- Utils fully migrated: `src/utils/DateUtils.ts`

### UTC Date Handling System
**CRITICAL**: This project enforces UTC timezone for all date operations through a custom utility layer (`src/utils/DateUtils.ts`). This addresses timezone inconsistencies, DST transitions, and calendar display issues.

Key functions to use instead of date-fns directly:
- `eachDayOfInterval` - Generates date ranges without timezone issues
- `format`, `parseISO` - UTC-aware date formatting and parsing
- `addDaysUTC`, `now` - UTC date manipulation

### Component Architecture

#### Legacy Component (Being Replaced)
- `src/components/DateRangePicker.jsx` - Original monolithic component
- `src/components/DateRangePicker.config.ts` - Configuration system

#### New Architecture (In Progress)
`src/components/DateRangePickerNew/` - Modular TypeScript implementation:
- **Layer System**: `layers/` - Data visualization layers with visibility controls
- **Restrictions**: `restrictions/` - Date validation and restriction management
- **Selection**: `selection/` - Date range selection logic
- **Handlers**: `handlers/` - Event handling separation
- **Portal System**: `CalendarPortal.tsx`, `PortalCalendar.tsx` - Popup rendering

### Build System
- **Development**: Vite with TypeScript support
- **Production**: Rollup with TypeScript plugin
- **Entry Points**:
  - `src/main.tsx` - Demo app entry
  - `src/index.ts` - Library export

### Key Technologies
- React 18.x with TypeScript
- date-fns and date-fns-tz for date operations (wrapped by UTC utilities)
- lodash-es for utilities
- TypeScript for type safety
- ESLint with TypeScript support
- Storybook v9 for component documentation and development

## Important Development Notes

### UTC Date Handling
**Always use the UTC utility functions from `src/utils/DateUtils.ts`** instead of date-fns directly:

```typescript
// DON'T DO THIS
import { format } from 'date-fns';

// DO THIS
import { format, eachDayOfInterval } from './utils/DateUtils';
```

### TypeScript Guidelines
- Use strict type checking
- Avoid `any` types (ESLint will warn)
- Follow existing type patterns in the new components
- Unused variables should be prefixed with `_`

### Component Development
When working on the new architecture:
1. Check existing layers in `DateRangePickerNew/layers/`
2. Follow the LayerManager pattern for new features
3. Use the restriction system for date validations
4. Implement handlers separately from components

### Testing
- Jest configured with TypeScript support (`ts-jest`)
- Place tests adjacent to components or in `test/` directory
- Focus on UTC date handling edge cases

### Linting
ESLint is configured with TypeScript support:
- TypeScript ESLint parser and rules
- React hooks validation
- Warnings for `console.log` and `any` types
- Auto-fixable with `npm run lint:fix`

## Custom Date Formatting

The project supports custom date formatting through the `dateFormatter` function in settings. This allows flexible date display formats while maintaining UTC consistency internally.

## Storybook Development

### Storybook v9 Best Practices

The project uses Storybook v9 for component documentation and development. **IMPORTANT**: With our installed packages (`@storybook/addon-docs` v9.0.16), imports must use the correct paths.

#### MDX Files (Documentation)
```typescript
// CORRECT imports for our Storybook v9 setup
import { Meta, Story, Canvas } from '@storybook/addon-docs/blocks';
import * as YourComponentStories from './YourComponent.stories';

// INCORRECT - these will cause import errors
// import { Meta } from '@storybook/blocks';  // Package not installed
// import { Meta } from '@storybook/addon-docs';  // Wrong export path
```

#### Story Files (.stories.tsx)
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { calendarArgTypes, defaultArgs } from './shared/storyControls';
import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';

const meta: Meta<typeof CLACalendar> = {
  title: 'Category/ComponentName',
  component: CLACalendar,
  argTypes: calendarArgTypes,  // Use shared controls
  args: defaultArgs,           // Use shared defaults
  parameters: {
    docs: {
      description: {
        component: 'Component description here'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Use the shared wrapper for consistent story rendering
export const Default: Story = {
  render: (args) => <CalendarStoryWrapper args={args} />
};
```

#### MDX File Structure
```mdx
import { Meta, Story, Canvas } from '@storybook/addon-docs/blocks';
import * as ComponentStories from './Component.stories';

<Meta of={ComponentStories} />

# Component Name

Component description...

## Basic Usage

<Canvas>
  <Story of={ComponentStories.Default} />
</Canvas>

## Props

Component props documentation...
```

#### Beautiful Tables in MDX Documentation

**SUCCESS**: We've developed a clean, parser-friendly approach for tables in Storybook MDX that creates beautiful, readable documentation without breaking the build.

##### The Winning Formula

```html
<!-- Clean HTML table structure that works perfectly -->
<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>propertyName</td>
        <td>string</td>
        <td>'default'</td>
        <td>Description of the property</td>
      </tr>
      <tr>
        <td>displayMode</td>
        <td>'embedded' or 'popup'</td>
        <td>'embedded'</td>
        <td>How the calendar is displayed</td>
      </tr>
    </tbody>
  </table>
</div>
```

##### Table Styling (in `.storybook/preview.css`)

```css
/* Beautiful GitHub-style tables */
.sbdocs-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  font-size: 0.9em;
}

.sbdocs-content th,
.sbdocs-content td {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid #e1e4e8;
}

.sbdocs-content th {
  font-weight: 600;
  background-color: #f6f8fa;
}

.sbdocs-content tbody tr:hover {
  background-color: #f6f8fa;
}

/* Monospace font for property names */
.sbdocs-content td:first-child {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.85em;
  color: #0969da;
}
```

##### Key Rules for MDX Tables

1. **Keep It Simple**:
   - Plain text in cells (no `<code>` tags needed)
   - First column automatically gets monospace styling
   - Hover effects for better readability

2. **Avoid Parser Breakers**:
   - NO markdown tables (`| col | col |`)
   - NO `<code>` tags inside table cells
   - NO HTML entities (`&gt;`, `&lt;`, `&amp;`)
   - NO pipe characters in content - use "or" instead

3. **Type Descriptions**:
   - Instead of: `'option1' | 'option2' | 'option3'`
   - Write: `'option1' or 'option2' or 'option3'`
   - Or just list the values: `'bottom-left', 'bottom-right', 'top-left', 'top-right'`

4. **Complex Types**:
   - Keep table cells simple (e.g., "Function" or "object")
   - Explain details in prose or code blocks after the table

5. **Consistent Structure**:
   - Always wrap tables in a `<div>` with a className
   - Use semantic table structure (thead, tbody)
   - Keep column headers consistent across similar tables

##### Example: Different Table Types

```html
<!-- Props table -->
<div className="props-table">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Required</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>settings</td>
        <td>CalendarSettings</td>
        <td>Yes</td>
        <td>Configuration object for the calendar</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Settings table -->
<div className="settings-table">
  <table>
    <thead>
      <tr>
        <th>Property</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>visibleMonths</td>
        <td>number</td>
        <td>2</td>
        <td>Number of months to display (1-12)</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Simple feature table -->
<div className="feature-table">
  <table>
    <thead>
      <tr>
        <th>Feature</th>
        <th>Enabled</th>
        <th>Default</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>showHeader</td>
        <td>boolean</td>
        <td>true</td>
      </tr>
    </tbody>
  </table>
</div>
```

This approach creates professional-looking documentation tables that:
- Parse correctly in Storybook v9
- Look beautiful with GitHub-style formatting
- Are easy to read and maintain
- Don't require complex escaping or special handling

### Shared Story Infrastructure

To maintain consistency across all calendar stories, use the shared infrastructure:

#### 1. Shared Controls (`src/stories/shared/storyControls.ts`)
Provides comprehensive ArgTypes and default args for all calendar properties:
```typescript
import { calendarArgTypes, defaultArgs } from './shared/storyControls';
```

#### 2. Story Wrapper (`src/stories/shared/CalendarStoryWrapper.tsx`)
Handles state management and consistent rendering:
```typescript
import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';

export const YourStory: Story = {
  render: (args) => (
    <CalendarStoryWrapper 
      args={args}
      title="Optional Title"
      description="Optional description"
      showSelectedDate={true}  // Show selection feedback
    />
  )
};
```

### Handling Calendar Width in Docs

The calendar component has a default width of 500px per month. With 2 visible months (default), this creates a 1000px+ wide component. To handle this in Storybook docs:

#### Preview Styles (`.storybook/preview.css`)
```css
/* Force Storybook docs to handle wide content */
.sbdocs.sbdocs-wrapper {
  max-width: none !important;
  overflow-x: auto !important;
}

/* Make story previews handle calendar width properly */
.docs-story {
  min-width: fit-content !important;
  overflow-x: auto !important;
}

/* Calendar specific fixes in docs */
.cla-calendar-wrapper {
  display: inline-block;
}
```

#### Story Wrapper Best Practices
- Don't force width: 100% on containers
- Let the calendar determine its natural width
- Use minimal wrapper styling:
```tsx
<div style={{ padding: '20px', ...containerStyle }}>
  <CLACalendar {...props} />
</div>
```

### Common Storybook Issues and Solutions

#### 1. Import Errors in MDX Files
**Problem**: `Failed to resolve import '@storybook/blocks'`
**Solution**: Use `@storybook/addon-docs/blocks` instead

#### 2. Meta Import Not Found
**Problem**: `Importing binding name 'Meta' is not found`
**Solution**: Import all components together:
```typescript
import { Meta, Story, Canvas } from '@storybook/addon-docs/blocks';
```

#### 3. Horizontal Scrollbars in Docs
**Problem**: Calendar creates unwanted horizontal scrollbars
**Solution**: 
- Use the preview.css styles provided above
- Don't force containers to 100% width
- Let Storybook's docs container handle overflow

#### 4. Inconsistent Story Controls
**Problem**: Different stories have different control configurations
**Solution**: Always use the shared `calendarArgTypes` and `defaultArgs`

### Creating New Stories

When creating new stories:

1. **Always use shared infrastructure**:
   ```typescript
   import { calendarArgTypes, defaultArgs } from './shared/storyControls';
   import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';
   ```

2. **Follow the naming convention**:
   - Story files: `FeatureName.stories.tsx`
   - MDX docs: `FeatureName.mdx`
   - Place in `src/stories/` directory

3. **Use consistent meta configuration**:
   ```typescript
   const meta: Meta<typeof CLACalendar> = {
     title: 'Category/FeatureName',
     component: CLACalendar,
     argTypes: calendarArgTypes,
     args: defaultArgs
   };
   ```

4. **Minimize story-specific overrides**:
   - Use args to customize behavior
   - Keep rendering logic in CalendarStoryWrapper
   - Only override when absolutely necessary

### Storybook Commands
```bash
# Start Storybook development server
npm run storybook

# Build static Storybook
npm run build-storybook
```

### File Organization
```
src/stories/
├── shared/
│   ├── storyControls.ts        # Shared ArgTypes and defaults
│   ├── CalendarStoryWrapper.tsx # Shared story wrapper component
│   └── story-helpers.tsx       # Additional shared utilities
├── Welcome.mdx                 # Welcome page (no stories)
├── Overview.mdx                # API documentation
├── GettingStarted.stories.tsx  # Main story file
└── GettingStarted.mdx          # Getting started docs
```

## Migration Path

The codebase is transitioning from:
- JavaScript → TypeScript
- Monolithic component → Modular architecture
- Local timezone dates → UTC-only dates
- Inline handlers → Separated handler modules

When making changes, prefer working in the new TypeScript components under `DateRangePickerNew/` rather than modifying the legacy JavaScript files.

## Testing

### Test Framework
The project uses **Vitest** for testing, which provides:
- Fast execution with native ES modules support
- TypeScript support out-of-the-box
- Compatible with Jest API for easy migration
- Built-in coverage reporting
- Watch mode and UI for development

### Test Structure
```
test/
├── setup.ts                    # Test configuration and global setup
src/
├── utils/
│   └── DateUtils.test.ts       # Comprehensive UTC date utility tests
└── components/
    └── DateRangePicker.config.test.ts  # Configuration system tests
```

### Key Test Areas

#### UTC Date Utilities (`src/utils/DateUtils.test.ts`)
Comprehensive tests for the critical UTC date handling system:
- **Date Creation**: `createDate()`, `toUTC()` functions
- **Date Arithmetic**: `addDaysUTC()`, `addMonthsUTC()` with boundary handling
- **Week Boundaries**: `startOfWeekUTC()`, `endOfWeekUTC()` with different week start options
- **Month Boundaries**: `startOfMonthUTC()`, `endOfMonthUTC()` including leap years
- **Comparisons**: `isSameMonthUTC()`, `isSameDay()`, `isWithinInterval()`
- **Formatting**: `formatUTC()` for consistent UTC date display
- **Parsing**: `parseISO()` for date string handling
- **Edge Cases**: Invalid dates, timezone transitions, leap year calculations

#### Configuration System (`src/components/DateRangePicker.config.test.ts`)
Tests for the settings and configuration:
- **Default Settings**: Validates `getDefaultSettings()` returns correct structure
- **Color System**: Tests `DEFAULT_COLORS` object and validation
- **Settings Validation**: Ensures proper types and values
- **Object Immutability**: Verifies new instances are created appropriately

### Testing Best Practices

#### When Writing Tests
1. **Use UTC Functions**: Always test with `createDate()` and UTC utility functions
2. **Mock Time**: Use `vi.useFakeTimers()` and `vi.setSystemTime()` for consistent dates
3. **Test Edge Cases**: Include timezone boundaries, leap years, invalid dates
4. **Describe Behavior**: Test names should describe the expected behavior clearly

#### Test Patterns
```typescript
// Good: Use UTC date creation
const date = createDate(2025, 5, 15); // June 15, 2025 UTC

// Avoid: Direct Date constructor for tests
const date = new Date('2025-06-15'); // May have timezone issues

// Good: Test UTC behavior specifically
expect(isSameMonthUTC(date1, date2)).toBe(true);

// Good: Mock time for consistent tests
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
});
```

### Coverage Goals
- **UTC Date Utils**: 100% coverage (critical for application correctness)
- **Configuration System**: 100% coverage (ensures proper setup)
- **Component Logic**: Focus on selection, restrictions, and layer management
- **Integration**: Test component interactions with real data

### Running Tests
```bash
# Run all tests
npm test

# Watch mode during development
npm test -- --watch

# Generate coverage report
npm run test:coverage

# Visual test UI
npm run test:ui
```

### Test Configuration
Tests are configured in `vitest.config.ts` with:
- JSDOM environment for DOM testing
- TypeScript support
- Path aliases (`@` points to `./src`)
- Setup file for global test configuration
- Coverage reporting with v8 provider

## Component API Reference

### Main Component Props

The DateRangePicker component (exported as both `DateRangePicker` and `CLACalendar`) accepts these props:

```typescript
interface CLACalendarProps {
  settings: CalendarSettings;
  _onSettingsChange: (settings: CalendarSettings) => void;
  initialActiveLayer?: string;
  onSubmit?: (startDate: string, endDate: string) => void;
  layersFactory?: () => Layer[];
  restrictionConfigFactory?: () => RestrictionConfig;
}
```

### CalendarSettings Configuration

The `settings` prop contains all configuration options:

#### Core Settings
- `displayMode`: `'popup' | 'embedded'` - How the calendar is displayed
- `timezone`: `string` - Timezone for date operations (default: 'UTC')
- `containerStyle`: `CSSProperties` - Custom styles for container
- `inputStyle`: `CSSProperties` - Custom styles for input field
- `isOpen`: `boolean` - Control popup open state
- `visibleMonths`: `number` - Number of months to display (default: 2)
- `monthWidth`: `number` - Width of each month in pixels (default: 500)
- `showMonthHeadings`: `boolean` - Show month/year headers
- `baseFontSize`: `string` - Base font size (e.g. '1rem', '16px')
- `position`: `'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'` - Popup position
- `useDynamicPosition`: `boolean` - Auto-adjust popup position

#### Feature Settings
- `selectionMode`: `'single' | 'range'` - Date selection mode
- `showTooltips`: `boolean` - Show hover tooltips
- `showHeader`: `boolean` - Show calendar header
- `closeOnClickAway`: `boolean` - Close popup on outside click
- `showSubmitButton`: `boolean` - Show submit button
- `showFooter`: `boolean` - Show calendar footer
- `enableOutOfBoundsScroll`: `boolean` - Allow scrolling beyond bounds
- `suppressTooltipsOnSelection`: `boolean` - Hide tooltips during selection
- `showSelectionAlert`: `boolean` - Show selection feedback
- `startWeekOnSunday`: `boolean` - Week starts on Sunday vs Monday
- `dateFormatter`: `(date: Date) => string` - Custom date format function
- `dateRangeSeparator`: `string` - Separator for date ranges (default: " - ")
- `defaultRange`: `{ start: string; end: string }` - Initial selection
- `showDateInputs`: `boolean` - Show date input fields (default: true)

#### Style Settings
- `colors`: Color theme object with properties:
  - `primary`: `string` (default: '#0366d6')
  - `success`: `string` (default: '#28a745')
  - `warning`: `string` (default: '#f6c23e')
  - `danger`: `string` (default: '#dc3545')
  - `purple`, `teal`, `orange`, `pink`: Additional color options

#### Layer Configuration
- `layers`: `Layer[]` - Data layers to display
- `showLayersNavigation`: `boolean` - Show layer toggle UI
- `defaultLayer`: `string` - Initially active layer

### Layer Structure

```typescript
interface Layer {
  name: string;          // Unique identifier
  title: string;         // Display name
  description: string;   // Layer description
  required?: boolean;    // Cannot be hidden
  visible?: boolean;     // Initial visibility
  enabled?: boolean;     // Can be toggled
  color?: string;        // Layer theme color
  data?: {
    events?: Array<{
      date: string;      // YYYY-MM-DD format
      title: string;
      type: string;
      time: string;
      description: string;
      color?: string;
    }>;
    background?: Array<{
      startDate: string; // YYYY-MM-DD format
      endDate: string;   // YYYY-MM-DD format
      color: string;
    }>;
  };
}
```

### Restriction Configuration

```typescript
interface RestrictionConfig {
  restrictions: Restriction[];
}

// Available restriction types:
// 'daterange' - Block specific date ranges
// 'boundary' - Set min/max selectable dates
// 'allowedRanges' - Only allow specific ranges
// 'restrictedBoundary' - Complex boundary rules
// 'weekday' - Block specific weekdays
```

### Default Settings

Use `getDefaultSettings()` to get the default configuration, which includes:
- Embedded display mode
- 2 visible months
- Range selection mode
- UTC timezone
- Standard color palette

### Usage Examples

```typescript
// Basic usage
<DateRangePicker
  settings={getDefaultSettings()}
  _onSettingsChange={setSettings}
/>

// With custom configuration
<DateRangePicker
  settings={{
    ...getDefaultSettings(),
    displayMode: 'popup',
    selectionMode: 'single',
    visibleMonths: 1,
    dateFormatter: (date) => format(date, 'MM/dd/yyyy')
  }}
  onSubmit={(start, end) => console.log('Selected:', start, end)}
  _onSettingsChange={setSettings}
/>

// With layers and restrictions
<DateRangePicker
  settings={{
    ...getDefaultSettings(),
    layers: [{
      name: 'holidays',
      title: 'Public Holidays',
      description: 'Federal holidays',
      data: {
        events: [
          { date: '2025-12-25', title: 'Christmas', type: 'holiday', time: 'All day', description: 'Federal holiday' }
        ]
      }
    }]
  }}
  restrictionConfigFactory={() => ({
    restrictions: [{
      type: 'boundary',
      enabled: true,
      minDate: '2025-01-01',
      maxDate: '2025-12-31'
    }]
  })}
  _onSettingsChange={setSettings}
/>
```