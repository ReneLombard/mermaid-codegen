import * as fs from 'fs';
import * as path from 'path';

interface InitializeOptions {
    language: string;
    directory?: string;
}

export class InitializeService {
    runInitializeAndReturnExitCode(opts: InitializeOptions): number {
        // Implement initialization logic here
        console.log(`Initializing project with language: ${opts.language}`);
        if (opts.directory) {
            console.log(`Target directory: ${opts.directory}`);
        }

        // Check whether directory exists, if not try to create it
        if (opts.directory && !fs.existsSync(opts.directory)) {
            // If the directory fails to be created, throw an error
            try {
                fs.mkdirSync(opts.directory);
            } catch (err) {
                throw new Error(`Failed to create directory: ${opts.directory}`);
            }
        }

        const templateDir: string = path.join(__dirname, 'Templates', opts.language);
        const outputDir: string = opts.directory!; // Using non-null assertion since we know it exists at this point

        if (!fs.existsSync(templateDir)) {
            throw new Error(`Template for language ${opts.language} does not exist.`);
        }

        fs.readdirSync(templateDir).forEach((file: string) => {
            const srcPath: string = path.join(templateDir, file);
            const destPath: string = path.join(outputDir, file);
            fs.copyFileSync(srcPath, destPath);
        });

        console.log(`Copied templates for ${opts.language} to ${outputDir}`);
        return 0;
    }
}