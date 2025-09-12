export interface Config {
    language: string;
    extension: string;
    namespace?: NamespaceConfiguration;
    mappings: Mappings;
}

export interface Template {
    fileName: string;
    content: Buffer;
    subType: string;
    type: string;
}

export interface LanguageTemplates {
    config: Config | null;
    templates: Template[];
}

export interface Templates {
    [language: string]: LanguageTemplates;
}

export interface NamespaceConfiguration {
    namespaceFolderMap?: { [namespace: string]: string };
    prefixToIgnore?: string;
}

export interface Mappings {
    Scope?: { [key: string]: string };
    Type?: { [key: string]: string };
}

export interface GenerateOptions {
    input: string;
    output: string;
    templates: string;
}
