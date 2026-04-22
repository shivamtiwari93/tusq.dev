# Launch Plan

## Challenge To Prior Framing

- The previous launch framing was directionally accurate but still too abstract at the top: it named tusq.dev as a "capability compiler" before it made the buyer pain operational
- The previous pass also overloaded the first screen with governance detail before stating the proof path a buyer can verify in one session
- The previous pass also described a six-step workflow that pre-dated M16 and left `tusq diff` out of the launch narrative entirely, even though the command is shipped and CI-ready on HEAD
- A subsequent pass still wrote the approval step as "edit the manifest by hand" even after `tusq approve` shipped in M18 with explicit `--reviewer`, `--all`, `--dry-run`, and `--json` flags; launch copy must call that first-class command by name so the approval trail reads as a governed operator action, not a text-editor ritual
- The most recent pass still listed a 10-command CLI surface even after `tusq docs` shipped in M19 as an offline, deterministic Markdown capability-documentation generator; launch copy must include the 11th command and frame `tusq docs` as the shareable review artifact that complements the manifest and describe-only MCP surface
- The most recent launch pass also still framed `tusq serve` as a single describe-only response shape even after M20 shipped the `--policy` flag, the `.tusq/execution-policy.json` governance artifact, and the opt-in dry-run `tools/call` response (with `executed: false`, policy echo, and a deterministic `plan_hash`); launch copy must explain that dry-run is opt-in, that the approval gate is unchanged, and that no live execution was added
- The prior launch pass also left the governance-artifact scaffolding step implicit — it told reviewers to "author `.tusq/execution-policy.json`" by hand even after M21 shipped `tusq policy init` as the 12th command with the flag set `--mode`, `--reviewer`, `--allowed-capabilities`, `--out`, `--force`, `--dry-run`, `--json`, `--verbose`; launch copy must call the command by name, state that default `mode` is `"describe-only"`, and be explicit that the generated file is validator-round-trip-safe against the M20 `tusq serve --policy` loader
- The prior launch pass stopped at the `policy init` subcommand even after M22 shipped `tusq policy verify` as the second subcommand under the `policy` noun — a no-server CI pre-flight that reuses the M20 validator byte-for-byte, exits `0` on validator-parity PASS and `1` with the server's own error message on failure, and supports `--json` for machine-readable CI output; launch copy must name `tusq policy verify` as the CI pre-flight surface, state that it starts no server and performs no network I/O, and be explicit that a PASS is a provable guarantee that `tusq serve --policy` will accept the same file
- The prior launch pass stopped at `tusq policy verify`'s validator-parity check even after M23 shipped the opt-in `--strict [--manifest <path>]` flag pair that layers a manifest-aware cross-reference on top of the M22 validator; launch copy must name `--strict`, describe the three strict failure reasons (`not_in_manifest`, `not_approved`, `requires_review`), and be explicit that (a) default `policy verify` behavior is byte-for-byte identical to M22 and never reads the manifest, (b) `--manifest` without `--strict` exits `1` with `--manifest requires --strict` before any file read, (c) a strict PASS is a verify-time policy/manifest alignment statement only, not a runtime/execution/freshness/reachability claim, and (d) `tusq serve --policy` does not enforce strict checks and continues to silently drop unlisted or unapproved capabilities from `tools/list`
- The prior launch pass framed the scan step as producing a permissive body placeholder for every route, even after M24 shipped opt-in-by-source-pattern Fastify schema body-field extraction inside `tusq scan`; launch copy must name the new `source: "fastify_schema_body"` value, note that Fastify routes with a literal `schema: { body: { properties, required } }` block now emit declared top-level field shapes in declaration order (with `additionalProperties: false`), and be explicit that (a) no new command or flag was added and the extraction is active by default on source-literal pattern match, (b) non-literal or unbalanced Fastify schemas and all Express/NestJS routes fall back byte-for-byte to the pre-M24 M15 placeholder, (c) path-parameter names win over body-declared field names of the same key, (d) an M24-driven `input_schema` change flips the M13 `capability_digest` and requires fresh `tusq approve` re-approval before `tools/list` re-surfaces the capability, and (e) `fastify_schema_body` means "the declared body schema as it appears literally in source" — NOT "validator-backed," "runtime-enforced by Fastify," or "ajv-validated" (SYSTEM_SPEC Constraint 14)
- For launch, the first screen should answer four questions in order: who this is for, what problem it solves, what proof exists today, and where V1 stops
- Governance detail stays important, but it should support the operator story rather than replace it
- Re-review after change is part of the operator story: `tusq diff` turns manifest-version comparison into a review queue so governed exposure stays governed as the codebase evolves

## Launch Goals

1. Launch tusq.dev `v0.1.0` with a clear, defensible promise: existing Node.js SaaS teams can turn product behavior they already run into a reviewed manifest and describe-only MCP surface in one CLI workflow.
2. Attract the right first adopters: engineering and platform teams on Express, Fastify, or NestJS who are already exploring agent tooling and MCP.
3. Prevent category confusion by separating the shipped OSS CLI from the broader tusq.dev vision and tusq.cloud roadmap.
4. Create enough clarity that early users know exactly what to try first, what to trust, and what is intentionally deferred.

## Launch Narrative

### Core story

- tusq.dev v0.1.0 is for incumbent SaaS teams that already have product logic in a supported Node.js backend and need a reviewed way to make that logic inspectable by AI systems
- The defensible proof is concrete and skimmable: scan the repo, inspect the manifest, approve capabilities manually, compile approved tool JSON, and inspect the resulting describe-only MCP surface
- The launch should sell the operator control model as much as the automation model: reviewed manifest, explicit approval, optional approval trail, preserved provenance, inspectable governance metadata, inspectable redaction policy, and inspectable output

### First user action

- Direct early adopters to run tusq.dev locally against a real Express, Fastify, or NestJS repo
- Ask them to inspect `tusq.manifest.json` first, with special attention to provenance, `side_effect_class`, `sensitivity_class`, `auth_hints`, approval fields, and `redaction`, then approve one or two capabilities, compile, and confirm the describe-only MCP `examples` and `constraints` match expectations
- Treat scanner misses, low-confidence routes, and awkward manifest edits as feedback fuel for the next release
- Do not optimize the launch flow around `tusq serve` alone; the key product moment is seeing existing product behavior become a reviewable manifest before exposure

## Message Hierarchy

1. Lead with the audience filter: existing Express, Fastify, or NestJS SaaS teams with real product logic already in production or active development.
2. State the operator problem in one line: the product logic already exists, but there is no reviewed path to make it AI-visible.
3. State the proof sequence in one line: supported repo -> reviewed manifest -> approved tool JSON -> describe-only MCP.
4. State the boundary immediately after the proof: no live execution, no hosted control plane, no non-Node support in V1.
5. End with the repo-local CTA and an explicit ask for edge-case feedback.

## Required Assets

### Must publish at launch

- A launch announcement that names the release as `tusq.dev v0.1.0`
- Messaging that stays inside the verified product boundary: scan (including M24 source-literal Fastify body-field extraction that emits `input_schema.source: "fastify_schema_body"` with `additionalProperties: false` and declared field ordering when a Fastify route declares a literal `schema: { body: { properties, required } }`, and falls back byte-for-byte to the pre-M24 placeholder otherwise), manifest, review, approve (with reviewer identity and timestamp), compile, describe-only MCP serve, opt-in dry-run plan emission via `tusq serve --policy` with a reviewer-signed `.tusq/execution-policy.json`, one-step governance-artifact scaffolding via `tusq policy init` (safe default `mode: "describe-only"`), no-server CI pre-flight validation via `tusq policy verify` with validator parity against `tusq serve --policy`, opt-in manifest-aware strict verification via `tusq policy verify --strict --manifest <path>` that cross-references `allowed_capabilities` against the manifest's approval-gated set, diff-based drift re-review, and offline Markdown capability documentation via `tusq docs`
- A first-screen line in README and homepage hero that makes the buyer problem explicit before the category label
- A first-screen line in README and homepage hero that also states the proof path before any metadata inventory appears
- A simple terminal-first workflow example:
  `tusq init` → `tusq scan .` → `tusq manifest` → `tusq approve --all --reviewer you@example.com` → `tusq compile` → `tusq serve`
- An adoption-artifact example for share-outs: `tusq docs --out docs/capabilities.md` to generate a deterministic Markdown review packet from the current manifest
- An optional dry-run example for reviewers who want argument validation and a plan preview without adding live execution: scaffold the policy in one step with `tusq policy init --mode dry-run --reviewer you@example.com`, verify the file with `tusq policy verify .tusq/execution-policy.json --json` (exit `0` proves `tusq serve --policy` will accept the same file), optionally add `--strict --manifest tusq.manifest.json` to cross-reference `allowed_capabilities` against the manifest's approval-gated set before serve is invoked, then start `tusq serve --policy .tusq/execution-policy.json`; subsequent `tools/call` responses return `executed: false`, a policy echo, and a `dry_run_plan` object with a deterministic `plan_hash`. Reviewers who want to preview the policy without writing it can add `--dry-run` to `policy init`; reviewers who want to keep the runtime surface unchanged can omit `--mode` entirely and accept the safe default `mode: "describe-only"`. `tusq policy verify` starts no server and is safe to run as a CI pre-flight before `tusq serve --policy` is invoked, and `--strict` is opt-in — the default path never reads the manifest, and `--manifest` without `--strict` exits `1` with `--manifest requires --strict` before any file is read
- A follow-on CI-ready example for repeat runs:
  regenerate manifest → `tusq diff --from <old> --to <new> --review-queue` → re-approve drifted capabilities with `tusq approve <capability> --reviewer <id>` → `tusq diff --fail-on-unapproved-changes` in CI
- Release notes that spell out supported frameworks and deferred items
- Website or landing-page copy that reflects the actual V1 surface instead of the full long-term vision
- One sentence in every primary asset that explains what "governed" means in practice: inspect provenance, approval state, optional approval trail, mutation class, auth hints, sensitivity markers, redaction policy, and the describe-only usage context exposed through `examples` and `constraints`

### Strongly recommended supporting assets

- A short terminal demo or GIF using one of the fixture apps
- One annotated manifest example showing approvals, provenance, `side_effect_class`, `sensitivity_class`, `auth_hints`, and the `examples` / `constraints` values that flow into `tools/call`
- A concise FAQ covering "Does it execute tools?" and "Which frameworks are supported?"

## Dependencies

### Launch blockers to confirm before broad promotion

- Do not rely on `npm install -g tusq` in launch copy until package distribution is confirmed; the in-repo `package.json` is currently marked `private: true`
- Treat the top of `README.md` as a launch asset, not just internal documentation; many early users will meet the product there before they reach the website
- Ensure the README, homepage, announcement, and release notes all describe the same V1 boundary
- Ensure the README, homepage, announcement, and release notes describe "governed" the same way instead of collapsing it into a generic trust claim
- Ensure every primary asset answers "who is this for?" before it answers "what commands do I run?"
- Use a demo flow that stays inside verified product behavior: local CLI, local MCP, describe-only `tools/call`
- Have one reproducible sample project or fixture ready for screenshots and terminal capture

### Functional dependencies already satisfied

- QA has re-verified the CLI workflow and smoke suite against current HEAD
- Required launch-phase planning artifacts now exist with concrete content
- The release narrative can anchor on the verified `0.1.0` command surface and supported frameworks

## Risks

1. **Overclaim risk**
   The repo vision and older copy imply runtime learning, live execution, embedded surfaces, and broader capability composition. Launch copy must not inherit those promises.
2. **Expectation mismatch on MCP**
   Some developers will assume `tools/call` executes actions. The announcement and FAQ need to repeat that V1 `tusq serve` is describe-only by default and returns schema, examples, and constraints only. Under the opt-in `--policy` flag with `mode: "dry-run"`, `tools/call` still never executes — responses carry `executed: false`, a policy echo, and a validated `dry_run_plan`; copy must not describe dry-run as "live execution with a safety net." `tusq policy init` likewise defaults to `mode: "describe-only"` and only writes `mode: "dry-run"` when the reviewer passes `--mode dry-run` explicitly; copy must not imply scaffolding a policy flips the server into execution or out of the approval gate. `tusq policy verify` is a static validator invocation only — it starts no server, opens no port, and performs no network I/O; copy must not describe it as a runtime health check, a live probe, or a manifest validator, and a PASS proves validator parity with `tusq serve --policy`, not any runtime or execution property. `tusq policy verify --strict --manifest <path>` is an opt-in manifest-aware alignment check layered on top of that validator; copy must not describe a strict PASS as runtime safety, execution pre-flight, manifest freshness, or reachability, must not imply `--strict` is inferred from a manifest's presence (`--manifest` without `--strict` exits `1` with `--manifest requires --strict` before any file is read), and must not imply `tusq serve --policy` enforces strict checks — per M20, serve continues to silently drop unlisted or unapproved capabilities from `tools/list`. The M24 Fastify schema body-field extraction is similarly a verify-time source description, not a runtime guarantee: `source: "fastify_schema_body"` means "the declared body schema as it appears literally in the route file," not "validator-backed," "runtime-enforced by Fastify," or "ajv-validated," per SYSTEM_SPEC Constraint 14; copy must not imply the manifest reflects what Fastify actually enforces at request time (formats, custom keywords, pre-validation hooks remain invisible to the static extractor) and must not imply M24 adds a new command or flag — the extraction is active by default on source-literal pattern match inside the existing `tusq scan` command, and any non-literal `schema:`, missing `body:`, missing `properties:`, or unbalanced brace drops the `schema_fields` record and falls back byte-for-byte to the pre-M24 placeholder.
3. **Governance vagueness**
   If "governed" is left as slogan-level copy, buyers may miss that V1 already ships reviewable approval state, optional approval trail, and redaction policy alongside route provenance and classification metadata.
4. **Category abstraction overload**
   If we lead with "capability compiler" without first naming the incumbent-SaaS problem, the launch will sound like internal platform language rather than a concrete product wedge.
5. **Framework expectation drift**
   If the launch message sounds category-wide, teams on unsupported stacks will bounce immediately. Framework support should appear high in every primary asset.
6. **Heuristic scanner perception**
   The scanner is useful but not exhaustive. We should frame the manifest as reviewable output, not perfect autonomous understanding.
7. **Install-path ambiguity**
   Until the package/distribution path is finalized, the launch CTA should be "try it locally from the repo" rather than "install it from npm."

## Channel Guardrails

- Website and announcement: lead with audience + operator problem before the workflow proof and V1 boundary
- Website and announcement: keep the proof sentence short enough to skim before listing metadata fields
- Website and announcement: show at least one concrete example of the review surface, not just the word "governance"
- GitHub README and docs: tell users how to try the product today without implying a public package is already published
- Social posts: frame the release as a governed path from repo to reviewed manifest to describe-only MCP, not as a general AI agent platform
- Community posts: invite supported-stack users with real repos, not broad curiosity traffic from unsupported ecosystems
