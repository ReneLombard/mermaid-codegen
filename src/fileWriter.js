const fs = require('fs');

class FileWriter {
    write(path, contents) {
        fs.writeFileSync(path, contents);
        console.log(`File written to ${path}`);
    }
}

module.exports = { FileWriter };