/** Represents a class method */
interface MethodData {
    Type: string;
    Scope: string;
    Classifiers: string;
    Arguments?: ArgumentData[];
    Comment?: string;
}
