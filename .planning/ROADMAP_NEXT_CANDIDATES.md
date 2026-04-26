# Roadmap Next Candidates — VISION-Derived M30-M44

This file is an operator-authored candidate backlog derived from `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.planning/VISION.md`.

It intentionally does **not** replace `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.planning/ROADMAP.md`. Treat this as seed material for AgentXchain PM/dev/QA autopilot testing once M28 and M29 are complete or once the framework is explicitly instructed to derive follow-on work.

## Ordering Principle

The sequence below keeps work incremental and locally verifiable. It favors static/plugin/eval/rollout scaffolds before harder runtime-learning features, so each milestone can be implemented by the current CLI without needing hosted infrastructure.

## Vision-Derived Charter Candidate: Static Embeddable-Surface Plan Export (V2 First Step)

VISION source: `.planning/VISION.md` line 27 ("embeddable chat, widget, command-palette, and voice surfaces" — listed under **The Promise**); lines 193–224 (Brand-Matched Chat Interface, Brand-Matched Voice Interface, Embeddable Widgets And Command Surfaces). VISION enumerates these as V1 surfaces, but **shipped reality M1–M29 ships only the compiler/governance half** — none of the four embeddable surfaces have any implementation today. This charter candidate is the smallest first increment that addresses the vision goal **without** committing the project to runtime chat/voice/widget rendering inside V1.x.

**Intake intent:** `intent_1777171732846_289f` (vision_scan, p2, charter "[vision] The Promise: embeddable chat, widget, command-palette, and voice surfaces"). Acceptance contract: "Vision goal addressed: embeddable chat, widget, command-palette, and voice surfaces."

**PM challenge to a naive read of the charter:** "Vision goal addressed" does **not** mean ship the four runtime surfaces in one milestone. Generating a working brand-matched embedded chat client, a voice interface, framework-agnostic action/insight widgets, and a Ctrl+K command palette — each with its own brand/tone configuration, IAM mapping, and embed-host story — is a multi-quarter V2 program, not a 1-day increment. Forcing it into one milestone would break the local-only / static-only / no-new-runtime-dependency invariants that M25–M29 hold and would not be reviewable in the PM/dev/QA pattern this run uses.

**Proposed first increment (charter sketch — not yet bound to an M-number; operator decides ordering):** `tusq surface plan` — a read-only, deterministic, manifest-only command that emits a per-surface **plan** (not a runtime artifact) describing what each of the four embeddable surfaces would look like for the approved capabilities in the current manifest.

**Frozen four-value `surface` enum:** `chat | palette | widget | voice`. No fifth value in V1.x; future surfaces (e.g., email reply, slack-bot) require a new milestone.

**Per-surface plan shape (deterministic JSON):**

- `surface`: one of the four enum values
- `eligible_capabilities[]`: capability names whose `approved === true` AND whose `sensitivity_class` ∈ {`public`, `internal`} (chat/palette default) or whose side-effect class is read-only (widget read variant) — exact eligibility rules per surface frozen in the charter
- `gated_capabilities[]`: capabilities present in the manifest but excluded from this surface, with frozen reason codes (`unapproved`, `restricted_sensitivity`, `confidential_sensitivity`, `destructive_side_effect`, `auth_scheme_unknown`, `auth_scheme_oauth_pending_v2`)
- `entry_points[]`: per-surface suggested entry points derived from capability domain (M9/M15) and verb (M9), e.g., for `chat` an `intents[]` list paired with capability names; for `palette` an `actions[]` list with verb-prefixed labels; for `widget` an `action_widgets[]` and `insight_widgets[]` split keyed off side-effect class; for `voice` a `voice_intents[]` list constrained to non-destructive read/update flows
- `redaction_posture`: copy-forward of the M27 advisory set per eligible capability (no recomputation, no drift)
- `auth_posture`: copy-forward of M29 `auth_requirements` per eligible capability (no recomputation, no `auth_scheme: "none"` for unknown)
- `brand_inputs_required[]`: frozen list of brand fields the surface would need to be **rendered** in a future milestone (e.g., `brand.tone`, `brand.color_primary`, `voice.persona`, `widget.layout_density`) — names only, no values; this is the planning seam where a future increment could plug in a brand profile
- `manifest_version`, `generated_at` copy-forward verbatim from manifest top-level (null/unknown fallback per M27 pattern)

**Frozen invariants (mirroring M27/M28/M29 reviewer-aid pattern):**

- Read-only: `tusq.manifest.json` mtime/content unchanged; no `.tusq/` write; `capability_digest` MUST NOT flip; `tusq compile` and `tusq serve` byte-for-byte unchanged
- Deterministic: byte-identical output across runs for the same manifest; locked by an eval scenario
- Empty-capabilities valid-exit-0 with explicit `No capabilities in manifest — nothing to plan.` human line and `surfaces: []` JSON
- Empty-stdout-on-every-exit-1 path with stderr-only error text
- New top-level noun `surface` with single subcommand `plan` and the flag set `--surface <chat|palette|widget|voice|all>`, `--manifest <path>`, `--out <path>`, `--json`. No new dependency in `package.json`. CLI surface grows from 13 → 14 commands. (PM **explicitly** flags this as the first new top-level noun since `redaction` (M27) — operator should weigh whether `tusq plan surface` as a sub-noun under a future planning hub is preferable; this is an open scope decision.)
- Reviewer-aid framing: SYSTEM_SPEC Constraint 23 (proposed) — "`tusq surface plan` is a planning aid that describes what an embeddable surface **would** look like for the current manifest. It does NOT generate runnable chat/widget/palette/voice code, does NOT host any runtime, does NOT execute capabilities, and does NOT certify brand or accessibility compliance. Subsequent milestones (chat-only generator, palette-only generator, widget-only generator, voice-only generator) ship under their own ROADMAP entries with fresh acceptance contracts."

**Acceptance contract sketch (~10 items, mapped 1:1 to AC-1..AC-10 once chartered):**

- AC-1: `tusq surface plan` command exists; `--help` documents the four-value `surface` enum and the four flags
- AC-2: per-surface plan emitted for each enum value; default is `--surface all` emitting all four
- AC-3: deterministic byte-identical output across runs (locked by an eval scenario `surface-plan-determinism`)
- AC-4: zero-evidence guard — empty `capabilities: []` exits 0 with the documented human line and `surfaces: []` JSON
- AC-5: read-only invariant — manifest mtime/content unchanged, no `.tusq/` write, no `capability_digest` flip, golden-file assertion on `tusq compile` byte-identity, golden-file assertion on `tusq serve tools/list` byte-identity
- AC-6: gated_capabilities reason-code enum is closed (six values listed above); unknown gating reason is an implementation-time error
- AC-7: brand_inputs_required is a frozen named-list (no values, no placeholders, no template strings) per surface
- AC-8: empty-stdout-on-exit-1 across every error path, asserted by the smoke suite for both `--manifest` and `--surface` validation failures
- AC-9: at least one new eval regression scenario named `surface-plan-determinism` is added; total eval scenarios become **≥17**
- AC-10: SYSTEM_SPEC Constraint 23 is added; docs/README/CLI-help MUST NOT describe `tusq surface plan` as "generates a chat client," "renders a widget," "hosts a voice interface," "runs a command palette," or any phrase implying runtime surface generation

**Explicit non-goals for this V1.x increment (PM scope-protection list):**

- No actual chat client code is generated
- No actual widget HTML/JS/CSS is generated
- No actual voice client (browser or otherwise) is generated
- No actual command-palette UI is generated
- No brand profile read from disk; `brand_inputs_required` is a **list of names**, not a values lookup
- No new dependency in `package.json` (no React, no Vue, no Lit, no Web Speech polyfill, no audio runtime, no markdown renderer)
- No network I/O
- No mutation of any existing command's behavior beyond the new top-level noun
- No new `.tusq/` directory or file; output goes to stdout (with `--json`) or to a path passed via `--out`

**Successor milestones (deferred, not chartered yet):**

- M-Chat-1: branded chat-client static-bundle generator (read-only deterministic emit; future)
- M-Palette-1: framework-agnostic command-palette static-bundle generator (read-only deterministic emit; future)
- M-Widget-1: action-widget and insight-widget static-bundle generators (read-only deterministic emit; future)
- M-Voice-1: browser-voice-interface static-bundle generator (read-only deterministic emit; future)

Each successor milestone ships under its own ROADMAP entry with a fresh acceptance contract, fresh re-approval expectation, and fresh non-claims list. The operator decides the ordering once `surface plan` is shipped and exercised against real manifests.

**Why a planner-first increment, not a generator-first increment:** The shipped pattern (M27/M28/M29) consistently introduces a reviewer-aid that surfaces what the manifest already implies, before any milestone that mutates downstream artifacts. Shipping `tusq surface plan` first lets the project (a) discover which capabilities are actually viable for each surface under current sensitivity/auth posture, (b) discover which brand fields the project doesn't yet have, and (c) catch capability-domain gaps **before** any code-generating milestone bakes assumptions into a chat/widget/voice runtime. This is the same logic that put `tusq redaction review` ahead of any runtime PII-redaction enforcement (M27 Constraints 19–20).

**Status:** Charter sketch only — not yet a frozen ROADMAP entry. Operator/human approval is required before this becomes M30-Surface (or whatever number the operator assigns). The four PM-owned planning_signoff artifacts in this run are re-affirmed unchanged for the V1.10 boundary; this charter sketch lives in the candidate backlog until the operator chooses to bind it.

## Vision-Derived Charter Candidate: MCP Server Static Descriptor Export (V2 Self-Host First Step)

VISION source: `.planning/VISION.md` line 28 ("a self-hostable runtime and MCP server" — listed under **The Promise**); lines 229–249 (**MCP Server** § enumerating tools, skills, auth-scope metadata, self-hosted runtime support, dry-run, audit, MCP registry metadata); lines 396 ("auth adapters from detected codebase patterns"); lines 453–477 (**OSS Boundary** — CLI-first, self-hosted, full-stack from CLI); lines 513 ("Self-hostable execution runtime with same-session proxy, generated auth adapters, dry-run, confirmation, direct execution for approved low-risk actions, audit, trace, and policy enforcement"); lines 515–517 (**MCP And Marketplace** — generated MCP server output, marketplace packages, ecosystem metadata, icons, descriptions, example prompts, auth scopes); lines 595–611 (**V1 Promise** including self-hosted runtime, generated auth adapters for MCP/marketplace/off-platform use, MCP server).

**Intake intent:** `intent_1777173722739_5899` (vision_scan, p2, charter "[vision] The Promise: a self-hostable runtime and MCP server"). Acceptance contract: "Vision goal addressed: a self-hostable runtime and MCP server."

**PM challenge to a naive read of the charter — partial-coverage acknowledgement.** Unlike the embeddable-surface charter (zero coverage today), the self-hostable-runtime + MCP-server vision goal is **partially served already at V1.10**:

- **Self-hostable CLI:** the OSS is CLI-first, file-first, runs entirely locally with zero hosted-service dependency (`tusq init` / `tusq scan` / `tusq manifest` / `tusq compile` / `tusq serve` are all local, deterministic, and disk-only).
- **MCP server (describe-only):** `tusq serve` is in the 13-command surface and ships a describe-only local MCP endpoint with `tools/list`, `tools/call`, and `dry_run_plan` (per SYSTEM_SPEC § serve). This already satisfies the **describe-only** half of the MCP commitment.

The **unserved** parts of the charter — and therefore what a future increment must address — are:

1. **Static MCP server descriptor as a self-hostable artifact.** Today the MCP shape is only knowable by *running* `tusq serve` and querying it. There is no static descriptor file an operator can commit, diff, hash, sign, or hand to a self-hosted MCP host without running tusq's own server process. VISION line 249 ("MCP registry metadata") and lines 515–517 (MCP marketplace/registry packaging) are not yet served.
2. **Generated auth adapters** for MCP/marketplace/off-platform use (VISION lines 396, 608) — out of scope for this V1.x charter; deferred to a future M-Runtime-Auth milestone.
3. **Execution runtime beyond describe-only** — same-session proxy, dry-run with confirmation, direct execution of approved low-risk actions, runtime audit/trace (VISION line 513) — out of scope for this V1.x charter; deferred to a future M-Runtime-Exec milestone with a fresh acceptance contract and fresh re-approval expectation.
4. **MCP marketplace packaging** (icons, descriptions, example prompts, registry submission) — out of scope; deferred to a future M-MCP-Marketplace milestone.

The PM-defensible response is to charter the **smallest first increment that addresses the unserved half (1)**: a static, deterministic, manifest-only **MCP server descriptor export** that captures the *describe-only* MCP shape (what `tusq serve` already exposes today) into a registry-compatible static JSON file. Items (2), (3), and (4) remain V2/V3 work under their own future ROADMAP entries.

**Proposed first increment (charter sketch — not yet bound to an M-number; operator decides ordering and naming):** Static MCP Server Descriptor Export — a read-only, deterministic, manifest-only command that emits a `.tusq/mcp-descriptor.json` (or stdout JSON) describing the project's MCP server shape in a registry-compatible form, derived **purely** from the already-shipped manifest + compiled-tool output without running a server process and without any new runtime dependency.

**Open scope decision the operator must resolve before binding the charter (PM explicitly flags this as the most important pre-binding decision):** noun-vs-flag form. The PM proposes three candidate forms; **none is chosen in this charter sketch**. Operator decides:

- **(A) New top-level noun `mcp` with subcommand `export`:** `tusq mcp export [--manifest <path>] [--out <path>] [--json]`. CLI surface grows 13 → 14 commands. Pro: clean separation of describe-only MCP shape generation from the live `serve` process. Con: introduces a *second* new top-level noun proposal in the same run as `surface` (charter above), which compounds top-level surface growth. Adds a `mcp` noun that is conceptually adjacent-to-but-distinct-from the existing `serve` command, which may confuse operators.
- **(B) Flag-only extension to existing `serve` command:** `tusq serve --export <path>` (and/or `tusq serve --export --json` to stdout) — when `--export` is set, the command writes the static descriptor and exits without starting a server process. CLI surface stays at 13 commands. Pro: minimal surface growth; co-locates static and runtime forms of the same describe-only shape. Con: overloads the `serve` verb (which today *only* starts a server) with a non-server emit mode, which violates the "verbs do one thing" command-surface discipline that command-surface.md established for M27/M28/M29.
- **(C) Subcommand under a future planning hub:** `tusq plan mcp` (alongside the proposed `tusq plan surface` from the embeddable-surface charter). Pro: defers the entire top-level-noun-growth decision until a `plan` hub is chartered. Con: requires chartering the `plan` hub *first*, which is itself an unfinished scope decision flagged on the embeddable-surface charter above.

The PM **does not** pre-commit to any of (A)/(B)/(C); the operator chooses at the planning_signoff gate. The remainder of this charter sketch is form-agnostic — every other invariant, output shape, and acceptance criterion below applies equally to any of the three forms.

**Static descriptor output shape (deterministic JSON; bytes are byte-identical across runs for the same manifest):**

- `schema_version`: frozen literal string (e.g., `"tusq.mcp-descriptor.v1"`) — bumping this is a material governance event.
- `manifest_version`, `generated_at` copy-forward verbatim from manifest top-level (null/unknown fallback per the M27 pattern; never silently empty-string).
- `mcp_server_name`, `mcp_server_version` copy-forward from manifest top-level fields if present, otherwise `null` (never invented).
- `runtime_posture`: closed three-value enum literal `{ describe_only_supported: true, execution_supported: false, auth_adapter_generation_supported: false }` — encodes the V1.10 reality that this descriptor captures the *describe-only* shape and explicitly disclaims execution and auth-adapter generation. Future runtime milestones flip these flags only under their own M-numbers.
- `tools[]`: one entry per **approved** capability (`approved === true`). For each: `name`, `description`, `domain`, `verb`, `input_schema` (copy-forward of compiled JSON Schema produced by M[`compile`]; no recomputation), `side_effect_class` (M9 copy-forward), `sensitivity_class` (M28 copy-forward), `auth_requirements` (M29 copy-forward — the closed seven-value `auth_scheme` enum, the closed five-value `evidence_source` enum, scopes, roles), `redaction_advisories` (M27 copy-forward — frozen-byte advisory strings keyed by `pii_categories`), `audit_required` (deterministic derivation from `sensitivity_class` ∈ {`confidential`, `restricted`} OR `side_effect_class` ∈ {`write`, `destructive`}; documented as a derivation, not a new manifest field).
- `gated_tools[]`: capabilities present in the manifest but excluded from the descriptor with a frozen closed reason-code enum: `unapproved`, `restricted_sensitivity`, `confidential_sensitivity_pending_review`, `auth_scheme_unknown_pending_v2`, `auth_scheme_oauth_pending_v2`, `destructive_side_effect_pending_v2`. Unknown gating reason is an implementation-time error.
- `registry_metadata`: frozen named-list of registry fields a future MCP-marketplace submission would need (`registry.target` (e.g., `"anthropic_mcp"`/`"openai"`/`"claude_mcp"` — name-only), `registry.icon_path`, `registry.example_prompts`, `registry.publisher`, `registry.category`, `registry.privacy_policy_url`, `registry.terms_url`) — **names only, no values, no placeholder strings**; this is the planning seam where a future M-MCP-Marketplace milestone could plug in real values.
- `derived_from`: deterministic pointer block — `manifest_path`, `manifest_sha256` (computed from the same manifest bytes the rest of tusq already reads; no new hashing infrastructure), `capability_digest` copy-forward (M13 invariant — this digest MUST NOT flip from emitting the descriptor).
- `disclaimers`: frozen literal text array reciting the runtime-posture booleans in human-readable form, e.g., `[ "This descriptor describes the static shape of tusq's describe-only MCP server. It does NOT generate a stand-alone execution runtime, does NOT generate auth adapters, and does NOT certify MCP-registry submission readiness." ]`.

**Frozen invariants (mirroring the M27/M28/M29 reviewer-aid pattern):**

- **Read-only:** `tusq.manifest.json` mtime/content unchanged; no `.tusq/` write unless `--out` is given (and even then, only the single descriptor file at the given path); `capability_digest` MUST NOT flip; `tusq compile` byte-for-byte unchanged; `tusq serve` MCP responses (`tools/list`, `tools/call`, `dry_run_plan`) byte-for-byte unchanged; `tusq policy verify`, `tusq redaction review`, `tusq review` byte-for-byte unchanged.
- **Deterministic:** byte-identical output across runs for the same manifest; locked by a new eval scenario named `mcp-descriptor-determinism` (eval harness 16 → ≥17 scenarios; ≥18 if the surface-plan candidate is also chartered before this one).
- **Empty-capabilities valid-exit-0** with explicit `No capabilities in manifest — nothing to export.` human line and `tools: []` / `gated_tools: []` JSON; `disclaimers` and `runtime_posture` still emitted unchanged so consumers can detect the empty-but-valid case.
- **Empty-stdout-on-every-exit-1 path** with stderr-only error text (matches M27/M28/M29 pattern).
- **Zero new dependencies** in `package.json`. **Zero network I/O.** **Zero registry call.** No `mcp-sdk`, no `@modelcontextprotocol/*` runtime SDK, no `passport`, no `jsonwebtoken`. The descriptor is a static JSON file emitted by a pure function; it does NOT validate against any external MCP-SDK schema at emit time (validating against an external schema is a future milestone).
- **No mutation** of any existing command's behavior beyond the form chosen by the operator at binding time (form A adds a noun; form B adds a flag to `serve`; form C adds a subcommand under a hub yet to be chartered).
- **Reviewer-aid framing — proposed Constraint 24:** "The static MCP server descriptor is a planning-and-distribution artifact that captures the *describe-only* shape of `tusq serve` for self-hosted MCP integration. It does NOT host execution outside `tusq serve`, does NOT generate auth adapters, does NOT generate a stand-alone runtime binary, does NOT call any MCP marketplace, does NOT publish to any registry, does NOT certify compliance with any registry's submission requirements, and does NOT enforce runtime authentication, authorization, or policy. Subsequent milestones (M-Runtime-Auth-1 auth-adapter scaffold export, M-Runtime-Trace-1 execution trace import format, M-Runtime-Exec-1 same-session proxy for approved-read capabilities, M-MCP-Marketplace-1 registry submission helper) ship under their own ROADMAP entries with fresh acceptance contracts and fresh non-claims lists." Forbidden framings: "self-hostable runtime generator," "AI runtime engine," "MCP marketplace publisher," "auth adapter generator," "MCP execution runtime," "registry-certified output."

**Acceptance contract sketch (~10 items, mapped 1:1 to AC-1..AC-10 once chartered):**

- AC-1: command exists in the form chosen by the operator at binding time (A/B/C above); `--help` documents the flag set and the descriptor's `schema_version`.
- AC-2: descriptor JSON shape matches the spec above with all fields present (including `runtime_posture` and `disclaimers` even on empty manifests).
- AC-3: deterministic byte-identical output across runs (locked by eval scenario `mcp-descriptor-determinism`).
- AC-4: zero-evidence guard — empty `capabilities: []` exits 0 with the documented human line and `tools: []` / `gated_tools: []` JSON.
- AC-5: read-only invariant — manifest mtime/content unchanged, no `.tusq/` write unless `--out` given, no `capability_digest` flip; golden-file assertions on `tusq compile` byte-identity AND on `tusq serve tools/list` / `tools/call` / `dry_run_plan` byte-identity.
- AC-6: `gated_tools` reason-code enum is closed (six values listed above); unknown gating reason is an implementation-time error caught by a smoke test.
- AC-7: `registry_metadata` is a frozen named-list (no values, no placeholders, no template strings, no `null` for missing — the field is *always* a name-only list pointing to fields a future milestone would populate).
- AC-8: empty-stdout-on-exit-1 across every error path, asserted by the smoke suite for `--manifest` validation failures, malformed manifest, and any future flag validation failures.
- AC-9: at least one new eval regression scenario named `mcp-descriptor-determinism` is added; total eval scenarios become **≥17** (or ≥18 if surface-plan is chartered first).
- AC-10: SYSTEM_SPEC Constraint 24 is added; docs/README/CLI-help MUST NOT describe this command as "generates an MCP server," "publishes to a marketplace," "generates auth adapters," "hosts a runtime," or any phrase implying runtime/registry/auth-adapter generation. The static descriptor is consistently called out as **describe-only shape capture** — never as runtime generation.

**Explicit non-goals for this V1.x increment (PM scope-protection list):**

- No execution runtime beyond what `tusq serve` already does today (describe-only).
- No auth adapter code is generated.
- No marketplace registry call (Anthropic, OpenAI, Claude, anyone).
- No new dependency in `package.json` (no `mcp-sdk`, no MCP runtime SDK, no auth library).
- No network I/O.
- No mutation of `tusq serve` runtime behavior.
- No mutation of `capability_digest` (M13 invariant).
- No `.tusq/` write unless `--out` is explicitly passed.
- No new top-level noun if the operator chooses form (B) or (C); form (A) adds exactly one noun (`mcp`).
- No external schema validation at emit time (a future milestone may validate against an MCP-SDK schema; this milestone does not).

**Successor milestones (deferred, not chartered yet):**

- M-Runtime-Auth-1: Static auth adapter scaffold export (deterministic emit of an auth-adapter shell file from the M29 `auth_requirements` evidence; no runtime, no token validation; future).
- M-Runtime-Trace-1: Execution trace import format (already proposed at M40 in this candidate backlog).
- M-Runtime-Exec-1: Same-session proxy for approved-read capabilities only, with full re-charter, fresh acceptance contract, and fresh re-approval expectation. **This milestone is the V2 work.** Approved-write and destructive execution remain V3.
- M-MCP-Marketplace-1: Registry submission helper that fills the `registry_metadata` named-list with operator-supplied values and emits a registry-submission-ready bundle (future).

Each successor milestone ships under its own ROADMAP entry. The operator decides ordering once the static descriptor is shipped and exercised against real manifests.

**Why a static-descriptor-first increment, not a runtime-execution-first increment:** The shipped pattern (M27/M28/M29) consistently introduces a reviewer-aid that surfaces what the manifest already implies, before any milestone that mutates downstream artifacts. Shipping the static MCP descriptor first lets the project (a) discover which capabilities are actually viable for self-hosted MCP distribution under the current sensitivity/auth posture, (b) provide a hashable, diffable, signable artifact that self-hosting operators can commit to their own repos and govern alongside their tusq.manifest.json, and (c) catch capability-domain gaps **before** any milestone bakes assumptions into a runtime execution path. This is the same logic that put `tusq redaction review` ahead of any runtime PII-redaction enforcement (M27 Constraints 19–20) and that put M28 sensitivity-inference ahead of any runtime-sensitivity-gate enforcement.

**Status:** Charter sketch only — not yet a frozen ROADMAP entry. Operator/human approval is required before this becomes M30-MCP (or whatever number the operator assigns), and the noun-vs-flag form (A/B/C) decision must be resolved at the planning_signoff gate. The four PM-owned planning_signoff artifacts in this run are re-affirmed unchanged for the V1.10 boundary; this charter sketch lives in the candidate backlog until the operator chooses to bind it. **Both vision-derived candidates** (Static Embeddable-Surface Plan Export above and Static MCP Server Descriptor Export here) are mutually independent — the operator may bind either, both, or neither, in any order; nothing in either charter sketch presupposes the other.

## M30: Static Adapter Plugin Manifest Skeleton (~0.5 day)

VISION source: "Plugins are how we scale", "Capability discovery and normalization", "Auth and permission mapping", "Data and schema understanding".

- [ ] Define a `.tusq/plugins/<plugin-name>/plugin.json` manifest shape with `schema_version`, `name`, `version`, `capabilities`, `adapter_types`, and `entrypoints`.
- [ ] Add `tusq plugin list` command that discovers local plugin manifests only; no dynamic code execution.
- [ ] Validate plugin manifests with deterministic errors for missing fields, bad JSON, unsupported schema version, unknown adapter type, and duplicate plugin names.
- [ ] Emit machine-readable `--json` output for plugin discovery.
- [ ] Document that M30 is discovery-only and does not load or execute plugin code.
- [ ] Add smoke tests for empty plugin dir, one valid plugin, malformed plugin, duplicate names, and `--json` output.
- [ ] `npm test` exits 0; no network I/O; no new runtime dependency unless justified.

## M31: Built-In Adapter Registry Extraction Boundary (~0.5 day)

VISION source: "Plugins are how we scale", "Framework detectors, auth detectors, schema extractors, skill grouping packs, and interface adapters all live behind plugin interfaces."

- [ ] Refactor existing Express/Fastify/NestJS scanner selection into an internal adapter registry.
- [ ] Registry entries expose stable metadata: `id`, `type`, `framework`, `detect`, `extract`, `version`.
- [ ] Existing scan output remains byte-identical for current fixtures.
- [ ] Add `tusq plugin list --built-ins` to show built-in adapters alongside local manifest-only plugins.
- [ ] Add smoke coverage proving Express, Fastify, and NestJS fixture outputs are unchanged after the registry refactor.
- [ ] Document built-in adapters in CLI reference and supported-frameworks docs.
- [ ] `npm test` exits 0 and CLI surface remains backward-compatible.

## M32: Capability Domain Pack Export (~0.5 day)

VISION source: "Skill and agent composition", "group tools into domains such as billing, users, projects, support, and admin".

- [ ] Add `tusq skills export` command that reads an approved manifest and emits one Markdown skill-pack file per domain.
- [ ] Domain pack fields include domain name, included capabilities, side-effect summary, sensitivity/auth summary, approval status, and safe-use notes.
- [ ] Default output path is `.tusq/skills/`; support `--out <path>` and `--manifest <path>`.
- [ ] Unapproved capabilities are excluded by default; `--include-unapproved` includes them with explicit warning text.
- [ ] Output is deterministic across repeated runs on the same manifest.
- [ ] Add docs and smoke coverage for default export, custom output, unapproved exclusion, and deterministic output.

## M33: Multi-Step Workflow Plan Export (~1 day)

VISION source: "Skill and agent composition", "create checkpointed multi-step flows where that improves usability".

- [ ] Add `tusq workflow plan` command that groups approved capabilities into read-only candidate workflows based on domain and side-effect class.
- [ ] Emit workflow JSON with `workflow_id`, `domain`, `steps`, `required_confirmations`, `rollback_notes`, and `checkpoint_boundaries`.
- [ ] No execution is performed; this is planning/export only.
- [ ] Workflows involving destructive or financial capabilities must include an explicit confirmation boundary.
- [ ] Support `--json`, `--out`, and `--manifest`.
- [ ] Add smoke tests for simple read workflow, write workflow with confirmation, destructive workflow with checkpoint boundary, and deterministic output.

## M34: Golden Task Eval Generator (~1 day)

VISION source: "Eval and regression infrastructure", "generate golden tasks and expected tool-call sequences".

- [ ] Add `tusq evals generate` command that creates golden task fixtures from approved capabilities.
- [ ] Generated fixture includes natural-language task, expected tool name, required arguments schema, approval preconditions, and non-goals.
- [ ] Support `--count <n>`, `--domain <name>`, `--manifest <path>`, `--out <path>`, and `--json`.
- [ ] Generation is deterministic for a fixed manifest and seed.
- [ ] Sensitive/destructive capabilities receive conservative prompts that require confirmation or dry-run framing.
- [ ] Add smoke tests for deterministic generation, domain filtering, seed behavior, and safety framing.

## M35: Schema Drift Detector (~1 day)

VISION source: "Eval and regression infrastructure", "detect drift when the underlying product changes".

- [ ] Add `tusq diff --schema-only` mode that reports only input/output schema changes between previous and current manifest.
- [ ] Classify drift severity as `breaking`, `review`, or `informational`.
- [ ] Breaking drift includes removed required fields, type narrowing, enum removal, and additionalProperties tightening.
- [ ] Informational drift includes description-only or provenance-only changes.
- [ ] Emit human and `--json` outputs with deterministic ordering.
- [ ] Add smoke tests for each drift severity and for no-drift output.
- [ ] Document how schema drift interacts with approval reset and capability digest.

## M36: Permission Regression Fixture Generator (~1 day)

VISION source: "Eval and regression infrastructure", "permission regression", "Auth and permission mapping".

- [ ] Add `tusq evals permissions` command that emits regression fixtures from `auth_requirements`, `sensitivity_class`, side effects, and approval state.
- [ ] Fixtures include allowed/denied examples for auth scheme, roles/scopes, unapproved capabilities, and sensitive/destructive capabilities.
- [ ] Output is deterministic and local-only.
- [ ] Support `--manifest`, `--out`, `--json`, `--auth-scheme`, and `--sensitivity` filters.
- [ ] Add smoke tests for bearer, api_key, unknown auth, unapproved capability, and sensitivity filter cases.
- [ ] Document that fixtures are reviewer aids, not runtime authorization enforcement.

## M37: Rollout Plan Generator (~1 day)

VISION source: "Migration and rollout tooling", "support dev, staging, and production transitions", "generate kill-switch, fallback, and staged rollout guidance".

- [ ] Add `tusq rollout plan` command that reads manifest, policy, sensitivity, auth, and side-effect metadata to generate a staged rollout checklist.
- [ ] Rollout stages include `dev`, `internal`, `operator`, `staging`, and `customer-facing`.
- [ ] Risky capabilities require fallback notes, owner assignment placeholders, and explicit approval checkpoints.
- [ ] Support `--stage`, `--manifest`, `--policy`, `--out`, and `--json`.
- [ ] Output includes kill-switch and fallback sections, but does not create or enforce runtime kill switches.
- [ ] Add smoke tests for low-risk read-only rollout and high-risk destructive rollout.

## M38: Support and Security Review Artifact Generator (~0.5 day)

VISION source: "Documentation and adoption surfaces", "support docs, operator docs, security review artifacts".

- [ ] Add `tusq docs security-review` command that generates a security-review Markdown artifact from manifest, policy, auth, sensitivity, and redaction metadata.
- [ ] Include sections for capability inventory, sensitive data hints, auth requirements, approval gates, execution policy, known limitations, and non-claims.
- [ ] Add `tusq docs support` command or flag that generates support-facing capability summaries and escalation notes.
- [ ] Output is deterministic and supports `--out`.
- [ ] Add smoke tests for required sections, deterministic output, and non-claim language.
- [ ] Update docs to explain security-review artifacts are enablement documents, not compliance certifications.

## M39: Typed SDK Definition Export (~1 day)

VISION source: "Richer docs and adoption surfaces", "optional typed SDK generation", "AI-facing interface generation".

- [ ] Add `tusq sdk export --format typescript` command that emits TypeScript type definitions for approved capabilities.
- [ ] Generated definitions include capability names, input parameter types, dry-run plan types, sensitivity/auth metadata types, and normalized error shape.
- [ ] No runtime SDK client is generated in M39; type definitions only.
- [ ] Support `--manifest`, `--out`, and `--include-unapproved`.
- [ ] Output is deterministic and compile-checkable with `tsc --noEmit` in a fixture.
- [ ] Add smoke tests for generated type syntax and approved-only filtering.

## M40: Runtime Trace Import Format (~1 day)

VISION source: "Runtime instrumentation", "capture real payload shapes and failure modes", "observe auth context, retries, latency, and unstable endpoints".

- [ ] Define a local `.tusq/traces/*.jsonl` trace import format with request method/path, status, latency, auth context labels, retry count, and redacted payload shape.
- [ ] Add `tusq runtime import --trace <path>` that validates trace files and writes `.tusq/runtime-observations.json`.
- [ ] Do not proxy live traffic or collect data automatically in M40.
- [ ] Reject trace rows containing raw values where only shapes are allowed.
- [ ] Emit deterministic validation errors with row numbers.
- [ ] Add smoke tests for valid trace import, invalid JSONL, raw-value rejection, and deterministic observation output.

## M41: Runtime Observation Summary (~1 day)

VISION source: "Runtime instrumentation", "identify which APIs matter most in practice", "failure and latency analysis".

- [ ] Add `tusq runtime summarize` command that reads `.tusq/runtime-observations.json` and produces per-capability usage, latency, status, and retry summaries.
- [ ] Summary maps traces to capabilities using method/path matching and provenance.
- [ ] Output includes hot-path candidates, unstable endpoint candidates, and unmapped trace rows.
- [ ] Support human output, `--json`, `--manifest`, and `--out`.
- [ ] Add smoke tests for hot path ranking, latency percentile calculation, unmapped traces, and deterministic ordering.
- [ ] Document that runtime summary is imported-observation analysis, not live monitoring.

## M42: Manifest Improvement Proposal Generator (~1 day)

VISION source: "Runtime learning loop", "Automated improvement proposals", "suggest manifest changes, tool boundary improvements, and risk reclassification based on evidence".

- [ ] Add `tusq propose manifest-updates` command that compares static manifest data with runtime observations and emits proposed changes only.
- [ ] Proposal types include schema shape refinement, example update, sensitivity review recommendation, auth review recommendation, and capability boundary warning.
- [ ] Command must never mutate `tusq.manifest.json`.
- [ ] Proposals include evidence references back to manifest capability and runtime observation summary.
- [ ] Support `--json`, `--out`, and severity filters.
- [ ] Add smoke tests for proposal generation, no-op proposal output, deterministic ordering, and no manifest mutation.

## M43: Competitive Exposure Ranking Scaffold (~1 day)

VISION source: "Competitive transition intelligence", "rank the product surfaces that incumbents must AI-enable first".

- [ ] Add `tusq intelligence rank` command that ranks capabilities by strategic exposure using local manifest evidence only.
- [ ] Inputs include side-effect class, sensitivity, auth requirements, domain, business-facing naming, runtime hot-path signals if present, and approval status.
- [ ] Output includes `rank`, `capability`, `domain`, `exposure_score`, `score_factors`, and `recommended_ai_enablement_stage`.
- [ ] Do not use external competitor data in M43.
- [ ] Support `--json`, `--domain`, and `--out`.
- [ ] Add smoke tests for deterministic ranking, factor explanations, and no-runtime-observation fallback.
- [ ] Document this as prioritization scaffolding, not market research or competitive guarantee.

## M44: Capability Change Intelligence Report (~1 day)

VISION source: "Deep governance and change intelligence", "capability, policy, and schema diffs tied to replay and operational diagnostics".

- [ ] Add `tusq changes report` command that combines manifest diff, schema drift, policy alignment, redaction/auth/sensitivity changes, and runtime observation deltas into one review artifact.
- [ ] Report groups changes by capability and severity.
- [ ] Include replay/eval fixture pointers when generated evals exist.
- [ ] Support `--from <manifest>`, `--to <manifest>`, `--policy`, `--runtime-observations`, `--json`, and `--out`.
- [ ] Add smoke tests for manifest-only report, policy-aware report, runtime-aware report, and deterministic ordering.
- [ ] Document report as governance review input, not an automated approval decision.

## Recommended Autopilot Test Slices

Use these to test AgentXchain without overloading one run:

1. M30 only: plugin manifest discovery, low-risk scaffolding.
2. M32 only: skill-pack export, clear CLI/docs/tests path.
3. M34 only: eval generator, validates PM/dev/QA coordination.
4. M37 only: rollout plan generator, validates docs/product-marketing truth boundaries.
5. M40 only: runtime trace import, tests new file format and strict validation.
6. M42 only: proposal generator, tests no-mutation governance.

Avoid starting with M41-M44 before M40 exists; they depend on runtime observation artifacts.
