# Release Notes — tusq v0.1.0

## User Impact

tusq v0.1.0 is the first public release of the tusq capability compiler CLI. It gives Node.js developers a repeatable pipeline to:

1. **Scan** their Express, Fastify, or NestJS codebase and extract API routes automatically.
2. **Generate a manifest** (`tusq.manifest.json`) that lists discovered capabilities with confidence scores and domain grouping.
3. **Approve capabilities** by editing the manifest directly, then **compile** them into structured tool-definition JSON files.
4. **Expose** those tools over a describe-only MCP HTTP endpoint (`tusq serve`) that MCP-compatible clients can inspect.
5. **Review** the current manifest summary at any time without re-scanning.

This release is intentionally narrow: it gives SaaS teams a governed, review-first way to expose a supported slice of their backend capability surface to MCP-aware tooling without claiming live execution, runtime learning, or broad framework coverage.

## Website Consolidation

The public tusq.dev surface is now consolidated onto the Docusaurus app in `website/`. This was a migration of the existing live website into the canonical docs/blog app, not the introduction of a parallel third site. The legacy live-site structure from `websites/` was migrated over rather than replaced with template content:

1. The homepage keeps the same hero proposition, three-card explanation band, workflow steps, and V1 shipped-surface grid from the former live site.
2. The not-found experience preserves the legacy recovery pattern by sending users back to the homepage instead of dropping them onto a default Docusaurus error state.
3. The warm gradient, editorial typography, and paper-card styling cues were carried into the Docusaurus theme so docs, blog, and homepage read as one canonical product surface.

`websites/` may remain in-repo temporarily for cleanup, but it is no longer the active website that release messaging or deployment readiness depends on.

## Verification Summary

- Smoke test suite (`node tests/smoke.mjs`) passes end-to-end: 20 scenarios covering all 6 commands, all 3 frameworks, approval persistence, dry-run compile, MCP RPC, and SIGINT shutdown.
- Manual CLI audit confirms correct UX for help, version, invalid commands, invalid flags, and missing-prerequisite errors.
- All 25 acceptance criteria in `.planning/acceptance-matrix.md` have status PASS.
- Website consolidation checks pass: homepage structure, 404 behavior, styling cues, and canonical `website/` ownership are explicitly covered in the QA acceptance matrix and ship verdict.

## Upgrade Notes

This is an initial release. No migration required.

**Prerequisites:**
- Node.js ≥ 18
- Run from your project root (the directory containing `package.json`)
- Install: `npm install -g tusq` (or `npm link` from the repo for local development)

**Typical workflow:**
```
tusq init
tusq scan .
tusq manifest
# edit tusq.manifest.json to set approved: true on desired capabilities
tusq compile
tusq serve
```

## Known Issues

- **Heuristic scanner:** Route extraction uses regex-based static analysis, not a full AST. Complex dynamic route registration patterns may be missed or produce low-confidence results. Users should review the manifest before compiling.
- **Describe-only MCP:** `tusq serve` returns capability schemas but does not proxy or execute live API calls. Full execution support is planned for V2.
- **No plugin API:** Framework support (Express, Fastify, NestJS) is hardcoded. Community framework plugins are deferred to V2.
- **JavaScript/TypeScript only:** Python, Go, Java, and other ecosystems are not supported in V1.
- **Non-interactive review:** `tusq review` prints to stdout only. An interactive TUI for in-terminal approval is planned for V1.1.
