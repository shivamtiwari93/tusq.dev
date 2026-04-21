# Implementation Notes — tusq.dev Docs & Website Platform

## Dev Turn turn_caf1a0a2c45f3746 — Verification Pass (2026-04-21)

### Challenge To Prior Turn

- Prior turn (turn_fae691907af78136, role=pm) was a planning-phase re-verification pass: structurally correct, returned `needs_human` for the planning_signoff gate. It is not rejected — PM turns are not expected to deliver implementation artifacts. However, a PM planning turn cannot satisfy the `implementation_complete` gate; that requires a dev turn with verified implementation evidence.
- No attempt-1 ghost reissue was present for this dev turn slot; this is attempt 1 of turn_caf1a0a2c45f3746 and proceeds as a direct verification-and-close turn.

### Verification Activities

- Ran `node tests/smoke.mjs` → exit 0, "Smoke tests passed". All M9–M15 behaviors asserted by the test suite remain passing on HEAD 566fa68.
- Ran `node bin/tusq.js help` → exit 0, all 8 commands enumerated (init, scan, manifest, compile, serve, review, version, help).
- Confirmed all four required planning artifacts exist and are consistent with M15 delivered behavior.
- No new source changes required — implementation is complete as verified by prior accepted dev turns (DEC-252) and this independent re-run.

### Implementation Status

All milestones M9–M15 are implemented and verified on HEAD 566fa68:
- M9: `sensitivity_class` on manifest capabilities and propagated through compile/MCP.
- M10: `auth_hints` surfaced in MCP `tools/list` and `tools/call` responses.
- M11: `examples` and `constraints` manifest fields, preserved on regeneration, propagated to compile and MCP.
- M12: `redaction` defaults/normalization; `approved_by`/`approved_at` approval audit fields.
- M13: `manifest_version` counter, `previous_manifest_hash` SHA-256 chain, per-capability `capability_digest`.
- M15: Path parameter extraction into `input_schema`, prefix-aware domain inference, rich capability descriptions, schema-miss confidence penalty (-0.10).

Implementation_complete gate satisfied: all required artifacts exist and verification pass completed.

---

## Challenge To Prior Turn (historical)

- Rejected turn_b9fd4cbc1588bb9e (attempt 1 of this dev slot, summary "Turn reissued: ghost") as non-actionable: it carried no implementation artifact, no verification evidence, and no updated workflow-kit content. A ghost reissue cannot satisfy the implementation_complete gate.
- Rejected the prior implementation state as incomplete for M13: planning approved manifest version history (`manifest_version`, `previous_manifest_hash`, `capability_digest`), but runtime code and smoke tests had no implementation or verification of those fields.
- Rejected the previous implementation reissue (`turn_7220d0e20cbbbadd`) as stale and non-actionable: it delivered no runtime changes for approved M12 work (`redaction`, `approved_by`, `approved_at`) and therefore did not satisfy implementation completeness.
- Rejected any assumption that planning completion implied runtime completion: M12 was specified in planning artifacts, but `src/cli.js` still omitted redaction propagation and approval audit fields in manifest generation.
- Rejected the prior failed dev attempt as incomplete for this continuation run: it only re-ran build/smoke checks and did not record or deliver concrete post-v0.1.0 improvements in this artifact.
- Rejected any assumption that "no implementation work remains." This run adds follow-on product clarity improvements to the shipped site while preserving v0.1.0 truth boundaries.
- Rejected the immediately previous stale implementation reissue as insufficient: it produced no turn artifact and did not validate whether approved planning decisions (artifact-shape clarity) were reflected in user-facing docs.
- Rejected the assumption that sensitivity classification had already shipped because planning (M9) and spec artifacts defined `sensitivity_class`, but runtime outputs (`tusq manifest`, `tusq compile`, `tusq serve`) still omitted it.
- Rejected the assumption that governance metadata was fully surfaced at runtime: `auth_hints` existed in compiled tools but was omitted from MCP `tools/list` and `tools/call` responses.
- Rejected the assumption that examples/constraints were already implemented because planning (M11) approved both fields in the canonical artifact, while implementation still omitted `constraints` and generated `examples` inside `compile` instead of propagating manifest-authored values.
- Rejected the immediately previous ghost implementation turn (`turn_21be8394ad263a0d` summary: "Turn reissued: ghost") as insufficient because it provided no implementation artifact, no verification evidence, and did not progress the M13 roadmap closure.
- Rejected the previous attempt in this run as incomplete for M15: first-pass manifest usability behaviors (path params, prefix-aware domains, rich descriptions, honest confidence penalty) were still unchecked in ROADMAP and not asserted by smoke coverage.

## Continuation Changes In This Turn (M15 First-Pass Manifest Usability Closure)

- Implemented path parameter extraction in `src/cli.js`:
  - Added `extractPathParameters()` for both `:param` and `{param}` forms.
  - `finalizeRouteInference()` now enriches `input_schema` with `properties`, `required`, and a path-parameter specific description when path params are present.
- Implemented smart domain inference in `src/cli.js`:
  - Added prefix-skip set for `api`, `v1`-`v5`, `rest`, `graphql`, `internal`, `public`, `external`.
  - `inferDomain()` now skips these segments and falls back to `general` only when no meaningful segment remains.
- Implemented rich capability descriptions in `src/cli.js`:
  - Replaced static template with method/domain/qualifier/side-effect/auth-context/handler composition.
  - Added helper functions for verb mapping, side-effect text, singularization, and multi-param qualifier formatting.
- Implemented honest confidence penalty in `src/cli.js`:
  - `scoreConfidence()` now subtracts `0.10` when `schema_hint` is missing, then applies lower/upper bounds.
- Expanded smoke coverage in `tests/smoke.mjs`:
  - Added Express fixture assertions for `/api/v1/users/:id` to verify path-param schema, prefix-skipping domain inference, and confidence below `0.8`.
  - Added manifest assertions for richer descriptions and `review_needed: true` on schema-less named/auth route.
- Updated fixtures and docs:
  - Added a prefixed param route to `tests/fixtures/express-sample/src/app.ts` for end-to-end usability assertions.
  - Updated `website/docs/manifest-format.md` with path-parameter extraction, description template behavior, and confidence scoring details.
- Updated planning tracking:
  - Marked all M15 checklist items complete in `.planning/ROADMAP.md`.

## Continuation Changes In This Turn (M13 Roadmap Closure Verification)

- Re-verified M13 implementation behavior on current HEAD before changing planning state:
  - `npm test`
  - `node tests/smoke.mjs`
  - `cd website && npm run build`
- Updated `.planning/ROADMAP.md` to mark all M13 checklist items complete now that implementation and verification were re-confirmed in this run.
- Preserved existing runtime behavior and scope:
  - No code-path changes were introduced in `src/cli.js`.
  - This turn closes stale roadmap bookkeeping rather than adding new feature semantics.

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

## M16 Manifest Diff and Review Queue

- Added `tusq diff` in `src/cli.js`.
- Supports explicit `--from <path>` and `--to <path>` manifest comparison.
- Defaults `--to` to `tusq.manifest.json`; requires `--from` when no predecessor is locally resolvable.
- Classifies capabilities as added, removed, changed, or unchanged by matching `name` and comparing `capability_digest`.
- Reports top-level `fields_changed` for changed capabilities.
- Supports human-readable output, `--json`, `--review-queue`, and `--fail-on-unapproved-changes`.
- Review queue includes added, changed, unapproved, and `review_needed` capabilities with governance/provenance metadata.
- Updated README, CLI reference, manifest format docs, roadmap, acceptance matrix, command surface, PM signoff, and next-increment handoff.
- Added smoke coverage for REQ-039 through REQ-044.

## Website Platform Changes

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
