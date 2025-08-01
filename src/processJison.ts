import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { IncomingMessage } from 'http';

// Import jison using require since it's a JavaScript package
const jison = require('jison');

// URL of the Jison file to be downloaded
const jisonFileUrl: string = 'https://raw.githubusercontent.com/mermaid-js/mermaid/develop/packages/mermaid/src/diagrams/class/parser/classDiagram.jison';

// Define the local path where the Jison file will be saved
const jisonFilePath: string = path.join(__dirname, 'classDiagram.jison');

// Step 1: Download the Jison file
console.log('Starting download of Jison file from:', jisonFileUrl);

https.get(jisonFileUrl, (response: IncomingMessage) => {
    if (response.statusCode === 200) {
        console.log('Download successful. Saving file to:', jisonFilePath);

        const file: fs.WriteStream = fs.createWriteStream(jisonFilePath);
        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log('Downloaded classDiagram.jison to:', jisonFilePath);

            // Step 2: Process the downloaded Jison file
            processJisonFile();
        });
    } else {
        console.error('Failed to download classDiagram.jison. Status code:', response.statusCode);
    }
}).on('error', (err: Error) => {
    console.error('Error downloading classDiagram.jison:', err.message);
});

// Function to process the Jison file
function processJisonFile(): void {
    try {
        console.log('Reading the Jison file content from:', jisonFilePath);

        // Read the content of the Jison file
        const jisonFileContent: string = fs.readFileSync(jisonFilePath, 'utf8');
        console.log('Successfully read the Jison file.');

        // Step 3: Create a Jison parser
        console.log('Creating a Jison parser...');
        const parser: any = new jison.Parser(jisonFileContent);

        // Step 4: Generate the parser source code
        console.log('Generating parser source code...');
        const parserSource: string = parser.generate();
        console.log('Parser source code generated successfully.');

        // Step 5: Write the parser source code to an intermediate file
        const outputFilePath: string = path.join(__dirname, 'classDiagramParser.js');
        console.log('Writing parser source code to:', outputFilePath);
        fs.writeFileSync(outputFilePath, parserSource);

        console.log('Intermediate file generated at:', outputFilePath);
    } catch (error) {
        console.error('Error processing the Jison file:', (error as Error).message);
    }
}