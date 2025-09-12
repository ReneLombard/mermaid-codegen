/** Represents a class attribute/property */
interface AttributeData {
    Type: string;
    IsSystemType: boolean;
    Scope: string;
    DefaultValue: string;
    Comment?: string;
}
