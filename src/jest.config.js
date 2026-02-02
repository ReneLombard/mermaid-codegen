/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>', '<rootDir>/__tests__'],
    testMatch: [
        '**/__tests__/**/*.test.+(ts|tsx|js)',
        '**/*.(test|spec).+(ts|tsx|js)'
    ],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.test.json'
        }]
    },
    collectCoverageFrom: [
        '*.{ts,tsx}',
        'mermaid-model/**/*.{ts,tsx}',
        'processor/**/*.{ts,tsx}',
        'loader/**/*.{ts,tsx}',
        'types/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!index.ts',
        '!processJison.ts'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx']
};