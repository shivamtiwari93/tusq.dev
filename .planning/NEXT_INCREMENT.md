# Next Increment — M16 Manifest Diff and Review Queue

Status: implemented and smoke-verified on 2026-04-21.

## Problem

The manifest already carries version metadata (`manifest_version`, `previous_manifest_hash`, `capability_digest`), but users cannot yet ask tusq.dev what changed between two manifest versions. VISION.md explicitly calls for manifest diffs and review queues. M16 turns that broad vision item into the next concrete product increment.

## Product Outcome

Teams can compare two manifest files, see which capabilities were added/removed/changed/unchanged, generate a review queue, and fail CI when changed capabilities have not been approved.

## Implementation Scope

- Add `tusq diff` command.
- Support `--from <manifest-path>` and `--to <manifest-path>`.
- Default `--to` to `tusq.manifest.json`.
- Print human-readable summary output by default.
- Add `--json` for structured automation output.
- Match capabilities by `name`.
- Detect changes with `capability_digest`.
- Report `fields_changed` for changed capabilities.
- Add `--review-queue` output for added, changed, unapproved, and `review_needed` capabilities.
- Add `--fail-on-unapproved-changes` with exit 1 on unapproved added/changed capabilities.
- Update CLI help, README/docs, and smoke tests.

## Out Of Scope

- No `.tusq/manifest-history.jsonl` history store.
- No git integration.
- No automatic approval invalidation during `tusq manifest`.
- No manifest schema changes.
- No MCP runtime changes.

## Acceptance Criteria

- REQ-039 through REQ-044 in `.planning/acceptance-matrix.md` move from PLANNED to PASS.
- `node tests/smoke.mjs` exits 0.
- Docs do not claim git integration, history storage, or automatic re-approval are shipped.

## Completion Evidence

- `node tests/smoke.mjs` exits 0.
- `tusq help` lists `diff`.
- `tusq diff --help` lists `--from`, `--to`, `--json`, `--review-queue`, and `--fail-on-unapproved-changes`.
- REQ-039 through REQ-044 are PASS in `.planning/acceptance-matrix.md`.
