import * as fs from 'fs';
import * as path from 'path';
import { Config, Template, LanguageTemplates, Templates } from '../types/templates';

export class FileProcessor {
    static processFiles(directory: string): Templates {
        const files = fs.readdirSync(directory).sort((a: string, b: string): number => {
            if (a.endsWith('.json')) return -1;
            if (b.endsWith('.json')) return 1;
            return 0;
        });
        
        const templates: Templates = {};
        
        files.forEach((file: string) => {
            const filePath: string = path.join(directory, file);
            const content: Buffer = fs.readFileSync(filePath);
            
            if (file.endsWith('.json')) {
                try {
                    const config: Config = JSON.parse(content.toString());
                    const language: string = config.language.toLowerCase();
                    
                    if (!templates[language]) {
                        templates[language] = { config: config, templates: [] };
                    } else {
                        templates[language].config = config;
                    }
                } catch (error) {
                    console.error(`Error parsing JSON file: ${filePath}`, error);
                }
            } else if (file.endsWith('.hbs')) {
                const parts: string[] = file.split('.');
                const language: string = parts[parts.length - 2];
                const type: string = parts[parts.length - 3];
                const subType: string = parts[parts.length - 4];
                
                const template: Template = { 
                    fileName: file, 
                    content: content, 
                    subType: subType, 
                    type: type 
                };
                
                const langKey: string = language.toLowerCase();
                
                if (!templates[langKey]) {
                    templates[langKey] = { config: null, templates: [template] };
                } else {
                    templates[langKey].templates.push(template);
                }
            }
        });
        
        return templates;
    }
}