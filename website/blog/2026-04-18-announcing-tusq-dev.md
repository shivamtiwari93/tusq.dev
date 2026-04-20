---
slug: announcing-tusq-dev
title: Announcing tusq.dev v0.1.0
authors: [core-team]
tags: [launch, oss, mcp]
---

Today we are releasing `tusq.dev v0.1.0`, the first public version of the open-source capability compiler CLI for existing SaaS products.

{/* truncate */}

If you already run a supported Express, Fastify, or NestJS backend and need a reviewed path to make that product behavior AI-visible, this release is for you.

Most SaaS teams already have the logic they need for AI workflows, but that logic is trapped behind APIs designed for UI flows. Routes, handlers, validators, and auth checks exist. What is missing is a governed path that turns those implementation surfaces into something AI systems can safely consume.

That is the focus of tusq.dev.

This launch is best suited to teams already running a supported Express, Fastify, or NestJS service and looking for a reviewable path from product code to AI-visible capability definitions. It is not aimed at teams that need hosted execution, broader framework coverage, or an end-user chat interface on day one.

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
- `tools/call` returns schema, examples, constraints, and redaction guidance, not live execution
- capability approval is manual by editing the manifest
- early adopters should try it locally from the repo rather than assume a public package-manager install is already live

What makes the workflow governable is visible in the artifacts themselves. Reviewers can inspect approval state, optional approval trail (`approved_by`, `approved_at`), provenance, `side_effect_class`, `sensitivity_class`, `auth_hints`, and `redaction` in the manifest and see the relevant runtime-facing fields survive into the compiled tool and MCP surfaces.

The best first proof is simple: run tusq.dev on a supported service you already own, inspect `tusq.manifest.json`, approve one or two capabilities, and verify that `tools/list` and `tools/call` reflect exactly what you intended.

This release proves the core loop from repo to governed capability surface without pretending to solve every hard problem on day one.
