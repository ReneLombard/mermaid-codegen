import * as fs from 'fs';
import * as path from 'path';
import { InitializeService } from '../initializeService';

// Mock fs operations
jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('InitializeService', () => {
    let initializeService: InitializeService;

    beforeEach(() => {
        initializeService = new InitializeService();
        jest.clearAllMocks();

        // Setup default path mocks
        mockPath.join.mockImplementation((...args) => args.join('/'));
    });

    describe('runInitializeAndReturnExitCode', () => {
        it('should initialize project with language only', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const opts = { language: 'csharp' };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readdirSync.mockReturnValue(['template1.cs', 'template2.cs'] as any);
            mockFs.copyFileSync.mockImplementation(() => {});

            // Act
            const result = initializeService.runInitializeAndReturnExitCode(opts);

            // Assert
            expect(result).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith('Initializing project with language: csharp');
            consoleSpy.mockRestore();
        });

        it('should initialize project with language and directory', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const opts = { language: 'typescript', directory: './new-project' };

            mockFs.existsSync
                .mockReturnValueOnce(true) // directory exists
                .mockReturnValueOnce(true); // template directory exists
            mockFs.readdirSync.mockReturnValue(['index.ts', 'package.json'] as any);
            mockFs.copyFileSync.mockImplementation(() => {});

            // Act
            const result = initializeService.runInitializeAndReturnExitCode(opts);

            // Assert
            expect(result).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith('Initializing project with language: typescript');
            expect(consoleSpy).toHaveBeenCalledWith('Target directory: ./new-project');
            expect(consoleSpy).toHaveBeenCalledWith('Copied templates for typescript to ./new-project');
            consoleSpy.mockRestore();
        });

        it('should create directory if it does not exist', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const opts = { language: 'java', directory: './new-java-project' };

            mockFs.existsSync
                .mockReturnValueOnce(false) // directory does not exist
                .mockReturnValueOnce(true); // template directory exists
            mockFs.mkdirSync.mockImplementation(() => '' as any);
            mockFs.readdirSync.mockReturnValue(['Main.java'] as any);
            mockFs.copyFileSync.mockImplementation(() => {});

            // Act
            const result = initializeService.runInitializeAndReturnExitCode(opts);

            // Assert
            expect(result).toBe(0);
            expect(mockFs.mkdirSync).toHaveBeenCalledWith('./new-java-project');
            expect(consoleSpy).toHaveBeenCalledWith('Copied templates for java to ./new-java-project');
            consoleSpy.mockRestore();
        });

        it('should throw error if directory creation fails', () => {
            // Arrange
            const opts = { language: 'python', directory: './invalid-path' };

            mockFs.existsSync.mockReturnValue(false);
            mockFs.mkdirSync.mockImplementation(() => {
                throw new Error('Permission denied');
            });

            // Act & Assert
            expect(() => initializeService.runInitializeAndReturnExitCode(opts)).toThrow(
                'Failed to create directory: ./invalid-path',
            );
        });

        it('should throw error if template directory does not exist', () => {
            // Arrange
            const opts = { language: 'unsupported', directory: './project' };

            mockFs.existsSync
                .mockReturnValueOnce(true) // directory exists
                .mockReturnValueOnce(false); // template directory does not exist

            // Act & Assert
            expect(() => initializeService.runInitializeAndReturnExitCode(opts)).toThrow(
                'Template for language unsupported does not exist.',
            );
        });

        it('should copy all files from template directory', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const opts = { language: 'javascript', directory: './js-project' };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readdirSync.mockReturnValue(['app.js', 'package.json', 'README.md'] as any);
            const copyFileSpy = mockFs.copyFileSync.mockImplementation(() => {});

            // Act
            const result = initializeService.runInitializeAndReturnExitCode(opts);

            // Assert
            expect(result).toBe(0);
            expect(copyFileSpy).toHaveBeenCalledTimes(3);
            expect(copyFileSpy).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('Templates/javascript/app.js'),
                './js-project/app.js',
            );
            expect(copyFileSpy).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('Templates/javascript/package.json'),
                './js-project/package.json',
            );
            expect(copyFileSpy).toHaveBeenNthCalledWith(
                3,
                expect.stringContaining('Templates/javascript/README.md'),
                './js-project/README.md',
            );
            consoleSpy.mockRestore();
        });

        it('should handle empty template directory', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const opts = { language: 'empty', directory: './empty-project' };

            mockFs.existsSync.mockReturnValue(true);
            mockFs.readdirSync.mockReturnValue([] as any);
            mockFs.copyFileSync.mockImplementation(() => {});

            // Act
            const result = initializeService.runInitializeAndReturnExitCode(opts);

            // Assert
            expect(result).toBe(0);
            expect(mockFs.copyFileSync).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith('Copied templates for empty to ./empty-project');
            consoleSpy.mockRestore();
        });
    });
});
