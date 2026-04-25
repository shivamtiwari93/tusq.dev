---
title: CLI Reference
sidebar_label: CLI Reference
sidebar_position: 2
---

# CLI Reference

Global syntax:

```bash
tusq <command> [options]
```

## Commands

## `tusq init`

Initialize `tusq.config.json`.

```bash
tusq init [--framework <express|fastify|nestjs>] [--verbose]
```

## `tusq scan`

Scan a codebase and write `.tusq/scan.json`.

```bash
tusq scan <path> [--framework <name>] [--format json] [--verbose]
```

## `tusq manifest`

Generate `tusq.manifest.json` from scan data.

```bash
tusq manifest [--out <path>] [--format json] [--verbose]
```

## `tusq compile`

Compile approved capabilities into tool definition JSON files.

```bash
tusq compile [--out <path>] [--dry-run] [--verbose]
```

## `tusq serve`

Serve compiled tools over a local MCP endpoint. Without `--policy`, behavior is describe-only (V1 default). With `--policy`, the server loads an execution policy file and can validate arguments and emit dry-run plans.

```bash
tusq serve [--port <n>] [--policy <path>] [--verbose]
```

| Flag | Description | Default |
|------|-------------|---------|
| `--port <n>` | TCP port for the local MCP listener | `3333` |
| `--policy <path>` | Path to `.tusq/execution-policy.json`; enables dry-run mode when `mode: "dry-run"` | Unset (describe-only) |
| `--verbose` | Print policy resolution and request logs to stderr | Disabled |

If `--policy` is set and the file is missing, unreadable, contains invalid JSON, has an unsupported `schema_version`, or specifies an unknown `mode`, `tusq serve` exits 1 with an actionable message before starting the server.

See [Execution Policy](./execution-policy.md) for the full policy file shape, mode semantics, and dry-run response format.

## `tusq review`

Print grouped manifest summary for review. The text output includes approval state, confidence, inferred input/output shape summaries, source provenance, and sensitivity class so reviewers can triage the manifest without opening every capability object.

```bash
tusq review [--format json] [--strict] [--sensitivity <class>] [--verbose]
```

Example text row:

```text
- [x] get_users_users (GET /users) confidence=0.76 LOW_CONFIDENCE sensitivity=public inputs=none returns=array<object> source=src/app.ts:13 handler=listUsers framework=express
```

Use `--format json` when you need the full raw manifest.

Use `--strict` in CI to fail with exit code `1` when any capability is unapproved or marked `review_needed`.

Use `--sensitivity <class>` to filter the displayed output to capabilities with a specific M28 sensitivity class. Legal values: `unknown`, `public`, `internal`, `confidential`, `restricted`. An unrecognized value exits `1` before any output. The filter is display-only — it does not change the exit code (unapproved or low-confidence capabilities outside the filter still trigger a `--strict` failure).

## `tusq docs`

Generate deterministic local Markdown documentation from a tusq manifest.

```bash
tusq docs [--manifest <path>] [--out <path>] [--verbose]
```

The generated Markdown is review/adoption documentation only. It includes manifest version metadata and per-capability sections for approval state, side-effect class, sensitivity class, auth hints, provenance, examples, constraints, and redaction. It does not publish hosted docs, call product APIs, or add live execution semantics.

If `--manifest` is omitted, tusq reads `tusq.manifest.json` from the current project config or working directory. If `--out` is omitted, tusq prints Markdown to stdout.

## `tusq approve`

Approve selected capabilities in `tusq.manifest.json` without hand-editing approval fields.

```bash
tusq approve [capability-name] [--all] [--reviewer <id>] [--manifest <path>] [--dry-run] [--json] [--verbose]
```

Use a capability name to approve exactly one capability. Use `--all` to approve every capability that is currently unapproved or still marked `review_needed`.

Approval sets `approved: true`, clears `review_needed`, and records `approved_by` plus `approved_at`. If `--reviewer` is omitted, tusq uses `TUSQ_REVIEWER`, `USER`, or `LOGNAME`.

Use `--dry-run` to inspect what would be approved without writing the manifest. Use `--json` for machine-readable approval output.

## `tusq diff`

Compare two manifest files and surface capability changes for review.

```bash
tusq diff [--from <path>] [--to <path>] [--json] [--review-queue] [--fail-on-unapproved-changes] [--verbose]
```

Use `--from` for the previous manifest and `--to` for the current manifest. If `--to` is omitted, tusq uses `tusq.manifest.json` in the current working directory. If `--from` is omitted and tusq cannot resolve a predecessor locally, the command exits `1` and asks for `--from <path>`.

The default text output reports added, removed, changed, and unchanged counts. Changed capabilities are matched by `name`, detected with `capability_digest`, and include top-level changed field names.

Use `--json` for machine-readable output with `summary`, `changes[]`, and optional `review_queue[]`.

Use `--review-queue` to list added, changed, unapproved, and low-confidence capabilities that need review.

Use `--fail-on-unapproved-changes` in CI to exit `1` when added or changed capabilities are unapproved or still marked `review_needed`.

## `tusq policy init`

Generate a valid `.tusq/execution-policy.json` governance artifact without hand-authoring the schema.

```bash
tusq policy init [--mode <describe-only|dry-run>]
                 [--reviewer <id>]
                 [--allowed-capabilities <name,name,...>]
                 [--out <path>]
                 [--force]
                 [--dry-run]
                 [--json]
                 [--verbose]
```

| Flag | Description | Default |
|------|-------------|---------|
| `--mode <describe-only\|dry-run>` | Policy mode for the generated file | `describe-only` |
| `--reviewer <id>` | Reviewer identity stamped in the file | `TUSQ_REVIEWER`, `USER`, `LOGNAME`, or `"unknown"` |
| `--allowed-capabilities <name,...>` | Comma-separated capability names to scope dry-run; omit to allow all approved capabilities | Omitted |
| `--out <path>` | Output path for the generated policy file | `.tusq/execution-policy.json` |
| `--force` | Overwrite the file if it already exists | Disabled |
| `--dry-run` | Print the generated JSON to stdout without writing | Disabled |
| `--json` | Print structured output including the written path and policy object | Disabled |

The generated file passes `loadAndValidatePolicy()` byte-for-byte — it is indistinguishable from a hand-authored policy as far as `tusq serve --policy` is concerned. The `.tusq/` directory is created automatically if missing.

Default mode is `"describe-only"`. To generate a dry-run policy: `tusq policy init --mode dry-run`.

Example three-line workflow:

```bash
tusq policy init --mode dry-run --reviewer ops@example.com
tusq serve --policy .tusq/execution-policy.json
```

See [Execution Policy](./execution-policy.md) for mode semantics and the full policy schema.

## `tusq policy verify`

Validate an execution-policy file without starting an MCP server. Shares `loadAndValidatePolicy()` with `tusq serve --policy`, so every accept/reject decision and every error message is identical across the two entry points.

```bash
tusq policy verify [--policy <path>]
                   [--json]
                   [--verbose]
```

| Flag | Description | Default |
|------|-------------|---------|
| `--policy <path>` | Path to the execution-policy file to validate | `.tusq/execution-policy.json` |
| `--json` | Emit a machine-readable result object to stdout (both success and failure) | Human-readable summary |
| `--verbose` | Print the resolved path to stderr | Disabled |

| Exit | Meaning |
|------|---------|
| `0` | Policy file was read, parsed, and accepted by the shared validator |
| `1` | Missing file, unreadable file, invalid JSON, unsupported `schema_version`, unknown `mode`, or invalid `allowed_capabilities` |

On success without `--json`, prints one line to stdout:

```
Policy valid: .tusq/execution-policy.json (mode: dry-run, reviewer: ops@example.com, allowed_capabilities: unset)
```

With `--json` on success:

```json
{
  "valid": true,
  "path": ".tusq/execution-policy.json",
  "policy": {
    "schema_version": "1.0",
    "mode": "dry-run",
    "reviewer": "ops@example.com",
    "approved_at": "2026-04-22T05:20:21.000Z",
    "allowed_capabilities": null
  }
}
```

With `--json` on failure:

```json
{
  "valid": false,
  "path": ".tusq/execution-policy.json",
  "error": "Unknown policy mode: live-fire. Allowed: describe-only, dry-run"
}
```

Typical pre-commit / CI usage:

```bash
tusq policy verify && tusq serve --policy .tusq/execution-policy.json
```

See [Execution Policy](./execution-policy.md) for the full policy schema and mode semantics.

### `tusq policy verify --strict` (manifest-aware)

When `--strict` is set, the verifier additionally reads `tusq.manifest.json` (or a path passed via `--manifest`) and cross-references every name in the policy's `allowed_capabilities` array against the manifest's approval-gated set. This is an opt-in CI/review-layer gate; default behavior is byte-for-byte identical to M22.

```bash
tusq policy verify [--policy <path>]
                   [--strict [--manifest <path>]]
                   [--json]
                   [--verbose]
```

| Flag | Description | Default |
|------|-------------|---------|
| `--strict` | Additionally cross-reference `allowed_capabilities` against the manifest | Disabled (M22 behavior) |
| `--manifest <path>` | Path to the manifest file consulted under `--strict` (requires `--strict`) | `tusq.manifest.json` |

Under `--strict`, the flag evaluation order is:

1. If `--manifest` is set without `--strict`, exit 1 with `--manifest requires --strict` before reading any file.
2. Run the M22 policy-file validator. If it fails, exit 1 with the M22 message. Strict checks do not run on a policy that fails M22 validation.
3. If `--strict` is set, read the manifest and cross-check every name in `allowed_capabilities`. On any failure, exit 1.
4. On full success, emit the success output and exit 0.

Strict-mode failure messages:

| Failure | Message |
|---------|---------|
| `--manifest` without `--strict` | `--manifest requires --strict` |
| Manifest file missing | `Manifest not found: <path>` |
| Manifest file unreadable | `Could not read manifest file: <path>: <OS error>` |
| Manifest file not valid JSON | `Invalid manifest JSON at: <path>: <parser message>` |
| Manifest has no `capabilities` array | `Invalid manifest shape at: <path>: missing capabilities array` |
| Capability not in manifest | `Strict policy verify failed: allowed capability not found in manifest: <name>` |
| Capability present but `approved: false` | `Strict policy verify failed: allowed capability not approved: <name>` |
| Capability present, approved, but `review_needed: true` | `Strict policy verify failed: allowed capability requires review: <name>` |

With `--strict --json` on success:

```json
{
  "valid": true,
  "strict": true,
  "path": ".tusq/execution-policy.json",
  "manifest_path": "tusq.manifest.json",
  "manifest_version": 2,
  "policy": {
    "schema_version": "1.0",
    "mode": "dry-run",
    "reviewer": "ops@example.com",
    "approved_at": "2026-04-22T05:20:21.000Z",
    "allowed_capabilities": ["get_users_users"]
  },
  "approved_allowed_capabilities": 1
}
```

With `--strict --json` on failure:

```json
{
  "valid": false,
  "strict": true,
  "path": ".tusq/execution-policy.json",
  "manifest_path": "tusq.manifest.json",
  "error": "Strict policy verify failed: allowed capability not approved: get_users_users",
  "strict_errors": [
    { "name": "get_users_users", "reason": "not_approved" }
  ]
}
```

**What a strict PASS does NOT prove:** a PASS is a policy/manifest alignment statement at verify time only — every name in `allowed_capabilities` exists in the manifest, is `approved: true`, and is not blocked on review. It is NOT an execution safety check, NOT a runtime gate, NOT a manifest freshness check, and NOT a pre-flight for `tusq serve --policy`. A strict PASS does not change what `tools/list` returns, does not authorize capability execution, and does not substitute for any approval workflow.

Canonical scaffold → verify → serve workflow:

```bash
tusq policy init --mode dry-run --reviewer ops@example.com
tusq policy verify --strict --json
tusq serve --policy .tusq/execution-policy.json
```

## `tusq redaction review`

Emit a deterministic, per-capability reviewer report aggregating M25 `redaction.pii_fields`, M26 `redaction.pii_categories`, and frozen per-category advisory text from `PII_REVIEW_ADVISORY_BY_CATEGORY`. This is a **reviewer aid, not a runtime enforcement gate**.

```bash
tusq redaction review [--manifest <path>] [--capability <name>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--capability <name>` | unset | Filter to one exact capability name |
| `--json` | unset | Emit machine-readable JSON |

| Exit code | Meaning |
|-----------|---------|
| `0` | Manifest read successfully; report emitted |
| `1` | Missing/invalid manifest, unknown capability, unknown flag, or unknown subcommand |

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- `sensitivity_class`, `retention_days`, `log_level`, and `mask_in_traces` are never auto-escalated or auto-populated.
- Advisory text uses the em-dash character (U+2014); wording is frozen in `PII_REVIEW_ADVISORY_BY_CATEGORY`.
- A review report is NOT a compliance certification, NOT runtime PII enforcement, and NOT a substitute for reviewer judgment.

```bash
# Human-readable report (default)
tusq redaction review

# Machine-readable JSON
tusq redaction review --json

# Filter to a single capability
tusq redaction review --capability post_auth_auth --json
```

## `tusq version`

Print the current version.

```bash
tusq version
```

## `tusq help`

Print command help.

```bash
tusq help
```

## Exit behavior

- Invalid command: exits `1` and prints help.
- Invalid flag: exits `1` and prints per-command usage.
- Missing prerequisites (no config / no scan / no manifest): exits `1` with an explicit error message.
- Diff gate failure: exits `1` with `Review gate failed:` and the capability names requiring approval.
