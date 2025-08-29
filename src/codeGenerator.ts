import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';
import { DynamicYamlClass } from './dynamicYamlClass';
import { DynamicYamlLoader } from './loader/dynamicYamlLoader';
import { FileProcessor } from './processor/fileProcessor';
import {
    GenerateOptions,
    LanguageTemplates,
    Mappings,
    NamespaceConfiguration,
    Template,
    Templates,
} from './types/templates';

export class CodeGenerator {
    private input!: string;
    private output!: string;
    private templates!: string;

    generate(opts: GenerateOptions): void {
        this.input = opts.input;
        this.output = opts.output;
        this.templates = opts.templates;

        if (!fs.existsSync(this.input) && !fs.existsSync(path.join(__dirname, this.input))) {
            console.log('Error: Input file directory does not exist');
            return;
        }
        if (!fs.existsSync(opts.templates)) {
            console.log('Error: Templates directory does not exist');
            return;
        }
        if (!fs.existsSync(opts.output)) {
            console.log('Error: Output directory does not exist');
            return;
        }

        const inputFileDirectoryNormalized: string = fs.existsSync(this.input)
            ? this.input
            : path.join(__dirname, this.input);

        const mergedYmlList: DynamicYamlClass[] = DynamicYamlLoader.loadAndMergeYamlFiles(inputFileDirectoryNormalized);

        const templates: Templates = FileProcessor.processFiles(opts.templates);

        // Register Handlebars helpers
        Handlebars.registerHelper('toLowerCase', (str: string) => str.toLowerCase());
        Handlebars.registerHelper('isEq', (str1: any, str2: any) => str1 === str2);
        Handlebars.registerHelper('isArray', (str: string) => str?.toUpperCase() === 'ARRAY');
        Handlebars.registerHelper('isDictionary', (str: string) => str?.toUpperCase().trim().startsWith('DICTIONARY'));
        Handlebars.registerHelper('dictionaryKeyType', (str: string) => str.split('(')[1].split(')')[0]);
        Handlebars.registerHelper({
            eq: (v1: any, v2: any) => v1 === v2,
            ne: (v1: any, v2: any) => v1 !== v2,
            lt: (v1: any, v2: any) => v1 < v2,
            gt: (v1: any, v2: any) => v1 > v2,
            lte: (v1: any, v2: any) => v1 <= v2,
            gte: (v1: any, v2: any) => v1 >= v2,
            and(): boolean {
                return Array.prototype.every.call(arguments, Boolean);
            },
            or(): boolean {
                return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
            },
        });

        mergedYmlList.forEach((mergedClass: DynamicYamlClass) => {
            //console.log(`Processing class: ${mergedClass.properties.Name}`);
            if (!mergedClass.properties.Type) {
                throw new Error('Type is not defined in the YAML file');
            }

            const templateType: string = mergedClass.properties.Type;

            if (!mergedClass.properties.Name) {
                throw new Error('Name is not defined in the YAML file');
            }

            const name: string = mergedClass.properties.Name;
            const elements: any = mergedClass.properties;

            Object.entries(templates).forEach(([language, templatesPerLanguage]: [string, LanguageTemplates]) => {
                if (!templatesPerLanguage.config) {
                    console.log('Config is undefined for templatesPerLanguage:', templatesPerLanguage);
                    return;
                }

                const localizedYml: any = this.processData(elements, templatesPerLanguage.config.mappings);

                const files: Template[] = templatesPerLanguage.templates.filter(
                    (file: Template) => file.type.toLowerCase() === templateType.toLowerCase(),
                );

                files.forEach((file: Template) => {
                    const jsonString: string = JSON.stringify(localizedYml);
                    const jsonData: any = JSON.parse(jsonString);
                    const compiledTemplate: HandlebarsTemplateDelegate = Handlebars.compile(file.content.toString());

                    const result: string = compiledTemplate(jsonData);

                    const outputDirectory: string = this.determineOutputDirectory(
                        localizedYml.Namespace || '',
                        this.output,
                        templatesPerLanguage.config?.namespace,
                    );

                    const fileName: string = file.subType
                        ? `${file.subType}.${name}.Generated.${templatesPerLanguage.config?.extension}`
                        : `${name}.Generated.${templatesPerLanguage.config?.extension}`;

                    fs.writeFileSync(path.join(outputDirectory, fileName), result);
                    //console.log(`Writing file to: ${path.join(outputDirectory, fileName)}`);
                });
            });
        });
    }

    private determineOutputDirectory(
        namespace: string,
        configuredOutputDirectory: string,
        namespaceConfiguration?: NamespaceConfiguration,
    ): string {
        if (!namespace) {
            return configuredOutputDirectory;
        }

        if (
            namespaceConfiguration &&
            namespaceConfiguration.namespaceFolderMap &&
            namespaceConfiguration.namespaceFolderMap[namespace]
        ) {
            const outputPath: string = path.join(
                configuredOutputDirectory,
                namespaceConfiguration.namespaceFolderMap[namespace],
            );
            fs.mkdirSync(outputPath, { recursive: true });
            return outputPath;
        }

        let trimmedNamespace: string = namespace;
        if (
            namespaceConfiguration &&
            namespaceConfiguration.prefixToIgnore &&
            namespace.startsWith(namespaceConfiguration.prefixToIgnore)
        ) {
            trimmedNamespace = namespace.substring(namespaceConfiguration.prefixToIgnore.length).replace(/^\./, ''); // Replace trimStart('.') with proper regex
        }

        const namespaceParts: string[] = trimmedNamespace.split('.');
        const relativeDirectory: string = namespaceParts.join(path.sep);
        const returnPath: string = path.join(configuredOutputDirectory, relativeDirectory);
        fs.mkdirSync(returnPath, { recursive: true });
        return returnPath;
    }

    private processData(yamlObject: any, mappings: Mappings): any {
        const processedData: any = {};

        // Iterate over each key-value in the input YAML object
        Object.entries(yamlObject).forEach(([key, value]: [string, any]) => {
            if (Array.isArray(value)) {
                // If the value is an array, map each element
                processedData[key] = value.map((item: any) => {
                    if (typeof item === 'object') {
                        // Recurse into nested objects
                        return this.processData(item, mappings);
                    } else {
                        // Apply mappings to each primitive item (e.g., list of strings)
                        if (mappings[key]) {
                            return this.applyReplacements(item, mappings, key);
                        } else {
                            return item;
                        }
                    }
                });
            } else if (typeof value === 'object') {
                // If the value is an object (e.g., nested structure), recurse
                processedData[key] = this.processData(value, mappings);
            } else {
                // The value is a primitive (string, number, etc.)
                if (mappings[key]) {
                    const mappingDict: { [value: string]: any } = mappings[key];
                    let replacedValue: any = value;

                    // 1) Check for exact match
                    if (mappingDict[replacedValue] !== undefined) {
                        replacedValue = mappingDict[replacedValue];
                    }

                    // 2) Try all REGEX mappings
                    for (const [patternKey, patternReplace] of Object.entries(mappingDict)) {
                        if (patternKey.startsWith('REGEX:')) {
                            const rawPattern: string = patternKey.slice('REGEX:'.length);
                            const regex: RegExp = new RegExp(rawPattern);
                            replacedValue = applyRegexRecursively(replacedValue, regex, patternReplace);
                        }
                    }

                    processedData[key] = replacedValue;
                } else {
                    // No mapping for this key, keep original
                    processedData[key] = value;
                }
            }
        });

        return processedData;
    }

    private applyReplacements(item: any, mappings: Mappings, key: string): any {
        // Implementation for applyReplacements method
        // This method was referenced but not defined in the original code
        return item;
    }
}

// Helper function
function applyRegexRecursively(str: any, regex: RegExp, replacement: any): any {
    let current = str;
    while (true) {
        const next = current.replace(regex, replacement);
        if (next === current) {
            return current;
        }
        current = next;
    }
}
