/** Represents a class attribute/property */
export interface AttributeData {
    Type: string;
    IsSystemType: boolean;
    Scope: string;
    DefaultValue: string;
    Comment?: string;
}
