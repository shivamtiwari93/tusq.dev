# Next Increment — M17 Governed CLI Eval/Regression Harness

Status: implemented and smoke-verified on 2026-04-21.

## Problem

tusq.dev now has a broad smoke suite, but the product needs a tighter eval/regression layer for governed CLI workflows. VISION.md calls for reliable capability contracts and governance metadata. The M17 harness turns that into repeatable checks that catch drift in review gates, compiled tool-call metadata, permission/schema expectations, and manifest diff review queues.

## Product Outcome

Maintainers can run `npm test` and get both product smoke coverage and workflow-level eval coverage for governed CLI behavior. The eval harness provides versioned scenarios that can grow with future prompt-pack, permission, and schema expectations.

## Implementation Scope

- Add versioned eval scenarios under `tests/evals/`.
- Add a deterministic Node eval runner under `tests/`.
- Validate strict review-gate behavior before compile.
- Validate compiled tool metadata boundaries: auth hints, side-effect class, schema sources, examples, constraints, redaction, and manifest-only approval metadata.
- Validate manifest diff review queues and CI gate failures for changed unapproved capabilities.
- Wire the eval runner into `npm test`.

## Out Of Scope

- No networked eval service.
- No model-provider calls.
- No hosted benchmark dashboard.
- No automatic fixture generation.

## Acceptance Criteria

- REQ-045 through REQ-049 in `.planning/acceptance-matrix.md` are PASS.
- `node tests/smoke.mjs` exits 0.
- `node tests/eval-regression.mjs` exits 0.
- `npm test` exits 0 and runs both suites.

## Completion Evidence

- `node tests/smoke.mjs` exits 0 with "Smoke tests passed".
- `node tests/eval-regression.mjs` exits 0 with "Eval regression harness passed (2 scenarios)".
- `npm test` exits 0.
- REQ-045 through REQ-049 are PASS in `.planning/acceptance-matrix.md`.
