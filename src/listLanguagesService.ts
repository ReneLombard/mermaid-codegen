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

        // Try multiple potential template directory locations
        const possibleTemplateDirs = [
            path.join(__dirname, 'templates'),
            path.join(__dirname, '../templates'),
            path.join(__dirname, '../../Templates'),
            path.join(__dirname, '../Templates'),
            path.resolve(process.cwd(), 'Templates'),
            path.resolve(process.cwd(), '../Templates'),
        ];

        let templatesDir: string | null = null;

        // Find the first existing templates directory
        for (const dir of possibleTemplateDirs) {
            if (fs.existsSync(dir)) {
                templatesDir = dir;
                break;
            }
        }

        // Check if templates directory exists
        if (!templatesDir) {
            console.log('No templates directory found. Available languages: C#, Documentation');
            return 0;
        }

        try {
            const languages: string[] = fs
                .readdirSync(templatesDir)
                .filter((file: string) => fs.statSync(path.join(templatesDir!, file)).isDirectory());

            if (languages.length === 0) {
                console.log('No language templates found. Available languages: C#, Documentation');
            } else {
                languages.forEach((language: string) => {
                    console.log(language);
                });
            }
        } catch (error) {
            console.log('Error reading templates directory. Available languages: C#, Documentation');
        }

        return 0;
    }
}
