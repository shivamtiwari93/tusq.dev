# Vision for tusq.dev

## Mission

tusq.dev exists to turn existing SaaS products into governed AI-native products.

The user should not experience tusq.dev as "we generated a manifest." The user should experience it as: "we pointed this at our SaaS codebase and got a working branded AI layer we can put in front of users, employees, and external AI ecosystems."

The manifest, tools, MCP server, policies, evals, and governance metadata are the machinery. The product outcome is an AI-capable SaaS experience: chat, voice, widgets, skills, marketplace packages, and safe action execution that respects the same business logic and IAM boundaries as the original SaaS portal.

## The Fight

Every established SaaS product is about to be attacked by AI-native competitors that start with conversational workflows, embedded copilots, voice actions, and agentic interfaces.

Incumbents already have the harder asset: years of product logic, permission models, tenant rules, edge cases, workflows, billing behavior, integrations, and operational knowledge. But that logic is trapped inside codebases and UI flows built for the pre-AI era.

tusq.dev unlocks that moat. It compiles the existing SaaS product into AI surfaces that can be shipped quickly, governed rigorously, and kept in sync as the product changes.

## The Promise

Point tusq.dev at a SaaS codebase. Get a working, brand-matched AI product layer in days.

That layer includes:

- AI tools with strict schemas
- skill packs grouped by product domain
- embeddable chat, widget, command-palette, and voice surfaces
- a self-hostable runtime and MCP server
- marketplace-ready packages for OpenAI, Claude, and other AI ecosystems
- governance, policy, audit, drift detection, and rollout artifacts

The promise is not "generate docs about your APIs." The promise is "ship your SaaS product's AI interface faster than an AI-native competitor can rebuild your workflows from scratch."

## Input Sources

tusq.dev should ingest every source that helps reconstruct how the SaaS product works, how users are allowed to act, what the company promises publicly, and how employees actually operate the business.

The core inputs are codebase, databases, public docs, and internal docs. The full input universe is broader.

### Code And API Surface

- REST routes, GraphQL resolvers, RPC/gRPC methods, webhooks, jobs, queues, and cron tasks
- request and response schemas from types, DTOs, validators, route definitions, and framework metadata
- status codes, error patterns, retry semantics, and normalized failure modes
- read, write, destructive, financial, security-sensitive, and admin-only side effects
- API contracts such as OpenAPI specs, GraphQL schemas, Postman collections, gRPC proto files, SDK definitions, and webhook specs

### Database, Warehouse, And Data Model

- relational schemas, document collections, indexes, constraints, foreign keys, and migration history
- ORM models, query builders, repositories, DTOs, serializers, and validation layers
- warehouse schemas, dbt models, saved SQL, BI dashboard definitions, metric catalogs, and semantic-layer conventions
- entity relationships, ownership paths, tenant boundaries, state fields, and lifecycle timestamps
- data lineage between operational tables, APIs, analytics events, and customer-facing surfaces

### Auth, IAM, Permissions, And Tenant Boundaries

- auth mechanisms such as JWT, session cookies, OAuth, API keys, basic auth, and custom middleware
- role checks, scope checks, policy checks, tenant scoping, and impersonation paths
- organization/workspace/project boundaries and ownership constraints
- the places where existing SaaS IAM is enforced and the places where it is ambiguous
- feature flags, entitlements, plan gates, SSO/SAML/OIDC settings, RBAC/ABAC policy files, permission tables, and admin overrides

The generated AI layer must respect the same access rules the logged-in user would have inside the SaaS portal.

### Frontend, Design System, And Product UX

- frontend routes, page components, dashboard layouts, forms, action menus, modals, tables, and command surfaces
- UI-side permission checks and feature gates
- design tokens, CSS variables, Tailwind config, theme files, component libraries, icons, logos, typography, radius, spacing, and motion conventions
- empty states, error states, onboarding flows, tooltips, product terminology, and microcopy
- user journeys that reveal how backend capabilities are actually exposed in the product

### Domain Model And Workflows

- entities such as users, organizations, invoices, projects, tickets, plans, subscriptions, and accounts
- relationships between entities
- state machines, workflow steps, eligibility logic, limits, required fields, and approval paths
- business processes hidden across routes, services, jobs, integrations, and UI conventions

tusq.dev should infer workflows first, then store them in explicit workflow/state artifacts that developers can inspect and edit when needed.

### Integrations And Side Effects

- third-party API calls such as billing, email, CRM, support, analytics, and identity providers
- emitted and consumed webhooks
- emails, notifications, background jobs, queue messages, and scheduled tasks
- external systems that may be affected by an AI-triggered action
- integration configs for Slack, Teams, Zendesk, Intercom, Salesforce, HubSpot, Gainsight, Stripe, Segment, data warehouses, and identity providers

### Public Docs And Market-Facing Truth

- help center articles, API docs, developer docs, public changelogs, release notes, status-page language, pricing pages, and onboarding docs
- public feature descriptions, support boundaries, legal disclaimers, trust/security pages, and integration marketplace listings
- brand voice, product terminology, customer-facing claims, and claims the company intentionally avoids

Public docs prevent generated AI surfaces from contradicting what customers have already been told.

### Internal Docs And Company Operating Knowledge

- support macros, escalation guides, troubleshooting trees, runbooks, incident retrospectives, security procedures, SOC2 controls, and audit processes
- sales engineering notes, CSM playbooks, implementation guides, onboarding plans, renewal-risk notes, customer-success health signals, and account plans
- product specs, PRDs, Linear/Jira tickets, roadmap docs, launch plans, deprecation plans, and internal changelogs
- compliance guidance, data-handling rules, legal review notes, and operational constraints

Internal docs make employee copilots, support copilots, implementation copilots, and governance artifacts substantially more useful than code alone.

### Data, Risk, And Sensitivity

- PII, payment data, secrets, regulated data, and customer-sensitive fields
- retention, redaction, logging, and trace-safety hints
- capability risk tags and review recommendations
- provenance back to the source files and runtime evidence used to infer each claim

### Optional Runtime Learning

When installed, middleware/SDK/runtime import paths should capture:

- real payload shapes without raw sensitive values
- common action sequences
- real failure cases and retry behavior
- usage frequency and hot paths
- latency and instability signals
- drift between static code assumptions and production behavior

Runtime learning sharpens the manifest and generated surfaces over time, but the OSS product must still be useful from static code alone.

### Source Inventory And Confidence

tusq.dev should produce an input inventory before it claims understanding.

The inventory should record:

- which sources were found
- which sources were missing
- which sources were configured but inaccessible
- confidence by domain: code, schema, auth, workflow, brand, docs, support, data, runtime, marketplace
- contradictions between sources, such as docs promising behavior the code does not expose
- the provenance behind every generated claim

The engine should not pretend all inputs are equal. Code may be authoritative for execution, docs may be authoritative for promise, and support tickets may be authoritative for friction.

## The Canonical Artifact

The canonical artifact is the Tusq Capability Manifest.

`tusq.manifest.json` describes what the SaaS product can safely expose to AI:

- capabilities with source provenance
- input and output schemas
- examples and expected tool-call shapes
- auth, IAM, tenant, role, and scope expectations
- side effects, sensitivity, redaction, retention, and risk tags
- workflow and state-machine references
- approval state and review metadata
- version history, digests, and drift signals

The manifest is not the whole product, but it is the contract that makes the generated AI product layer reviewable.

## What We Output

tusq.dev outputs a complete self-hostable AI product layer.

### Tools

Tools are the lowest-level AI-callable units. They are generated from approved capabilities and include:

- strict schemas
- normalized errors
- dry-run and confirmation support
- IAM context requirements
- audit metadata
- provenance back to source

### Skills

Skills group tools into domain-level packs such as:

- Billing operations
- Customer support
- Admin operations
- User and organization management
- Project or workflow management

Skills are V1 outputs. They should be useful to humans, MCP clients, generated widgets, and later domain agents.

### Agents

Domain agents are a later layer, not the first V1 bet.

V1 should generate tools, skills, UI surfaces, and workflow definitions first. Agents such as Billing Agent, Support Agent, and Admin Agent become first-class once workflow confidence, eval coverage, and governance controls are strong enough.

### Brand-Matched Chat Interface

The first user-facing AI surface is an embedded chat assistant, generated as a self-hostable output.

It should:

- use generated tools and skills
- understand the logged-in user's IAM context
- support safe action confirmation
- match the SaaS brand through extracted and configured brand tokens
- allow developers to override all CSS
- be embeddable in the SaaS dashboard

### Brand-Matched Voice Interface

Voice is a real V1 surface, not just future metadata.

The voice interface should:

- use the same tools, skills, IAM context, and governance rules as chat
- support speech input and speech output
- require confirmation for risky actions
- share the same brand and tone configuration as chat
- be self-hostable by the SaaS team

### Embeddable Widgets And Command Surfaces

tusq.dev should generate framework-agnostic embeddable surfaces:

- action widgets for workflows such as refund, assign, create, update, upgrade, suspend, or invite
- insight widgets for summaries, anomalies, recommendations, and next-best actions
- command palette / Ctrl+K style surfaces
- script-tag or web-component style embeds with config

React/Vue/Svelte packages can come later. V1 should prioritize framework-agnostic embeds that work in any SaaS frontend.

### MCP Server

MCP is a first-class output.

The generated MCP server exposes tools and skills with:

- versioned registry metadata
- approval-aware tool listing
- IAM-aware execution context
- dry-run and confirmation paths
- self-hosted runtime support

### Marketplace Packages

Marketplace packaging and publishing are V1 outputs.

tusq.dev should always be able to package/export the artifacts needed for external AI ecosystems:

- OpenAI ecosystem metadata
- Claude/Anthropic ecosystem metadata
- MCP registry metadata
- descriptions, example prompts, categories, icons, auth scopes, and version information
- validation reports and drift warnings

If developer accounts and credentials are provided, tusq.dev should optionally publish or update marketplace listings. Package/export always works; publish/update is credentialed and optional.

### Governance And Observability

Every output must be governed by default:

- approval gates for destructive, financial, admin, or sensitive actions
- audit logs and traces
- replay and dry-run artifacts
- policy files and review queues
- drift detection when the SaaS codebase changes
- evals and regression fixtures for generated tools, skills, and surfaces

Governance exists to make the AI layer shippable, not to slow it down.

### Knowledge Artifacts

tusq.dev should generate knowledge artifacts from public docs, internal docs, support systems, and code-derived product truth.

Outputs include:

- canonical product Q&A
- RAG indexes and retrieval manifests
- support macros
- troubleshooting trees
- escalation playbooks
- onboarding guides
- customer-facing help flows
- internal operator guides

Knowledge artifacts must cite source provenance and flag contradictions between docs, code, and observed runtime behavior.

### Employee Copilots

Beyond customer-facing surfaces, tusq.dev should generate employee-facing copilots:

- Support Copilot
- Sales Engineer Copilot
- CSM / Account Copilot
- Implementation / Onboarding Copilot
- Admin / Operations Copilot
- Security Review Copilot

These copilots should combine tools, skills, workflows, knowledge artifacts, IAM context, customer/account context, and governance policies. They are not separate products; they are generated roles over the same capability graph.

### Data And Analytics Artifacts

When database, warehouse, metrics, and BI inputs are available, tusq.dev should generate AI-safe data artifacts:

- semantic-layer summaries
- metric catalogs
- entity graphs
- lineage maps
- safe SQL tool definitions
- dashboard Q&A tools
- anomaly explanation helpers
- data-access governance notes

Data artifacts must respect tenant isolation, role permissions, masking rules, and metric definitions. A generated data tool is not allowed to bypass the SaaS company's data access model.

### Ecosystem Bots And Integrations

tusq.dev should generate integration packages for where SaaS employees and customers already work:

- Slack bots
- Microsoft Teams bots
- Zendesk apps or macros
- Intercom apps or workflows
- Salesforce and HubSpot copilots
- Gainsight / CSM assistants
- internal admin console embeds

These integrations should reuse the same tools, skills, auth adapters, policy gates, and audit trails as chat, voice, widgets, and MCP.

### Product Intelligence Artifacts

tusq.dev should turn product understanding into prioritization intelligence:

- capability maps
- feature usage maps
- workflow bottleneck reports
- support-friction reports
- churn-risk explainers
- automation opportunity rankings
- competitive exposure rankings
- "AI-enable this next" recommendations

These reports should be evidence-based and should separate code-derived facts, runtime-derived facts, support-derived signals, and speculative recommendations.

### Developer Artifacts

tusq.dev should make the generated AI layer maintainable by developers:

- SDK type definitions
- API/tool schemas
- generated integration tests
- eval fixtures
- drift reports
- migration plans
- changelog entries
- marketplace validation reports
- local development fixtures

Developer artifacts are what keep the AI layer from becoming a one-time demo.

## Brand System

The generated AI surfaces should feel native to the SaaS product.

tusq.dev should infer brand tokens from the codebase where possible:

- CSS variables
- Tailwind config
- theme files
- design-token files
- fonts
- logo references
- radius, spacing, color, and shadow conventions

But `tusq.brand.json` is the source-of-truth override layer. The flow is hybrid:

1. infer from the codebase when possible
2. write or update `tusq.brand.json`
3. let developers edit the file
4. generate chat, voice, widget, and marketplace surfaces from it
5. allow full CSS override for teams that want total control

Brand is not decoration. A SaaS company will only ship the generated AI layer if it feels like part of its product.

## IAM And Execution Model

The generated AI layer must follow the same IAM rules as the SaaS portal.

V1 should support two execution patterns.

### Same-Session Proxy

For embedded SaaS use, the default path should route AI actions through the SaaS app/session so existing cookies, JWTs, tenant context, middleware, and permission checks apply naturally.

The logged-in user can only do what they could have done in the SaaS portal.

### Generated Auth Adapter

For MCP, marketplace, voice, off-platform, and self-hosted runtime use, tusq.dev should generate auth adapters from detected codebase patterns and explicit configuration.

The adapter should carry:

- user identity
- tenant or organization context
- roles and scopes
- auth scheme
- policy requirements
- audit metadata

The adapter is not allowed to invent access. If tusq.dev cannot determine how access should work, the capability must require review or configuration before execution.

### Action Execution Policy

V1 should allow direct execution for low-risk, approved actions when IAM and policy allow it.

Risky actions require confirmation or approval:

- destructive actions
- financial actions
- admin actions
- permission changes
- sensitive data exports
- ambiguous or low-confidence actions

The default should be useful, but never reckless.

## Workflow And State Understanding

tusq.dev should infer business workflows and state machines from code.

It should inspect:

- routes
- services
- jobs
- validators
- enums
- database models
- status fields
- state transition functions
- integration handlers
- UI flow hints where available

It should produce explicit artifacts for inferred workflows and states so developers can inspect and correct them.

Candidate artifacts:

- `.tusq/workflows.json`
- `.tusq/state-machines.json`
- workflow references in `tusq.manifest.json`

The product should prefer inference, but it must make the inferred workflow model editable. Manual correction is not a failure; hidden inference is.

## OSS And Cloud Boundary

tusq.dev OSS should do everything needed to generate and self-host the AI product layer from the CLI.

OSS includes:

- codebase scanning
- manifest generation
- tools, skills, MCP server
- chat, voice, and widget artifacts
- marketplace package/export
- optional marketplace publish/update when credentials are configured
- local/self-hosted runtime
- config files
- policies
- audit files
- evals
- docs and rollout artifacts

OSS is CLI-first and self-hosted. It should not require tusq.cloud.

tusq.cloud does everything OSS does, plus provides a visual hosted control plane where employees of the SaaS company can:

- log in
- inspect everything tusq found in the codebase
- browse capabilities, schemas, auth, workflows, side effects, and integrations visually
- inspect generated tools, skills, chat, voice, widgets, MCP, and marketplace packages
- edit configuration and generated artifacts
- manage governance, approvals, teams, environments, and audit trails
- operate the system through a polished UI instead of CLI files
- use managed hosting, fleet observability, marketplace operations, and enterprise controls

Cloud is not where core capability lives. Cloud is where the same capability becomes easier to operate, review, govern, and scale across teams.

## Product Modules

### Ingestion

Local repos, GitHub repos, monorepos, multi-repo configurations, connected org systems, optional runtime imports, and explicit config files.

### Static Understanding

Framework detection, route extraction, schema extraction, auth detection, IAM mapping, service graphs, workflow inference, integration discovery, sensitivity tagging, and side-effect classification.

### Runtime Learning

Payload shape observation, error distributions, latency, retries, hot paths, usage frequency, and drift signals that improve generated artifacts over time.

### Capability Compiler

Converts discovered behavior into capability candidates with schemas, provenance, side effects, IAM requirements, examples, workflow references, and risk metadata.

### Tool And Skill Compiler

Compiles approved capabilities into strict tools and domain skill packs for chat, voice, widgets, MCP, and marketplace outputs.

### Surface Generator

Generates brand-matched chat, voice, command palette, action widgets, insight widgets, and framework-agnostic embeds.

### Runtime

Self-hostable execution runtime with same-session proxy, generated auth adapters, dry-run, confirmation, direct execution for approved low-risk actions, audit, trace, and policy enforcement.

### MCP And Marketplace

Generates MCP server output, marketplace packages, ecosystem metadata, icons, descriptions, example prompts, auth scopes, and optional credentialed publishing/update flows.

### Evals And Regression

Generates golden tasks, permission regression checks, schema drift checks, workflow tests, UI surface smoke tests, and marketplace package validation.

### Governance And Rollout

Produces review queues, diffs, approval gates, launch checklists, kill-switch/fallback guidance, staged rollout plans, audit logs, and operator documentation.

### Knowledge And Copilot Compiler

Combines public docs, internal docs, support artifacts, code-derived truth, and runtime signals into RAG indexes, Q&A packs, troubleshooting trees, employee copilots, and customer-facing help experiences.

### Data Intelligence Compiler

Converts database and warehouse understanding into semantic-layer summaries, metric catalogs, safe SQL tools, dashboard Q&A surfaces, anomaly explanations, and data-governance artifacts.

### Ecosystem Integration Compiler

Packages the generated tools, skills, surfaces, and copilots for Slack, Teams, Zendesk, Intercom, Salesforce, HubSpot, Gainsight, OpenAI, Claude, MCP, and other AI or SaaS ecosystems.

## Artifact Dependency Order

The fastest path to the full product is not to build every visible AI surface first. The visible surfaces should sit on a stable compiler stack.

The dependency order should be:

1. Input inventory and source confidence.
2. Capability manifest with provenance.
3. IAM, tenant, entitlement, and policy model.
4. Domain, entity, workflow, and state model.
5. Governance, approval, audit, and eval layer.
6. Tool layer.
7. Skill layer.
8. Knowledge layer from docs, support, and internal operating knowledge.
9. Brand system and surface configuration.
10. User-facing chat, command palette, widgets, and voice.
11. Employee copilots.
12. Ecosystem and marketplace packages.
13. Data and analytics artifacts.
14. Product intelligence and continuous-improvement artifacts.

This order matters because each layer accelerates the next. Skills are easier when tools are stable. Chat and widgets are safer when IAM and policy are explicit. Employee copilots are useful when knowledge artifacts and workflows exist. Product intelligence is credible only after runtime, support, and data signals have provenance.

## The Full Transition We Automate

The transition is not endpoint-to-tool. It is SaaS-to-AI-product.

The complete transition includes:

- codebase understanding
- capability discovery
- auth and tenant mapping
- workflow and state inference
- schema and domain modeling
- integration and side-effect discovery
- risk, sensitivity, and governance classification
- tool and skill generation
- branded chat, voice, and widget generation
- MCP and marketplace packaging
- self-hosted runtime generation
- IAM parity and policy enforcement
- eval, drift, and regression infrastructure
- knowledge and support artifact generation
- employee copilots
- data and analytics artifacts
- SaaS ecosystem bots and integrations
- product intelligence artifacts
- rollout and adoption artifacts
- runtime learning and continuous improvement

## Roadmap Shape: V1, V2, V3

tusq.dev should be built in three layers.

### Must-Have In V1

V1 proves that a SaaS company can point tusq.dev at a real codebase and get a usable AI product layer it can self-host.

V1 must include:

- input inventory and confidence report across code, database/schema, docs, brand, IAM, and runtime-configured sources
- capability discovery from common SaaS backend stacks
- schema, auth, IAM, tenant, sensitivity, side-effect, and workflow inference
- a reviewable Tusq Capability Manifest
- strict tool generation
- domain skill-pack generation
- basic knowledge artifacts from public/internal docs when provided
- self-hosted runtime
- same-session proxy for embedded use
- generated auth adapters for MCP/marketplace/off-platform use
- direct execution for low-risk approved actions
- confirmation gates for risky actions
- MCP server
- brand-token extraction plus `tusq.brand.json`
- framework-agnostic embedded chat
- working browser voice interface
- framework-agnostic action/insight widgets and command palette
- marketplace package/export
- optional marketplace publish/update when credentials are configured
- audit logs, traces, policies, evals, and rollout docs
- developer artifacts such as SDK types, tool schemas, drift reports, and eval fixtures

V1 wins if a SaaS team can run tusq.dev locally, review the generated artifacts, host them themselves, and put a branded AI surface into their product without waiting for tusq.cloud.

### High-Leverage In V2

V2 makes the system easier to adopt and safer to operate across product and platform teams.

V2 should deepen:

- runtime instrumentation and runtime learning
- richer workflow/state-machine inference
- stronger generated skill packs and checkpointed workflows
- employee copilots for support, sales engineering, CSM, implementation, admin, and security review
- richer knowledge artifacts from support systems and internal docs
- data and analytics artifacts such as semantic-layer summaries, metric catalogs, safe SQL tools, and dashboard Q&A
- ecosystem bots for Slack, Teams, Zendesk, Intercom, Salesforce, HubSpot, and Gainsight
- better UI theming and component variants
- deeper marketplace synchronization and drift repair
- broader framework support
- stronger eval and regression suites
- more complete rollout and migration tooling
- stronger governance files and review automation

V2 wins if tusq.dev becomes the practical migration system teams use to convert a serious SaaS product into an AI-native product layer.

### Moat Features In V3

V3 makes the product compounding and strategically hard to replace.

V3 should add:

- production feedback loops that refine schemas, tools, skills, workflows, and UI surfaces
- advanced usage intelligence
- competitive transition intelligence
- churn-risk explainers, workflow bottleneck reports, support-friction reports, and automation opportunity rankings
- automated improvement proposals
- deep governance and change intelligence
- stronger marketplace operations
- mature plugin ecosystem
- enterprise-grade cloud workflows built on the OSS engine

V3 wins if tusq.dev becomes the system of record for how conventional SaaS products evolve into AI-native products faster than competitors can copy them.

## Who This Is For

tusq.dev is for SaaS companies that already have valuable product logic and need to turn it into AI-native interfaces quickly.

It is for:

- product and engineering leaders who see AI-native competitors coming
- platform teams who will own the AI layer long-term
- developers who need a self-hostable CLI-first system
- security and governance teams who need reviewable AI behavior
- open-source builders who want to extend the compiler to more stacks and surfaces

It is not for teams that want a generic chatbot. It is not for teams that only want retrieval over docs. It is for teams that want their existing product to become AI-native without throwing away the codebase that already runs the business.

## What We Resist

- Becoming only a chatbot framework. Chat is one output; the product is SaaS-to-AI compilation.
- Becoming only an MCP generator. MCP is one output; the product includes chat, voice, widgets, skills, marketplace packages, governance, and runtime.
- Exposing every endpoint naively. The product is judgment about capabilities, workflows, IAM, and risk.
- Treating brand as cosmetic. Generated AI surfaces must feel native to the SaaS product.
- Treating governance as a blocker. Governance is what makes fast deployment credible.
- Hiding ambiguity. Unknown auth, schema, workflow, or IAM behavior must be surfaced, not guessed.
- Locking core value behind cloud. OSS must generate and self-host the full stack from the CLI.

## Risks We Guard Against

### IAM Drift

The generated AI layer must never let a user do something they could not do in the SaaS portal. Same-session proxy, generated auth adapters, policy checks, and audit logs all exist to preserve IAM parity.

### Capability Overexposure

Raw endpoints are not automatically safe AI tools. tusq.dev must classify side effects, risk, sensitivity, tenant context, and business intent before exposing a capability.

### Bad Workflow Inference

Inferred workflows can look plausible while violating real business rules. Workflow artifacts must be explicit, editable, provenance-backed, and eval-tested.

### Stale Or Contradictory Docs

Public docs, internal docs, support tickets, and code can disagree. tusq.dev must surface contradictions instead of allowing stale docs to silently shape generated AI behavior.

### Data Leakage

Runtime traces, support tickets, docs, and databases can contain customer secrets. Imports must minimize raw value capture, redact aggressively, preserve provenance, and make unsafe source handling visible.

### False Governance Confidence

Labels such as `approved`, `restricted`, `confidential`, or `auth_scheme: bearer` are not magic. The product must distinguish reviewer-aid metadata from runtime enforcement.

### Brand Mismatch

A generated AI surface that feels bolted on will not ship. Brand extraction, `tusq.brand.json`, and full CSS override are product-critical, not cosmetic.

### Marketplace And Ecosystem Misrepresentation

Marketplace packages must not overclaim security, compliance, auth behavior, or data handling. Publishing requires validation, versioning, rollback, and credentialed operator consent.

### Artifact Sprawl

Tools, skills, knowledge packs, widgets, copilots, evals, and marketplace packages must all trace back to the manifest and source inventory. The manifest remains the contract that prevents generated artifacts from drifting apart.

### OSS And Cloud Confusion

OSS must remain able to generate and self-host the full stack through CLI files. Cloud may make the system visual, collaborative, hosted, and easier to operate, but cloud must not be required for core value.

## Vision For Maturity

At maturity, a VP of Product or Engineering should be able to say:

"We ran tusq.dev against our SaaS repo. It found our capabilities, workflows, auth boundaries, and integrations. It generated a reviewed manifest, tools, skills, MCP server, branded chat, voice, widgets, marketplace packages, evals, and rollout artifacts. We hosted the OSS output ourselves first, then used tusq.cloud so our teams could review and govern everything visually."

That is the bar.

Not a demo. Not a chatbot. Not a manifest-only developer tool.

A credible compiler that turns the SaaS product a company already owns into the AI-native product its competitors are trying to build from scratch.

## Relationship To tusq.cloud

tusq.dev is the open-source CLI engine.

tusq.cloud is the visual operating layer for teams.

The stronger the OSS engine is, the more valuable the cloud product becomes. Cloud should not exist because OSS is incomplete. Cloud should exist because operating this system across employees, environments, approvals, generated artifacts, marketplace destinations, and audit trails is easier in a visual hosted product.

## Final Statement

tusq.dev is the open-source SaaS-to-AI product compiler.

It extracts the product logic, permissions, workflows, schemas, integrations, and risks already inside a SaaS codebase, then outputs the AI-native surfaces that product needs: tools, skills, branded chat, voice, widgets, MCP, marketplace packages, runtime, governance, and evals.

It exists so incumbent SaaS companies can turn the product they already own into the AI product their competitors are racing to build.
