#!/usr/bin/env node

/**
 * Integration Test Runner for mermaid-codegen
 * 
 * This script runs the cucumber integration tests and provides
 * detailed reporting and setup validation.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

class IntegrationTestRunner {
    constructor() {
        this.projectRoot = process.cwd();
        this.distPath = path.join(this.projectRoot, 'dist');
        this.featuresPath = path.join(this.projectRoot, 'features');
    }

    async checkPrerequisites() {
        console.log('🔍 Checking prerequisites...');

        // Check if project is built
        if (!await fs.pathExists(this.distPath)) {
            console.log('⚠️  Project not built. Building...');
            try {
                execSync('npm run build', { stdio: 'inherit' });
                console.log('✅ Project built successfully');
            } catch (error) {
                console.error('❌ Failed to build project:', error.message);
                process.exit(1);
            }
        } else {
            console.log('✅ Project already built');
        }

        // Check if features exist
        if (!await fs.pathExists(this.featuresPath)) {
            console.error('❌ Features directory not found');
            process.exit(1);
        }

        // Check if cucumber is installed
        try {
            execSync('npx cucumber-js --version', { stdio: 'pipe' });
            console.log('✅ Cucumber.js found');
        } catch (error) {
            console.error('❌ Cucumber.js not found. Please run npm install');
            process.exit(1);
        }
    }

    async runTests(profile = 'default') {
        console.log(`🚀 Running integration tests (profile: ${profile})...`);

        const cucumberArgs = [
            'cucumber-js',
            '--profile', profile,
            '--format', 'progress-bar',
            '--format', 'json:cucumber-report.json',
            '--format', 'html:cucumber-report.html'
        ];

        if (process.argv.includes('--debug')) {
            cucumberArgs.push('--verbose');
        }

        if (process.argv.includes('--tags')) {
            const tagIndex = process.argv.indexOf('--tags');
            if (tagIndex >= 0 && process.argv[tagIndex + 1]) {
                cucumberArgs.push('--tags', process.argv[tagIndex + 1]);
            }
        }

        return new Promise((resolve, reject) => {
            const cucumber = spawn('npx', cucumberArgs, {
                stdio: 'inherit',
                cwd: this.projectRoot
            });

            cucumber.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ All integration tests passed!');
                    resolve(code);
                } else {
                    console.log('❌ Some integration tests failed');
                    resolve(code);
                }
            });

            cucumber.on('error', (error) => {
                console.error('❌ Failed to run tests:', error.message);
                reject(error);
            });
        });
    }

    async generateReport() {
        const reportPath = path.join(this.projectRoot, 'cucumber-report.html');
        if (await fs.pathExists(reportPath)) {
            console.log(`📊 Test report generated: ${reportPath}`);

            // Try to open the report in the default browser (optional)
            if (!process.argv.includes('--no-open')) {
                try {
                    if (process.platform === 'win32') {
                        // Windows: use "start" via the shell
                        execSync(`start "" "${reportPath}"`, { stdio: 'ignore', shell: true });
                    } else if (process.platform === 'darwin') {
                        // macOS: use "open"
                        execSync(`open "${reportPath}"`, { stdio: 'ignore' });
                    } else {
                        // Linux and other Unix-like systems: use "xdg-open" if available
                        execSync(`xdg-open "${reportPath}"`, { stdio: 'ignore' });
                    }
                } catch (error) {
                    // Ignore error if can't open browser
                }
            }
        }
    }

    async cleanup() {
        // Clean up any temporary test files if needed
        const tempDirs = ['temp-test-*'];
        // Implementation would go here if needed
    }

    async run() {
        try {
            await this.checkPrerequisites();

            const profile = process.argv.includes('--dev') ? 'dev' : 'default';
            const exitCode = await this.runTests(profile);

            await this.generateReport();
            await this.cleanup();

            process.exit(exitCode);
        } catch (error) {
            console.error('❌ Integration test run failed:', error.message);
            process.exit(1);
        }
    }
}

// Parse command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🥒 mermaid-codegen Integration Test Runner

Usage: node run-integration-tests.js [options]

Options:
  --dev         Run in development mode (TypeScript directly)
  --debug       Enable verbose output
  --tags <tag>  Run only tests with specific tags
  --no-open     Don't open HTML report automatically
  --help, -h    Show this help

Examples:
  node run-integration-tests.js
  node run-integration-tests.js --dev
  node run-integration-tests.js --tags "@smoke"
  node run-integration-tests.js --debug --no-open
`);
    process.exit(0);
}

// Run the tests
const runner = new IntegrationTestRunner();
runner.run();