#!/usr/bin/env node
const { Command } = require('commander');
const { CommandHandler } = require('./commandHandler');
const { InitializeService } = require('./initializeService');
const { TransformManager } = require('./transformManager');
const { CodeGenerator } = require('./codeGenerator');
const { ListLanguagesService } = require('./listLanguagesService');
const { FileReader } = require('./fileReader');
const { FileWriter } = require('./fileWriter');
const pkg = require('./package.json');
const program = new Command();
const chokidar = require('chokidar');
const path = require('path');

const fileReader = new FileReader();
const fileWriter = new FileWriter();
const commandHandler = new CommandHandler(
    new InitializeService(),
    new TransformManager(fileReader, fileWriter),
    new CodeGenerator(fileReader, fileWriter),
    new ListLanguagesService()
);
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
        if (retries <= 0) throw err;
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
        const mermaidInputPath = path.isAbsolute(opts.mermaidInput) ? opts.mermaidInput : path.resolve(opts.mermaidInput);
        const mermaidWatcher = chokidar.watch(mermaidInputPath, {
            ignored: (path, stats) => stats?.isFile() && !path.endsWith('.md'),
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
        const ymlPath = path.isAbsolute(opts.ymlInput) ? opts.ymlInput : path.resolve(opts.ymlInput);
        console.log(`Watching YML files in: ${ymlPath}`);

        const ymlWatcher = chokidar.watch(`${ymlPath}/`, {
            ignored: (path, stats) => stats?.isFile() && !path.endsWith('.yml'),
            persistent: true,
          });
        ymlWatcher
            .on('ready', () => console.log('Initial scan complete. Ready for changes'))
            .on('add', (filePath) => {
                console.log(`File added: ${filePath}`);
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
            .on('error', (error) => console.error(`Watcher error: ${error}`));
    });

program.parse(process.argv);
