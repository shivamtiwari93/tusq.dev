# Ship Verdict — tusq.dev v0.1.0

## Verdict: SHIP

## Challenge To Prior Turn

The previous QA turn correctly re-proved the implementation gate and CLI regression status, but its SHIP framing still leaned on planning-document attestation more than direct public-site parity checks. That mattered because the injected charter was not merely "build a Docusaurus site"; it required `website/` to absorb the live `websites/` homepage structure, 404 recovery behavior, styling cues, and active-site ownership.

## Implementation Intent Coverage — Explicit Attestation (Attempt 2)

The acceptance item "implementation_complete gate can advance to qa once verification passes" is **satisfied**:

1. `.planning/IMPLEMENTATION_NOTES.md` contains a literal `## Changes` heading (line 8, confirmed by `grep -n '^## Changes$'` exit 0).
2. The existing implementation summary (Docusaurus scaffold, docs IA, blog content, CLI regression) is preserved under that `## Changes` section.
3. Verification passed: website build, typecheck, and CLI smoke tests all exit 0 on current HEAD.
4. The run has already advanced to `qa` with `implementation_complete` passed — the gate was satisfied before this QA turn began.

## QA Summary

All 25 acceptance criteria are now covered in QA evidence, including the 22 CLI/runtime checks and the 3 live-site consolidation checks. This QA pass preserves the prior CLI re-baseline, but it adds the missing evidence standard for launch-facing truth: direct inspection of the legacy `websites/` files against the Docusaurus implementation in `website/`. The smoke test suite (`node tests/smoke.mjs`) executed end-to-end and exited 0 independently. Manual spot-checks confirmed correct CLI UX:

- `tusq help` / `--help` / `-h` all print the 8-command listing and exit 0.
- `tusq version` / `--version` prints `0.1.0` and exits 0.
- Unknown command (`tusq does-not-exist`) exits 1 with usage block and `Unknown command:` error.
- Invalid flag (`tusq scan --bad-flag`) exits 1 and prints `Usage: tusq scan` to stdout.
- All three framework scanners (Express, Fastify, NestJS) returned routes from fixtures.
- The MCP serve path started, responded to `tools/list` and `tools/call` RPC calls, and shut down cleanly on SIGINT.

The implementation is scoped to the agreed V1 contract (DEC-001 through DEC-011):
- Discovery → manifest → compile → describe-only MCP serve pipeline
- Express, Fastify, NestJS only
- Heuristic regex-based scanner (not AST)
- Non-interactive review (stdout only)
- No plugin API

No blocking issues were found.

## Live-Site Consolidation Coverage

The injected consolidation charter is now explicitly satisfied:

1. `website/` reflects the current live website content from `websites/`: the Docusaurus homepage preserves the legacy hero proposition, three-card explanation band, workflow steps, and V1 shipped-surface grid instead of reverting to template marketing copy.
2. Docusaurus preserves the legacy not-found recovery path and brand cues: the custom 404 keeps the warm paper-card treatment and sends users back to `/`, matching the former static site's "Back to home" behavior.
3. `.planning/IMPLEMENTATION_NOTES.md` contains a literal `## Changes` heading and states that `website/` is the canonical homepage/docs/blog surface.
4. Implementation no longer depends on `websites/` as a separate active site. The legacy directory may remain temporarily for cleanup, but it is documented as reference-only residue rather than a parallel website.
5. This QA ship package now states the consolidation outcome in the same four planning artifacts a human approver will review, so the release narrative no longer relies on unstated context from prior turns.

## Open Blockers

None.

## Conditions

- Human approval required before transitioning to `launch` phase (per gate `qa_ship_verdict`).
- The correct next action is a human release decision, not another agent asserting launch on behalf of the approver.
- No additional automated QA evidence is outstanding for this gate; the remaining action is approval.
- V2 items documented as deferred: runtime learning, Python/Go/Java support, interactive TUI, intelligent cross-resource grouping, live MCP proxying.
