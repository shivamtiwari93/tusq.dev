---
title: FAQ
sidebar_label: FAQ
sidebar_position: 7
---

# FAQ

## Does tusq.dev execute live API calls in v0.1.0?

No. The MCP surface is describe-only in V1. `tools/call` returns schema and example payloads, not live execution.

## Which frameworks are supported?

Express, Fastify, and NestJS.

## How do I approve capabilities?

Edit `tusq.manifest.json` directly and set `approved: true` on the capabilities you want to expose.

## Is there an interactive approval UI?

No. `tusq review` is non-interactive in v0.1.0 and prints a grouped summary to stdout.

## Does it support Python, Go, or Java projects?

Not in v0.1.0.

## Is there a plugin API in V1?

No. Framework support is hardcoded for the three supported Node.js frameworks.
