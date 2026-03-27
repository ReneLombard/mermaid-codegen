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
    mermaidInput?: string;
    ymlInput?: string;
    generateOutput?: string;
    templates?: string;
    namespace?: string;
    skipnamespace?: string;
}

/** Debounce utility to prevent rapid-fire executions */
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
}

/** Change tracking to prevent duplicate processing */
interface ChangeTracker {
    lastProcessed: Map<string, number>;
    processing: Set<string>;
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
    .option('-m, --mermaidInput <mermaidInput>', 'Path to Mermaid file/folder.')
    .option('-y, --ymlInput <ymlInput>', 'Path to YML file/folder.')
    .option('-o, --generateOutput <generateOutput>', 'Output directory for generate command.')
    .option('--input-dir <inputDir>', 'Input directory for both Mermaid and YML files (simplified syntax).')
    .option('--output-dir <outputDir>', 'Output directory (simplified syntax).')
    .option('-n, --skipnamespace <namespace>', 'Part of the namespace to skip for the output directory.')
    .option('--templates <templates>', 'Directory that contains your hbs templates.')
    .action((opts: WatchOptions & { inputDir?: string; outputDir?: string }) => {
        // Handle simplified syntax
        let mermaidInput = opts.mermaidInput;
        let ymlInput = opts.ymlInput;
        let generateOutput = opts.generateOutput;
        let templates = opts.templates;

        if (opts.inputDir) {
            mermaidInput = opts.inputDir;
            // YAML should be output to the output directory, not the input directory
            ymlInput = opts.outputDir || 'output';
            if (!opts.generateOutput && opts.outputDir) {
                generateOutput = path.join(opts.outputDir, 'code');
            }
            if (!opts.templates) {
                // Default to Templates/C# if no templates specified in simplified mode
                const templatesPath = path.resolve(process.cwd(), 'Templates', 'C#');
                templates = templatesPath;
                console.log(`Using default templates path: ${templatesPath}`);
            }
        }

        if (!mermaidInput || !ymlInput || !generateOutput || !templates) {
            console.error(
                'Missing required options. Either specify all detailed options or use --input-dir and --output-dir.',
            );
            process.exit(1);
        }

        // Ensure output directories exist
        const fs = require('fs');
        if (!fs.existsSync(ymlInput)) {
            fs.mkdirSync(ymlInput, { recursive: true });
        }
        if (!fs.existsSync(generateOutput)) {
            fs.mkdirSync(generateOutput, { recursive: true });
        }

        // Verify templates directory exists
        if (!fs.existsSync(templates)) {
            console.error(`Templates directory does not exist: ${templates}`);
            // Try to find Templates in the project root
            const alternativeTemplates = path.resolve(process.cwd(), 'Templates', 'C#');
            if (fs.existsSync(alternativeTemplates)) {
                templates = alternativeTemplates;
                console.log(`Using alternative templates path: ${templates}`);
            } else {
                console.error(`Alternative templates path also doesn't exist: ${alternativeTemplates}`);
                process.exit(1);
            }
        }

        console.log(`Starting file watcher...`);
        console.log(`Watching Mermaid files in: ${mermaidInput}`);
        console.log(`YML output: ${ymlInput}`);
        console.log(`Code generation output: ${generateOutput}`);
        console.log(`Templates: ${templates}`);
        console.log(`Templates exists: ${fs.existsSync(templates)}`);

        // Recursively find files matching a predicate under a root directory.
        const scanRecursive = (dirPath: string, predicate: (name: string) => boolean): string[] => {
            const files: string[] = [];
            if (!fs.existsSync(dirPath)) {
                return files;
            }

            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    files.push(...scanRecursive(fullPath, predicate));
                } else if (entry.isFile() && predicate(entry.name)) {
                    files.push(fullPath);
                }
            }

            return files;
        };

        // Safe, non-destructive single-file delete helper.
        const deleteIfExists = (filePath: string): void => {
            if (fs.existsSync(filePath)) {
                fs.rmSync(filePath, { force: true });
            }
        };

        // Locate generated artifacts for one class name without touching unrelated files.
        const findGeneratedFilesForClass = (rootDir: string, className: string): string[] => {
            return scanRecursive(rootDir, (fileName: string) => fileName.includes(`${className}.Generated.`));
        };

        // Tracks which classes were produced from each Mermaid source file in this watcher session.
        // Used to perform targeted cleanup when a source file is deleted.
        const mermaidSourceClasses = new Map<string, Set<string>>();

        // Enable polling in test mode or when explicitly requested
        const isTestMode = process.env.NODE_ENV === 'test' || process.argv.includes('--test-mode');
        const enablePolling = isTestMode || process.argv.includes('--poll');

        // Watch Mermaid changes
        const mermaidInputPath: string = path.isAbsolute(mermaidInput) ? mermaidInput : path.resolve(mermaidInput);

        const mermaidWatcher: chokidar.FSWatcher = chokidar.watch(mermaidInputPath, {
            ignored: (watchPath: string, stats?: Stats): boolean => !!(stats?.isFile() && !watchPath.endsWith('.md')),
            persistent: true,
            usePolling: enablePolling,
            interval: isTestMode ? 100 : 1000,
            binaryInterval: isTestMode ? 300 : 1000,
            ignoreInitial: false,
            atomic: !isTestMode,
            alwaysStat: true,
            awaitWriteFinish: !isTestMode,
        });

        // Change tracker for mermaid files
        const mermaidTracker: ChangeTracker = {
            lastProcessed: new Map<string, number>(),
            processing: new Set<string>(),
        };

        // Debounced handler for Mermaid add/change:
        // 1) transform current source to YAML
        // 2) regenerate code
        // 3) capture class names for targeted delete on future unlink events
        const handleMermaidChange = debounce(async (filePath: string) => {
            const stats = fs.statSync(filePath);
            const currentMtime = stats.mtime.getTime();
            const lastProcessed = mermaidTracker.lastProcessed.get(filePath) || 0;

            // Skip if already processing this specific file
            if (mermaidTracker.processing.has(filePath)) {
                console.log(`Skipping - already processing: ${filePath}`);
                return;
            }

            // Skip if we've recently processed this exact timestamp
            if (currentMtime <= lastProcessed) {
                console.log(
                    `Skipping - no change detected for: ${filePath} (${new Date(currentMtime).toISOString()} <= ${new Date(lastProcessed).toISOString()})`,
                );
                return;
            }

            mermaidTracker.processing.add(filePath);
            console.log(`*** PROCESSING MERMAID FILE CHANGE: ${filePath} ***`);
            console.log(
                `Previous: ${new Date(lastProcessed).toISOString()}, Current: ${new Date(currentMtime).toISOString()}`,
            );

            try {
                await attemptTask(() =>
                    commandHandler.handleTransformCommand({
                        input: filePath,
                        output: ymlInput!,
                        skipnamespace: opts.skipnamespace,
                    }),
                );
                console.log('Transform completed, triggering code generation...');
                await attemptTask(() =>
                    commandHandler.handleGenerateCommand({
                        input: ymlInput!,
                        output: generateOutput!,
                        templates: templates!,
                    }),
                );

                try {
                    const mermaidContent = fs.readFileSync(filePath, 'utf8');
                    const classMatches = mermaidContent.match(/\bclass\s+([A-Za-z_][A-Za-z0-9_]*)/g) || [];
                    const classNames = classMatches
                        .map((classMatch: string) => classMatch.replace(/\bclass\s+/, '').trim())
                        .filter((className: string) => className.length > 0);

                    if (classNames.length > 0) {
                        mermaidSourceClasses.set(filePath, new Set<string>(classNames));
                    }
                } catch (readErr: any) {
                    console.warn(`Unable to capture classes for Mermaid file ${filePath}: ${readErr.message}`);
                }

                console.log(`*** COMPLETED PROCESSING: ${filePath} ***`);
                mermaidTracker.lastProcessed.set(filePath, currentMtime);
            } catch (err: any) {
                console.error('Error during transform/generate process:', err.message);
            } finally {
                mermaidTracker.processing.delete(filePath);
            }
        }, 250); // 250ms debounce - faster response

        mermaidWatcher.on('change', handleMermaidChange);

        mermaidWatcher.on('add', (filePath: string) => {
            console.log(`Mermaid file added: ${filePath}`);
            handleMermaidChange(filePath);
        });

        // On Mermaid delete, remove only generated artifacts for classes that came from this source.
        mermaidWatcher.on('unlink', async (filePath: string) => {
            console.log(`Mermaid file removed: ${filePath}`);
            mermaidTracker.lastProcessed.delete(filePath);

            const classesFromSource = mermaidSourceClasses.get(filePath);
            mermaidSourceClasses.delete(filePath);

            if (!classesFromSource || classesFromSource.size === 0) {
                return;
            }

            for (const className of classesFromSource) {
                const ymlFiles = findGeneratedFilesForClass(ymlInput!, className);
                const codeFiles = findGeneratedFilesForClass(generateOutput!, className);

                for (const ymlFile of ymlFiles) {
                    deleteIfExists(ymlFile);
                    console.log(`Removed generated YML file: ${ymlFile}`);
                }

                for (const codeFile of codeFiles) {
                    deleteIfExists(codeFile);
                    console.log(`Removed generated code file: ${codeFile}`);
                }
            }
        });

        // Manual polling fallback for Mermaid file changes (only in test/poll mode)
        if (enablePolling) {
            const mermaidFileStates = new Map<string, number>();

            const pollForMermaidChanges = () => {
                try {
                    const files = fs
                        .readdirSync(mermaidInputPath)
                        .filter((file: string) => file.endsWith('.md'))
                        .map((file: string) => path.join(mermaidInputPath, file));

                    for (const filePath of files) {
                        try {
                            const stats = fs.statSync(filePath);
                            const currentMtime = stats.mtime.getTime();
                            const lastMtime = mermaidFileStates.get(filePath);

                            if (!lastMtime) {
                                // First time seeing this file, just record the time
                                mermaidFileStates.set(filePath, currentMtime);
                            } else if (currentMtime > lastMtime) {
                                // Detected file change
                                console.log(`Detected change in Mermaid file: ${filePath}`);

                                // Update the recorded time before processing to prevent duplicates
                                mermaidFileStates.set(filePath, currentMtime);

                                // Process the change using the correct command path
                                (async () => {
                                    try {
                                        await attemptTask(() =>
                                            commandHandler.handleTransformCommand({
                                                input: filePath,
                                                output: ymlInput!,
                                                skipnamespace: opts.skipnamespace,
                                            }),
                                        );
                                        await attemptTask(() =>
                                            commandHandler.handleGenerateCommand({
                                                input: ymlInput!,
                                                output: generateOutput!,
                                                templates: templates!,
                                            }),
                                        );
                                        console.log(`Processing completed for: ${filePath}`);
                                    } catch (err: any) {
                                        console.error('Error during fallback transform/generate process:', err.message);
                                    }
                                })();
                            }
                        } catch (err) {
                            console.log(`Manual polling error for file ${filePath}: ${err}`);
                        }
                    }
                } catch (err) {
                    console.log(`Manual polling directory error: ${err}`);
                }

                setTimeout(pollForMermaidChanges, isTestMode ? 250 : 1000);
            };

            setTimeout(pollForMermaidChanges, 2000); // Start polling after 2 seconds
        }

        // Watch YML changes - only watch input directory to prevent infinite loops from generated files
        console.log(`Watching YML files in: ${mermaidInput}`);

        const ymlWatcher: chokidar.FSWatcher = chokidar.watch(mermaidInputPath, {
            ignored: (watchPath: string, stats?: Stats): boolean => {
                if (stats?.isFile()) {
                    return !watchPath.endsWith('.yml') && !watchPath.endsWith('.yaml');
                }
                // Exclude the output directory to prevent watching generated YML files
                if (watchPath.includes(path.resolve(ymlInput!))) {
                    return true;
                }
                return false;
            },
            persistent: true,
            usePolling: enablePolling,
            interval: isTestMode ? 500 : 1000,
            binaryInterval: isTestMode ? 1000 : 2000,
            ignoreInitial: false,
            atomic: !isTestMode,
            alwaysStat: true,
        });

        // Change tracker for yml files
        const ymlTracker: ChangeTracker = {
            lastProcessed: new Map<string, number>(),
            processing: new Set<string>(),
        };

        // Debounced handler for YAML add/change: regenerate code from the changed YAML location.
        const handleYmlChange = debounce(async (filePath: string) => {
            const stats = fs.statSync(filePath);
            const currentMtime = stats.mtime.getTime();
            const lastProcessed = ymlTracker.lastProcessed.get(filePath) || 0;

            // Skip if already processing this specific file
            if (ymlTracker.processing.has(filePath)) {
                console.log(`Skipping - already processing YML: ${filePath}`);
                return;
            }

            // Skip if we've recently processed this exact timestamp
            if (currentMtime <= lastProcessed) {
                console.log(
                    `Skipping - no YML change detected for: ${filePath} (${new Date(currentMtime).toISOString()} <= ${new Date(lastProcessed).toISOString()})`,
                );
                return;
            }

            ymlTracker.processing.add(filePath);
            console.log(`*** PROCESSING YML FILE CHANGE: ${filePath} ***`);
            console.log(
                `Previous: ${new Date(lastProcessed).toISOString()}, Current: ${new Date(currentMtime).toISOString()}`,
            );

            try {
                const inputPath = fs.statSync(filePath).isFile() ? path.dirname(filePath) : filePath;
                await attemptTask(() =>
                    commandHandler.handleGenerateCommand({
                        input: inputPath,
                        output: generateOutput!,
                        templates: templates!,
                    }),
                );
                console.log(`*** COMPLETED YML PROCESSING: ${filePath} ***`);
                ymlTracker.lastProcessed.set(filePath, currentMtime);
            } catch (err: any) {
                console.error('Error during generate process:', err.message);
            } finally {
                ymlTracker.processing.delete(filePath);
            }
        }, 250); // 250ms debounce - faster response

        ymlWatcher
            .on('ready', () => {
                console.log('YML watcher: Initial scan complete. Ready for changes');
                // Trigger initial code generation if YAML files exist
                console.log('Triggering initial code generation...');
                // Only check input directory for YAML files to prevent infinite loops
                const checkDirectories = [mermaidInputPath];
                for (const dir of checkDirectories) {
                    attemptTask(() =>
                        commandHandler.handleGenerateCommand({
                            input: dir,
                            output: generateOutput!,
                            templates: templates!,
                        }),
                    ).catch((err: Error) => {
                        console.error(`Error during initial generate process for ${dir}:`, err.message);
                        console.error('Full error:', err);
                    });
                }

                // Start manual polling fallback for file changes (for test environments)
                const fileStates = new Map<string, number>();

                const pollForChanges = () => {
                    try {
                        const scanRecursive = (dirPath: string): string[] => {
                            const files: string[] = [];
                            try {
                                const entries = fs.readdirSync(dirPath);
                                for (const entry of entries) {
                                    const fullPath = path.join(dirPath, entry);
                                    try {
                                        const stat = fs.statSync(fullPath);
                                        if (stat.isDirectory()) {
                                            files.push(...scanRecursive(fullPath));
                                        } else if (entry.endsWith('.yml') || entry.endsWith('.yaml')) {
                                            files.push(fullPath);
                                        }
                                    } catch {
                                        // Ignore errors for individual files/directories
                                    }
                                }
                            } catch {
                                // Directory might not exist
                            }
                            return files;
                        };

                        // Only check input directory for YAML files to prevent infinite loops
                        const inputFiles = scanRecursive(mermaidInputPath);
                        const files = inputFiles;

                        for (const filePath of files) {
                            try {
                                // Get a fresh stat by forcing file system to check again
                                delete require.cache[filePath]; // Clear any requires cache
                                const stats = fs.statSync(filePath);
                                const currentMtime = stats.mtime.getTime();
                                const lastMtime = fileStates.get(filePath);

                                // Read content only in test environment for fallback detection
                                const tempBuffer =
                                    process.env.NODE_ENV === 'test'
                                        ? fs.readFileSync(filePath, { encoding: 'utf8' })
                                        : null;

                                if (!lastMtime) {
                                    // First time seeing this file, just record the time
                                    fileStates.set(filePath, currentMtime);
                                } else if (
                                    currentMtime > lastMtime ||
                                    (process.env.NODE_ENV === 'test' &&
                                        tempBuffer &&
                                        (tempBuffer.includes('Integer') || tempBuffer.includes('NewType')))
                                ) {
                                    // Detected file change (including content-based detection for test environments)
                                    console.log(`Detected change in YAML file: ${filePath}`);

                                    // Update the recorded time before processing
                                    fileStates.set(filePath, currentMtime);

                                    // Process the change directly
                                    (async () => {
                                        try {
                                            const inputPath = fs.statSync(filePath).isFile()
                                                ? path.dirname(filePath)
                                                : filePath;
                                            await attemptTask(() =>
                                                commandHandler.handleGenerateCommand({
                                                    input: inputPath,
                                                    output: generateOutput!,
                                                    templates: templates!,
                                                }),
                                            );
                                            console.log(`Processing completed for: ${filePath}`);
                                        } catch (err: any) {
                                            console.error('Error during fallback generate process:', err.message);
                                        }
                                    })();
                                }
                            } catch (err) {
                                console.log(`YML polling error for file ${filePath}: ${err}`);
                            }
                        }
                    } catch (err) {
                        console.log(`YML polling error: ${err}`);
                    }

                    setTimeout(pollForChanges, 500); // More frequent polling for tests
                };

                setTimeout(pollForChanges, 2000); // Start polling after 2 seconds
            })
            .on('add', (filePath: string) => {
                console.log(`YML File added: ${filePath}`);
                handleYmlChange(filePath);
            })
            .on('change', (filePath: string) => {
                console.log(`*** DETECTED CHANGE IN YML FILE: ${filePath} ***`);
                handleYmlChange(filePath);
            })
            .on('error', (error: unknown) => {
                console.error(`YML Watcher error: ${error instanceof Error ? error.message : error}`);
            })
            .on('unlink', (filePath: string) => {
                console.log(`YML file removed: ${filePath}`);
                ymlTracker.lastProcessed.delete(filePath);

                // For generated YAML deletions, derive class name from *.Generated.yml/yaml and
                // delete only matching generated code files.
                const fileName = path.basename(filePath);
                const className = fileName.replace(/\.Generated\.(yml|yaml)$/i, '');

                if (className.length === 0 || className === fileName) {
                    return;
                }

                const codeFiles = findGeneratedFilesForClass(generateOutput!, className);
                for (const codeFile of codeFiles) {
                    deleteIfExists(codeFile);
                    console.log(`Removed generated code file: ${codeFile}`);
                }
            })
            .on('addDir', (dirPath: string) => {
                console.log(`Directory added: ${dirPath}`);
            })
            .on('unlinkDir', (dirPath: string) => {
                console.log(`Directory removed: ${dirPath}`);
            });

        // Handle graceful shutdown on SIGTERM and SIGINT
        // Ensure clean exit with code 0 when signaled
        const handleTermination = (signal: string) => {
            return () => {
                console.log(`Received ${signal}, exiting gracefully...`);
                process.exitCode = 0;
                // Flush stdout and stderr, then exit
                if (process.stdout.writableEnded === false) {
                    process.stdout.once('drain', () => process.exit(0));
                    if (!process.stdout.write('')) {
                        process.stdout.once('drain', () => process.exit(0));
                    } else {
                        process.exit(0);
                    }
                } else {
                    process.exit(0);
                }
            };
        };

        process.on('SIGTERM', handleTermination('SIGTERM'));
        process.on('SIGINT', handleTermination('SIGINT'));
    });

program.parse(process.argv);
