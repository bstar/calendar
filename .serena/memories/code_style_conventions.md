# Code Style and Conventions

## TypeScript Configuration
- Strict TypeScript configuration
- ESM modules (type: "module")
- Target: Latest ECMAScript features
- JSX support with React 18

## File Structure
- **Components**: `/src/components/`
- **Utils**: `/src/utils/`
- **Types**: Co-located `.types.ts` files
- **Tests**: Co-located `.test.tsx` files
- **Stories**: `/src/stories/`

## Naming Conventions
- **Components**: PascalCase (e.g., `CLACalendar.tsx`)
- **Files**: kebab-case for CSS, PascalCase for components
- **Types**: PascalCase interfaces/types
- **CSS Classes**: kebab-case with component prefixes

## ESLint Rules
- No unused variables (with underscore ignore pattern)
- React hooks rules enforced
- TypeScript explicit any warnings
- Console warnings allowed
- No React import required (React 18)

## Testing Conventions
- Vitest with JSdom environment
- Testing Library for component tests
- Co-located test files (.test.tsx)
- Coverage exclusions for stories, types, config files

## CSS Architecture
- Component-scoped CSS files
- Accessibility-specific styles in dedicated file
- Defensive styles for portal components
- PostCSS with cssnano optimization