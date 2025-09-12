import { MermaidTransformer } from './processMermaid';
import { TransformOptions } from './types/transformOptions';

/**
 * Manages the transformation process from Mermaid to YAML
 */
export class TransformManager {
    /** Orchestrates the transformation process */
    run(opts: TransformOptions): void {
        if (opts.output) {
            const transformer = new MermaidTransformer(opts.input, opts.output, opts.skipnamespace);
            transformer.transform();
        }
    }
}
