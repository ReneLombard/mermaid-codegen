import { TransformOptions } from '../types/transformOptions';

describe('TransformOptions', () => {
    it('should define required properties correctly', () => {
        const options: TransformOptions = {
            input: 'test.md',
            output: './output',
        };

        expect(options.input).toBe('test.md');
        expect(options.output).toBe('./output');
        expect(options.skipnamespace).toBeUndefined();
    });

    it('should allow optional skipnamespace property', () => {
        const options: TransformOptions = {
            input: 'test.md',
            output: './output',
            skipnamespace: 'Test.Namespace',
        };

        expect(options.skipnamespace).toBe('Test.Namespace');
    });

    it('should work with string paths', () => {
        const options: TransformOptions = {
            input: './input/mermaid-file.md',
            output: '../output/yaml-files',
            skipnamespace: 'Company.Project.Module',
        };

        expect(typeof options.input).toBe('string');
        expect(typeof options.output).toBe('string');
        expect(typeof options.skipnamespace).toBe('string');
    });

    it('should handle relative and absolute paths', () => {
        const absoluteOptions: TransformOptions = {
            input: '/absolute/path/to/input.md',
            output: '/absolute/path/to/output',
        };

        const relativeOptions: TransformOptions = {
            input: './relative/input.md',
            output: '../relative/output',
        };

        expect(absoluteOptions.input.startsWith('/')).toBe(true);
        expect(relativeOptions.input.startsWith('./')).toBe(true);
    });

    it('should support empty skipnamespace', () => {
        const options: TransformOptions = {
            input: 'test.md',
            output: './output',
            skipnamespace: '',
        };

        expect(options.skipnamespace).toBe('');
    });

    it('should handle complex namespace patterns', () => {
        const options: TransformOptions = {
            input: 'complex-diagram.md',
            output: './generated-code',
            skipnamespace: 'Com.Company.Product.Module.SubModule',
        };

        expect(options.skipnamespace).toContain('.');
        expect(options.skipnamespace?.split('.').length).toBe(5);
    });

    it('should validate that required properties cannot be empty', () => {
        const validOptions: TransformOptions = {
            input: 'valid-input.md',
            output: './valid-output',
        };

        expect(validOptions.input).toBeTruthy();
        expect(validOptions.output).toBeTruthy();
    });

    it('should handle edge cases for input property', () => {
        const edgeCases: TransformOptions[] = [
            { input: ' ', output: './output' },
            { input: '\t', output: './output' },
            { input: '\n', output: './output' },
            { input: 'file-without-extension', output: './output' },
        ];

        edgeCases.forEach((options) => {
            expect(typeof options.input).toBe('string');
            expect(options.input.length).toBeGreaterThan(0);
        });
    });

    it('should handle edge cases for output property', () => {
        const edgeCases: TransformOptions[] = [
            { input: 'test.md', output: ' ' },
            { input: 'test.md', output: '.' },
            { input: 'test.md', output: '..' },
            { input: 'test.md', output: '/' },
        ];

        edgeCases.forEach((options) => {
            expect(typeof options.output).toBe('string');
            expect(options.output.length).toBeGreaterThan(0);
        });
    });

    it('should handle special characters in paths', () => {
        const options: TransformOptions = {
            input: './test file with spaces.md',
            output: './output-with-hyphens_and_underscores',
            skipnamespace: 'Namespace.With.Special-Characters_123',
        };

        expect(options.input).toContain(' ');
        expect(options.output).toContain('-');
        expect(options.output).toContain('_');
        expect(options.skipnamespace).toMatch(/[a-zA-Z0-9._-]+/);
    });

    it('should handle very long paths and namespaces', () => {
        const longPath = 'very/long/path/'.repeat(20) + 'file.md';
        const longNamespace = 'Very.Long.Namespace.'.repeat(10) + 'Module';

        const options: TransformOptions = {
            input: longPath,
            output: './output',
            skipnamespace: longNamespace,
        };

        expect(options.input.length).toBeGreaterThan(100);
        expect(options.skipnamespace!.length).toBeGreaterThan(100);
    });

    it('should maintain type safety with all combinations', () => {
        const combinations: TransformOptions[] = [
            { input: 'a', output: 'b' },
            { input: 'a', output: 'b', skipnamespace: undefined },
            { input: 'a', output: 'b', skipnamespace: 'c' },
            { input: 'a', output: 'b', skipnamespace: '' },
        ];

        combinations.forEach((options) => {
            expect(options).toHaveProperty('input');
            expect(options).toHaveProperty('output');
            expect(options.input).toBeDefined();
            expect(options.output).toBeDefined();
        });
    });
    const validOptions: TransformOptions = {
        input: 'valid-input.md',
        output: './valid-output',
    };

    expect(validOptions.input).toBeTruthy();
    expect(validOptions.output).toBeTruthy();
});
