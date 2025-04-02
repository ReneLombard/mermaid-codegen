class CommandHandler {
    constructor(initializeService, transformManager, codeGenerator, listLanguagesService) {
        this.initializeService = initializeService;
        this.transformManager = transformManager;
        this.codeGenerator = codeGenerator;
        this.listLanguagesService = listLanguagesService;
    }

    handleInitializeCommand(opts) {
        return this.initializeService.runInitializeAndReturnExitCode(opts);
    }

    handleListLanguagesCommand() {
        return this.listLanguagesService.runListLanguages();
    }

    handleTransformCommand(opts) {
        this.transformManager.run(opts);
        return 0;
    }

    handleGenerateCommand(opts) {
        this.codeGenerator.generate(opts);
        return 0;
    }
}

module.exports = { CommandHandler };