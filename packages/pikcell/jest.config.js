module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests/unit'],
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
    '!src/editor-exports.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  moduleNameMapper: {
    '^moxi$': '<rootDir>/../core/src/index.ts',
    '^@moxijs/core$': '<rootDir>/../core/src/index.ts',
    '^@moxijs/ui$': '<rootDir>/../ui/src/index.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.ts'],
  testTimeout: 10000,
};
