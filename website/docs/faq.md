---
title: FAQ
sidebar_label: FAQ
sidebar_position: 7
---

# FAQ

## Does tusq.dev execute live API calls in v0.1.0?

No. The MCP surface is describe-only in V1. `tools/call` returns schema, example payloads, and constraints, not live execution.

## Which frameworks are supported?

Express, Fastify, and NestJS.

## How do I approve capabilities?

Run `tusq approve <capability-name> --reviewer <id>` for one capability, or `tusq approve --all --reviewer <id>` for every capability that is unapproved or still marked `review_needed`.

## What does "governed" mean in v0.1.0?

It means the review surface is explicit. Before exposing anything, you can inspect provenance, approval state, optional approval trail (`approved_by`, `approved_at`), `side_effect_class`, `sensitivity_class`, `auth_hints`, `redaction`, and the downstream `examples` / `constraints`.

## Is there an interactive approval UI?

No. `tusq review` is non-interactive in v0.1.0 and prints a grouped summary to stdout.

## Does it support Python, Go, or Java projects?

Not in v0.1.0.

## Is there a plugin API in V1?

No. Framework support is hardcoded for the three supported Node.js frameworks.
