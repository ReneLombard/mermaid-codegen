import { InitializeService } from './initializeService';
import { TransformManager } from './transformManager';
import { CodeGenerator } from './codeGenerator';
import { ListLanguagesService } from './listLanguagesService';
import { TransformOptions } from './types/transformOptions';

interface InitializeOptions {
    language: string;
    directory: string;
}

interface GenerateOptions {
    input: string;
    output: string;
    templates: string;
}

export class CommandHandler {
    private initializeService: InitializeService;
    private transformManager: TransformManager;
    private codeGenerator: CodeGenerator;
    private listLanguagesService: ListLanguagesService;

    constructor(
        initializeService: InitializeService,
        transformManager: TransformManager,
        codeGenerator: CodeGenerator,
        listLanguagesService: ListLanguagesService
    ) {
        this.initializeService = initializeService;
        this.transformManager = transformManager;
        this.codeGenerator = codeGenerator;
        this.listLanguagesService = listLanguagesService;
    }

    handleInitializeCommand(opts: InitializeOptions): number {
        return this.initializeService.runInitializeAndReturnExitCode(opts);
    }

    handleListLanguagesCommand(): number {
        return this.listLanguagesService.runListLanguages();
    }

    handleTransformCommand(opts: TransformOptions): number {
        this.transformManager.run(opts);
        return 0;
    }

    handleGenerateCommand(opts: GenerateOptions): number {
        this.codeGenerator.generate(opts);
        return 0;
    }
}