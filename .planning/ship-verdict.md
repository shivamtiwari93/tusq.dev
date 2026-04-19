# Ship Verdict — tusq.dev v0.1.0

## Verdict: SHIP

## Challenge To Dev Turn (turn_b872581d85a8ec3b) — sensitivity_class

The dev turn added `sensitivity_class` to `src/cli.js` (manifest, compile, MCP serve pipelines) and updated `tests/smoke.mjs` with four explicit assertions. I challenged this on three grounds:

1. **Field completeness:** Does `sensitivity_class` appear at all four pipeline stages (manifest, compile, tools/list, tools/call)? Verified by running `tusq manifest` and `tusq compile` on the express fixture — both emitted `"sensitivity_class": "unknown"`. MCP assertions in smoke tests confirm tools/list and tools/call. **Challenge resolved: complete.**

2. **Preservation of existing values:** DEC-161 claims existing manual sensitivity values are preserved on regeneration. Verified: `normalizeSensitivityClass()` passes through any valid existing value and only falls back to `unknown` for invalid/missing. **Challenge resolved: correct.**

3. **Documentation accuracy:** `website/docs/manifest-format.md` documents all 5 levels (`unknown`, `public`, `internal`, `confidential`, `restricted`) and explicitly states V1 always emits `unknown`. Field count for `sensitivity_class` in the doc is 7 references. **Challenge resolved: accurate.**

New requirement REQ-031 added to acceptance matrix covering all four pipeline stages plus documentation. Acceptance matrix now covers 31 criteria.

## Challenge To Prior Turn (dev turn_d79bb1f0054adf1b)

The dev turn added `website/docs/manifest-format.md` and updated `.planning/IMPLEMENTATION_NOTES.md`. I challenged this on three grounds:

1. **Documentation accuracy:** The doc lists all capability fields and the V1 conservative schema shape. I verified against the actual `tusq.manifest.json` output — all 13 capability fields listed in the doc (`name`, `description`, `method`, `path`, `input_schema`, `output_schema`, `side_effect_class`, `auth_hints`, `provenance`, `confidence`, `review_needed`, `approved`, `domain`) are present. The `input_schema` and `output_schema` shapes match exactly what V1 emits. **Challenge resolved: accurate.**

2. **Sidebar wiring:** `manifest-format` appears at `sidebar_position: 3` and is explicitly in the `items` array of the Reference category in `website/sidebars.ts`. No duplicate sidebar_position values exist across the 8 docs. **Challenge resolved: correctly wired.**

3. **Scope boundary:** The doc does not claim schema inference beyond V1 capability, and the `## V1 schema limitations` section is explicit about the conservative approach. **Challenge resolved: no overclaim.**

New requirement REQ-030 added to acceptance matrix to make this contract auditable.

## Previous Challenge Summary

Prior QA turn challenged the dev turn that added the roadmap page (REQ-029). That challenge was resolved in the previous turn. Both the roadmap and manifest-format docs are now covered in QA evidence.

## Vision Goal — Capabilities With Provenance Back to Source

The active injected intent requires that the canonical artifact (compiled tool definitions) carry provenance tracing each capability back to the source where it was discovered. This is verified end-to-end:

1. **scan → scan.json:** Every route in `.tusq/scan.json` contains a `provenance` object with `file` (relative source path) and `line` (line number where the route is declared). Verified against `tests/fixtures/express-sample/.tusq/scan.json` — both routes carry `"provenance": {"file": "src/app.ts", "line": 12}` and `{"file": "src/app.ts", "line": 13}`.

2. **manifest → tusq.manifest.json:** `tusq manifest` preserves the provenance fields from scan into every capability entry. Verified by running manifest on the express fixture — each capability in `tusq.manifest.json` retains `"provenance": {"file": "src/app.ts", "line": N}`.

3. **compile → tusq-tools/*.json:** `tusq compile` carries provenance into each final tool definition JSON. Verified by running compile on approved capabilities — `get_users_users.json` and `post_users_users.json` both include `"provenance": {"file": "src/app.ts", "line": N}`.

The compiled artifact is therefore the canonical source-of-truth for which capabilities exist **and** where in the codebase each capability originates. This satisfies the vision acceptance contract without any code change required — the implementation already supports full provenance chaining.

Three new acceptance requirements (REQ-026, REQ-027, REQ-028) have been added to the acceptance matrix to make this contract explicit and auditable.

## Launch Messaging Boundary

The repository README contains longer-horizon product language about execution, higher-level skills or agents, broader runtime surfaces, and runtime learning. That material is valid roadmap context, but it is not the launch source of truth for `tusq.dev v0.1.0`.

For this ship decision, the truthful public scope is limited to what the implementation and website currently support:

- a local CLI for Express, Fastify, and NestJS discovery
- reviewable manifest generation with confidence, domain, approval, and provenance metadata
- compilation of approved capabilities into JSON tool definitions
- grouped stdout review output
- a local describe-only MCP HTTP surface that supports `tools/list` plus schema/example responses from `tools/call`

It does not include live tool execution, hosted delivery, plugin APIs, non-Node ecosystems, runtime learning, or higher-level skill/agent generation as shipped features. The human approver should treat `.planning/*` and the current `website/` launch copy as the release truth source for v0.1.0, with the README read as broader project vision.

The launch package now uses the same concise framing across homepage hero/body copy, homepage metadata, the branded social preview, release notes, and ship verdict: reviewed manifest, approved tool definitions, and inspectable describe-only MCP. That is easier to approve because it maps directly to observed behavior instead of category-level aspiration.

## Implementation Intent Coverage — Explicit Attestation

The acceptance item "implementation_complete gate can advance to qa once verification passes" is **satisfied**:

1. `.planning/IMPLEMENTATION_NOTES.md` contains a literal `## Changes` heading (line 8, confirmed by `grep -n '^## Changes$'` exit 0).
2. The existing implementation summary (Docusaurus scaffold, docs IA, blog content, CLI regression) is preserved under that `## Changes` section.
3. Verification passed: website build, typecheck, and CLI smoke tests all exit 0 on current HEAD.
4. The run has already advanced to `qa` with `implementation_complete` passed — the gate was satisfied before this QA turn began.

## Challenge To Dev Turn (turn_ddc0f0c213477934)

The dev turn added `website/docs/roadmap.md`, updated `website/sidebars.ts`, extended the homepage with a roadmap CTA section, and updated `.planning/IMPLEMENTATION_NOTES.md`. I challenged these on three grounds:

1. **Scope creep risk:** Adding post-v0.1.0 content to the launch homepage could dilute v0.1.0 signal. On inspection, the roadmap CTA is a secondary action and the roadmap page opens with an explicit disclaimer "None of the items below are shipped behavior in `v0.1.0`" — acceptable.
2. **Sidebar classification:** Roadmap is placed under `Help` alongside `faq`. That placement is correct: it is forward-looking context rather than a how-to doc.
3. **v0.1.0 truth boundary:** The non-shipped disclaimer is literal and unambiguous. No overclaim found.

Decision: dev turn accepted. REQ-029 added to acceptance matrix. Build and smoke tests re-verified at exit 0 on post-dev HEAD.

## QA Summary

All 31 acceptance criteria are now covered in QA evidence, including the 22 CLI/runtime checks, 3 live-site consolidation checks, 3 provenance-chain checks (REQ-026 through REQ-028), 1 roadmap page check (REQ-029), 1 manifest-format doc check (REQ-030), and 1 sensitivity_class pipeline check (REQ-031). This QA pass challenged the dev turn (turn_b872581d85a8ec3b) that added `sensitivity_class` to the manifest/compile/MCP-serve pipeline and verified that the field is emitted at all four stages, existing values are preserved, and the documentation is accurate. The smoke test suite (`node tests/smoke.mjs`) executed end-to-end and exited 0 independently. Website build (`npm run build`) exited 0. Manual spot-checks confirmed correct CLI UX:

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
