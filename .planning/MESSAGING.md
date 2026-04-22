# Messaging

## Launch Correction

- Previous launch framing leaned too hard on the internal category label "capability compiler" before qualifying the buyer problem
- The last launch pass fixed most boundary issues, but it still let the governance inventory read like the headline instead of the proof
- Prior launch assets also lagged the shipped product surface: they described an eight-command CLI and a six-step workflow, omitting the `tusq diff` review-queue command that shipped in M16, then the subsequent pass still framed approval as "edit the manifest by hand" even after `tusq approve` shipped in M18 with reviewer identity, timestamp, and audit-trail flags, the most recent pass still described a 10-command surface even after `tusq docs` shipped in M19 as a repo-local Markdown capability-documentation generator, and the most recent launch pass still described `tools/call` as describe-only only, even after M20 shipped `tusq serve --policy` as an opt-in dry-run execution policy that emits a validated plan with `executed: false` and a deterministic `plan_hash` — no live execution added, but the runtime surface now has a second, reviewer-governed response shape that launch copy must explain
- The last launch pass still described an 11-command CLI surface and omitted the governance-artifact scaffolding workflow, even after M21 shipped `tusq policy` and `tusq policy init` as the 12th shipped command that writes a validator-round-trip-safe `.tusq/execution-policy.json` with `mode: "describe-only"` as the safe default; launch copy must name the 12-command surface, describe `tusq policy init` by its flag set, and be explicit that the default generated policy is `describe-only`, not `dry-run`
- The last launch pass still stopped at the `tusq policy init` subcommand even after M22 shipped `tusq policy verify` as the second subcommand under the `policy` noun — a no-server CI pre-flight that reuses the M20 `loadAndValidatePolicy()` validator byte-for-byte, accepts a policy path plus an optional `--json` flag, exits `0` with a validator-parity PASS when the file would be accepted by `tusq serve --policy`, and exits `1` with the same error shape as the server loader when it would not; launch copy must name `tusq policy verify`, describe it as a fast CI pre-flight with machine-readable JSON output, and be explicit that a PASS is a provable guarantee that `tusq serve --policy` will accept the same file (no drift between the two commands) without starting an HTTP server
- The last launch pass still described `tusq policy verify` as a single validator-parity check even after M23 shipped the opt-in `--strict` flag (and its supporting `--manifest <path>` flag) that cross-references every name in `allowed_capabilities` against the manifest's approval-gated set; launch copy must name the `--strict` flag, describe the three strict failure reasons (`not_in_manifest`, `not_approved`, `requires_review`), and be explicit that (a) default `tusq policy verify` behavior is byte-for-byte identical to M22 and never opens the manifest, (b) `--manifest` without `--strict` exits `1` with `--manifest requires --strict` before any file read, (c) `tusq serve --policy` still does not enforce strict checks and still silently drops unlisted or unapproved capabilities from `tools/list`, and (d) a strict PASS is a verify-time policy/manifest alignment statement only — not a runtime-safety, execution-pre-flight, manifest-freshness, or reachability claim
- The last launch pass still described Fastify route extraction as producing a permissive body placeholder even after M24 shipped opt-in-by-source-pattern Fastify schema body-field extraction in `tusq scan`; launch copy must name the new `fastify_schema_body` `input_schema.source` value, describe the shape change (declared top-level field names in declaration order, `required` preserved, `additionalProperties: false`), and be explicit that (a) the extraction is static-literal only — no Fastify, ajv, or TypeBox import and no runtime evaluation — (b) any parse ambiguity (non-literal `schema:`, missing `body:`, missing `properties:`, unbalanced braces) falls back byte-for-byte to the pre-M24 M15 placeholder, (c) Express and NestJS routes produce byte-identical manifests pre- and post-M24, (d) when a body field name collides with a path-parameter name, the path parameter wins and the body-declared field is dropped, (e) an M24-driven `input_schema` change flips the capability digest and requires fresh `tusq approve` re-approval before `tools/list` surfaces the capability, and (f) `fastify_schema_body` means "the declared body schema as it appears literally in source" — NOT "validator-backed," "runtime-enforced by Fastify," "ajv-validated," or "Fastify-enforced," per SYSTEM_SPEC Constraint 14
- The last launch pass still described `redaction.pii_fields` as a manually-edited array even after M25 shipped static, name-only PII field-name redaction hints inside `tusq manifest`; launch copy must name M25 as the V1.6 increment, describe the shape change (`redaction.pii_fields` is now auto-populated from `input_schema.properties` keys whose normalized form — `toLowerCase()` + strip `_`/`-` — matches the frozen 36-name `PII_CANONICAL_NAMES` set in `src/cli.js`), and be explicit that (a) matching is whole-key only after normalization — `user_email` matches but `email_template_id` does NOT, no substring/tail/regex/value inspection — (b) M25 adds no new CLI command, no new flag, and no environment-variable gate; the extraction runs by default inside existing `tusq manifest`, (c) M25 does NOT auto-escalate `capability.sensitivity_class` (it stays `"unknown"` in V1.6) and does NOT auto-populate `log_level`, `mask_in_traces`, or `retention_days` (they stay `null`), (d) capabilities with no canonical PII keys produce byte-identical manifests pre- and post-M25, (e) populating `pii_fields` on a previously empty capability flips the M13 `capability_digest` and requires fresh `tusq approve` re-approval before `tools/list` re-surfaces the capability, and (f) the canonical V1.6 list is frozen — any expansion is a material governance event that lands under its own ROADMAP milestone with its own re-approval expectation; framing is "well-known PII field-name hints derived statically from source-declared field keys" — NOT "PII detection," "PII validation," "GDPR-compliant," "HIPAA-compliant," "PCI-compliant," or "automated redaction," per SYSTEM_SPEC Constraint 16
- Launch copy should instead start with the operator reality: an existing Express, Fastify, or NestJS product, pressure to make that product AI-visible, and a need to keep review and control intact
- The category label still matters, but only after the audience, problem, proof sequence, and V1 boundary are clear
- The proof sentence must stay simple enough to skim: supported repo in, reviewed manifest out, governed `tusq approve` audit trail in, approved tool JSON out, describe-only MCP out by default, opt-in dry-run plan emission through `tusq serve --policy` when reviewers want argument validation and a plan preview, a `.tusq/execution-policy.json` that a reviewer can scaffold in one step with `tusq policy init` (safe default `mode: "describe-only"`, opt into `--mode dry-run` explicitly), drift re-reviewed through `tusq diff`, and adoption documentation generated offline through `tusq docs`

## Audience

### Primary

- SaaS engineering, platform, and AI-enablement teams with an existing Node.js codebase built on Express, Fastify, or NestJS
- Teams that want to expose product behavior to AI systems without rewriting business logic or hand-authoring tools from scratch

### Secondary

- CTOs and product leaders evaluating how to make an existing SaaS product AI-callable without losing governance
- Developer tooling adopters who want a self-hosted, OSS-first path to MCP exposure

### Not for V1

- Teams outside the JavaScript/TypeScript ecosystem
- Buyers looking for hosted execution, live API proxying, embedded chat UI, or autonomous agent workflows out of the box
- Teams that need runtime-learned capability modeling instead of a static-analysis-first workflow

## Positioning

### Category

tusq.dev v0.1.0 is an open-source governed capability compiler CLI for existing Node.js SaaS products.

### One-line Positioning

Give existing Node.js SaaS teams a reviewed path from supported product code to an inspectable describe-only MCP surface.

### Positioning Statement

For teams already running Express, Fastify, or NestJS services, tusq.dev is the OSS CLI that turns existing product behavior into a reviewed manifest, approved tool-definition JSON, and a local describe-only MCP surface without forcing teams to hand-author every tool. The operator proof is concrete: scan the repo, inspect `tusq.manifest.json`, approve what should be exposed, compile approved capabilities, then inspect the local MCP output. The review surface is concrete too: teams can inspect approval state, approval trail (`approved_by`, `approved_at`), provenance, `side_effect_class`, `sensitivity_class`, `auth_hints`, manifest-level `redaction` policy, and the describe-only `examples` and `constraints` that survive into downstream tool output. Unlike prompt wrappers or generic agent shells, tusq.dev starts from the product logic already running in the repo and keeps human review in the loop.

### Qualification Filter

- Best fit: a team already shipping a supported Node.js service, feeling pressure to make product functionality AI-visible, and unwilling to hand-author or blindly auto-generate tool catalogs
- Strongest launch hook: "You already have product logic. tusq.dev gives you a reviewed way to package it for AI systems."
- Disqualifier to say early: if a buyer needs hosted execution, a chat UI, or non-Node support on day one, this release is not for them

### Problem Framing

- The launch problem is not "how do we invent AI behavior from scratch?"
- The launch problem is "how do we expose existing product behavior to AI systems without losing reviewability, provenance, and operator control?"
- The launch message should state that operator problem before it states the category label
- That framing keeps the message anchored on incumbent SaaS teams, not generic AI curiosity traffic

### Messaging Pillars

1. **Start from the product you already have**
   Existing APIs, handlers, schemas, and auth hints are the raw material. V1 is for teams that already have working product logic and want a faster path to AI exposure.
2. **Review before you expose, and re-review when capabilities drift**
   The manifest is the contract. Users scan, inspect, approve, and then compile. Approval state is explicit, optional approval identity and timestamp can be recorded, and tusq.dev does not ask teams to trust an opaque generation step. When the codebase changes, `tusq diff` compares manifest versions and emits a review queue so approvers can re-confirm only what actually moved instead of re-reading the full manifest.
3. **Proof comes from inspectable artifacts**
   The launch proof is not abstract AI language. It is a visible chain of outputs: `.tusq/scan.json`, `tusq.manifest.json`, approved `tusq-tools/*.json`, and a local describe-only MCP endpoint.
4. **Governance and usage context are visible, not implied**
   Reviewers can see mutation class, sensitivity placeholder, auth hints, confidence, provenance, approval trail, manifest-level redaction policy, and describe-only usage context such as `examples` and `constraints` in downstream tool output.
5. **Expose product behavior without rebuilding the stack**
   V1 gets teams from repo to manifest to compiled tools to a local describe-only MCP endpoint in one terminal workflow.
6. **Be explicit about the V1 boundary**
   This release proves discovery, manifest generation, compile, review, and MCP exposure. It does not yet execute live product actions.

## Proof Stack

- Supported framework scope is narrow and explicit: Express, Fastify, and NestJS only
- Generated outputs are inspectable: `.tusq/scan.json`, `tusq.manifest.json`, and compiled `tusq-tools/*.json`
- Governance metadata is explicit in the artifact chain: `side_effect_class`, `sensitivity_class`, and `auth_hints` survive from manifest to compiled tools to MCP responses
- Governance is not just classification metadata: approval state is explicit in the manifest, optional `approved_by` / `approved_at` create an audit trail, and `redaction` defines masking and retention policy before exposure
- Describe-only usage context is inspectable in the runtime surface: `examples` and `constraints` survive from manifest to compiled tools to MCP `tools/call`
- Provenance survives the pipeline: compiled tool definitions can point back to the source file and line where a route was discovered
- MCP is real but intentionally constrained: `tools/list` works, and `tools/call` returns schema/example data instead of executing live actions
- The operator remains in control: approval is manual, compilation is explicit, and review output is non-interactive stdout

## Primary CTA

- Primary ask for launch: try tusq.dev locally on a supported Node.js repo and inspect the generated manifest before approving anything
- Preferred early-adopter promise: "clone the repo, run the CLI locally, and tell us where scanner or manifest edge cases appear"
- Exact CTA language to repeat: "Try tusq.dev locally from the repo on an Express, Fastify, or NestJS codebase."
- Exact qualification line to repeat near the CTA: "Best fit: an existing Express, Fastify, or NestJS service you already run, not a greenfield prototype or a hosted-agent evaluation."
- Exact hero-problem line to repeat in first screens: "Your product logic already exists. The missing piece is a reviewed path to make it AI-visible."
- Exact proof-path line to repeat in first screens: "Scan the repo, inspect the manifest, approve what should ship, then inspect the describe-only MCP output."
- Exact inspection prompt to repeat near demos: "Before you approve anything, inspect provenance, `side_effect_class`, `sensitivity_class`, and `auth_hints` in the manifest, then confirm the downstream `examples` and `constraints` match what you want AI clients to see."
- Exact "governed" line to repeat in launch assets: "Governed means you can inspect provenance, approval state, optional approval trail, auth hints, side-effect class, sensitivity marker, redaction policy, and the describe-only examples and constraints before anything is exposed."
- Do not promise a public package-manager install path until distribution is actually confirmed
- README, homepage, docs, and announcement should all use the same repo-local CTA so the first skim does not imply a published installer

## Product Truth

- Package version is `0.1.0`
- The CLI surface is `init`, `scan`, `manifest`, `compile`, `serve`, `review`, `docs`, `approve`, `diff`, `policy`, `version`, and `help`
- `tusq approve [capability] [--all] [--reviewer <id>] [--manifest <path>] [--dry-run] [--json] [--verbose]` sets `approved: true` on one or many capabilities and records `approved_by` / `approved_at` so approval is a first-class CLI action rather than a hand-edit
- `tusq diff` compares two `tusq.manifest.json` versions and, with `--review-queue`, emits a structured queue of capabilities that need re-review; `--fail-on-unapproved-changes` turns that queue into a CI gate
- `tusq docs [--manifest <path>] [--out <path>] [--verbose]` generates deterministic Markdown capability documentation from `tusq.manifest.json` — fully offline, no network or execution — so reviewers and adopters can share a human-readable artifact that mirrors approval state, governance metadata, redaction policy, examples, constraints, and provenance
- `tusq serve [--port <n>] [--policy <path>] [--verbose]` is describe-only by default; the optional `--policy <path>` flag loads a reviewer-signed `.tusq/execution-policy.json` and activates an opt-in dry-run response shape for MCP `tools/call`
- `.tusq/execution-policy.json` is the M20 governance artifact (fields: `schema_version`, `mode: "describe-only" | "dry-run"`, optional `allowed_capabilities`, optional `reviewer`, optional `approved_at`); when `mode: "dry-run"` is active, `tools/call` validates arguments and returns `executed: false`, a policy echo, and a `dry_run_plan` object with method, path, path_params, query, body, headers, auth_context, side_effect_class, sensitivity_class, redaction, a SHA-256 `plan_hash`, and `evaluated_at`
- Without `--policy`, behavior is byte-for-byte identical to V1 describe-only; `--policy` never bypasses the approval gate — `allowed_capabilities` is a strict subset filter on top of approval, never a replacement
- `tusq policy init [--mode <describe-only|dry-run>] [--reviewer <id>] [--allowed-capabilities <name,...>] [--out <path>] [--force] [--dry-run] [--json] [--verbose]` is the M21 command that scaffolds a valid `.tusq/execution-policy.json`; the default `mode` is `"describe-only"`, `--mode dry-run` is opt-in, and the generated file passes the M20 `loadAndValidatePolicy()` validator byte-for-byte so `tusq serve --policy` will accept it on the first try
- `tusq policy init` stamps `approved_at` at generation time, refuses to overwrite an existing file without `--force`, writes nothing under `--dry-run`, and performs no network, manifest, or target-product I/O; it is a pure local governance-artifact scaffolding step
- `tusq policy verify <path> [--json] [--verbose]` is the M22 subcommand that validates a `.tusq/execution-policy.json` file against the exact same `loadAndValidatePolicy()` function that `tusq serve --policy` uses at startup; it exits `0` on success (printing a PASS line with the policy `mode` and, with `--json`, a machine-readable `{ ok: true, mode, path }` result to stdout) and exits `1` on failure (printing the same validator error message that `tusq serve --policy` would emit, or, with `--json`, a machine-readable `{ ok: false, error, path }` result)
- `tusq policy verify` does not start an HTTP server, open a port, read the manifest, or make any network call; it is a pure local validator invocation intended for CI pre-flight and reviewer-loop use, and a PASS is a provable guarantee that `tusq serve --policy <same-path>` will accept the file on startup because both commands share the validator
- `tusq policy verify --policy <path> --strict [--manifest <path>] [--json] [--verbose]` is the M23 opt-in manifest-aware check that runs the M22 validator first and then cross-references every name in `allowed_capabilities` against the manifest's top-level `capabilities` array; a strict failure emits one entry per offending name with a `reason` of `not_in_manifest`, `not_approved`, or `requires_review`, preserving `allowed_capabilities` declaration order, and exits `1`; a strict PASS exits `0` and prints `Policy valid (strict):` (under `--json`, a `{ ok: true, mode, strict: true, path, manifest_path }` object)
- The M23 surface is opt-in in three separate ways: (1) the default `tusq policy verify` path never opens the manifest and is byte-for-byte identical to M22, (2) `--strict` is never inferred from the presence of a manifest file, and (3) `--manifest` without `--strict` exits `1` with `--manifest requires --strict` before any file read — codified as SYSTEM_SPEC Constraint 11
- A strict PASS from `tusq policy verify --strict` is a policy/manifest alignment statement at verify time only and must not be framed as runtime safety, execution pre-flight, manifest freshness, or reachability; `tusq serve --policy` does not enforce strict checks and, per M20, continues to silently drop unlisted or unapproved capabilities from `tools/list` — codified as SYSTEM_SPEC Constraint 12
- With `allowed_capabilities` unset (or an empty array), `tusq policy verify --strict` passes trivially and reads no capability from the manifest
- `tusq scan` M24 behavior: when a Fastify route declares a literal `schema: { body: { properties: {...}, required: [...] } }` block in its route-options object, the scanner captures the declared top-level field names into `input_schema.properties` in declaration order, preserves `required`, flips `input_schema.additionalProperties` to `false`, and sets `input_schema.source` to `fastify_schema_body`. The extraction is regex + balanced-brace only: no `fastify`, `ajv`, `@sinclair/typebox`, or JSON-Schema runtime is imported, no `eval` or `new Function` is used, and any parse ambiguity (non-literal `schema:`, missing `body:`, missing `properties:`, unbalanced braces) drops the entire `schema_fields` record and falls back byte-for-byte to the M15 placeholder (`additionalProperties: true`, `source: framework_schema_hint` or `request_body`)
- M24 is active by default on source-literal pattern match — no new CLI command, no new flag, no environment-variable gate; it is Fastify-only (Express and NestJS fixtures produce byte-identical manifests pre- and post-M24), body-only (other top-level schema keys such as `querystring`, `params`, `response` are not extracted), and top-level-only (nested object, array-of-object, and `$ref` field shapes are not captured)
- When a Fastify body schema declares a field whose name collides with a path parameter (e.g. `PUT /items/:id` with `body.properties.id`), the path parameter wins: the path-param entry (`source: "path"`, `type: "string"`) is preserved and the body-declared field is silently dropped
- An M24-driven `input_schema` change (permissive placeholder → declared-field shape) flips the capability's `capability_digest` (M13); the capability will be surfaced by `tusq diff` as drifted and will be filtered out of `tools/list` until a reviewer explicitly re-approves it via `tusq approve`
- `tusq manifest` M25 behavior: every capability's `redaction.pii_fields` is now auto-populated by a pure in-memory function (`extractPiiFieldHints` in `src/cli.js`) over the already-built `input_schema.properties` object. Each property key is normalized (`toLowerCase()` + strip `_`/`-`) and matched whole-key against the frozen `PII_CANONICAL_NAMES` Set; matched keys are returned in source-declaration order with original casing preserved (`user_email` stays `user_email`). The function performs no source-file read, no value inspection, no regex over source text, no network I/O, and imports no PII-detection or NLP library
- M25 is active by default — no new CLI command, no new flag, no environment-variable gate; it is framework-agnostic because it operates on the post-M15/M24 `input_schema.properties` object and therefore applies uniformly to Express path-param fields, Fastify body fields extracted under M24, and NestJS-derived capabilities
- The frozen V1.6 canonical PII set has 36 normalized names across 9 categories: Email (`email`, `emailaddress`, `useremail`); Phone (`phone`, `phonenumber`, `mobile`, `mobilephone`, `telephone`); Government ID (`ssn`, `socialsecuritynumber`, `taxid`, `nationalid`); Name (`firstname`, `lastname`, `fullname`, `middlename`); Address (`streetaddress`, `zipcode`, `postalcode`); DOB (`dateofbirth`, `dob`, `birthdate`); Payment (`creditcard`, `cardnumber`, `cvv`, `cvc`, `bankaccount`, `iban`); Secrets (`password`, `passphrase`, `apikey`, `accesstoken`, `refreshtoken`, `authtoken`, `secret`); Network (`ipaddress`). Any expansion of this list is a material governance event under its own future ROADMAP milestone
- Matching is whole-key only after normalization: `user_email`, `userEmail`, `USER_EMAIL`, and `user-email` all normalize to `useremail` and match. `email_template_id` normalizes to `emailtemplateid` and does NOT match. Substring and tail-match are forbidden by SYSTEM_SPEC Constraint 15
- M25 does NOT auto-escalate `capability.sensitivity_class` — it remains `"unknown"` in V1.6 regardless of `pii_fields` content. M25 does NOT auto-populate `redaction.log_level`, `redaction.mask_in_traces`, or `redaction.retention_days` — those remain `null` in V1.6 and are owned by a future organizational-policy increment. Capabilities whose `input_schema.properties` contains no canonical PII keys produce byte-identical manifests pre- and post-M25
- An M25-driven `redaction.pii_fields` change (empty → non-empty) flips the capability's `capability_digest` (M13 hashes the full `redaction` object); the capability will be surfaced by `tusq diff` as drifted and will be filtered out of `tools/list` until a reviewer explicitly re-approves it via `tusq approve` — the M13 approval gate is the correct migration path, not a regression
- Supported frameworks are Express, Fastify, and NestJS only
- `tusq scan` uses static heuristics to detect routes and write `.tusq/scan.json`
- `tusq manifest` generates `tusq.manifest.json` and preserves prior approvals
- Capability approval is repo-local in V1: users run `tusq approve <capability>` or `tusq approve --all` to set `approved: true` intentionally
- Approval trail exists in V1 at the manifest layer: `tusq approve` records `approved_by` and `approved_at`
- `tusq compile` emits JSON tool definitions only for approved capabilities
- `tusq review` is non-interactive and prints a grouped summary to stdout
- `tusq serve` exposes compiled tools through a local MCP HTTP endpoint
- MCP `tools/call` is describe-only in V1: it returns schema, example payloads, and constraints, not live API execution
- `redaction` ships in V1 as reviewable masking and retention policy that propagates to compiled tools and MCP `tools/call`
- Domain grouping exists at a basic level in V1; intelligent cross-resource capability composition does not
- Runtime learning, plugin APIs, non-Node ecosystems, hosted delivery, and embedded UI are deferred beyond V1

## Claims We Can Defend

- tusq.dev can scan supported Node.js frameworks and extract route-level capability candidates from a real codebase
- tusq.dev can generate a reviewable `tusq.manifest.json` from scan data and preserve approvals across regeneration
- tusq.dev can approve selected manifest capabilities with `tusq approve`, recording reviewer identity and timestamp
- tusq.dev can compile approved capabilities into structured JSON tool definitions
- tusq.dev can preserve provenance from discovered routes into compiled tool definitions
- tusq.dev surfaces governance metadata reviewers can inspect before exposure: `side_effect_class`, `sensitivity_class`, and `auth_hints`
- tusq.dev can expose compiled tools through a local, describe-only MCP server with inspectable schema, examples, and constraints
- tusq.dev can compare manifest versions with `tusq diff`, emit a review queue of drifted capabilities, and optionally fail on unapproved changes for CI enforcement
- tusq.dev can generate deterministic, offline Markdown capability documentation from a manifest with `tusq docs`, so approval trail, governance metadata, examples, constraints, and provenance can be shared with reviewers without running the MCP endpoint
- tusq.dev can opt into a reviewer-signed execution policy with `tusq serve --policy`, which activates dry-run validation and emits a structured plan (`executed: false`, policy echo, and a `dry_run_plan` with a deterministic `plan_hash`) so teams can audit what a future execution step would send without any live API call happening
- tusq.dev can scaffold that execution policy file in one step with `tusq policy init`, which writes a validator-round-trip-safe `.tusq/execution-policy.json` (safe default `mode: "describe-only"`, opt-in `--mode dry-run`, optional `--reviewer` and `--allowed-capabilities`, `--force` to overwrite, `--dry-run` to preview without writing) so reviewers do not have to hand-author the governance artifact
- tusq.dev can verify an execution policy file without starting a server via `tusq policy verify <path> [--json]`, which reuses the exact `loadAndValidatePolicy()` function that `tusq serve --policy` calls at startup, exits `0` with validator-parity PASS when the file would be accepted, exits `1` with the server's own error message when it would not, and is safe to use as a CI pre-flight gate because a PASS proves `tusq serve --policy` will accept the same file
- tusq.dev can opt into a manifest-aware strict check with `tusq policy verify --strict --manifest <path>`, which runs the shared M22 validator first and then cross-references every name in `allowed_capabilities` against the manifest's approval-gated set, emitting deterministic `strict_errors` with reasons `not_in_manifest`, `not_approved`, or `requires_review` and exiting `1` on any mismatch — safe to drop into CI/review gates, with the default path still byte-for-byte identical to M22
- tusq.dev can capture the declared body field shapes of Fastify routes that use a literal `schema: { body: { properties, required } }` block directly from source: `tusq scan` emits `input_schema` with `source: "fastify_schema_body"`, `additionalProperties: false`, property keys in declaration order, and the declared `required` entries, with zero new dependencies and no runtime evaluation — so the manifest documents what the source actually declares rather than a generic placeholder
- tusq.dev can pre-populate `capability.redaction.pii_fields` with well-known PII field-name hints derived statically from the already-built `input_schema.properties` keys: `tusq manifest` runs a pure in-memory function that normalizes each property key (`toLowerCase()` + strip `_`/`-`) and matches whole-key against a frozen 36-name V1.6 canonical set, returning matched keys in source-declaration order with original casing preserved — zero new dependencies, no source-file reads beyond what M15/M24 already perform, no value inspection, no network I/O, framework-agnostic, and capabilities with no canonical PII keys produce byte-identical manifests to pre-M25
- tusq.dev gives teams a governed path from existing SaaS code to AI-visible capability definitions without starting from prompts
- V1 is self-hosted and terminal-native; teams can run the workflow locally

## Claims We Must Not Make

- Do not say tusq.dev executes live product actions through MCP in v0.1.0 — even under `tusq serve --policy` with `mode: "dry-run"`, every `tools/call` response carries `executed: false` and the server makes no outbound HTTP, DB, or socket I/O against the target product
- Do not describe `--policy` as "live execution with a safety net"; it is opt-in dry-run argument validation plus plan emission, nothing more
- Do not imply `--policy` is required or default; `tusq serve` without `--policy` is byte-for-byte identical to the V1 describe-only surface
- Do not imply `tusq policy init` defaults to `dry-run` mode or bypasses any reviewer step; the generated file defaults to `mode: "describe-only"` and `--mode dry-run` must be requested explicitly
- Do not describe `tusq policy init` as a wizard, a runtime configurator, or a manifest-aware tool; it is a local, non-interactive governance-artifact scaffolder that reads no manifest and calls no network
- Do not describe `tusq policy verify` as a server, a runtime check, a health probe, or a manifest validator; it starts no HTTP server, opens no port, reads no manifest, and performs no network I/O — it is a static file check that runs the M20 validator once and exits
- Do not claim `tusq policy verify` PASS implies any runtime guarantee beyond validator parity with `tusq serve --policy`; it proves the policy file shape is acceptable to the server's loader, not that the resulting dry-run plan will match any particular tool call or that a future execution step is safe
- Do not describe `tusq policy verify --strict` as a runtime safety check, an execution pre-flight, a manifest freshness check, or a reachability probe; a strict PASS is a verify-time policy/manifest alignment statement only, and `tusq serve --policy` still does not enforce strict checks and still silently drops unlisted or unapproved capabilities from `tools/list`
- Do not imply `--strict` becomes the default when a manifest is present, that `--manifest` alone triggers strict mode, or that strict mode can be inferred — `--manifest` without `--strict` exits `1` with `--manifest requires --strict` before any file is read
- Do not describe the M24 Fastify schema body-field extraction as "validator-backed," "runtime-enforced by Fastify," "ajv-validated," "Fastify-enforced," "schema-validated at request time," or as any form of runtime enforcement — `source: "fastify_schema_body"` means "the declared body schema as it appears literally in source," per SYSTEM_SPEC Constraint 14; the manifest documents what the source declares, and Fastify at runtime may enforce additional constraints (formats, custom ajv keywords, hooks) that the static extractor does not see
- Do not imply M24 introduces a new command, new flag, or environment-variable gate; the extraction is active by default on source-literal pattern match inside existing `tusq scan`, and routes without a literal body schema fall back byte-for-byte to pre-M24 behavior
- Do not imply M24 coverage extends beyond Fastify, beyond the body, or beyond top-level fields — Express and NestJS manifests are byte-identical pre/post-M24; `querystring`, `params`, `response`, nested objects, array-of-object field shapes, and `$ref` references are intentionally out of scope for V1.5
- Do not describe the M25 PII field-name redaction hints as "PII detection," "PII validation," "PII-validated," "GDPR-compliant," "HIPAA-compliant," "PCI-compliant," "automated redaction," or any phrase that implies regulatory-grade or runtime-enforced PII handling — `redaction.pii_fields` is "well-known PII field-name hints derived statically from source-declared field keys" per SYSTEM_SPEC Constraint 16; a name match does NOT prove the field carries PII at runtime, and reviewers remain responsible for final redaction posture
- Do not imply M25 introduces a new command, new flag, or environment-variable gate; the extraction is active by default inside existing `tusq manifest` and runs uniformly across Express, Fastify, and NestJS capabilities. Do not imply M25 auto-escalates `sensitivity_class` (it remains `"unknown"` in V1.6) or auto-populates `log_level`, `mask_in_traces`, or `retention_days` (they remain `null` in V1.6)
- Do not imply M25 matching is substring, tail-match, regex, or value-aware — matching is whole-key only after `toLowerCase()` + strip `_`/`-` normalization. `email_template_id` does NOT match `email`. The V1.6 canonical set is frozen at 36 names; do not announce, hint at, or enumerate names that are not in the published V1.6 list
- Do not say tusq.dev infers full business logic, runtime behavior, or production-grade permissions perfectly
- Do not say tusq.dev supports Python, Go, Java, or arbitrary backend frameworks in v0.1.0
- Do not say tusq.dev includes an interactive approval UI, embedded chat experience, or hosted cloud control plane in v0.1.0
- Do not say tusq.dev replaces human review; V1 depends on manifest review and explicit `tusq approve` approval
- Do not publish `npm install -g tusq` as a launch CTA until package distribution is confirmed
