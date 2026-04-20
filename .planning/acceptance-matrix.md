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
| REQ-023 | `website/` reflects the migrated live homepage from `websites/` | Docusaurus homepage preserves the legacy hero, three-card explanation band, workflow steps, and V1 surface grid in `website/src/pages/index.tsx` | PASS | 2026-04-19 | PASS |
| REQ-024 | Docusaurus preserves the legacy site's not-found recovery behavior and styling cues | `website/src/pages/404.tsx`, `website/src/pages/index.module.css`, and `website/src/css/custom.css` retain the warm gradient, Fraunces/Space Grotesk typography, paper-card styling, and a path back to home | PASS | 2026-04-19 | PASS |
| REQ-025 | Implementation notes explicitly record website consolidation and gate-unblocking changes | `.planning/IMPLEMENTATION_NOTES.md` contains a literal `## Changes` heading and states that `website/` is canonical while `websites/` is legacy-only cleanup residue | PASS | 2026-04-19 | PASS |
| REQ-026 | Scan output carries provenance back to source (file + line) for each discovered capability | Each route in `.tusq/scan.json` contains `provenance.file` and `provenance.line` fields pointing to the originating source file | PASS | 2026-04-19 | PASS |
| REQ-027 | Manifest preserves capability provenance from scan | Each capability in `tusq.manifest.json` retains `provenance.file` and `provenance.line` from the originating scan | PASS | 2026-04-19 | PASS |
| REQ-028 | Compiled tool definitions carry provenance to the canonical artifact | Each `tusq-tools/<name>.json` file includes `provenance.file` and `provenance.line` linking the tool back to its source route declaration | PASS | 2026-04-19 | PASS |
| REQ-029 | Post-v0.1.0 roadmap page exists and explicitly marks items as non-shipped | `website/docs/roadmap.md` exists, sidebar_position is 8, and file contains the literal string "None of the items below are shipped behavior in `v0.1.0`" | PASS | 2026-04-19 | PASS |
| REQ-030 | Manifest format doc exists, is sidebar-wired, and accurately documents V1 schema limitations | `website/docs/manifest-format.md` exists at sidebar_position 3, is listed in `website/sidebars.ts` items, and contains `## V1 schema limitations` section with the conservative schema shape | PASS | 2026-04-19 | PASS |
| REQ-031 | `sensitivity_class` field is emitted at every pipeline stage and defaults to `unknown` in V1 | `tusq.manifest.json` capabilities each have `sensitivity_class: "unknown"`; compiled `tusq-tools/*.json` files include `sensitivity_class: "unknown"`; MCP `tools/list` and `tools/call` responses include `sensitivity_class: "unknown"`; `website/docs/manifest-format.md` documents all 5 levels and V1 default | PASS | 2026-04-19 | PASS |
| REQ-032 | `auth_hints` field is emitted at every pipeline stage and MCP runtime responses include it as an array | `tusq.manifest.json` capabilities each have `auth_hints` (string[]); compiled `tusq-tools/*.json` files include `auth_hints`; MCP `tools/list` response includes `auth_hints` as an array; MCP `tools/call` response includes `auth_hints` as an array; smoke tests assert `Array.isArray(auth_hints)` for both MCP methods; `website/docs/mcp-server.md` lists `auth_hints` in governance metadata | PASS | 2026-04-20 | PASS |
| REQ-033 | `examples` and `constraints` fields are emitted at manifest, compiled tools, and MCP `tools/call` stages (not scan or `tools/list` — by design per SYSTEM_SPEC) | `tusq.manifest.json` capabilities each have `examples[]` (default describe-only placeholder) and `constraints` object with 5 null/empty defaults; compiled `tusq-tools/*.json` include both fields propagated from manifest; MCP `tools/call` response includes both fields; smoke tests assert default examples/constraints on manifest, assert custom examples/constraints survive manifest→compile propagation and manifest→tools/call propagation; `website/docs/manifest-format.md` documents both fields with V1 limitations; SYSTEM_SPEC.md lines 564-571 explicitly omit `examples` from `tools/list` and scan — confirmed intentional | PASS | 2026-04-19 | PASS |

## Checklist

- [x] Command help audited for every user-facing command (init, scan, manifest, compile, serve, review, version, help)
- [x] Invocation path checked: `node bin/tusq.js` works from repo root
- [x] Failure-mode UX reviewed for invalid flags and missing inputs (REQ-003, REQ-004, REQ-006, REQ-010, REQ-015)
- [x] Full smoke test suite executed and passed (`node tests/smoke.mjs` → exit 0) — re-verified on attempt 2 against post-checkpoint HEAD
- [x] Framework coverage verified: Express, Fastify, and NestJS all scanned successfully (local describe-only MCP endpoint verified via `tusq serve` smoke tests)
- [x] Live-site consolidation explicitly covered in QA evidence: direct file inspection confirms the legacy `websites/` hero structure, recovery path, and styling cues now live in `website/`, and REQ-023 through REQ-025 record canonical `website/` ownership
- [x] Acceptance contract explicitly closed: `website/` is the canonical website surface, `.planning/IMPLEMENTATION_NOTES.md` includes a literal `## Changes` heading, and no ship decision depends on `websites/` remaining active
- [x] Vision goal "capabilities with provenance back to source" verified: scan.json, tusq.manifest.json, and tusq-tools/*.json all carry `provenance.{file,line}` tracing each capability to its originating source declaration (REQ-026 through REQ-028)
- [x] Human approval package reviewed for market-facing truthfulness: `.planning/*` and `website/` launch copy stay anchored to the defendable v0.1.0 surface and do not treat broader README roadmap items as shipped scope
- [x] Off-site launch metadata aligned: `website/docusaurus.config.ts` now uses a tusq-specific social share card so social previews no longer undercut the v0.1.0 launch framing with default Docusaurus branding
- [x] Post-v0.1.0 roadmap page added with explicit non-shipped boundary statement (REQ-029); roadmap is wired into `Help` group in `website/sidebars.ts` and linked from homepage CTA
- [x] Manifest format doc added (REQ-030): `website/docs/manifest-format.md` accurately documents all V1 capability fields, the conservative schema shape, and the approval flow; wired in sidebars.ts Reference group at position 3 with no conflicts
- [x] `sensitivity_class` field verified end-to-end (REQ-031): `classifySensitivity()` and `normalizeSensitivityClass()` implemented in `src/cli.js`; field present in manifest, compiled tools, MCP `tools/list`, and MCP `tools/call`; all four smoke-test assertions pass (`node tests/smoke.mjs` → exit 0); documented with 5 levels and V1-always-unknown note in `website/docs/manifest-format.md`
- [x] `auth_hints` field verified end-to-end (REQ-032): `inferAuthHints()` and `dedupe()` implemented in `src/cli.js`; field present at all 4 pipeline stages (scan.json, tusq.manifest.json, tusq-tools/*.json, MCP runtime); two new smoke-test assertions check `Array.isArray(auth_hints)` on both `tools/list` and `tools/call` responses (`node tests/smoke.mjs` → exit 0); `website/docs/mcp-server.md` updated to list `auth_hints` alongside `side_effect_class` and `sensitivity_class` in governance metadata
- [x] `examples` and `constraints` fields verified end-to-end (REQ-033): `normalizeExamples()`, `defaultExamples()`, `normalizeConstraints()`, and `defaultConstraints()` implemented in `src/cli.js`; fields present at manifest, tusq-tools/*.json, and MCP `tools/call` stages per SYSTEM_SPEC design (scan and `tools/list` intentionally omit them — SYSTEM_SPEC.md lines 564-571 confirm this); smoke tests cover default values on manifest and custom-value propagation through compile and `tools/call` (`node tests/smoke.mjs` → exit 0); `website/docs/manifest-format.md` documents both fields with V1 limitations
