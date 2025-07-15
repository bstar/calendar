# Storybook Documentation Issues Log

## WORKING APPROACH (CONFIRMED):

### MDX Files Structure:
1. Import from `@storybook/addon-docs/blocks`:
   ```javascript
   import { Meta, Story } from '@storybook/addon-docs/blocks';
   import * as MyStories from './MyComponent.stories';
   ```

2. Use Meta tag to define the story hierarchy:
   ```javascript
   <Meta title="Section/Page Name" />
   ```

3. Embed stories using the Story component:
   ```javascript
   <Story of={MyStories.StoryName} />
   ```

### Current Working Files:
- `/src/stories/Welcome.mdx` - Simple docs page
- `/src/stories/GettingStarted.mdx` - Docs with embedded stories
- `/src/stories/GettingStarted.stories.tsx` - Actual story implementations

## Current Setup
- Storybook version: v9.0.16
- Issue: Documentation pages not working properly

## What We Know Works:
1. The GettingStarted.stories.tsx file with actual story components works
2. The calendar components render correctly in stories

## What Doesn't Work:
1. MDX files with wrong imports:
   - `@storybook/blocks` - WRONG (doesn't exist)
   - `@storybook/addon-docs` - WRONG (doesn't export Meta directly)

## CORRECT IMPORT:
- `@storybook/addon-docs/blocks` - This is the CORRECT path!

2. Empty TypeScript stories with just docs - NOT WORKING
   - Creating stories with `render: () => null` doesn't show docs

## Previous Working State:
- Had MDX files but with wrong imports
- Error: "Importing binding name 'Meta' is not found"

## SOLUTION:
The original import was correct all along:
```javascript
import { Meta } from '@storybook/addon-docs/blocks';
```

The error was likely due to:
1. Creating new MDX files without proper story exports
2. Changing correct imports to incorrect ones
3. Not understanding that `@storybook/addon-docs/blocks` is the correct path for Storybook v9