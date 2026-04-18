# PM Signoff — tusq.dev V1

Approved: YES

> Planning artifacts reviewed and approved. Human unblocked the escalation on 2026-04-18, signaling review completion.

## Discovery Checklist

- [x] **Target user defined** — SaaS engineering and platform teams with existing Node.js/TypeScript codebases who want to expose product capabilities to AI agents safely.
- [x] **Core pain point defined** — Product logic is trapped behind UI-oriented APIs. Manual tool authoring is slow, error-prone, and drifts from the codebase. There is no structured path from "working SaaS product" to "AI-callable capability surface."
- [x] **Core workflow defined** — `tusq init` → `tusq scan` → `tusq manifest` → review/approve → `tusq compile` → `tusq serve`. Developer stays in the terminal. Manifest is the reviewable contract.
- [x] **MVP scope defined** — CLI tool with 8 commands. Scans Express, Fastify, and NestJS codebases. Produces `tusq.manifest.json` with automatic domain grouping. Compiles approved capabilities into tool definitions. Serves describe-only via local MCP server. No runtime instrumentation, no hosted execution, no live API proxy, no embedded UI, no plugin API.
- [x] **Out-of-scope list defined** — See SYSTEM_SPEC.md "Out of scope" section. Explicitly excludes: runtime learning (deferred core pillar — see below), eval generation, advanced skill composition, embedded UI, Python/Go/Java, tusq.cloud integration, plugin ecosystem, migration tooling, competitive intelligence, live API proxy execution.
- [x] **Success metric defined** — A developer can point tusq at a real Express/Fastify/NestJS codebase and get: (1) a reviewed manifest with correct route extraction and domain grouping, (2) compiled tool definitions, and (3) a running local MCP server exposing tool descriptions — all within a single terminal session. V1 proves discovery + manifest + MCP exposure, not full executable capability delivery. Acceptance tests in SYSTEM_SPEC.md are the formal verification.

## PM Challenges to Prior Work

### Attempt 1 Review (rejected — baseline invalidated by config commit)

The initial artifacts were filled with concrete scope, acceptance criteria, and a milestoned roadmap. However, three internal contradictions were found during attempt 2 review:

1. **SYSTEM_SPEC `tusq serve` said "proxied to the actual API"** — directly contradicted the PM decision that V1 is describe-only. Fixed: SYSTEM_SPEC now states `tools/call` returns schema + examples, no live proxy.
2. **SYSTEM_SPEC in-scope item 7 said "group related routes into higher-level capabilities"** — contradicted the PM decision of 1:1 route-to-capability in V1. Fixed: now says "map each route to a single capability (1:1)."
3. **Acceptance test for `tools/call` said "returns result"** — ambiguous and inconsistent with describe-only. Fixed: now says "returns tool schema and example payload (describe-only)."
4. **Open questions in SYSTEM_SPEC duplicated resolved decisions** — converted to "Resolved Decisions" section.

### Attempt 2 Review (this turn — contradictions fixed)

1. **`tusq review` labeled "interactive" in scope and command-surface** — V1 has no TUI. Fixed: scope item 11 and command-surface now say "prints summary to stdout (non-interactive)." Approval is done by editing `tusq.manifest.json` directly.
2. **`tusq manifest` said "runs scan implicitly"** — implicit scan is hidden complexity. Fixed: manifest now requires explicit prior scan, exits 1 if no scan data.
3. **No approval mechanism defined** — manifest had `approved: boolean` but no documented way to set it. Fixed: review behavior section now explicitly states users edit manifest JSON directly. Interactive approval TUI deferred to V1.1.
4. **Missing error case** — "no scan data for manifest" was not in the error table. Added.

### Attempt 4 Review (this turn — human feedback integration)

Human injected a p0 planning revision via intent_1776474414878_c28b. Three changes required:

1. **Domain grouping was cut too aggressively** — VISION.md V1 scope includes "basic skill composition: domain grouping for generated tools." Previous PM turns described V1 as pure 1:1 with no grouping. Fixed: V1 now includes automatic domain assignment (routes grouped by resource/controller). Cross-resource merging still deferred to V1.1.
2. **Product claim about tusq serve was ambiguous** — docs said "describe-only" but didn't clearly state what V1 does and doesn't prove. Fixed: all docs now explicitly state "V1 proves discovery + manifest + MCP exposure, not full executable capability delivery."
3. **Runtime learning treated as normal out-of-scope** — it was listed alongside minor omissions. Fixed: PM_SIGNOFF.md now has a dedicated judgment call (#6) framing runtime learning as a deferred core pillar tied to the vision, and SYSTEM_SPEC.md out-of-scope section calls it out distinctly.

### Attempt 3 Review (scan persistence gap)

1. **Scan data location undefined** — SYSTEM_SPEC said scan produces "an internal capability model (not user-facing directly)" but never specified where it's stored. `tusq manifest` requires prior scan data but had no file to read. Fixed: scan writes to `.tusq/scan.json`, manifest reads from there.
2. **`--format json` on scan contradicted "not user-facing"** — if `--format json` emits the scan result to stdout, it IS user-facing. Fixed: clarified that `--format json` prints scan result to stdout for debugging/scripting.

### Key Judgment Calls (revised per human feedback)

1. **Scope narrowed aggressively.** V1 is scoped to the discovery-manifest-compile-serve pipeline for 3 Node.js frameworks. The vision is the destination, not the first release.

2. **MCP serve is describe-only in V1.** `tusq serve` will serve tool descriptions and schemas only. V1 proves discovery + manifest + MCP exposure — it does **not** prove full executable capability delivery. Live proxy introduces auth forwarding, error handling, and reliability concerns that belong in V1.1. The product claim is honest: V1 exposes capabilities, V1.1 executes them.

3. **Minimal domain grouping included in V1.** VISION.md mandates "basic skill composition: domain grouping for generated tools" in V1. We include automatic domain assignment based on resource name or controller (e.g., all `/users/*` routes grouped under "users" domain). This keeps the manifest organized without requiring complex cross-resource merging heuristics. Intelligent composite capability creation (merging multiple routes into one higher-level capability) is deferred to V1.1.

4. **No plugin API in V1.** V1 hardcodes support for 3 frameworks. Plugin interfaces are added when we know the right abstractions from real usage.

5. **TypeScript only.** V1 targets the Node.js/TypeScript ecosystem. Python, Go, Java support is V2+.

6. **Runtime learning is a deferred core pillar, not a normal omission.** Runtime instrumentation and production-signal-driven manifest refinement are foundational to the tusq.dev vision (see VISION.md "Runtime learning" product module). V1 operates purely on static analysis. Runtime learning is the primary mechanism by which the manifest improves over time — it is the bridge from "good enough on first pass" to "continuously accurate." This is explicitly deferred to V2 to keep V1 disciplined, but it is a core pillar of the product, not a nice-to-have.

## Open Decisions for Human

1. **MCP version target** — Should we pin to a specific MCP spec version? Recommendation: yes, pin to latest stable at implementation start.
2. **Package name** — Is `tusq` available on npm? If not, fallback to `@tusq/cli` or `tusq-dev`.
3. **Sample test apps** — Should we ship sample Express/Fastify/NestJS apps in-repo for testing, or use external fixtures? Recommendation: in-repo under `test/fixtures/`.

## Notes for Team

- SYSTEM_SPEC.md contains the full system specification with acceptance tests
- ROADMAP.md contains implementation milestones (M1-M7)
- command-surface.md contains the CLI command table and flag reference
- The planning gate requires human approval. Review all three docs and flip `Approved: YES` when ready.
