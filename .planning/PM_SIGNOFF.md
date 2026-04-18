# PM Signoff — tusq.dev V1

Approved: NO

> This document is ready for human review. Change `Approved: NO` to `Approved: YES` after reviewing the planning artifacts to open the planning gate.

## Discovery Checklist

- [x] **Target user defined** — SaaS engineering and platform teams with existing Node.js/TypeScript codebases who want to expose product capabilities to AI agents safely.
- [x] **Core pain point defined** — Product logic is trapped behind UI-oriented APIs. Manual tool authoring is slow, error-prone, and drifts from the codebase. There is no structured path from "working SaaS product" to "AI-callable capability surface."
- [x] **Core workflow defined** — `tusq init` → `tusq scan` → `tusq manifest` → review/approve → `tusq compile` → `tusq serve`. Developer stays in the terminal. Manifest is the reviewable contract.
- [x] **MVP scope defined** — CLI tool with 8 commands. Scans Express, Fastify, and NestJS codebases. Produces `tusq.manifest.json`. Compiles approved capabilities into tool definitions. Serves via local MCP server. No runtime instrumentation, no hosted execution, no embedded UI, no plugin API.
- [x] **Out-of-scope list defined** — See SYSTEM_SPEC.md "Out of scope" section. Explicitly excludes: runtime instrumentation, eval generation, skill composition, embedded UI, Python/Go/Java, tusq.cloud integration, plugin ecosystem, migration tooling, competitive intelligence.
- [x] **Success metric defined** — A developer can point tusq at a real Express/Fastify/NestJS codebase and get: (1) a reviewed manifest with correct route extraction, (2) compiled tool definitions, and (3) a running local MCP server — all within a single terminal session. Acceptance tests in SYSTEM_SPEC.md are the formal verification.

## PM Challenges to Prior Work

### Attempt 1 Review (rejected — baseline invalidated by config commit)

The initial artifacts were filled with concrete scope, acceptance criteria, and a milestoned roadmap. However, three internal contradictions were found during attempt 2 review:

1. **SYSTEM_SPEC `tusq serve` said "proxied to the actual API"** — directly contradicted the PM decision that V1 is describe-only. Fixed: SYSTEM_SPEC now states `tools/call` returns schema + examples, no live proxy.
2. **SYSTEM_SPEC in-scope item 7 said "group related routes into higher-level capabilities"** — contradicted the PM decision of 1:1 route-to-capability in V1. Fixed: now says "map each route to a single capability (1:1)."
3. **Acceptance test for `tools/call` said "returns result"** — ambiguous and inconsistent with describe-only. Fixed: now says "returns tool schema and example payload (describe-only)."
4. **Open questions in SYSTEM_SPEC duplicated resolved decisions** — converted to "Resolved Decisions" section.

### Key Judgment Calls (unchanged)

1. **Scope narrowed aggressively.** V1 is scoped to just the discovery-manifest-compile-serve pipeline for 3 Node.js frameworks. The vision is the destination, not the first release.

2. **MCP serve is describe-only in V1.** `tusq serve` will serve tool descriptions and schemas only. Live proxy introduces auth forwarding, error handling, and reliability concerns that belong in V1.1.

3. **Capability grouping starts conservative.** V1 maps 1 route → 1 capability. Intelligent grouping requires significant heuristic tuning and is deferred to V1.1.

4. **No plugin API in V1.** V1 hardcodes support for 3 frameworks. Plugin interfaces are added when we know the right abstractions from real usage.

5. **TypeScript only.** V1 targets the Node.js/TypeScript ecosystem. Python, Go, Java support is V2+.

## Open Decisions for Human

1. **MCP version target** — Should we pin to a specific MCP spec version? Recommendation: yes, pin to latest stable at implementation start.
2. **Package name** — Is `tusq` available on npm? If not, fallback to `@tusq/cli` or `tusq-dev`.
3. **Sample test apps** — Should we ship sample Express/Fastify/NestJS apps in-repo for testing, or use external fixtures? Recommendation: in-repo under `test/fixtures/`.

## Notes for Team

- SYSTEM_SPEC.md contains the full system specification with acceptance tests
- ROADMAP.md contains implementation milestones (M1-M7)
- command-surface.md contains the CLI command table and flag reference
- The planning gate requires human approval. Review all three docs and flip `Approved: YES` when ready.
