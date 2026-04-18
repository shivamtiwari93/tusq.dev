# Launch Plan

## Launch Goals

1. Launch tusq.dev `v0.1.0` with a clear, defensible promise: existing Node.js SaaS products can go from codebase to reviewed manifest to describe-only MCP exposure in one CLI workflow.
2. Attract the right first adopters: engineering and platform teams on Express, Fastify, or NestJS who are already exploring agent tooling and MCP.
3. Prevent category confusion by separating the shipped OSS CLI from the broader tusq.dev vision and tusq.cloud roadmap.
4. Create enough clarity that early users know exactly what to try first, what to trust, and what is intentionally deferred.

## Required Assets

### Must publish at launch

- A launch announcement that names the release as `tusq.dev v0.1.0`
- Messaging that stays inside the verified product boundary: scan, manifest, compile, review, describe-only MCP serve
- A simple terminal-first workflow example:
  `tusq init` → `tusq scan .` → `tusq manifest` → edit approvals → `tusq compile` → `tusq serve`
- Release notes that spell out supported frameworks and deferred items
- Website or landing-page copy that reflects the actual V1 surface instead of the full long-term vision

### Strongly recommended supporting assets

- A short terminal demo or GIF using one of the fixture apps
- One annotated manifest example showing approvals and domain grouping
- A concise FAQ covering "Does it execute tools?" and "Which frameworks are supported?"

## Dependencies

### Launch blockers to confirm before broad promotion

- Confirm the public install path and package naming before external posts rely on `npm install -g tusq`
- Ensure the README, homepage, announcement, and release notes all describe the same V1 boundary
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
   Some developers will assume `tools/call` executes actions. The announcement and FAQ need to repeat that V1 is describe-only.
3. **Framework expectation drift**
   If the launch message sounds category-wide, teams on unsupported stacks will bounce immediately. Framework support should appear high in every primary asset.
4. **Heuristic scanner perception**
   The scanner is useful but not exhaustive. We should frame the manifest as reviewable output, not perfect autonomous understanding.
5. **Install-path ambiguity**
   Until the package/distribution path is finalized, avoid copy that implies a public package is already available everywhere.
