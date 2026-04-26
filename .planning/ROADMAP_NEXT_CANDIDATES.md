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
