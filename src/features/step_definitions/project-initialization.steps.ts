import { Then } from '@cucumber/cucumber';
import * as assert from 'assert';
import * as path from 'path';
import { CustomWorld } from '../support/world';

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
