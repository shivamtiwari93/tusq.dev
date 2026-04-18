---
slug: release-notes-v0-1-0
title: "Release Notes: tusq.dev v0.1.0"
authors: [core-team]
tags: [release-notes, v0-1-0]
---

`tusq.dev v0.1.0` is the first public release of the tusq capability compiler CLI.

{/* truncate */}

## What shipped

1. Scan support for Express, Fastify, and NestJS.
2. Manifest generation into `tusq.manifest.json` with confidence and provenance metadata.
3. Manual capability approval by editing the manifest.
4. Compilation of approved capabilities into JSON tool definitions.
5. Local describe-only MCP server via `tusq serve`.
6. Non-interactive grouped review output via `tusq review`.

## Verification snapshot

- End-to-end smoke test suite passes (`node tests/smoke.mjs`).
- CLI failure UX is validated for unknown commands, invalid flags, and missing prerequisites.
- Acceptance matrix checks are recorded as pass.

## Known V1 limits

- Scanner is heuristic (not full AST-level semantic extraction).
- MCP `tools/call` is describe-only and does not proxy live product actions.
- Plugin API and non-Node ecosystems are deferred beyond V1.
- No interactive approval UI in this release.
