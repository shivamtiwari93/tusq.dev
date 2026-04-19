# Announcement

## Headline

Open-source tusq.dev v0.1.0 turns supported Node.js SaaS APIs into reviewed manifests, approved tool JSON, and a describe-only MCP surface

## Product Summary

tusq.dev `v0.1.0` is the first public release of the tusq capability compiler CLI. It is built for SaaS teams with existing Express, Fastify, or NestJS backends who want a faster path from shipping product logic to AI-visible capability surfaces.

This release gives teams a concrete terminal workflow:

1. initialize a repo with `tusq init`
2. scan routes with `tusq scan`
3. generate a reviewable `tusq.manifest.json`
4. approve capabilities by editing the manifest
5. compile approved capabilities into JSON tool definitions
6. expose those compiled tools through a local, describe-only MCP endpoint

What it does not do yet matters just as much: `v0.1.0` does not proxy live API calls, does not ship an interactive review UI, and does not support frameworks beyond Express, Fastify, and NestJS.

The proof points for this launch are intentionally concrete: reviewed manifest output, manual approval, compiled tool definitions, provenance back to source, and an inspectable describe-only MCP surface.

Current launch CTA: ask early users to try tusq.dev locally from the repo on a supported service, not to assume a public package-manager install path is already live.

## Blog Draft

Today we’re releasing `tusq.dev v0.1.0`, the first public version of the open-source capability compiler CLI for existing SaaS products.

The problem we care about is simple: most SaaS companies already have the logic they need for AI products, but that logic is trapped behind APIs designed for UI flows. Routes, handlers, validators, and auth checks exist. What’s missing is a governed path that turns those implementation surfaces into something AI systems can safely see and use.

That is the job of tusq.dev.

In `v0.1.0`, tusq.dev focuses on a narrow, honest slice of that vision. If your product runs on Express, Fastify, or NestJS, you can point tusq.dev at the repo, scan the codebase, generate a reviewable `tusq.manifest.json`, approve the capabilities you actually want exposed, compile them into strict JSON tool definitions, preserve provenance back to the source route, and serve those definitions through a local describe-only MCP endpoint.

The workflow is terminal-native:

```bash
tusq init
tusq scan .
tusq manifest
# edit tusq.manifest.json and set approved: true
tusq compile
tusq serve
```

This release is intentionally scoped. The MCP server is describe-only in V1. `tools/call` returns schema and example payloads; it does not execute live product actions. Review is non-interactive and happens by editing the manifest directly. The scanner is heuristic and static-analysis-first, which is why the manifest is a first-class review surface rather than a hidden implementation detail.

We think that tradeoff is the right one for a first release. It proves the important part: teams can start from the product they already have and move toward an AI-visible capability surface without rebuilding the stack or hand-authoring every tool definition.

If you’re working on AI enablement inside an existing SaaS product, tusq.dev is now at the point where you can try that loop locally, inspect the output, and tell us where the real edge cases are.

## How To Try It Today

- Clone the repo and run the CLI locally against a supported Express, Fastify, or NestJS codebase
- Review `tusq.manifest.json` before approving any capability
- Treat the first run as an inspection workflow: check confidence, domain grouping, provenance, and the describe-only MCP output
- Wait to publish a public package-manager install step until distribution is confirmed

## Social Copy

### X / short post

`tusq.dev v0.1.0` is out.

It scans supported Node.js SaaS backends (`Express`, `Fastify`, `NestJS`), generates a reviewable `tusq.manifest.json`, compiles approved capabilities into JSON tool defs, and exposes them through a local describe-only MCP endpoint.

This release proves repo → reviewed manifest → approved tool JSON → inspectable MCP, not live execution.

### LinkedIn

Most SaaS companies already have the product logic they need for AI workflows. The problem is that the logic is trapped behind APIs and internal code paths that are not packaged for agent use.

`tusq.dev v0.1.0` is our first open-source step at fixing that. It gives Express, Fastify, and NestJS teams a CLI to scan a codebase, generate a reviewable capability manifest, approve what should be exposed, compile approved capabilities into tool definitions, preserve provenance, and serve them through a local describe-only MCP endpoint.

The release is intentionally narrow and honest. No live proxying yet. No interactive TUI yet. Just a concrete path from existing product code to a governed AI-visible surface.

### Community post

Shipping `tusq.dev v0.1.0` today.

Current V1 scope:
- Express, Fastify, NestJS
- `init` / `scan` / `manifest` / `compile` / `review` / `serve`
- reviewed `tusq.manifest.json`
- approved capability compilation
- local describe-only MCP server

Explicitly not in V1:
- live API execution
- plugin framework support
- non-Node ecosystems
- interactive review UI
