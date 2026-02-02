import { CommandHandler } from '../commandHandler';
import { TransformOptions } from '../types/transformOptions';

// Mock all the services at the module level
jest.mock('../initializeService', () => ({
    InitializeService: jest.fn().mockImplementation(() => ({
        runInitializeAndReturnExitCode: jest.fn(),
    })),
}));
jest.mock('../codeGenerator', () => ({
    CodeGenerator: jest.fn().mockImplementation(() => ({
        generate: jest.fn(),
    })),
}));
jest.mock('../listLanguagesService', () => ({
    ListLanguagesService: jest.fn().mockImplementation(() => ({
        runListLanguages: jest.fn(),
    })),
}));

// Mock the entire transformManager module to avoid the problematic import chain
jest.mock('../transformManager', () => ({
    TransformManager: jest.fn().mockImplementation(() => ({
        run: jest.fn(),
    })),
}));

import { CodeGenerator } from '../codeGenerator';
import { InitializeService } from '../initializeService';
import { ListLanguagesService } from '../listLanguagesService';
import { TransformManager } from '../transformManager';

describe('CommandHandler', () => {
    let commandHandler: CommandHandler;
    let mockInitializeService: jest.Mocked<InitializeService>;
    let mockTransformManager: jest.Mocked<TransformManager>;
    let mockCodeGenerator: jest.Mocked<CodeGenerator>;
    let mockListLanguagesService: jest.Mocked<ListLanguagesService>;

    beforeEach(() => {
        mockInitializeService = new InitializeService() as jest.Mocked<InitializeService>;
        mockTransformManager = new TransformManager() as jest.Mocked<TransformManager>;
        mockCodeGenerator = new CodeGenerator() as jest.Mocked<CodeGenerator>;
        mockListLanguagesService = new ListLanguagesService() as jest.Mocked<ListLanguagesService>;

        commandHandler = new CommandHandler(
            mockInitializeService,
            mockTransformManager,
            mockCodeGenerator,
            mockListLanguagesService,
        );

        jest.clearAllMocks();
    });

    it('should create CommandHandler with injected dependencies', () => {
        expect(commandHandler).toBeDefined();
        expect(commandHandler).toBeInstanceOf(CommandHandler);
    });

    it('should have access to all required services', () => {
        // Verify that the constructor accepts all the required services
        expect(mockInitializeService).toBeDefined();
        expect(mockTransformManager).toBeDefined();
        expect(mockCodeGenerator).toBeDefined();
        expect(mockListLanguagesService).toBeDefined();
    });

    describe('handleInitializeCommand', () => {
        it('should delegate to initializeService and return exit code', () => {
            // Arrange
            const opts = { language: 'csharp', directory: './new-project' };
            mockInitializeService.runInitializeAndReturnExitCode.mockReturnValue(0);

            // Act
            const result = commandHandler.handleInitializeCommand(opts);

            // Assert
            expect(mockInitializeService.runInitializeAndReturnExitCode).toHaveBeenCalledWith(opts);
            expect(result).toBe(0);
        });

        it('should return non-zero exit code on failure', () => {
            // Arrange
            const opts = { language: 'invalid', directory: './project' };
            mockInitializeService.runInitializeAndReturnExitCode.mockReturnValue(1);

            // Act
            const result = commandHandler.handleInitializeCommand(opts);

            // Assert
            expect(result).toBe(1);
        });
    });

    describe('handleListLanguagesCommand', () => {
        it('should delegate to listLanguagesService and return exit code', () => {
            // Arrange
            mockListLanguagesService.runListLanguages.mockReturnValue(0);

            // Act
            const result = commandHandler.handleListLanguagesCommand();

            // Assert
            expect(mockListLanguagesService.runListLanguages).toHaveBeenCalled();
            expect(result).toBe(0);
        });

        it('should return non-zero exit code on failure', () => {
            // Arrange
            mockListLanguagesService.runListLanguages.mockReturnValue(1);

            // Act
            const result = commandHandler.handleListLanguagesCommand();

            // Assert
            expect(result).toBe(1);
        });
    });

    describe('handleTransformCommand', () => {
        it('should delegate to transformManager and return 0', () => {
            // Arrange
            const opts: TransformOptions = {
                input: 'diagram.md',
                output: './yaml-output',
                skipnamespace: 'Test',
            };

            // Act
            const result = commandHandler.handleTransformCommand(opts);

            // Assert
            expect(mockTransformManager.run).toHaveBeenCalledWith(opts);
            expect(result).toBe(0);
        });

        it('should handle transform options without skipnamespace', () => {
            // Arrange
            const opts: TransformOptions = {
                input: 'diagram.md',
                output: './yaml-output',
            };

            // Act
            const result = commandHandler.handleTransformCommand(opts);

            // Assert
            expect(mockTransformManager.run).toHaveBeenCalledWith(opts);
            expect(result).toBe(0);
        });
    });

    describe('handleGenerateCommand', () => {
        it('should delegate to codeGenerator and return 0', () => {
            // Arrange
            const opts = {
                input: './yaml-files',
                output: './generated-code',
                templates: './templates/csharp',
            };

            // Act
            const result = commandHandler.handleGenerateCommand(opts);

            // Assert
            expect(mockCodeGenerator.generate).toHaveBeenCalledWith(opts);
            expect(result).toBe(0);
        });

        it('should handle different template paths', () => {
            // Arrange
            const opts = {
                input: './yaml-files',
                output: './generated-code',
                templates: './templates/typescript',
            };

            // Act
            const result = commandHandler.handleGenerateCommand(opts);

            // Assert
            expect(mockCodeGenerator.generate).toHaveBeenCalledWith(opts);
            expect(result).toBe(0);
        });
    });
});
