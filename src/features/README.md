# Integration Tests with Cucumber

This directory contains comprehensive integration tests for the mermaid-codegen tool using Cucumber BDD framework.

## Overview

The integration tests cover the following main areas:

1. **Project Initialization** - Setting up new projects with language templates
2. **Mermaid to YAML Transformation** - Converting mermaid class diagrams to structured YAML
3. **Code Generation** - Generating code files from YAML using templates
4. **File Watching** - Monitoring file changes and auto-regeneration
5. **End-to-End Workflows** - Complete scenarios from Mermaid to generated code

## Test Structure

```
features/
├── 00-smoke-tests.feature           # Quick smoke tests for basic functionality
├── 01-project-initialization.feature # Project setup and initialization
├── 02-mermaid-transformation.feature # Mermaid to YAML conversion
├── 03-code-generation.feature       # YAML to code generation
├── 04-file-watching.feature         # File monitoring and auto-regeneration
├── 05-end-to-end-workflow.feature   # Complete workflows
├── step_definitions/                # Step implementations
│   ├── project-initialization.steps.ts
│   ├── mermaid-transformation.steps.ts
│   ├── code-generation.steps.ts
│   ├── file-watching.steps.ts
│   └── end-to-end-workflow.steps.ts
└── support/                        # Test support files
    ├── world.ts                     # Test world context
    ├── hooks.ts                     # Before/After hooks
    └── jest.setup.ts               # Jest configuration
```

## Running Tests

### Prerequisites

Make sure you have installed all dependencies:

```bash
npm install
```

### Quick Start

Run all integration tests:

```bash
npm run test:integration
```

Or use the test runner script:

```bash
node run-integration-tests.js
```

### Running Specific Tests

Run only smoke tests:

```bash
npm run test:cucumber -- --tags "@smoke"
```

Run only transformation tests:

```bash
npm run test:cucumber -- --tags "@transform"
```

Run tests in development mode (TypeScript directly):

```bash
npm run test:cucumber -- --profile dev
```

### Available Tags

- `@smoke` - Basic functionality tests
- `@quick` - Fast-running tests
- `@transform` - Mermaid transformation tests
- `@generate` - Code generation tests
- `@watch` - File watching tests
- `@manual` - Tests requiring manual intervention

## Test Configuration

### Cucumber Configuration

The cucumber configuration is in [`cucumber.js`](../cucumber.js) with profiles:

- `default` - Runs compiled JavaScript tests
- `dev` - Runs TypeScript tests directly (faster development)

### TypeScript Configuration

TypeScript settings for tests are in [`tsconfig.cucumber.json`](../tsconfig.cucumber.json).

## Test Environment

Each test scenario runs in an isolated environment:

- **Temporary workspace** - Each test gets a unique temp directory
- **Fresh templates** - Templates are copied from the main project
- **Clean state** - No interference between test scenarios

### Test Workspace Structure

```
temp-workspace-{timestamp}/
├── input/          # Input files (Mermaid, YAML)
├── output/         # Generated output files
│   ├── yml/        # Transformed YAML files
│   ├── code/       # Generated code files
│   └── docs/       # Generated documentation
└── templates/      # Template files for code generation
    ├── C#/
    ├── Documentation/
    └── Custom/
```

## Writing New Tests

### Creating a New Feature

1. Create a new `.feature` file in the `features/` directory
2. Use descriptive scenario names and clear Given/When/Then steps
3. Add appropriate tags for categorization
4. Follow the existing pattern for Background steps

Example:

```gherkin
Feature: New Feature
  As a user
  I want some functionality
  So that I can achieve my goal

  Background:
    Given I have a clean test workspace

  @tag @category
  Scenario: Descriptive scenario name
    Given some precondition
    When I perform an action
    Then I should see the expected result
```

### Implementing Step Definitions

1. Create a new step definition file in `features/step_definitions/`
2. Import required modules and the CustomWorld
3. Implement step functions with proper types

Example:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { expect } from '@jest/globals';

Given('some precondition', function (this: CustomWorld) {
    // Implementation
});

When('I perform an action', async function (this: CustomWorld) {
    // Implementation
});

Then('I should see the expected result', function (this: CustomWorld) {
    // Implementation with assertions
    expect(something).toBe(expected);
});
```

### Using the Test World

The `CustomWorld` class provides:

- **Workspace management** - `setupWorkspace()`, `cleanupWorkspace()`
- **File operations** - `createMermaidFile()`, `createYamlFile()`, `fileExists()`, `readFile()`
- **Command execution** - `runCommand()`, `lastCommandResult`
- **File discovery** - `getGeneratedFiles()`

## Test Data and Fixtures

Common test data is available in [`test-fixtures/sample-data.ts`](../test-fixtures/sample-data.ts):

- **SAMPLE_MERMAID_DIAGRAMS** - Predefined Mermaid diagrams
- **SAMPLE_YAML_FILES** - Sample YAML configurations
- **TEMPLATE_FILES** - Template definitions
- **CONFIG_FILES** - Configuration examples

## Debugging Tests

### Enable Debug Mode

```bash
node run-integration-tests.js --debug
```

### Check Test Reports

After running tests, check the generated reports:

- `cucumber-report.html` - Visual HTML report
- `cucumber-report.json` - Machine-readable JSON report

### Inspect Test Workspace

For debugging, you can prevent workspace cleanup by modifying the `After` hook in `features/support/hooks.ts`.

### Common Issues

1. **Command timeouts** - Increase timeout in cucumber config
2. **Build issues** - Ensure `npm run build` completed successfully
3. **Template missing** - Check that templates are copied during workspace setup
4. **Path issues** - Verify absolute paths are used consistently

## Contributing

When adding new integration tests:

1. Follow the existing naming conventions
2. Add appropriate tags for test categorization
3. Include error case scenarios alongside happy path tests
4. Update this documentation if adding new categories
5. Ensure tests are deterministic and can run in parallel

## Dependencies

The integration tests use:

- **@cucumber/cucumber** - BDD test framework
- **jest** - Assertion library (expect)
- **fs-extra** - Enhanced file system operations
- **yaml** - YAML parsing and generation

## CI/CD Integration

For continuous integration, use:

```bash
npm run test:integration
```

This runs all integration tests in headless mode with proper exit codes for CI systems.

The tests are designed to be:

- **Fast** - Most tests complete in seconds
- **Reliable** - Isolated environments prevent flakiness
- **Comprehensive** - Cover all major functionality
- **Maintainable** - Clear separation of concerns
