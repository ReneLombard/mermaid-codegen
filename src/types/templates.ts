/** Language-specific configuration */
export interface Config {
    language: string;
    extension: string;
    namespace?: NamespaceConfiguration;
    mappings: Mappings;
}

/** Single template file */
export interface Template {
    fileName: string;
    content: Buffer;
    subType: string;
    type: string;
}

/** Templates and configuration for a specific language */
export interface LanguageTemplates {
    config: Config | null;
    templates: Template[];
}

/** Root template organization */
export interface Templates {
    [language: string]: LanguageTemplates;
}

/** Configuration for namespace handling */
export interface NamespaceConfiguration {
    namespaceFolderMap?: { [namespace: string]: string };
    prefixToIgnore?: string;
}

/** Type and scope mappings for code generation */
export interface Mappings {
    Scope?: { [key: string]: string };
    Type?: { [key: string]: string };
}

/** Options for the generate command */
export interface GenerateOptions {
    input: string;
    output: string;
    templates: string;
}
