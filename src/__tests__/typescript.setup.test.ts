/**
 * Comprehensive test suite to validate TypeScript testing setup
 */

describe('TypeScript Testing Setup', () => {
    it('should support TypeScript syntax', () => {
        // Test TypeScript features
        const testObject: { name: string; id: number } = {
            name: 'Test',
            id: 1,
        };

        expect(testObject.name).toBe('Test');
        expect(testObject.id).toBe(1);
    });

    it('should support interfaces', () => {
        interface TestInterface {
            readonly id: number;
            name: string;
            optional?: string;
        }

        const testItem: TestInterface = {
            id: 42,
            name: 'Test Item',
        };

        expect(testItem.id).toBe(42);
        expect(testItem.name).toBe('Test Item');
        expect(testItem.optional).toBeUndefined();
    });

    it('should support generic types', () => {
        function identity<T>(arg: T): T {
            return arg;
        }

        const stringResult = identity<string>('hello');
        const numberResult = identity<number>(123);

        expect(typeof stringResult).toBe('string');
        expect(typeof numberResult).toBe('number');
        expect(stringResult).toBe('hello');
        expect(numberResult).toBe(123);
    });

    it('should support async/await', async () => {
        const asyncFunction = async (): Promise<string> => {
            return new Promise((resolve) => {
                setTimeout(() => resolve('async result'), 10);
            });
        };

        const result = await asyncFunction();
        expect(result).toBe('async result');
    });

    it('should support class syntax', () => {
        class TestClass {
            private _value: number;

            constructor(value: number) {
                this._value = value;
            }

            public getValue(): number {
                return this._value;
            }

            public setValue(value: number): void {
                this._value = value;
            }
        }

        const instance = new TestClass(100);
        expect(instance.getValue()).toBe(100);

        instance.setValue(200);
        expect(instance.getValue()).toBe(200);
    });

    it('should support enum types', () => {
        enum TestEnum {
            FIRST = 'first',
            SECOND = 'second',
            THIRD = 'third',
        }

        expect(TestEnum.FIRST).toBe('first');
        expect(TestEnum.SECOND).toBe('second');
        expect(Object.values(TestEnum)).toHaveLength(3);
    });

    it('should handle union types', () => {
        type StringOrNumber = string | number;

        const processValue = (value: StringOrNumber): string => {
            return typeof value === 'string' ? value.toUpperCase() : value.toString();
        };

        expect(processValue('hello')).toBe('HELLO');
        expect(processValue(42)).toBe('42');
    });
});
