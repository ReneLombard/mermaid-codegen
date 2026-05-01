# Getting Started Workflow Alignment Plan

## Objective

Align the documented getting started sample workflow with the actual, test-verified behavior of the application so that
a new user can follow it end-to-end without surprises.

## Scope

This plan covers:

- Getting started documentation flow
- Language/template file explanation page
- README quick start consistency
- Validation through existing and new executable scenarios

Primary files involved:

- docs/pages/getting-started/getting-started.md
- docs/pages/getting-started/language-files-explained.md
- README.md
- src/features/01-project-initialization.feature
- src/features/04-file-watching.feature
- src/features/05-end-to-end-workflow.feature
- src/index.ts
- src/initializeService.ts

## Canonical Source Of Truth

Use implementation and executable tests as the source of truth when docs conflict:

1. CLI contract and flags in src/index.ts.
2. Initialization behavior and generated structure in src/initializeService.ts.
3. End-to-end expectations in BDD features under src/features/.

## Current Mismatch Themes To Resolve

1. Initialize target directory usage in docs versus actual scaffold behavior.
2. Template/config naming and location (for example config naming and Templates/C# layout).
3. Watch command syntax presentation (detailed flags versus simplified syntax) versus supported runtime behavior.
4. Inconsistent path naming in docs (blue-prints/blueprints/Templates conventions).
5. Divergence between README quick start and docs getting started sequence.

## Decisions Made

1. Canonical initialize usage targets the project root directory.
2. Standard terminology and scaffold conventions are Templates/C# and config.json.
3. Watch command uses simplified syntax as primary in getting started, with detailed flags documented as advanced.
4. Transform examples in getting started are directory-first.
5. skipnamespace is excluded from core getting started and documented in advanced/command reference contexts.
6. Watch mode is optional and presented after first successful transform and generate flow.
7. Getting started verification includes required artifact checks and optional dotnet build when SDK is available.
8. Add a dedicated docs-parity BDD scenario/file rather than relying only on broad end-to-end scenarios.
9. Docs-parity tests prefer structural assertions over exact stdout matching, except for contract-critical output.
10. Standardize command examples on cross-platform style paths with a note about equivalent Windows path separators.
11. Perform a focused rewrite of language-files-explained.md to remove outdated concepts and align with runtime
    behavior.
12. Keep README quick start compact and canonical, delegating deep detail to docs pages.
13. Record these decisions in this plan file to prevent re-opening settled branches during implementation.

## Work Plan

### Phase 1: Build A Traceability Matrix

Create a step-by-step matrix mapping each documented action to runtime/test behavior. For each getting started step,
capture:

- Doc instruction text
- Command shown
- Expected output stated in docs
- Actual behavior from tests/runtime
- Status: match, mismatch, or ambiguous

Deliverable:

- A simple markdown table checked into docs/pages/getting-started/ (or docs/) as a temporary working artifact.

### Phase 2: Define A Canonical Sample Workflow

From the matrix, define one canonical sample flow that is both user-friendly and fully executable:

1. Project initialization
2. Mermaid authoring
3. Transform step
4. Generate step
5. Optional watch mode
6. Verification/build step

Rules:

- Keep paths consistent throughout.
- Use one naming convention for directories and template paths.
- Ensure every "expected result" statement is observable from app behavior.

Deliverable:

- A finalized command sequence and expected file tree/output list.

### Phase 3: Update Documentation

Update all user-facing docs to match the canonical flow:

1. docs/pages/getting-started/getting-started.md
2. docs/pages/getting-started/language-files-explained.md
3. README.md quick start

Documentation quality checks:

- Commands are copy-paste runnable.
- Output paths match real behavior.
- Terminology is consistent (Templates, config file naming, generated paths).

Deliverable:

- Synchronized docs with no contradictory instructions.

### Phase 4: Add Executable Guardrail

Add a dedicated BDD scenario that mirrors the published getting started flow exactly.

Target location:

- src/features/06-docs-parity.feature

Scenario should verify:

1. initialize command output structure
2. transform output artifacts and locations
3. generate output artifacts and locations
4. optional watch-mode smoke behavior (or separate scenario)

Deliverable:

- A docs-parity scenario that fails when behavior drifts from documentation.

### Phase 5: CI And Change Policy

Establish a simple guardrail policy:

1. Any PR changing CLI semantics/path conventions must update docs in the same PR.
2. Run docs-parity BDD scenario in CI.
3. Require docs and scenario updates together for workflow-impacting changes.

Deliverable:

- Reduced risk of future doc drift.

## Acceptance Criteria

The alignment is complete when:

1. A clean environment can follow getting started without interpretation.
2. README quick start and getting started docs show the same workflow semantics.
3. Template/config naming and path conventions are consistent across docs.
4. The docs-parity scenario passes in automated test runs.
5. No unresolved mismatches remain in the traceability matrix.

## Suggested Execution Order

1. Build traceability matrix.
2. Lock canonical workflow decisions.
3. Patch docs and README together.
4. Implement docs-parity BDD scenario.
5. Run targeted feature tests and finalize.

## Risks And Mitigations

1. Risk: Existing users rely on older command examples. Mitigation: Include concise migration notes in docs/changelog.
2. Risk: Behavior differs by environment/path assumptions. Mitigation: Prefer explicit, portable path examples and test
   in clean workspace.
3. Risk: Future feature changes reintroduce drift. Mitigation: Keep docs-parity scenario in CI and enforce update
   policy.

## Ownership

Recommended owners:

- Product docs owner: wording and UX clarity
- CLI maintainer: command/behavior correctness
- QA/automation owner: parity scenario and CI gate

## Timeline (Lightweight)

1. Day 1: Matrix and canonical workflow decisions.
2. Day 2: Docs and README updates.
3. Day 3: Parity scenario and CI integration.
