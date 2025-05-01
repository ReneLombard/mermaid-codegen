const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class MermaidTransformer {
    constructor(input, output, skipNamespace) {
        this.skipNamespace = skipNamespace;
        // Ensure this import is present at the top
        this.parser = require('./classDiagramParser.js').parser;
        this.inputFile = input;
        this.outputDir = output;
        // Extend the parser's `yy` object to handle class-specific logic
        this.parser.yy = {
            namespaces: {},

            addNamespace: function (namespace) {
                if (!this.namespaces[namespace]) {
                    this.namespaces[namespace] = {};
                }
                this.currentNamespace = namespace; // Set the current namespace
            },

    setDirection: function () {
    },

    addClass: function (className) {
        const currentNamespace = this.currentNamespace || 'global';
        if (!this.namespaces[currentNamespace]) {
            this.namespaces[currentNamespace] = {};
        }
        if (!this.namespaces[currentNamespace][className]) {
            this.namespaces[currentNamespace][className] = {
                Name: className,
                Namespace: currentNamespace,
                Type: 'Class',
                Attributes: {},
                Methods: {},
                Dependencies: {},
                Compositions: {},
                Aggregations: {},
                Associations: {},
                Realizations: {},
                Implementations: {},
                Inheritance: {},
                Lines: {},
                DashedLinks: {},
                Options: []

                    };
                }
            },

            addMembers: function (className, members) {
                const currentNamespace = this.currentNamespace || 'global';
                if (this.namespaces[currentNamespace] && this.namespaces[currentNamespace][className]) {
                    members.reverse().forEach((member) => {
                        const trimmedMember = member.trim();
                        //Method: + methodName(args): returnType
                        const matchMethod = trimmedMember.match(/([+\-#~])\s*(\w+)\s*\(([^)]*)\)\s*:\s*([\w~<>,\s]+)/);

                const matchAttribute = trimmedMember.match(/([+\-#~])\s*([\w<>~?[\].]+)\s+(\w+)\s*(?:=\s*([^;]*))?;*([\*\$]*)*?$/);
                const matchType = trimmedMember.match(/<<(.*?)>>/);
                const matchOption = trimmedMember.match(/^(\w+)(?:\s*=\s*(\w+))?$/);

                if (matchType) {
                    const type = matchType[1]; // Extract the matched type
                    this.namespaces[currentNamespace][className].Type = type;
                }
                else if (matchOption) {
                    const option = {
                        option: {
                            Name: matchOption[1],
                            Value: matchOption[2]
                        }
                    }
                    
                    this.namespaces[currentNamespace][className].Options.push(option);
                }
                else if (matchMethod) {
                    
                    const [_, scopeSymbol, name, methodArgs, returnType] = matchMethod;
                    const scopeMap = { '+': 'Public', '-': 'Private', '#': 'Protected', '~': 'Package' };
                    const scope = scopeMap[scopeSymbol] || 'Public';

                            if (methodArgs) {
                                // Add method
                                this.namespaces[currentNamespace][className].Methods[name] = {
                                    Type: returnType,
                                    Scope: scope,
                                    Classifiers: '',
                                    Arguments: methodArgs.split(',').map((arg) => {
                                        const [argType, argName] = arg.trim().split(/\s+/);
                                        return {
                                            Type: argType,
                                            Name: argName,
                                        };
                                    }),
                                };
                            }
                            else {
                                this.namespaces[currentNamespace][className].Methods[name] = {
                                    Type: returnType,
                                    Scope: scope,
                                    Classifiers: ''
                                };
                            }
                        }

                        //Attribute: - attributeName: type
                        else if (matchAttribute) {
                            const [_, scopeSymbol, type, name, value] = matchAttribute;
                            const scopeMap = { '+': 'Public', '-': 'Private', '#': 'Protected', '~': 'Package' };
                            const scope = scopeMap[scopeSymbol] || 'Public';
                            let newString = trimmedMember;
                            // Remove the first character if it is +, -, #, ~
                            if (['+', '-', '#', '~'].includes(newString.charAt(0))) {
                                newString = newString.substring(1).trim();
                            }
                            // Remove text from the space
                            newString = newString.split(' ')[0];
                            // Add attribute
                            this.namespaces[currentNamespace][className].Attributes[name] = {
                                Type: newString,
                                IsSystemType: !!type.match(/^[A-Z]/),
                                Scope: scope,
                                DefaultValue: value ?? '',
                            };
                        }
                    });
                } else {
                    console.warn(
                        `Warning: Attempted to add members to class "${className}" in namespace "${currentNamespace}", but it does not exist.`
                    );
                }
            },

            addRelation: function (relation) {
                let { id1, id2, relation: relationType, relationTitle2: multiplicity, title } = relation;
                for (const ns of Object.values(this.namespaces)) {
                    for (const className of Object.values(ns)) {
                        if (className.Name === id1 || className.Name === id2) {
                            const sourceId = className.Name === id1 ? id1 : id2;
                            const targetId = className.Name === id1 ? id2 : id1;
                            
                            let relationName = targetId;                
                            // Check if title contains a colon and extract the name after it
                            if (title && title.includes(':')) {
                                relationName = title.split(':')[1].trim();
                            }

                            let multiplicityType = '';
                            if (multiplicity?.includes(' ')) {
                                const parts = multiplicity.split(' ');
                                multiplicity = parts[0];
                                multiplicityType = parts[1].replace('[', '').replace(']', '');
                            }


                            const relationEntry = {
                                Multiplicity: multiplicity,
                                MultiplicityType: multiplicityType,
                                Description: title ? title.replace(':', '').trim() : '',
                                LineType : relationType.lineType.toLowerCase().replace('_', ''),
                                Target: targetId
                            };

                            const relationDirection = className.Name === id1 ? relationType.type2 : relationType.type1;

                            if (relationDirection === 'composition') {
                                ns[sourceId].Compositions[relationName] = relationEntry;
                            } else if (relationDirection === 'aggregation') {
                                ns[sourceId].Aggregations[relationName] = relationEntry;
                            } else if (relationDirection === 'dependency' && relationType.lineType === 'line') {
                                ns[sourceId].Associations[relationName] = relationEntry;
                            } else if (relationDirection === 'realization') {
                                ns[sourceId].Realizations[relationName] = relationEntry;
                            } else if (relationDirection === 'inheritance' || relationDirection === 'extension') {
                                ns[sourceId].Inheritance[relationName] = relationEntry;
                            } else if (relationDirection === 'implementation') {
                                ns[sourceId].Implementations[relationName] = relationEntry;
                            } else if (relationDirection === 'line') {
                                ns[sourceId].Lines[relationName] = relationEntry;
                            } else if (relationDirection === 'dottedline') {
                                ns[sourceId].DashedLinks[relationName] = relationEntry;
                            } else if (relationDirection === 'dependency' && relationType.lineType === 'dotted_line') {
                                ns[sourceId].Dependencies[relationName] = relationEntry;
                            }
                        }
                    }
                }
            },

            cleanupLabel: function (label) {
                return label.trim();
            },

            addClassesToNamespace: function (namespace, classes) {
                this.addNamespace(namespace); // Ensure namespace is created
                this.currentNamespace = namespace;
                classes.forEach((className) => this.addClass(className));
            },

            relationType: {
                EXTENSION: 'extension',
                COMPOSITION: 'composition',
                AGGREGATION: 'aggregation',
                ASSOCIATION: 'association',
                DEPENDENCY: 'dependency',
                REALIZATION: 'realization'
            },

            lineType: {
                LINE: 'line',
                DOTTED_LINE: 'dotted_line'
            },
        };
    }

    removeEmptyKeys(obj) {
        if (typeof obj !== 'object' || obj === null) return;

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];

                if (typeof value === 'object') {
                    // Recursively clean nested objects
                    this.removeEmptyKeys(value);

                    // After cleaning, remove the key if still empty
                    if (Object.keys(value).length === 0) {
                        delete obj[key];
                    }
                } else if (Array.isArray(value) && value.length === 0) {
                    delete obj[key];
                } else if (value === '' && (key !== 'Name' && key !== 'Namespace' && key !== 'Type')) {
                    // Optionally remove empty strings, except for these fields if needed
                    delete obj[key];
                }
            }
        }
    }

    transform() {
        const filePaths = fs.statSync(this.inputFile).isDirectory()
            ? fs.readdirSync(this.inputFile)
            .filter(file => file.endsWith('.md'))
            .map(file => path.join(this.inputFile, file))
            : [this.inputFile, path.join(__dirname, this.inputFile)].filter(fs.existsSync);

        if (filePaths.length === 0) {
            console.error('No valid Mermaid files found');
            return;
        }

        const outDirs = [this.outputDir, path.join(__dirname, this.outputDir)].filter(fs.existsSync);
        if (outDirs.length === 0) {
            try {
            fs.mkdirSync(this.outputDir, { recursive: true });
            } catch (error) {
            console.error('Error creating output directory:', error.message);
            return;
            }
        }

        let mermaidFileContent = '';
        filePaths.forEach(filePath => {
            try {
            mermaidFileContent += fs.readFileSync(filePath) + '\n';
            } catch (error) {
            console.error(`Error reading file ${filePath}:`, error.message);
            }
        });
    
        // Regex to find ```mermaid + classdiagram blocks
        const regex = /```mermaid\s*([\s\S]*?classdiagram[\s\S]*?)```/gim;
        let match;
        while ((match = regex.exec(mermaidFileContent)) !== null) {
            try {
                // Parse each code block separately
                this.parser.parse(match[1]);
            } catch (error) {
                console.error('Error parsing Mermaid code block:', error.message);
            }
        }
    
        // After parsing all blocks, generate YAML files
        const outputDir = outDirs.length ? outDirs[0] : this.outputDir;
    
        for (const [namespace, classes] of Object.entries(this.parser.yy.namespaces)) {
            const namespaceDir = this.skipNamespace 
                ? path.join(outputDir, namespace.replace(this.skipNamespace, '').replace(/\./g, '/')) 
                : path.join(outputDir, namespace.replace(/\./g, '/'));
            
            fs.mkdirSync(namespaceDir, { recursive: true });
            for (const [className, classData] of Object.entries(classes)) {
                this.removeEmptyKeys(classData);
                const yamlOutput = yaml.dump(classData, { noRefs: true });
                fs.writeFileSync(path.join(namespaceDir, `${className}.Generated.yml`), yamlOutput);
            }
        }
    }
}

module.exports = { MermaidTransformer };