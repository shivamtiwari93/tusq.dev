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
