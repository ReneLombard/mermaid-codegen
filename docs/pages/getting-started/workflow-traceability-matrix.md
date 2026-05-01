# Getting Started Workflow Traceability Matrix

## Purpose

Map each documented getting started step to actual, test-verified behavior and identify where docs must be corrected.

Legend:

- Match: documentation aligns with implementation/tests
- Mismatch: documentation does not align and must be updated
- Ambiguous: behavior supports multiple variants; docs should pick one canonical path

## Matrix

| Step                                               | Current Documentation                                                                   | Actual Behavior (Source of Truth)                                                                        | Status | Action                                        |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------- |
| Initialize target directory                        | Uses project-root target (`npx mermaid-codegen initialize -l C# -d fleet-management`)   | Initialize expects project target directory and creates `Templates/C#` plus `config.json` inside it      | Match  | Keep as canonical                             |
| Initialize output structure                        | Shows `<target>/Templates/C#` and `<target>/config.json`                                | Creates `<target>/Templates/C#` and `<target>/config.json`                                               | Match  | Keep terminology consistent                   |
| Transform command shape                            | Uses directory input in getting started                                                 | Transform accepts file or directory input                                                                | Match  | Keep directory-first example                  |
| Generate templates path                            | Uses `./Templates/C#` in docs and README after `cd fleet-management`                    | Generation in tests and runtime uses templates directory argument                                        | Match  | Keep canonical template path                  |
| Watch command syntax                               | Getting started uses simplified syntax; commands page documents simplified and detailed | CLI supports detailed and simplified syntax                                                              | Match  | Keep simplified as primary onboarding path    |
| skipnamespace usage in onboarding                  | Excluded from core getting-started flow                                                 | Supported in transform/watch CLI options                                                                 | Match  | Keep in advanced/reference docs only          |
| Verification step                                  | Defines required artifact checks and optional `dotnet build`                            | Reliable checks are generated artifact existence; build can be optional environment-dependent validation | Match  | Keep current success criteria                 |
| Language config naming in language-files-explained | Uses `Templates/C#/config.json` and current mappings explanation                        | Template config convention in tests and templates is `config.json` under templates folder                | Match  | Keep focused rewrite                          |
| README vs docs consistency                         | README quick start matches canonical flow and stays compact                             | Behavior is consistent in code/tests and command sequence semantics                                      | Match  | Keep README concise and canonical             |
| Docs-to-behavior enforcement                       | Dedicated docs-parity feature added and tagged (`@docs-parity`)                         | Existing BDD scenarios now include a strict docs-parity lane                                             | Match  | Run `npm run test:cucumber:docs-parity` in CI |

## Evidence Index

- Getting started command/examples drift:
    - docs/pages/getting-started/getting-started.md
- Language config naming drift:
    - docs/pages/getting-started/language-files-explained.md
- README quick start drift:
    - README.md
- CLI contract:
    - src/index.ts
- Initialization behavior:
    - src/initializeService.ts
- Initialization expectations:
    - src/features/01-project-initialization.feature
- Watch simplified syntax coverage:
    - src/features/04-file-watching.feature
- Transform and generate coverage:
    - src/features/02-mermaid-transformation.feature
    - src/features/03-code-generation.feature
- End-to-end baseline:
    - src/features/05-end-to-end-workflow.feature
- Docs parity guardrail:
    - src/features/06-docs-parity.feature

## Locked Decisions Applied

This matrix assumes the decisions captured in:

- docs/pages/getting-started/workflow-alignment-plan.md

Those decisions are treated as constraints when implementing documentation and test updates.
