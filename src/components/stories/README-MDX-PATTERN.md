# Storybook MDX Documentation Pattern

## Overview
This document explains the correct pattern for creating MDX documentation files in this project to avoid Storybook parsing errors and ensure code snippets are properly displayed.

## The Problem
When creating MDX files for Storybook documentation, certain syntax patterns can cause:
- Parser errors (`Unable to index` errors)
- "No code available" messages in the Storybook UI
- Duplicate story ID conflicts
- Import module script failures
- Calendar components not displaying properly

## The Solution Pattern

### 1. File Structure Required

For each MDX documentation file, you need THREE files:

```
src/components/
├── YourComponent.stories.mdx       # The documentation file
├── stories/
│   ├── YourComponentStories.tsx    # Story component implementations
│   └── your-component-code-examples.ts  # Code snippet strings
```

### 2. Story Components File Pattern

Create a file `stories/YourComponentStories.tsx`:

```tsx
import React from 'react';
import { YourComponent } from '../YourComponent';
import { getDefaultSettings } from '../YourComponent.config';

// Each story is a simple component that renders your component
export const BasicStory = () => (
  <YourComponent 
    settings={getDefaultSettings()}
    _onSettingsChange={() => {}}
  />
);

export const AdvancedStory = () => (
  <YourComponent 
    settings={{
      ...getDefaultSettings(),
      // your custom settings
    }}
    _onSettingsChange={() => {}}
  />
);
```

### 3. Code Examples File Pattern

Create a file `stories/your-component-code-examples.ts`:

```typescript
// Each code example is a string that shows the code to users
export const basicCode = `<YourComponent 
  settings={getDefaultSettings()}
  _onSettingsChange={() => {}}
/>`;

export const advancedCode = `<YourComponent 
  settings={{
    ...getDefaultSettings(),
    // your custom settings
  }}
  _onSettingsChange={() => {}}
/>`;
```

### 4. MDX File Pattern

In your `YourComponent.stories.mdx`:

```mdx
import { Meta, Story, Canvas } from '@storybook/addon-docs';
import { YourComponent } from './YourComponent';
import { createStoryParameters } from './utils/story-helpers';
import {
  BasicStory,
  AdvancedStory,
} from './stories/YourComponentStories';
import {
  basicCode,
  advancedCode,
} from './stories/your-component-code-examples';

<Meta title="Category/YourComponent" component={YourComponent} />

# YourComponent

Description of your component.

## Basic Example

<Canvas withSource="open">
  <Story name="Basic Example" parameters={createStoryParameters(basicCode)}>
    {() => <BasicStory />}
  </Story>
</Canvas>

## Advanced Example

<Canvas withSource="open">
  <Story name="Advanced Example" parameters={createStoryParameters(advancedCode)}>
    {() => <AdvancedStory />}
  </Story>
</Canvas>
```

## Key Rules to Follow

### ✅ DO:

1. **Use the function pattern for stories**:
   ```mdx
   <Story name="Example">
     {() => <ExampleStory />}
   </Story>
   ```

2. **Always use `withSource="open"` on Canvas**:
   ```mdx
   <Canvas withSource="open">
   ```

3. **Pass code through parameters**:
   ```mdx
   parameters={createStoryParameters(codeString)}
   ```

4. **Use unique story names** between MDX and TSX files to avoid ID conflicts:
   ```mdx
   <!-- ❌ BAD - If .tsx has a story named "Default" -->
   <Story name="Default">
   
   <!-- ✅ GOOD - Add descriptive suffix to MDX story names -->
   <Story name="Default Example">
   <Story name="Basic Configuration">
   ```

5. **Import story components** rather than defining them inline

6. **Follow naming conventions for MDX stories**:
   - Add suffixes like "Example", "Demo", "Display", "Style"
   - Make names more descriptive than the .tsx versions
   - Examples:
     - TSX: `FlatSingleMonth` → MDX: `Flat Single Month Example`
     - TSX: `CustomColors` → MDX: `Custom Theme Demo`
     - TSX: `WithEvents` → MDX: `Event Display Example`

### ❌ DON'T:

1. **Don't use the `of` prop**:
   ```mdx
   <!-- This will cause parser errors -->
   <Story of={SomeStory} />
   ```

2. **Don't define components inline in MDX**:
   ```mdx
   <!-- This won't show code -->
   <Story name="Example">
     {() => (
       <YourComponent {...props} />
     )}
   </Story>
   ```

3. **Don't duplicate story names** between .tsx and .mdx files

## Working Example Files

See these files for reference:
- `LayersAndNavigation.stories.mdx` - Working MDX pattern
- `stories/LayersStories.tsx` - Story components
- `stories/code-examples.ts` - Code snippets

## Common Error Messages and Solutions

### "Unable to index" Error
**Cause**: Using unsupported MDX syntax like `<Story of={...} />`
**Solution**: Use the function pattern with imported components

### "No code available"
**Cause**: Stories defined inline or missing code parameters
**Solution**: Create separate story components and pass code via parameters

### "Duplicate stories with id"
**Cause**: Same story names in both .tsx and .mdx files
**Solution**: Use different names - add descriptive suffixes to MDX story names

### "Importing a module script failed"
**Cause**: Incorrect MDX syntax for code interpolation or JavaScript errors
**Solutions**:
1. Check code example interpolation syntax (no triple backticks around variables)
2. Ensure all imported files exist and export the expected values
3. Verify no syntax errors in imported TypeScript/JavaScript files

**Example fix:**
```tsx
// In YourComponent.stories.tsx
export const Default: Story = { ... }
export const CustomTheme: Story = { ... }
```

```mdx
// In YourComponent.stories.mdx
<Story name="Default Example">  // Not just "Default"
<Story name="Custom Theme Demo">  // Not just "CustomTheme"
```

## Complete Example Pattern

Here's a complete example of creating Enhanced Events documentation:

### 1. EnhancedEventsStories.tsx
```tsx
export const EventTypesGalleryStory = () => (
  <CLACalendar 
    settings={{
      ...getDefaultSettings(),
      displayMode: 'embedded',  // For auto-visibility
      visibleMonths: 2,
      showTooltips: true,
      layers: [/* event layers */]
    }}
    _onSettingsChange={() => {}}
  />
);
```

### 2. enhanced-events-code-examples.ts
```typescript
export const eventTypesGalleryCode = `<CLACalendar 
  settings={{
    ...getDefaultSettings(),
    displayMode: 'embedded',
    visibleMonths: 2,
    showTooltips: true,
    layers: [/* event layers */]
  }}
  _onSettingsChange={() => {}}
/>`;
```

### 3. EnhancedEvents.stories.mdx
```mdx
import { Meta, Story, Canvas } from '@storybook/addon-docs';
import { CLACalendar } from './CLACalendar';
import { createStoryParameters } from './utils/story-helpers';
import { EventTypesGalleryStory } from './stories/EnhancedEventsStories';
import { eventTypesGalleryCode } from './stories/enhanced-events-code-examples';

<Meta title="Calendar/Enhanced Events" component={CLACalendar} />

# Enhanced Events

## Event Types Gallery

<Canvas withSource="open">
  <Story name="Event Gallery Demo" parameters={createStoryParameters(eventTypesGalleryCode)}>
    {() => <EventTypesGalleryStory />}
  </Story>
</Canvas>
```

## Testing Your MDX File

1. Create all three required files
2. Run Storybook: `npm run storybook`
3. Check that:
   - No console errors appear
   - Stories render correctly
   - "Show code" displays the correct code
   - Navigation works without errors
   - Calendars are visible (for embedded mode)
   - No "module script failed" errors

## Troubleshooting Checklist

- [ ] All imports resolve correctly
- [ ] Story names are unique between .tsx and .mdx files
- [ ] Code examples use proper string interpolation
- [ ] Calendar components use embedded mode for visibility
- [ ] No syntax errors in TypeScript files
- [ ] Canvas components have `withSource="open"`
- [ ] Story components are wrapped in arrow functions

## Preventing Duplicate Story IDs

### The Problem
When you have both `.stories.tsx` and `.stories.mdx` files for the same component, Storybook generates story IDs based on the story names. If both files use the same story names, you'll get duplicate ID errors.

### The Solution
**Always use different story names in MDX files than in TSX files.**

### Naming Strategy for MDX Stories

1. **Add descriptive suffixes** to all MDX story names:
   - `Example`, `Demo`, `Display`, `Style`, `Configuration`
   - `Sample`, `Showcase`, `Preview`, `Implementation`

2. **Make MDX names more descriptive**:
   - TSX stories can have short names
   - MDX stories should have fuller, more descriptive names

3. **Examples of good naming patterns**:
   ```
   TSX Story Name      →  MDX Story Name
   ─────────────────────────────────────────
   Default             →  Default Configuration
   Simple              →  Simple Example
   WithLayers          →  Layers Display Example
   CustomColors        →  Custom Theme Demo
   Minimal             →  Minimal UI Configuration
   FourMonthView       →  Four Month Display
   CompactEmbedded     →  Compact Sidebar Widget
   ```

### Quick Checklist

Before creating an MDX file:
- [ ] Check the .tsx file for existing story names
- [ ] Plan different names for all MDX stories
- [ ] Add descriptive suffixes to MDX story names
- [ ] Ensure no MDX story name matches a TSX story name

## Calendar Display Best Practices

### Making Calendars Auto-Visible

For documentation purposes, calendars should be immediately visible:

1. **Use Embedded Mode for Documentation**:
   ```tsx
   // In story components
   export const MyStory = () => (
     <CLACalendar 
       settings={{
         ...getDefaultSettings(),
         displayMode: 'embedded',  // Always visible
         // No need for isOpen with embedded mode
       }}
     />
   );
   ```

2. **Popup Mode Considerations**:
   - `isOpen: true` only opens the popup, doesn't guarantee visibility
   - Popup calendars require user interaction in documentation
   - Prefer embedded mode for auto-expanded display

### Code Example Syntax in MDX

**IMPORTANT**: When embedding code examples in MDX:

1. **For inline code blocks**, use direct interpolation:
   ```mdx
   {myCodeExampleVariable}
   ```

2. **DO NOT wrap in markdown code blocks**:
   ```mdx
   <!-- ❌ WRONG - This will cause import errors -->
   ```typescript
   {myCodeExampleVariable}
   ```
   
   <!-- ✅ CORRECT -->
   {myCodeExampleVariable}
   ```

3. **For actual code blocks**, use string literals:
   ```mdx
   ```typescript
   interface Event {
     date: string;
     title: string;
   }
   ```
   ```

## Summary

The key to successful MDX documentation is:
1. Separate story implementations into their own components
2. Define code snippets as strings
3. Use the specific Canvas/Story pattern shown above
4. Avoid problematic syntax like `of` props or inline definitions
5. **Always use unique story names between TSX and MDX files**
6. **Use embedded display mode for auto-visible calendars**
7. **Use correct MDX interpolation syntax for code examples**

Following this pattern ensures your documentation will work reliably with Storybook's MDX parser and prevents duplicate ID errors and import failures.

## Common Gotchas and Solutions

### 1. Calendar Not Visible
**Problem**: Calendar component renders but is not visible/expanded
**Solution**: Use `displayMode: 'embedded'` instead of `'popup'` for documentation

### 2. Code Not Showing
**Problem**: "No code available" in Storybook
**Solution**: Pass code via `parameters={createStoryParameters(codeString)}`

### 3. Import Errors
**Problem**: "Importing a module script failed"
**Solutions**:
- Check file paths are correct
- Ensure all exports exist
- Don't wrap code variables in markdown code blocks
- Verify no TypeScript syntax errors

### 4. Duplicate Story IDs
**Problem**: "Duplicate stories with id: calendar-enhanced-events--example"
**Solution**: Use different names in MDX than in TSX files

### 5. MDX Parse Errors
**Problem**: "Unable to index ./src/components/YourComponent.stories.mdx"
**Solution**: Don't use `<Story of={...} />` syntax

## Quick Reference

### ✅ DO:
- Use embedded mode for auto-visible calendars
- Use unique story names in MDX files
- Import story components from separate files
- Pass code through parameters
- Use direct interpolation for code examples: `{codeVariable}`

### ❌ DON'T:
- Use popup mode for documentation (requires interaction)
- Duplicate story names between files
- Define components inline in MDX
- Use `of` prop in Story components
- Wrap code variables in markdown code blocks

## File Naming Convention

```
ComponentName.stories.tsx       → Storybook stories
ComponentName.stories.mdx       → Documentation
ComponentNameStories.tsx        → Story components for MDX
component-name-code-examples.ts → Code snippets for MDX
```