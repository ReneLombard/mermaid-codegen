import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { CodeGenerator } from '../codeGenerator';
import { DynamicYamlClass } from '../dynamicYamlClass';
import { GenerateOptions, LanguageTemplates, Template } from '../types/templates';

// Mock dependencies
jest.mock('fs');
jest.mock('path');
jest.mock('handlebars');
jest.mock('../loader/dynamicYamlLoader', () => ({
    DynamicYamlLoader: {
        loadAndMergeYamlFiles: jest.fn(() => []),
    },
}));
jest.mock('../processor/fileProcessor', () => ({
    FileProcessor: {
        processFiles: jest.fn(() => ({})),
    },
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;
const mockHandlebars = Handlebars as jest.Mocked<typeof Handlebars>;
const { DynamicYamlLoader } = require('../loader/dynamicYamlLoader');
const { FileProcessor } = require('../processor/fileProcessor');

describe('CodeGenerator', () => {
    let codeGenerator: CodeGenerator;
    let mockOptions: GenerateOptions;

    beforeEach(() => {
        codeGenerator = new CodeGenerator();
        mockOptions = {
            input: '/test/input',
            output: '/test/output',
            templates: '/test/templates',
        };

        jest.clearAllMocks();

        // Setup default path mocks with simpler implementation
        mockPath.join.mockImplementation((a: string, b: string) => `${a}/${b}`);
    });

    describe('generate', () => {
        it('should handle missing input directory', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            mockFs.existsSync.mockReturnValue(false);

            // Act
            codeGenerator.generate(mockOptions);

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('Error: Input file directory does not exist');
            consoleSpy.mockRestore();
        });

        it('should handle missing templates directory', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            mockFs.existsSync
                .mockReturnValueOnce(true) // input exists (first call)
                .mockReturnValueOnce(false) // templates don't exist
                .mockReturnValue(true); // any other calls return true

            // Act
            codeGenerator.generate(mockOptions);

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('Error: Templates directory does not exist');
            consoleSpy.mockRestore();
        });

        it('should handle missing output directory', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            mockFs.existsSync
                .mockReturnValueOnce(true) // input exists (first call)
                .mockReturnValueOnce(true) // templates exist (second call)
                .mockReturnValueOnce(false) // output doesn't exist (third call)
                .mockReturnValue(true); // any other calls return true

            // Act
            codeGenerator.generate(mockOptions);

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('Error: Output directory does not exist');
            consoleSpy.mockRestore();
        });

        it('should register Handlebars helpers and generate code', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            mockFs.existsSync.mockReturnValue(true);

            const mockClass = new DynamicYamlClass();
            mockClass.properties = {
                Name: 'TestClass',
                Type: 'class',
                Namespace: 'Test.Namespace',
            };

            DynamicYamlLoader.loadAndMergeYamlFiles.mockReturnValue([mockClass]);

            const mockTemplate: Template = {
                fileName: 'class.csharp.hbs',
                content: Buffer.from('public class {{Name}} { }'),
                subType: 'class',
                type: 'class',
            };

            const mockLanguageTemplates: LanguageTemplates = {
                config: {
                    language: 'CSharp',
                    extension: 'cs',
                    namespace: {} as any,
                    mappings: {},
                },
                templates: [mockTemplate],
            };

            FileProcessor.processFiles.mockReturnValue({
                csharp: mockLanguageTemplates,
            });

            const mockCompiledTemplate = jest.fn().mockReturnValue('public class TestClass { }');
            (mockHandlebars.compile as jest.Mock).mockReturnValue(mockCompiledTemplate);
            mockHandlebars.registerHelper = jest.fn();

            // Act
            codeGenerator.generate(mockOptions);

            // Assert
            expect(mockHandlebars.registerHelper).toHaveBeenCalled();
            expect(mockHandlebars.compile).toHaveBeenCalled();
            expect(mockFs.writeFileSync).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should throw error when Type is not defined in YAML', () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(true);

            const mockClass = new DynamicYamlClass();
            mockClass.properties = {
                Name: 'TestClass',
                // Missing Type property
            };

            DynamicYamlLoader.loadAndMergeYamlFiles.mockReturnValue([mockClass]);
            FileProcessor.processFiles.mockReturnValue({});

            // Act & Assert
            expect(() => codeGenerator.generate(mockOptions)).toThrow('Type is not defined in the YAML file');
        });

        it('should throw error when Name is not defined in YAML', () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(true);

            const mockClass = new DynamicYamlClass();
            mockClass.properties = {
                Type: 'class',
                // Missing Name property
            };

            DynamicYamlLoader.loadAndMergeYamlFiles.mockReturnValue([mockClass]);
            FileProcessor.processFiles.mockReturnValue({});

            // Act & Assert
            expect(() => codeGenerator.generate(mockOptions)).toThrow('Name is not defined in the YAML file');
        });

        it('should handle templates without config', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            mockFs.existsSync.mockReturnValue(true);

            const mockClass = new DynamicYamlClass();
            mockClass.properties = {
                Name: 'TestClass',
                Type: 'class',
            };

            DynamicYamlLoader.loadAndMergeYamlFiles.mockReturnValue([mockClass]);

            const mockLanguageTemplates: LanguageTemplates = {
                config: null,
                templates: [],
            };

            FileProcessor.processFiles.mockReturnValue({
                typescript: mockLanguageTemplates,
            });

            // Act
            codeGenerator.generate(mockOptions);

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(
                'Config is undefined for templatesPerLanguage:',
                mockLanguageTemplates,
            );
            consoleSpy.mockRestore();
        });

        it('should handle multiple classes', () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(true);

            const mockClass1 = new DynamicYamlClass();
            mockClass1.properties = {
                Name: 'Class1',
                Type: 'class',
            };

            const mockClass2 = new DynamicYamlClass();
            mockClass2.properties = {
                Name: 'Class2',
                Type: 'class',
            };

            DynamicYamlLoader.loadAndMergeYamlFiles.mockReturnValue([mockClass1, mockClass2]);

            const mockTemplate: Template = {
                fileName: 'class.csharp.hbs',
                content: Buffer.from('public class {{Name}} { }'),
                subType: 'class',
                type: 'class',
            };

            const mockLanguageTemplates: LanguageTemplates = {
                config: {
                    language: 'CSharp',
                    extension: 'cs',
                    namespace: {} as any,
                    mappings: {},
                },
                templates: [mockTemplate],
            };

            FileProcessor.processFiles.mockReturnValue({
                csharp: mockLanguageTemplates,
            });

            const mockCompiledTemplate = jest
                .fn()
                .mockReturnValueOnce('public class Class1 { }')
                .mockReturnValueOnce('public class Class2 { }');
            (mockHandlebars.compile as jest.Mock).mockReturnValue(mockCompiledTemplate);
            mockHandlebars.registerHelper = jest.fn();

            // Act
            codeGenerator.generate(mockOptions);

            // Assert
            expect(mockCompiledTemplate).toHaveBeenCalledTimes(2);
            expect(mockFs.writeFileSync).toHaveBeenCalledTimes(2);
        });
    });

    describe('processData', () => {
        it('should handle arrays with objects and apply mappings recursively', () => {
            // Arrange
            const mockMappings = {
                Scope: { Public: 'public', Private: 'private' },
                Type: { String: 'string', Integer: 'int' },
            };
            const yamlObject = {
                methods: [
                    { name: 'test', Scope: 'Public', Type: 'String' },
                    { name: 'test2', Scope: 'Private', Type: 'Integer' },
                ],
            };

            // Act
            const result = codeGenerator['processData'](yamlObject, mockMappings);

            // Assert
            expect(result.methods).toHaveLength(2);
            expect(result.methods[0].Scope).toBe('public');
            expect(result.methods[0].Type).toBe('string');
            expect(result.methods[1].Scope).toBe('private');
            expect(result.methods[1].Type).toBe('int');
        });

        it('should handle arrays with primitive values and apply mappings', () => {
            // Arrange
            const mockMappings = {
                Scope: { Public: 'public' },
                Type: { String: 'string' },
            };
            const yamlObject = {
                Scope: ['Public', 'Private'],
                Type: ['String', 'Integer'],
            };

            // Act
            const result = codeGenerator['processData'](yamlObject, mockMappings);

            // Assert
            expect(result.Scope).toEqual(['public', 'Private']);
            expect(result.Type).toEqual(['string', 'Integer']);
        });

        it('should handle nested objects and recursively process them', () => {
            // Arrange
            const mockMappings = {
                Scope: { Public: 'public' },
                Type: { String: 'string' },
            };
            const yamlObject = {
                class: {
                    properties: {
                        prop1: { Scope: 'Public', Type: 'String' },
                    },
                },
            };

            // Act
            const result = codeGenerator['processData'](yamlObject, mockMappings);

            // Assert
            expect(result.class.properties.prop1.Scope).toBe('public');
            expect(result.class.properties.prop1.Type).toBe('string');
        });

        it('should handle primitive values directly', () => {
            // Arrange
            const mockMappings = {
                Scope: { Public: 'public' },
            };
            const yamlObject = {
                Scope: 'Public',
                name: 'TestClass',
            };

            // Act
            const result = codeGenerator['processData'](yamlObject, mockMappings);

            // Assert
            expect(result.Scope).toBe('public');
            expect(result.name).toBe('TestClass');
        });
    });

    describe('applyReplacements', () => {
        it('should apply scope mappings correctly', () => {
            // Arrange
            const mockMappings = {
                Scope: { Public: 'public', Private: 'private' },
            };

            // Act
            const result1 = codeGenerator['applyReplacements']('Public', mockMappings, 'Scope');
            const result2 = codeGenerator['applyReplacements']('Private', mockMappings, 'Scope');

            // Assert
            expect(result1).toBe('public');
            expect(result2).toBe('private');
        });

        it('should apply type mappings correctly', () => {
            // Arrange
            const mockMappings = {
                Type: { String: 'string', Integer: 'int' },
            };

            // Act
            const result1 = codeGenerator['applyReplacements']('String', mockMappings, 'Type');
            const result2 = codeGenerator['applyReplacements']('Integer', mockMappings, 'Type');

            // Assert
            expect(result1).toBe('string');
            expect(result2).toBe('int');
        });

        it('should return original value for unknown keys', () => {
            // Arrange
            const mockMappings = { Scope: {}, Type: {} };

            // Act
            const result = codeGenerator['applyReplacements']('someValue', mockMappings, 'unknownKey');

            // Assert
            expect(result).toBe('someValue');
        });
    });

    describe('applyReplacementsForMapping', () => {
        it('should apply direct mappings', () => {
            // Arrange
            const mappingDict = { Public: 'public', Private: 'private' };

            // Act
            const result1 = codeGenerator['applyReplacementsForMapping'](mappingDict, 'Public');
            const result2 = codeGenerator['applyReplacementsForMapping'](mappingDict, 'Unknown');

            // Assert
            expect(result1).toBe('public');
            expect(result2).toBe('Unknown');
        });

        it('should apply regex patterns', () => {
            // Arrange
            const mappingDict = {
                'REGEX:^get': 'retrieve',
                'REGEX:^set': 'assign',
            };

            // Act
            const result1 = codeGenerator['applyReplacementsForMapping'](mappingDict, 'getName');
            const result2 = codeGenerator['applyReplacementsForMapping'](mappingDict, 'setAge');

            // Assert
            expect(result1).toBe('retrieveName');
            expect(result2).toBe('assignAge');
        });

        it('should apply recursive regex replacements', () => {
            // Arrange
            const mappingDict = {
                'REGEX:aa': 'b', // This will replace 'aa' with 'b', reducing the string safely
            };

            // Act
            const result = codeGenerator['applyReplacementsForMapping'](mappingDict, 'aaaa');

            // Assert
            expect(result).toBe('bb'); // 'aaaa' -> 'baa' -> 'bb'
        });
    });
});
