module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: './tsconfig.json',
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(pixi\\.js)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/main.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^moxi$': '<rootDir>/../core/src/index.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.ts'],
  testTimeout: 10000,
};
