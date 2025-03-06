module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  
  // Setup for timezone testing
  setupFiles: ['<rootDir>/jest.setup.js'],
  
  // Don't transform node_modules except date-fns and date-fns-tz
  transformIgnorePatterns: [
    '/node_modules/(?!(date-fns|date-fns-tz)/)'
  ],
  
  // Prevent console.log from cluttering the test output
  silent: false
}; 