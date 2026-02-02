import { TransformManager } from '../transformManager';
import { TransformOptions } from '../types/transformOptions';

// Mock the MermaidTransformer
jest.mock('../processMermaid', () => ({
    MermaidTransformer: jest.fn().mockImplementation(() => ({
        transform: jest.fn(),
    })),
}));

import { MermaidTransformer } from '../processMermaid';

const MockedMermaidTransformer = MermaidTransformer as jest.MockedClass<typeof MermaidTransformer>;

describe('TransformManager', () => {
    let transformManager: TransformManager;
    let mockOptions: TransformOptions;

    beforeEach(() => {
        transformManager = new TransformManager();
        mockOptions = {
            input: 'test.md',
            output: './output',
            skipnamespace: 'Test.Namespace',
        };

        jest.clearAllMocks();
    });

    describe('run', () => {
        it('should create MermaidTransformer and call transform when output is provided', () => {
            // Arrange
            const mockTransform = jest.fn();
            MockedMermaidTransformer.mockImplementation(
                () =>
                    ({
                        transform: mockTransform,
                    }) as any,
            );

            // Act
            transformManager.run(mockOptions);

            // Assert
            expect(MockedMermaidTransformer).toHaveBeenCalledWith(
                mockOptions.input,
                mockOptions.output,
                mockOptions.skipnamespace,
            );
            expect(mockTransform).toHaveBeenCalled();
        });

        it('should not create MermaidTransformer when output is not provided', () => {
            // Arrange
            const optionsWithoutOutput = {
                input: 'test.md',
            } as TransformOptions;

            // Act
            transformManager.run(optionsWithoutOutput);

            // Assert
            expect(MockedMermaidTransformer).not.toHaveBeenCalled();
        });

        it('should handle undefined skipnamespace', () => {
            // Arrange
            const optionsWithoutSkipNamespace: TransformOptions = {
                input: 'test.md',
                output: './output',
            };
            const mockTransform = jest.fn();
            MockedMermaidTransformer.mockImplementation(
                () =>
                    ({
                        transform: mockTransform,
                    }) as any,
            );

            // Act
            transformManager.run(optionsWithoutSkipNamespace);

            // Assert
            expect(MockedMermaidTransformer).toHaveBeenCalledWith(
                optionsWithoutSkipNamespace.input,
                optionsWithoutSkipNamespace.output,
                undefined,
            );
            expect(mockTransform).toHaveBeenCalled();
        });
    });
});
