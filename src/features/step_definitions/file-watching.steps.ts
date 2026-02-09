import { Given, Then } from '@cucumber/cucumber';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { CustomWorld } from '../support/world';

// Hash calculation utility
function calculateFileHash(filePath: string): string {
    if (!fs.existsSync(filePath)) {
        return '';
    }
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

// Step to record the hash of a file before changes
Given('{word} records the hash of {string}', async function (this: CustomWorld, persona: string, filename: string) {
    const filePath = path.join(this.workspaceDir, filename);

    // Initialize hash storage if needed
    if (!this.testData.recordedHashes) {
        this.testData.recordedHashes = {};
    }

    // Wait for file to exist (it should exist by this point)
    let attempts = 0;
    const maxAttempts = 50; // Wait up to 5 seconds
    while (attempts < maxAttempts && !fs.existsSync(filePath)) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
    }

    if (!fs.existsSync(filePath)) {
        throw new Error(`Cannot record hash - file does not exist: ${filename}`);
    }

    const hash = calculateFileHash(filePath);
    this.testData.recordedHashes[filename] = hash;

    this.attach(`${persona} recorded hash for ${filename}: ${hash}`);
});

// Step to verify that the hash of a file has changed
Then(
    '{word} verifies the hash of {string} has changed',
    async function (this: CustomWorld, persona: string, filename: string) {
        const filePath = path.join(this.workspaceDir, filename);

        //Wait a second to ensure any file system operations have completed
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Check if we have a recorded hash
        if (!this.testData.recordedHashes || !this.testData.recordedHashes[filename]) {
            throw new Error(
                `No recorded hash found for ${filename}. Make sure to record the hash before making changes.`,
            );
        }

        if (!fs.existsSync(filePath)) {
            throw new Error(`Cannot verify hash - file does not exist: ${filename}`);
        }

        const originalHash = this.testData.recordedHashes[filename];
        const currentHash = calculateFileHash(filePath);

        this.attach(`${persona} comparing hashes for ${filename}:`);
        this.attach(`  Original hash: ${originalHash}`);
        this.attach(`  Current hash:  ${currentHash}`);

        if (originalHash === currentHash) {
            throw new Error(
                `File ${filename} hash has not changed. Expected content modification but file appears unchanged.`,
            );
        }

        this.attach(`${persona} verified that ${filename} content has changed (hash verification passed)`);
    },
);

// Step to wait for initial file processing to complete
Given('{word} waits for initial file processing to complete', async function (this: CustomWorld, persona: string) {
    // Wait for the watcher to process all initial files
    const startTime = Date.now();
    const maxWaitTime = 15000; // Wait up to 15 seconds

    this.attach(`${persona} waiting for initial file processing to complete...`);

    let lastProcessingCount = 0;
    let stableCount = 0;
    const requiredStableChecks = 5; // Need 5 consecutive checks with same count

    while (Date.now() - startTime < maxWaitTime) {
        const currentStdout = this.testData.watchStdout || '';

        // Count total processing messages
        const processingCount = (currentStdout.match(/\*\*\* (PROCESSING|COMPLETED)/g) || []).length;

        if (processingCount === lastProcessingCount) {
            stableCount++;
            if (stableCount >= requiredStableChecks) {
                // No new processing for several checks, assume initial processing is done
                break;
            }
        } else {
            // Still processing, reset stable count
            lastProcessingCount = processingCount;
            stableCount = 0;
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Give a bit more time to ensure all files are written
    await new Promise((resolve) => setTimeout(resolve, 2000));

    this.attach(`${persona} initial file processing completed`);
});

// Enhanced step definitions with hash verification for .cs files
Then(
    'a file {string} should be updated within {int} milliseconds',
    async function (this: CustomWorld, filename: string, timeoutMs: number) {
        const filePath = path.join(this.workspaceDir, filename);
        const isCodeFile = filename.endsWith('.cs');

        // Ensure directory exists
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

        // Record initial state
        let initialMTime: Date | null = null;
        let initialHash: string = '';

        try {
            const stats = await fs.promises.stat(filePath);
            initialMTime = stats.mtime;
            if (isCodeFile) {
                initialHash = calculateFileHash(filePath);
            }
            this.attach(`File exists, initial mtime: ${initialMTime.toISOString()}`);
            if (isCodeFile) {
                this.attach(`Initial hash for ${filename}: ${initialHash}`);
            }
        } catch (error) {
            this.attach(`File doesn't exist yet: ${filePath}`);
        }

        // Wait for file to be updated within the specified timeout
        const startTime = Date.now();
        const intervalMs = 10; // Check every 10ms for fast response

        this.attach(`Waiting for file: ${filePath} (timeout: ${timeoutMs}ms)`);

        while (Date.now() - startTime < timeoutMs) {
            try {
                const stats = await fs.promises.stat(filePath);
                let fileUpdated = false;

                if (initialMTime === null) {
                    // File was created
                    fileUpdated = true;
                    this.attach(`File created: ${filename}`);
                } else if (stats.mtime > initialMTime) {
                    // File timestamp was modified - now check hash for .cs files
                    if (isCodeFile) {
                        const currentHash = calculateFileHash(filePath);
                        if (currentHash !== initialHash) {
                            fileUpdated = true;
                            this.attach(`File hash changed for ${filename}: ${initialHash} -> ${currentHash}`);
                        } else {
                            this.attach(`File timestamp updated but hash unchanged for ${filename}`);
                        }
                    } else {
                        // For non-.cs files, timestamp change is sufficient
                        fileUpdated = true;
                        this.attach(`File modified: ${filename}, new mtime: ${stats.mtime.toISOString()}`);
                    }
                }

                if (fileUpdated) {
                    const elapsedMs = Date.now() - startTime;
                    this.attach(`File ${filename} updated successfully in ${elapsedMs}ms`);
                    return;
                }
            } catch (error) {
                // File doesn't exist yet, continue waiting
            }

            await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }

        // Timeout reached - provide debugging information
        try {
            const parentDir = path.dirname(filePath);
            if (await this.fileExists(parentDir)) {
                const files = await fs.promises.readdir(parentDir, { recursive: true });
                this.attach(`Files in ${parentDir}: ${JSON.stringify(files)}`);
            } else {
                this.attach(`Parent directory does not exist: ${parentDir}`);
            }
        } catch (err) {
            this.attach(`Error checking directory: ${err}`);
        }

        const elapsedMs = Date.now() - startTime;
        throw new Error(`File was not updated within ${timeoutMs}ms (elapsed: ${elapsedMs}ms): ${filename}`);
    },
);

// Step to verify that the hash of a file has NOT changed (for error scenarios)
Then(
    '{word} verifies the hash of {string} has not changed',
    async function (this: CustomWorld, persona: string, filename: string) {
        const filePath = path.join(this.workspaceDir, filename);
        //Wait a second to ensure any file system operations have completed
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Check if we have a recorded hash
        if (!this.testData.recordedHashes || !this.testData.recordedHashes[filename]) {
            throw new Error(
                `No recorded hash found for ${filename}. Make sure to record the hash before making changes.`,
            );
        }

        if (!fs.existsSync(filePath)) {
            throw new Error(`Cannot verify hash - file does not exist: ${filename}`);
        }

        const originalHash = this.testData.recordedHashes[filename];
        const currentHash = calculateFileHash(filePath);

        this.attach(`${persona} comparing hashes for ${filename} (expecting no change):`);
        this.attach(`  Original hash: ${originalHash}`);
        this.attach(`  Current hash:  ${currentHash}`);

        if (originalHash !== currentHash) {
            throw new Error(
                `File ${filename} hash has changed unexpectedly. Expected no content modification for invalid input.`,
            );
        }

        this.attach(`${persona} verified that ${filename} content has not changed (hash verification passed)`);
    },
);

// Note: File creation and removal steps are handled by common.steps.ts to avoid duplicate definitions

// Export the hash calculation utility for use in other step files
declare global {
    namespace NodeJS {
        interface Global {
            calculateFileHash: typeof calculateFileHash;
        }
    }
}

(global as any).calculateFileHash = calculateFileHash;
