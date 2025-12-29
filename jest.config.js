/** @type {import('jest').Config} */
export default {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/test/__mocks__/fileMock.js',
    '^(\\.\\./)*services/firebase(\\.ts)?$': '<rootDir>/src/test/__mocks__/firebase.ts',
    '^\\./firebase(\\.ts)?$': '<rootDir>/src/test/__mocks__/firebase.ts',
    '^(\\.\\./)*services/timesheet(\\.ts)?$': '<rootDir>/src/test/__mocks__/timesheet.ts',
    '^firebase/auth$': '<rootDir>/src/test/__mocks__/firebaseAuth.ts',
    '^firebase/firestore$': '<rootDir>/src/test/__mocks__/firebaseFirestore.ts',
    '^firebase/app$': '<rootDir>/src/test/__mocks__/firebaseApp.ts',
    '^jspdf$': '<rootDir>/src/test/__mocks__/jspdf.ts',
    '^jspdf-autotable$': '<rootDir>/src/test/__mocks__/jspdf-autotable.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          module: 'ESNext',
          moduleResolution: 'Node',
          types: ['jest', 'node', '@testing-library/jest-dom'],
        },
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)', '**/*.(test|spec).(ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/test/**/*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  injectGlobals: true,
};
