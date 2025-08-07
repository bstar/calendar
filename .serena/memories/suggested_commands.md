# Suggested Commands for CLA Calendar Development

## Development Commands
```bash
# Start development server with hot reload
npm run dev

# Build the library for distribution
npm run build
```

## Testing Commands
```bash
# Run tests once
npm test

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Serve coverage report locally
npm run test:coverage:serve
```

## Linting and Code Quality
```bash
# Lint specific example file
npm run lint

# Lint all TypeScript/JavaScript files
npm run lint:all

# Auto-fix linting issues
npm run lint:fix
```

## Storybook (Documentation)
```bash
# Start Storybook development server
npm run storybook

# Build Storybook for deployment
npm run build-storybook
```

## System Commands (Darwin)
- `git status` - Check git status
- `ls -la` - List files with details
- `find . -name "*.tsx" -type f` - Find TypeScript React files
- `grep -r "pattern" src/` - Search for patterns in source

## Pre-commit/Publish
- `npm run prepare` - Runs before publish (builds)
- `npm run prepublishOnly` - Runs tests and build before publish