# Content Calendar

## Launch Day

### Primary release package

- Publish the announcement and release notes with the same V1 framing: open-source CLI, Express/Fastify/NestJS support, reviewed manifest, approved tool compilation, describe-only MCP serve
- Update the homepage and README entry points so the first screen a visitor sees matches the release story
- Share one terminal-first post showing the six-step workflow from `init` to `serve`
- Use "try it locally from the repo" as the launch CTA until package distribution is confirmed

### Channel plan

- GitHub release or repo post: canonical shipping note with changelog and install/workflow guidance
- Founder or company LinkedIn post: position the product as an AI-enablement path for incumbent SaaS teams and emphasize governed review over hype
- X post/thread: short technical framing plus CLI workflow, supported frameworks, explicit describe-only limit, and a clear "best fit" qualifier
- Developer community post: emphasize OSS, self-hosted workflow, provenance, honest V1 boundaries, and the fact that this is for teams with real existing backends rather than greenfield demos

## Week 1

### Day 1-2

- Publish a "What v0.1.0 does and does not do" post to kill confusion around describe-only MCP and deferred execution
- Publish a short "Who tusq.dev is for in v0.1.0" post so unsupported or hosted-first buyers self-select out early
- Share a short walkthrough of `tusq.manifest.json`, focusing on approvals, confidence, domain grouping, and provenance

### Day 3-4

- Post a framework-specific example using one supported stack, ideally Express first because it is easiest to recognize
- Publish a short clip or screenshot sequence of `tools/list` and describe-only `tools/call`
- Publish a short "how to try it today" post that points users to the repo workflow instead of a public package-manager claim

### Day 5-7

- Share a roadmap-oriented follow-up: runtime learning, live execution, and broader framework coverage are next-stage work, not hidden current functionality
- Invite early users to contribute scanner edge cases and unsupported routing patterns

## Follow-ups

### Week 2+

- Publish a deeper technical post on why tusq.dev starts from product behavior instead of prompt-first tool authoring
- Release one polished sample app or reference repo for repeatable demos
- Turn common launch questions into an FAQ section covering framework support, approval flow, provenance, MCP behavior, and local setup expectations
- If usage quality is high, prepare a comparison-style post around "manual tool definition vs manifest-first capability compilation"
