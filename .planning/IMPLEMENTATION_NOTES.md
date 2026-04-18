# Implementation Notes — tusq.dev Docs & Website Platform

## Challenge To Prior Turn

- Rejected any assumption that the previous PM turn completed implementation: it only patched planning-doc section headers for gate shape (`## Interface`, command-surface headings) and did not deliver the approved Docusaurus platform itself.
- Revalidated current HEAD and treated this as net-new implementation work for the accepted website/docs/blog scope.

## What Was Implemented

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
- Added a custom 404 page in Docusaurus (`website/src/pages/404.tsx`).
- Applied tusq visual identity in `website/src/css/custom.css`:
  - Fraunces + Space Grotesk fonts
  - warm gradient background and paper cards
  - tusq accent palette
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
- Legacy `websites/` directory can be removed in a later cleanup once deployment is confirmed.
