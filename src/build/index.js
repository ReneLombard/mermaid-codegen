#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const commandHandler_1 = require("./commandHandler");
const initializeService_1 = require("./initializeService");
const transformManager_1 = require("./transformManager");
const codeGenerator_1 = require("./codeGenerator");
const listLanguagesService_1 = require("./listLanguagesService");
const chokidar = __importStar(require("chokidar"));
const path = __importStar(require("path"));
// Import package.json (you'll need to create this for the TypeScript project)
const pkg = require('./package.json');
const program = new commander_1.Command();
const commandHandler = new commandHandler_1.CommandHandler(new initializeService_1.InitializeService(), new transformManager_1.TransformManager(), new codeGenerator_1.CodeGenerator(), new listLanguagesService_1.ListLanguagesService());
program
    .name(pkg.name)
    .version(pkg.version);
program
    .command('initialize')
    .description('Initializes a new project.')
    .requiredOption('-l, --language <language>', 'The programming language to initialize.')
    .requiredOption('-d, --directory <directory>', 'The root directory of the source repository.')
    .action((opts) => {
    commandHandler.handleInitializeCommand(opts);
});
program
    .command('list-languages')
    .description('Lists available languages.')
    .action(() => {
    commandHandler.handleListLanguagesCommand();
});
program
    .command('transform')
    .description('Transforms the mermaid to yml templates.')
    .requiredOption('-i, --input <input>', 'Input file path.')
    .requiredOption('-o, --output <output>', 'Output directory path.')
    .option('-n, --skipnamespace <namespace>', 'Part of the namespace to skip for the output directory.')
    .action((opts) => {
    commandHandler.handleTransformCommand(opts);
});
program
    .command('generate')
    .description('YML to output generator.')
    .requiredOption('-i, --input <input>', 'Input YML file path or directory.')
    .requiredOption('-o, --output <output>', 'Output Code directory path.')
    .requiredOption('-t, --templates <templates>', 'The directory that contains a list of hbs files.')
    .action((opts) => {
    commandHandler.handleGenerateCommand(opts);
});
function attemptTask(fn, retries = 3, delayMs = 1000) {
    return Promise.resolve(fn()).catch((err) => {
        if (retries <= 0)
            throw err;
        console.warn('Operation failed, retrying...', err.message);
        return new Promise((resolve) => {
            setTimeout(() => resolve(attemptTask(fn, retries - 1, delayMs)), delayMs);
        });
    });
}
program
    .command('watch')
    .description('Watches for changes in Mermaid or YML files, then regenerates automatically.')
    .requiredOption('-m, --mermaidInput <mermaidInput>', 'Path to Mermaid file/folder.')
    .requiredOption('-y, --ymlInput <ymlInput>', 'Path to YML file/folder.')
    .requiredOption('-o, --generateOutput <generateOutput>', 'Output directory for generate command.')
    .option('-n, --skipnamespace <namespace>', 'Part of the namespace to skip for the output directory.')
    .requiredOption('--templates <templates>', 'Directory that contains your hbs templates.')
    .action((opts) => {
    // Watch Mermaid changes
    const mermaidInputPath = path.isAbsolute(opts.mermaidInput)
        ? opts.mermaidInput
        : path.resolve(opts.mermaidInput);
    const mermaidWatcher = chokidar.watch(mermaidInputPath, {
        ignored: (watchPath, stats) => !!(stats?.isFile() && !watchPath.endsWith('.md')),
        persistent: true,
    });
    mermaidWatcher.on('change', (filePath) => {
        console.log(`Detected change in Mermaid file: ${filePath}`);
        attemptTask(() => commandHandler.handleTransformCommand({
            input: opts.mermaidInput,
            output: opts.ymlInput,
            skipnamespace: opts.skipnamespace,
        }))
            .then(() => attemptTask(() => commandHandler.handleGenerateCommand({
            input: opts.ymlInput,
            output: opts.generateOutput,
            templates: opts.templates,
        })))
            .catch((err) => {
            console.error('Error during transform/generate process:', err.message);
        });
    });
    // Watch YML changes
    const ymlPath = path.isAbsolute(opts.ymlInput)
        ? opts.ymlInput
        : path.resolve(opts.ymlInput);
    console.log(`Watching YML files in: ${ymlPath}`);
    const ymlWatcher = chokidar.watch(`${ymlPath}/`, {
        ignored: (watchPath, stats) => !!(stats?.isFile() && !watchPath.endsWith('.yml')),
        persistent: true,
    });
    ymlWatcher
        .on('ready', () => console.log('Initial scan complete. Ready for changes'))
        .on('add', (filePath) => {
        //console.log(`File added: ${filePath}`);
        attemptTask(() => commandHandler.handleGenerateCommand({
            input: opts.ymlInput,
            output: opts.generateOutput,
            templates: opts.templates,
        }))
            .catch((err) => {
            console.error('Error during generate process:', err.message);
        });
    })
        .on('change', (filePath) => {
        console.log(`Detected change in YML file: ${filePath}`);
        attemptTask(() => commandHandler.handleGenerateCommand({
            input: opts.ymlInput,
            output: opts.generateOutput,
            templates: opts.templates,
        }))
            .catch((err) => {
            console.error('Error during generate process:', err.message);
        });
    })
        .on('error', (error) => console.error(`Watcher error: ${error instanceof Error ? error.message : error}`));
});
program.parse(process.argv);
