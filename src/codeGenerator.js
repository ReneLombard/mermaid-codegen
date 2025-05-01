const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const YAML = require('yamljs');
const { DynamicYamlLoader } = require('./loader/dynamicYamlLoader');
const { FileProcessor } = require('./processor/fileProcessor');

class CodeGenerator {
    constructor(fileReader, fileWriter) {
        this.fileReader = fileReader;
        this.fileWriter = fileWriter;
    }

    generate(opts) {
        this.input = opts.input;
        this.output = opts.output;
        this.templates = opts.templates;
        
        if (!fs.existsSync(this.input) && !fs.existsSync(path.join(__dirname, this.input))) {
            console.log("Error: Input file directory does not exist");
            return;
        }
        if (!fs.existsSync(opts.templates)) {
            console.log("Error: Templates directory does not exist");
            return;
        }
        if (!fs.existsSync(opts.output)) {
            console.log("Error: Output directory does not exist");
            return;
        }
        const inputFileDirectoryNormalized = fs.existsSync(this.input) ? this.input : path.join(__dirname, this.input);
        
        const mergedYmlList = DynamicYamlLoader.loadAndMergeYamlFiles(inputFileDirectoryNormalized);
        
        
        const templates = FileProcessor.processFiles(opts.templates);

        Handlebars.registerHelper('toLowerCase', (str) => str.toLowerCase());
        Handlebars.registerHelper('isEq', (str1, str2) => str1 === str2);
        Handlebars.registerHelper('isArray', (str) => str?.toUpperCase() === 'ARRAY');
        Handlebars.registerHelper('isDictionary', (str) => str?.toUpperCase().trim().startsWith('DICTIONARY'));
        Handlebars.registerHelper('dictionaryKeyType', (str) => str.split('(')[1].split(')')[0]);
        Handlebars.registerHelper({
            eq: (v1, v2) => v1 === v2,
            ne: (v1, v2) => v1 !== v2,
            lt: (v1, v2) => v1 < v2,
            gt: (v1, v2) => v1 > v2,
            lte: (v1, v2) => v1 <= v2,
            gte: (v1, v2) => v1 >= v2,
            and() {
                return Array.prototype.every.call(arguments, Boolean);
            },
            or() {
                return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
            }
        });

        mergedYmlList.forEach((mergedClass) => {
            //console.log(`Processing class: ${mergedClass.properties.Name}`);
            if (!mergedClass.properties.Type) {
                throw new Error('Type is not defined in the YAML file');
            }

            const templateType = mergedClass.properties.Type;

            if (!mergedClass.properties.Name) {
                throw new Error('Name is not defined in the YAML file');
            }

            const name = mergedClass.properties.Name;

            const elements = mergedClass.properties;

            Object.entries(templates).forEach(([language, templatesPerLanguage]) => {

                if (!templatesPerLanguage.config) {
                    console.log('Config is undefined for templatesPerLanguage:', templatesPerLanguage);
                    return;
                }

                const localizedYml = this.processData(elements, templatesPerLanguage.config.mappings);
            
                const files = templatesPerLanguage.templates.filter((file) => file.type.toLowerCase() === templateType.toLowerCase());
          
                files.forEach((file) => {

                    const jsonString = JSON.stringify(localizedYml);
                    const jsonData = JSON.parse(jsonString);
                    const compiledTemplate = Handlebars.compile(file.content.toString());

                    const result = compiledTemplate(jsonData);

                    const outputDirectory = this.determineOutputDirectory(
                        localizedYml.Namespace || '',
                        this.output,
                        templatesPerLanguage.config.namespace
                    );

                    this.fileWriter.write(path.join(outputDirectory, file.subType ? `${file.subType}.${name}.Generated.${templatesPerLanguage.config.extension}` : `${name}.Generated.${templatesPerLanguage.config.extension}`), result);
                    //console.log(`Writing file to: ${path.join(outputDirectory, file.subType ? `${file.subType}.${name}.Generated.${templatesPerLanguage.config.extension}` : `${name}.Generated.${templatesPerLanguage.config.extension}`)}`);
                  });
            });
        });
    }

    determineOutputDirectory(namespace, configuredOutputDirectory, namespaceConfiguration) {
        if (!namespace) {
            return configuredOutputDirectory;
        }
        if (namespaceConfiguration && namespaceConfiguration.namespaceFolderMap && namespaceConfiguration.namespaceFolderMap[namespace]) {
            const path = path.join(configuredOutputDirectory, namespaceConfiguration.namespaceFolderMap[namespace]);
            fs.mkdirSync(path, { recursive: true });
            return path;
        }

        let trimmedNamespace = namespace;
        if (namespaceConfiguration && namespaceConfiguration.prefixToIgnore && namespace.startsWith(namespaceConfiguration.prefixToIgnore)) {
            trimmedNamespace = namespace.substring(namespaceConfiguration.prefixToIgnore.length).trimStart('.');
        }

        const namespaceParts = trimmedNamespace.split('.');
        const relativeDirectory = namespaceParts.join(path.sep);
        const returnPath = path.join(configuredOutputDirectory, relativeDirectory);
        fs.mkdirSync(returnPath, { recursive: true });
        return returnPath;
    }

    processData(yamlObject, mappings) {
      const processedData = {};
  
      // Iterate over each key-value in the input YAML object
      Object.entries(yamlObject).forEach(([key, value]) => {
  
          if (Array.isArray(value)) {
              // If the value is an array, map each element
              processedData[key] = value.map((item) => {
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
                  const mappingDict = mappings[key];
                  let replacedValue = value;
  
  
                  // 1) Check for exact match
                  if (mappingDict[replacedValue] !== undefined) {
                      replacedValue = mappingDict[replacedValue];
                  }
  
                  // 2) Try all REGEX mappings
                  for (const [patternKey, patternReplace] of Object.entries(mappingDict)) {
                      if (patternKey.startsWith('REGEX:')) {
                          const rawPattern = patternKey.slice('REGEX:'.length);
                          const regex = new RegExp(rawPattern);
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
  
    }
      
      // Helper function
      function applyRegexRecursively(str, regex, replacement) {
        let current = str;
        while (true) {
          const next = current.replace(regex, replacement);
          if (next === current) {
            return current;
          }
          current = next;
        }
      }
      

module.exports = { CodeGenerator };