# Contributing to mermaid-codegen

Thank you for your interest in contributing to `mermaid-codegen`! Contributions of all kinds are welcome — bug reports, feature requests, documentation improvements, new language templates, and code changes.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Running Tests](#running-tests)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Adding a New Language Template](#adding-a-new-language-template)
- [Reporting Bugs](#reporting-bugs)

---

## Code of Conduct

Please be respectful and considerate when interacting with the project community. We expect all contributors to follow a standard of professional and inclusive behaviour.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- npm v9 or higher

### Fork and Clone

1. [Fork](https://github.com/ReneLombard/mermaid-codegen/fork) the repository on GitHub.
2. Clone your fork locally:

```bash
git clone https://github.com/<your-username>/mermaid-codegen.git
cd mermaid-codegen
```

3. Install dependencies:

```bash
cd src
npm install
```

---

## Project Structure

```
mermaid-codegen/
├── src/                    # Main source code (TypeScript)
│   ├── __tests__/          # Unit tests (Jest)
│   ├── features/           # Cucumber integration tests
│   ├── mermaid-model/      # Domain models
│   ├── processor/          # Processing logic
│   └── loader/             # File loaders
├── Templates/              # Built-in Handlebars templates per language
│   ├── C#/                 # C# templates
│   └── Documentation/      # Documentation templates
├── docs/                   # VitePress documentation site
└── output/                 # Default output directory (git-ignored)
```

---

## Development Workflow

### Building

```bash
cd src
npm run build
```

### Running in Development

```bash
cd src
npm run dev
```

### Linting

```bash
cd src
npm run check:deadcode
```

---

## Running Tests

### Unit Tests

```bash
cd src
npm test
```

### Unit Tests with Coverage

```bash
cd src
npm run test:coverage
```

### Integration Tests (Cucumber)

> **Note:** Some integration tests require external tools (e.g., `dotnet`). These are tagged `@wip` or `@manual` and are excluded from the default test run.

```bash
cd src
npm run test:cucumber
```

### Watch Mode

```bash
cd src
npm run test:watch
```

---

## Submitting a Pull Request

1. Create a new branch from `main`:

```bash
git checkout -b feature/my-feature
```

2. Make your changes, following the existing code style.
3. Ensure all tests pass:

```bash
cd src && npm test && npm run test:cucumber
```

4. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
git commit -m "feat: add support for Java templates"
```

5. Push your branch and open a pull request against `main`.

Pull requests are automatically built and tested via GitHub Actions. Please ensure the CI checks pass before requesting a review.

---

## Adding a New Language Template

One of the most impactful ways to contribute is by adding Handlebars templates for a new programming language.

1. Create a new folder under `Templates/<language-name>/`.
2. Add a `config.json` file describing the language and file extension.
3. Add `.hbs` template files for each supported class type (e.g. `class`, `interface`, `enumeration`).
4. Use the existing `Templates/C#/` directory as a reference.
5. Test your templates by running:

```bash
cd src
npm run generate:code
```

Please submit new language templates via a pull request — they help the whole community!

---

## Reporting Bugs

If you find a bug, please [open an issue](https://github.com/ReneLombard/mermaid-codegen/issues) and include:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behaviour
- Your environment (Node.js version, OS, `mermaid-codegen` version)

---

## 📚 More Information

- [Documentation site](https://renelombard.github.io/mermaid-codegen/)
- [npm package](https://www.npmjs.com/package/mermaid-codegen)
- [Changelog](./src/CHANGELOG.md)
