# Implementation Notes — tusq.dev Docs & Website Platform

## Challenge To Prior Turn

- Rejected the prior implementation state as incomplete for M13: planning approved manifest version history (`manifest_version`, `previous_manifest_hash`, `capability_digest`), but runtime code and smoke tests had no implementation or verification of those fields.
- Rejected the previous implementation reissue (`turn_7220d0e20cbbbadd`) as stale and non-actionable: it delivered no runtime changes for approved M12 work (`redaction`, `approved_by`, `approved_at`) and therefore did not satisfy implementation completeness.
- Rejected any assumption that planning completion implied runtime completion: M12 was specified in planning artifacts, but `src/cli.js` still omitted redaction propagation and approval audit fields in manifest generation.
- Rejected the prior failed dev attempt as incomplete for this continuation run: it only re-ran build/smoke checks and did not record or deliver concrete post-v0.1.0 improvements in this artifact.
- Rejected any assumption that "no implementation work remains." This run adds follow-on product clarity improvements to the shipped site while preserving v0.1.0 truth boundaries.
- Rejected the immediately previous stale implementation reissue as insufficient: it produced no turn artifact and did not validate whether approved planning decisions (artifact-shape clarity) were reflected in user-facing docs.
- Rejected the assumption that sensitivity classification had already shipped because planning (M9) and spec artifacts defined `sensitivity_class`, but runtime outputs (`tusq manifest`, `tusq compile`, `tusq serve`) still omitted it.
- Rejected the assumption that governance metadata was fully surfaced at runtime: `auth_hints` existed in compiled tools but was omitted from MCP `tools/list` and `tools/call` responses.
- Rejected the assumption that examples/constraints were already implemented because planning (M11) approved both fields in the canonical artifact, while implementation still omitted `constraints` and generated `examples` inside `compile` instead of propagating manifest-authored values.

## Continuation Changes In This Turn (M12 Redaction + Approval Metadata Closure)

- Implemented redaction defaults/normalization in `src/cli.js`:
  - Added `defaultRedaction()` and `normalizeRedaction()` with V1 defaults:
    - `pii_fields: []`
    - `log_level: "full"`
    - `mask_in_traces: false`
    - `retention_days: null`
  - Added `REDACTION_LOG_LEVELS` guard (`full`, `redacted`, `silent`).
- Implemented approval audit metadata normalization in `src/cli.js`:
  - Added `normalizeApprovedBy()` and `normalizeApprovedAt()`.
  - `tusq manifest` now emits `approved_by` and `approved_at` (default `null`) and preserves existing values by method+path key on regeneration.
- Updated pipeline propagation rules in `src/cli.js`:
  - `tusq manifest` now emits `redaction`, `approved_by`, and `approved_at` on every capability.
  - `tusq compile` now includes normalized `redaction` in compiled tool JSON.
  - `tusq serve` `tools/call` now returns normalized `redaction`.
  - `tusq serve` `tools/list` intentionally still excludes `redaction` (summary view).
  - Approval metadata remains manifest-only (not emitted in compiled tools or MCP responses).
- Expanded smoke coverage in `tests/smoke.mjs`:
  - Asserts manifest defaults for `redaction` and `approved_by`/`approved_at`.
  - Asserts manifest-authored custom `redaction` propagates to compiled tools and MCP `tools/call`.
  - Asserts `tools/list` excludes `redaction`.
  - Asserts compiled tools and MCP responses exclude approval metadata fields.
- Updated docs and fixtures:
  - `website/docs/manifest-format.md` documents `redaction`, `approved_by`, `approved_at`, defaults, and manifest-only approval metadata behavior.
  - `website/docs/mcp-server.md` documents `tools/list` vs `tools/call` metadata boundaries and approval-field omission.
  - Updated express fixture manifest/tool JSON to include `redaction` and approval audit fields for shape parity with current V1 contract.

## Continuation Changes In This Turn (M13 Version History + Diffs Fields Closure)

- Implemented manifest version-chain fields in `src/cli.js`:
  - `manifest_version` now emits at the manifest root and increments from prior valid `manifest_version` (`1` on first/legacy generation).
  - `previous_manifest_hash` now emits at the manifest root as SHA-256 of the full prior manifest file bytes (or `null` if no prior manifest exists).
- Implemented per-capability content digest in `src/cli.js`:
  - Added `capability_digest` to each manifest capability.
  - Digest uses stable sorted-key JSON serialization and SHA-256.
  - Digest excludes approval/review metadata (`approved`, `approved_by`, `approved_at`, `review_needed`) and excludes `capability_digest` itself.
  - Digest includes all capability content fields, including governance fields (`side_effect_class`, `sensitivity_class`, `auth_hints`, `examples`, `constraints`, `redaction`) plus schemas, provenance, confidence, and domain.
- Kept version-history fields manifest-only:
  - No propagation to `tusq-tools/*.json`.
  - No propagation to MCP `tools/list` or `tools/call`.
- Expanded smoke coverage in `tests/smoke.mjs`:
  - Asserts `manifest_version` increment semantics from prior manifest state.
  - Asserts `previous_manifest_hash` matches SHA-256 of prior manifest content.
  - Asserts each `capability_digest` is present, valid SHA-256 hex, and deterministic from content fields.
  - Asserts digest stability when only approval metadata changes.
  - Asserts digest mutation when content fields (`examples`, `constraints`, `redaction`) change.
  - Asserts compile output and MCP `tools/call` exclude version-history metadata.
- Updated docs:
  - `website/docs/manifest-format.md` now documents `manifest_version`, `previous_manifest_hash`, and `capability_digest` semantics and manifest-only boundary.
  - `website/docs/mcp-server.md` now states version-history fields are manifest-only and excluded from MCP responses.

## Continuation Changes In This Turn (M11 Examples + Constraints Closure)

- Implemented manifest-level `examples` and `constraints` fields in `src/cli.js`:
  - `tusq manifest` now emits both fields on every capability.
  - Regeneration preserves previously edited `examples` and `constraints` by method+path key.
  - V1 defaults are applied when values are missing or invalid.
- Updated `tusq compile` to propagate `examples` and `constraints` from `tusq.manifest.json` instead of regenerating examples internally.
- Updated `tusq serve` `tools/call` responses to include normalized `constraints` alongside existing schema and examples.
- Expanded smoke coverage in `tests/smoke.mjs` to verify:
  - manifest emits default `constraints` and `examples`,
  - human-edited `examples`/`constraints` values in manifest survive into compiled tools,
  - MCP `tools/call` returns those exact propagated values.
- Updated fixtures and docs:
  - Added `constraints` and `examples` to express fixture manifest/tool JSON.
  - Updated `website/docs/manifest-format.md` and `website/docs/mcp-server.md` to document V1 behavior and propagation path.

## Continuation Changes In This Turn (M9 Classification Closure)

- Implemented `sensitivity_class` on manifest capabilities in `src/cli.js`.
  - New capabilities default to `"unknown"` in V1.
  - Existing manifest values are preserved on regeneration when manually set to a valid class.
- Propagated `sensitivity_class` to compiled tools in `tusq compile`.
- Propagated both classification metadata fields (`side_effect_class`, `sensitivity_class`) to MCP responses in `tusq serve` for both `tools/list` and `tools/call`.
- Updated public docs:
  - `website/docs/manifest-format.md` now documents `sensitivity_class` plus explicit side-effect and sensitivity rule sections.
  - `website/docs/mcp-server.md` now states classification metadata is returned by MCP methods.
- Updated fixtures and smoke coverage:
  - Added `sensitivity_class` to express fixture manifest and compiled tool JSON.
  - Added smoke assertions that manifest, compiled tools, `tools/list`, and `tools/call` surface `sensitivity_class: "unknown"` in V1.
- Updated `.planning/ROADMAP.md` M9 checklist to fully complete milestone M9, including post-docs build verification.

## Continuation Changes In This Turn (M10 Runtime Closure)

- Added `auth_hints` to MCP `tools/list` responses in `src/cli.js`.
- Added `auth_hints` to MCP `tools/call` responses in `src/cli.js`.
- Updated `website/docs/mcp-server.md` governance metadata line to include `auth_hints` alongside `side_effect_class` and `sensitivity_class`.
- Expanded `tests/smoke.mjs` to assert both MCP methods return an `auth_hints` array.

## Baseline (Completed In Parent Run)

- Docusaurus 3.x site scaffolded in `website/` with strict broken-link policy.
- Custom homepage migrated from `websites/index.html`.
- Seven docs pages authored: getting started, CLI reference, manifest format, configuration, frameworks, MCP server, FAQ.
- Two launch blog posts added.
- Custom 404 page added.
- `website/` established as canonical site surface; `websites/` retained as legacy reference only.

## Continuation Changes In This Run (Post-v0.1.0 Improvements)

- Added a dedicated roadmap documentation page: `website/docs/roadmap.md`.
  - Explicitly frames next-stage priorities as not shipped in v0.1.0.
  - Documents four concrete post-v0.1.0 tracks:
    - opt-in execution mode with policy controls
    - broader framework adapter coverage
    - stronger approval ergonomics
    - scanner-learning loop from misses/low-confidence routes
- Wired roadmap into docs navigation by updating `website/sidebars.ts` (`Help` now includes `roadmap`).
- Updated homepage (`website/src/pages/index.tsx`) with explicit post-v0.1.0 signaling:
  - new CTA button to `/docs/roadmap`
  - new "Post-v0.1.0 improvements" section listing roadmap tracks
  - clear non-overclaim statement that these items are roadmap targets, not shipped behavior
- Tightened Manifest Format documentation in `website/docs/manifest-format.md` so V1 schema behavior is explicit and testable:
  - added a dedicated “V1 schema limitations” section
  - documents the exact fixed V1 shape for both `input_schema` and `output_schema`:
    - `type: object`
    - `additionalProperties: true`
    - route-specific inference status `description`
  - states that full property-level schema inference is beyond `v0.1.0`

## Changes

- Scaffolded a real Docusaurus 3.x project at `website/` using the classic TypeScript template.
- Replaced template config with tusq.dev production settings:
  - strict link policy (`onBrokenLinks: throw`, `onBrokenMarkdownLinks: throw`)
  - navbar with Docs, Blog, GitHub
  - docs sidebar wiring
  - blog RSS/Atom feeds
  - light-mode-first branding and metadata
- Replaced default homepage with migrated product sections from `websites/index.html`:
  - hero and value proposition
  - three-card explanation band
  - workflow steps
  - V1 shipped surface grid
- Added a custom 404 page in Docusaurus (`website/src/pages/404.tsx`) that preserves the legacy site's recovery path back to home.
- Applied tusq visual identity in `website/src/css/custom.css`:
  - Fraunces + Space Grotesk fonts
  - warm gradient background and paper cards
  - tusq accent palette
- Converged the live website surface onto `website/` as the canonical homepage/docs/blog destination; `websites/` is retained only as a legacy reference directory pending later cleanup, not as a separate active site or deployment dependency.
- Implemented docs IA and authored required pages:
  - `getting-started.md`
  - `cli-reference.md`
  - `manifest-format.md`
  - `configuration.md`
  - `frameworks.md`
  - `mcp-server.md`
  - `faq.md`
- Implemented dated blog content adapted from launch artifacts:
  - `2026-04-18-announcing-tusq-dev.md`
  - `2026-04-18-release-notes-v0-1-0.md`
- Removed scaffold placeholders that conflicted with production scope (default tutorial docs, example blog posts, sample components).
- Left legacy static site (`websites/`) intact per PM decision; migration is additive with cleanup deferred.

## Verification

- Built the new website stack from scratch:
  - `cd website && npm install`
  - `cd website && npm run build`
- Ran existing CLI regression smoke suite to ensure website work did not regress shipped CLI behavior:
  - `node tests/smoke.mjs`
- Verified the M11 examples/constraints implementation on current HEAD:
  - `npm test`
  - `cd website && npm run build`

## Notes / Follow-ups

- Deployment target/domain mapping remains a human launch decision.
- Legacy `websites/` directory can be removed in a later cleanup once deployment is confirmed, but the implementation no longer depends on it as a parallel live website.
- Retiring `websites/` is now cleanup-only work: the shipped Docusaurus surface already contains the migrated homepage structure, 404 recovery behavior, styling cues, and required content.
