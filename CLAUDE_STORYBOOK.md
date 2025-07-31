# CLAUDE_STORYBOOK.md - Storybook Expert

**Role**: Storybook Expert Agent for CLA Calendar Project

This file provides specialized guidance to Claude for maintaining and developing Storybook documentation in the CLA Calendar project. When you refer to the "Storybook Expert", this documentation will be loaded to provide expert-level guidance on Storybook implementations, troubleshooting, and best practices.

## Expert Capabilities
- Storybook v9.0.16 specific knowledge and import paths
- Story controls validation and troubleshooting
- MDX documentation standards and table formatting
- Performance optimization for complex stories
- Three-file pattern implementation
- Control synchronization and testing

## Storybook Version and Critical Information

**CRITICAL**: This project uses Storybook v9.0.16. Import paths are version-specific and must be followed exactly.

### Correct Import Paths
```typescript
// MDX Files - ALWAYS use these imports
import { Meta, Story, Canvas } from '@storybook/addon-docs/blocks';

// NEVER use these (they will cause errors):
// import { Meta } from '@storybook/blocks';  // Package not installed
// import { Meta } from '@storybook/addon-docs';  // Wrong export path
```

## Three-File Pattern for Categories

Every Storybook category MUST follow this structure:

1. **Documentation Page**: `CategoryName.mdx`
   ```mdx
   import { Meta } from '@storybook/addon-docs/blocks';
   
   <Meta title="Category Name/Documentation" />
   
   # Category Name
   
   Overview content here...
   
   > **Note**: To see live examples, visit the "Stories" or "Integrated Examples" pages under this section.
   ```

2. **Stories Page**: `CategoryName.stories.tsx`
   ```typescript
   import type { Meta, StoryObj } from '@storybook/react';
   import { calendarArgTypes, defaultArgs } from './shared/storyControls';
   import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';
   
   const meta: Meta<typeof CLACalendar> = {
     title: 'Category Name/Stories',
     component: CLACalendar,
     argTypes: calendarArgTypes,
     args: defaultArgs,
     parameters: {
       docs: {
         page: null, // Hide default docs for custom documentation
       }
     }
   };
   
   export default meta;
   type Story = StoryObj<typeof meta>;
   
   export const ExampleStory: Story = {
     render: (args) => <CalendarStoryWrapper args={args} />
   };
   ```

3. **Integrated Examples Page** (optional): `CategoryNameDirect.mdx`
   ```mdx
   import { Meta } from '@storybook/addon-docs/blocks';
   import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';
   
   <Meta title="Category Name/Integrated Examples" />
   
   # Category Name - Integrated Examples
   
   Live examples with full configurations...
   ```

## MDX Documentation Standards

### Table Formatting Rules

**NEVER use markdown tables in MDX files**. They break the parser. Use HTML tables instead:

```html
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
    </tbody>
  </table>
</div>
```

### Table Content Rules
1. **No `<code>` tags** inside table cells
2. **No pipe characters** in content - use "or" instead
3. **No HTML entities** (`&gt;`, `&lt;`, `&amp;`)
4. Keep content simple - complex types should be explained in prose after the table

### CSS Styling (Applied via `.storybook/preview.css`)
```css
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

.sbdocs-content td:first-child {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.85em;
  color: #0969da;
}
```

## Shared Infrastructure Usage

### ALWAYS Use Shared Components

1. **Import shared controls and wrapper**:
   ```typescript
   import { calendarArgTypes, defaultArgs } from './shared/storyControls';
   import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';
   ```

2. **Never create custom ArgTypes** - use the shared ones
3. **Never create custom rendering logic** - use CalendarStoryWrapper
4. **Minimize story-specific overrides**

### CalendarStoryWrapper Props
```typescript
interface CalendarStoryWrapperProps {
  args: Partial<CalendarSettings>;
  title?: string;
  description?: string;
  showSelectedDate?: boolean;
  containerStyle?: React.CSSProperties;
}
```

## Performance Optimization

### For Integrated Examples Pages

1. **Extract components to separate files** instead of inline functions
2. **Memoize static configurations** outside components
3. **Use `useMemo` for settings objects**
4. **Avoid IIFEs** - they recreate components on every render

Example of optimized component:
```typescript
// RestrictionsExamples.tsx
const staticConfig: RestrictionConfig = {
  restrictions: [/* ... */]
};

export const OptimizedExample: React.FC = () => {
  const settings = useMemo(() => createCalendarSettings({
    // settings
  }), []);
  
  return <CLACalendar settings={settings} />;
};
```

## Common Issues and Solutions

### Issue: "No primary story attached to this docs file"
**Solution**: Ensure Meta tag has proper title format: `<Meta title="Category/Page Type" />`

### Issue: Wide calendar creates horizontal scrollbars
**Solution**: Use preview.css styles that handle overflow properly

### Issue: Import errors in MDX
**Solution**: Always use `@storybook/addon-docs/blocks` for imports

### Issue: Slow performance in docs pages
**Solution**: Extract components and memoize configurations

## Navigation Structure

Configure in `.storybook/preview.tsx`:
```typescript
options: {
  storySort: {
    order: [
      'Welcome', 
      'Overview', 
      'Getting Started', 
      'External Input',
      'Restrictions',
      'Layers',
      'UTC Timezone Handling', 
      'Examples',
      'Features',
      'Playground',
      'Edge Cases'
    ],
  },
}
```

## Story Controls Validation

### Critical Control Requirements

**ALL stories MUST use the shared control infrastructure**. If controls aren't working, it's likely due to:

1. **Not using shared argTypes**: Every story must import and use `calendarArgTypes` from `./shared/storyControls`
2. **Overriding args incorrectly**: Don't override the entire args object, only specific properties
3. **Props not being passed through**: Ensure CalendarStoryWrapper receives and applies all args
4. **Settings object structure**: The calendar expects settings in a specific nested structure

### Maintaining Control Defaults

When changing default values in the calendar:

1. **Update THREE places to maintain consistency**:
   - `src/components/CLACalendar.config.ts` - The CORE_DEFAULTS object
   - `src/stories/shared/storyControls.ts` - Both defaultArgs AND the control's defaultValue.summary
   - Any relevant tests that assert the default values

2. **Example: Changing showSubmitButton default**:
   ```typescript
   // 1. In CLACalendar.config.ts
   export const CORE_DEFAULTS = {
     showSubmitButton: true, // Changed from false
     // ...
   };
   
   // 2. In storyControls.ts
   export const defaultArgs = {
     showSubmitButton: true, // Changed from false
     // ...
   };
   
   // AND in calendarArgTypes:
   showSubmitButton: {
     control: 'boolean',
     table: {
       defaultValue: { summary: true } // Changed from false
     }
   }
   
   // 3. Update tests
   expect(settings.showSubmitButton).toBe(true); // Changed from false
   ```

3. **Run tests after changes** to catch any mismatches

### Standardized Story Pattern (RECOMMENDED)

Use the helper functions from `./shared/storyHelpers` for perfect consistency:

```typescript
import { createCalendarMeta, createCalendarStory, createCustomCalendarStory, type CalendarStory } from './shared/storyHelpers';

// 1. Create meta using the helper
const meta = createCalendarMeta({
  title: 'Category/Stories',
  description: 'Optional description of this story category'
});

export default meta;

// 2. Simple stories - just specify what's different
export const SimpleStory: CalendarStory = createCalendarStory({
  name: 'Story Name',
  description: 'What this story demonstrates',
  args: {
    // Only specify the args that differ from defaults
    visibleMonths: 3,
    selectionMode: 'single'
  }
});

// 3. Complex stories with custom logic
export const ComplexStory: CalendarStory = createCustomCalendarStory({
  name: 'Complex Story',
  render: (args) => {
    // Custom setup logic here
    const customConfig = { /* ... */ };
    
    return (
      <CalendarStoryWrapper
        args={args}
        title="Complex Story"
        description="Description"
        settingsOverrides={customConfig}
      />
    );
  }
});
```

### Manual Pattern (if not using helpers)

```typescript
// ALWAYS start with this exact pattern
import { calendarArgTypes, defaultArgs } from './shared/storyControls';
import { CalendarStoryWrapper } from './shared/CalendarStoryWrapper';

const meta: Meta<typeof CLACalendar> = {
  title: 'Category/Stories',
  component: CLACalendar,
  argTypes: calendarArgTypes,  // NEVER define custom argTypes
  args: defaultArgs,           // ALWAYS use shared defaults
};

// CRITICAL: Never spread defaultArgs in story args!
export const YourStory: Story = {
  render: (args) => <CalendarStoryWrapper args={args} />,
  args: {
    // WRONG: ...defaultArgs, // This breaks controls!
    // RIGHT: Only override specific properties
    visibleMonths: 3,
    selectionMode: 'single'
  }
};
```

### Common Control Issues and Fixes

1. **Control shows but doesn't update the calendar**
   - Check: Is the story using `render: (args) =>` and passing args?
   - Fix: Ensure args are passed to CalendarStoryWrapper
   - Check: Is the story spreading `...defaultArgs` in its args?
   - Fix: Remove `...defaultArgs` - only specify overrides

2. **Control is missing from the UI**
   - Check: Is the story using custom argTypes?
   - Fix: Use shared `calendarArgTypes`

3. **Control value doesn't match calendar behavior**
   - Check: Is there a mismatch between control name and settings property?
   - Fix: Verify mapping in storyControls.ts

4. **Color controls not working**
   - Check: Are colors nested under settings.colors?
   - Fix: Ensure proper nesting: `settings.colors.primary`

5. **Selection mode not switching properly**
   - Check: Is the component properly recreating handlers when mode changes?
   - Fix: Ensure selection handlers depend on the selection manager

6. **Controls work in some stories but not others**
   - Check: Are stories using `render: () =>` instead of `render: (args) =>`?
   - Fix: Always use `render: (args) =>` to receive control values

### Control Validation Script

Add this to your package.json:
```json
{
  "scripts": {
    "storybook:validate-controls": "node scripts/validate-story-controls.js"
  }
}
```

Create `scripts/validate-story-controls.js`:
```javascript
const fs = require('fs');
const path = require('path');

function validateStoryControls() {
  const storyFiles = glob.sync('src/stories/**/*.stories.tsx');
  const issues = [];

  storyFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for shared imports
    if (!content.includes("from './shared/storyControls'")) {
      issues.push(`${file}: Missing shared storyControls import`);
    }
    
    // Check for custom argTypes
    if (content.match(/argTypes\s*:\s*{[^}]+}/)) {
      issues.push(`${file}: Custom argTypes detected - should use calendarArgTypes`);
    }
    
    // Check for render function with args
    if (!content.includes('render: (args)')) {
      issues.push(`${file}: Story may not be passing args to render`);
    }
  });
  
  return issues;
}
```

## Testing Storybook Implementations

### Validation Checklist
- [ ] All imports use correct paths for Storybook v9
- [ ] Tables use HTML format, not markdown
- [ ] No `<code>` tags or pipe characters in tables
- [ ] Three-file pattern is followed for categories
- [ ] Shared infrastructure is used consistently
- [ ] Performance optimizations applied for complex examples
- [ ] Navigation appears correctly in sidebar
- [ ] No horizontal scrollbars in docs view
- [ ] All examples render without errors
- [ ] **ALL ArgTypes controls update the calendar when changed**
- [ ] **Controls are consistent across ALL stories**
- [ ] **No story has custom argTypes defined**

### Build Commands
```bash
# Start development server
npm run storybook

# Build static Storybook
npm run build-storybook

# Test specific story rendering
npm run storybook -- --docs
```

## Calendar-Specific Considerations

### Default Calendar Width
- Calendar defaults to 500px per month
- With 2 visible months = 1000px+ width
- Always consider this in layout planning

### Restriction Performance
- `restricted_boundary` type is expensive with many ranges
- Each day cell checks all boundaries
- Limit ranges for better performance

### UTC Timezone Handling
- Calendar defaults to UTC for consistency
- Always demonstrate timezone behavior in examples
- Use `settings.timezone` parameter when needed

## Documentation Requirements

### For Every New Feature
1. Add to Overview.mdx API reference
2. Create story in appropriate category
3. Add integrated example if complex
4. Update CLAUDE.md if new patterns introduced
5. Ensure consistent naming and structure

### Code Examples in Docs
- Show full configuration objects
- Include comments for clarity
- Demonstrate both simple and complex usage
- Always show the import statements

## Maintenance Tasks

### Regular Reviews
1. Check for broken imports after updates
2. Validate all examples still render
3. Ensure documentation matches implementation
4. Update deprecated patterns
5. Monitor performance of complex examples

### When Adding New Stories
1. Follow the established patterns exactly
2. Use shared infrastructure
3. Test in both controls and docs view
4. Verify navigation structure
5. Check responsive behavior

## Quality Standards

### Every Story Must
- Use TypeScript with proper types
- Include descriptive parameters.docs
- Work with Storybook controls
- Render without errors
- Follow naming conventions
- Be properly categorized

### Every Documentation Page Must
- Have clear, concise explanations
- Include working code examples
- Use proper formatting (no markdown tables!)
- Link to related pages appropriately
- Be up-to-date with the implementation

## Emergency Fixes

### If Storybook Won't Build
1. Check import paths first
2. Verify no syntax errors in MDX
3. Look for pipe characters in tables
4. Check for missing dependencies
5. Validate Meta tag formats

### If Examples Are Slow
1. Extract inline components
2. Memoize configurations
3. Reduce restriction ranges
4. Use React.memo where appropriate
5. Profile with React DevTools

## Troubleshooting Guide

### Issue: Controls Not Working After Adding New Feature

**Symptoms**: 
- Control appears in Storybook but doesn't affect the component
- Control works in some stories but not others
- Selection mode stays in range even when set to single

**Root Causes & Fixes**:

1. **Story args spreading defaultArgs**
   ```typescript
   // WRONG - This overrides control values
   args: {
     ...defaultArgs,
     visibleMonths: 2
   }
   
   // RIGHT - Only specify overrides
   args: {
     visibleMonths: 2
   }
   ```

2. **Using render: () => instead of render: (args) =>**
   ```typescript
   // WRONG - Args not received
   render: () => <CalendarStoryWrapper args={{...}} />
   
   // RIGHT - Args passed through
   render: (args) => <CalendarStoryWrapper args={args} />
   ```

3. **Component not responding to prop changes**
   - Check if handlers/managers are properly memoized with dependencies
   - Ensure settings changes trigger re-renders
   - For selection mode: verify handlers check current mode

### Issue: Tests Failing After Changing Defaults

**Always update in three places**:
1. Component config (CORE_DEFAULTS)
2. Storybook controls (defaultArgs & argTypes)
3. Test expectations

**Example PR Checklist**:
- [ ] Updated CORE_DEFAULTS in config
- [ ] Updated defaultArgs in storyControls
- [ ] Updated argTypes defaultValue.summary
- [ ] Updated test expectations
- [ ] Ran all tests
- [ ] Verified in Storybook UI

Remember: Consistency is key. Always follow established patterns rather than creating new ones.