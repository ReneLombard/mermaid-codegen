import * as fs from 'fs';
import * as path from 'path';

export class ListLanguagesService {
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
