const YAML = require('yamljs');
const fs = require('fs');
const path = require('path');
const { DynamicYamlClass } = require('../dynamicYamlClass');
class DynamicYamlLoader {
    static loadAndMergeYamlFiles(directory) {

        function getAllFiles(dir, fileList = []) {
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

        const mergedClasses = {};

        files.forEach(file => {
            //console.log(`Loading YAML file: ${file}`);
            const yamlContent = YAML.load(file);
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
    static mergeDeep(target, source) {
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], this.mergeDeep(target[key], source[key]));
            }
        }
        Object.assign(target || {}, source);
        return target;
    }
}

module.exports = { DynamicYamlLoader };