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

Serve compiled tools over a local describe-only MCP endpoint.

```bash
tusq serve [--port <n>] [--verbose]
```

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
