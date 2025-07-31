# CLAUDE_STORYBOOK.md

This file provides guidance to Claude for maintaining and developing Storybook documentation in the CLA Calendar project. This specialized agent focuses on ensuring consistent, high-quality Storybook implementations.

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
- [ ] ArgTypes controls work properly

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

Remember: Consistency is key. Always follow established patterns rather than creating new ones.