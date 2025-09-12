/** Complete class definition with all its components and relationships */
interface ClassData {
    Name: string;
    Namespace: string;
    Type: string;
    Attributes: { [key: string]: AttributeData };
    Methods: { [key: string]: MethodData };
    Dependencies: { [key: string]: RelationData };
    Compositions: { [key: string]: RelationData };
    Aggregations: { [key: string]: RelationData };
    Associations: { [key: string]: RelationData };
    Realizations: { [key: string]: RelationData };
    Implementations: { [key: string]: RelationData };
    Inheritance: { [key: string]: RelationData };
    Lines: { [key: string]: RelationData };
    DashedLinks: { [key: string]: RelationData };
    Options: OptionData[];
}
