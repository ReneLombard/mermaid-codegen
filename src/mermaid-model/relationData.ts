/** Represents relationships between classes */
export interface RelationData {
    Multiplicity?: string;
    MultiplicityType?: string;
    Description: string;
    LineType: string;
    Target: string;
    Comment?: string;
}
