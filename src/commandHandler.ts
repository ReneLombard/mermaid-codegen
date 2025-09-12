import { CodeGenerator } from './codeGenerator';
import { InitializeService } from './initializeService';
import { ListLanguagesService } from './listLanguagesService';
import { TransformManager } from './transformManager';
import { TransformOptions } from './types/transformOptions';

/** Options for project initialization */
interface InitializeOptions {
    language: string;
    directory: string;
}

/** Options for code generation */
interface GenerateOptions {
    input: string;
    output: string;
    templates: string;
}

/**
 * Coordinates CLI commands between different services
 */
export class CommandHandler {
    private initializeService: InitializeService;
    private transformManager: TransformManager;
    private codeGenerator: CodeGenerator;
    private listLanguagesService: ListLanguagesService;

    constructor(
        initializeService: InitializeService,
        transformManager: TransformManager,
        codeGenerator: CodeGenerator,
        listLanguagesService: ListLanguagesService,
    ) {
        this.initializeService = initializeService;
        this.transformManager = transformManager;
        this.codeGenerator = codeGenerator;
        this.listLanguagesService = listLanguagesService;
    }

    /** Handles project initialization command */
    handleInitializeCommand(opts: InitializeOptions): number {
        return this.initializeService.runInitializeAndReturnExitCode(opts);
    }

    /** Handles list languages command */
    handleListLanguagesCommand(): number {
        return this.listLanguagesService.runListLanguages();
    }

    /** Handles Mermaid to YAML transformation command */
    handleTransformCommand(opts: TransformOptions): number {
        this.transformManager.run(opts);
        return 0;
    }

    /** Handles YAML to code generation command */
    handleGenerateCommand(opts: GenerateOptions): number {
        this.codeGenerator.generate(opts);
        return 0;
    }
}
