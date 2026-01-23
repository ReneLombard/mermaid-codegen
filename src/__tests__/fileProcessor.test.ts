import * as fs from 'fs';
import * as path from 'path';
import { FileProcessor } from '../processor/fileProcessor';

// Mock dependencies
jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('FileProcessor', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default path mocks
        mockPath.join.mockImplementation((...args) => args.join('/'));
    });

    describe('processFiles', () => {
        it('should process config JSON file first', () => {
            // Arrange
            const configContent = JSON.stringify({
                language: 'CSharp',
                fileExtension: '.cs',
                namespace: 'Test.Namespace',
            });

            mockFs.readdirSync.mockReturnValue(['config.csharp.json', 'class.csharp.hbs'] as any);
            mockFs.readFileSync
                .mockReturnValueOnce(Buffer.from(configContent))
                .mockReturnValueOnce(Buffer.from('{{Name}} template'));

            // Act
            const result = FileProcessor.processFiles('/templates/csharp');

            // Assert
            expect(result).toHaveProperty('csharp');
            expect(result.csharp.config).toEqual({
                language: 'CSharp',
                fileExtension: '.cs',
                namespace: 'Test.Namespace',
            });
        });

        it('should process handlebars template files', () => {
            // Arrange
            const templateContent = 'public class {{Name}} { }';

            mockFs.readdirSync.mockReturnValue(['class.csharp.hbs'] as any);
            mockFs.readFileSync.mockReturnValue(Buffer.from(templateContent));

            // Act
            const result = FileProcessor.processFiles('/templates/csharp');

            // Assert
            expect(result).toHaveProperty('csharp');
            expect(result.csharp.templates).toHaveLength(1);
            expect(result.csharp.templates[0]).toEqual({
                fileName: 'class.csharp.hbs',
                content: Buffer.from(templateContent),
                subType: undefined, // parts[parts.length - 4] doesn't exist for 'class.csharp.hbs'
                type: 'class', // parts[parts.length - 3] = 'class'
            });
        });

        it('should handle multiple languages in same directory', () => {
            // Arrange
            mockFs.readdirSync.mockReturnValue([
                'config.csharp.json',
                'class.csharp.hbs',
                'config.python.json',
                'class.python.hbs',
            ] as any);

            mockFs.readFileSync
                .mockReturnValueOnce(Buffer.from('{"language": "CSharp"}'))
                .mockReturnValueOnce(Buffer.from('C# template'))
                .mockReturnValueOnce(Buffer.from('{"language": "Python"}'))
                .mockReturnValueOnce(Buffer.from('Python template'));

            // Act
            const result = FileProcessor.processFiles('/templates/mixed');

            // Assert
            expect(result).toHaveProperty('csharp');
            expect(result).toHaveProperty('python');
            if (result.csharp.config) {
                expect(result.csharp.config.language).toBe('CSharp');
            }
            if (result.python.config) {
                expect(result.python.config.language).toBe('Python');
            }
        });

        it('should handle template without config', () => {
            // Arrange
            mockFs.readdirSync.mockReturnValue(['interface.typescript.hbs'] as any);
            mockFs.readFileSync.mockReturnValue(Buffer.from('interface {{Name}} { }'));

            // Act
            const result = FileProcessor.processFiles('/templates/typescript');

            // Assert
            expect(result.typescript.config).toBeNull();
            expect(result.typescript.templates).toHaveLength(1);
            expect(result.typescript.templates[0].subType).toBe(undefined);
        });

        it('should handle config without templates', () => {
            // Arrange
            mockFs.readdirSync.mockReturnValue(['config.go.json'] as any);
            mockFs.readFileSync.mockReturnValue(Buffer.from('{"language": "Go"}'));

            // Act
            const result = FileProcessor.processFiles('/templates/go');

            // Assert
            if (result.go.config) {
                expect(result.go.config.language).toBe('Go');
            }
            expect(result.go.templates).toHaveLength(0);
        });

        it('should handle malformed JSON gracefully', () => {
            // Arrange
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            mockFs.readdirSync.mockReturnValue(['invalid.json', 'valid.csharp.hbs'] as any);
            mockFs.readFileSync
                .mockReturnValueOnce(Buffer.from('{ invalid json'))
                .mockReturnValueOnce(Buffer.from('valid template'));

            // Act
            const result = FileProcessor.processFiles('/templates/mixed');

            // Assert
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(result.csharp.templates).toHaveLength(1);
            consoleErrorSpy.mockRestore();
        });

        it('should handle empty directory', () => {
            // Arrange
            mockFs.readdirSync.mockReturnValue([] as any);

            // Act
            const result = FileProcessor.processFiles('/empty/templates');

            // Assert
            expect(result).toEqual({});
        });

        it('should accumulate multiple templates for same language', () => {
            // Arrange
            mockFs.readdirSync.mockReturnValue(['class.csharp.hbs', 'interface.csharp.hbs', 'enum.csharp.hbs'] as any);

            mockFs.readFileSync.mockReturnValue(Buffer.from('template content'));

            // Act
            const result = FileProcessor.processFiles('/templates/csharp');

            // Assert
            expect(result.csharp.templates).toHaveLength(3);
            expect(result.csharp.templates.map((t) => t.subType)).toEqual([undefined, undefined, undefined]);
        });

        it('should handle files that are neither JSON nor HBS', () => {
            // Arrange
            mockFs.readdirSync.mockReturnValue(['readme.txt', 'config.xml'] as any);
            mockFs.readFileSync.mockImplementation(() => Buffer.from('some content'));

            // Act
            const result = FileProcessor.processFiles('/templates/mixed');

            // Assert
            expect(result).toEqual({});
            expect(mockFs.readFileSync).toHaveBeenCalledTimes(2); // Files are read but not processed
        });

        it('should handle empty directory', () => {
            // Arrange
            mockFs.readdirSync.mockReturnValue([] as any);

            // Act
            const result = FileProcessor.processFiles('/templates/empty');

            // Assert
            expect(result).toEqual({});
        });

        it('should prioritize JSON files over HBS files (sorting)', () => {
            // Arrange
            const fileOrder: string[] = [];
            mockFs.readdirSync.mockReturnValue(['template.hbs', 'config.json'] as any);
            mockFs.readFileSync.mockImplementation((filePath) => {
                fileOrder.push(filePath.toString());
                if (filePath.toString().includes('json')) {
                    return Buffer.from('{"language": "test"}');
                }
                return Buffer.from('template content');
            });

            // Act
            FileProcessor.processFiles('/templates/sorted');

            // Assert - JSON files should be processed first due to sorting
            expect(fileOrder[0]).toContain('config.json');
            expect(fileOrder[1]).toContain('template.hbs');
        });

        it('should handle template with full file name pattern', () => {
            // Arrange
            mockFs.readdirSync.mockReturnValue(['namespace.class.template.language.hbs'] as any);
            mockFs.readFileSync.mockReturnValue(Buffer.from('template content'));

            // Act
            const result = FileProcessor.processFiles('/templates/complex');

            // Assert
            expect(result).toHaveProperty('language');
            expect(result.language.templates).toHaveLength(1);
            expect(result.language.templates[0].subType).toBe('class'); // parts[parts.length - 4]
            expect(result.language.templates[0].type).toBe('template'); // parts[parts.length - 3]
        });
    });
});
