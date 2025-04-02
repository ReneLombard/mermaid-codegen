const fs = require('fs');
const path = require('path');
const jison = require('jison');

// Read the Jison file
const jisonFilePath = path.join(__dirname, 'classDiagram.jison');
const jisonFileContent = fs.readFileSync(jisonFilePath, 'utf8');

// Process the Jison file
const parser = new jison.Parser(jisonFileContent);

// Generate the parser source code
const parserSource = parser.generate();

// Write the parser source code to an intermediate file
const outputFilePath = path.join(__dirname, 'classDiagramParser.js');
fs.writeFileSync(outputFilePath, parserSource);

console.log('Intermediate file generated at:', outputFilePath);