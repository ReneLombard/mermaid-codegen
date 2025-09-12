import * as fs from 'fs';
import * as path from 'path';

/**
 * Lists available programming languages/templates
 */
export class ListLanguagesService {
    /** Lists all available languages by scanning the templates directory */
    runListLanguages(): number {
        // Implement logic to list available languages
        console.log('Available languages: ');
        // List the folders in the templates directory (each folder represents a language)
        const templatesDir: string = path.join(__dirname, 'templates');
        const languages: string[] = fs
            .readdirSync(templatesDir)
            .filter((file: string) => fs.statSync(path.join(templatesDir, file)).isDirectory());

        languages.forEach((language: string) => {
            console.log(language);
        });
        return 0;
    }
}
