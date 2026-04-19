# Release Notes — tusq v0.1.0

## User Impact

tusq v0.1.0 is the first public release of the tusq capability compiler CLI. It gives Node.js developers a repeatable pipeline to:

1. **Scan** their Express, Fastify, or NestJS codebase and extract API routes automatically.
2. **Generate a manifest** (`tusq.manifest.json`) that lists discovered capabilities with confidence scores and domain grouping.
3. **Approve capabilities** by editing the manifest directly, then **compile** them into structured tool-definition JSON files.
4. **Expose** those tools over a describe-only MCP HTTP endpoint (`tusq serve`) that clients can inspect through `tools/list` and describe-only `tools/call`.
5. **Review** the current manifest summary at any time without re-scanning.

This release is intentionally narrow: it gives SaaS teams a governed, review-first way to expose a supported slice of their backend capability surface to MCP-aware tooling without claiming live execution, runtime learning, or broad framework coverage.

## Launch Framing

The broader repository narrative describes where tusq.dev is headed over time. The shipped v0.1.0 product is narrower. For launch messaging, the source of truth is the current `website/` experience plus these release notes, not the longer-horizon README roadmap.

The defendable v0.1.0 position is:

- open-source capability compiler CLI
- Node.js SaaS backends using Express, Fastify, or NestJS
- manual review and approval through `tusq.manifest.json`
- compile approved capabilities into JSON tool definitions
- expose those definitions through a local describe-only MCP endpoint

The shortest accurate launch story is: repo to reviewed manifest to approved tool definitions to inspectable describe-only MCP.

Homepage hero copy, homepage shipped-surface copy, site metadata, and these release notes now all use that same describe-only framing so the first skim and the detailed read make the same promise.

This release should not be described as a live execution engine, hosted platform, plugin ecosystem, runtime learning system, or shipped skill/agent generator.

The prior QA pass proved build and behavior, but it did not by itself validate every launch CTA. One important messaging correction for launch is install-path discipline: until package distribution is confirmed, external copy should not promise a public global install command.

## Website Consolidation

The public tusq.dev surface is now consolidated onto the Docusaurus app in `website/`. This was a migration of the existing live website into the canonical docs/blog app, not the introduction of a parallel third site. The legacy live-site structure from `websites/` was migrated over rather than replaced with template content:

1. The homepage keeps the same hero proposition, three-card explanation band, workflow steps, and V1 shipped-surface grid from the former live site.
2. The not-found experience preserves the legacy recovery pattern by sending users back to the homepage instead of dropping them onto a default Docusaurus error state.
3. The warm gradient, editorial typography, and paper-card styling cues were carried into the Docusaurus theme so docs, blog, and homepage read as one canonical product surface.
4. Site metadata now points to a tusq-specific social share card instead of the Docusaurus default asset, so off-site previews carry the same v0.1.0 positioning as the homepage and release notes.

`websites/` may remain in-repo temporarily for cleanup, but it is no longer the active website that release messaging or deployment readiness depends on.

## Capability Provenance

Each compiled tool definition in `tusq-tools/` carries a `provenance` field that links back to the originating source file and line number where the route was declared:

```json
{
  "name": "get_users_users",
  "provenance": { "file": "src/app.ts", "line": 12 },
  ...
}
```

This provenance chain is preserved end-to-end: `tusq scan` records it in `.tusq/scan.json`, `tusq manifest` carries it into `tusq.manifest.json`, and `tusq compile` writes it into the final tool definition files. The canonical artifact (the compiled tool) is therefore traceable back to the exact line of source code that defines the capability.

## Verification Summary

- Smoke test suite (`node tests/smoke.mjs`) passes end-to-end: 20 scenarios covering all 6 commands, all 3 frameworks, approval persistence, dry-run compile, MCP RPC, and SIGINT shutdown.
- Manual CLI audit confirms correct UX for help, version, invalid commands, invalid flags, and missing-prerequisite errors.
- All 28 acceptance criteria in `.planning/acceptance-matrix.md` have status PASS (25 prior + 3 provenance-chain checks REQ-026 through REQ-028).
- Website consolidation checks pass: homepage structure, 404 behavior, styling cues, and canonical `website/` ownership are explicitly covered in the QA acceptance matrix and ship verdict.
- Provenance chain verified: scan.json, tusq.manifest.json, and tusq-tools/*.json all carry `provenance.{file,line}` on the express fixture end-to-end.

## Upgrade Notes

This is an initial release. No migration required.

**Prerequisites:**
- Node.js ≥ 18
- Run from your project root (the directory containing `package.json`)

**Current try path:**
- Clone the repo and run the CLI locally against a supported project
- If you want a shell command during local evaluation, use the repo-local Node workflow rather than assuming a published package exists
- Publish a public package-manager install step only after distribution is confirmed

**Typical workflow:**
```
tusq init
tusq scan .
tusq manifest
# edit tusq.manifest.json to set approved: true on desired capabilities
tusq compile
tusq serve
```

## Known V1 Limits And Non-Claims

- **Heuristic scanner:** Route extraction uses regex-based static analysis, not a full AST. Complex dynamic route registration patterns may be missed or produce low-confidence results. Users should review the manifest before compiling.
- **Describe-only MCP:** `tusq serve` returns capability schemas but does not proxy or execute live API calls. Full execution support is planned for V2.
- **No plugin API:** Framework support (Express, Fastify, NestJS) is hardcoded. Community framework plugins are deferred to V2.
- **JavaScript/TypeScript only:** Python, Go, Java, and other ecosystems are not supported in V1.
- **Non-interactive review:** `tusq review` prints to stdout only. An interactive TUI for in-terminal approval is planned for V1.1.
- **Distribution still needs explicit confirmation:** the launch narrative should drive repo-local evaluation until a public package channel is actually available
