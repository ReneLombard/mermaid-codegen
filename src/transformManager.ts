import { MermaidTransformer } from './processMermaid';
import { TransformOptions } from './types/transformOptions';

export class TransformManager {
    run(opts: TransformOptions): void {
        if (opts.output) {
            const transformer = new MermaidTransformer(opts.input, opts.output, opts.skipnamespace);
            transformer.transform();
        }
    }
}
