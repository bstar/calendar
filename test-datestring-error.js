// Test script to reproduce the dateString.split error
import { parseISO } from 'date-fns';

console.log('Testing parseISO with various inputs:');

try {
  console.log('1. Valid date string:', parseISO('2025-07-01'));
} catch (e) {
  console.error('Error with valid date:', e.message);
}

try {
  console.log('2. Undefined:', parseISO(undefined));
} catch (e) {
  console.error('Error with undefined:', e.message);
}

try {
  console.log('3. Null:', parseISO(null));
} catch (e) {
  console.error('Error with null:', e.message);
}

try {
  console.log('4. Empty string:', parseISO(''));
} catch (e) {
  console.error('Error with empty string:', e.message);
}

try {
  console.log('5. Number:', parseISO(123));
} catch (e) {
  console.error('Error with number:', e.message);
}