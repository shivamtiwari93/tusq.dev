# Messaging

## Launch Correction

- Previous launch framing leaned too hard on the internal category label "capability compiler" before qualifying the buyer problem
- The last launch pass fixed most boundary issues, but it still let the governance inventory read like the headline instead of the proof
- Prior launch assets also lagged the shipped product surface: they described an eight-command CLI and a six-step workflow, omitting the `tusq diff` review-queue command that shipped in M16
- Launch copy should instead start with the operator reality: an existing Express, Fastify, or NestJS product, pressure to make that product AI-visible, and a need to keep review and control intact
- The category label still matters, but only after the audience, problem, proof sequence, and V1 boundary are clear
- The proof sentence must stay simple enough to skim: supported repo in, reviewed manifest out, approved tool JSON out, describe-only MCP out, drift re-reviewed through `tusq diff`

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
- The CLI surface is `init`, `scan`, `manifest`, `compile`, `serve`, `review`, `diff`, `version`, and `help`
- `tusq diff` compares two `tusq.manifest.json` versions and, with `--review-queue`, emits a structured queue of capabilities that need re-review; `--fail-on-unapproved-changes` turns that queue into a CI gate
- Supported frameworks are Express, Fastify, and NestJS only
- `tusq scan` uses static heuristics to detect routes and write `.tusq/scan.json`
- `tusq manifest` generates `tusq.manifest.json` and preserves prior approvals
- Capability approval is manual in V1: users edit `tusq.manifest.json` directly and set `approved: true`
- Approval trail exists in V1 at the manifest layer: users may also record `approved_by` and `approved_at`
- `tusq compile` emits JSON tool definitions only for approved capabilities
- `tusq review` is non-interactive and prints a grouped summary to stdout
- `tusq serve` exposes compiled tools through a local MCP HTTP endpoint
- MCP `tools/call` is describe-only in V1: it returns schema, example payloads, and constraints, not live API execution
- `redaction` ships in V1 as reviewable masking and retention policy that propagates to compiled tools and MCP `tools/call`
- Domain grouping exists at a basic level in V1; intelligent cross-resource capability composition does not
- Runtime learning, plugin APIs, non-Node ecosystems, hosted delivery, and embedded UI are deferred beyond V1

## Claims We Can Defend

- tusq.dev can scan supported Node.js frameworks and extract route-level capability candidates from a real codebase
- tusq.dev can generate a reviewable `tusq.manifest.json` from scan data and preserve manual approvals across regeneration
- tusq.dev can compile approved capabilities into structured JSON tool definitions
- tusq.dev can preserve provenance from discovered routes into compiled tool definitions
- tusq.dev surfaces governance metadata reviewers can inspect before exposure: `side_effect_class`, `sensitivity_class`, and `auth_hints`
- tusq.dev can expose compiled tools through a local, describe-only MCP server with inspectable schema, examples, and constraints
- tusq.dev can compare manifest versions with `tusq diff`, emit a review queue of drifted capabilities, and optionally fail on unapproved changes for CI enforcement
- tusq.dev gives teams a governed path from existing SaaS code to AI-visible capability definitions without starting from prompts
- V1 is self-hosted and terminal-native; teams can run the workflow locally

## Claims We Must Not Make

- Do not say tusq.dev executes live product actions through MCP in v0.1.0
- Do not say tusq.dev infers full business logic, runtime behavior, or production-grade permissions perfectly
- Do not say tusq.dev supports Python, Go, Java, or arbitrary backend frameworks in v0.1.0
- Do not say tusq.dev includes an interactive approval UI, embedded chat experience, or hosted cloud control plane in v0.1.0
- Do not say tusq.dev replaces human review; V1 depends on manifest review and manual approval
- Do not publish `npm install -g tusq` as a launch CTA until package distribution is confirmed
