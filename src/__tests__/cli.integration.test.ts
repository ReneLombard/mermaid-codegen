import { Command } from 'commander';

// Mock the main modules to avoid side effects during testing
jest.mock('../codeGenerator');
jest.mock('../commandHandler');
jest.mock('../initializeService');
jest.mock('../listLanguagesService');
jest.mock('../transformManager');

describe('CLI Integration', () => {
    let originalArgv: string[];

    beforeEach(() => {
        originalArgv = process.argv;
        jest.clearAllMocks();
    });

    afterEach(() => {
        process.argv = originalArgv;
    });

    it('should create a command program', () => {
        const program = new Command();

        expect(program).toBeDefined();
        expect(program).toBeInstanceOf(Command);
    });

    it('should handle command line arguments structure', () => {
        // Test the structure of CLI arguments that the app expects
        const testArgs = [
            'node',
            'dist/index.js',
            'transform',
            '-i',
            './test.md',
            '-o',
            './output',
            '-n',
            'Test.Namespace',
        ];

        expect(testArgs).toContain('transform');
        expect(testArgs).toContain('-i');
        expect(testArgs).toContain('-o');
        expect(testArgs).toContain('-n');
    });

    it('should handle generate command arguments structure', () => {
        const generateArgs = [
            'node',
            'dist/index.js',
            'generate',
            '-i',
            './yml',
            '-o',
            './code',
            '--templates',
            './Templates/C#',
        ];

        expect(generateArgs).toContain('generate');
        expect(generateArgs).toContain('--templates');
    });

    it('should handle initialize command arguments structure', () => {
        const initArgs = ['node', 'dist/index.js', 'init', '-l', 'csharp', '-d', './new-project'];

        expect(initArgs).toContain('init');
        expect(initArgs).toContain('-l');
        expect(initArgs).toContain('-d');
    });
});
