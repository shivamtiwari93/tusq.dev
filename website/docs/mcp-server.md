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

## V1 execution model

`tools/call` does **not** execute live product actions in `v0.1.0`.

It returns:

- tool name and description
- parameter and return schema
- example payloads
- constraints payload (`rate_limit`, `max_payload_bytes`, `required_headers`, `idempotent`, `cacheable`)

## Operational details

- Default port: `3100`
- Override with `--port`
- Graceful shutdown on `SIGINT`
- Clear error when port is already in use
