// Test script to verify diagonal pattern offset conversion
import { argsToSettings } from './src/stories/shared/storyControls.ts';

const testArgs = {
  diagonalPatternOffsetX: 3,
  diagonalPatternOffsetY: 3,
  displayMode: 'embedded',
  visibleMonths: 2
};

console.log('Input args:', testArgs);
const settings = argsToSettings(testArgs);
console.log('Output settings diagonalPatternOffset:', settings.diagonalPatternOffset);
console.log('Expected: { x: 3, y: 3 }');