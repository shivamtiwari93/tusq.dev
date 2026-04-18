# System Spec — tusq.dev V1 (Milestone 1: Discovery Foundation)

## Purpose

tusq.dev V1 is a CLI tool that scans an existing SaaS codebase, discovers its API capabilities, and produces a reviewable `tusq.manifest.json`. This first slice proves the core insight: a product's real capabilities can be inferred from code and exposed as governed, AI-callable tools.

V1 does **not** attempt runtime instrumentation, hosted execution, or advanced skill composition. It proves the discovery-to-manifest pipeline end-to-end for a small number of supported frameworks, then compiles the manifest into strict tool definitions and serves them via a local MCP server.

### Problem this solves

SaaS engineering teams have years of business logic trapped behind UI-oriented APIs. They want to expose that logic to AI agents but lack a structured, safe way to do so. Manual tool authoring is slow, error-prone, and drifts from the actual codebase. tusq.dev automates the discovery and compilation step.

## Scope — what ships in V1

### In scope

1. **CLI skeleton** — `tusq` binary installable via `npm install -g tusq` or local dev install
2. **Repository scanning** — point at a local directory, detect framework (Express, Fastify, NestJS initially)
3. **Route extraction** — parse route definitions, extract HTTP method, path, handler references
4. **Schema inference** — extract request/response shapes from TypeScript types, Zod schemas, or JSDoc where available
5. **Auth hint extraction** — detect middleware patterns (e.g., `requireAuth`, `isAdmin`, role guards) and tag capabilities with permission hints
6. **Side-effect classification** — tag routes as read/write/destructive based on HTTP method and naming heuristics
7. **Capability mapping** — map each route to a single capability (1:1); intelligent grouping of related routes deferred to V1.1
8. **Manifest generation** — produce `tusq.manifest.json` with schemas, permissions, side effects, provenance, and review markers
9. **Tool compilation** — compile manifest entries into strict JSON tool definitions suitable for LLM tool-use
10. **Local MCP server** — serve compiled tools as a standards-based MCP server on localhost
11. **Human review flow** — `tusq review` opens the manifest for interactive review/approval of capabilities

### Out of scope (V2+)

- Runtime instrumentation / payload observation
- Eval and regression test generation
- Multi-step skill composition and domain agents
- Embedded UI / assistant surfaces beyond MCP
- Python / Go / Java framework support
- Remote hosting or tusq.cloud integration
- Plugin ecosystem and extension API
- Migration and rollout tooling
- Competitive transition intelligence

## Interface

### CLI commands

| Command | Purpose |
|---------|---------|
| `tusq init` | Initialize a `tusq.config.json` in the target repo |
| `tusq scan <path>` | Scan a codebase and produce an internal capability model |
| `tusq manifest` | Generate or update `tusq.manifest.json` from the latest scan |
| `tusq compile` | Compile approved manifest entries into tool definitions |
| `tusq serve` | Start a local MCP server exposing compiled tools |
| `tusq review` | Print manifest summary to stdout for human review |
| `tusq version` | Print version and exit |
| `tusq help` | Print usage and exit |

### Key flags

| Flag | Commands | Meaning | Default |
|------|----------|---------|---------|
| `--format json` | scan, manifest, review | Output as JSON instead of human-readable | human |
| `--out <path>` | manifest, compile | Write output to specific path | `./tusq.manifest.json` / `./tusq-tools/` |
| `--port <n>` | serve | MCP server port | 3100 |
| `--dry-run` | compile | Show what would be generated without writing | false |
| `--framework <name>` | scan | Force framework detection instead of auto-detect | auto |
| `--verbose` | all | Verbose output | false |

### File contracts

- `tusq.config.json` — project configuration (created by `tusq init`)
- `tusq.manifest.json` — the canonical capability manifest (created by `tusq manifest`)
- `tusq-tools/` — directory of compiled tool definitions (created by `tusq compile`)

### stdin/stdout/stderr

- All structured output goes to stdout
- Progress, warnings, and errors go to stderr
- JSON mode (`--format json`) emits machine-parseable output on stdout
- Exit code 0 = success, 1 = user error, 2 = internal error

## Behavior

### `tusq init`

- Creates `tusq.config.json` with sensible defaults
- Auto-detects framework if possible, prompts if ambiguous
- Idempotent: re-running does not overwrite existing config (warns instead)

### `tusq scan`

- Reads the target directory recursively
- Detects framework from package.json dependencies and file patterns
- Parses route definitions using AST analysis (TypeScript/JavaScript)
- Extracts: HTTP method, path, handler, middleware chain, type annotations
- Produces an internal capability model (not user-facing directly)
- Warns on ambiguous or unsupported patterns (does not fail silently)
- Exit 0 if scan completes (even with warnings), exit 1 if no routes found

### `tusq manifest`

- Requires a prior scan (or runs scan implicitly)
- Converts internal model to `tusq.manifest.json`
- Each capability entry includes: name, description, method, path, input schema, output schema, side_effect_class (read/write/destructive), auth_hints, provenance (file + line), confidence score, approved (boolean, default false)
- Marks uncertain inferences with `confidence < 0.8` and `review_needed: true`
- Preserves existing approvals on re-generation (merge, don't replace)

### `tusq compile`

- Reads `tusq.manifest.json`
- Only compiles capabilities where `approved: true`
- Generates one JSON tool definition per capability
- Tool definition includes: name, description, parameters (JSON Schema), returns schema
- `--dry-run` lists what would be compiled without writing files

### `tusq serve`

- Reads compiled tools from `tusq-tools/`
- Starts an MCP-compliant server on localhost
- Supports `tools/list` MCP method (returns compiled tool inventory with schemas)
- `tools/call` returns the tool's schema and example payloads (describe-only in V1; live API proxy deferred to V1.1)
- Logs all calls to stderr in development mode

### `tusq review`

- Prints a human-readable summary of the manifest
- Groups by domain/category
- Highlights unapproved and low-confidence capabilities
- In JSON mode, outputs the full manifest

## Error Cases

| Scenario | Behavior |
|----------|----------|
| No `tusq.config.json` found | Error: "No tusq config found. Run `tusq init` first." Exit 1 |
| Unsupported framework detected | Warning: "Framework X not yet supported. Supported: Express, Fastify, NestJS." Exit 1 |
| No routes found in scan | Warning: "No API routes found in <path>. Check framework detection." Exit 1 |
| Manifest not found for compile/serve | Error: "No manifest found. Run `tusq manifest` first." Exit 1 |
| No approved capabilities for compile | Warning: "No approved capabilities. Run `tusq review` to approve." Exit 0 (empty output) |
| Invalid flag or unknown command | Print help text, exit 1 |
| Port already in use for serve | Error: "Port <n> already in use." Exit 1 |
| File permission error | Error with specific path. Exit 2 |

## Acceptance Tests

### CLI skeleton
- [ ] `tusq version` prints version string and exits 0
- [ ] `tusq help` prints usage for all commands and exits 0
- [ ] Unknown command prints help and exits 1
- [ ] Invalid flags print help and exit 1

### Init
- [ ] `tusq init` creates `tusq.config.json` with detected framework
- [ ] Re-running `tusq init` warns but does not overwrite

### Scan (Express)
- [ ] Scanning an Express app extracts routes with method, path, handler
- [ ] Middleware chains are detected and auth hints extracted
- [ ] TypeScript type annotations are extracted as schema hints
- [ ] Scan with `--format json` outputs machine-parseable result
- [ ] Scan of empty/non-Node directory exits 1 with clear message

### Scan (Fastify)
- [ ] Scanning a Fastify app extracts routes with schema validation
- [ ] Fastify schema definitions are used for input/output inference

### Scan (NestJS)
- [ ] Scanning a NestJS app extracts controller decorators
- [ ] Guards and interceptors are detected as auth hints

### Manifest
- [ ] `tusq manifest` produces valid `tusq.manifest.json`
- [ ] Each capability has: name, method, path, schemas, side_effect_class, auth_hints, provenance, confidence, approved
- [ ] Re-running manifest preserves existing approvals
- [ ] Low-confidence capabilities are flagged with `review_needed: true`
- [ ] Side-effect classification: GET→read, POST/PUT/PATCH→write, DELETE→destructive

### Compile
- [ ] `tusq compile` generates tool definitions only for approved capabilities
- [ ] Each tool definition has: name, description, parameters (JSON Schema), returns
- [ ] `--dry-run` lists tools without writing files
- [ ] No approved capabilities → empty output, exit 0

### Serve
- [ ] `tusq serve` starts MCP server on configured port
- [ ] `tools/list` returns all compiled tools
- [ ] `tools/call` with valid tool name returns tool schema and example payload (describe-only)
- [ ] Server stops cleanly on SIGINT

### Review
- [ ] `tusq review` prints grouped capability summary
- [ ] Unapproved capabilities are highlighted
- [ ] `--format json` outputs full manifest

## Resolved Decisions

1. **Capability grouping** — V1 uses 1:1 route-to-capability mapping. Intelligent grouping deferred to V1.1.
2. **MCP protocol version** — Pin to latest stable MCP spec at implementation start.
3. **API proxy in serve** — V1 is describe-only (`tools/call` returns schema + examples). Live proxy deferred to V1.1.
4. **Auth forwarding** — Not applicable in V1 (no live proxy). Will be addressed with proxy in V1.1.
5. **Monorepo support** — V1 scans a single directory. Multi-root scanning deferred to V1.1.
