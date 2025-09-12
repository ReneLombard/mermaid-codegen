import { ArgumentData } from './argumentData';

/** Represents a class method */
export interface MethodData {
    Type: string;
    Scope: string;
    Classifiers: string;
    Arguments?: ArgumentData[];
    Comment?: string;
}
