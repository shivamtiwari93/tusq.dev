# Messaging

## Audience

### Primary

- SaaS engineering, platform, and AI-enablement teams with an existing Node.js codebase built on Express, Fastify, or NestJS
- Teams that want to expose product behavior to AI systems without rewriting business logic or hand-authoring tools from scratch

### Secondary

- CTOs and product leaders evaluating how to make an existing SaaS product AI-callable without losing governance
- Developer tooling adopters who want a self-hosted, OSS-first path to MCP exposure

### Not for V1

- Teams outside the JavaScript/TypeScript ecosystem
- Buyers looking for hosted execution, live API proxying, embedded chat UI, or autonomous agent workflows out of the box
- Teams that need runtime-learned capability modeling instead of a static-analysis-first workflow

## Positioning

### Category

tusq.dev v0.1.0 is an open-source capability compiler CLI for existing SaaS products.

### One-line Positioning

Turn a supported Node.js API codebase into a reviewable manifest and describe-only MCP tool surface.

### Positioning Statement

For SaaS teams with working Express, Fastify, or NestJS products, tusq.dev is the OSS CLI that discovers routes from the codebase, turns them into a governed `tusq.manifest.json`, compiles approved capabilities into tool-definition JSON, and serves them over a local MCP endpoint. Unlike prompt wrappers or manual tool authoring, tusq.dev starts from product behavior already encoded in code and keeps human review in the loop.

### Messaging Pillars

1. **Start from the product you already have**
   Existing APIs, handlers, and auth hints are the raw material. V1 is for teams that already have working product logic and want a faster path to AI exposure.
2. **Review before you expose**
   The manifest is the contract. Users scan, inspect, approve, and then compile. tusq.dev does not ask teams to trust an opaque generation step.
3. **Ship an MCP-visible surface without rebuilding the stack**
   V1 gets teams from repo to manifest to compiled tools to a local describe-only MCP endpoint in one terminal workflow.
4. **Be explicit about the V1 boundary**
   This release proves discovery, manifest generation, compile, review, and MCP exposure. It does not yet execute live product actions.

## Product Truth

- Package version is `0.1.0`
- The CLI surface is `init`, `scan`, `manifest`, `compile`, `serve`, `review`, `version`, and `help`
- Supported frameworks are Express, Fastify, and NestJS only
- `tusq scan` uses static heuristics to detect routes and write `.tusq/scan.json`
- `tusq manifest` generates `tusq.manifest.json` and preserves prior approvals
- Capability approval is manual in V1: users edit `tusq.manifest.json` directly and set `approved: true`
- `tusq compile` emits JSON tool definitions only for approved capabilities
- `tusq review` is non-interactive and prints a grouped summary to stdout
- `tusq serve` exposes compiled tools through a local MCP HTTP endpoint
- MCP `tools/call` is describe-only in V1: it returns schema and example payloads, not live API execution
- Domain grouping exists at a basic level in V1; intelligent cross-resource capability composition does not
- Runtime learning, plugin APIs, non-Node ecosystems, hosted delivery, and embedded UI are deferred beyond V1

## Claims We Can Defend

- tusq.dev can scan supported Node.js frameworks and extract route-level capability candidates from a real codebase
- tusq.dev can generate a reviewable `tusq.manifest.json` from scan data and preserve manual approvals across regeneration
- tusq.dev can compile approved capabilities into structured JSON tool definitions
- tusq.dev can expose compiled tools through a local, describe-only MCP server
- tusq.dev gives teams a governed path from existing SaaS code to AI-visible capability definitions without starting from prompts
- V1 is self-hosted and terminal-native; teams can run the workflow locally

## Claims We Must Not Make

- Do not say tusq.dev executes live product actions through MCP in v0.1.0
- Do not say tusq.dev infers full business logic, runtime behavior, or production-grade permissions perfectly
- Do not say tusq.dev supports Python, Go, Java, or arbitrary backend frameworks in v0.1.0
- Do not say tusq.dev includes an interactive approval UI, embedded chat experience, or hosted cloud control plane in v0.1.0
- Do not say tusq.dev replaces human review; V1 depends on manifest review and manual approval
