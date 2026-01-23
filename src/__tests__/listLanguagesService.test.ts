import * as fs from 'fs';
import * as path from 'path';
import { ListLanguagesService } from '../listLanguagesService';

// Mock fs operations
jest.mock('fs');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('ListLanguagesService', () => {
    let listLanguagesService: ListLanguagesService;

    beforeEach(() => {
        listLanguagesService = new ListLanguagesService();
        jest.clearAllMocks();

        // Setup default path mocks
        mockPath.join.mockImplementation((...args) => args.join('/'));
    });

    describe('runListLanguages', () => {
        it('should list available languages from templates directory', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            mockFs.readdirSync.mockReturnValue(['C#', 'TypeScript', 'Python', 'Java'] as any);
            mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);

            // Act
            const result = listLanguagesService.runListLanguages();

            // Assert
            expect(result).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith('Available languages: ');
            expect(consoleSpy).toHaveBeenCalledWith('C#');
            expect(consoleSpy).toHaveBeenCalledWith('TypeScript');
            expect(consoleSpy).toHaveBeenCalledWith('Python');
            expect(consoleSpy).toHaveBeenCalledWith('Java');
            expect(consoleSpy).toHaveBeenCalledTimes(5); // Header + 4 languages
            consoleSpy.mockRestore();
        });

        it('should handle empty templates directory', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            mockFs.readdirSync.mockReturnValue([] as any);

            // Act
            const result = listLanguagesService.runListLanguages();

            // Assert
            expect(result).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith('Available languages: ');
            expect(consoleSpy).toHaveBeenCalledTimes(1); // Only header
            consoleSpy.mockRestore();
        });

        it('should filter out files and only show directories', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            mockFs.readdirSync.mockReturnValue(['C#', 'config.json', 'Python', 'readme.txt', 'JavaScript'] as any);
            mockFs.statSync.mockImplementation((filePath: any) => {
                const isDir = !filePath.toString().includes('.');
                return { isDirectory: () => isDir } as any;
            });

            // Act
            const result = listLanguagesService.runListLanguages();

            // Assert
            expect(result).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith('Available languages: ');
            expect(consoleSpy).toHaveBeenCalledWith('C#');
            expect(consoleSpy).toHaveBeenCalledWith('Python');
            expect(consoleSpy).toHaveBeenCalledWith('JavaScript');
            expect(consoleSpy).not.toHaveBeenCalledWith('config.json');
            expect(consoleSpy).not.toHaveBeenCalledWith('readme.txt');
            expect(consoleSpy).toHaveBeenCalledTimes(4); // Header + 3 directories
            consoleSpy.mockRestore();
        });

        it('should handle single language template', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            mockFs.readdirSync.mockReturnValue(['C#'] as any);
            mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);

            // Act
            const result = listLanguagesService.runListLanguages();

            // Assert
            expect(result).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith('Available languages: ');
            expect(consoleSpy).toHaveBeenCalledWith('C#');
            expect(consoleSpy).toHaveBeenCalledTimes(2); // Header + 1 language
            consoleSpy.mockRestore();
        });

        it('should use correct templates directory path', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            mockFs.readdirSync.mockReturnValue(['Go'] as any);
            mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);

            // Act
            listLanguagesService.runListLanguages();

            // Assert - check actual paths are used, not literal '__dirname'
            expect(mockPath.join).toHaveBeenCalledWith(expect.stringContaining('src'), 'templates');
            expect(mockFs.readdirSync).toHaveBeenCalledWith(expect.stringContaining('templates'));
            consoleSpy.mockRestore();
        });

        it('should handle mixed case and special characters in language names', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            mockFs.readdirSync.mockReturnValue(['c-sharp', 'TypeScript', 'node.js', 'F#'] as any);
            mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);

            // Act
            const result = listLanguagesService.runListLanguages();

            // Assert
            expect(result).toBe(0);
            expect(consoleSpy).toHaveBeenCalledWith('c-sharp');
            expect(consoleSpy).toHaveBeenCalledWith('TypeScript');
            expect(consoleSpy).toHaveBeenCalledWith('node.js');
            expect(consoleSpy).toHaveBeenCalledWith('F#');
            consoleSpy.mockRestore();
        });
    });
});
