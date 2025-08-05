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
**CRITICAL**: This project defaults to UTC timezone for all date operations through a custom utility layer (`src/utils/DateUtils.ts`). This addresses timezone inconsistencies, DST transitions, and calendar display issues.

The calendar supports configurable timezone through `settings.timezone` (default: 'UTC'). All timezone-aware functions now accept an optional timezone parameter that defaults to UTC.

Key timezone-aware functions:
- `parseISO(dateString, timezone = 'UTC')` - Parses dates in specified timezone
- `isSameDay(date1, date2, timezone = 'UTC')` - Compares dates in specified timezone
- `isSameMonth(date1, date2, timezone = 'UTC')` - Compares months in specified timezone
- `startOfMonth(date, timezone = 'UTC')` - Gets month start in specified timezone
- `endOfMonth(date, timezone = 'UTC')` - Gets month end in specified timezone
- `startOfWeek(date, { weekStartsOn, timezone })` - Gets week start with timezone
- `endOfWeek(date, { weekStartsOn, timezone })` - Gets week end with timezone

When `timezone === 'UTC'`, these functions use UTC-specific implementations. For other values, they use date-fns functions which respect local timezone.

## Recent Development Notes

### Search Code Optimization
- Use serena mcp too for searching code for optimized performance and results

(Rest of the existing content remains unchanged)