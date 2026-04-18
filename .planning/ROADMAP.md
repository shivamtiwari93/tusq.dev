# Roadmap — tusq.dev

## Phases

| Phase | Goal | Status |
|-------|------|--------|
| Planning | Define MVP scope, acceptance criteria, and system spec | In progress |
| Implementation | Build CLI, scanner, manifest generator, compiler, and MCP server | Pending |
| QA | Validate acceptance tests, error handling, and MCP compliance | Pending |

## V1 Implementation Milestones

V1 is scoped to: CLI + Express/Fastify/NestJS scanning + manifest generation with domain grouping + tool compilation + describe-only local MCP server. V1 proves the discovery-to-manifest-to-MCP-exposure pipeline. It does **not** prove live executable capability delivery (no API proxy, no runtime instrumentation).

### M1: CLI Skeleton & Project Init (Est. ~1 day)
- [ ] Set up TypeScript project with build toolchain
- [ ] Implement `tusq` CLI entry point with commander/yargs
- [ ] `tusq version`, `tusq help`
- [ ] `tusq init` — create `tusq.config.json` with framework auto-detection
- [ ] Exit code contracts (0/1/2)
- [ ] npm package.json with `bin` field

### M2: Route Extraction & Framework Detection (Est. ~2 days)
- [ ] Framework detector: inspect `package.json` deps for Express, Fastify, NestJS
- [ ] Express scanner: AST-based extraction of `app.get/post/put/delete/use` and `Router` patterns
- [ ] Fastify scanner: extract route registrations with inline schemas
- [ ] NestJS scanner: extract `@Controller`, `@Get/@Post/@Put/@Delete` decorators, `@UseGuards`
- [ ] Extract handler file + line number for provenance
- [ ] `tusq scan` command wiring

### M3: Schema & Auth Inference (Est. ~2 days)
- [ ] TypeScript type extraction from handler parameters and return types
- [ ] Zod schema detection and extraction
- [ ] Fastify JSON Schema extraction
- [ ] Auth middleware detection heuristics (pattern matching on common names)
- [ ] Side-effect classification (method-based + naming heuristics)
- [ ] Confidence scoring for each inference

### M4: Manifest Generation (Est. ~1 day)
- [ ] Define `tusq.manifest.json` schema (JSON Schema for the manifest itself)
- [ ] Capability mapping logic (1 route = 1 capability, with automatic domain grouping by resource/controller)
- [ ] Merge logic: preserve approvals on re-generation
- [ ] `tusq manifest` command wiring
- [ ] `tusq review` command (stdout summary, JSON mode)

### M5: Tool Compilation (Est. ~1 day)
- [ ] Tool definition format (JSON Schema-based tool descriptions)
- [ ] Compile only approved capabilities
- [ ] `tusq compile` and `--dry-run` support
- [ ] Output to `tusq-tools/` directory

### M6: Local MCP Server (Est. ~1-2 days)
- [ ] MCP server using `@modelcontextprotocol/sdk` or equivalent
- [ ] `tools/list` — return compiled tool inventory
- [ ] `tools/call` — describe-only in V1 (returns tool schema + example payload; live API proxy deferred to V1.1)
- [ ] `tusq serve` command wiring with `--port`
- [ ] Clean shutdown on SIGINT

### M7: Integration Testing & Polish (Est. ~1-2 days)
- [ ] Test against a sample Express app
- [ ] Test against a sample Fastify app
- [ ] Test against a sample NestJS app
- [ ] Error message quality pass
- [ ] Help text accuracy for all commands
- [ ] README update with quickstart

## Post-V1 Roadmap (Reference Only)

### V1.1 — Fast Follows
- Live API proxy mode in `tusq serve` (forward tool calls to running API — proves executable capability delivery)
- Monorepo support (multiple scan roots)
- Intelligent cross-resource capability merging (composite capabilities from multiple routes)
- Interactive approval TUI for `tusq review`
- Zod-to-JSON-Schema improvements

### V2 — Adoption & Migration (includes deferred core pillar: Runtime Learning)
- **Runtime learning** (core pillar) — runtime instrumentation middleware, payload observation, production signal capture. This is the mechanism by which the manifest improves over time based on real usage, not just static analysis. It is a foundational pillar of the tusq.dev vision, deferred from V1 to keep the first release disciplined.
- Eval/regression test generation
- Migration and rollout tooling
- Python framework support (FastAPI, Django)
- Plugin API for custom framework detectors

### V3 — Moat
- Advanced runtime learning loop (refine schemas, tool boundaries, and skills from production observations)
- Competitive transition intelligence
- Automated manifest improvement proposals
- Advanced governance workflows

## Key Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| AST parsing fragility across JS/TS variants | Scanner misses routes or crashes | Use established parsers (ts-morph); test against real-world codebases |
| MCP spec instability | Server incompatible with clients | Pin to specific MCP version; abstract protocol layer |
| Scope creep into V2 features | V1 never ships | PM signoff gates scope; out-of-scope list is explicit |
| Framework detection false positives | Wrong scanner runs, garbage output | Auto-detect with manual override (`--framework`) |
