const fs = require('fs');

class FileReader {
    readFile(path) {
        return fs.readFileSync(path, 'utf8');
    }

    fileExists(path) {
        return fs.existsSync(path);
    }
}

module.exports = { FileReader };