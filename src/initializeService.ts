import * as fs from 'fs';
import * as path from 'path';

/** Options for project initialization */
interface InitializeOptions {
    language: string;
    directory?: string;
}

/**
 * Initializes new projects by copying language-specific templates
 */
export class InitializeService {
    /** Initializes a new project with the specified language templates */
    runInitializeAndReturnExitCode(opts: InitializeOptions): number {
        // Implement initialization logic here
        console.log(`Initializing project with language: ${opts.language}`);
        if (opts.directory) {
            console.log(`Target directory: ${opts.directory}`);
        }

        // Look for templates in multiple possible locations FIRST
        const possibleTemplateDirs = [
            path.join(__dirname, 'Templates', opts.language),
            path.join(__dirname, '../Templates', opts.language),
            path.join(__dirname, '../../Templates', opts.language),
            path.resolve(process.cwd(), 'Templates', opts.language),
            path.resolve(process.cwd(), '../Templates', opts.language),
        ];

        let templateDir: string | null = null;

        // Find the first existing template directory
        for (const dir of possibleTemplateDirs) {
            if (fs.existsSync(dir)) {
                templateDir = dir;
                break;
            }
        }

        if (!templateDir) {
            throw new Error(`Template for language ${opts.language} does not exist.`);
        }

        // Only create directory AFTER we've validated templates exist
        if (opts.directory && !fs.existsSync(opts.directory)) {
            // If the directory fails to be created, throw an error
            try {
                fs.mkdirSync(opts.directory);
            } catch {
                throw new Error(`Failed to create directory: ${opts.directory}`);
            }
        }

        const outputDir: string = opts.directory!; // Using non-null assertion since we know it exists at this point
        const templatesOutputDir = path.join(outputDir, 'Templates', opts.language);

        // Create the Templates/Language directory structure
        try {
            fs.mkdirSync(templatesOutputDir, { recursive: true });
        } catch {
            throw new Error(`Failed to create templates directory: ${templatesOutputDir}`);
        }

        fs.readdirSync(templateDir).forEach((file: string) => {
            const srcPath: string = path.join(templateDir!, file);
            const destPath: string = path.join(templatesOutputDir, file);
            fs.copyFileSync(srcPath, destPath);
        });

        // Create a basic config.json file
        const configContent = JSON.stringify(
            {
                language: opts.language,
                templatesDirectory: `Templates/${opts.language}`,
                outputDirectory: 'output',
            },
            null,
            2,
        );
        fs.writeFileSync(path.join(outputDir, 'config.json'), configContent);

        console.log(`Copied templates for ${opts.language} to ${outputDir}`);
        return 0;
    }
}
