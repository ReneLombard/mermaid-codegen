#!/usr/bin/env node
import { Command } from 'commander';
import { CodeGenerator } from './codeGenerator';
import { CommandHandler } from './commandHandler';
import { InitializeService } from './initializeService';
import { ListLanguagesService } from './listLanguagesService';
import { TransformManager } from './transformManager';

import * as chokidar from 'chokidar';
import { Stats } from 'fs';
import * as path from 'path';
import { TransformOptions } from './types/transformOptions';

// Import package.json for CLI metadata
const pkg = require(path.join(__dirname, '../package.json'));

/** Options for project initialization command */
interface InitializeOptions {
    language: string;
    directory: string;
}

/** Options for code generation command */
interface GenerateOptions {
    input: string;
    output: string;
    templates: string;
}

/** Options for file watching command */
interface WatchOptions {
    mermaidInput: string;
    ymlInput: string;
    generateOutput: string;
    skipnamespace?: string;
    templates: string;
}

const program = new Command();

const commandHandler = new CommandHandler(
    new InitializeService(),
    new TransformManager(),
    new CodeGenerator(),
    new ListLanguagesService(),
);

program.name(pkg.name).version(pkg.version);

program
    .command('initialize')
    .description('Initializes a new project.')
    .requiredOption('-l, --language <language>', 'The programming language to initialize.')
    .requiredOption('-d, --directory <directory>', 'The root directory of the source repository.')
    .action((opts: InitializeOptions) => {
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
    .action((opts: TransformOptions) => {
        commandHandler.handleTransformCommand(opts);
    });

program
    .command('generate')
    .description('YML to output generator.')
    .requiredOption('-i, --input <input>', 'Input YML file path or directory.')
    .requiredOption('-o, --output <output>', 'Output Code directory path.')
    .requiredOption('-t, --templates <templates>', 'The directory that contains a list of hbs files.')
    .action((opts: GenerateOptions) => {
        commandHandler.handleGenerateCommand(opts);
    });

function attemptTask(fn: () => Promise<any> | any, retries: number = 3, delayMs: number = 1000): Promise<any> {
    return Promise.resolve(fn()).catch((err: Error) => {
        if (retries <= 0) throw err;
        console.warn('Operation failed, retrying...', err.message);
        return new Promise<any>((resolve) => {
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
    .action((opts: WatchOptions) => {
        // Watch Mermaid changes
        const mermaidInputPath: string = path.isAbsolute(opts.mermaidInput)
            ? opts.mermaidInput
            : path.resolve(opts.mermaidInput);

        const mermaidWatcher: chokidar.FSWatcher = chokidar.watch(mermaidInputPath, {
            ignored: (watchPath: string, stats?: Stats): boolean => !!(stats?.isFile() && !watchPath.endsWith('.md')),
            persistent: true,
        });

        mermaidWatcher.on('change', (filePath: string) => {
            console.log(`Detected change in Mermaid file: ${filePath}`);
            attemptTask(() =>
                commandHandler.handleTransformCommand({
                    input: opts.mermaidInput,
                    output: opts.ymlInput,
                    skipnamespace: opts.skipnamespace,
                }),
            )
                .then(() =>
                    attemptTask(() =>
                        commandHandler.handleGenerateCommand({
                            input: opts.ymlInput,
                            output: opts.generateOutput,
                            templates: opts.templates,
                        }),
                    ),
                )
                .catch((err: Error) => {
                    console.error('Error during transform/generate process:', err.message);
                });
        });

        // Watch YML changes
        const ymlPath: string = path.isAbsolute(opts.ymlInput) ? opts.ymlInput : path.resolve(opts.ymlInput);
        console.log(`Watching YML files in: ${ymlPath}`);

        const ymlWatcher: chokidar.FSWatcher = chokidar.watch(`${ymlPath}/`, {
            ignored: (watchPath: string, stats?: Stats): boolean => !!(stats?.isFile() && !watchPath.endsWith('.yml')),
            persistent: true,
        });

        ymlWatcher
            .on('ready', () => console.log('Initial scan complete. Ready for changes'))
            .on('add', (filePath: string) => {
                //console.log(`File added: ${filePath}`);
                attemptTask(() =>
                    commandHandler.handleGenerateCommand({
                        input: opts.ymlInput,
                        output: opts.generateOutput,
                        templates: opts.templates,
                    }),
                ).catch((err: Error) => {
                    console.error('Error during generate process:', err.message);
                });
            })
            .on('change', (filePath: string) => {
                console.log(`Detected change in YML file: ${filePath}`);
                attemptTask(() =>
                    commandHandler.handleGenerateCommand({
                        input: opts.ymlInput,
                        output: opts.generateOutput,
                        templates: opts.templates,
                    }),
                ).catch((err: Error) => {
                    console.error('Error during generate process:', err.message);
                });
            })
            .on('error', (error: unknown) =>
                console.error(`Watcher error: ${error instanceof Error ? error.message : error}`),
            );
    });

program.parse(process.argv);
