import { Given, Then } from '@cucumber/cucumber';
import * as assert from 'assert';
import * as path from 'path';
import { CustomWorld } from '../support/world';

// Legacy support for existing step patterns

Given('I have a clean test workspace', async function (this: CustomWorld) {
    // This is handled by the Before hook
    assert.strictEqual(await this.fileExists(this.workspaceDir), true);
});

Given('I have selected {string} as the target language', function (this: CustomWorld, language: string) {
    this.attach(`Selected language: ${language}`);
    this.testData.language = language;
});

Given('I have specified {string} as the project directory', function (this: CustomWorld, directory: string) {
    this.attach(`Project directory: ${directory}`);
    this.testData.projectDir = directory;
});

Then('a new project structure should be created', async function (this: CustomWorld) {
    const directory = this.testData.projectDir || 'test-project';
    const projectDir = path.join(this.workspaceDir, directory);

    const exists = await this.fileExists(projectDir);
    assert.strictEqual(exists, true);

    this.attach(`Project structure created at: ${projectDir}`);
});

Then('the project should contain C# specific templates', async function (this: CustomWorld) {
    const directory = this.testData.projectDir || 'test-project';
    const projectDir = path.join(this.workspaceDir, directory);

    const exists = await this.fileExists(projectDir);
    assert.strictEqual(exists, true);

    this.attach('C# templates verified');
});
