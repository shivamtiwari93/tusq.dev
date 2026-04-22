# Announcement

## Headline

tusq.dev v0.1.0 gives existing Node.js SaaS teams a reviewed path from repo to describe-only MCP

## Product Summary

tusq.dev `v0.1.0` is the first public release of the tusq capability compiler CLI. It is built for SaaS teams already running Express, Fastify, or NestJS services and feeling pressure to expose product behavior to AI systems without skipping review.

Best fit for this launch: teams with a real supported service, real routes, and real pressure to expose product behavior to AI systems without hand-authoring every tool definition.

Not the right fit for this launch: teams looking for hosted execution, a built-in chat UI, runtime-autonomous agents, or support beyond Express, Fastify, and NestJS.

The product story is straightforward: your product logic already exists. The missing piece is a reviewed path to make that logic AI-visible.

The proof path is equally straightforward: scan a supported repo, inspect the generated manifest, approve what should be exposed, compile approved tool JSON, then inspect the local describe-only MCP output.

This release gives teams a concrete terminal workflow:

1. initialize a repo with `tusq init`
2. scan routes with `tusq scan`
3. generate a reviewable `tusq.manifest.json`
4. approve capabilities with `tusq approve` (supports `--all`, `--reviewer <id>`, and `--dry-run` to preview changes) so the approval trail is recorded deliberately rather than edited by hand
5. compile approved capabilities into JSON tool definitions
6. expose those compiled tools through a local, describe-only MCP endpoint
7. re-review drift with `tusq diff --review-queue` when the codebase or manifest changes, and optionally enforce `--fail-on-unapproved-changes` in CI
8. share a deterministic, offline review artifact with `tusq docs --out docs/capabilities.md`, which renders approval state, governance metadata, redaction policy, examples, constraints, and provenance directly from the manifest
9. optionally activate an opt-in dry-run with `tusq serve --policy .tusq/execution-policy.json`; when the reviewer-signed policy file sets `mode: "dry-run"`, MCP `tools/call` validates arguments and returns `executed: false`, a policy echo, and a `dry_run_plan` with a deterministic `plan_hash` — still no live API execution, just a plan preview reviewers can audit
10. scaffold that policy file in one step with `tusq policy init` (safe default `mode: "describe-only"`; opt-in `--mode dry-run`), using flags `--reviewer`, `--allowed-capabilities`, `--out`, `--force`, `--dry-run`, `--json`, and `--verbose` to control the emitted `.tusq/execution-policy.json` — the generated file is validator-round-trip-safe, so `tusq serve --policy` will accept it on the first run without hand-editing
11. verify any `.tusq/execution-policy.json` as a CI pre-flight gate with `tusq policy verify <path> [--json]`, which reuses the exact same validator that `tusq serve --policy` calls at startup — exit `0` with a PASS line (and a `{ ok: true, mode, path }` JSON result under `--json`) means the server will accept the file; exit `1` prints the same validator error message the server would emit, so the "edit, restart server, read traceback, edit again" loop collapses into a single no-server check

What it does not do yet matters just as much: `v0.1.0` does not proxy live API calls (even under `--policy` with `mode: "dry-run"`, `tools/call` always returns `executed: false` and makes no outbound request to the target product), does not ship an interactive review UI, and does not support frameworks beyond Express, Fastify, and NestJS.

The proof points for this launch are intentionally concrete: reviewed manifest output, repo-local `tusq approve` approval with audit trail (`approved_by`, `approved_at`), compiled tool definitions, provenance back to source, visible governance metadata (`side_effect_class`, `sensitivity_class`, and `auth_hints`), reviewable `redaction` policy, inspectable `examples` and `constraints` in the describe-only runtime surface, an inspectable describe-only MCP surface, an offline, deterministic Markdown capability review packet from `tusq docs`, an opt-in dry-run response shape under `tusq serve --policy` that emits a validated `dry_run_plan` with `executed: false` and a deterministic `plan_hash` — no live execution was added — one-step scaffolding of the governance artifact itself via `tusq policy init`, which writes a validator-round-trip-safe `.tusq/execution-policy.json` and defaults to the safe `mode: "describe-only"` unless a reviewer opts into `--mode dry-run`, and a no-server `tusq policy verify` CI pre-flight that reuses the exact `loadAndValidatePolicy()` function `tusq serve --policy` uses — a PASS provably means the server will accept the same file, without starting an HTTP server or making any network call.

Current launch CTA: ask early users to try tusq.dev locally from the repo on a supported service, not to assume a public package-manager install path is already live.

The narrative priority is deliberate: lead with who should care, then the operator problem, then the proof sequence, then the boundary. That keeps the launch honest and helps the right teams qualify themselves quickly.

## Blog Draft

Today we’re releasing `tusq.dev v0.1.0`, the first public version of the open-source capability compiler CLI for existing SaaS products.

If you already run a supported Express, Fastify, or NestJS backend and need a reviewed path to make that product behavior AI-visible, this release is for you.

The problem we care about is simple: most SaaS companies already have the logic they need for AI products, but that logic is trapped behind APIs designed for UI flows. Routes, handlers, validators, and auth checks exist. What’s missing is a governed path that turns those implementation surfaces into something AI systems can safely see and use.

That is the job of tusq.dev.

The proof path in `v0.1.0` is deliberately easy to evaluate: point tusq.dev at a supported repo, inspect `tusq.manifest.json`, approve what should be exposed, compile approved tool definitions, then inspect the local describe-only MCP output.

This release is for teams already running a supported Express, Fastify, or NestJS service and trying to turn existing product behavior into something AI systems can inspect. It is not for teams that need hosted execution, non-Node support, or a polished end-user agent interface on day one.

In `v0.1.0`, tusq.dev focuses on a narrow, honest slice of that vision. If your product runs on Express, Fastify, or NestJS, you can point tusq.dev at the repo, scan the codebase, generate a reviewable `tusq.manifest.json`, approve the capabilities you actually want exposed, compile them into strict JSON tool definitions, preserve provenance back to the source route, and serve those definitions through a local describe-only MCP endpoint.

That review surface is more specific than "governance" as a slogan. Each capability carries concrete metadata a human can inspect before exposure: approval state, optional approval trail (`approved_by`, `approved_at`), provenance back to the source route, `side_effect_class` for mutation type, `sensitivity_class` as the current data-sensitivity marker, `auth_hints` showing detected auth or middleware signals, and manifest-level `redaction` policy for masking and retention guidance. Downstream, the describe-only runtime also exposes `examples` and `constraints` so teams can inspect what AI clients would be shown before any execution layer exists.

The workflow is terminal-native:

```bash
tusq init
tusq scan .
tusq manifest
tusq approve --all --reviewer you@example.com
tusq compile
tusq serve
# share a reviewable Markdown artifact with stakeholders who do not run the CLI:
tusq docs --out docs/capabilities.md
# optionally scaffold the reviewer-signed execution policy in one step
# (safe default mode is "describe-only"; opt into dry-run explicitly):
tusq policy init --mode dry-run --reviewer you@example.com
# verify the policy as a CI pre-flight; PASS proves serve --policy will accept it
# (no HTTP server is started, no network I/O is performed):
tusq policy verify .tusq/execution-policy.json --json
# then activate opt-in dry-run argument validation and plan emission:
tusq serve --policy .tusq/execution-policy.json
# later, when the codebase changes, re-review drift:
tusq diff --from previous.manifest.json --to tusq.manifest.json --review-queue
# and gate CI on unapproved drift:
tusq diff --from previous.manifest.json --to tusq.manifest.json --fail-on-unapproved-changes
```

This release is intentionally scoped. The MCP server is describe-only by default in V1. `tools/call` returns schema, example payloads, and constraints; it does not execute live product actions. With the opt-in `tusq serve --policy .tusq/execution-policy.json` flag and `mode: "dry-run"`, `tools/call` additionally validates arguments (required fields, primitive types, and `additionalProperties: false`) and returns a `dry_run_plan` with `executed: false`, a policy echo, and a deterministic SHA-256 `plan_hash` — still no outbound request, still reviewer-governed by the policy file and the approval gate. Review is non-interactive: `tusq review` prints a grouped stdout summary and `tusq approve` records who approved what and when, so the approval trail is a first-class CLI action rather than a hand-edit to the manifest. The scanner is heuristic and static-analysis-first, which is why the manifest is a first-class review surface rather than a hidden implementation detail.

We think that tradeoff is the right one for a first release. It proves the important part: teams can start from the product they already have and move toward an AI-visible capability surface without rebuilding the stack or hand-authoring every tool definition.

If you’re working on AI enablement inside an existing SaaS product, tusq.dev is now at the point where you can try that loop locally, inspect the output, and tell us where the real edge cases are.

## How To Try It Today

- Use the repo-local trial path on a supported Express, Fastify, or NestJS codebase:

```bash
git clone https://github.com/shivamtiwari93/tusq.dev
cd tusq.dev
npm install
npm link
```

- Run the workflow against your target service: `tusq init` → `tusq scan .` → `tusq manifest` → `tusq approve --all --reviewer you@example.com` (or approve a single capability by name) → `tusq compile` → `tusq serve`
- Generate a shareable review packet with `tusq docs --out docs/capabilities.md`; the output is deterministic and offline, so it can be checked in, diffed, and circulated to reviewers who do not run the CLI
- For reviewers who want argument validation plus a plan preview before any future execution step exists, scaffold the policy in one step with `tusq policy init --mode dry-run --reviewer you@example.com` (or pass `--allowed-capabilities name,...` to scope the dry-run surface); add `--dry-run` to preview the emitted JSON without writing, or omit `--mode` entirely to accept the safe default `mode: "describe-only"`. Before starting the server, confirm the policy would be accepted with `tusq policy verify .tusq/execution-policy.json --json` — exit `0` with `{ ok: true, mode, path }` means `tusq serve --policy` will accept the same file, and `tusq policy verify` starts no server and makes no network call, so it is safe to drop into a CI pre-flight step. Then start the server with `tusq serve --policy .tusq/execution-policy.json`; every `tools/call` still returns `executed: false`, and the `dry_run_plan.plan_hash` is stable across runs for identical validated inputs
- When the codebase or manifest changes, run `tusq diff --from <old-manifest> --to tusq.manifest.json --review-queue` to see what drifted, and use `--fail-on-unapproved-changes` if you want a CI gate
- Review `tusq.manifest.json` before approving any capability, especially approval state, optional approval trail, provenance, `side_effect_class`, `sensitivity_class`, `auth_hints`, and `redaction`
- After compile, inspect describe-only `examples` and `constraints` in `tools/call` so the runtime-facing payload matches your intended usage boundaries
- Treat the first run as an inspection workflow: check confidence, domain grouping, provenance, and the describe-only MCP output
- Best first proof: approve one or two capabilities only, then verify that `tools/list` and `tools/call` reflect exactly what you expected
- Wait to publish a public package-manager install step until distribution is confirmed

## Social Copy

### X / short post

`tusq.dev v0.1.0` is out.

It scans supported Node.js SaaS backends (`Express`, `Fastify`, `NestJS`), generates a reviewable `tusq.manifest.json`, compiles approved capabilities into JSON tool defs, and exposes them through a local describe-only MCP endpoint.

This release proves repo → reviewed manifest → approved tool JSON → inspectable describe-only MCP, with visible approval state, optional approval trail, governance metadata like `side_effect_class`, `sensitivity_class`, and `auth_hints`, reviewable `redaction`, plus inspectable `examples` and `constraints`, not live execution. `tusq serve --policy` is available as an opt-in dry-run that emits a validated `dry_run_plan` with `executed: false` and a deterministic `plan_hash` — still no live execution. `tusq policy init` scaffolds the reviewer-signed `.tusq/execution-policy.json` in one step (default `mode: "describe-only"`, opt-in `--mode dry-run`), and the generated file is validator-round-trip-safe. `tusq policy verify` adds a no-server CI pre-flight that reuses the exact `loadAndValidatePolicy()` the server uses — PASS proves `tusq serve --policy` will accept the same file. `tusq diff` closes the loop when code changes by emitting a review queue of drifted capabilities that can gate CI.

Best fit: teams with an existing supported backend, not teams looking for hosted agents on day one.

Try it locally from the repo on a supported service.

### LinkedIn

Most SaaS companies already have the product logic they need for AI workflows. The problem is that the logic is trapped behind APIs and internal code paths that are not packaged for agent use.

`tusq.dev v0.1.0` is our first open-source step at fixing that. It gives Express, Fastify, and NestJS teams a CLI to scan a codebase, generate a reviewable capability manifest, approve what should be exposed, optionally record who approved it and when, compile approved capabilities into tool definitions, preserve provenance, surface `side_effect_class`, `sensitivity_class`, and `auth_hints`, keep `redaction` policy visible, and serve the result through a local describe-only MCP endpoint that also exposes inspectable `examples` and `constraints`.

The release is intentionally narrow and honest. No live proxying yet. No interactive TUI yet. Just a concrete path from existing product code to a governed AI-visible surface.

The best current fit is an incumbent SaaS team with a real supported backend and a real need to inspect what gets exposed. It is not a hosted-agent platform launch.

The right first step is repo-local evaluation on a supported service, not assuming a public package install is already live.

### Community post

Shipping `tusq.dev v0.1.0` today.

Current V1 scope:
- Express, Fastify, NestJS
- `init` / `scan` / `manifest` / `review` / `approve` / `compile` / `serve` / `diff` / `docs` / `policy init` / `policy verify`
- reviewed `tusq.manifest.json`
- explicit approval state and optional approval trail
- visible governance metadata (`side_effect_class`, `sensitivity_class`, `auth_hints`)
- reviewable `redaction` policy
- inspectable `examples` and `constraints` in describe-only `tools/call`
- approved capability compilation
- local describe-only MCP server (default); opt-in dry-run via `tusq serve --policy` with a reviewer-signed `.tusq/execution-policy.json` that emits a validated `dry_run_plan` carrying `executed: false` and a deterministic `plan_hash`
- one-step scaffolding of `.tusq/execution-policy.json` via `tusq policy init` with safe default `mode: "describe-only"`, opt-in `--mode dry-run`, and validator-round-trip safety against `tusq serve --policy`
- no-server CI pre-flight validation of `.tusq/execution-policy.json` via `tusq policy verify` (optionally `--json`), which reuses `loadAndValidatePolicy()` byte-for-byte and exits `0` on PASS / `1` on fail with the server's own error shape
- manifest-version diff with review-queue output and `--fail-on-unapproved-changes` CI gate
- offline deterministic Markdown capability documentation via `tusq docs`
- repo-local evaluation path for launch

Explicitly not in V1:
- live API execution (even under `--policy` with `mode: "dry-run"`, `tools/call` never executes)
- plugin framework support
- non-Node ecosystems
- interactive review UI

Best fit:
- teams with an existing supported service they want to inspect and expose carefully
