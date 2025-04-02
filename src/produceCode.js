const fs = require('fs');
const path = require('path');
const { CodeGenerator } = require('./codeGenerator.js');

const fileReader = {
    readFile: (filePath) => fs.readFileSync(filePath, 'utf8'),
    fileExists: (filePath) => fs.existsSync(filePath)
};

const fileWriter = {
    write: (filePath, contents) => fs.writeFileSync(filePath, contents)
};

const opts = {
    inputFileDirectory: './output/VehicleManagement_Assistance/',
    outputDirectory: './output/code',
    templatesDirectory: './Templates'
};

const codeGenerator = new CodeGenerator(fileReader, fileWriter);
codeGenerator.generate(opts);