module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/backend-tests/**/*.test.js', '**/backend-tests/**/*.test.ts'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ['./config/jest.setup.js'],
  // Configuration de la couverture de code
  collectCoverage: true,
  coverageDirectory: 'coverage/backend',
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  collectCoverageFrom: [
    'backend-tests/**/*.js',
    '!backend-tests/mocks/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
