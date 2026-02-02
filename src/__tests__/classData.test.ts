import { AttributeData } from '../mermaid-model/attributeData';
import { ClassData } from '../mermaid-model/classData';
import { MethodData } from '../mermaid-model/methodData';
import { OptionData } from '../mermaid-model/optionData';
import { RelationData } from '../mermaid-model/relationData';

describe('ClassData', () => {
    let mockClassData: ClassData;

    beforeEach(() => {
        mockClassData = {
            Name: 'TestClass',
            Namespace: 'Test.Namespace',
            Type: 'class',
            Attributes: {},
            Methods: {},
            Dependencies: {},
            Compositions: {},
            Aggregations: {},
            Associations: {},
            Realizations: {},
            Implementations: {},
            Inheritance: {},
            Lines: {},
            DashedLinks: {},
            Options: [],
        };
    });

    it('should create a valid ClassData object', () => {
        expect(mockClassData.Name).toBe('TestClass');
        expect(mockClassData.Namespace).toBe('Test.Namespace');
        expect(mockClassData.Type).toBe('class');
    });

    it('should support optional Comment field', () => {
        mockClassData.Comment = 'This is a test class';
        expect(mockClassData.Comment).toBe('This is a test class');
    });

    it('should handle attributes collection', () => {
        const attribute: AttributeData = {
            Type: 'string',
            IsSystemType: false,
            Scope: 'private',
            DefaultValue: '',
        };
        mockClassData.Attributes['testProperty'] = attribute;

        expect(mockClassData.Attributes['testProperty']).toEqual(attribute);
        expect(Object.keys(mockClassData.Attributes)).toHaveLength(1);
    });

    it('should handle methods collection', () => {
        const method: MethodData = {
            Type: 'void',
            Scope: 'public',
            Classifiers: 'static',
        };
        mockClassData.Methods['testMethod'] = method;

        expect(mockClassData.Methods['testMethod']).toEqual(method);
        expect(Object.keys(mockClassData.Methods)).toHaveLength(1);
    });

    it('should handle various relationship types', () => {
        const relation: RelationData = {
            Multiplicity: '1',
            Description: 'test relationship',
            LineType: 'solid',
            Target: 'TargetClass',
        };

        mockClassData.Dependencies['dep1'] = relation;
        mockClassData.Compositions['comp1'] = relation;
        mockClassData.Aggregations['agg1'] = relation;

        expect(Object.keys(mockClassData.Dependencies)).toHaveLength(1);
        expect(Object.keys(mockClassData.Compositions)).toHaveLength(1);
        expect(Object.keys(mockClassData.Aggregations)).toHaveLength(1);
    });

    it('should handle options array', () => {
        const option: OptionData = {
            option: {
                Name: 'testKey',
                Value: 'testValue',
            },
        };
        mockClassData.Options.push(option);

        expect(mockClassData.Options).toHaveLength(1);
        expect(mockClassData.Options[0]).toEqual(option);
    });
});
