import { ArgumentData } from '../mermaid-model/argumentData';
import { MethodData } from '../mermaid-model/methodData';

describe('Mermaid Model Interfaces', () => {
    describe('ArgumentData', () => {
        it('should create valid ArgumentData with required properties', () => {
            const arg: ArgumentData = {
                Type: 'string',
                Name: 'parameter1',
            };

            expect(arg.Type).toBe('string');
            expect(arg.Name).toBe('parameter1');
        });

        it('should support different parameter types', () => {
            const stringArg: ArgumentData = { Type: 'string', Name: 'name' };
            const numberArg: ArgumentData = { Type: 'number', Name: 'count' };
            const booleanArg: ArgumentData = { Type: 'boolean', Name: 'isActive' };
            const customArg: ArgumentData = { Type: 'CustomClass', Name: 'instance' };

            expect(stringArg.Type).toBe('string');
            expect(numberArg.Type).toBe('number');
            expect(booleanArg.Type).toBe('boolean');
            expect(customArg.Type).toBe('CustomClass');
        });

        it('should handle complex parameter names', () => {
            const complexArgs: ArgumentData[] = [
                { Type: 'List<string>', Name: 'items' },
                { Type: 'Dictionary<string, object>', Name: 'metadata' },
                { Type: 'Action<int>', Name: 'callback' },
                { Type: 'T', Name: 'genericParam' },
            ];

            complexArgs.forEach((arg) => {
                expect(arg).toHaveProperty('Type');
                expect(arg).toHaveProperty('Name');
                expect(typeof arg.Type).toBe('string');
                expect(typeof arg.Name).toBe('string');
            });
        });

        it('should handle camelCase and PascalCase names', () => {
            const camelCaseArg: ArgumentData = { Type: 'int', Name: 'itemCount' };
            const pascalCaseArg: ArgumentData = { Type: 'string', Name: 'ItemName' };

            expect(camelCaseArg.Name).toBe('itemCount');
            expect(pascalCaseArg.Name).toBe('ItemName');
        });
    });

    describe('MethodData', () => {
        it('should create valid MethodData with required properties', () => {
            const method: MethodData = {
                Type: 'void',
                Scope: 'public',
                Classifiers: 'static',
            };

            expect(method.Type).toBe('void');
            expect(method.Scope).toBe('public');
            expect(method.Classifiers).toBe('static');
        });

        it('should support optional Arguments array', () => {
            const methodWithArgs: MethodData = {
                Type: 'string',
                Scope: 'private',
                Classifiers: '',
                Arguments: [
                    { Type: 'int', Name: 'id' },
                    { Type: 'string', Name: 'name' },
                ],
            };

            expect(methodWithArgs.Arguments).toBeDefined();
            expect(methodWithArgs.Arguments).toHaveLength(2);
            expect(methodWithArgs.Arguments![0].Type).toBe('int');
            expect(methodWithArgs.Arguments![1].Name).toBe('name');
        });

        it('should support optional Comment property', () => {
            const methodWithComment: MethodData = {
                Type: 'bool',
                Scope: 'protected',
                Classifiers: 'virtual',
                Comment: 'This method validates the input data',
            };

            expect(methodWithComment.Comment).toBe('This method validates the input data');
        });

        it('should handle method without Arguments', () => {
            const simpleMethod: MethodData = {
                Type: 'void',
                Scope: 'public',
                Classifiers: '',
            };

            expect(simpleMethod.Arguments).toBeUndefined();
        });

        it('should handle different return types', () => {
            const returnTypeMethods: MethodData[] = [
                { Type: 'void', Scope: 'public', Classifiers: '' },
                { Type: 'int', Scope: 'public', Classifiers: '' },
                { Type: 'string', Scope: 'public', Classifiers: '' },
                { Type: 'List<string>', Scope: 'public', Classifiers: '' },
                { Type: 'Task<bool>', Scope: 'public', Classifiers: 'async' },
                { Type: 'T', Scope: 'public', Classifiers: 'generic' },
            ];

            returnTypeMethods.forEach((method) => {
                expect(method).toHaveProperty('Type');
                expect(typeof method.Type).toBe('string');
            });
        });

        it('should handle different scopes', () => {
            const scopeMethods: MethodData[] = [
                { Type: 'void', Scope: 'public', Classifiers: '' },
                { Type: 'void', Scope: 'private', Classifiers: '' },
                { Type: 'void', Scope: 'protected', Classifiers: '' },
                { Type: 'void', Scope: 'internal', Classifiers: '' },
            ];

            scopeMethods.forEach((method) => {
                expect(['public', 'private', 'protected', 'internal']).toContain(method.Scope);
            });
        });

        it('should handle different classifiers', () => {
            const classifierMethods: MethodData[] = [
                { Type: 'void', Scope: 'public', Classifiers: 'static' },
                { Type: 'void', Scope: 'public', Classifiers: 'virtual' },
                { Type: 'void', Scope: 'public', Classifiers: 'abstract' },
                { Type: 'void', Scope: 'public', Classifiers: 'override' },
                { Type: 'void', Scope: 'public', Classifiers: 'async' },
                { Type: 'void', Scope: 'public', Classifiers: 'static virtual' },
            ];

            classifierMethods.forEach((method) => {
                expect(method).toHaveProperty('Classifiers');
                expect(typeof method.Classifiers).toBe('string');
            });
        });

        it('should handle complex method with all properties', () => {
            const complexMethod: MethodData = {
                Type: 'Task<List<string>>',
                Scope: 'public',
                Classifiers: 'static async',
                Arguments: [
                    { Type: 'int', Name: 'userId' },
                    { Type: 'string', Name: 'filter' },
                    { Type: 'CancellationToken', Name: 'cancellationToken' },
                ],
                Comment: 'Retrieves filtered user data asynchronously',
            };

            expect(complexMethod.Type).toBe('Task<List<string>>');
            expect(complexMethod.Scope).toBe('public');
            expect(complexMethod.Classifiers).toBe('static async');
            expect(complexMethod.Arguments).toHaveLength(3);
            expect(complexMethod.Comment).toContain('asynchronously');
        });

        it('should handle empty classifiers', () => {
            const methodWithEmptyClassifiers: MethodData = {
                Type: 'int',
                Scope: 'public',
                Classifiers: '',
            };

            expect(methodWithEmptyClassifiers.Classifiers).toBe('');
        });

        it('should handle methods with complex argument types', () => {
            const methodWithComplexArgs: MethodData = {
                Type: 'void',
                Scope: 'public',
                Classifiers: '',
                Arguments: [
                    { Type: 'Dictionary<string, List<int>>', Name: 'complexData' },
                    { Type: 'Action<string, bool>', Name: 'callback' },
                    { Type: 'IEnumerable<T>', Name: 'items' },
                ],
            };

            expect(methodWithComplexArgs.Arguments![0].Type).toBe('Dictionary<string, List<int>>');
            expect(methodWithComplexArgs.Arguments![1].Type).toBe('Action<string, bool>');
            expect(methodWithComplexArgs.Arguments![2].Type).toBe('IEnumerable<T>');
        });
    });
});
