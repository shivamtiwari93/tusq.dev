# Release Notes — tusq v0.1.0

## User Impact

tusq v0.1.0 is the first public release of the tusq capability compiler CLI. It gives Node.js developers a repeatable pipeline to:

1. **Scan** their Express, Fastify, or NestJS codebase and extract API routes automatically.
2. **Generate a manifest** (`tusq.manifest.json`) that lists discovered capabilities with confidence scores and domain grouping.
3. **Approve capabilities** by editing the manifest directly, then **compile** them into structured tool-definition JSON files.
4. **Expose** those tools over a describe-only MCP HTTP endpoint (`tusq serve`) that any MCP-compatible agent or IDE can query.
5. **Review** the current manifest summary at any time without re-scanning.

This enables SaaS products to give AI agents a governed, curated view of their API surface — without exposing implementation details.

## Verification Summary

- Smoke test suite (`node tests/smoke.mjs`) passes end-to-end: 20 scenarios covering all 6 commands, all 3 frameworks, approval persistence, dry-run compile, MCP RPC, and SIGINT shutdown.
- Manual CLI audit confirms correct UX for help, version, invalid commands, invalid flags, and missing-prerequisite errors.
- All 22 acceptance criteria in `.planning/acceptance-matrix.md` have status PASS.

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
