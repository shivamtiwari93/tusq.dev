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
12. optionally layer the opt-in `--strict [--manifest <path>]` manifest-aware cross-check on top of that no-server verify step: `tusq policy verify .tusq/execution-policy.json --strict --manifest tusq.manifest.json [--json]` runs the M22 validator first, then cross-references every name in `allowed_capabilities` against the manifest's approval-gated capability set and exits `1` with a deterministic `strict_errors` list on any `not_in_manifest`, `not_approved`, or `requires_review` mismatch; the default `policy verify` path stays byte-for-byte identical to M22 and never opens the manifest, `--manifest` without `--strict` exits `1` with `--manifest requires --strict` before any file is read, and a strict PASS is a policy/manifest alignment statement at verify time only — `tusq serve --policy` still does not enforce strict checks and still silently drops unlisted or unapproved capabilities from `tools/list`
13. as of M24, `tusq scan` now captures the declared top-level body-field shapes of Fastify routes that use a literal `schema: { body: { properties, required } }` block in their route-options object: the emitted `input_schema` carries `source: "fastify_schema_body"`, `additionalProperties: false`, property keys in declaration order, and the declared `required` entries. The extraction is static-literal only (no `fastify`, `ajv`, or `@sinclair/typebox` import; no `eval` or `new Function`), active by default on source-literal pattern match (no new CLI command or flag), Fastify-only (Express and NestJS manifests are byte-identical pre- and post-M24), body-only (`querystring`, `params`, `response` are not extracted), and top-level-only (nested object, array-of-object, and `$ref` field shapes are not captured). Any non-literal `schema:` reference, missing `body:` key, missing `properties:` key, or unbalanced brace drops the `schema_fields` record entirely and falls back byte-for-byte to the pre-M24 placeholder. Path-parameter names win over same-name body fields. An M24-driven `input_schema` change flips the M13 `capability_digest`; the capability will surface in `tusq diff` and stay filtered out of `tools/list` until a reviewer re-approves it via `tusq approve`. The framing is deliberate: `fastify_schema_body` means "the declared body schema as it appears literally in source" (SYSTEM_SPEC Constraint 14) — NOT "validator-backed," "runtime-enforced by Fastify," or "ajv-validated"
14. as of M25 (V1.6), `tusq manifest` now auto-populates `capability.redaction.pii_fields` by matching `input_schema.properties` keys whole-key against the frozen 36-name `PII_CANONICAL_NAMES` Set in `src/cli.js` (Email: `email`/`emailaddress`/`useremail`; Phone: `phone`/`phonenumber`/`mobile`/`mobilephone`/`telephone`; Government ID: `ssn`/`socialsecuritynumber`/`taxid`/`nationalid`; Name: `firstname`/`lastname`/`fullname`/`middlename`; Address: `streetaddress`/`zipcode`/`postalcode`; DOB: `dateofbirth`/`dob`/`birthdate`; Payment: `creditcard`/`cardnumber`/`cvv`/`cvc`/`bankaccount`/`iban`; Secrets: `password`/`passphrase`/`apikey`/`accesstoken`/`refreshtoken`/`authtoken`/`secret`; Network: `ipaddress`) after normalizing each key (`toLowerCase()` + strip `_`/`-`). Matched keys are returned in source-declaration order with original casing preserved (`user_email` stays `user_email`). The extractor is a pure in-memory function — no source-file read, no value inspection, no regex over source, no network I/O, no PII-detection or NLP library import. It is active by default inside existing `tusq manifest` (no new CLI command, no new flag, no environment-variable gate) and framework-agnostic (Express path-param fields, M24 Fastify body fields, and NestJS-derived capabilities all flow through the same function). Matching is whole-key only — `email_template_id` does NOT match `email` (substring/tail/regex are forbidden by SYSTEM_SPEC Constraint 15). M25 does NOT auto-escalate `capability.sensitivity_class` (it stays `"unknown"` in V1.6) and does NOT auto-populate `redaction.log_level`/`mask_in_traces`/`retention_days` (they stay `null` in V1.6). Capabilities whose `input_schema.properties` contains no canonical PII keys produce byte-identical manifests pre- and post-M25. An M25-driven `redaction.pii_fields` change (empty → non-empty) flips the M13 `capability_digest`; the capability will surface in `tusq diff` and stay filtered out of `tools/list` until a reviewer re-approves it via `tusq approve` — the M13 approval gate is the correct migration path. The V1.6 canonical list is frozen; any expansion is a material governance event under its own future ROADMAP milestone with its own re-approval expectation. The framing is deliberate: `redaction.pii_fields` is "well-known PII field-name hints derived statically from source-declared field keys" (SYSTEM_SPEC Constraint 16) — NOT "PII detection," "PII validation," "PII-validated," "GDPR-compliant," "HIPAA-compliant," "PCI-compliant," or "automated redaction"

What it does not do yet matters just as much: `v0.1.0` does not proxy live API calls (even under `--policy` with `mode: "dry-run"`, `tools/call` always returns `executed: false` and makes no outbound request to the target product), does not ship an interactive review UI, and does not support frameworks beyond Express, Fastify, and NestJS.

The proof points for this launch are intentionally concrete: reviewed manifest output, repo-local `tusq approve` approval with audit trail (`approved_by`, `approved_at`), compiled tool definitions, provenance back to source, visible governance metadata (`side_effect_class`, `sensitivity_class`, and `auth_hints`), reviewable `redaction` policy, inspectable `examples` and `constraints` in the describe-only runtime surface, an inspectable describe-only MCP surface, an offline, deterministic Markdown capability review packet from `tusq docs`, an opt-in dry-run response shape under `tusq serve --policy` that emits a validated `dry_run_plan` with `executed: false` and a deterministic `plan_hash` — no live execution was added — one-step scaffolding of the governance artifact itself via `tusq policy init`, which writes a validator-round-trip-safe `.tusq/execution-policy.json` and defaults to the safe `mode: "describe-only"` unless a reviewer opts into `--mode dry-run`, a no-server `tusq policy verify` CI pre-flight that reuses the exact `loadAndValidatePolicy()` function `tusq serve --policy` uses — a PASS provably means the server will accept the same file, without starting an HTTP server or making any network call — an opt-in `tusq policy verify --strict --manifest <path>` manifest-aware cross-check that runs the shared validator first and then cross-references every name in `allowed_capabilities` against the manifest's approval-gated set, emitting deterministic `strict_errors` entries (`not_in_manifest`, `not_approved`, or `requires_review`) and exiting `1` on any mismatch, while the default `policy verify` path stays byte-for-byte identical to M22 and never opens the manifest, and an opt-in-by-source-pattern Fastify schema body-field extraction inside `tusq scan` that, when a Fastify route declares a literal `schema: { body: { properties, required } }` block, emits `input_schema` with `source: "fastify_schema_body"`, `additionalProperties: false`, declaration-order properties, and the declared `required` entries — zero new dependencies, no runtime evaluation, byte-for-byte fall-back to the pre-M24 placeholder on any non-literal schema, and Express/NestJS manifests byte-identical pre- and post-M24, and a static, name-only PII field-name redaction-hint extraction inside `tusq manifest` that auto-populates `capability.redaction.pii_fields` by matching `input_schema.properties` keys whole-key against a frozen 36-name V1.6 canonical PII set after `toLowerCase()` + strip `_`/`-` normalization, returning matched keys in source-declaration order with original casing preserved — zero new dependencies, no source-file reads, no value inspection, no network I/O, framework-agnostic, no `sensitivity_class` escalation, no `log_level`/`mask_in_traces`/`retention_days` auto-population, and byte-identical for capabilities whose `input_schema.properties` contains no canonical PII keys.

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
# on a Fastify repo, routes with a literal `schema: { body: { properties, required } }`
# block now emit declared top-level field shapes into `input_schema.properties`
# (source: "fastify_schema_body", additionalProperties: false, declaration order);
# non-literal schemas and all Express/NestJS routes fall back byte-for-byte to the
# pre-M24 placeholder. No new CLI flag — this is just `tusq scan` doing more on
# source-literal pattern match.
tusq manifest
# every capability's `redaction.pii_fields` is now auto-populated from
# `input_schema.properties` keys that match the frozen V1.6 36-name PII set
# (e.g. `email`, `password`, `user_email`, `phone_number`, `ssn`, `creditcard`,
# `apikey`) after toLowerCase() + strip _ and - normalization; matching is
# whole-key only, so `email_template_id` does NOT match `email`. M25 does not
# escalate `sensitivity_class` and does not auto-populate `log_level`,
# `mask_in_traces`, or `retention_days`. Capabilities whose properties contain
# no canonical PII keys produce byte-identical manifests to pre-M25. Populating
# `pii_fields` on a previously empty capability flips the M13 `capability_digest`,
# so `tusq diff` will surface the change and `tools/list` will filter the
# capability out until it is re-approved.
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
# optionally layer the opt-in manifest-aware strict check on top;
# cross-references allowed_capabilities against the manifest's approval-gated set
# (default path without --strict is unchanged and never reads the manifest):
tusq policy verify .tusq/execution-policy.json --strict --manifest tusq.manifest.json --json
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
- For reviewers who want argument validation plus a plan preview before any future execution step exists, scaffold the policy in one step with `tusq policy init --mode dry-run --reviewer you@example.com` (or pass `--allowed-capabilities name,...` to scope the dry-run surface); add `--dry-run` to preview the emitted JSON without writing, or omit `--mode` entirely to accept the safe default `mode: "describe-only"`. Before starting the server, confirm the policy would be accepted with `tusq policy verify .tusq/execution-policy.json --json` — exit `0` with `{ ok: true, mode, path }` means `tusq serve --policy` will accept the same file, and `tusq policy verify` starts no server and makes no network call, so it is safe to drop into a CI pre-flight step. For teams that also want to catch drift between the policy's `allowed_capabilities` list and the manifest's approval state before serve is invoked, add `--strict --manifest tusq.manifest.json`; the strict check runs the shared validator first and then cross-references every allowed name against the manifest's approval-gated set, exiting `1` with deterministic `strict_errors` on any `not_in_manifest`, `not_approved`, or `requires_review` mismatch. `--strict` is opt-in — the default path never reads the manifest, and `--manifest` without `--strict` exits `1` with `--manifest requires --strict` before any file is read. Then start the server with `tusq serve --policy .tusq/execution-policy.json`; every `tools/call` still returns `executed: false`, and the `dry_run_plan.plan_hash` is stable across runs for identical validated inputs
- When the codebase or manifest changes, run `tusq diff --from <old-manifest> --to tusq.manifest.json --review-queue` to see what drifted, and use `--fail-on-unapproved-changes` if you want a CI gate
- Review `tusq.manifest.json` before approving any capability, especially approval state, optional approval trail, provenance, `side_effect_class`, `sensitivity_class`, `auth_hints`, and `redaction`; on a Fastify repo, also check `input_schema.source` for any capability whose body shape matters — `fastify_schema_body` means the scanner captured the literal declared body schema (with `additionalProperties: false`, declared fields in declaration order, and declared `required` preserved), while `framework_schema_hint` or `request_body` means the route fell back to the pre-M24 placeholder; the framing is "the declared body schema as it appears literally in source," not a runtime-enforcement claim, and Fastify at request time may enforce additional constraints (formats, custom ajv keywords, pre-validation hooks) that the static extractor does not see. Also review `redaction.pii_fields` on every capability — under M25 (V1.6), the array is now auto-populated by matching `input_schema.properties` keys whole-key against a frozen 36-name canonical PII set (Email/Phone/Government ID/Name/Address/DOB/Payment/Secrets/Network) after `toLowerCase()` + strip `_`/`-` normalization, returning matches in source-declaration order with original casing preserved (`user_email` stays `user_email`); a name match means "the field key matches a well-known PII canonical name," NOT "the field carries PII at runtime" and NOT "the route is GDPR/HIPAA/PCI-compliant" (SYSTEM_SPEC Constraint 16) — reviewers remain responsible for final redaction posture, including whether `log_level`, `mask_in_traces`, and `retention_days` should be tightened from their V1 defaults (M25 leaves those at `null`). Capabilities whose `input_schema.properties` contains no canonical PII keys produce a `pii_fields: []` byte-identical to pre-M25
- After compile, inspect describe-only `examples` and `constraints` in `tools/call` so the runtime-facing payload matches your intended usage boundaries
- Treat the first run as an inspection workflow: check confidence, domain grouping, provenance, and the describe-only MCP output
- Best first proof: approve one or two capabilities only, then verify that `tools/list` and `tools/call` reflect exactly what you expected
- Wait to publish a public package-manager install step until distribution is confirmed

## Social Copy

### X / short post

`tusq.dev v0.1.0` is out.

It scans supported Node.js SaaS backends (`Express`, `Fastify`, `NestJS`), generates a reviewable `tusq.manifest.json`, compiles approved capabilities into JSON tool defs, and exposes them through a local describe-only MCP endpoint.

This release proves repo → reviewed manifest → approved tool JSON → inspectable describe-only MCP, with visible approval state, optional approval trail, governance metadata like `side_effect_class`, `sensitivity_class`, and `auth_hints`, reviewable `redaction`, plus inspectable `examples` and `constraints`, not live execution. `tusq serve --policy` is available as an opt-in dry-run that emits a validated `dry_run_plan` with `executed: false` and a deterministic `plan_hash` — still no live execution. `tusq policy init` scaffolds the reviewer-signed `.tusq/execution-policy.json` in one step (default `mode: "describe-only"`, opt-in `--mode dry-run`), and the generated file is validator-round-trip-safe. `tusq policy verify` adds a no-server CI pre-flight that reuses the exact `loadAndValidatePolicy()` the server uses — PASS proves `tusq serve --policy` will accept the same file. `tusq policy verify --strict --manifest <path>` adds an opt-in manifest-aware cross-check that emits deterministic `strict_errors` for any `not_in_manifest`, `not_approved`, or `requires_review` mismatch in `allowed_capabilities`, while the default `policy verify` path stays byte-for-byte identical to M22. `tusq scan` now captures Fastify routes declaring a literal `schema: { body: { properties, required } }` block and emits declared top-level field shapes into `input_schema` (`source: "fastify_schema_body"`, `additionalProperties: false`) — no new flag, zero new deps, byte-identical fall-back for non-literal Fastify schemas and all Express/NestJS routes. `tusq manifest` now auto-populates `redaction.pii_fields` by matching `input_schema.properties` keys whole-key against a frozen 36-name V1.6 canonical PII set (Email/Phone/Government ID/Name/Address/DOB/Payment/Secrets/Network) after `toLowerCase()` + strip `_`/`-` normalization — no new flag, framework-agnostic, no `sensitivity_class` escalation, byte-identical for capabilities without canonical PII keys, and explicitly framed as "well-known PII field-name hints" — not "PII detection" or "GDPR/HIPAA/PCI-compliant." `tusq diff` closes the loop when code changes by emitting a review queue of drifted capabilities that can gate CI.

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
- opt-in manifest-aware strict verification via `tusq policy verify --strict --manifest <path>`, which cross-references every name in `allowed_capabilities` against the manifest's approval-gated capability set and emits deterministic `strict_errors` with reasons `not_in_manifest`, `not_approved`, or `requires_review` (default path unchanged — never opens the manifest; `--manifest` without `--strict` exits `1` with `--manifest requires --strict` before any file read)
- Fastify schema body-field extraction inside `tusq scan`: when a route declares a literal `schema: { body: { properties, required } }` block, `input_schema` emits declared top-level field shapes in declaration order with `source: "fastify_schema_body"` and `additionalProperties: false`; static-literal only (zero new deps, no `eval`), Fastify-only, body-only, top-level-only, byte-identical fall-back on any non-literal schema, path-param name wins over same-name body field, and framed as "the declared body schema as it appears literally in source" — not validator-backed, not runtime-enforced
- Static, name-only PII field-name redaction hints inside `tusq manifest` (M25 — V1.6): `redaction.pii_fields` is auto-populated by matching `input_schema.properties` keys whole-key against a frozen 36-name V1.6 canonical PII set (Email/Phone/Government ID/Name/Address/DOB/Payment/Secrets/Network) after `toLowerCase()` + strip `_`/`-` normalization, in source-declaration order with original casing preserved (`user_email` stays `user_email`); pure in-memory function (zero new deps, no `eval`, no value inspection, no source-text regex, no network I/O, no PII/NLP library import), no new CLI flag, framework-agnostic, no `sensitivity_class` escalation (stays `"unknown"`), no `log_level`/`mask_in_traces`/`retention_days` auto-population (stay `null`), byte-identical fall-back for capabilities with no canonical PII keys, whole-key only (no substring/tail/regex — `email_template_id` does NOT match `email`), V1.6 canonical list frozen, and framed as "well-known PII field-name hints derived statically from source-declared field keys" — NOT "PII detection," "PII validation," "GDPR/HIPAA/PCI-compliant," or "automated redaction"
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
