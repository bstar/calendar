# CLA Calendar Project Overview

## Purpose
CLA Calendar is a flexible React date range picker component with drag selection support. It's designed as a reusable library component with comprehensive TypeScript support and UTC timezone handling for consistent behavior across timezones.

## Tech Stack
- **Frontend**: React 18.3.1, TypeScript 5.8.2
- **Build**: Rollup (for library), Vite (for development)
- **Testing**: Vitest, Testing Library, JSdom
- **Styling**: CSS with PostCSS
- **Date Handling**: date-fns 4.1.0, date-fns-tz 3.2.0
- **Dev Tools**: Storybook, ESLint, TypeScript

## Key Features
- UTC timezone handling system via custom DateUtils
- Keyboard navigation support
- Accessibility compliance (WCAG)
- Multiple calendar instance support
- Drag selection functionality
- Layer system for visual overlays
- Restriction system for date limitations

## Recent Focus Areas
- TypeScript migration (in progress)
- Keyboard navigation scoping issues
- UTC date handling implementation
- Accessibility improvements