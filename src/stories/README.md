# CLA Calendar Storybook

This directory contains the Storybook stories for the CLA Calendar component.

## Structure

- **Getting Started** - Simple calendar configurations to get you started quickly
  - Basic Calendar - Default configuration with date range selection
  - Single Date Picker - Single date selection mode
  - Minimal Calendar - No header/footer for widgets
  - Multi-Month View - 3 months visible
  - Custom Themed - Purple theme example
  - Popup Mode - Calendar in popup overlay

- **Examples/Embedded Widgets** - Examples of embedding CLACalendar as widgets
  - Year Round Calendar Display - Full 12-month view with holidays
  - Compact Calendar Widget - Small single-month widget
  - Dashboard Calendar Widget - 2-month view with layers

## Common Implementation

All stories use a common implementation pattern with shared argTypes for consistent controls across all calendar configurations. The controls allow you to modify:

- Display mode (popup/embedded)
- Selection mode (single/range)
- Number of visible months
- Header/footer visibility
- Tooltips
- Week start day
- Primary color theme

## Running Storybook

```bash
npm run storybook
```

This will start the Storybook server on http://localhost:6006