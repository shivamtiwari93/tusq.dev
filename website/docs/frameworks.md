---
title: Supported Frameworks
sidebar_label: Supported Frameworks
sidebar_position: 5
---

# Supported Frameworks

`tusq.dev v0.1.0` supports three Node.js backend frameworks:

- Express
- Fastify
- NestJS

## What support means in V1

For these frameworks, `tusq scan` can infer route candidates using static, heuristic parsing and emit `.tusq/scan.json` with:

- method and path
- handler hints
- auth hints
- schema hint presence
- provenance (file and line)
- confidence score
- basic domain grouping

## What support does not mean

- Full AST/type-level semantic understanding
- Runtime traffic learning
- Perfect auth or policy inference
- Cross-language ecosystem support

## Not supported in V1

- Python frameworks
- Go frameworks
- Java frameworks
- Arbitrary plugin-defined framework adapters

Those are planned beyond v0.1.0.
