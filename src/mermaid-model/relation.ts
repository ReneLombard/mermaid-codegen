import { RelationType } from './relationType';

export interface Relation {
    id1: string;
    id2: string;
    relation: RelationType;
    relationTitle2?: string;
    title?: string;
}
