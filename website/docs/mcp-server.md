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
- `tools/call`: returns describe-only schema/example information for a selected tool

Both methods include capability governance metadata when available (`side_effect_class` and `sensitivity_class`).

## V1 execution model

`tools/call` does **not** execute live product actions in `v0.1.0`.

It returns:

- tool name and description
- parameter and return schema
- example payloads

## Operational details

- Default port: `3100`
- Override with `--port`
- Graceful shutdown on `SIGINT`
- Clear error when port is already in use
