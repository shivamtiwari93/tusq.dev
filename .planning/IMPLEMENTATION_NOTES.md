# Implementation Notes — tusq.dev

## Changes

- Challenged prior attempt as incomplete for this baseline: it did not account for post-dispatch operator drift (`agentxchain.json` runtime path fix and HUMAN_TASKS updates), so this attempt re-validated against current HEAD before verification.
- Challenged prior command-surface compliance: `--verbose` was documented for all commands but only accepted on `init` and `scan`.
- Implemented V1 Node CLI scaffold with executable `tusq` binary and commands:
  - `init`, `scan`, `manifest`, `compile`, `serve`, `review`, `version`, `help`
- Implemented framework detection for Express, Fastify, NestJS from `package.json` dependencies.
- Implemented recursive static scanner that writes `.tusq/scan.json` and extracts route metadata with provenance:
  - Express route patterns (`app/router.<method>`)
  - Fastify route patterns (`fastify.<method>`, `fastify.route({ ... })`)
  - NestJS controller/decorator patterns (`@Controller`, `@Get/@Post/...`, `@UseGuards`)
- Implemented route-level inference outputs:
  - auth hints
  - schema hint presence
  - confidence score
  - domain grouping
  - side-effect classification support for manifest generation
- Implemented manifest generation (`tusq manifest`) with:
  - explicit scan prerequisite (`No scan data found. Run \`tusq scan\` first.`)
  - canonical capability fields per V1 spec
  - approval merge behavior preserving existing `approved` decisions
  - `review_needed` when confidence `< 0.8`
- Implemented tool compilation (`tusq compile`) with:
  - compile-only approved capabilities
  - `--dry-run` preview mode
  - tool JSON outputs in `tusq-tools/`
- Implemented describe-only local server (`tusq serve`) with:
  - port support via `--port`
  - JSON-RPC style `tools/list` and `tools/call`
  - schema/description/example return for `tools/call`
  - SIGINT clean shutdown
  - port-in-use handling
- Implemented review flow (`tusq review`) with domain-grouped stdout summary and JSON mode.
- Added command-level argument wrapper so invalid flag usage prints command help text before exiting.
- Extended `--verbose` flag acceptance to `manifest`, `compile`, `serve`, and `review` to match planned surface.
- Added fixture projects and automated smoke test harness covering init/scan/manifest/compile/review/serve and error-path checks.
- Expanded smoke tests with invalid-flag help assertion and verbose-flag coverage across commands.

## Verification

- Ran end-to-end smoke verification:
  - `node tests/smoke.mjs`
- Ran focused invalid-flag behavior check:
  - `node bin/tusq.js scan --bad-flag`
- Coverage in smoke run includes:
  - help/version command behavior
  - unknown command failure contract
  - invalid flag contract with command help text
  - missing-config failure for `scan`
  - `init` idempotency
  - Express scan JSON output and route count
  - manifest generation + approval persistence path
  - compile dry-run + real compile
  - review summary path
  - verbose flag acceptance for `scan`, `manifest`, `compile`, and `review`
  - Fastify and NestJS scan paths
  - live `serve` startup + `tools/list` + `tools/call` + SIGINT shutdown

## Unresolved Follow-ups

- Scanner is currently heuristic regex/decorator parsing, not full AST analysis with rich type extraction.
- MCP endpoint is describe-only by design for V1; live API proxy execution remains deferred to V1.1.
- Schema inference currently returns conservative object schemas; richer type-to-JSON-schema conversion is future work.
