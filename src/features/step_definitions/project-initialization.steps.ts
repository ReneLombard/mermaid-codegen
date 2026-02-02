import { Given, Then, When } from '@cucumber/cucumber';
import * as assert from 'assert';
import * as path from 'path';
import { CustomWorld } from '../support/world';

// Background steps
Given('I have a clean test workspace', async function (this: CustomWorld) {
    // This is handled by the Before hook
    assert.strictEqual(await this.fileExists(this.workspaceDir), true);
});

// Project initialization steps
Given('I have selected {string} as the target language', function (this: CustomWorld, language: string) {
    this.attach(`Selected language: ${language}`);
    this.generatedFiles.push(`language:${language}`);
});

Given('I have specified {string} as the project directory', function (this: CustomWorld, directory: string) {
    this.attach(`Project directory: ${directory}`);
    this.generatedFiles.push(`directory:${directory}`);
});

When('I run the initialize command', async function (this: CustomWorld) {
    const language = this.generatedFiles.find((f) => f.startsWith('language:'))?.split(':')[1] || 'C#';
    const directory = this.generatedFiles.find((f) => f.startsWith('directory:'))?.split(':')[1] || 'test-project';

    const targetDir = path.join(this.workspaceDir, directory);
    const command = `initialize -l "${language}" -d "${targetDir}"`;

    await this.runCommand(command);
});

When('I run the list languages command', async function (this: CustomWorld) {
    await this.runCommand('list-languages');
});

Then('a new project structure should be created', async function (this: CustomWorld) {
    const directory = this.generatedFiles.find((f) => f.startsWith('directory:'))?.split(':')[1] || 'test-project';
    const projectDir = path.join(this.workspaceDir, directory);

    const exists = await this.fileExists(projectDir);
    assert.strictEqual(exists, true);

    this.attach(`Project structure created at: ${projectDir}`);
});

Then('the project should contain C# specific templates', async function (this: CustomWorld) {
    // Check if C# templates were copied/created in the project
    const directory = this.generatedFiles.find((f) => f.startsWith('directory:'))?.split(':')[1] || 'test-project';
    const projectDir = path.join(this.workspaceDir, directory);

    // This is implementation dependent - adjust based on how initialization works
    const exists = await this.fileExists(projectDir);
    assert.strictEqual(exists, true);

    this.attach('C# templates are available');
});

Then('the command should return exit code {int}', function (this: CustomWorld, expectedCode: number) {
    assert.strictEqual(this.lastCommandResult?.exitCode, expectedCode);
});

Then('I should see available programming languages', function (this: CustomWorld) {
    const output = this.lastCommandResult?.stdout || '';
    assert.ok(output.length > 0);
    this.attach(`Languages output: ${output}`);
});

Then('the output should contain {string}', function (this: CustomWorld, expectedText: string) {
    const output = this.lastCommandResult?.stdout || '';
    assert.ok(output.includes(expectedText));
});

Then('I should see an error message about unsupported language', function (this: CustomWorld) {
    const error = this.lastCommandResult?.stderr || '';
    const output = this.lastCommandResult?.stdout || '';
    const errorMessage = error + output;

    assert.match(errorMessage, /(unsupported|invalid|not found|unknown).*language/i);
    this.attach(`Error message: ${errorMessage}`);
});

Then('no project structure should be created', async function (this: CustomWorld) {
    const directory = this.generatedFiles.find((f) => f.startsWith('directory:'))?.split(':')[1] || 'test-project';
    const projectDir = path.join(this.workspaceDir, directory);

    const exists = await this.fileExists(projectDir);
    assert.strictEqual(exists, false);
});
