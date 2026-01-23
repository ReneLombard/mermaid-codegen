import { DynamicYamlClass } from '../dynamicYamlClass';

describe('DynamicYamlClass', () => {
    let dynamicYamlClass: DynamicYamlClass;

    beforeEach(() => {
        dynamicYamlClass = new DynamicYamlClass();
    });

    it('should initialize with empty properties object', () => {
        expect(dynamicYamlClass.properties).toBeDefined();
        expect(dynamicYamlClass.properties).toEqual({});
        expect(typeof dynamicYamlClass.properties).toBe('object');
    });

    it('should allow setting properties dynamically', () => {
        dynamicYamlClass.properties.testProperty = 'testValue';
        expect(dynamicYamlClass.properties.testProperty).toBe('testValue');
    });

    it('should allow setting nested properties', () => {
        dynamicYamlClass.properties.nested = {
            property: 'nestedValue',
            array: [1, 2, 3],
        };

        expect(dynamicYamlClass.properties.nested.property).toBe('nestedValue');
        expect(dynamicYamlClass.properties.nested.array).toEqual([1, 2, 3]);
    });

    it('should allow setting complex object structures', () => {
        const complexObject = {
            name: 'TestClass',
            methods: {
                method1: { type: 'string', scope: 'public' },
                method2: { type: 'void', scope: 'private' },
            },
            attributes: ['attr1', 'attr2'],
        };

        dynamicYamlClass.properties.classData = complexObject;

        expect(dynamicYamlClass.properties.classData).toEqual(complexObject);
        expect(dynamicYamlClass.properties.classData.name).toBe('TestClass');
        expect(Object.keys(dynamicYamlClass.properties.classData.methods)).toHaveLength(2);
    });

    it('should maintain reference to the same properties object', () => {
        const originalProperties = dynamicYamlClass.properties;
        dynamicYamlClass.properties.newProp = 'value';

        expect(dynamicYamlClass.properties).toBe(originalProperties);
        expect(originalProperties.newProp).toBe('value');
    });
});
