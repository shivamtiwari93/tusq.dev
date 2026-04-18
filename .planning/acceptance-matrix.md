# Acceptance Matrix — tusq.dev v0.1.0

| Req # | Requirement | Acceptance criteria | Test status | Last tested | Status |
|-------|-------------|---------------------|-------------|-------------|--------|
| REQ-001 | `tusq help` prints command list and exits 0 | stdout contains all 6 commands; exit code 0 | PASS | 2026-04-18 | PASS |
| REQ-002 | `tusq version` prints version and exits 0 | stdout is `0.1.0\n`; exit code 0 | PASS | 2026-04-18 | PASS |
| REQ-003 | Unknown command exits 1 with usage | exit code 1; stdout contains "Unknown command" | PASS | 2026-04-18 | PASS |
| REQ-004 | Invalid flag prints command usage and exits 1 | exit code 1; stdout contains "Usage: tusq scan" | PASS | 2026-04-18 | PASS |
| REQ-005 | `tusq init` creates tusq.config.json | file exists after init; idempotent on re-run | PASS | 2026-04-18 | PASS |
| REQ-006 | `tusq scan` without init exits 1 with message | "No tusq config found" message; exit code 1 | PASS | 2026-04-18 | PASS |
| REQ-007 | `tusq scan` detects Express routes | route_count ≥ 2; framework = express | PASS | 2026-04-18 | PASS |
| REQ-008 | `tusq scan` detects Fastify routes | scan completes exit 0; framework = fastify | PASS | 2026-04-18 | PASS |
| REQ-009 | `tusq scan` detects NestJS routes | scan completes exit 0; framework = nestjs | PASS | 2026-04-18 | PASS |
| REQ-010 | `tusq manifest` requires prior scan | "No scan data found" message; exit code 1 | PASS | 2026-04-18 | PASS |
| REQ-011 | `tusq manifest` generates tusq.manifest.json | file created with capabilities array | PASS | 2026-04-18 | PASS |
| REQ-012 | Approval persists across manifest regeneration | approved=true survives re-run of manifest | PASS | 2026-04-18 (smoke) | PASS |
| REQ-013 | `tusq compile --dry-run` exits 0 without writing files | exit code 0; no tusq-tools/ dir created | PASS | 2026-04-18 (smoke) | PASS |
| REQ-014 | `tusq compile` produces tool definition files | tusq-tools/ directory created | PASS | 2026-04-18 (smoke) | PASS |
| REQ-015 | `tusq review` requires manifest | "No manifest found" message; exit code 1 | PASS | 2026-04-18 | PASS |
| REQ-016 | `tusq review` prints capability summary | exit code 0 after manifest exists | PASS | 2026-04-18 (smoke) | PASS |
| REQ-017 | `tusq serve` starts MCP HTTP server | "server listening" on stdout; responds to RPC | PASS | 2026-04-18 (smoke) | PASS |
| REQ-018 | MCP `tools/list` returns capability array | result.tools is non-empty array | PASS | 2026-04-18 (smoke) | PASS |
| REQ-019 | MCP `tools/call` returns schema | result.schema present | PASS | 2026-04-18 (smoke) | PASS |
| REQ-020 | SIGINT shuts down serve cleanly | exit code 0 after SIGINT | PASS | 2026-04-18 (smoke) | PASS |
| REQ-021 | All commands accept `--verbose` flag | no error on --verbose; extra output produced | PASS | 2026-04-18 (smoke) | PASS |
| REQ-022 | Per-command `--help` prints usage | exit code 0; usage line for each sub-command | PASS | 2026-04-18 | PASS |

## Checklist

- [x] Command help audited for every user-facing command (init, scan, manifest, compile, serve, review, version, help)
- [x] Invocation path checked: `node bin/tusq.js` works from repo root
- [x] Failure-mode UX reviewed for invalid flags and missing inputs (REQ-003, REQ-004, REQ-006, REQ-010, REQ-015)
- [x] Full smoke test suite executed and passed (`node tests/smoke.mjs` → exit 0)
- [x] Framework coverage verified: Express, Fastify, NestJS all scanned successfully
