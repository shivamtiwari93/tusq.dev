# Implementation Notes — tusq.dev Docs & Website Platform

## Challenge To Prior Turn

- Rejected the prior failed dev attempt as incomplete for this continuation run: it only re-ran build/smoke checks and did not record or deliver concrete post-v0.1.0 improvements in this artifact.
- Rejected any assumption that "no implementation work remains." This run adds follow-on product clarity improvements to the shipped site while preserving v0.1.0 truth boundaries.
- Rejected the immediately previous stale implementation reissue as insufficient: it produced no turn artifact and did not validate whether approved planning decisions (artifact-shape clarity) were reflected in user-facing docs.
- Rejected the assumption that sensitivity classification had already shipped because planning (M9) and spec artifacts defined `sensitivity_class`, but runtime outputs (`tusq manifest`, `tusq compile`, `tusq serve`) still omitted it.

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

## Notes / Follow-ups

- Deployment target/domain mapping remains a human launch decision.
- Legacy `websites/` directory can be removed in a later cleanup once deployment is confirmed, but the implementation no longer depends on it as a parallel live website.
- Retiring `websites/` is now cleanup-only work: the shipped Docusaurus surface already contains the migrated homepage structure, 404 recovery behavior, styling cues, and required content.
