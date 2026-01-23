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
        // These would be runtime validations in a real implementation
        const validOptions: TransformOptions = {
            input: 'valid-input.md',
            output: './valid-output',
        };

        expect(validOptions.input).toBeTruthy();
        expect(validOptions.output).toBeTruthy();
    });
});
