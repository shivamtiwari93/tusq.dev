# Site Surface — tusq.dev Docs & Website Platform

> Re-affirmed on 2026-04-26 in run_24ccd92f593d8647 (turn_5f551e9f95cc3829, PM attempt 1) at HEAD `e524f7b`. This turn re-anchors PM participation in this gate artifact for the current run, refreshing the stale `non_progress_signature` recorded in `.agentxchain/state.json`. The § M30 Product CLI Surface section (chartered in turn_fa7dbb75b01943f5, commit da8a75e) is unchanged: the 13 → 14 noun growth (`surface` inserted alphabetically between `serve` and `redaction`), the two-row command table (`tusq surface` enumerator and `tusq surface plan`), the four-flag table (`--surface`, `--manifest`, `--out`, `--json`), the closed four-value `surface` and six-value `gated_reason` enum table, the per-surface eligibility precedence table, the per-surface gate set listing, the plan-shape JSON field table, the frozen `brand_inputs_required` named-list table, the default-preservation table for the 13 unchanged commands, the ten-row failure UX table, and the sixteen-row local-only invariants table all remain in place verbatim. M30 ships `surface` as the 14th CLI noun under V1.11 — planned work, not shipped. Baseline re-verified before this edit: `npm test` exits 0 with 20 scenarios on HEAD `e524f7b`; the currently-shipped 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly. No source code was modified by this PM turn.

> Re-affirmed on 2026-04-26 in run_d69cb0392607d170 (turn_641188dc0c4b7616, PM attempt 1) at HEAD `5e1feae`. The 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly. The optional `--sensitivity <class>` filter on the existing `tusq review` command (M28, V1.9) and the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command (M29, V1.10) remain mutually compatible via AND-style intersection — both are reviewer-aid filters that do not modify exit-code semantics or hide unapproved capabilities. M28 was incorrectly re-charterable from this run's intake intent (intent_1777180727050_1210) because the ROADMAP M28 checkboxes were stale-unchecked despite the milestone being shipped at V1.9; this PM turn flips the checkboxes to reflect verified shipped state and emits no surface changes. The compile-surface-invariant AND serve-surface-invariant for `auth_requirements` (M29) and the AC-9 compile/approve/serve invariants for `sensitivity_class` (M28) both hold: neither field appears in compiled tool definitions emitted by `tusq compile` to `tools/*.json`, and neither appears in any `tusq serve` MCP response shape (`tools/list`, `tools/call`, `dry_run_plan`). No source code was modified by this PM turn.

> Re-affirmed on 2026-04-25 in run_8fe3b8b418dc589c (turn_5d368031b5a8881a, PM attempt 2) at HEAD `1943326`. The § M29 Product CLI Surface below carries the closed seven-value `auth_scheme` enum, the closed five-value `evidence_source` enum, the frozen six-rule decision table, the manifest output shape, the failure UX (unrecognized `--auth-scheme` value exits 1 with empty stdout before any output), and the local-only invariants — all chartered in the prior run (commit 66cec85, turn_480dc289e36bfeba) and re-anchored in turn_018f55250ec41d6d. This turn re-anchors that content for the current child run so the planning_signoff gate observes in-run PM participation. The 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly; the only operator-visible surface added by M29 remains the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command (mutually compatible with M28's `--sensitivity <class>` via AND-style intersection — no new noun, no new subcommand, no environment-variable gate). The compile-surface-invariant AND serve-surface-invariant both hold: `auth_requirements` MUST NOT appear as a top-level key in any compiled tool definition emitted by `tusq compile` to `tools/*.json`, AND MUST NOT appear in any `tusq serve` MCP response shape (`tools/list`, `tools/call`, `dry_run_plan`). No source code was modified by this PM turn.

> Re-affirmed on 2026-04-25 in run_44a179ccf81697c3 (turn_018f55250ec41d6d, PM attempt 4) at HEAD `5600a0d`. The § M29 Product CLI Surface below was authored in the prior run (commit 66cec85, turn_480dc289e36bfeba) and carries the closed seven-value `auth_scheme` enum, the closed five-value `evidence_source` enum, the frozen six-rule decision table, the manifest output shape, the failure UX (unrecognized `--auth-scheme` value exits 1 with empty stdout before any output), and the local-only invariants. This turn re-anchors that content for the current run and codifies an explicit compile-surface-invariant alongside the existing serve-surface-invariant: `auth_requirements` MUST NOT appear as a top-level key in any compiled tool definition emitted by `tusq compile` to `tools/*.json`, AND MUST NOT appear in any `tusq serve` MCP response shape (`tools/list`, `tools/call`, `dry_run_plan`). The 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly; the only operator-visible surface added by M29 is the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command (mutually compatible with M28's `--sensitivity <class>` via AND-style intersection). No source code was modified by this PM turn.

## M16 Product CLI Surface

M16 adds the first active diff command on top of the manifest version fields already specified in SYSTEM_SPEC.md. REQ-039 through REQ-044 passed on 2026-04-21.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq diff` | Compare manifest versions and surface capability changes | Diff computed successfully and no requested gate failed |
| `tusq diff --from old.json --to new.json` | Compare two explicit manifest files | Added, removed, changed, and unchanged counts were computed |
| `tusq diff --json --from old.json --to new.json` | Emit machine-readable structured diff output | stdout is parseable JSON matching SYSTEM_SPEC.md |
| `tusq diff --review-queue --from old.json --to new.json` | Print capabilities requiring review after a manifest change | Review queue was computed from added, changed, unapproved, and review-needed capabilities |
| `tusq diff --fail-on-unapproved-changes --from old.json --to new.json` | CI gate for changed capabilities that lack approval | All added or changed capabilities are approved and no gate failed |
| `tusq approve <capability-name>` | Approve one manifest capability with reviewer audit metadata | Capability exists and was approved in the manifest |
| `tusq approve --all` | Approve all unapproved or review-needed manifest capabilities intentionally | All selected capabilities were approved in the manifest |

### `tusq approve` Options

| Option | Description | Default |
|--------|-------------|---------|
| `[capability-name]` | Name of one capability to approve | Required unless `--all` is set |
| `--all` | Approve every unapproved or review-needed capability | Disabled |
| `--reviewer <id>` | Reviewer identity written to `approved_by` | `TUSQ_REVIEWER`, `USER`, or `LOGNAME` |
| `--manifest <path>` | Manifest file to update | `tusq.manifest.json` |
| `--dry-run` | Print selected approvals without writing | Disabled |
| `--json` | Print structured approval output | Human-readable summary |

### `tusq approve` Failure UX

| Failure | User sees |
|---------|-----------|
| Missing target | Message asking for a capability name or `--all` |
| Name and `--all` together | Message explaining that only one selection mode can be used |
| Missing manifest | Message asking the user to run `tusq manifest` first |
| Unknown capability | `Capability not found:` followed by the requested name |

### `tusq diff` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--from <path>` | Previous manifest path | Locally resolvable predecessor when unambiguous; otherwise required for deterministic comparisons |
| `--to <path>` | Current manifest path | `tusq.manifest.json` |
| `--json` | Print structured JSON only | Human-readable summary |
| `--review-queue` | Include capabilities requiring human review | Omitted |
| `--fail-on-unapproved-changes` | Exit 1 if added or changed capabilities are unapproved | Disabled |

### `tusq diff` Failure UX

| Failure | User sees |
|---------|-----------|
| Missing `--from` predecessor | Message explaining that no predecessor manifest could be resolved and asking for `--from <path>` |
| Missing or invalid manifest path | File path plus "manifest not found" or parse error |
| Invalid manifest shape | Missing required root/capability fields listed by name |
| Unapproved change gate failure | `Review gate failed:` followed by capability names requiring approval |

## M20 Product CLI Surface

M20 extends the `tusq serve` command with an opt-in `--policy` flag that activates dry-run argument validation for MCP `tools/call`. No live execution is added. Describe-only stays the default when `--policy` is absent.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq serve` | MCP describe-only server (V1 default, unchanged) | Server bound and accepted describe-only responses |
| `tusq serve --policy <path>` | MCP server with opt-in execution policy loaded | Server bound, policy file validated, policy mode active |

### `tusq serve` Options (M20)

| Option | Description | Default |
|--------|-------------|---------|
| `--port <n>` | TCP port for the local MCP listener | `3333` |
| `--policy <path>` | Path to `.tusq/execution-policy.json`; enables dry-run mode when `mode: "dry-run"` | Unset (describe-only) |
| `--verbose` | Print policy resolution and request logs | Disabled |

### `tusq serve --policy` Failure UX

| Failure | User sees |
|---------|-----------|
| `--policy` path missing | `Policy file not found:` followed by the path provided |
| Policy file is not valid JSON | `Invalid policy JSON at:` followed by the path and parser message |
| Unsupported `schema_version` | `Unsupported policy schema_version:` followed by the value and the list of supported versions |
| Unknown `mode` | `Unknown policy mode:` followed by the value and the list of allowed modes |
| `allowed_capabilities` is not an array of strings | `Invalid allowed_capabilities in policy:` followed by the offending value |
| Policy file present but manifest missing | `Missing manifest:` directing the user to run `tusq manifest` first |

### `tools/call` Dry-Run Response (M20)

When the policy is loaded in `mode: "dry-run"` and the requested capability is approved and listed in `allowed_capabilities` (when set), `tools/call` with a `params.arguments` object returns:

| Field | Meaning |
|-------|---------|
| `executed` | Always `false` under dry-run; never evidence of a performed request |
| `policy.mode` | `"dry-run"` |
| `policy.reviewer` | Audit echo of the policy reviewer; never authz |
| `policy.approved_at` | Audit echo of the policy approval timestamp; never authz |
| `dry_run_plan.method` | HTTP method copied from the compiled tool |
| `dry_run_plan.path` | Compiled-tool path with path params substituted from validated arguments |
| `dry_run_plan.path_params` | Validated path parameter map |
| `dry_run_plan.query` | Query parameter object (empty in V1.1) |
| `dry_run_plan.body` | Validated body object or `null` |
| `dry_run_plan.headers` | Default request headers derived from the compiled tool |
| `dry_run_plan.auth_context` | `{hints, required}` derived from manifest `auth_hints` |
| `dry_run_plan.side_effect_class` | Copied from the compiled tool |
| `dry_run_plan.sensitivity_class` | Copied from the compiled tool |
| `dry_run_plan.redaction` | Copied from the compiled tool |
| `dry_run_plan.plan_hash` | SHA-256 hex of canonical `{method, path, path_params, query, body, headers}` |
| `dry_run_plan.evaluated_at` | ISO-8601 UTC timestamp |

### `tools/call` Dry-Run Failure UX (M20)

| Failure | JSON-RPC code | `data` payload |
|---------|---------------|----------------|
| Required argument missing | `-32602` | `validation_errors: [{path, reason: "required field missing"}]` |
| Argument type mismatch | `-32602` | `validation_errors: [{path, reason: "expected <type>, got <actual>"}]` |
| Unknown top-level property when schema is `additionalProperties: false` | `-32602` | `validation_errors: [{path, reason: "unknown property"}]` |
| Capability not in `allowed_capabilities` | `-32602` | `data.reason: "capability not permitted under current policy"` |
| Capability not approved | `-32602` | `data.reason: "capability not approved"` (unchanged from V1 semantics) |

## M21 Product CLI Surface

M21 adds one new local-only command, `tusq policy init`, that scaffolds a valid `.tusq/execution-policy.json` file so operators no longer hand-author the M20 policy artifact. No existing command surface is altered.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq policy init` | Write a default `.tusq/execution-policy.json` with `mode: "describe-only"` | File was written (or `--dry-run` printed content) and passes `loadAndValidatePolicy()` |
| `tusq policy init --mode dry-run` | Generate a dry-run policy instead of the describe-only default | File was written with `mode: "dry-run"` |
| `tusq policy init --allowed-capabilities a,b,c` | Generate a policy scoped to an explicit capability allow-list | File was written with `allowed_capabilities: ["a","b","c"]` |
| `tusq policy init --out custom/path.json` | Write the policy to a non-default location | File was written at the requested path |
| `tusq policy init --force` | Overwrite an existing policy file | Pre-existing file replaced; otherwise file was written |
| `tusq policy init --dry-run` | Print the would-be content to stdout without writing | Content printed; no file created |

### `tusq policy init` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--mode <describe-only\|dry-run>` | Value written to the generated `mode` field | `describe-only` |
| `--reviewer <id>` | Value written to the generated `reviewer` field | `TUSQ_REVIEWER`, then `USER`, then `LOGNAME`, then `unknown` |
| `--allowed-capabilities <name,name,...>` | Comma-separated list written to the generated `allowed_capabilities` array | Omitted (means "all approved capabilities in scope") |
| `--out <path>` | Target file path for the generated policy | `.tusq/execution-policy.json` |
| `--force` | Overwrite the target file if it already exists | Disabled |
| `--dry-run` | Print generated content to stdout; do not write the file | Disabled |
| `--json` | Emit a machine-readable confirmation object to stdout | Human-readable summary |
| `--verbose` | Echo resolved reviewer and target path to stderr | Disabled |

### `tusq policy init` Failure UX

| Failure | User sees |
|---------|-----------|
| Unknown `--mode` value | `Unknown policy mode:` followed by the offending value and the allowed list (`describe-only, dry-run`) |
| Empty or missing `--reviewer` value | `Invalid reviewer: reviewer identity cannot be empty` |
| Empty or malformed `--allowed-capabilities` | `Invalid allowed-capabilities: list cannot be empty or contain empty names` |
| Target file already exists without `--force` | `Policy file already exists:` followed by the path and `Re-run with --force to overwrite.` |
| Target path is unwritable (permission / EISDIR / ENOENT on parent that cannot be created) | `Could not write policy file:` followed by the path and the underlying errno message |
| Unknown flag | Standard CLI error `Unknown option:` followed by the flag name |

### `tusq policy init` Local-Only Invariants

| Invariant | How it shows up at the CLI |
|-----------|----------------------------|
| No network I/O | The command performs no HTTP, DB, or socket call; operators can run it with the network disabled |
| No manifest read | `tusq.manifest.json` is not opened; `--allowed-capabilities` names are accepted verbatim |
| No target-product call | No capability is executed, dry-run or otherwise; the generator never reaches the MCP server |
| Safe default mode | Default `mode` is `describe-only`; `dry-run` requires an explicit `--mode dry-run` flag |
| Validator round-trip | The generated file MUST pass `loadAndValidatePolicy()`; smoke coverage enforces this round-trip |

## M22 Product CLI Surface

M22 adds one new local-only subcommand, `tusq policy verify`, that validates an execution-policy file without starting an MCP server. It shares `loadAndValidatePolicy()` with the M20 `tusq serve --policy` startup path, so every accept/reject decision and every error message is identical across the two entry points. No existing command surface is altered; no new validation depth is added.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq policy verify` | Validate `.tusq/execution-policy.json` (pre-serve, pre-commit, or CI gate) | File passed `loadAndValidatePolicy()`; serve startup would accept this file |
| `tusq policy verify --policy <path>` | Validate a non-default policy file | File at `<path>` passed the shared validator |
| `tusq policy verify --json` | Emit structured verification output to stdout | JSON `{valid:true, path, policy}` printed; exit 0 |
| `tusq policy verify --verbose` | Echo resolved path and validator diagnostics to stderr | Human summary printed; verbose diagnostics on stderr |

### `tusq policy verify` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--policy <path>` | Path to the execution-policy file to validate | `.tusq/execution-policy.json` |
| `--json` | Emit a machine-readable result object to stdout (both success and failure cases) | Human-readable summary (stdout on success, stderr on failure) |
| `--verbose` | Echo resolved path and validator diagnostics to stderr | Disabled |

### `tusq policy verify` Failure UX (Parity with `tusq serve --policy`)

| Failure | User sees (identical across `serve --policy` and `policy verify`) |
|---------|---------|
| Policy file missing / ENOENT | `Policy file not found:` followed by the path |
| Policy file is not valid JSON | `Invalid policy JSON at:` followed by the path and parser message |
| Unsupported `schema_version` | `Unsupported policy schema_version:` followed by the value and the supported list |
| Unknown `mode` | `Unknown policy mode:` followed by the value and the allowed list (`describe-only, dry-run`) |
| `allowed_capabilities` is not an array of strings | `Invalid allowed_capabilities in policy:` followed by the offending value |

### `tusq policy verify` JSON Output Shape

| Case | stdout | exit |
|------|--------|------|
| Success | `{"valid": true, "path": "<resolved>", "policy": {"schema_version","mode","reviewer","approved_at","allowed_capabilities"}}` | `0` |
| Failure | `{"valid": false, "path": "<resolved>", "error": "<same message as non-JSON stderr output>"}` | `1` |

### `tusq policy verify` Local-Only Invariants

| Invariant | How it shows up at the CLI |
|-----------|----------------------------|
| No server startup | `tusq policy verify` never binds a TCP port; it runs synchronously and exits |
| No network I/O | No HTTP, DB, or MCP handshake; operators can run it with the network disabled |
| No manifest read | `tusq.manifest.json` is never opened; the verifier is a pure policy-file validator in V1.3 |
| No target-product call | No capability is executed, dry-run or otherwise; `policy verify` cannot reach the target product |
| Validator parity | `tusq policy verify` and `tusq serve --policy` share `loadAndValidatePolicy()`; a smoke parity fixture asserts identical exit code and error message across the two entry points for every failure case |

## M23 Product CLI Surface

M23 adds one opt-in flag (`--strict`) and one supporting flag (`--manifest <path>`) to the existing `tusq policy verify` subcommand. Under `--strict`, the verifier additionally reads `tusq.manifest.json` and cross-references every name in the policy's `allowed_capabilities` array against the manifest's approval-gated set (existence + `approved: true` + absence of `review_needed: true`). Default behavior (no `--strict`) is byte-for-byte identical to M22 — no manifest I/O, no new failure modes, no change in output. No existing command surface is altered; no new subcommand is introduced.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq policy verify --strict` | Validate policy file AND cross-check `allowed_capabilities` against approved capabilities in `tusq.manifest.json` | Policy passed `loadAndValidatePolicy()` AND every allowed name exists in the manifest, is `approved: true`, and is not `review_needed: true` |
| `tusq policy verify --strict --manifest <path>` | Same as above but consulting a non-default manifest path | Same invariants evaluated against the manifest at `<path>` |
| `tusq policy verify --strict --json` | Emit extended machine-readable verification output under strict mode | JSON `{valid:true, strict:true, path, manifest_path, manifest_version, policy, approved_allowed_capabilities}` printed; exit 0 |
| `tusq policy verify --strict --verbose` | Echo resolved policy + manifest paths and diagnostics to stderr | Human summary printed; verbose diagnostics on stderr |

### `tusq policy verify --strict` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--policy <path>` | Path to the execution-policy file to validate | `.tusq/execution-policy.json` |
| `--strict` | Activate manifest-aware cross-reference on top of the M22 policy-file validation | Disabled (default is M22 behavior) |
| `--manifest <path>` | Path to the manifest consulted under `--strict`; supplying `--manifest` without `--strict` exits 1 before any file is read | `tusq.manifest.json` |
| `--json` | Emit a machine-readable result object to stdout (extended under `--strict`, including `strict_errors` on failure) | Human-readable summary |
| `--verbose` | Echo resolved policy path, manifest path, and diagnostics to stderr | Disabled |

### `tusq policy verify --strict` Failure UX

Strict-mode failure messages are distinct from M22 messages because strict checks are a new governance boundary that `tusq serve --policy` does NOT enforce. The M22 parity contract is preserved: an M22-level rejection still emits the M22 message byte-for-byte whether `--strict` is set or not. Strict-specific failures are emitted ONLY when the M22 validator accepts the policy and `--strict` is set.

| Failure | User sees |
|---------|-----------|
| `--manifest` supplied without `--strict` | `--manifest requires --strict` |
| `--strict` set but manifest file missing | `Manifest not found:` followed by the resolved manifest path |
| `--strict` set but manifest file unreadable | `Could not read manifest file:` followed by the path and the OS error message |
| `--strict` set but manifest is not valid JSON | `Invalid manifest JSON at:` followed by the path and parser message |
| `--strict` set but manifest has no `capabilities` array | `Invalid manifest shape at:` followed by the path and `: missing capabilities array` |
| Strict: allowed capability not in manifest | `Strict policy verify failed: allowed capability not found in manifest:` followed by the name |
| Strict: allowed capability present but `approved: false` | `Strict policy verify failed: allowed capability not approved:` followed by the name |
| Strict: allowed capability present and approved but `review_needed: true` | `Strict policy verify failed: allowed capability requires review:` followed by the name |

Multiple strict failures produce one message line per offending name in the order names appear in `allowed_capabilities`.

### `tusq policy verify --strict` JSON Output Shape

| Case | stdout | exit |
|------|--------|------|
| Success | `{"valid": true, "strict": true, "path": "<policy>", "manifest_path": "<manifest>", "manifest_version": <int>, "policy": {...}, "approved_allowed_capabilities": <int\|null>}` | `0` |
| Strict-check failure | `{"valid": false, "strict": true, "path": "<policy>", "manifest_path": "<manifest>", "error": "<first failure message>", "strict_errors": [{"name":"<name>","reason":"not_in_manifest\|not_approved\|requires_review"}, ...]}` | `1` |
| M22-level failure under `--strict` | `{"valid": false, "strict": true, "path": "<policy>", "manifest_path": null, "error": "<M22 message>", "strict_errors": []}` | `1` |
| `--manifest` without `--strict` | No JSON read/write attempted; exit 1 with `--manifest requires --strict` on stderr | `1` |

### `tusq policy verify --strict` Local-Only Invariants

| Invariant | How it shows up at the CLI |
|-----------|----------------------------|
| Opt-in only | Default `tusq policy verify` (no `--strict`) NEVER reads `tusq.manifest.json` even when it exists at the default path; a smoke test asserts this |
| Bounded reads | Exactly two files are read under `--strict`: the policy file and the manifest file. No scan file, no compiled tools, no `.git/`, no git lookups, no external includes |
| No server startup | `tusq policy verify --strict` never binds a TCP port; it runs synchronously and exits |
| No network I/O | No HTTP, DB, or MCP handshake; operators can run it with the network disabled |
| No target-product call | No capability is executed, dry-run or otherwise; strict verify cannot reach the target product |
| No manifest mutation | The manifest is read-only under `--strict`; no approval is recorded, no field is mutated, no `capability_digest` is re-computed |
| Alignment statement, not safety gate | A strict PASS proves policy/manifest alignment at verify time only — NOT runtime reachability, NOT manifest freshness, NOT execution safety |
| M22 parity preserved | M22 rejection messages are byte-identical whether `--strict` is set or not; `tusq serve --policy` is unchanged |

## M24 Product CLI Surface

M24 introduces NO new CLI command, NO new flag, and NO new subcommand. The operator-visible surface change is entirely in the shape of the generated `tusq.manifest.json` (and the downstream `tusq-tools/*.json` and MCP `tools/list` that inherit from it) for Fastify routes that declare a literal `schema.body` block. The scanner extends `extractFastifyRoutes` to capture declared field shapes into `input_schema.properties` and flip `additionalProperties` to `false`. All other extractor paths (Express, NestJS, Fastify-without-schema, Fastify-with-non-literal-schema) produce byte-identical manifests pre- and post-M24.

| Commands exercised | How M24 surfaces |
|--------------------|------------------|
| `tusq scan <path>` | The in-memory `scan.routes[i]` record carries a new `schema_fields` field when a Fastify route matches the literal-schema pattern; persisted `.tusq/scan.json` inherits the already-populated `input_schema` shape (no new top-level key) |
| `tusq manifest` | For Fastify routes with extracted schema fields, `capability.input_schema.properties` is populated with declared field names in source-literal order, `input_schema.required` carries declared names, `input_schema.additionalProperties` is `false`, and `input_schema.source` is `fastify_schema_body` |
| `tusq compile` | Compiled tool `parameters` inherits the populated `input_schema` shape; agents see real field names |
| `tusq serve` | MCP `tools/list` / `tools/call` inherit the populated shape; agents receive correct field names in `tools/list` responses |
| `tusq diff` | An M24-driven change in `input_schema` flips the per-capability `capability_digest` (M13); the diff review queue surfaces the change for explicit re-approval |

### Manifest Output Shape Under M24

| Capability situation | `input_schema` shape (post-M24) |
|----------------------|-------------------------------|
| Fastify route with literal `schema.body` block, top-level properties and required | `{ type: "object", properties: {<name>: {type: <string\|number\|integer\|boolean\|object\|array>}, ...}, required: [<names>], additionalProperties: false, source: "fastify_schema_body" }` |
| Fastify route with `schema` that does not parse as literal object (e.g., `schema: sharedSchema`) | Byte-identical to HEAD `35b7c9c` — M15 fall-back with `source: "framework_schema_hint"` |
| Fastify route with `schema` present but no `body` key | Byte-identical to HEAD `35b7c9c` |
| Fastify route with no `schema:` | Byte-identical to HEAD `35b7c9c` |
| Express route (any form) | Byte-identical to HEAD `35b7c9c` |
| NestJS route (any form) | Byte-identical to HEAD `35b7c9c` |

### Confidence Score Extension

| Route situation | Score bump from M24 |
|-----------------|---------------------|
| Fastify route with `schema_fields` captured | +0.04 on top of existing `schema_hint` +0.14 (capped at 0.95) |
| Fastify route with `schema_hint: true` only (literal extraction failed) | No M24 change — existing +0.14 |
| Any other route | No M24 change |

### Source Metadata Tag

| `input_schema.source` | When emitted |
|-----------------------|--------------|
| `fastify_schema_body` | M24 literal extraction succeeded; fields are what the source declares |
| `framework_schema_hint` | Only `schema_hint` boolean detected; fields not declared in manifest |
| `request_body` | Heuristic-only shape (no framework schema keyword detected) |

### Failure UX

M24 extraction either succeeds completely or produces no `schema_fields` at all. There is no operator-visible failure path — a malformed or non-literal Fastify schema does not cause `tusq scan` or `tusq manifest` to exit non-zero; the route silently falls back to M15 behavior. Reviewers distinguish the two outcomes by inspecting `input_schema.source` in the generated manifest.

| Situation | Operator sees |
|-----------|---------------|
| Fastify literal `schema.body` parsed successfully | `input_schema.source: "fastify_schema_body"` with populated `properties` |
| Fastify `schema` present but not a literal object | `input_schema.source: "framework_schema_hint"` with empty `properties` (same as pre-M24) |
| No Fastify `schema` keyword | `input_schema.source: "request_body"` (same as pre-M24) |

### M24 Local-Only Invariants

| Invariant | How it shows up at the scanner |
|-----------|--------------------------------|
| Static-only extraction | No `require('fastify')`, no `eval`, no `new Function`, no `ts-node`; regex + balanced-brace matching only |
| Zero new dependencies | `package.json` MUST NOT gain `ajv`, `fastify`, `@sinclair/typebox`, or any validator runtime in V1.5 |
| Graceful degradation | Any parse ambiguity drops the entire `schema_fields` record; partial extraction is forbidden |
| Deterministic output | Property key order is source-literal (declaration order); repeated `tusq scan` + `tusq manifest` runs produce byte-identical manifests |
| Non-Fastify fixtures untouched | Express and NestJS fixtures produce byte-identical manifests before and after M24 (a smoke test asserts this invariant) |
| Path param authority preserved | When a Fastify body field name collides with a path parameter, the path parameter wins in `input_schema.properties` |
| Source-literal framing | Manifest `input_schema.source: "fastify_schema_body"` tags the shape as "what the source declares," not "what the runtime enforces"; docs do not use "validator-backed" framing |

## M25 Product CLI Surface

M25 introduces NO new CLI command, NO new flag, and NO new subcommand. The operator-visible surface change is entirely in the shape of the generated `tusq.manifest.json` (and the downstream `tusq-tools/*.json` and MCP `tools/call` responses that inherit from it) for capabilities whose `input_schema.properties` keys match a fixed canonical set of well-known PII field names. The manifest generator adds a single pure function (`extractPiiFieldHints`) that runs after `buildInputSchema()` and populates `capability.redaction.pii_fields` deterministically.

| Commands exercised | How M25 surfaces |
|--------------------|------------------|
| `tusq scan <path>` | No scan-artifact shape change; `.tusq/scan.json` is byte-for-byte identical to HEAD `541abcd`; M25 operates entirely during manifest generation |
| `tusq manifest` | Each `capability.redaction.pii_fields` is populated with the original-case keys of `input_schema.properties` whose normalized form matches the canonical PII set; order = iteration order of `input_schema.properties` |
| `tusq compile` | Compiled tool `redaction.pii_fields` inherits the populated array verbatim; agents see the advisory field-name hints |
| `tusq serve` | MCP `tools/call` response `redaction` inherits the populated `pii_fields`; agents receive the hints as metadata alongside every tool-call plan |
| `tusq diff` | An M25-driven change in `redaction.pii_fields` flips the per-capability `capability_digest` (M13 already hashes `redaction` into the digest); the diff review queue surfaces the change for explicit re-approval |
| `tusq approve` | Unchanged — M25 does not modify approval semantics; reviewers continue to approve via the M18 flow |
| `tusq policy verify` / `tusq policy verify --strict` | Unchanged — M22 and M23 checks are orthogonal to `redaction` content; a populated `pii_fields` does not affect either verdict |

### Manifest Output Shape Under M25

| Capability situation | `redaction.pii_fields` (post-M25) |
|----------------------|------------------------------------|
| `input_schema.properties` contains canonical PII keys (`email`, `password`, `ssn`, ...) | `[<original-case key>, ...]` in declaration order |
| `input_schema.properties` contains normalized-form matches (`user_email`, `USER_EMAIL`, `userEmail`) | `[<original-case key>, ...]` — original case preserved, normalization only affects matching |
| `input_schema.properties` contains tail-match-only keys (`email_template_id`, `phone_book_url`) | `[]` — whole-key match only |
| `input_schema.properties` is empty or absent | `[]` — byte-identical to pre-M25 |
| Capability with no `input_schema.properties` | `[]` — byte-identical to pre-M25 |
| Non-PII capabilities across any framework | `[]` — byte-identical to pre-M25 |

### Canonical PII Name Set

Enumerated in SYSTEM_SPEC § M25. The full V1.6 set is frozen in `src/cli.js`:

| Category | Normalized names |
|----------|------------------|
| Email | `email`, `emailaddress`, `useremail` |
| Phone | `phone`, `phonenumber`, `mobile`, `mobilephone`, `telephone` |
| Government ID | `ssn`, `socialsecuritynumber`, `taxid`, `nationalid` |
| Name | `firstname`, `lastname`, `fullname`, `middlename` |
| Address | `streetaddress`, `zipcode`, `postalcode` |
| Date of birth | `dateofbirth`, `dob`, `birthdate` |
| Payment | `creditcard`, `cardnumber`, `cvv`, `cvc`, `bankaccount`, `iban` |
| Secrets | `password`, `passphrase`, `apikey`, `accesstoken`, `refreshtoken`, `authtoken`, `secret` |
| Network | `ipaddress` |

### Sensitivity Class and Confidence Interactions

| Field | M25 effect |
|-------|------------|
| `capability.sensitivity_class` | Unchanged — stays `"unknown"` on every capability in V1.6; M25 does NOT auto-escalate |
| `capability.confidence` | Unchanged — M25 does NOT modify `scoreConfidence()`; PII name presence is not a confidence signal |
| `capability.redaction.log_level` | Unchanged — stays `null` in V1.6 |
| `capability.redaction.mask_in_traces` | Unchanged — stays `null` in V1.6 |
| `capability.redaction.retention_days` | Unchanged — stays `null` in V1.6 |
| `capability.capability_digest` | Re-computed when `pii_fields` changes (M13 hashes `redaction` into the digest) |

### Failure UX

M25 extraction either succeeds (populates `pii_fields`) or produces no match at all (`pii_fields: []`). There is no operator-visible failure path — M25 cannot cause `tusq manifest` to exit non-zero. Reviewers distinguish the two outcomes by inspecting `redaction.pii_fields` in the generated manifest.

| Situation | Operator sees |
|-----------|---------------|
| At least one `input_schema.properties` key matches the canonical set | `redaction.pii_fields: [<matches>]` in declaration order |
| No keys match | `redaction.pii_fields: []` (same as pre-M25) |
| `input_schema.properties` empty or absent | `redaction.pii_fields: []` (same as pre-M25) |

### M25 Local-Only Invariants

| Invariant | How it shows up at manifest generation |
|-----------|-----------------------------------------|
| Static-only extraction | Pure function over in-memory `input_schema.properties` object; no `fs.readFile`, no `require`, no `eval`, no `new Function` |
| Zero new dependencies | `package.json` MUST NOT gain `pii-detector`, `presidio`, `compromise`, or any NLP/PII library in V1.6 |
| Whole-key match only | A field named `email_template_id` MUST NOT be flagged as `email`; normalization strips `_`/`-` and lowercases the key, then compares against the frozen set |
| Deterministic output | `pii_fields` order equals iteration order of `input_schema.properties`; repeated `tusq scan` + `tusq manifest` runs produce byte-identical arrays |
| Non-PII capabilities untouched | Capabilities whose `input_schema.properties` has no canonical match produce `pii_fields: []` (byte-identical to HEAD `541abcd`) |
| No `sensitivity_class` auto-escalation | `sensitivity_class` remains `"unknown"` on every capability; M25 does not imply sensitivity |
| Source-literal framing | `redaction.pii_fields` is a field-name hint, NOT a runtime PII detection claim; docs do not use "PII-validated" or "compliant" framing (SYSTEM_SPEC Constraint 16) |

## M26 Product CLI Surface

M26 introduces NO new CLI command, NO new flag, and NO new subcommand. The operator-visible surface change is additive manifest metadata: every generated capability gains `capability.redaction.pii_categories`, a deterministic array parallel to the M25 `redaction.pii_fields` array. The array labels each matched PII field name with one frozen category key and leaves retention/log/trace defaults unset.

| Commands exercised | How M26 surfaces |
|--------------------|------------------|
| `tusq scan <path>` | No scan-artifact shape change; M26 operates during manifest generation over M25's already-emitted `pii_fields` array |
| `tusq manifest` | Populates `capability.redaction.pii_categories`; order and length match `redaction.pii_fields`; empty `pii_fields` produces `pii_categories: []` |
| `tusq compile` | Compiled tool metadata inherits `redaction.pii_categories` verbatim alongside `pii_fields` |
| `tusq serve` | MCP `tools/call` metadata includes `pii_categories` as advisory source-literal category labels; no runtime filtering or retention enforcement is added |
| `tusq diff` | First post-M26 scan flips `capability_digest` because `redaction` shape changes; reviewers must re-approve affected capabilities under M13 semantics |
| `tusq approve` | Unchanged; M26 does not auto-approve or bypass review |
| `tusq policy verify` / `tusq policy verify --strict` | Unchanged; strict verification remains approval-alignment based and does not inspect category content |

### Manifest Output Shape Under M26

| Capability situation | `redaction.pii_fields` | `redaction.pii_categories` |
|----------------------|-------------------------|-----------------------------|
| Fields `email`, `password` | `["email", "password"]` | `["email", "secrets"]` |
| Fields `user_email`, `ssn`, `credit_card` | `["user_email", "ssn", "credit_card"]` | `["email", "government_id", "payment"]` |
| No canonical PII field-name match | `[]` | `[]` |

### M26 Category Keys

The V1.7 category vocabulary is frozen and maps one-to-one from the M25 canonical name set: `email`, `phone`, `government_id`, `name`, `address`, `date_of_birth`, `payment`, `secrets`, and `network`.

### M26 Default Preservation

| Field | M26 effect |
|-------|------------|
| `capability.sensitivity_class` | Unchanged — stays `"unknown"`; category labels are not sensitivity inference |
| `capability.confidence` | Unchanged — category labels do not modify `scoreConfidence()` |
| `capability.redaction.log_level` | Unchanged — remains existing default `"full"` unless explicitly edited |
| `capability.redaction.mask_in_traces` | Unchanged — remains existing default `false` unless explicitly edited |
| `capability.redaction.retention_days` | Unchanged — remains `null`; organizational policy owns retention defaults |
| `capability.capability_digest` | Re-computed on first post-M26 scan because `redaction.pii_categories` is added |

### M26 Failure UX

M26 has one defensive failure path: if a `pii_fields` entry has no matching category in the frozen lookup, `tusq manifest` fails synchronously before writing a manifest. That indicates implementation drift between `PII_CANONICAL_NAMES` and `PII_CATEGORY_BY_NAME`; operators should treat it as a bug, not a policy decision.

| Situation | Operator sees |
|-----------|---------------|
| Every `pii_fields` entry maps to a category | `redaction.pii_categories` emitted in matching order |
| `pii_fields` is empty | `redaction.pii_categories: []` |
| A `pii_fields` entry lacks a category mapping | Manifest generation exits non-zero with a mapping-drift error |

### M26 Local-Only Invariants

| Invariant | How it shows up at manifest generation |
|-----------|-----------------------------------------|
| Static-only extraction | Pure function over `redaction.pii_fields`; no source re-scan, no value inspection |
| Zero new dependencies | `package.json` MUST NOT gain any PII, retention, NLP, or compliance library |
| Deterministic output | `pii_categories` order equals `pii_fields` order; repeated runs produce byte-identical arrays |
| No retention overclaim | `retention_days`, `log_level`, and `mask_in_traces` are not auto-populated from categories; existing defaults remain `null`, `"full"`, and `false` respectively |
| No sensitivity auto-escalation | `sensitivity_class` remains `"unknown"` on every capability |
| Source-literal framing | `pii_categories` labels M25 field-name matches; it is NOT runtime PII validation or retention-policy enforcement |

## M27 Product CLI Surface

M27 introduces exactly one new CLI noun, `redaction`, with exactly one subcommand, `review`. The shipped tusq CLI surface grows from 12 nouns (init, scan, manifest, compile, serve, review, docs, approve, diff, version, help, policy) to 13 nouns; the total entry-point count grows from 14 (counting `policy init` and `policy verify` separately) to 15 (adding `redaction review`). M27 mutates no existing command's observable behavior.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq redaction` | Enumerates `redaction` subcommands (prints `review`) | Successful subcommand listing |
| `tusq redaction review` | Emits a deterministic per-capability reviewer report aggregating M25 `pii_fields`, M26 `pii_categories`, and a frozen per-category advisory | The manifest was read successfully and the report was written to stdout |

### M27 Flags And Options

| Flag | Default | Effect |
|------|---------|--------|
| `--manifest <path>` | `tusq.manifest.json` (cwd) | Manifest file to read; file must exist and parse as JSON with a top-level `capabilities` array |
| `--capability <name>` | unset | Filter the report to a single capability by exact name; partial matches are NOT allowed |
| `--json` | unset | Emit machine-readable JSON instead of the human-readable report; same content-determinism guarantees apply |

There are no other flags. `tusq redaction review --help` prints the flag surface, exit codes, and the explicit "reviewer aid, not a runtime enforcement gate" callout.

### M27 Report Shape (JSON)

| Field | Source | Notes |
|-------|--------|-------|
| `manifest_path` | `--manifest` or default | Resolved input path |
| `manifest_version` | copied from manifest | Not re-stamped |
| `generated_at` | copied from manifest | Not re-stamped; keeps report content-deterministic |
| `capabilities[]` | manifest `capabilities` array order | One entry per capability (unless filtered) |
| `capabilities[].name` | manifest | Exact capability name |
| `capabilities[].approved` | manifest | Echoed verbatim (no M27 mutation) |
| `capabilities[].sensitivity_class` | manifest | Echoed verbatim; always `"unknown"` under V1.8 |
| `capabilities[].pii_fields` | manifest `redaction.pii_fields` | Echoed verbatim |
| `capabilities[].pii_categories` | manifest `redaction.pii_categories` | Echoed verbatim (same length and order as `pii_fields`) |
| `capabilities[].advisories[]` | frozen lookup | One entry per distinct category in category-appearance order |
| `capabilities[].advisories[].category` | frozen M26 category key | One of the nine V1.7 categories |
| `capabilities[].advisories[].text` | `PII_REVIEW_ADVISORY_BY_CATEGORY` | Frozen V1.8 wording; changes are material governance events |

### M27 Frozen Advisory Set (V1.8)

| Category | Advisory text (frozen V1.8; changes are material governance events) |
|----------|----------------------------------------------------------------------|
| `email` | `Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.` |
| `phone` | `Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.` |
| `government_id` | `High-sensitivity government-ID field detected — reviewer: apply your org's strictest retention, logging, and trace-redaction defaults.` |
| `name` | `Personal-name field detected — reviewer: decide whether the field should be logged in plaintext, masked, or redacted; retention follows your org's contact-data policy.` |
| `address` | `Physical-address field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.` |
| `date_of_birth` | `Date-of-birth field detected — reviewer: apply age-sensitive retention and redaction defaults; some jurisdictions treat DOB as higher-risk PII.` |
| `payment` | `Payment-data field detected — reviewer: apply your org's payment-data retention, logging, and masking rules (e.g., PCI-aligned defaults owned by your team).` |
| `secrets` | `Secret or credential field detected — reviewer: this field SHOULD NOT be logged in plaintext; apply trace redaction and minimal retention at your org's standard.` |
| `network` | `Network-identifier field detected — reviewer: choose retention and masking aligned with your org's logging policy; some jurisdictions treat IP addresses as PII.` |

### M27 Default Preservation

| Field / Command | M27 effect |
|-----------------|------------|
| `tusq.manifest.json` | Unchanged — mtime and content are byte-identical before/after any review run |
| `capability.redaction.retention_days` | Unchanged — stays `null` unless a reviewer hand-edits it |
| `capability.redaction.log_level` | Unchanged — stays `"full"` unless a reviewer hand-edits it |
| `capability.redaction.mask_in_traces` | Unchanged — stays `false` unless a reviewer hand-edits it |
| `capability.sensitivity_class` | Unchanged — stays `"unknown"`; advisory categories are not sensitivity inference |
| `capability.capability_digest` | Unchanged — M27 performs zero writes, so no first-run digest flip |
| `tusq scan` / `tusq manifest` / `tusq compile` / `tusq serve` / `tusq approve` / `tusq diff` / `tusq docs` / `tusq version` | Unchanged |
| `tusq policy init` / `tusq policy verify` (default) / `tusq policy verify --strict` | Unchanged — advisory content is never a strict input |

### M27 Failure UX

| Situation | Operator sees | Exit code |
|-----------|---------------|-----------|
| Manifest read successfully, capabilities enumerated | Per-capability report on stdout | 0 |
| Manifest read successfully, `capabilities: []` (empty array — valid scaffold state) | Single line `No capabilities in manifest — nothing to review.` on stdout in human mode; `{manifest_path, manifest_version, generated_at, capabilities: []}` on stdout in `--json` mode | 0 |
| `--manifest` points to a missing file | `Manifest not found: <path>` on stderr; stdout is empty | 1 |
| Manifest is present but not valid JSON | `Invalid manifest JSON: <path>` on stderr; stdout is empty (no partial report) | 1 |
| Manifest is valid JSON but lacks a top-level `capabilities` array (or it is non-array) | `Invalid manifest: missing capabilities array` on stderr; stdout is empty | 1 |
| `--capability <name>` specifies a name not present in the manifest | `Capability not found: <name>` on stderr; stdout is empty | 1 |
| Unknown subcommand under `tusq redaction` | `Unknown subcommand: <name>` on stderr; stdout is empty | 1 |
| Unknown flag on `tusq redaction review` | `Unknown flag: <flag>` on stderr; stdout is empty | 1 |

**Stream discipline:** Every exit-1 row above has `stdout === ""`. Operators who pipe stdout to a file get a zero-byte file on failure. Error text is written to stderr only. Detection-before-output means no partial JSON or human section is written before an error surfaces. The empty-capabilities case (row 2) is deliberately exit 0 — a fresh `tusq init` repo with no routes yet is a valid scaffold state, not a hard failure.

### M27 Local-Only Invariants

| Invariant | How it shows up at review time |
|-----------|---------------------------------|
| Read-only | `tusq.manifest.json` is never opened for writing; mtime and content are byte-identical before/after any invocation |
| No network I/O | No HTTP, DB, socket, or DNS lookup; no `fetch`/`http.request`/`net.connect` call path reachable from the subcommand |
| Zero new dependencies | `package.json` MUST NOT gain any PII, compliance, retention, NLP, or table-rendering library |
| Deterministic output | Running twice on the same manifest produces byte-identical stdout in both human and `--json` modes; no wall-clock field inside per-capability entries |
| Frozen advisory set | `PII_REVIEW_ADVISORY_BY_CATEGORY` wording is locked by a smoke fixture; any wording change is a material governance event that MUST land under its own ROADMAP milestone |
| Advisory byte-exactness | Every advisory uses the em-dash character U+2014, not ASCII hyphen-minus U+002D or en-dash U+2013; stdout is UTF-8; smoke fixture locks the exact byte sequence at merge time |
| No scan re-run | The subcommand never calls the scanner or re-reads `src/` |
| No capability execution | The subcommand never calls a compiled tool or starts the MCP server |
| Reviewer-directive advisory text | Every advisory ends with "reviewer: ..." so the output explicitly reminds the operator the decision is theirs; no advisory claims the capability is compliant or runtime-safe |

## M28 Product CLI Surface

M28 introduces NO new CLI noun and NO new subcommand. The 13-noun CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly. The only operator-visible surface change is one optional filter flag on the existing `tusq review` command (`--sensitivity <class>`) plus an additive manifest field (`capability.sensitivity_class`) that surfaces in `tusq review`, `tusq docs`, and `tusq diff` output. M28 mutates the observable behavior of `tusq manifest` (it now emits a computed `sensitivity_class` instead of constant `"unknown"`) and the per-capability rendering of `tusq review`, `tusq docs`, and `tusq diff` (they now display the field) but introduces no new entry point.

| Command | M28 surface change |
|---------|--------------------|
| `tusq manifest` | Each capability gains a computed `sensitivity_class` field via `classifySensitivity(cap)` |
| `tusq review [--sensitivity <class>]` | New optional filter flag; output displays `sensitivity_class` per capability |
| `tusq docs` | Per-capability section displays `sensitivity_class` |
| `tusq diff` | Sensitivity changes surface as review-required entries (via the existing M13 capability_digest flip) |
| `tusq compile` | Unchanged — output is byte-identical regardless of `sensitivity_class` value |
| `tusq approve` | Unchanged — gate logic depends only on `approved` / `review_needed` fields |
| `tusq serve` | Unchanged — MCP tool list is unaffected by `sensitivity_class` |
| `tusq policy init` / `tusq policy verify` (default and `--strict`) | Unchanged — `sensitivity_class` is never a policy input |
| `tusq redaction review` | Unchanged stdout/stderr behavior; the existing field echo continues to copy the manifest's `sensitivity_class` value verbatim (now a computed value instead of constant `"unknown"`) |

### M28 Flags And Options

| Flag | Default | Effect |
|------|---------|--------|
| `--sensitivity <class>` (on `tusq review` only) | unset | Filter the review output to capabilities whose `sensitivity_class` matches; `<class>` MUST be one of `public`, `internal`, `confidential`, `restricted`, `unknown`; an unknown filter value exits 1 with `Unknown sensitivity class: <value>` on stderr before any output |

The filter is advisory-only: it does NOT change the exit-code semantics of `tusq review` (exit 0 still means no blocking concerns; exit 1 still means unapproved or low-confidence capabilities were found — the filter does not hide those). Operators remain responsible for reviewing all capabilities regardless of sensitivity label.

### M28 Closed Enum

| Value | Assigned by | Meaning |
|-------|-------------|---------|
| `public` | R6 default | Evidence is present and no stronger rule matched |
| `internal` | R5 | `auth_required === true` OR write-set verb without PII/financial signal |
| `confidential` | R3 or R4 | Non-empty `redaction.pii_categories` (R3) or write verb + financial route/param (R4) |
| `restricted` | R1 or R2 | `preserve === true` (R1) or admin/destructive verb / admin-namespaced route (R2) |
| `unknown` | zero-evidence guard | No verb, no route, no params, no redaction, no preserve flag, no `auth_required` |

The five values are the entire legal set. No other value, nullable, or wildcard is permitted in `capability.sensitivity_class`.

### M28 Frozen Decision Table (Six Rules, First-Match-Wins)

| Rule | Condition | Assigned class |
|------|-----------|----------------|
| R1 | `capability.preserve === true` | `restricted` |
| R2 | `capability.verb` in `{delete, drop, truncate, admin, destroy, purge, wipe}` OR route segment matches `^(admin|root|superuser)(/|$)` | `restricted` |
| R3 | `capability.redaction.pii_categories` is non-empty | `confidential` |
| R4 | `capability.verb` in `{create, update, write, post, put, patch}` AND (route OR any param key) matches `/payment|invoice|charge|billing|ssn|tax|account_number/i` | `confidential` |
| R5 | `capability.auth_required === true` OR (verb in write set AND no PII/financial signal) | `internal` |
| R6 | (no prior rule matched, evidence present) | `public` |

Rule precedence is fixed: R1 beats all others; R2 beats R3; R3 beats R4; earlier rules always win. The frozen rule table is enumerated verbatim in SYSTEM_SPEC § M28 and codified in Constraint 21; any rule change is a material governance event requiring its own ROADMAP milestone.

### M28 Manifest Output Shape

| Field | M28 effect |
|-------|------------|
| `capability.sensitivity_class` | Computed by `classifySensitivity(cap)` on every manifest generation; closed five-value enum |
| `capability.capability_digest` | Re-computed because `sensitivity_class` is now a content field; flips on first post-M28 manifest regeneration for every capability that previously had `"unknown"` and now receives a computed value |
| `capability.approved` | Resets to `false` on digest flip per existing M13 semantics; reviewers re-attest before promotion |
| All other capability fields | Unchanged |

### M28 Default Preservation

| Field / Command | M28 effect |
|-----------------|------------|
| `tusq compile` output | Byte-identical regardless of `sensitivity_class` value (AC-9 invariant) |
| `tusq approve` gate | Unchanged — depends only on `approved` and `review_needed` |
| `tusq serve` MCP surface | Unchanged — tool-list filter is `approved: true` AND `review_needed: false` |
| `tusq policy verify` (default and `--strict`) | Unchanged — `sensitivity_class` is never a policy input |
| `tusq redaction review` output | Unchanged stdout/stderr discipline; field echo follows the manifest |
| 13-command CLI surface | Preserved exactly — no new top-level noun, no new subcommand |
| Empty-stdout invariant | All exit-1 paths continue to write empty stdout with stderr-only error text |
| Em-dash U+2014 invariant | Preserved in any new help text or error messages introduced by M28 |

### M28 Failure UX

| Situation | Operator sees | Exit code |
|-----------|---------------|-----------|
| `tusq review --sensitivity <legal-value>` matches at least one capability | Filtered review output on stdout | 0 (when no blocking concerns remain) |
| `tusq review --sensitivity <legal-value>` matches zero capabilities | Empty review section on stdout | 0 |
| `tusq review --sensitivity <illegal-value>` | `Unknown sensitivity class: <value>` on stderr; stdout is empty; legal values list is part of the error message | 1 |
| `--sensitivity` provided without a value | `--sensitivity requires a value` on stderr; stdout is empty | 1 |

**Stream discipline:** Every exit-1 row above has `stdout === ""`. Operators who pipe stdout to a file get a zero-byte file on failure. Error text is written to stderr only.

### M28 Local-Only Invariants

| Invariant | How it shows up at review time |
|-----------|---------------------------------|
| Pure function | `classifySensitivity` has no I/O, no network, no clock, no filesystem reads beyond the manifest record |
| Deterministic | Same manifest record → same `sensitivity_class`; byte-stable across Node.js processes and platforms |
| Closed enum | No value outside `{public, internal, confidential, restricted, unknown}` may be emitted |
| Zero-evidence unknown | Capabilities with no verb, no route, no params, no redaction, no preserve, no auth_required MUST receive `"unknown"` (never silently `"public"`) |
| Zero new dependencies | `package.json` MUST NOT gain any classification, ML, compliance, or sensitivity-inference library |
| Compile-output-invariant | `tusq compile` output is byte-identical for two manifests differing only in `sensitivity_class`; golden-file smoke assertion enforces this at merge time |
| Frozen rule table | The six-rule first-match-wins table is locked by SYSTEM_SPEC § M28, Constraint 21, and the eval regression scenarios; any rule change is a material governance event requiring its own ROADMAP milestone |
| Reviewer-aid framing | `sensitivity_class` MUST NOT be presented as runtime PII enforcement, automated compliance certification, or GDPR/HIPAA/PCI/SOC2 attestation in any docs, marketing, CLI output, or eval scenario |

## M29 Product CLI Surface

M29 introduces NO new CLI noun and NO new subcommand. The 13-noun CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly. The only operator-visible surface change is one optional filter flag on the existing `tusq review` command (`--auth-scheme <scheme>`) plus an additive structured manifest field (`capability.auth_requirements`) that surfaces in `tusq review`, `tusq docs`, and `tusq diff` output. M29 mutates the observable behavior of `tusq manifest` (it now emits a computed `auth_requirements` record on every capability) and the per-capability rendering of `tusq review`, `tusq docs`, and `tusq diff` (they now display the field) but introduces no new entry point.

| Command | M29 surface change |
|---------|--------------------|
| `tusq manifest` | Each capability gains a computed `auth_requirements` record via `classifyAuthRequirements(cap)` |
| `tusq review [--auth-scheme <scheme>]` | New optional filter flag (mutually compatible with `--sensitivity`); output displays `auth_requirements` per capability |
| `tusq docs` | Per-capability section displays `auth_requirements` |
| `tusq diff` | Auth-requirements changes surface as review-required entries (via the existing M13 `capability_digest` flip) |
| `tusq compile` | Unchanged — output is byte-identical regardless of `auth_requirements` value |
| `tusq approve` | Unchanged — gate logic depends only on `approved` / `review_needed` fields |
| `tusq serve` | Unchanged — `tools/list`, `tools/call`, `dry_run_plan` response shapes do NOT include `auth_requirements` |
| `tusq policy init` / `tusq policy verify` (default and `--strict`) | Unchanged — `auth_requirements` is never a policy input |
| `tusq redaction review` | Unchanged — stdout/stderr discipline preserved byte-for-byte |

### M29 Flags And Options

| Flag | Default | Effect |
|------|---------|--------|
| `--auth-scheme <scheme>` (on `tusq review` only) | unset | Filter the review output to capabilities whose `auth_requirements.auth_scheme` matches; `<scheme>` MUST be one of `bearer`, `api_key`, `session`, `basic`, `oauth`, `none`, `unknown`; an unknown filter value exits 1 with `Unknown auth scheme: <value>` on stderr before any output |
| `--auth-scheme` + `--sensitivity` | both unset | When both are supplied, results are filtered AND-style (a capability must match both filters); mutual compatibility is asserted in the smoke suite |

The filter is advisory-only: it does NOT change the exit-code semantics of `tusq review` (exit 0 still means no blocking concerns; exit 1 still means unapproved or low-confidence capabilities were found — the filter does not hide those). Operators remain responsible for reviewing all capabilities regardless of `auth_scheme` label.

### M29 Closed `auth_scheme` Enum (Seven Values)

| Value | Assigned by | Meaning |
|-------|-------------|---------|
| `bearer` | R1 | Middleware-name matches `/bearer\|jwt\|access[_-]?token/i` |
| `api_key` | R2 | Middleware-name matches `/api[_-]?key\|x-api-key/i` |
| `session` | R3 | Middleware-name matches `/session\|cookie\|passport-local/i` |
| `basic` | R4 | Middleware-name matches `/basic[_-]?auth/i` |
| `oauth` | R5 | Middleware-name matches `/oauth\|oidc\|openid/i` |
| `none` | R6 | `auth_required === false` AND non-admin route prefix |
| `unknown` | zero-evidence guard or default | No middleware, no route, no `auth_required`, no `sensitivity_class` signal — OR evidence present but no rule matched |

The seven values are the entire legal set. No other value, nullable, or wildcard is permitted in `auth_requirements.auth_scheme`.

### M29 Closed `evidence_source` Enum (Five Values)

| Value | Meaning |
|-------|---------|
| `middleware_name` | Classification driven by R1–R5 middleware-name regex match |
| `route_prefix` | Classification driven by route segment evidence |
| `auth_required_flag` | Classification driven by R6 `auth_required === false` path |
| `sensitivity_class_propagation` | Classification informed by `sensitivity_class` (admin/restricted route gating) |
| `none` | Zero-evidence guard fired; record is `unknown` with empty arrays |

### M29 Frozen Decision Table (Six Rules, First-Match-Wins)

| Rule | Condition | Assigned `auth_scheme` |
|------|-----------|------------------------|
| R1 | Any middleware_name matches `/bearer\|jwt\|access[_-]?token/i` | `bearer` |
| R2 | Any middleware_name matches `/api[_-]?key\|x-api-key/i` | `api_key` |
| R3 | Any middleware_name matches `/session\|cookie\|passport-local/i` | `session` |
| R4 | Any middleware_name matches `/basic[_-]?auth/i` | `basic` |
| R5 | Any middleware_name matches `/oauth\|oidc\|openid/i` | `oauth` |
| R6 | `auth_required === false` AND no admin/restricted route prefix | `none` |
| default | (no prior rule matched) | `unknown` |

Rule precedence is fixed: R1 beats all others; earlier rules always win. The frozen rule table is enumerated verbatim in SYSTEM_SPEC § M29 and codified in Constraint 22; any rule change is a material governance event requiring its own ROADMAP milestone.

### M29 Frozen Scope/Role Extraction Rules

| Rule | Pattern | Behavior |
|------|---------|----------|
| Scopes | `/scopes?:\s*\[([^\]]+)\]/` over middleware-annotation literals | Preserved declaration order; case-sensitive dedup; `[]` on zero matches |
| Roles | `/role[s]?:\s*\[([^\]]+)\]/` over middleware-annotation literals | Preserved declaration order; case-sensitive dedup; `[]` on zero matches |

The extractor reads ONLY already-built capability record fields. No regex over arbitrary source files. No filesystem reads beyond what manifest generation performs.

### M29 Manifest Output Shape

| Field | M29 effect |
|-------|------------|
| `capability.auth_requirements` | Computed by `classifyAuthRequirements(cap)` on every manifest generation; closed-shape record `{ auth_scheme, auth_scopes, auth_roles, evidence_source }` |
| `capability.auth_requirements.auth_scheme` | Closed seven-value enum `{bearer, api_key, session, basic, oauth, none, unknown}` |
| `capability.auth_requirements.auth_scopes` | `string[]`, order-preserved, case-sensitively deduped, `[]` when zero matches (never `null`, never absent) |
| `capability.auth_requirements.auth_roles` | `string[]`, order-preserved, case-sensitively deduped, `[]` when zero matches (never `null`, never absent) |
| `capability.auth_requirements.evidence_source` | Closed five-value enum `{middleware_name, route_prefix, auth_required_flag, sensitivity_class_propagation, none}` |
| `capability.capability_digest` | Re-computed because `auth_requirements` is now a content field; flips on first post-M29 manifest regeneration for every capability |
| `capability.approved` | Resets to `false` on digest flip per existing M13 semantics; reviewers re-attest before promotion |
| All other capability fields | Unchanged |

### M29 Default Preservation

| Field / Command | M29 effect |
|-----------------|------------|
| `tusq compile` output | Byte-identical regardless of `auth_requirements` value (AC-7 invariant) |
| `tusq approve` gate | Unchanged — depends only on `approved` and `review_needed` |
| `tusq serve` MCP surface | Unchanged — `auth_requirements` MUST NOT appear in `tools/list`, `tools/call`, or `dry_run_plan` responses |
| `tusq policy verify` (default and `--strict`) | Unchanged — `auth_requirements` is never a policy input |
| `tusq redaction review` output | Unchanged stdout/stderr discipline; field echo follows the manifest |
| 13-command CLI surface | Preserved exactly — no new top-level noun, no new subcommand |
| Empty-stdout invariant | All exit-1 paths continue to write empty stdout with stderr-only error text |
| Em-dash U+2014 invariant | Preserved in any new help text or error messages introduced by M29 |
| `--sensitivity` filter (M28) | Unchanged; `--auth-scheme` intersects AND-style with `--sensitivity` |

### M29 Failure UX

| Situation | Operator sees | Exit code |
|-----------|---------------|-----------|
| `tusq review --auth-scheme <legal-value>` matches at least one capability | Filtered review output on stdout | 0 (when no blocking concerns remain) |
| `tusq review --auth-scheme <legal-value>` matches zero capabilities | Empty review section on stdout | 0 |
| `tusq review --auth-scheme <illegal-value>` | `Unknown auth scheme: <value>` on stderr; stdout is empty; legal values list is part of the error message | 1 |
| `--auth-scheme` provided without a value | `--auth-scheme requires a value` on stderr; stdout is empty | 1 |
| `tusq review --auth-scheme bearer --sensitivity restricted` | Filtered review output, intersection AND-style; both filters validated independently | 0 (when no blocking concerns) / 1 (legal-value validation failure on either) |

**Stream discipline:** Every exit-1 row above has `stdout === ""`. Operators who pipe stdout to a file get a zero-byte file on failure. Error text is written to stderr only.

### M29 Local-Only Invariants

| Invariant | How it shows up at review time |
|-----------|---------------------------------|
| Pure function | `classifyAuthRequirements` has no I/O, no network, no clock, no filesystem reads beyond the manifest record |
| Deterministic | Same manifest record → same `auth_requirements`; byte-stable across Node.js processes and platforms |
| Closed enums | No value outside the seven-value `auth_scheme` set or the five-value `evidence_source` set may be emitted |
| Empty-array invariant | `auth_scopes` and `auth_roles` MUST be `[]` (never `null`, never absent) when zero matches are found |
| Zero-evidence unknown | Capabilities with no middleware, no route, no `auth_required`, no `sensitivity_class` signal MUST receive `unknown` (never silently `"none"`) |
| Zero new dependencies | `package.json` MUST NOT gain `passport`, `jsonwebtoken`, `oauth2-server`, or any AAA library |
| Compile-output-invariant | `tusq compile` output is byte-identical for two manifests differing only in `auth_requirements`; golden-file smoke assertion enforces this at merge time |
| Serve-surface-invariant | `tusq serve` `tools/list` / `tools/call` / `dry_run_plan` response shapes do NOT include `auth_requirements`; smoke assertion enforces this |
| Frozen rule table | The six-rule first-match-wins table is locked by SYSTEM_SPEC § M29, Constraint 22, and the eval regression scenarios; any rule change is a material governance event requiring its own ROADMAP milestone |
| Frozen scope/role extraction | The two extraction regexes and the order-preserving case-sensitive dedup are locked by SYSTEM_SPEC § M29 and the eval regression scenarios |
| Reviewer-aid framing | `auth_requirements` MUST NOT be presented as runtime AAA enforcement, automated AAA certification, or OAuth/OIDC/SAML/SOC2/ISO27001 attestation in any docs, marketing, CLI output, or eval scenario |

## Primary Commands

All commands execute from the `website/` working directory.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `npm install` | Install Docusaurus and all dependencies | Dependencies resolved, `node_modules/` populated |
| `npm start` | Start local dev server with hot reload on port 3000 | Server running, site accessible at `http://localhost:3000` |
| `npm run build` | Produce static site in `website/build/` | All pages rendered, no broken links, zero errors |
| `npm run serve` | Serve the production build locally for verification | Built site accessible at `http://localhost:3000` |

### Content authoring commands

| Command | Purpose |
|---------|---------|
| Create `.md` file in `docs/` | Add a new documentation page |
| Create date-prefixed `.md` file in `blog/` | Add a new blog post |
| Edit `docusaurus.config.ts` | Modify site metadata, navbar, footer |
| Edit `sidebars.ts` | Modify docs sidebar structure |

## Flags And Options

### `npm run build`

| Option | Description | Default |
|--------|-------------|---------|
| `--locale` | Build for a specific locale | `en` (only locale in V1) |
| `--out-dir` | Override output directory | `build/` |

### `npm start`

| Option | Description | Default |
|--------|-------------|---------|
| `--port` | Dev server port | `3000` |
| `--host` | Dev server host binding | `localhost` |
| `--no-open` | Don't auto-open browser | Opens by default |

### `docusaurus.config.ts` key options

| Field | Purpose | V1 Value |
|-------|---------|----------|
| `title` | Site title in `<title>` and navbar | `tusq.dev` |
| `tagline` | Subtitle used in homepage meta | From MESSAGING.md one-liner |
| `url` | Production URL | TBD (human decision) |
| `baseUrl` | Base path | `/` |
| `onBrokenLinks` | Behavior on broken links | `throw` (fail build) |
| `onBrokenMarkdownLinks` | Behavior on broken MD links | `throw` |

## Failure UX

### Build failures

| Failure | Cause | User sees |
|---------|-------|-----------|
| Broken link | Internal link target does not exist | `npm run build` exits non-zero with error listing the broken link path and source file |
| Missing frontmatter | Doc page missing required `title` field | Build error with file path and missing field name |
| Syntax error in config | Invalid `docusaurus.config.ts` | Node.js error with stack trace pointing to config file |
| Missing dependency | `npm install` not run or failed | Module-not-found error with package name |

### Dev server failures

| Failure | Cause | User sees |
|---------|-------|-----------|
| Port conflict | Port 3000 already in use | Error message suggesting `--port` flag |
| Invalid MDX | Malformed JSX in `.md` file | Hot-reload error overlay in browser with file path and line number |

### Content failures

| Failure | Cause | User sees |
|---------|-------|-----------|
| 404 page | Unknown route | Custom 404 page with link back to homepage |
| Missing sidebar entry | Doc exists but not in `sidebars.ts` | Page accessible by direct URL but not in sidebar navigation |

## Navigation Structure

### Top Navbar

| Item | Type | Target |
|------|------|--------|
| tusq.dev | Brand/logo | Homepage (`/`) |
| Docs | Link | `/docs/getting-started` |
| Blog | Link | `/blog` |
| GitHub | External link | GitHub repository |

### Docs Sidebar

| Section | Page | Slug |
|---------|------|------|
| Getting Started | Getting Started | `/docs/getting-started` |
| Reference | CLI Reference | `/docs/cli-reference` |
| Reference | Manifest Format | `/docs/manifest-format` |
| Reference | Configuration | `/docs/configuration` |
| Guides | Supported Frameworks | `/docs/frameworks` |
| Guides | MCP Server | `/docs/mcp-server` |
| Help | FAQ | `/docs/faq` |

## Page Inventory

### Marketing Surface

| Page | Route | Content Source |
|------|-------|----------------|
| Homepage | `/` | `websites/index.html` + MESSAGING.md |
| 404 | `*` (fallback) | `websites/404.html` |

### Documentation Surface

| Page | Route | Content Source |
|------|-------|----------------|
| Getting Started | `/docs/getting-started` | SYSTEM_SPEC.md workflow + README |
| CLI Reference | `/docs/cli-reference` | command-surface.md (prior run) |
| Manifest Format | `/docs/manifest-format` | SYSTEM_SPEC.md manifest section |
| Configuration | `/docs/configuration` | SYSTEM_SPEC.md init section |
| Supported Frameworks | `/docs/frameworks` | SYSTEM_SPEC.md + MESSAGING.md |
| MCP Server | `/docs/mcp-server` | SYSTEM_SPEC.md serve section |
| FAQ | `/docs/faq` | MESSAGING.md claims/non-claims |

### Blog Surface

| Page | Route | Content Source |
|------|-------|----------------|
| Blog Index | `/blog` | Auto-generated by Docusaurus |
| Announcing tusq.dev v0.1.0 | `/blog/announcing-tusq-dev` | ANNOUNCEMENT.md |
| Release Notes: v0.1.0 | `/blog/release-notes-v0.1.0` | RELEASE_NOTES.md |

## Build Commands

| Command | Purpose | Working Dir |
|---------|---------|-------------|
| `npm install` | Install Docusaurus dependencies | `website/` |
| `npm start` | Start local dev server (port 3000) | `website/` |
| `npm run build` | Build static site to `website/build/` | `website/` |
| `npm run serve` | Serve built site locally | `website/` |

## Content Ownership

| Surface | Owner | Authority |
|---------|-------|-----------|
| Homepage copy | product_marketing | Must match MESSAGING.md product truth |
| Documentation | product_marketing | Derived from accepted SYSTEM_SPEC.md |
| Blog posts | product_marketing | Adapted from accepted launch artifacts |
| Site config/theme | dev | Technical implementation |

## Quality Gates

- **Build gate:** `npm run build` exits 0 with no broken-link warnings
- **Content gate:** Every page passes product truth audit against MESSAGING.md
- **Navigation gate:** All sidebar and navbar links resolve to existing pages

## Run-Specific Re-Affirmation — run_94746c3508844fcb / turn_6551742f923b14ee

This command-surface document is re-anchored unchanged in run `run_94746c3508844fcb` (turn `turn_6551742f923b14ee`, planning phase, attempt 1) on HEAD `782780b`. Independent verification: `node bin/tusq.js help` on HEAD 782780b enumerates exactly the 13 shipped commands — init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help — matching this surface document's M29 § "13-command CLI surface preserved exactly" invariant. The only new operator-visible surface from M29 (V1.10) is the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command (mutually compatible with M28's `--sensitivity` via AND-style intersection): no new top-level noun, no new subcommand, no environment-variable gate, no new dependency in `package.json`. The M29 manifest output shape (`auth_requirements: { auth_scheme, auth_scopes, auth_roles, evidence_source }` with closed seven-value and five-value enums, AC-4 zero-evidence `unknown` guard, frozen six-rule decision table, frozen scope/role extraction rules), the AC-7 `tusq compile` byte-identity invariant, and the stronger MCP-surface invariant (`tusq serve` `tools/list` / `tools/call` / `dry_run_plan` byte-for-byte unchanged, `auth_requirements` MUST NOT appear in any MCP response) all carry forward verbatim from the parent run chain. `npm test` exits 0 with 16 scenarios. This re-affirmation makes no surface mutation; it records this run's independent verification for audit continuity.

## Run-Specific Re-Affirmation — run_6d12fe85d0e51576 / turn_534487732e1e53b2

This command-surface document is re-anchored unchanged in run `run_6d12fe85d0e51576` (turn `turn_534487732e1e53b2`, planning phase, attempt 1) on HEAD `b7cd4b0`. Independent verification: `node bin/tusq.js help` on HEAD b7cd4b0 enumerates exactly the 13 shipped commands — init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help — matching this surface document's M29 § "13-command CLI surface preserved exactly" invariant. The only new operator-visible surface from M29 (V1.10) is the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command (mutually compatible with M28's `--sensitivity` via AND-style intersection): no new top-level noun, no new subcommand, no environment-variable gate, no new dependency in `package.json`. The M29 manifest output shape (`auth_requirements: { auth_scheme, auth_scopes, auth_roles, evidence_source }` with closed seven-value and five-value enums, AC-4 zero-evidence `unknown` guard, frozen six-rule decision table, frozen scope/role extraction rules), the AC-7 `tusq compile` byte-identity invariant, and the stronger MCP-surface invariant (`tusq serve` `tools/list` / `tools/call` / `dry_run_plan` byte-for-byte unchanged, `auth_requirements` MUST NOT appear in any MCP response) all carry forward verbatim from the parent run chain. `npm test` exits 0 with 16 scenarios. This re-affirmation makes no surface mutation; it records this run's independent verification for audit continuity.

## Run-Specific Re-Affirmation — run_2ee1a03651d5d485 / turn_2cc0b42362df3fd3

This command-surface document is re-anchored unchanged in run `run_2ee1a03651d5d485` (turn `turn_2cc0b42362df3fd3`, planning phase, attempt 1) on HEAD `a46d3cb`. Independent verification: `node bin/tusq.js help` on HEAD a46d3cb enumerates exactly the 13 shipped commands — init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help — matching this surface document's M29 § "13-command CLI surface preserved exactly" invariant. `npm test` exits 0 with 16 scenarios.

**Vision-derived charter received this turn (intent_1777171732846_289f, p2):** "[vision] The Promise: embeddable chat, widget, command-palette, and voice surfaces." The PM has materialized a charter sketch in `.planning/ROADMAP_NEXT_CANDIDATES.md` § "Vision-Derived Charter Candidate: Static Embeddable-Surface Plan Export (V2 First Step)" proposing a single new top-level noun `surface` with subcommand `plan`, frozen four-value `surface` enum (`chat`/`palette`/`widget`/`voice`), and four-flag surface (`--surface`/`--manifest`/`--out`/`--json`). If chartered, the CLI surface would grow from 13 → 14 commands; this is the first new top-level noun proposal since `redaction` (M27). PM has **explicitly flagged** that the operator should weigh `tusq plan surface` as a sub-noun under a future planning hub before binding the charter, since adding a new top-level noun every milestone would dilute the operator-facing surface discipline. This re-affirmation makes no surface mutation; it records this run's independent verification and the candidate charter for audit continuity.

## Run-Specific Re-Affirmation — run_42732dba3268a739 / turn_1e0689ffd021d2d5

This command-surface document is re-anchored unchanged in run `run_42732dba3268a739` (turn `turn_1e0689ffd021d2d5`, planning phase, attempt 1, runtime `local-pm`) on HEAD `1d3f074`. Independent verification: `node bin/tusq.js help` on HEAD 1d3f074 enumerates exactly the 13 shipped commands — init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help — matching this surface document's M29 § "13-command CLI surface preserved exactly" invariant. `npm test` exits 0 with `Smoke tests passed` and `Eval regression harness passed (16 scenarios)`.

**Vision-derived charter received this turn (intent_1777173722739_5899, p2):** "[vision] The Promise: a self-hostable runtime and MCP server." Distinct from the prior run's embeddable-surface charter; this run targets the runtime + MCP half of **The Promise**. The PM has materialized a charter sketch in `.planning/ROADMAP_NEXT_CANDIDATES.md` § "Vision-Derived Charter Candidate: MCP Server Static Descriptor Export (V2 Self-Host First Step)" for a static, deterministic, manifest-only command that captures the *describe-only* shape of `tusq serve` (which is already in this 13-command surface as the existing `serve` command — "Start describe-only local MCP endpoint") into a registry-compatible static JSON file.

**Open scope decision the operator must resolve at the planning_signoff gate (PM does NOT pre-commit to any form):** noun-vs-flag form for the new command — (A) new top-level noun `mcp` with subcommand `export` (CLI surface 13 → 14, compounding top-level surface growth alongside the prior run's proposed `surface` noun → 13 → 15 if both vision-derived charters bind in form (A)), (B) flag-only extension `tusq serve --export <path>` (CLI surface stays at 13; overloads the `serve` verb — which today only starts a server — with a non-server emit mode, which conflicts with the "verbs do one thing" surface discipline this document holds), (C) subcommand under a future `plan` hub (`tusq plan mcp` alongside the proposed `tusq plan surface`; presupposes chartering a `plan` hub first).

**PM scope-protection callout (this is the surface document's responsibility):** if the operator binds **both** vision-derived charters in form (A), the CLI surface would grow from 13 → 15 commands in two consecutive milestones. This document's M29 § established the "13-command CLI surface preserved exactly" invariant; that invariant has held across M27 (added `redaction` as the first new noun since the original 12-command surface — 12 → 13), M28 (no new noun, only `--sensitivity` filter on existing `tusq review`), and M29 (no new noun, only `--auth-scheme` filter on existing `tusq review`). Adding **two** new top-level nouns in two consecutive milestones would break the cadence the surface discipline has held since M28. The operator should weigh form (B) or form (C) for at least one of the two charters before binding both as form (A). PM does NOT pre-commit to any resolution; the operator decides at the planning_signoff gate.

**This re-affirmation makes no surface mutation.** The charter sketch is intentionally housed in the candidate backlog (not in this document) because binding it requires human approval at the planning_signoff gate. The 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) remains intact on HEAD 1d3f074. Both vision-derived candidates coexist in `ROADMAP_NEXT_CANDIDATES.md` as mutually-independent operator-decision-pending items — neither presupposes the other.

## M30 Product CLI Surface

> **PM scope binding (run_24ccd92f593d8647, turn_fa7dbb75b01943f5, planning phase):** This § materializes the M30 CLI surface contract at PM scope level. The dev role is accountable for the implementation-level surface details (help-text byte sequence, exit-code constants, smoke fixtures) during the implementation phase per the M27/M28/M29 precedent.

M30 introduces exactly one new top-level CLI noun, `surface`, with exactly one subcommand, `plan`. The shipped tusq CLI surface grows from 13 nouns (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) to **14 nouns** (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, surface, version, help); the total entry-point count grows by one (`tusq surface plan`). The new noun `surface` is inserted alphabetically between `serve` and `redaction` in the help enumeration so the help block remains stably ordered. M30 mutates no existing command's observable behavior.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq surface` | Enumerates `surface` subcommands (prints `plan`) | Successful subcommand listing |
| `tusq surface plan` | Emits a deterministic per-surface plan describing what each embeddable surface (chat, palette, widget, voice) **would** look like for the current manifest under current sensitivity/auth/side-effect posture | The manifest was read successfully and the plan was written to stdout (or to `--out <path>` if supplied) |

### M30 Flags And Options

| Flag | Default | Effect |
|------|---------|--------|
| `--surface <chat\|palette\|widget\|voice\|all>` | `all` | Restrict output to one surface, or emit all four; `all` produces sections in the frozen order chat → palette → widget → voice |
| `--manifest <path>` | `tusq.manifest.json` (cwd) | Manifest file to read; file must exist and parse as JSON with a top-level `capabilities` array |
| `--out <path>` | unset | Write the plan output to `<path>` instead of stdout; on success, stdout is empty; the path MUST NOT resolve inside `.tusq/` |
| `--json` | unset | Emit machine-readable JSON instead of the human-readable plan; same content-determinism guarantees apply |

There are no other flags. `tusq surface plan --help` prints the flag surface, the closed four-value `surface` enum (plus `all`), the closed six-value `gated_reason` enum, exit codes, and the explicit "This is a planning aid, not a runtime surface generator" callout.

### M30 Closed Enums

| Enum | Values |
|------|--------|
| `surface` (frozen four-value) | `chat`, `palette`, `widget`, `voice` |
| `gated_reason` (frozen six-value) | `unapproved`, `restricted_sensitivity`, `confidential_sensitivity`, `destructive_side_effect`, `auth_scheme_unknown`, `auth_scheme_oauth_pending_v2` |

Both enums are immutable once M30 ships. Adding a value (e.g., `email` or `slack-bot` to `surface`; a new gating reason) is a material governance event under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry. An implementation-time error (synchronous throw) MUST fire if `classifyGating(capability, surface)` ever returns a value outside the closed `gated_reason` set.

### M30 Per-Surface Eligibility Precedence (First-Match-Wins)

| Order | Gate | `gated_reason` on failure |
|-------|------|---------------------------|
| 1 | `capability.approved === true` | `unapproved` |
| 2 | `capability.sensitivity_class !== "restricted"` (chat / palette / voice; widget exception) | `restricted_sensitivity` |
| 3 | `capability.sensitivity_class !== "confidential"` (chat / palette / voice; widget exception) | `confidential_sensitivity` |
| 4 | side-effect class allowance (palette and voice forbid destructive) | `destructive_side_effect` |
| 5 | `capability.auth_requirements.auth_scheme !== "unknown"` (all surfaces) | `auth_scheme_unknown` |
| 6 | `capability.auth_requirements.auth_scheme !== "oauth"` (all surfaces; deferred to V2) | `auth_scheme_oauth_pending_v2` |

Per-surface gate set: chat (1, 2, 3, 5, 6 — destructive verbs allowed); palette (1, 2, 3, 4, 5, 6 — lowest-risk surface); widget (1, 5, 6 — confidential/restricted permitted under same-session proxy semantics; split by side-effect class into `action_widgets`/`insight_widgets`); voice (1, 2, 3, 4, 5, 6 — destructive flows reserved for V2 confirmation milestone).

### M30 Plan Shape (JSON)

| Field | Source | Notes |
|-------|--------|-------|
| `manifest_path` | `--manifest` or default | Resolved input path |
| `manifest_version` | copied from manifest | Not re-stamped (M27 fallback applies) |
| `generated_at` | copied from manifest | Not re-stamped; keeps plan content-deterministic |
| `surfaces[]` | enum-driven; frozen order chat → palette → widget → voice | Empty array when `capabilities: []` |
| `surfaces[].surface` | one of `chat`/`palette`/`widget`/`voice` | Closed four-value enum |
| `surfaces[].eligible_capabilities[]` | manifest declared order | Capability names; gates 1+per-surface pass |
| `surfaces[].gated_capabilities[]` | manifest declared order | `{name, reason}` objects with closed-enum reason |
| `surfaces[].entry_points` | per-surface keyed object | Derived from M9 domain + verb data |
| `surfaces[].redaction_posture` | per eligible capability | Copy-forward of M27 advisory set verbatim |
| `surfaces[].auth_posture` | per eligible capability | Copy-forward of M29 `auth_requirements` verbatim |
| `surfaces[].brand_inputs_required[]` | frozen named-list per surface | Names only; no values; no template strings |

### M30 Frozen `brand_inputs_required` Named-Lists (V1.11)

| Surface | `brand_inputs_required[]` (frozen names; no values) |
|---------|-----------------------------------------------------|
| `chat` | `["brand.tone", "brand.color_primary", "brand.color_secondary", "brand.font_family"]` |
| `palette` | `["brand.color_primary", "brand.font_family"]` |
| `widget` | `["brand.color_primary", "brand.color_accent", "brand.layout_density", "brand.radius"]` |
| `voice` | `["brand.tone", "voice.persona", "voice.greeting"]` |

The lists are immutable once M30 ships; any addition is a material governance event under its own ROADMAP milestone.

### M30 Default Preservation

| Field / Command | M30 effect |
|-----------------|------------|
| `tusq.manifest.json` | Unchanged — mtime and content are byte-identical before/after any plan run |
| `capability.capability_digest` | Unchanged — M30 performs zero writes to manifest, so no digest flip |
| `tusq scan` / `tusq manifest` / `tusq compile` / `tusq serve` / `tusq approve` / `tusq diff` / `tusq docs` / `tusq version` / `tusq help` | Unchanged |
| `tusq policy init` / `tusq policy verify` (default and `--strict`) | Unchanged |
| `tusq review` / `tusq redaction review` | Unchanged |

### M30 Failure UX

| Situation | Operator sees | Exit code |
|-----------|---------------|-----------|
| Plan succeeded | Per-surface plan on stdout (or written to `--out` path with empty stdout) | 0 |
| Empty-capabilities (`capabilities: []`, valid scaffold state) | Single line `No capabilities in manifest — nothing to plan.` on stdout in human mode; `{manifest_path, manifest_version, generated_at, surfaces: []}` on stdout in `--json` mode | 0 |
| `--manifest` points to a missing file | `Manifest not found: <path>` on stderr; stdout empty | 1 |
| Manifest is present but not valid JSON | `Invalid manifest JSON: <path>` on stderr; stdout empty | 1 |
| Manifest is valid JSON but lacks a top-level `capabilities` array (or it is non-array) | `Invalid manifest: missing capabilities array` on stderr; stdout empty | 1 |
| `--surface <value>` is not in the closed five-token set | `Unknown surface: <value>` on stderr; stdout empty | 1 |
| Unknown subcommand under `tusq surface` | `Unknown subcommand: <name>` on stderr; stdout empty | 1 |
| Unknown flag on `tusq surface plan` | `Unknown flag: <flag>` on stderr; stdout empty | 1 |
| `--out <path>` is unwritable | `Cannot write to --out path: <path>` on stderr; stdout empty | 1 |
| `--out <path>` resolves inside `.tusq/` | `--out path must not be inside .tusq/` on stderr; stdout empty | 1 |

**Stream discipline:** Every exit-1 row above has `stdout === ""`. Operators who pipe stdout to a file get a zero-byte file on failure. Detection-before-output means no partial JSON or human section is written before an error surfaces. The empty-capabilities case (row 2) is deliberately exit 0 — a fresh `tusq init` repo with no routes yet is a valid scaffold state, not a hard failure.

### M30 Local-Only Invariants

| Invariant | How it shows up at plan time |
|-----------|-------------------------------|
| Read-only manifest | `tusq.manifest.json` is never opened for writing; mtime and content byte-identical before/after any invocation |
| No `.tusq/` write | `tusq surface plan` MUST NOT create or modify any file under `.tusq/`; `--out` rejects any path resolving inside `.tusq/` |
| No network I/O | No HTTP, DB, socket, or DNS lookup; no `fetch`/`http.request`/`net.connect` reachable from the subcommand |
| Zero new dependencies | `package.json` MUST NOT gain React, Vue, Lit, Web Speech polyfill, audio runtime, markdown renderer, or any chat/widget/voice/palette UI library |
| Zero `capability_digest` flips | Hash-before vs hash-after assertion is byte-identical on every capability |
| `tusq compile` byte-identity | Golden-file smoke assertion confirms compile output is byte-identical pre and post-M30 |
| `tusq serve` MCP surface byte-identity | `tools/list`, `tools/call`, `dry_run_plan` byte-for-byte unchanged; surface-plan fields MUST NOT appear in any MCP response |
| Deterministic output | Running twice on the same manifest produces byte-identical stdout in both human and `--json` modes; iteration order is fixed (surface enum chat → palette → widget → voice; capabilities in manifest declared order); no wall-clock fields inside per-surface entries |
| Frozen four-value `surface` enum | Locked by smoke fixture; any addition is a material governance event |
| Frozen six-value `gated_reason` enum | Locked by smoke fixture and synchronous throw on out-of-set return; any addition is a material governance event |
| Frozen `brand_inputs_required` named-lists | Names only; no values; no template strings; no brand profile read; locked by smoke fixture |
| First-match-wins gating | When a capability fails multiple gates, only the first failing gate's reason is recorded (e.g., `approved=false` AND `auth_scheme="oauth"` records `unapproved`, never `auth_scheme_oauth_pending_v2`) |
| M27 advisory copy-forward verbatim | No recomputation, no new advisory text |
| M29 `auth_requirements` copy-forward verbatim | No recoercion of `unknown` → `none` |
| Planning-aid framing | Help text, docs, README, launch artifacts MUST use "planning aid" language; MUST NOT use "generates a chat client", "renders a widget", "hosts a voice interface", "runs a command palette", "ships a runnable surface", "auto-brands the embed", "certifies accessibility", "publishes to a marketplace" |
| Future surface-generator milestones reserved | M-Chat-1, M-Palette-1, M-Widget-1, M-Voice-1 ship under their own ROADMAP entries with fresh acceptance contracts; M30 is **not** a substitute for any of them |
