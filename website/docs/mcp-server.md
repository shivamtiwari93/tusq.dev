---
title: MCP Server
sidebar_label: MCP Server
sidebar_position: 6
---

# MCP Server

After compiling approved capabilities, run:

```bash
tusq serve
```

This starts a local HTTP endpoint that exposes compiled tools in MCP-style JSON-RPC methods.

## Implemented methods

- `tools/list`: returns available tools with schema metadata
- `tools/call`: returns describe-only schema/example/constraints information for a selected tool

- `tools/list` includes summary governance metadata: `side_effect_class`, `sensitivity_class`, and `auth_hints`.
- `tools/call` includes the same fields plus `examples`, `constraints`, and `redaction`.
- Approval metadata (`approved`, `approved_by`, `approved_at`, `review_needed`) remains manifest-only and is not returned by MCP responses.
- Version-history metadata (`manifest_version`, `previous_manifest_hash`, `capability_digest`) is also manifest-only and is not returned by MCP responses.

## V1 execution model

`tools/call` does **not** execute live product actions in `v0.1.0`.

It returns:

- tool name and description
- parameter and return schema
- example payloads
- constraints payload (`rate_limit`, `max_payload_bytes`, `required_headers`, `idempotent`, `cacheable`)

## Dry-run mode (M20)

Pass `--policy <path>` to activate an opt-in execution policy. When the policy sets `mode: "dry-run"`, `tools/call` validates arguments against the compiled tool schema and returns an auditable `dry_run_plan` instead of the describe-only response.

```bash
tusq serve --policy .tusq/execution-policy.json
```

Key properties of dry-run mode:

- `executed: false` is always present. No live API execution occurs.
- `plan_hash` is a SHA-256 over canonical plan inputs — identical arguments produce identical hashes.
- `allowed_capabilities` narrows which tools get dry-run treatment; others fall back to describe-only.
- Argument validation covers required fields, primitive types, and `additionalProperties: false` rejection.
- The approval gate is unchanged: only approved capabilities are reachable.

Without `--policy`, behavior is byte-for-byte identical to V1 describe-only.

See [Execution Policy](./execution-policy.md) for full policy file shape and response examples.

## Operational details

- Default port: `3100`
- Override with `--port`
- Graceful shutdown on `SIGINT`
- Clear error when port is already in use
- Clear error when policy file is missing, unreadable, or invalid
