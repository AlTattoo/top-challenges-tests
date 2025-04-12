module.exports = {
  preset: 'react-native',
  rootDir: '..',
  testMatch: ['**/frontend-tests/**/*.test.js', '**/frontend-tests/**/*.test.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['./config/detox.setup.js'],
  testEnvironment: './config/detox.environment.js',
  verbose: true,
  testTimeout: 120000,
  // Configuration de la couverture de code
  collectCoverage: true,
  coverageDirectory: 'coverage/frontend',
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  collectCoverageFrom: [
    'frontend-tests/**/*.js',
    '!frontend-tests/mocks/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
