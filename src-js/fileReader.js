const fs = require('fs');

class FileReader {
    readFile(path) {
        return fs.readFileSync(path);
    }

    fileExists(path) {
        return fs.existsSync(path);
    }
}

module.exports = { FileReader };