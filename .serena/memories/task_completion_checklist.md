# Task Completion Checklist

When completing a development task for CLA Calendar:

## Code Quality
1. **Run linting**: `npm run lint:all` and fix issues with `npm run lint:fix`
2. **TypeScript check**: Ensure no TypeScript errors
3. **Build check**: Run `npm run build` to verify library builds correctly

## Testing
1. **Run all tests**: `npm test` (or `npm test -- --run` for CI mode)
2. **Check coverage**: `npm run test:coverage` if test coverage is important
3. **Manual testing**: Start `npm run dev` and test functionality manually
4. **Accessibility**: Verify keyboard navigation and screen reader support

## Documentation
1. **Update stories**: Add/update Storybook stories if UI components changed
2. **Comments**: Add JSDoc comments for public APIs
3. **Types**: Ensure proper TypeScript types are exported

## Git Best Practices
1. **Commit messages**: Follow conventional commit format
2. **Branch naming**: Use descriptive names (e.g., `feature/fix-keyboard-navigation`)
3. **Small commits**: Keep commits focused and atomic

## Pre-Push Checklist
1. All tests passing
2. No linting errors
3. Build successful
4. No TypeScript errors
5. Manual testing completed