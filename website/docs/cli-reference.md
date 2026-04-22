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

Print grouped manifest summary for review. The text output includes approval state, confidence, inferred input/output shape summaries, and source provenance so reviewers can triage the manifest without opening every capability object.

```bash
tusq review [--format json] [--strict] [--verbose]
```

Example text row:

```text
- [x] get_users_users (GET /users) confidence=0.76 LOW_CONFIDENCE inputs=none returns=array<object> source=src/app.ts:13 handler=listUsers framework=express
```

Use `--format json` when you need the full raw manifest.

Use `--strict` in CI to fail with exit code `1` when any capability is unapproved or marked `review_needed`.

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
