# Keyboard Range Selection Test

## How to test keyboard range selection:

1. **Navigate to first date**: Use arrow keys to move to your desired start date
2. **Select start date**: Press Enter or Space to select the first date
3. **Navigate to end date**: Use arrow keys to move to your desired end date  
4. **Create range**: Hold Shift and press Enter or Space to extend selection to that date

## Alternative method:
- Click first date with mouse
- Navigate with keyboard to end date
- Shift+Enter or Shift+Space to complete the range

## Also supports:
- **Shift+Click** with mouse for range selection (was already working)
- **Regular Enter/Space** without Shift will start a new selection (resets the range)

The key improvement is that **Shift+Enter** and **Shift+Space** now properly extend the selection from the current anchor point, just like Shift+Click does with the mouse.

## Exit Keyboard Navigation:
- **Press ESC** to exit keyboard navigation mode and remove focus from the calendar
- **Click any date** with mouse to exit keyboard mode and use mouse selection
- **Move mouse significantly** (more than 5 pixels) to exit keyboard mode and re-enable hover effects

## Smart Mode Switching:
- **During keyboard navigation**: Mouse hover effects are disabled to prevent confusing dual highlights
- **When you move the mouse**: Keyboard mode exits automatically and hover effects resume
- **When you click**: Focus is cleared and normal mouse interaction resumes

This prevents the weird experience of having both keyboard focus and mouse hover active at the same time.