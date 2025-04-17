const fs = require('fs');
const path = require('path');

class FileProcessor {
    static processFiles(directory) {
        const files = fs.readdirSync(directory).sort((a, b) => {
            if (a.endsWith('.json')) return -1;
            if (b.endsWith('.json')) return 1;
            return 0;
        });
        const templates = {};
        files.forEach((file) => {
            const filePath = path.join(directory, file);
            const content = fs.readFileSync(filePath);
            if (file.endsWith('.json')) {
                try {
                    const config = JSON.parse(content);
                    const language = config.language.toLowerCase();
                    if (!templates[language]) {
                        templates[language] = { config: config, templates: [] };
                    } else {
                        templates[language].config = config;
                    }
                    

                } catch (error) {
                    console.error(`Error parsing JSON file: ${filePath}`, error);
                }
            } else if (file.endsWith('.hbs')) {
                const parts = file.split('.');
                const language = parts[parts.length - 2];
                const type = parts[parts.length - 3];
                const subType = parts[parts.length - 4];
                const template = { fileName: file, content: content, subType: subType, type: type };
                const langKey = language.toLowerCase();
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

module.exports = { FileProcessor };