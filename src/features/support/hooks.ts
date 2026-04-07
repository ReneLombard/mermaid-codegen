import { After, Before, setDefaultTimeout } from '@cucumber/cucumber';
import { CustomWorld } from './world';

// Set longer timeout for integration tests
setDefaultTimeout(60000);

Before(async function (this: CustomWorld) {
    await this.setupWorkspace();
});

After(async function (this: CustomWorld) {
    await this.cleanupWorkspace();
});
