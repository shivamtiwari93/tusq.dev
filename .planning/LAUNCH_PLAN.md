# Launch Plan

## Challenge To Prior Framing

- The previous launch framing was directionally accurate but still too abstract at the top: it named tusq.dev as a "capability compiler" before it made the buyer pain operational
- For launch, the first screen should answer four questions in order: who this is for, what problem it solves, what proof exists today, and where V1 stops
- Governance detail stays important, but it should support the operator story rather than replace it

## Launch Goals

1. Launch tusq.dev `v0.1.0` with a clear, defensible promise: existing Node.js SaaS teams can turn product behavior they already run into a reviewed manifest and describe-only MCP surface in one CLI workflow.
2. Attract the right first adopters: engineering and platform teams on Express, Fastify, or NestJS who are already exploring agent tooling and MCP.
3. Prevent category confusion by separating the shipped OSS CLI from the broader tusq.dev vision and tusq.cloud roadmap.
4. Create enough clarity that early users know exactly what to try first, what to trust, and what is intentionally deferred.

## Launch Narrative

### Core story

- tusq.dev v0.1.0 is for incumbent SaaS teams that already have product logic in a supported Node.js backend and need a reviewed way to make that logic inspectable by AI systems
- The defensible proof is concrete: scan the repo, generate a reviewable manifest, approve capabilities manually, compile approved tool JSON, and inspect the resulting describe-only MCP surface
- The launch should sell the operator control model as much as the automation model: reviewed manifest, explicit approval, optional approval trail, preserved provenance, inspectable governance metadata, inspectable redaction policy, and inspectable output

### First user action

- Direct early adopters to run tusq.dev locally against a real Express, Fastify, or NestJS repo
- Ask them to inspect `tusq.manifest.json` first, with special attention to provenance, `side_effect_class`, `sensitivity_class`, `auth_hints`, approval fields, and `redaction`, then approve one or two capabilities, compile, and confirm the describe-only MCP `examples` and `constraints` match expectations
- Treat scanner misses, low-confidence routes, and awkward manifest edits as feedback fuel for the next release
- Do not optimize the launch flow around `tusq serve` alone; the key product moment is seeing existing product behavior become a reviewable manifest before exposure

## Message Hierarchy

1. Lead with the audience filter: existing Express, Fastify, or NestJS SaaS teams with real product logic already in production or active development.
2. State the operator problem in one line: the product logic already exists, but there is no reviewed path to make it AI-visible.
3. State the proof sequence in one line: repo scan -> reviewed manifest -> approved tool JSON -> describe-only MCP.
4. State the boundary immediately after the proof: no live execution, no hosted control plane, no non-Node support in V1.
5. End with the repo-local CTA and an explicit ask for edge-case feedback.

## Required Assets

### Must publish at launch

- A launch announcement that names the release as `tusq.dev v0.1.0`
- Messaging that stays inside the verified product boundary: scan, manifest, compile, review, describe-only MCP serve
- A first-screen line in README and homepage hero that makes the buyer problem explicit before the category label
- A simple terminal-first workflow example:
  `tusq init` → `tusq scan .` → `tusq manifest` → edit approvals → `tusq compile` → `tusq serve`
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
   Some developers will assume `tools/call` executes actions. The announcement and FAQ need to repeat that V1 is describe-only and returns schema, examples, and constraints only.
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
- Website and announcement: show at least one concrete example of the review surface, not just the word "governance"
- GitHub README and docs: tell users how to try the product today without implying a public package is already published
- Social posts: frame the release as a governed path from repo to reviewed manifest to describe-only MCP, not as a general AI agent platform
- Community posts: invite supported-stack users with real repos, not broad curiosity traffic from unsupported ecosystems
