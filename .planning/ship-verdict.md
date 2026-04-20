# Ship Verdict — tusq.dev v0.1.0

## Verdict: SHIP

## Challenge To Dev Turn (turn_79938a12a7f2e441) — examples/constraints end-to-end

The dev turn added `examples` and `constraints` fields across the full pipeline: manifest preservation maps, compile propagation, MCP `tools/call` response, smoke-test assertions, and doc updates. I challenged this on three grounds:

1. **Pipeline coverage and intentional asymmetry:** `examples` and `constraints` appear at manifest, compile, and MCP `tools/call` but NOT at scan or MCP `tools/list`. I checked whether this was an oversight. SYSTEM_SPEC.md lines 564-571 explicitly document the pipeline for `examples` as: scan (no field), manifest (yes), tusq-tools (yes), `tools/call` (yes) — `tools/list` exclusion is by design. The `tools/list` response at `src/cli.js:529-541` correctly omits both fields; `tools/call` at lines 555-566 correctly includes them. **Challenge resolved: intentional per spec.**

2. **Smoke test assertion completeness:** Three coverage points tested: (a) manifest capabilities carry default `examples[]` with at least one entry and default `constraints` with the expected 5-field null/empty shape (smoke lines 157-161); (b) custom values survive manifest→compile propagation (lines 175-179); (c) custom values survive manifest→`tools/call` propagation (lines 232-236). All three pass (`node tests/smoke.mjs` → exit 0). `tools/list` is intentionally not tested for these fields. **Challenge resolved: correct and complete per spec.**

3. **Documentation accuracy in manifest-format.md:** Lines 31-32 list `examples` and `constraints` in the capability field inventory, and lines 75+ provide the `## Examples and constraints (V1)` section describing the describe-only default and the 5-field constraints object. No overclaim or omission found. **Challenge resolved: accurate.**

New requirement REQ-033 added to acceptance matrix covering the three pipeline stages (manifest, compile, `tools/call`), smoke-test assertions, and SYSTEM_SPEC-confirmed design rationale for `tools/list` exclusion. Acceptance matrix now covers 33 criteria.

## Challenge To Dev Turn (turn_3443bc3f16b31888) — auth_hints in MCP runtime

The dev turn added `auth_hints` to MCP `tools/list` and `tools/call` responses in `src/cli.js`, added two smoke-test assertions for the field, and updated `website/docs/mcp-server.md` to list it alongside the other governance fields. I challenged this on four grounds:

1. **Pipeline coverage at all 4 stages:** auth_hints was already emitted at scan (lines 799, 838, 867, 925 in src/cli.js), manifest (line 347), and compile (line 423) from prior implementation. The dev turn completed coverage by adding it to MCP `tools/list` (line 537) and `tools/call` (line 563). Verified by running smoke tests end-to-end. **Challenge resolved: all 4 stages covered.**

2. **Fallback correctness:** The implementation uses `tool.auth_hints || []` as the fallback — an empty array, not null or undefined. This is the correct sentinel for "no auth signals detected." **Challenge resolved: correct.**

3. **Smoke test assertions:** Two new `Array.isArray(auth_hints)` checks cover both MCP methods. Both pass on current HEAD (`node tests/smoke.mjs` → exit 0). **Challenge resolved: assertions valid and passing.**

4. **Documentation accuracy:** `website/docs/mcp-server.md` now lists all three governance fields (`side_effect_class`, `sensitivity_class`, and `auth_hints`) consistently. `website/docs/manifest-format.md` lists `auth_hints` in the capability field inventory (line 30). No overclaim or omission found. **Challenge resolved: accurate.**

New requirement REQ-032 added to acceptance matrix covering all four pipeline stages plus smoke-test and documentation coverage. Acceptance matrix now covers 32 criteria.

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

All 33 acceptance criteria are now covered in QA evidence, including the 22 CLI/runtime checks, 3 live-site consolidation checks, 3 provenance-chain checks (REQ-026 through REQ-028), 1 roadmap page check (REQ-029), 1 manifest-format doc check (REQ-030), 1 sensitivity_class pipeline check (REQ-031), 1 auth_hints MCP runtime check (REQ-032), and 1 examples/constraints pipeline check (REQ-033). This QA pass challenged the dev turn (turn_79938a12a7f2e441) that added examples/constraints end-to-end and verified that: (a) the `tools/list` exclusion of examples/constraints is intentional per SYSTEM_SPEC.md lines 564-571, not a bug; (b) smoke-test assertions cover all three required pipeline stages; and (c) manifest-format.md accurately documents both fields. The smoke test suite (`node tests/smoke.mjs`) executed end-to-end and exited 0 independently. Website build (`npm run build`) exited 0. Manual spot-checks confirmed correct CLI UX:

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
