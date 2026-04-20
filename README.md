# tusq.dev

tusq.dev is the open-source capability compiler CLI for supported Node.js SaaS backends.

It is designed for teams that already have a working product with APIs, schemas, permissions, and business logic, and want a governed way to turn that existing code into reviewed capability definitions and a local describe-only MCP surface with inspectable provenance, approval state, optional approval trail, governance metadata, redaction policy, examples, and constraints.

## Current shipped surface in v0.1.0

`tusq.dev v0.1.0` currently ships a narrow, verified CLI workflow for supported Node.js backends:

- `tusq init`
- `tusq scan`
- `tusq manifest`
- `tusq compile`
- `tusq review`
- `tusq serve`

Current V1 boundaries:

- Supported frameworks: Express, Fastify, NestJS
- Approval flow: edit `tusq.manifest.json` directly and set `approved: true`
- Optional audit trail: record `approved_by` and `approved_at` in the manifest when you want reviewer identity and timestamp attached to a capability
- MCP behavior: describe-only in V1; `tools/call` returns schema, example payloads, and constraints, not live API execution
- Review policy surface: `redaction` is inspectable in the manifest and survives into compiled tools and `tools/call`
- Deferred beyond V1: runtime learning, plugin APIs, non-Node ecosystems, embedded UI, and hosted delivery

At its core, `v0.1.0` discovers supported product routes, models them in a reviewable manifest, compiles approved capabilities into strict JSON tool definitions, and exposes those definitions through a local describe-only MCP endpoint with inspectable runtime-facing redaction policy, examples, and constraints.

## Why tusq.dev exists

Most SaaS companies are not missing product logic. They are missing an AI-native way to access the product logic they already own.

Their codebases already contain:

- business workflows
- domain rules
- role and permission models
- structured APIs
- operational side effects
- years of edge-case handling

The problem is that these capabilities are rarely packaged in a form that is safe and ergonomic for LLMs, AI agents, or conversational interfaces.

tusq.dev exists to bridge that gap.

## One-line description

tusq.dev is an open-source capability compiler CLI that turns supported Node.js APIs into reviewed manifests, approved tool definitions, and a describe-only MCP surface.

## Best Fit

- existing Express, Fastify, or NestJS services with real product logic already in code
- teams that want to inspect approval state, provenance, side effects, auth hints, sensitivity markers, and redaction before exposing anything to AI systems
- buyers comfortable trying a repo-local CLI workflow first

## Not For V1

- teams expecting hosted execution or live MCP action execution
- teams outside Express, Fastify, or NestJS
- buyers who need an interactive approval UI instead of manifest review

## What tusq.dev does in v0.1.0

The shipped workflow today is:

1. run `tusq init` in a supported repo
2. scan routes with `tusq scan`
3. generate a reviewable `tusq.manifest.json` with `tusq manifest`
4. manually approve capabilities by editing the manifest
5. compile approved capabilities into JSON tool definitions with `tusq compile`
6. inspect grouped output with `tusq review`
7. expose compiled tools through a local describe-only MCP endpoint with `tusq serve`

The key point is the same: the product does not start from prompts. It starts from product behavior already encoded in code.

In practical terms, "governed" in `v0.1.0` means a reviewer can inspect provenance, approval state, optional approval trail, `side_effect_class`, `sensitivity_class`, `auth_hints`, `redaction`, and the downstream `examples` and `constraints` before exposing a capability.

## Core principle

APIs are implementation surfaces. Capabilities are product surfaces.

An endpoint like:

- `POST /invoices/refund`

is not what a user or an AI system actually wants.

What they want is something closer to:

- "Refund the last invoice for this customer if it is eligible, record the reason, and return the final status."

tusq.dev should discover, model, and compile the second thing, not just expose the first thing raw.

## Product boundary

Shipped in `v0.1.0`:

- repository-local discovery for Express, Fastify, and NestJS
- manifest generation with provenance and manual approval
- approved tool-definition compilation
- non-interactive review output
- local describe-only MCP serve

Deferred beyond `v0.1.0`:

- live tool execution or API proxying
- embedded UI or interface primitives
- plugin extension points
- non-Node ecosystems
- hosted governance and delivery

The managed operational layer belongs to `tusq.cloud`.

## Core workflow

The accurate launch workflow is:

1. clone the repo and run the CLI locally on a supported codebase
2. run `tusq scan .` to discover routes
3. run `tusq manifest` to generate `tusq.manifest.json`
4. review the manifest and set `approved: true` on capabilities to expose
5. run `tusq compile` to emit JSON tool definitions for approved capabilities
6. run `tusq serve` to expose those definitions through a local describe-only MCP endpoint

Until package distribution is explicitly confirmed, treat the repo-local CLI workflow as the supported way to try `v0.1.0`.

## Launch CTA

Try `v0.1.0` locally from the repo:

```bash
git clone https://github.com/shivamtiwari93/tusq.dev
cd tusq.dev
npm install
npm link
```

Then run the CLI against a supported Express, Fastify, or NestJS codebase and inspect the generated manifest before approving anything.

## Beyond v0.1.0 vision

The sections below describe the broader product direction and roadmap. They are not a claim that all of those surfaces ship in `v0.1.0`.

## What the engine should discover

### From code

- route maps
- handlers and controllers
- service boundaries
- DTOs and validators
- auth decorators and middleware
- internal naming patterns
- side-effect clues

### From APIs

- OpenAPI or generated schemas
- request and response shapes
- auth requirements
- error semantics
- idempotency patterns

### From data models

- schema structure
- relation graphs
- obvious entity semantics
- sensitivity clues such as PII or payments

### From runtime usage

- which endpoints matter in practice
- which payload shapes are common
- which edge cases recur
- which operations fail often
- which capabilities deserve dedicated tools instead of generic wrappers

## The canonical artifact: capability manifest

The manifest is the heart of tusq.dev.

It should be a reviewable, versionable contract that describes:

- capabilities
- tool boundaries
- input and output schemas
- side effects
- permissions
- approval requirements
- redaction rules
- examples
- grouping metadata

The manifest is how an organization reviews and ships agentic behavior as software rather than hand-written prompts.

## Long-range product modules

### 1. Ingestion and discovery

This module should:

- connect to repositories
- detect frameworks and routing patterns
- parse code statically
- extract schema hints
- detect auth and permission hints
- produce an internal model of product capabilities

### 2. Manifest generation

This module should:

- convert discovered behavior into a canonical JSON manifest
- preserve provenance back to source code or API surfaces
- mark uncertainty where discovery is incomplete
- surface review points rather than hide ambiguity

### 3. Tool compiler

This module should:

- produce strict tool definitions
- normalize schema boundaries
- attach examples and descriptions
- normalize errors
- preserve policy-relevant metadata

### 4. Skill and agent compiler

This module should:

- group tools by domain
- define domain-specific operational surfaces
- allow multi-step plans where appropriate
- preserve checkpoints, gating, and safe defaults

### 5. Local runtime

This module should:

- execute tools safely in a self-hosted environment
- support identity mapping
- support dry-run and confirmation modes
- enforce least privilege where possible
- record traces locally

### 6. MCP output

This module should:

- expose approved tools and skills as a standards-based MCP server
- support versioning and environment configuration
- make the customer's product usable by AI clients beyond the embedded UI

### 7. Basic interface layer

This module should:

- provide enough interface primitives to prove and use the system
- support embedded chat or command surfaces
- remain intentionally lighter than the hosted commercial delivery layer

## Full AI transition scope

This section is roadmap direction, not a description of the currently shipped `v0.1.0` surface.

Tusq.dev should not stop at "generate tools from APIs." If it is going to help a conventional SaaS company move into the AI era, it needs to automate the broader transition from API-first product architecture to capability-first AI-native product architecture.

That transition includes the following surfaces.

### 1. Capability discovery and normalization

Tusq.dev should:

- inspect routes, handlers, services, jobs, validators, and integrations
- infer higher-level business capabilities rather than exposing raw endpoints
- collapse low-level API details into reviewable product actions
- preserve provenance back to code and APIs for every generated capability

### 2. Auth and permission mapping

Tusq.dev should:

- infer roles, scopes, tenant boundaries, impersonation paths, and admin surfaces
- detect which actions are read-only, mutating, destructive, financial, or security-sensitive
- generate least-privilege execution hints and approval ladders

### 3. Data and schema understanding

Tusq.dev should:

- inspect ORM models, migrations, DTOs, validators, and database schemas
- infer entity relationships and domain semantics
- identify sensitive fields such as PII, secrets, financial data, and regulated data
- generate default redaction and retention hints for traces and logs

### 4. Runtime instrumentation

Tusq.dev should:

- provide middleware or SDK hooks to capture real payload shapes and failures
- observe latency, retries, auth context, and real-world error cases
- detect which APIs are used often, which are cold, and which are unstable
- refine capability boundaries based on actual runtime evidence

### 5. Safe execution wrappers

Tusq.dev should:

- compile capabilities into governed tools with validation and normalized errors
- support dry-run, confirmation, approval, and execution ladders
- attach idempotency, retry, timeout, and audit metadata where possible
- make risky operations explicit instead of burying them inside generic actions

### 6. Skill and agent composition

Tusq.dev should:

- group tools into domains such as billing, support, users, projects, and admin
- generate higher-level skills or domain agents from those tool groups
- support multi-step workflows with checkpoints and gated transitions
- create surfaces that map to real operator and end-user intents

### 7. AI-facing interface generation

Tusq.dev should:

- generate a local MCP server by default
- generate embedded chat or command surfaces for product-native usage
- support internal operator copilots and customer-facing assistants
- emit artifacts that can later be connected to external AI ecosystems

### 8. Eval and regression infrastructure

Tusq.dev should:

- generate golden-path capability tests
- generate schema validation and permission regression tests
- detect tool drift when APIs or schemas change
- track invalid tool calls, blocked actions, and failure patterns

### 9. Documentation and adoption surfaces

Tusq.dev should:

- generate human-readable docs for capabilities, tools, permissions, and examples
- create internal enablement docs for engineering, product, security, and support
- emit typed SDKs or clients where useful for internal development and debugging
- make the transition understandable, not just technically possible

### 10. Migration and rollout tooling

Tusq.dev should:

- support staged rollout from dev to staging to production
- generate phased rollout plans such as internal-only, support-only, admin-only, and customer-facing
- create checklists, kill switches, fallback paths, and validation gates
- help teams move incrementally instead of demanding an all-at-once migration

### 11. Governance and review workflows

Tusq.dev should:

- generate review queues for manifest and tool changes
- produce diffs between capability, policy, and schema versions
- make AI surface changes code-reviewable like normal software changes
- keep humans in the loop where risk or ambiguity is real

### 12. Competitive transition layer

Tusq.dev should:

- identify high-value product areas most exposed to AI-native competition
- rank which capabilities should be exposed first
- suggest early high-impact surfaces such as summaries, refunds, provisioning, triage, reporting, and account actions
- help teams prioritize the fastest credible path to an AI-native product surface

## Roadmap by version

The roadmap should be structured around what a conventional SaaS company absolutely needs first, what becomes much more valuable once the foundation is working, and what becomes the long-term moat.

### Must-have in V1

V1 should make the core transformation real.

- Capability discovery and normalization:
  repository scanning, framework detection, route and handler extraction, capability inference, provenance back to source.
- Auth and permission mapping:
  role and scope inference, tenant boundary detection, risk classification for read/write/destructive/financial actions.
- Data and schema understanding:
  DTO and validator extraction, ORM and schema inspection, relationship mapping, sensitivity tagging.
- Capability manifest generation:
  `tusq.manifest.json` as the reviewable contract with schemas, side effects, permissions, and examples.
- Safe execution wrappers:
  strict tools, normalized errors, dry-run support, confirmation and approval metadata, audit-friendly execution surfaces.
- Basic skill composition:
  domain grouping for tools and initial skill packs for common SaaS areas.
- MCP by default:
  a local standards-based MCP server as a first-class output.
- Basic interface surfaces:
  enough embedded assistant or command-palette capability to prove value in a real product.
- Basic docs and review artifacts:
  generated capability docs, tool docs, provenance, and human review surfaces.

If V1 cannot take a real SaaS repo to a reviewed manifest plus runnable tools plus an MCP endpoint quickly, it has not met the product bar.

### High-leverage in V2

V2 should turn a strong engine into a practical migration system.

- Runtime instrumentation:
  middleware and SDK hooks for real payloads, auth context, failure patterns, and hot-path analysis.
- Eval and regression infrastructure:
  golden-path tests, schema regression, permission regression, drift detection, and blocked-action tracking.
- Stronger migration and rollout tooling:
  environment-aware rollout plans, internal-first deployment paths, kill switches, fallback patterns, and rollout checklists.
- Richer docs and adoption surfaces:
  support docs, security review artifacts, operator docs, generated examples, and optional typed SDK output.
- Richer skill and workflow generation:
  multi-step skills, checkpointed plans, and more opinionated domain packs.
- Broader interface generation:
  stronger embedded UI primitives, internal copilots, and cleaner export paths into external ecosystems.
- Stronger governance workflows:
  structured diffs, approval queues, version review, and clearer human-in-the-loop paths.

V2 is where Tusq.dev becomes much easier for real product and platform teams to adopt without a long internal enablement project.

### Moat features in V3

V3 should make the product compounding and hard to replace.

- Runtime learning loop:
  refine schemas, examples, tool boundaries, and skill groupings from actual product usage and observed failures.
- Advanced analytics on capability usage:
  identify which capabilities matter most, which are fragile, and which deserve higher-order abstractions.
- Competitive transition intelligence:
  rank the product areas where an incumbent should move first to avoid losing to an AI-native competitor.
- Automated improvement proposals:
  suggest better tool boundaries, manifest updates, risk reclassification, and rollout priorities from evidence.
- Mature ecosystem export:
  stronger external integration artifacts, richer packaging surfaces, and broader interface adapters.
- Deep governance and change intelligence:
  capability diffs, policy diffs, schema diffs, and cross-version replay-oriented diagnostics.

V3 is where Tusq.dev stops being just a compiler and becomes the system that helps SaaS companies continuously evolve into AI-native products.

## Guiding principles

### Product logic over prompt tricks

tusq.dev should derive value from the product's real behavior, not from brittle prompt packaging.

### Reviewability over black-box generation

Every important output should be inspectable:

- discovered capabilities
- generated manifests
- tool definitions
- safety metadata

### Safety over convenience

The engine should prefer explicitness where there is ambiguity about:

- side effects
- permissions
- destructive actions
- sensitive data access

### Extensibility over framework lock-in

The project should support plugins for:

- framework detectors
- auth detectors
- schema extractors
- tool grouping logic
- policy packs
- UI packs

### Self-hostability over dependency sprawl

The OSS project should be genuinely useful for teams that want to keep everything inside their own environments.

## Intended users

### SaaS engineering teams

They want to unlock their product for AI-native interfaces without rewriting core systems.

### Platform teams

They want a structured, inspectable way to expose product capabilities to AI clients safely.

### Developer tooling teams

They want an engine that can be extended, scripted, and embedded into internal build and governance pipelines.

### Regulated or infra-heavy teams

They want to keep code, data, and runtime boundaries inside their own infrastructure.

## Installation and delivery philosophy

tusq.dev should be easy to install through common developer channels:

- npm
- Homebrew
- direct source checkout

The installation path should make the product feel like a real developer infrastructure tool, not a hosted-only product with a token CLI.

## Long-range success state

This section describes the broader target state over time, not the complete output of `v0.1.0`.

A team should be able to use tusq.dev and end up with:

- a clear picture of product capabilities
- a reviewed manifest
- a versioned set of tools
- domain-grouped skills or agents
- a local MCP server
- a simple but real assistant surface
- confidence that they are building on top of their existing product logic rather than around it

## Relationship to tusq.cloud

tusq.dev should be able to stand on its own.

But it should also have a clean upgrade path into tusq.cloud when a team wants:

- hosted execution boundaries
- dashboard and trace storage
- approval workflows
- hosted MCP
- team management
- analytics
- policy administration UI

The open-source engine should be complete enough that this upgrade feels optional and logical, not mandatory.

## Early roadmap

These milestones describe post-launch expansion beyond the narrow `v0.1.0` workflow documented above.

### Milestone 1: discovery foundation

- support a small number of common frameworks
- route and handler extraction
- basic schema inference
- auth hint extraction
- initial manifest format

### Milestone 2: capability compiler

- side-effect classification
- sensitivity tagging
- versioned manifest generation
- reviewable capability boundaries

### Milestone 3: tool and skill generation

- strict tool schema output
- grouped domain skills
- basic agent package structure
- local registry behavior

### Milestone 4: local runtime and MCP

- local execution runtime
- identity-aware execution hooks
- dry-run and confirm paths
- local MCP server

### Milestone 5: basic interface kit

- simple embedded assistant surfaces
- command palette support
- themed but minimal widget primitives

### Milestone 6: runtime learning loop

- instrumentation hooks
- observed payload refinement
- drift visibility
- example improvement proposals

## Positioning

tusq.dev is not:

- a generic chatbot wrapper
- a prompt library
- a retrieval-only product
- a UI replacement for the customer's SaaS

tusq.dev is:

- a capability discovery CLI
- a manifest compiler
- a tool-definition compiler
- a local describe-only MCP bridge
- a bridge from conventional SaaS logic to governed AI-visible capability surfaces

## Status

This directory is the home of the open-source CLI, docs, and launch assets for `tusq.dev v0.1.0`.

The goal is to keep the OSS product valuable, credible, and accurately scoped on its own while preserving a clean product boundary with `tusq.cloud`.
