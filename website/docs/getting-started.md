---
title: Getting Started
sidebar_label: Getting Started
sidebar_position: 1
---

# Getting Started

`tusq.dev v0.1.0` is an open-source capability compiler CLI for existing Node.js SaaS backends.

Supported frameworks in V1:

- Express
- Fastify
- NestJS

## Prerequisites

- Node.js 18+
- A repository with one of the supported frameworks

## Install

Use your preferred workflow:

```bash
npm install -g tusq
```

Or for local development from this repo:

```bash
npm install
npm link
```

## End-to-end workflow

Run from your target project root:

```bash
tusq init
tusq scan .
tusq manifest
# edit tusq.manifest.json and set approved: true
tusq compile
tusq serve
```

## What each step produces

1. `tusq init` creates `tusq.config.json`.
2. `tusq scan .` writes `.tusq/scan.json` with discovered routes and inference metadata.
3. `tusq manifest` writes `tusq.manifest.json`.
4. Manual approval sets `approved: true` on selected capabilities.
5. `tusq compile` emits approved tool JSON files in `tusq-tools/`.
6. `tusq serve` starts a local MCP endpoint for `tools/list` and describe-only `tools/call`.

## V1 boundaries

- MCP execution is describe-only in v0.1.0.
- Capability approval is manual by editing `tusq.manifest.json`.
- Runtime learning and plugin APIs are not shipped in V1.
