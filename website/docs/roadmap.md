---
title: Post-v0.1.0 Roadmap
sidebar_label: Post-v0.1.0 Roadmap
sidebar_position: 8
---

# Post-v0.1.0 Roadmap

This page tracks priorities after `v0.1.0`.

None of the items below are shipped behavior in `v0.1.0`.

## 1) Opt-in execution mode with policy controls

`v0.1.0` serves a describe-only MCP surface. A next stage is an opt-in execution mode where:

- execution is explicitly enabled by policy
- calls are validated against approved tool contracts
- every invocation is auditable with source provenance

## 2) Framework coverage beyond current V1 support

`v0.1.0` supports Express, Fastify, and NestJS.

The next stage is broader adapter coverage while preserving the same review and approval pipeline quality.

## 3) Stronger approval ergonomics

`v0.1.0` uses manual manifest edits for approval.

A next-stage improvement is a tighter review workflow that reduces editing friction without removing explicit human approval.

## 4) Learning loop from scanner misses

Route misses and low-confidence extractions from real repositories should feed future extractor quality.

This is roadmap work and is not automatically happening in `v0.1.0`.
