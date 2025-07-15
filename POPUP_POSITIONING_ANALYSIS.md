# Popup Positioning Analysis

## Current Implementation

1. **Input Reference**: 
   - `inputRef` is correctly attached to the input element
   - Passed to `CalendarPortal` as `triggerRef`

2. **Position Calculation** (in CLACalendar.tsx):
   - Uses `inputRef.current.getBoundingClientRect()` to get input position
   - Calculates position based on settings.position (e.g., 'bottom-left')
   - Sets `calendarPosition` state with calculated `top` and `left` values

3. **Portal Rendering**:
   - `CalendarPortal` receives positions via `portalStyle` prop
   - Portal element is created with `position: fixed`
   - Styles are applied including the calculated positions

## Potential Issues

1. **Timing**: Position might be calculated before portal is ready
2. **Storybook iframe**: Storybook renders stories in an iframe which might affect positioning
3. **CSS conflicts**: Multiple CSS files setting portal styles
4. **Portal's own positioning logic**: The portal has its own `updatePosition` function that might conflict

## Key Code Paths

1. Position calculation: `CLACalendar.tsx` lines 1084-1170
2. Portal style application: `CalendarPortal.tsx` lines 173-206
3. Portal CSS: Multiple files setting `.cla-calendar-portal` styles

## Next Steps to Debug

1. Check if positions are being correctly calculated and applied
2. Verify no CSS is overriding the inline styles
3. Test outside of Storybook to rule out iframe issues
4. Simplify portal positioning logic to use only parent-provided positions