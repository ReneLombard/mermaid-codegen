import * as YAML from 'yamljs';
import * as fs from 'fs';
import * as path from 'path';
import { DynamicYamlClass } from '../dynamicYamlClass';

interface YamlContent {
    Name: string;
    [key: string]: any;
}

interface MergedClasses {
    [className: string]: DynamicYamlClass;
}

export class DynamicYamlLoader {
    static loadAndMergeYamlFiles(directory: string): DynamicYamlClass[] {
        function getAllFiles(dir: string, fileList: string[] = []): string[] {
            const files = fs.readdirSync(dir);

            files.forEach(file => {
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

        const files = getAllFiles(directory);
        console.log(`Found ${files.length} YAML files`);

        const mergedClasses: MergedClasses = {};

        files.forEach(file => {
            //console.log(`Loading YAML file: ${file}`);
            const yamlContent: YamlContent = YAML.load(file);
            const className = yamlContent.Name;
            //console.log(`Processing class: ${className}`);

            if (!mergedClasses[className]) {
                //console.log(`Creating new class entry for: ${className}`);
                mergedClasses[className] = new DynamicYamlClass();
                mergedClasses[className].properties = yamlContent;
            } else {
                //console.log(`Merging properties for class: ${className}`);
                mergedClasses[className].properties = this.mergeDeep(mergedClasses[className].properties, yamlContent);
            }
        });

        return Object.values(mergedClasses);
    }

    // Helper function to deep merge two objects
    static mergeDeep<T extends Record<string, any>>(target: T, source: Partial<T>): T {
        for (const key in source) {
            if ((source[key] as any) instanceof Object && key in target) {
                Object.assign((source[key] as any), this.mergeDeep(target[key] as Record<string, any>, source[key] as Record<string, any>));
            }
        }
        Object.assign(target || {}, source);
        return target;
    }
}