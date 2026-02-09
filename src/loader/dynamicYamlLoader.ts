import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yamljs';
import { DynamicYamlClass } from '../dynamicYamlClass';

/** Structure of YAML content with Name field */
interface YamlContent {
    Name: string;
    [key: string]: any;
}

/** Map of class names to merged YAML classes */
interface MergedClasses {
    [className: string]: DynamicYamlClass;
}

/**
 * Loads and merges YAML files from directories
 */
export class DynamicYamlLoader {
    /** Recursively loads all YAML files from a directory and merges classes with the same name */
    static loadAndMergeYamlFiles(inputPath: string): DynamicYamlClass[] {
        function getAllFiles(dir: string, fileList: string[] = []): string[] {
            const files = fs.readdirSync(dir);

            files.forEach((file) => {
                const filePath = path.join(dir, file);
                if (fs.statSync(filePath).isDirectory()) {
                    getAllFiles(filePath, fileList);
                } else if (file.endsWith('.yml')) {
                    //console.log(`Found YAML file: ${filePath}`);
                    fileList.push(filePath);
                }
            });

            return fileList;
        }

        let files: string[];

        // Check if input is a single file or a directory
        const stats = fs.statSync(inputPath);
        if (stats.isFile()) {
            // Single file
            if (path.extname(inputPath) === '.yml' || path.extname(inputPath) === '.yaml') {
                files = [inputPath];
            } else {
                throw new Error(`Invalid file type: ${inputPath}. Only .yml and .yaml files are supported.`);
            }
        } else if (stats.isDirectory()) {
            // Directory
            files = getAllFiles(inputPath).filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'));
        } else {
            throw new Error(`Invalid input path: ${inputPath}`);
        }

        console.log(`Found ${files.length} YAML files`);

        const mergedClasses: MergedClasses = {};

        files.forEach((file) => {
            //console.log(`Loading YAML file: ${file}`);
            try {
                const fileContent = fs.readFileSync(file, 'utf8');
                const yamlContent: YamlContent = YAML.parse(fileContent);
                if (!yamlContent || typeof yamlContent !== 'object') {
                    console.error(`Invalid YAML content in file: ${file}`);
                    return; // Skip this file
                }
                const className = yamlContent.Name;
                if (!className) {
                    console.error(`YAML file missing 'Name' property: ${file}`);
                    return; // Skip this file
                }
                //console.log(`Processing class: ${className}`);

                if (!mergedClasses[className]) {
                    //console.log(`Creating new class entry for: ${className}`);
                    mergedClasses[className] = new DynamicYamlClass();
                    mergedClasses[className].properties = yamlContent;
                } else {
                    mergedClasses[className].properties = this.mergeDeep(
                        mergedClasses[className].properties,
                        yamlContent,
                    );
                }
            } catch (error: any) {
                console.error(`Error parsing YAML file ${file}: ${error.message}`);
                // Skip this file and continue with others
            }
        });

        return Object.values(mergedClasses);
    }

    /** Deep merges two objects */
    static mergeDeep<T extends Record<string, any>>(target: T, source: Partial<T>): T {
        for (const key in source) {
            if ((source[key] as any) instanceof Object && key in target) {
                Object.assign(
                    source[key] as any,
                    this.mergeDeep(target[key] as Record<string, any>, source[key] as Record<string, any>),
                );
            }
        }
        Object.assign(target || {}, source);
        return target;
    }
}
