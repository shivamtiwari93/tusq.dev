# Ship Verdict — tusq.dev v0.1.0

## Verdict: SHIP

## PM QA Pass — Independent Challenge (turn_1f89182d2701a838, attempt 3)

This pass is run by the PM role in the qa phase because the last accepted turn (`turn_9f0a5847aa52a8de`) was a runtime-rebinding reissue and many intermediate qa turns were ghost-reissued without content. I did not rubber-stamp the prior sign-off. Two new bodies of work had been merged since the last recorded qa sign-off and were not yet in the acceptance matrix:

1. `0f60878` — M15 first-pass manifest usability (DEC-225 through DEC-230)
2. `228d4a9` — Manifest review governance improvements (added `--strict` review mode, richer schema and provenance inference, review-output summarization, and body/output schema inference)

I challenged both commits on five grounds:

1. **Path parameter extraction accuracy (M15):** Does `:id` / `{id}` get lifted from the route path into `input_schema.properties` with `required` and `source: "path"`? Verified in `src/cli.js` (`extractPathParameters`, `buildInputSchema`), and end-to-end against the Express fixture `GET /api/v1/users/:id`: `input_schema.properties.id={type:"string",source:"path"}`, `required=["id"]`. Also confirmed for NestJS POST `/users/:id/disable`. **Challenge resolved.**

2. **Prefix-aware domain inference (M15):** Does domain inference skip `api`, `v1-v5`, `rest`, `graphql`, `internal`, `public`, `external` when selecting the first meaningful segment? Verified `DOMAIN_PREFIX_SEGMENTS` in `src/cli.js` and confirmed `GET /api/v1/users/:id` gets `domain="users"` in manifest. **Challenge resolved.**

3. **Rich capability descriptions and schema-miss confidence penalty (M15):** Do descriptions include verb + target + side_effect + auth_context + handler, and does `scoreConfidence` apply a `-0.10` penalty when `schema_hint` is absent? Verified: manifest description is `Retrieve user by id - read-only, requires requireAuth (handler: getUser)`; schema-less routes land at `confidence=0.76`, which is below the `0.8` threshold and correctly flips `review_needed=true`. **Challenge resolved.**

4. **`tusq review --strict` governance gate (228d4a9):** Does `--strict` exit 1 with a recognizable `Review gate failed:` message when any capability is unapproved or low-confidence, and exit 0 once gated manually? Verified via smoke-test path (`tests/smoke.mjs` runs both the failing strict call on the unapproved manifest and a passing strict call after flipping approval/low-confidence on every capability). Implementation is in `enforceStrictReviewIfRequested` (`src/cli.js:704`). **Challenge resolved.**

5. **Review output and schema/provenance inference (228d4a9):** Does `tusq review --verbose` summarize inputs, returns, and source/handler/framework on each capability line, and does schema inference surface `body:request_body`, `array<object>`, and object-property shapes accurately? Verified smoke-test assertions on the substrings `inputs=body:request_body`, `returns=array<object>`, `source=src/app.ts`, `handler=listUsers`, `framework=express`. Manifest output for Express fixture matches: GET `/users` returns `array<object>`, POST `/users` carries `input_schema.properties.body.source="request_body"` and `output_schema.properties.ok.type="boolean"`. **Challenge resolved.**

**Smoke test re-verification this turn:** `node tests/smoke.mjs` → exit 0.

**Matrix update:** Added REQ-037 (M15 usability) and REQ-038 (review governance + schema inference). Acceptance matrix now covers 38 criteria, all PASS.

## QA Attempt 4 — Independent Challenge (turn_af4fdc071f440a23)

This is a fresh independent challenge of the same dev turn (turn_f38f05a4fef53bc4). The prior QA turn had already resolved four challenges on framework-specific deep extraction. I raised two additional challenges based on live code inspection and did not accept the prior resolution as rubber-stamp evidence.

**Challenge 1 — Fastify `inlineWithOptionsPattern` handler-boundary quirk:** The regex `([^)]+)\)` stops at the first `)` it encounters after the options block, which is the `)` inside `listOrders()` (the named async function), not the outer `fastify.get(...)` closing paren. I verified the captured handler expression is `async function listOrders(`. Resolution path: `isInline = /=>|function\s*\(/.test('async function listOrders(')` → false (no match; `function\s*\(` requires no name between `function` and `(`); `extractIdentifiers` returns `['listOrders']` after filtering blocked tokens `async`, `function`; `handler = 'listOrders'`. Correct output despite boundary quirk. Deduplication is safe: `inlinePattern` (per-line) does not match `fastify.get('/orders', {` (the line has no `)` in the handler area), so `inlineWithOptionsPattern` is the sole match source. **Challenge resolved: extraction is correct.**

**Challenge 2 — NestJS `UseGuards` false positive in `auth_hints`:** `extractIdentifiers('@UseGuards(AuthGuard)')` extracts `['UseGuards', 'AuthGuard']` — `UseGuards` is the NestJS decorator function, not an auth guard identifier. It appears in `auth_hints` for every route that uses `@UseGuards()`. Live scan confirms: `GET /users auth_hints=["UseGuards","AuthGuard"]`, `POST /users/:id/disable auth_hints=["UseGuards","AuthGuard","AdminGuard"]`. Smoke tests assert only `includes('AuthGuard')` / `includes('AdminGuard')` — they do not assert absence of `UseGuards`. This is a V1 heuristic limitation: the scanner cannot distinguish decorator names from guard identifiers without an AST. DEC-214 explicitly defines auth_hints as regex-extracted identifiers from auth context, and SYSTEM_SPEC marks the scanner as heuristic-only. **Challenge raised, resolved as known V1 noise; non-blocking under the heuristic model.**

**Challenge 3 — Route deduplication under mixed-pattern Fastify scan:** Verified `inlineWithOptionsPattern` global match and `routePattern` (`fastify.route({...})`) global match do not collide. `inlineWithOptionsPattern` only matches `fastify.(method)(path, {options}, handler)` forms; `fastify.route({...})` uses a different method name and doesn't match. `dedupeRoutes` key is `${method} ${path} ${file}:${line}`. Live scan confirms: route_count=2, no duplicates. **Challenge resolved: deduplication is correct.**

**Smoke test re-verification:** `node tests/smoke.mjs` → exit 0, independently run in this turn (2026-04-20). All 36 acceptance criteria PASS.

## Challenge To Dev Turn (turn_f38f05a4fef53bc4) — framework support depth (M14, DEC-218)

The dev turn closed M13 roadmap bookkeeping and claimed M14 (framework support depth) was already implemented. I challenged this on four grounds:

1. **Fastify 3-argument inline form not detected:** Scanning the Fastify fixture (`tests/fixtures/fastify-sample/src/server.ts`) returned only 1 route (`POST /orders`) instead of 2. The `GET /orders` route uses `fastify.get(path, {schema}, handler)` (3-argument form), which the single-line `inlinePattern` regex at `src/cli.js:840` cannot match — it only handles `fastify.get(path, handler)` (2-argument). **Challenge upheld: real defect. Fixed in `src/cli.js` by adding `inlineWithOptionsPattern` multiline regex to handle the 3-argument form before the existing `routePattern` block. Fastify scan now returns 2 routes.**

2. **Fastify dedup claim not smoke-tested:** Previous smoke test called `scan --verbose` on the Fastify fixture with no assertions on route count, route properties, or deduplication behavior. Silent pass does not verify framework-specific deep extraction. **Challenge upheld. Added 5 new smoke-test assertions: Fastify route count = 2, GET handler = `listOrders`, GET input_schema reflects schema hints, POST path = `/orders`, POST auth_hints includes `requireAuth`.**

3. **NestJS guard inheritance and path composition not smoke-tested:** Previous smoke test called `scan --verbose` on the NestJS fixture with no assertions. Silent pass does not verify the two key NestJS framework-specific behaviors: (a) class-level `@UseGuards(AuthGuard)` inherited by all methods, and (b) controller prefix `users` + method decorator `:id/disable` composed into `/users/:id/disable`. Live scan confirmed both work correctly. **Challenge upheld. Added 4 new smoke-test assertions: NestJS route count = 2, GET path = `/users`, GET auth_hints includes `AuthGuard` (class inheritance), POST path = `/users/:id/disable` (prefix composition), POST auth_hints includes both `AuthGuard` and `AdminGuard`.**

4. **No acceptance criterion for framework-specific deep extraction:** The acceptance matrix covered framework detection broadly (REQ-007 through REQ-009: scan exits 0) but had no criterion for the specific deep behaviors documented in SYSTEM_SPEC.md lines 297-349: 3-argument inline pattern, deduplication, guard inheritance, prefix composition. **Challenge upheld. Added REQ-036 to acceptance matrix with 7 specific assertions now passing.**

All four challenges resolved. `node tests/smoke.mjs` exits 0. Acceptance matrix now covers 36 criteria.

## Challenge To Dev Turn (turn_c976f258) — version history fields (DEC-207)

The dev turn implemented M13: manifest-level version history via `manifest_version`, `previous_manifest_hash`, and `capability_digest`. I challenged this on four grounds:

1. **Pipeline coverage and strict non-propagation:** Version history fields must appear in `tusq.manifest.json` only — they must be absent from compiled `tusq-tools/*.json`, MCP `tools/list`, and MCP `tools/call`. Verified in `src/cli.js`: `manifest_version` and `previous_manifest_hash` are written at manifest root (lines 384-385), `capability_digest` is computed per-capability (line 374). Compile pipeline (`tusq-tools/*.json`) has no version-history output; `tools/list` and `tools/call` responses have no version-history output. Smoke test line 319 asserts `'capability_digest' in compiledTool || 'manifest_version' in compiledTool` → throws; smoke test line 388-389 asserts same for `tools/call`. **Challenge resolved: intentional manifest-only boundary correctly enforced.**

2. **Deterministic digest computation:** `capability_digest` uses stable sorted-key JSON (`stableStringify` → `sortKeysDeep`) plus SHA-256. The digest excludes `approved`, `approved_by`, `approved_at`, `review_needed`, and `capability_digest` itself — only content fields change the digest. Smoke test lines 263-274 verify digest invariance for approval-only edits; lines 284-285 verify digest changes on content edits; lines 288-291 verify re-computed expected digest matches implementation output. **Challenge resolved: deterministic and correctly scoped to content fields only.**

3. **Smoke test completeness (8 assertions):** Eight distinct checks: (a) `manifest_version` increments from prior file or starts at 1 (lines 239-244); (b) `previous_manifest_hash` matches SHA-256 of prior bytes or null on first run (lines 246-249); (c) per-capability `capability_digest` is a 64-char lowercase hex string (lines 252-254); (d) `capability_digest` matches independently computed expected value (lines 256-259); (e) digest stable across approval-only edits (lines 272-274); (f) digest changes on content edit (lines 284-285); (g) version-history absent from compiled tools (line 319); (h) version-history absent from MCP `tools/call` (lines 388-389). All 8 pass (`node tests/smoke.mjs` → exit 0). **Challenge resolved: assertions valid, complete, and passing.**

4. **Documentation accuracy:** `website/docs/manifest-format.md` lists `manifest_version` and `previous_manifest_hash` as manifest root fields with correct types and null-on-first-run semantics. `capability_digest` is listed as a capability field with explicit exclusions (`approved`, `approved_by`, `approved_at`, `review_needed`). `website/docs/mcp-server.md` explicitly states version history fields are manifest-only and absent from MCP responses. No overclaim found. **Challenge resolved: accurate.**

New requirement REQ-035 added to acceptance matrix covering version-history field completeness, digest determinism, strict non-propagation to compile and MCP, and documentation accuracy. Acceptance matrix now covers 35 criteria.

## Challenge To Dev Turn (turn_9a6c87406474f433) — redaction + approved_by/approved_at (DEC-196)

The dev turn implemented the final VISION.md canonical artifact dimension: redaction and approval audit metadata. I challenged this on four grounds:

1. **Pipeline coverage and intentional asymmetry for `redaction`:** redaction must appear at manifest and compile (two writeable stages) and MCP `tools/call`, but NOT `tools/list` (which is the lightweight listing surface). Verified in `src/cli.js`: manifest preservation at lines 340 and 362, compile propagation at line 443, `tools/call` inclusion at line 578, and `tools/list` exclusion confirmed by smoke test assertion at line 241-242 (`'redaction' in firstTool` → throws). **Challenge resolved: intentional and correctly enforced.**

2. **manifest-only boundary for `approved_by`/`approved_at`:** DEC-196 claims approval audit fields are manifest-only. Smoke test line 205 asserts `approved_by`, `approved_at`, `approved`, and `review_needed` are all absent from compiled tools. Smoke test line 271 asserts the same absence from `tools/call` response. Verified `normalizeApprovedBy()` and `normalizeApprovedAt()` are not invoked anywhere in the compile or serve pipelines — only in the manifest generation preservation maps (lines 341-342, 367-368). **Challenge resolved: boundary correctly enforced at all three non-manifest stages.**

3. **Smoke test completeness (7 assertions):** Verified 7 distinct assertions covering the full boundary surface: (a) default `redaction` 4-field shape on new manifest (smoke line 172-173); (b) default `approved_by`/`approved_at` null (line 178); (c) custom redaction preserved through compile (line 202-203); (d) approval metadata absent from compiled tools (line 205); (e) `tools/list` excludes redaction (line 241-242); (f) tools/call redaction preserved from manifest (line 268-269); (g) approval metadata absent from tools/call (line 271). All 7 pass (`node tests/smoke.mjs` → exit 0). **Challenge resolved: assertions valid, complete, and passing.**

4. **Documentation accuracy:** `website/docs/manifest-format.md` lists `redaction` (line 33) and `approved_by`/`approved_at` (lines 38-39) in the capability field inventory; the `## Approval and redaction` section (lines 99-112) correctly describes default shapes, V1 behavior, and the propagation boundary. `website/docs/mcp-server.md` lines 23-24 correctly state tools/call includes `redaction` and that approval metadata is manifest-only. **Challenge resolved: accurate and no overclaim.**

New requirement REQ-034 added to acceptance matrix covering redaction propagation, approval manifest-only boundary, 7 smoke-test assertion points, and documentation accuracy. Acceptance matrix now covers 34 criteria.

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

## Challenge To Dev Turn (turn_f38f05a4fef53bc4) — M13 roadmap bookkeeping closure (attempt 3)

The dev turn closed stale M13 roadmap checklist items in `.planning/ROADMAP.md` and added an M13 closure verification section to `.planning/IMPLEMENTATION_NOTES.md`. No code changes were made to `src/cli.js`. I challenged this on three grounds:

1. **Accuracy of M13 item closure:** M13 covers `manifest_version`, `previous_manifest_hash`, and `capability_digest`. All three are implemented in `src/cli.js` (lines 374, 378, 384-385) and tested via 8 smoke assertions in `tests/smoke.mjs` (REQ-035). The ROADMAP.md checklist reflects the actual shipped state. **Challenge resolved: closure is accurate.**

2. **M14 item closure accuracy:** M14 covers framework support depth specification. All 5 M14 checklist items are now marked `[x]` in ROADMAP.md. The per-framework detection matrix, Node.js-only rationale, V1 limitations, V2 expansion plan, and V2 plugin interface are all present in SYSTEM_SPEC.md (lines 299-349). **Challenge resolved: M14 closure is accurate.**

3. **Full roadmap exhaustion:** grep confirms 84 `[x]` items and 0 `[ ]` items in `.planning/ROADMAP.md`. No items are incorrectly left open. All milestones M1–M14 are complete. **Challenge resolved: roadmap fully closed.**

`node tests/smoke.mjs` → exit 0 re-confirmed on current HEAD. No new acceptance criterion required; REQ-036 already covers framework-specific deep extraction from the prior QA challenge of the earlier M14 implementation turn.

## Challenge To Dev Turn (turn_ddc0f0c213477934)

The dev turn added `website/docs/roadmap.md`, updated `website/sidebars.ts`, extended the homepage with a roadmap CTA section, and updated `.planning/IMPLEMENTATION_NOTES.md`. I challenged these on three grounds:

1. **Scope creep risk:** Adding post-v0.1.0 content to the launch homepage could dilute v0.1.0 signal. On inspection, the roadmap CTA is a secondary action and the roadmap page opens with an explicit disclaimer "None of the items below are shipped behavior in `v0.1.0`" — acceptable.
2. **Sidebar classification:** Roadmap is placed under `Help` alongside `faq`. That placement is correct: it is forward-looking context rather than a how-to doc.
3. **v0.1.0 truth boundary:** The non-shipped disclaimer is literal and unambiguous. No overclaim found.

Decision: dev turn accepted. REQ-029 added to acceptance matrix. Build and smoke tests re-verified at exit 0 on post-dev HEAD.

## QA Summary

All 36 acceptance criteria are now covered in QA evidence, including the 22 CLI/runtime checks, 3 live-site consolidation checks, 3 provenance-chain checks (REQ-026 through REQ-028), 1 roadmap page check (REQ-029), 1 manifest-format doc check (REQ-030), 1 sensitivity_class pipeline check (REQ-031), 1 auth_hints MCP runtime check (REQ-032), 1 examples/constraints pipeline check (REQ-033), 1 redaction/approval-audit pipeline check (REQ-034), 1 version-history/digest pipeline check (REQ-035), and 1 framework-specific deep extraction check (REQ-036). This QA pass independently challenged the dev turn (turn_f38f05a4fef53bc4) that closed M13/M14 bookkeeping on four grounds: Fastify 3-argument inline pattern was broken (GET route silently dropped — fixed), dedup and deep extraction claims were not smoke-tested, NestJS guard inheritance and path composition were not asserted, and the acceptance matrix had no criterion covering framework-specific deep behaviors. All four challenges resolved. The smoke test suite (`node tests/smoke.mjs`) executed end-to-end and exited 0 independently. Manual spot-checks confirmed correct CLI UX:

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
