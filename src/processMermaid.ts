import * as fs from 'fs';
import * as path from 'path';
import { MermaidClassDiagramParser } from './mermaidClassDiagramParser';

// Import js-yaml using require since it's a JavaScript package
const yaml = require('js-yaml');


export class MermaidTransformer {
    private skipNamespace?: string;
    private parser: MermaidClassDiagramParser;
    private inputFile: string;
    private outputDir: string;

    constructor(input: string, output: string, skipNamespace?: string) {
        this.skipNamespace = skipNamespace;
        // Ensure this import is present at the top
        this.parser = new MermaidClassDiagramParser();
        this.inputFile = input;
        this.outputDir = output;
    }

    private removeEmptyKeys(obj: any): void {
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

    transform(): void {
        const filePaths = fs.statSync(this.inputFile).isDirectory()
            ? fs.readdirSync(this.inputFile)
            .filter((file: string) => file.endsWith('.md'))
            .map((file: string) => path.join(this.inputFile, file))
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
                console.error('Error creating output directory:', (error as Error).message);
                return;
            }
        }

        let mermaidFileContent = '';
        filePaths.forEach((filePath: string) => {
            try {
                mermaidFileContent += fs.readFileSync(filePath) + '\n';
            } catch (error) {
                console.error(`Error reading file ${filePath}:`, (error as Error).message);
            }
        });
    
        // Regex to find ```mermaid + classdiagram blocks
        const regex = /```mermaid\s*([\s\S]*?classdiagram[\s\S]*?)```/gim;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(mermaidFileContent)) !== null) {
            try {
                // Parse each code block separately
                this.parser.parse(match[1]);
            } catch (error) {
                console.error('Error parsing Mermaid code block:', (error as Error).message);
            }
        }
    
        // After parsing all blocks, generate YAML files
        const outputDir = outDirs.length ? outDirs[0] : this.outputDir;
    
        for (const [namespace, classes] of Object.entries(this.parser.getParseOutcome())) {
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