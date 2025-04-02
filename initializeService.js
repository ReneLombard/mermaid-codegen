const fs = require('fs');
const path = require('path');

class InitializeService {
    runInitializeAndReturnExitCode(opts) {
        // Implement initialization logic here
        console.log(`Initializing project with language: ${opts.language}`);
        if (opts.directory) {
            console.log(`Target directory: ${opts.directory}`);
        }

        //Check whether directory exists, if not try to create it
        if (opts.directory && !fs.existsSync(opts.directory)) {
         //If the directory fails to be created, throw an error
         try{
            fs.mkdirSync(opts.directory);
         } catch (err) {
            throw new Error(`Failed to create directory: ${opts.directory}`);
         }
        }
        const templateDir = path.join(__dirname, 'Templates', opts.language);
        const outputDir = opts.directory;

        if (!fs.existsSync(templateDir)) {
            throw new Error(`Template for language ${opts.language} does not exist.`);
        }

        fs.readdirSync(templateDir).forEach(file => {
            const srcPath = path.join(templateDir, file);
            const destPath = path.join(outputDir, file);
            fs.copyFileSync(srcPath, destPath);
        });

        console.log(`Copied templates for ${opts.language} to ${outputDir}`);
        return 0;
    }
}

module.exports = { InitializeService };