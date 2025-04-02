const { MermaidTransformer } = require('./processMermaid');

class TransformManager {
    constructor(fileReader, fileWriter) {
        this.fileReader = fileReader;
        this.fileWriter = fileWriter;
    }

    run(opts) {
        
        if (opts.output) {
            const transformer = new MermaidTransformer(opts.input,opts.output);
            transformer.transform();
        }
    }
}

module.exports = { TransformManager };