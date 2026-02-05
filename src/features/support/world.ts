import { setWorldConstructor, World } from '@cucumber/cucumber';
import { ChildProcess, spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export interface CommandResult {
    exitCode: number;
    stdout: string;
    stderr: string;
}

export class CustomWorld extends World {
    public workspaceDir!: string;
    public generatedFiles: string[] = [];
    public currentFile?: string; // Track the current file for content verification
    public lastCommandResult?: CommandResult;
    public watchProcess?: ChildProcess;
    public testData: any = {}; // For storing test-specific data

    constructor(options: any) {
        super(options);

        // Create a unique test workspace for each scenario
        const timestamp = Date.now();
        this.workspaceDir = path.join(os.tmpdir(), `mermaid-codegen-test-${timestamp}`);
    }

    async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async runCommand(command: string): Promise<CommandResult> {
        return new Promise((resolve, reject) => {
            const args = command.split(' ');
            const cmd = args[0] === 'mermaid-codegen' ? 'node' : args[0];
            // Point to the actual built mermaid-codegen in the source directory
            // From dist/features/support, go back to source root and then to dist/index.js
            const srcDir = path.resolve(__dirname, '..', '..', '..');
            const cmdArgs =
                args[0] === 'mermaid-codegen'
                    ? [path.join(srcDir, 'dist', 'index.js'), ...args.slice(1)]
                    : args.slice(1);

            const proc = spawn(cmd, cmdArgs, {
                cwd: this.workspaceDir,
                stdio: ['pipe', 'pipe', 'pipe'],
            });

            let stdout = '';
            let stderr = '';

            proc.stdout?.on('data', (data) => {
                stdout += data.toString();
            });

            proc.stderr?.on('data', (data) => {
                stderr += data.toString();
            });

            proc.on('close', (code) => {
                const result: CommandResult = {
                    exitCode: code ?? -1,
                    stdout,
                    stderr,
                };

                this.lastCommandResult = result;
                this.attach(
                    `Command: ${command}\\nExit Code: ${result.exitCode}\\nStdout: ${result.stdout}\\nStderr: ${result.stderr}`,
                );
                resolve(result);
            });

            proc.on('error', (error) => {
                reject(error);
            });
        });
    }

    async findFilesInWorkspace(extension: string): Promise<string[]> {
        const files: string[] = [];

        const scanDir = async (dir: string): Promise<void> => {
            try {
                const entries = await fs.promises.readdir(dir, { withFileTypes: true });

                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory() && !entry.name.startsWith('.')) {
                        await scanDir(fullPath);
                    } else if (entry.isFile() && entry.name.endsWith(extension)) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                // Directory might not exist or be accessible
            }
        };

        await scanDir(this.workspaceDir);
        return files;
    }

    async setupWorkspace(): Promise<void> {
        await fs.promises.mkdir(this.workspaceDir, { recursive: true });
        await fs.promises.mkdir(path.join(this.workspaceDir, 'output'), { recursive: true });
        await fs.promises.mkdir(path.join(this.workspaceDir, 'Templates'), { recursive: true });

        this.attach(`Workspace setup: ${this.workspaceDir}`);
    }

    async cleanupWorkspace(): Promise<void> {
        try {
            // Kill any watch process
            if (this.watchProcess && !this.watchProcess.killed) {
                this.watchProcess.kill();
            }

            // Remove workspace
            await fs.promises.rm(this.workspaceDir, { recursive: true, force: true });
            this.attach(`Workspace cleaned up: ${this.workspaceDir}`);
        } catch (error) {
            this.attach(`Cleanup error: ${error}`);
        }
    }
}

setWorldConstructor(CustomWorld);
