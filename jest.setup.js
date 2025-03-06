/**
 * Jest setup file for timezone testing
 * 
 * This sets up the environment for timezone testing
 */

// Store original timezone setting
const originalTimezone = process.env.TZ;

// No need to use afterAll here - handle cleanup in individual test files
// Jest setup files run before the tests and don't have direct access to Jest globals

// Add global utility for timezone testing
global.setTestTimezone = (timezone) => {
  process.env.TZ = timezone;
};

// Save original timezone for test files to restore
global.__ORIGINAL_TIMEZONE__ = originalTimezone; 