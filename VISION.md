# Vision for tusq.dev

## Mission

tusq.dev exists to arm every incumbent SaaS company with the weapon it already owns but cannot currently fire: years of accumulated product logic, turned into AI-callable capabilities in days instead of quarters.

This is not merely a safety product. It is a survival product for the companies that will be attacked by AI-native competitors in the next 24 months.

Safety, governance, and reviewability are not side concerns. They are part of what makes the product deployable fast enough to matter.

## The fight

Every established SaaS product is about to be targeted by a smaller, faster team rebuilding the same workflows with a conversational interface on top. Those teams have no legacy, no customers to protect, and no patience.

Incumbents have exactly one structural advantage: their product already works. It has permission models, edge cases, integrations, billing rules, and operational workflows that took years to encode. That logic is the moat.

But that logic is trapped. It lives behind APIs designed for UI flows, schemas designed for databases, and endpoints designed for frontends that no longer describe how users want to work.

tusq.dev unlocks that moat.

## The promise

Point tusq.dev at a repository. Get a working, AI-callable version of the product in days.

Not a chatbot. Not a wrapper. A compiled set of capabilities, governed by default, exposed through MCP and embedded surfaces, grounded in the code that already runs the business.

The measure of success is time-to-capability. Everything else is plumbing.

## What tusq.dev does

tusq.dev is a capability compiler for existing SaaS codebases. It:

1. Reads the repository, APIs, schemas, and runtime signals.
2. Infers the real capabilities the product already performs.
3. Produces a reviewable manifest describing those capabilities as stable, versioned units.
4. Compiles approved capabilities into strict tools and domain skills.
5. Runs them locally through a self-hostable runtime and a standards-based MCP server.

The engine is deterministic where it can be, AI-assisted where it must be, and explicit about the difference.

## The core insight

API endpoints are the wrong abstraction for AI.

An endpoint like `POST /invoices/refund` is an implementation artifact. A capability like "refund the last invoice for this customer if it is eligible, attribute it correctly, and return the final status" is what a user, operator, or agent actually wants.

Incumbents have thousands of endpoints and dozens of real capabilities. tusq.dev exists to find the capabilities inside the endpoints and make them first-class.

## The canonical artifact

`tusq.manifest.json` is the product.

It is the reviewable contract between code and agent. It describes:

- capabilities with provenance back to source
- input and output shapes
- side effects and sensitivity class
- auth and permission expectations
- examples and constraints
- redaction and approval metadata
- version history and diffs

The manifest is how a product team ships AI behavior as software. It is how an engineering team reviews changes. It is how a security team audits the surface. Most importantly, it is how the company iterates on its AI interface at the same pace it iterates on the underlying product.

## Why we move fast

We are writing this with AI. Our customers are shipping their products with AI. The entire category is being rewritten in months, not years. Being conservative is a losing move.

tusq.dev should aim to:

- support the most common framework stacks deeply within the first release
- produce manifests that are usable on first pass for real codebases, not toy examples
- treat manual manifest authoring as a failure of the engine, not a feature
- ship a working MCP server on day one, not as a future milestone
- close the loop from code to running tool in minutes, not hours

The bar is "competitive with a team of three engineers spending six months on an internal build." If we are not clearly better than that, we are not done.

## Why wide works for us

The obvious critique of this vision is scope. Twelve transition domains, three roadmap tiers, a plugin ecosystem, an MCP server, and a capability compiler are more than most pre-product teams can credibly attempt. That critique is directionally correct if we try to ship the whole surface at once.

We are not doing that. This product is being built with AI acceleration, which makes implementation faster, but it does not remove the real constraints: product judgment, sequencing, testing, integration depth, and customer trust. Under those constraints, the right move is not to shrink the vision. The right move is to keep the wide surface as the destination and ship it in a narrow, opinionated order.

Three reasons this matters:

### Coherence is expensive, implementation is cheaper than before

The hard part of tusq.dev is not merely writing twelve domains. It is deciding they belong inside one product with one manifest and one opinionated workflow, then sequencing them so the first release is real instead of diffuse. A competitor who copies three of the domains is not a competitor. The coherence of the surface is the defensible artifact.

### Wide OSS compounds faster than narrow OSS

Every domain we ship opens a plugin surface. Every plugin surface invites contribution. Framework detectors, auth adapters, schema extractors, skill packs, rollout checklists, and eval fixtures are all leverage we do not have to build ourselves. Narrow OSS projects stall. Wide opinionated ones become ecosystems, provided the core stays sharp enough that contributors know where to attach.

### Breadth turns into retention

A customer who adopts tusq.dev for capability discovery stays for evals, rollout, and competitive intelligence because the system already knows their product. Each additional domain deepens the integration and raises the cost of replacement. Surface area matters, but only when each added surface makes the core system more useful instead of more vague.

### The guardrails on width

Wide only works if three rules hold:

- **V1 ships narrow and deep.** The full surface is the destination; the first release is opinionated and complete in the domains it claims.
- **Opinions, not options.** Every domain has a strong default. Configurability is never a substitute for judgment. A wide surface full of knobs is a framework; a wide surface full of decisions is a product.
- **The OSS and cloud boundary stays crisp.** Wide OSS is an advantage. Overlapping OSS and cloud is not. OSS ships the primitives; cloud ships hosted delivery, environment-aware rollout, and cross-customer intelligence. The boundary is operational, not conceptual.
- **Trust is preserved as we expand.** Every new surface must remain reviewable, testable, and governable. Breadth without trust is just sprawl.

Under those guardrails, width is the strategy. It is what an AI-accelerated product should look like in a category moving this fast, and it is the shape competitors working under narrower assumptions will struggle to match in time.

## Design principles

### Velocity over surface area

Support fewer stacks, deeper. Node plus Python plus one or two serious backend frameworks, done correctly, beats thin support for twelve.

### Reviewable over opaque

The manifest, the tool definitions, the side-effect metadata, and the provenance chain must all be human-readable. The engine should surface what it does not know, not hide it.

### Explicit side effects

Writes are not reads. Destructive actions are not soft actions. Anything that moves money, changes permissions, or mutates production state must be tagged, by default, as something the calling agent cannot invoke without an explicit gate.

### Self-hostable or it does not ship

The OSS engine has to be genuinely useful without ever touching tusq.cloud. Teams that want to keep code, data, and runtime inside their own walls must get real value from tusq.dev alone.

### Plugins are how we scale

Framework detectors, auth detectors, schema extractors, skill grouping packs, and interface adapters all live behind plugin interfaces. The core stays small. The ecosystem grows around it.

## Product modules

- **Ingestion.** Local repos, GitHub, monorepos, multi-repo configurations. Fast scanning that finds high-value surfaces first.
- **Static understanding.** AST parsing, routing conventions, schema extraction, auth detection, service graphs, read/write/destructive classification.
- **Runtime learning.** Real payload shapes, error distributions, hot paths, and drift signals that sharpen the manifest over time.
- **Capability compiler.** Converts discovered behavior into capability candidates with side effects, sensitivity, and permissions attached.
- **Tool compiler.** Emits strict, normalized tools with schemas, examples, and error semantics suitable for any modern agent runtime.
- **Skill and domain grouping.** Organizes tools into domains such as billing, users, provisioning, support, and admin.
- **Local runtime.** Executes tools with identity binding, dry-run, confirmation, and trace capture.
- **MCP server.** Standards-based, versioned, environment-aware. A default output, not a future milestone.
- **Interface primitives.** Enough embedded assistant surface to prove the system in front of real users without pretending to be a full UX platform.

## The full transition we automate

If tusq.dev is going to matter, it cannot just convert endpoints into tools. Conventional SaaS companies need help making a much broader transition into AI-native product architecture.

That transition includes all of the following:

### Capability discovery and normalization

- understand routes, handlers, background jobs, services, validators, and integrations
- identify real business capabilities rather than raw implementation surfaces
- collapse several low-level endpoints into one higher-level governed capability where appropriate
- keep provenance back to code so the output stays reviewable

### Auth and permission mapping

- infer roles, scopes, tenant boundaries, admin-only surfaces, and impersonation paths
- determine which capabilities are read, write, destructive, financial, or security-sensitive
- generate least-privilege hints and approval recommendations

### Data and schema understanding

- inspect database schemas, ORM models, migrations, DTOs, and validators
- map relationships and domain entities
- detect sensitive fields such as PII, payments, secrets, and regulated data
- produce redaction and retention defaults

### Runtime instrumentation

- capture real payload shapes and failure modes
- observe auth context, retries, latency, and unstable endpoints
- identify which APIs matter most in practice
- refine the model based on what the product actually does, not just what static code suggests

### Safe execution wrappers

- turn capabilities into strict tools with schemas and normalized errors
- attach dry-run, confirm, approve, and execute ladders
- preserve retry, timeout, idempotency, and audit metadata
- make risky operations explicit and governable

### Skill and agent composition

- group tools into domains such as billing, users, projects, support, and admin
- generate skills or domain agents from those groups
- create checkpointed multi-step flows where that improves usability

### AI-facing interface generation

- emit MCP by default
- emit embedded assistant and command-surface primitives
- support both internal copilots and customer-facing AI surfaces
- create outputs that can later be connected to hosted distribution

### Eval and regression infrastructure

- generate golden tasks and expected tool-call sequences
- generate permission and schema regression checks
- detect drift when the underlying product changes
- make the AI surface testable like software

### Documentation and adoption surfaces

- generate capability docs, examples, permission docs, and review artifacts
- help product, engineering, support, and security teams understand what was generated
- reduce the enablement burden of adopting the system

### Migration and rollout tooling

- support dev, staging, and production transitions
- support internal-only, operator-only, and customer-facing rollout paths
- generate kill-switch, fallback, and staged rollout guidance

### Governance and review workflows

- produce manifest diffs and review queues
- keep AI surface changes inspectable and code-reviewable
- create structured places for humans to approve or reject risky boundaries

### Competitive transition intelligence

- identify the most strategically exposed product areas
- rank the capabilities that should be AI-enabled first
- help incumbents move on the interfaces that matter before competitors do

## Roadmap shape: V1, V2, V3

Tusq.dev should be built in three layers: the minimum system that proves the transformation, the second layer that makes adoption much easier, and the third layer that becomes the moat.

### Must-have in V1

V1 should prove that an incumbent SaaS company can point Tusq.dev at a real codebase and get a working AI-callable capability surface quickly.

- Capability discovery and normalization:
  code and API inspection, framework detection, route extraction, capability inference, provenance to source.
- Auth and permission mapping:
  role and scope detection, tenant boundary awareness, and risk classification for actions.
- Data and schema understanding:
  DTO extraction, schema and ORM inspection, relationship mapping, sensitivity tagging.
- Capability manifest generation:
  `tusq.manifest.json` with schemas, side effects, permissions, examples, and reviewable metadata.
- Safe execution wrappers:
  strict tools, normalized error semantics, dry-run support, confirmation and approval metadata.
- Basic skill composition:
  domain grouping for generated tools.
- MCP server:
  versioned local MCP as a default output.
- Basic interface primitives:
  enough embedded or command-surface UI to prove value with real usage.
- Basic generated docs:
  capability docs, examples, and review artifacts.

V1 wins if it compresses time-to-capability from quarters to days.

### High-leverage in V2

V2 should make the system much easier to adopt across product and platform teams.

- Runtime instrumentation:
  payload observation, auth context capture, failure and latency analysis, hot-path identification.
- Eval and regression infrastructure:
  golden-path tests, permission regression, schema regression, and drift detection.
- Migration and rollout tooling:
  staged environment rollout, internal-first rollout modes, kill switches, fallback paths, rollout checklists.
- Richer docs and adoption surfaces:
  support docs, operator docs, security review artifacts, optional typed SDK generation.
- Richer skill and workflow generation:
  multi-step skill packs with checkpoints and domain-specific logic.
- Richer interface generation:
  stronger embedded surfaces and cleaner export paths into external AI environments.
- Stronger governance workflows:
  better diffs, review queues, version review, and human approval surfaces.

V2 wins if the engine stops being a powerful specialist tool and becomes a practical migration system for real teams.

### Moat features in V3

V3 should make the product compounding and strategically hard to replace.

- Runtime learning loop:
  refine schemas, examples, tool boundaries, and skills from production observations.
- Advanced usage intelligence:
  detect which capabilities matter most and where the most value or fragility lives.
- Competitive transition intelligence:
  rank the product surfaces that incumbents must AI-enable first.
- Automated improvement proposals:
  suggest manifest changes, tool boundary improvements, and risk reclassification based on evidence.
- Deep governance and change intelligence:
  capability, policy, and schema diffs tied to replay and operational diagnostics.
- Mature ecosystem outputs:
  stronger export and packaging surfaces for broader AI distribution.

V3 is where tusq.dev becomes not just a compiler, but the system that helps conventional SaaS products continuously evolve into AI-native products faster than competitors can copy them.

## Who this is for

tusq.dev is for the product and engineering leaders at established SaaS companies who already see the threat and want a credible response. It is for the platform teams who will have to own the AI interface long-term. It is for the open-source builders who want to extend the engine to their own stack.

It is not for teams that want a chatbot. It is not for teams that want a retrieval demo. It is for teams that want their product to survive.

## Why open source

The engine has to be trusted, inspected, extended, and self-hosted. Closed-source capability compilers will not earn the trust of the companies we most want to serve.

Open source is also the fastest distribution path in a category moving this fast. Developer adoption compounds. Every plugin someone else writes is leverage we did not have to build.

The commercial split is clean: the engine is open, the hosted control plane is commercial. That boundary is defensible because the cloud product exists to eliminate operational drag, not to gate the engine.

## What we resist

- Becoming a chatbot framework. The product is capability compilation, not chat UI.
- Auto-converting every endpoint into a tool. The product is judgment about what should be a capability, not naive exposure.
- Supporting everything shallowly. The product is depth in the stacks that matter.
- Hiding ambiguity. The product is honesty about what the engine does not yet know.
- Framing ourselves as only a safety layer. The product is competitive velocity through governed execution. Safety is built in, not bolted on.

## Vision for maturity

At maturity, it should be normal for a VP of Engineering to say:

"We ran tusq.dev against our main repo on Monday. By Friday we had a reviewed manifest, a compiled tool set, and an MCP endpoint that our internal assistant and our partners' AI clients can both use. We are shipping this month."

That is the bar. Not a concept demo. Not a research project. A credible, opinionated engine that turns existing product logic into the company's AI surface faster than any internal team could build it.

## Relationship to tusq.cloud

tusq.dev is the engine. tusq.cloud is the accelerator that takes the engine from "running on a laptop" to "running in production across environments and teams."

The stronger tusq.dev is as an engine, the more obvious tusq.cloud becomes as the shortest path to production. Neither product has to weaken the other to justify itself.

## Final statement

tusq.dev is the open-source engine that turns the product an incumbent already owns into the AI-native product its competitors are trying to build from scratch.

It exists so the companies with the most product logic stop losing to the companies with the fastest interfaces.
