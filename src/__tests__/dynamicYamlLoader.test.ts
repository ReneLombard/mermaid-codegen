import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yamljs';
import { DynamicYamlClass } from '../dynamicYamlClass';
import { DynamicYamlLoader } from '../loader/dynamicYamlLoader';

// Mock dependencies
jest.mock('fs');
jest.mock('path');
jest.mock('yamljs');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;
const mockYAML = YAML as jest.Mocked<typeof YAML>;

describe('DynamicYamlLoader', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default path mocks
        mockPath.join.mockImplementation((...args) => args.join('/'));
    });

    describe('loadAndMergeYamlFiles', () => {
        it('should load and return single YAML file', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            mockFs.readdirSync.mockReturnValue(['class1.yml'] as any);
            mockFs.statSync.mockReturnValue({ isDirectory: () => false } as any);
            (mockYAML.load as jest.Mock).mockReturnValue({
                Name: 'TestClass',
                Type: 'class',
                Attributes: {},
            });

            // Act
            const result = DynamicYamlLoader.loadAndMergeYamlFiles('/test/directory');

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]).toBeInstanceOf(DynamicYamlClass);
            expect(result[0].properties.Name).toBe('TestClass');
            expect(consoleSpy).toHaveBeenCalledWith('Found 1 YAML files');
            consoleSpy.mockRestore();
        });

        it('should load multiple YAML files from directory', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            mockFs.readdirSync.mockReturnValue(['class1.yml', 'class2.yml', 'config.txt'] as any);
            mockFs.statSync.mockReturnValue({ isDirectory: () => false } as any);
            (mockYAML.load as jest.Mock)
                .mockReturnValueOnce({
                    Name: 'Class1',
                    Type: 'class',
                })
                .mockReturnValueOnce({
                    Name: 'Class2',
                    Type: 'interface',
                });

            // Act
            const result = DynamicYamlLoader.loadAndMergeYamlFiles('/test/directory');

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0].properties.Name).toBe('Class1');
            expect(result[1].properties.Name).toBe('Class2');
            expect(consoleSpy).toHaveBeenCalledWith('Found 2 YAML files');
            consoleSpy.mockRestore();
        });

        it('should merge classes with same name', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            mockFs.readdirSync.mockReturnValue(['class1a.yml', 'class1b.yml'] as any);
            mockFs.statSync.mockReturnValue({ isDirectory: () => false } as any);
            (mockYAML.load as jest.Mock)
                .mockReturnValueOnce({
                    Name: 'SharedClass',
                    Attributes: { attr1: 'value1' },
                })
                .mockReturnValueOnce({
                    Name: 'SharedClass',
                    Methods: { method1: 'definition1' },
                });

            // Act
            const result = DynamicYamlLoader.loadAndMergeYamlFiles('/test/directory');

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].properties.Name).toBe('SharedClass');
            expect(result[0].properties.Attributes).toBeDefined();
            expect(result[0].properties.Methods).toBeDefined();
            consoleSpy.mockRestore();
        });

        it('should handle empty directory', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            mockFs.readdirSync.mockReturnValue([] as any);

            // Act
            const result = DynamicYamlLoader.loadAndMergeYamlFiles('/empty/directory');

            // Assert
            expect(result).toHaveLength(0);
            expect(consoleSpy).toHaveBeenCalledWith('Found 0 YAML files');
            consoleSpy.mockRestore();
        });
    });

    describe('mergeDeep', () => {
        it('should merge simple objects', () => {
            // Arrange
            const target = { a: 1, b: 2 };
            const source = { b: 3, c: 4 };

            // Act
            const result = DynamicYamlLoader.mergeDeep(target, source);

            // Assert
            expect(result.a).toBe(1);
            expect(result.b).toBe(3);
            expect((result as any).c).toBe(4);
        });

        it('should handle null target', () => {
            // Arrange
            const target = null as any;
            const source = { a: 1, b: 2 };

            // Act
            const result = DynamicYamlLoader.mergeDeep(target, source);

            // Assert - the function returns null when target is null
            expect(result).toBe(null);
        });

        it('should handle empty source', () => {
            // Arrange
            const target = { a: 1, b: 2 };
            const source = {};

            // Act
            const result = DynamicYamlLoader.mergeDeep(target, source);

            // Assert
            expect(result.a).toBe(1);
            expect(result.b).toBe(2);
        });

        it('should handle nested Object instances in mergeDeep', () => {
            // Arrange
            const target = {
                config: { setting1: 'value1' },
                data: { prop1: 'old' },
            };
            const source = {
                config: { setting1: 'value1', setting2: 'value2' },
                data: { prop1: 'new', prop2: 'added' },
            };

            // Act
            const result = DynamicYamlLoader.mergeDeep(target, source);

            // Assert
            expect(result.config).toEqual({ setting1: 'value1', setting2: 'value2' });
            expect(result.data).toEqual({ prop1: 'new', prop2: 'added' });
        });
    });

    describe('loadAndMergeYamlFiles - directory traversal', () => {
        it('should handle directories with YAML files in subdirectories', () => {
            // Arrange
            const directory = '/test/simple';
            mockFs.existsSync.mockReturnValue(true);

            // Mock directory structure: root contains one subdirectory
            mockFs.readdirSync.mockImplementation((path) => {
                if (path === '/test/simple') {
                    return ['subdir'] as any;
                } else if (path === '/test/simple/subdir') {
                    return ['file1.yml'] as any;
                }
                return [] as any;
            });

            mockFs.statSync.mockImplementation(
                (path) =>
                    ({
                        isDirectory: () => path.toString() === '/test/simple/subdir',
                    }) as fs.Stats,
            );

            // Use a simple and safe path join mock
            mockPath.join.mockImplementation((a: string, b: string) => `${a}/${b}`);

            // Mock YAML content
            mockFs.readFileSync.mockReturnValueOnce('className: TestClass1\\nproperties: {}');
            mockYAML.load.mockReturnValueOnce({ className: 'TestClass1', properties: {} } as any);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            // Act
            const result = DynamicYamlLoader.loadAndMergeYamlFiles(directory);

            // Assert
            expect(result).toHaveLength(1);
            expect(consoleSpy).toHaveBeenCalledWith('Found 1 YAML files');

            consoleSpy.mockRestore();
        });
    });
});
