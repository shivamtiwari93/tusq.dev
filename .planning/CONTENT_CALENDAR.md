# Content Calendar

## Launch Day

### Primary release package

- Publish the announcement and release notes with the same V1 framing: existing Node.js SaaS teams, reviewed manifest, approved tool compilation, describe-only MCP serve, explicit V1 boundary
- Update the homepage and README entry points so the first screen a visitor sees matches the release story
- Share one terminal-first post showing the launch workflow from `init` through `serve`, including `tusq approve --all --reviewer you@example.com` as the explicit governance step, plus a brief callout that `tusq diff` closes the loop when the codebase changes, `tusq docs --out capabilities.md` produces an offline Markdown review artifact for reviewers and adopters, and `tusq serve --policy .tusq/execution-policy.json` is available as an opt-in dry-run option for teams that want argument validation and plan emission without any live execution — and note that the policy file itself can be scaffolded in one step with `tusq policy init` (safe default `mode: "describe-only"`, opt into `--mode dry-run` explicitly), verified without starting a server via `tusq policy verify .tusq/execution-policy.json --json` as a CI pre-flight gate whose PASS proves `tusq serve --policy` will accept the same file, and further locked down with `tusq policy verify --strict --manifest tusq.manifest.json` — an opt-in manifest-aware check that cross-references `allowed_capabilities` against the manifest's approval-gated set and exits `1` on any `not_in_manifest`, `not_approved`, or `requires_review` mismatch
- Share one short operator-proof post: "your product logic already exists; the missing piece is reviewed AI exposure"
- Share one short proof-path post: "supported repo -> reviewed manifest -> approved tool JSON -> describe-only MCP, with opt-in dry-run plan emission when reviewers sign a policy"
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
- Publish a short "why this starts from existing product code" post so the product wedge is clear before deeper architecture content
- Publish a short "what you can verify in one session" post built around scan -> manifest -> `tusq approve` -> compile -> describe-only MCP, calling out that approval is a governed CLI action with reviewer identity and timestamp rather than a manifest hand-edit
- Share a short walkthrough of `tusq.manifest.json`, focusing on approvals, optional approval trail, provenance, `side_effect_class`, `sensitivity_class`, `auth_hints`, `redaction`, and how `examples` / `constraints` show up downstream

### Day 3-4

- Post a framework-specific example using one supported stack, ideally Express first because it is easiest to recognize
- Publish a short clip or screenshot sequence of manifest review plus `tools/list` and describe-only `tools/call`, calling out approval state, governance metadata, `redaction`, and the `examples` / `constraints` payload that survive into MCP responses
- Publish a short "how to try it today" post that points users to the repo workflow instead of a public package-manager claim
- Publish a short "keeping exposure governed after change" post focused on `tusq diff`: how the review queue surfaces drifted capabilities, and how `--fail-on-unapproved-changes` turns it into a CI gate
- Publish a short "share the review, not just the manifest" post focused on `tusq docs`: how `tusq docs --out docs/capabilities.md` generates a deterministic, offline Markdown packet showing approval state, governance metadata, redaction policy, examples, constraints, and provenance so reviewers who do not run the CLI can still audit the exposure surface
- Publish a short "opt-in dry-run, not live execution" post focused on M20: how `tusq serve --policy .tusq/execution-policy.json` activates dry-run validation for `tools/call`, what the `dry_run_plan` response looks like (including `executed: false`, a policy echo, and a deterministic `plan_hash`), why the approval gate is unchanged, and why `--policy` is never the default
- Publish a short "scaffold the policy in one step" post focused on M21: how `tusq policy init` writes a validator-round-trip-safe `.tusq/execution-policy.json`, why the default generated `mode` is `"describe-only"` (not `"dry-run"`), what the `--mode`, `--reviewer`, `--allowed-capabilities`, `--out`, `--force`, and `--dry-run` flags do, and how scaffold → `tusq serve --policy` is the one-terminal round-trip that eliminates hand-authored policy files without changing the approval gate or adding execution
- Publish a short "CI pre-flight without starting a server" post focused on M22: how `tusq policy verify <path> [--json]` reuses the M20 `loadAndValidatePolicy()` function byte-for-byte, exits `0` with a PASS line (and, under `--json`, a `{ ok: true, mode, path }` object) when the file would be accepted by `tusq serve --policy`, exits `1` with the server's own error message when it would not, starts no HTTP server and makes no network call, and is safe to drop into any CI pipeline as a pre-flight gate — and why a `scaffold → verify → serve` workflow eliminates the "edit, restart server, read traceback, edit again" reviewer loop for policy files
- Publish a short "opt-in strict manifest cross-check" post focused on M23: how `tusq policy verify --strict --manifest tusq.manifest.json` runs the M22 validator first and then cross-references every name in `allowed_capabilities` against the manifest's approval-gated set, emitting deterministic `strict_errors` entries (with reason `not_in_manifest`, `not_approved`, or `requires_review`) in `allowed_capabilities` declaration order and exiting `1` on any mismatch; why the default `tusq policy verify` path is byte-for-byte identical to M22 and never opens the manifest; why `--manifest` without `--strict` exits `1` with `--manifest requires --strict` before any file is read (Constraint 11); and why a strict PASS is a verify-time policy/manifest alignment statement only — not runtime safety, execution pre-flight, manifest freshness, or reachability — since `tusq serve --policy` itself does not enforce strict checks and still silently drops unlisted or unapproved capabilities from `tools/list`

### Day 5-7

- Share a roadmap-oriented follow-up: runtime learning, live execution, and broader framework coverage are next-stage work, not hidden current functionality
- Invite early users to contribute scanner edge cases and unsupported routing patterns
- Summarize first-week objections or confusion points and answer them in one public clarification post if needed

## Follow-ups

### Week 2+

- Publish a deeper technical post on why tusq.dev starts from product behavior instead of prompt-first tool authoring
- Release one polished sample app or reference repo for repeatable demos
- Turn common launch questions into an FAQ section covering framework support, approval flow, approval trail, provenance, redaction policy, governance metadata, MCP behavior, and local setup expectations
- If usage quality is high, prepare a comparison-style post around "manual tool definition vs manifest-first capability compilation"
