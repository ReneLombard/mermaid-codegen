import { setWorldConstructor, World } from '@cucumber/cucumber';
import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

export interface TestContext {
    workspaceDir: string;
    inputDir: string;
    outputDir: string;
    templatesDir: string;
    lastCommandResult?: {
        stdout?: string;
        stderr?: string;
        exitCode: number;
    };
    generatedFiles: string[];
}

export class CustomWorld extends World implements TestContext {
    public workspaceDir: string;
    public inputDir: string;
    public outputDir: string;
    public templatesDir: string;
    public lastCommandResult?: {
        stdout?: string;
        stderr?: string;
        exitCode: number;
    };
    public generatedFiles: string[] = [];

    constructor(options: any) {
        super(options);

        // Create a unique test workspace for each scenario
        const timestamp = Date.now();
        this.workspaceDir = path.join(os.tmpdir(), `mermaid-codegen-test-${timestamp}`);
        this.inputDir = path.join(this.workspaceDir, 'input');
        this.outputDir = path.join(this.workspaceDir, 'output');
        this.templatesDir = path.join(this.workspaceDir, 'templates');
    }

    async setupWorkspace(): Promise<void> {
        // Create test directories
        await fs.ensureDir(this.workspaceDir);
        await fs.ensureDir(this.inputDir);
        await fs.ensureDir(this.outputDir);
        await fs.ensureDir(this.templatesDir);

        // Copy templates from the main project
        // When running from dist, we need to go up 4 levels: dist/features/support -> src -> project root
        const projectRoot = path.resolve(__dirname, '../../../../..');
        const mainTemplatesDir = path.join(projectRoot, 'Templates');

        if (await fs.pathExists(mainTemplatesDir)) {
            await fs.copy(mainTemplatesDir, this.templatesDir);
        } else {
            // Fallback: try alternative paths
            const altProjectRoot = path.resolve(__dirname, '../../../..');
            const altTemplatesDir = path.join(altProjectRoot, 'Templates');

            if (await fs.pathExists(altTemplatesDir)) {
                await fs.copy(altTemplatesDir, this.templatesDir);
            }
        }
    }

    async cleanupWorkspace(): Promise<void> {
        if (await fs.pathExists(this.workspaceDir)) {
            await fs.remove(this.workspaceDir);
        }
    }

    async createMermaidFile(filename: string, content: string): Promise<string> {
        const filePath = path.join(this.inputDir, filename);
        await fs.writeFile(filePath, content, 'utf8');
        return filePath;
    }

    async createYamlFile(filename: string, content: string): Promise<string> {
        const filePath = path.join(this.inputDir, filename);
        await fs.writeFile(filePath, content, 'utf8');
        return filePath;
    }

    async runCommand(command: string, cwd?: string): Promise<void> {
        const workingDir = cwd || this.workspaceDir;
        // Since we're in dist/features/support, go up to dist level for index.js
        const cliPath = path.resolve(__dirname, '../../index.js');

        try {
            const fullCommand = `node "${cliPath}" ${command}`;
            const result = execSync(fullCommand, {
                cwd: workingDir,
                encoding: 'utf8',
                timeout: 30000,
            });

            this.lastCommandResult = {
                stdout: result,
                exitCode: 0,
            };
        } catch (error: any) {
            this.lastCommandResult = {
                stdout: error.stdout || '',
                stderr: error.stderr || error.message,
                exitCode: error.status || 1,
            };
        }
    }

    async fileExists(filePath: string): Promise<boolean> {
        const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.workspaceDir, filePath);
        return await fs.pathExists(fullPath);
    }

    async readFile(filePath: string): Promise<string> {
        const fullPath = path.isAbsolute(filePath) ? filePath : path.join(this.workspaceDir, filePath);
        return await fs.readFile(fullPath, 'utf8');
    }

    async getGeneratedFiles(directory?: string): Promise<string[]> {
        const searchDir = directory || this.outputDir;
        const files: string[] = [];

        const addFilesRecursively = async (dir: string) => {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    await addFilesRecursively(fullPath);
                } else {
                    files.push(fullPath);
                }
            }
        };

        if (await fs.pathExists(searchDir)) {
            await addFilesRecursively(searchDir);
        }

        return files;
    }
}

setWorldConstructor(CustomWorld);
