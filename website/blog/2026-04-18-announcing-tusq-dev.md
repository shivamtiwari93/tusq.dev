---
slug: announcing-tusq-dev
title: Announcing tusq.dev v0.1.0
authors: [core-team]
tags: [launch, oss, mcp]
---

Today we are releasing `tusq.dev v0.1.0`, the first public version of the open-source capability compiler CLI for existing SaaS products.

{/* truncate */}

Most SaaS teams already have the logic they need for AI workflows, but that logic is trapped behind APIs designed for UI flows. Routes, handlers, validators, and auth checks exist. What is missing is a governed path that turns those implementation surfaces into something AI systems can safely consume.

That is the focus of tusq.dev.

In `v0.1.0`, tusq.dev provides a narrow, explicit workflow for supported Node.js backends:

```bash
tusq init
tusq scan .
tusq manifest
# edit tusq.manifest.json and set approved: true
tusq compile
tusq serve
```

Current framework support:

- Express
- Fastify
- NestJS

The V1 boundary is explicit:

- MCP is describe-only in this release
- `tools/call` returns schema and examples, not live execution
- capability approval is manual by editing the manifest
- early adopters should try it locally from the repo rather than assume a public package-manager install is already live

This release proves the core loop from repo to governed capability surface without pretending to solve every hard problem on day one.
