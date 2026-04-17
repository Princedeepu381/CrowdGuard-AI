/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  moduleNameMapper: {
    // Mock Vite's import.meta.env for tests
    '^import\\.meta\\.env$': '<rootDir>/src/__tests__/__mocks__/importMetaEnv.js',
  },
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    '!src/lib/firebase.ts',
    '!src/lib/firebaseService.ts',
  ],
};
