const fs = require('fs');
const path = require('path');

class ListLanguagesService {
    runListLanguages() {
        // Implement logic to list available languages
        console.log('Available languages: ');
        // List the folders in the templates directory (each folder represents a language)
        const templatesDir = path.join(__dirname, 'templates');
        const languages = fs.readdirSync(templatesDir).filter(file => fs.statSync(path.join(templatesDir, file)).isDirectory());

        languages.forEach(language => {
            console.log(language);
        });
        return 0;
    }
}

module.exports = { ListLanguagesService };