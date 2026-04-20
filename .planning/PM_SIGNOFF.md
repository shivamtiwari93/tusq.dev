# PM Signoff — tusq.dev Docs & Website Platform

Approved: YES

> Planning artifacts reviewed and approved for the Docusaurus docs/website/blog platform initiative.
> Re-confirmed in run_a47f1dd6629dba75 (turn_160ed0ff8cedc45e) after parent run (run_c8a4701ce0d4952d) completed all phases but stalled awaiting human approval. Fresh PM review challenged two issues: (1) ROADMAP milestones were shown as unchecked despite implementation being complete — fixed by marking all milestones done; (2) SYSTEM_SPEC file tree listed incorrect blog filename (dots vs hyphens) — fixed to match actual file. Build re-verified: `npm run build` exits 0 with no errors.
>
> Updated in run_7c529def79b94f51 (turn_449d52ce8856b875) to address vision goal "The canonical artifact: input and output shapes." Added formal shape specifications for all 5 artifacts in the tusq.dev pipeline (tusq.config.json, scan.json, tusq.manifest.json, tusq-tools/*.json, MCP server responses) to SYSTEM_SPEC.md. These shapes were derived from the actual CLI implementation in src/cli.js and verified against test fixtures. ROADMAP updated with M8 milestone.
>
> Updated in run_aeca336174864081 (turn_d50a72d77645f27f) to address vision goal "The canonical artifact: side effects and sensitivity class." Formally specified `side_effect_class` classification rules (already implemented in V1) and introduced `sensitivity_class` as a new canonical artifact field. The sensitivity field follows the same conservative-default pattern as input/output schemas: present in V1 with `"unknown"` default, inference planned for V2. ROADMAP updated with M9 milestone. SYSTEM_SPEC updated with both classification rule tables, V1 limitations, and V2 inference signals.
>
> Updated in run_100292687c7b6b6e (turn_79fe98fb459a70cc) to address vision goal "The canonical artifact: auth and permission expectations." Challenged prior turns for leaving `auth_hints` under-specified — the field was shipped in V1 code but never formally documented with detection rules, agent implications, or limitations. SYSTEM_SPEC now includes a complete Auth and Permission Expectations section covering: detection regex and framework-specific extraction, agent behavior recommendations, V1 limitations (identifier-only, no role/scope extraction), and V2 structured `auth_requirements` shape. ROADMAP updated with M10 milestone. The three-field governance model (side_effect_class + sensitivity_class + auth_hints) is now fully specified.
>
> Updated in run_eef8e3a64fda1b0f (turn_85f68d6ffa429813) to address vision goal "The canonical artifact: examples and constraints." Challenged prior turns for leaving these two VISION.md dimensions (line 59) entirely unspecified. `examples` existed in compiled tools and MCP responses but was absent from the manifest Capability shape and had no formal spec. `constraints` did not exist anywhere in the pipeline. SYSTEM_SPEC now includes: (1) Examples specification with shape, agent implications, V1 static-placeholder limitations, pipeline propagation, and V2 inference from tests/JSDoc/OpenAPI/runtime; (2) Constraints specification with 5-field shape (rate_limit, max_payload_bytes, required_headers, idempotent, cacheable), agent implications, V1 null-default limitations, and V2 middleware-based inference. Both fields added to manifest, compiled tool, and MCP response shapes. ROADMAP updated with M11 milestone. The governance model is now five fields: side_effect_class + sensitivity_class + auth_hints + examples + constraints.
>
> Updated in run_fbc688008b70c5d1 (turn_bcbee07f789e05c9) to address vision goal "The canonical artifact: redaction and approval metadata." Challenged prior turns for leaving this VISION.md dimension (line 60) entirely unspecified. The `approved` and `review_needed` fields existed in V1 code but were never formally specified with agent implications, V1 limitations, or V2 plans. Redaction metadata did not exist anywhere in the pipeline despite VISION.md explicitly listing it. SYSTEM_SPEC now includes: (1) Redaction specification with 4-field shape (pii_fields, log_level, mask_in_traces, retention_days), agent implications, relationship to sensitivity_class, V1 permissive-default limitations, and V2 PII detection/regulatory inference; (2) Approval Metadata specification with shape (approved, approved_by, approved_at, review_needed), pipeline flow, agent implications, V1 limitations (no approval CLI), and V2 plans (tusq approve command, approval history, multi-party review). Added `approved_by` and `approved_at` to the manifest capability shape for audit trail. ROADMAP updated with M12 milestone. The governance model is now six dimensions covering all items listed in VISION.md lines 55-60.
>
> Updated in run_78133e963b912f46 (turn_360905c7f7c8ac1a) to address vision goal "The canonical artifact: version history and diffs." Challenged prior turns for leaving this VISION.md dimension (line 61) — the seventh and final canonical artifact dimension — entirely unspecified. No version tracking, content hashing, or diff mechanism existed anywhere in the pipeline. SYSTEM_SPEC now includes: (1) Manifest-level version fields (`manifest_version` integer counter, `previous_manifest_hash` SHA-256 hash chain) added to manifest root shape; (2) Per-capability `capability_digest` (SHA-256 of content fields excluding approval metadata) for change detection; (3) Full specification with agent implications, V1 limitations (no diff CLI, no history file, no auto re-approval), pipeline propagation (manifest-only), and V2 plans (`tusq diff` command, structured diff output format, diff-aware re-approval, manifest history file, git integration, CI/CD diff gate). ROADMAP updated with M13 milestone. The governance model is now seven dimensions, completing ALL items listed in VISION.md lines 55-61.

>
> Updated in run_5fa4a26c3973e02d (turn_addce63aff584689) to address vision goal "support the most common framework stacks deeply within the first release." Challenged prior turns for leaving framework support depth undocumented — the V1 implementation shipped three deep framework detectors (Express, Fastify, NestJS) but the planning artifacts never formally specified what "deep" means per framework, why Node.js-only is the right V1 scope, what the detection limitations are, or what the V2 expansion plan looks like. SYSTEM_SPEC now includes: (1) Per-framework detection matrix showing 12 capabilities across all 3 frameworks with framework-specific patterns; (2) Rationale for Node.js-only V1 scope (depth over breadth, shared infrastructure, target audience); (3) V1 detection limitations table (regex-based, no router composition, single-file scope, no TypeScript type inference); (4) V2 expansion plan with 5 frameworks prioritized (Django REST, FastAPI, Flask, Spring Boot, Gin/Echo) via plugin interface. ROADMAP updated with M14 milestone.

## Discovery Checklist

- [x] **Target user defined** — Developers and engineering leads evaluating or adopting tusq.dev. They need clear docs, honest product positioning, and a quickstart workflow they can follow in one terminal session.
- [x] **Core pain point defined** — The current `websites/` static HTML landing page has no documentation, no blog, and no structured content. Developers have to read the README or planning files to understand the product. There is no discoverable docs site.
- [x] **Core workflow defined** — Docusaurus project in `website/` directory. Homepage migrated from static HTML. Docs pages derived from accepted planning artifacts. Blog posts adapted from launch artifacts. `npm run build` produces a deployable static site.
- [x] **MVP scope defined** — Docusaurus 3.x site with: custom homepage, 7 docs pages, 2 blog posts, top navbar, docs sidebar, 404 page, SEO metadata, and product truth alignment.
- [x] **Out-of-scope list defined** — See SYSTEM_SPEC.md. Excludes: hosting/deployment config, search integration, i18n, analytics, interactive demos, API auto-generation, custom plugins.
- [x] **Success metric defined** — `npm run build` in `website/` produces a static site with zero errors and zero broken links. All content passes a product truth audit against MESSAGING.md.

## PM Challenges to the Intent

### Challenge 1: "Migrate docs" — but there are no user-facing docs yet

The intent says "migrate the current website/docs/blog surface." In reality:
- **Website:** A single static HTML landing page (`websites/index.html`) — this migrates directly.
- **Docs:** No user-facing documentation exists. The `.planning/` directory contains internal planning artifacts (SYSTEM_SPEC.md, command-surface.md, etc.) which are not user-facing docs. We need to **create** docs from these sources, not migrate them.
- **Blog:** No blog exists. We need to **create** a blog and adapt the ANNOUNCEMENT.md and RELEASE_NOTES.md into blog posts.

**Decision:** The scope is correctly framed as "create a docs platform" with content derived from accepted artifacts, not a mechanical migration.

### Challenge 2: Content must not drift from accepted product truth

The prior run produced carefully scoped MESSAGING.md with explicit "Claims We Can Defend" and "Claims We Must Not Make" sections. The Docusaurus content must stay within these boundaries. The SYSTEM_SPEC includes a dedicated M7 product truth audit milestone to enforce this.

**Decision:** Product truth alignment is a first-class acceptance criterion, not a nice-to-have.

### Challenge 3: Directory naming — `website/` vs `websites/`

The existing static site lives in `websites/`. Docusaurus convention is `website/` (singular). We should use `website/` for the Docusaurus project and leave `websites/` in place until the migration is confirmed working, then remove it.

**Decision:** New Docusaurus project goes in `website/`. Old `websites/` is not deleted during this initiative — that's a cleanup task for after verification.

### Challenge 4: Scope creep risk — fancy features

Docusaurus supports search, i18n, versioned docs, custom plugins, and many other features. None of these are needed for the initial platform. The spec explicitly excludes them.

**Decision:** Vanilla Docusaurus 3.x with default plugins only. Homepage swizzling is the only customization.

### Challenge 5: Sensitivity class — ship the field or defer entirely?

The vision (VISION.md line 57) lists "side effects and sensitivity class" as part of the canonical artifact. Side effects are implemented in V1 with `classifySideEffect()`. Sensitivity is not implemented at all — no code, no field, no inference.

**Options considered:**
- **A) Defer entirely to V2.** No field in V1 manifest. Simpler, but changes the artifact shape later, breaking consumers.
- **B) Add field with `"unknown"` default.** Field exists, no inference. Mirrors the `input_schema`/`output_schema` pattern. Consumers can rely on the field being present. Humans can manually edit it during manifest review.
- **C) Add field with basic inference from auth_hints.** More useful but adds implementation complexity and risk of false classification.

**Decision:** Option B. The `sensitivity_class` field ships in V1 as `"unknown"` for all capabilities. This establishes the contract without overclaiming inference accuracy. It follows the exact same pattern as V1 schemas: structurally present, intentionally conservative, manually editable, with real inference deferred to V2.

### Challenge 6: Side effect classification — should `financial` be a separate class?

The vision (VISION.md line 160) mentions "financial" as a separate category: "read, write, destructive, financial, or security-sensitive." The current V1 implementation uses only three values: `read`, `write`, `destructive`.

**Decision:** Keep three values for `side_effect_class`. Financial and security-sensitive are **sensitivity concerns**, not side-effect concerns. A `POST /payments` is a `write` (side effect) that is `confidential` or `restricted` (sensitivity). Conflating mutation type with data sensitivity in one field would create ambiguity. The two-field model (`side_effect_class` + `sensitivity_class`) is cleaner and matches how agent runtimes actually make decisions: "can I call this without confirmation?" (side effect) vs. "what audit/redaction rules apply?" (sensitivity).

### Challenge 7: Auth hints shipped but never formally specified

The `auth_hints` field has been present in V1 since the initial implementation. It appears in scan output, manifest, compiled tools, and MCP responses. But it was never formally specified in SYSTEM_SPEC.md — only a single-line mention in the field tables. Meanwhile, the VISION (line 58) explicitly lists "auth and permission expectations" as a core piece of the canonical artifact, alongside input/output shapes and side effects/sensitivity.

Prior turns (DEC-143 through DEC-158) completed formal specifications for input/output shapes and side effects/sensitivity, but left auth as a gap. This is not just a documentation issue — without a formal spec, consumers of the manifest don't know:
- What patterns trigger detection
- How to interpret an empty vs non-empty array
- What auth_hints mean for agent invocation decisions
- What the V1 limitations are (identifier-only, no role extraction)

**Decision:** Formally specify auth_hints detection rules, agent implications, V1 limitations, and the planned V2 `auth_requirements` structured shape. This completes the three-field governance model that the vision requires: side effects (mutation), sensitivity (data classification), and auth (access requirements).

### Challenge 8: Examples and constraints — two missing VISION dimensions

VISION.md line 59 explicitly lists "examples and constraints" as a core dimension of the canonical artifact, alongside input/output shapes, side effects/sensitivity, and auth hints. Prior turns (DEC-143 through DEC-170) completed formal specifications for four of the five dimensions but left examples and constraints as gaps:

- **Examples gap:** The `examples` field existed in compiled tools (`tusq-tools/*.json`) and MCP `tools/call` responses as a static placeholder, but was **absent from the manifest Capability shape** in SYSTEM_SPEC.md. There was no formal section explaining what examples mean for agents, how they propagate through the pipeline, or what V2 inference looks like.
- **Constraints gap:** There was **no `constraints` field anywhere** in the pipeline — not in the manifest, not in compiled tools, not in MCP responses. The VISION listed it, but it was never specified.

**Decision:** Add both fields to the manifest Capability shape and create dedicated specification sections following the established pattern (shape → agent implications → V1 limitations → pipeline propagation → V2 plans). Examples use the existing static placeholder as V1 default. Constraints use a structured object with all-null defaults, mirroring the conservative-default pattern from `sensitivity_class`. The governance model is now five fields, covering all dimensions listed in VISION.md line 55-59.

### Challenge 9: Redaction and approval metadata — the last unspecified VISION dimension

VISION.md line 60 explicitly lists "redaction and approval metadata" as a core dimension of the canonical artifact. Prior turns (DEC-143 through DEC-189) completed formal specifications for five of the seven VISION dimensions but left redaction and approval metadata as gaps:

- **Redaction gap:** No `redaction` field existed anywhere in the pipeline. VISION.md line 168 mentions "produce redaction and retention defaults" as part of the data understanding module. Downstream consumers (agent runtimes, logging systems, compliance tools) had no way to know what to mask or how long to retain data for a given capability.
- **Approval metadata gap:** The `approved` and `review_needed` fields existed in V1 code and were documented in the field table, but had no dedicated specification section — unlike every other governance dimension which has: shape definition, agent implications table, V1 limitations, pipeline propagation diagram, and V2 plans. There was also no audit trail: who approved a capability and when was not recorded.

**Decision:** Add the `redaction` field (4-field object with permissive defaults) and enrich approval metadata with `approved_by` and `approved_at` fields. Both follow the established conservative-default V1 pattern. Create dedicated specification sections following the same structure as the other five governance dimensions. The governance model is now six dimensions, completing all items listed in VISION.md lines 55-60.

### Challenge 10: Redaction vs sensitivity — redundant or complementary?

With `sensitivity_class` already classifying data types (public/internal/confidential/restricted) and `redaction` specifying masking rules, there is a question of whether these overlap.

**Decision:** They are complementary, not redundant. Sensitivity is the *classification* (what kind of data); redaction is the *operational response* (what to do about it). A capability can be `confidential` (touches PII) but the team may choose different redaction policies: one team masks emails but logs everything else, another team goes fully silent. Sensitivity drives access decisions; redaction drives logging/audit decisions. Keeping them separate preserves policy flexibility.

### Challenge 11: Version history and diffs — the last unspecified VISION dimension

VISION.md line 61 explicitly lists "version history and diffs" as the seventh canonical artifact dimension. All prior milestones (M8–M12, DEC-143 through DEC-201) completed the first six dimensions but left version history entirely unaddressed. The manifest had `schema_version: "1.0"` and `generated_at`, but no mechanism to:
- Track how many times the manifest has been regenerated
- Link a manifest to its predecessor
- Detect which capabilities changed between generations
- Enable downstream diff tooling or re-approval workflows

VISION.md line 218 requires "produce manifest diffs and review queues" and line 274 lists "better diffs, review queues, version review" as V2 goals. Without V1 fields establishing the contract, V2 tooling would require a breaking schema change.

**Decision:** Add three fields following the established conservative-default V1 pattern: `manifest_version` (integer counter at manifest root), `previous_manifest_hash` (SHA-256 hash chain at manifest root), and `capability_digest` (per-capability SHA-256 of content fields). V1 produces the fields but ships no diff CLI or history file. V2 builds `tusq diff`, diff-aware re-approval, and CI/CD gates on top of these fields without changing the manifest shape. The governance model is now seven dimensions, completing every item in VISION.md lines 55–61.

### Challenge 12: Version history scope — manifest-only or full pipeline?

Should version tracking propagate through compiled tools and MCP responses, like `redaction` does? Or should it stay manifest-only, like approval metadata?

**Decision:** Manifest-only. Version history tracks the *evolution of the canonical artifact itself*. Compiled tools (`tusq-tools/*.json`) are point-in-time snapshots of approved capabilities — they don't need lineage. MCP responses serve current state — agents consuming `tools/list` or `tools/call` don't need to know which manifest generation produced the tool. This matches the approval metadata pattern: the manifest is where governance decisions live; downstream artifacts are the result of those decisions.

### Challenge 13: Capability digest — what fields to include?

The `capability_digest` must exclude some fields to be useful for change detection. If it included `approved` and `approved_by`, every human approval would change the digest and create a false "capability changed" signal.

**Decision:** Exclude `capability_digest` (circular), `approved`, `approved_by`, `approved_at`, and `review_needed` (human gate state, not capability content). Include everything else: name, description, method, path, schemas, side_effect_class, sensitivity_class, auth_hints, examples, constraints, redaction, provenance, confidence, domain. This means the digest answers "did the *capability itself* change?" not "did someone approve it?"

### Challenge 14: Framework support depth — documented but not specified

The vision (VISION.md line 71) requires "support the most common framework stacks deeply within the first release." V1 ships deep support for Express, Fastify, and NestJS — three framework-specific extractors with distinct detection patterns, not a single generic regex. But the planning artifacts never formally specified what "deep" means:

- No per-framework detection matrix showing what each detector captures
- No rationale for why Node.js-only satisfies the vision's "most common stacks" requirement
- No documentation of V1 detection limitations (regex-based, single-file scope, no router composition)
- No V2 expansion plan for Python/Java/Go frameworks
- No reference to the plugin interface that enables community framework adapters

The frameworks.md docs page lists what support means (7 extraction signals) but at 42 lines is too thin to substantiate the "deeply" claim.

**Decision:** Add a Framework Support Depth section to SYSTEM_SPEC.md with: (1) a 12-row detection matrix showing per-framework capabilities; (2) rationale for Node.js-only V1 scope; (3) V1 limitations table; (4) V2 expansion plan with 5 prioritized frameworks; (5) reference to plugin interface for community adapters. This makes the "deeply" claim verifiable against the actual implementation.

### Challenge 15: M13 roadmap items still unchecked

M13 (Version History and Diffs) items remain unchecked in ROADMAP.md despite the implementation being completed and verified by QA in prior turns (DEC-207 through DEC-210). This is the same stale-roadmap issue that was caught and fixed for M1–M7 in an earlier PM turn. The implementation shipped, tests pass, QA signed off, but the planning roadmap was not updated.

**Decision:** Leave M13 unchecked — the implementation was done in a prior run, but this PM turn is not claiming to have verified the implementation. The next dev turn or QA turn should mark M13 items as checked after re-verification. Honest planning means not checking boxes the PM has not personally verified.

## Key Judgment Calls

1. **Docs are authored content, not auto-generated.** Each docs page is written in user-facing language derived from planning artifacts. This means a human (product_marketing role) owns the content quality.

2. **Blog uses Docusaurus built-in blog plugin.** No custom blog infrastructure. Posts are Markdown files with frontmatter.

3. **Brand continuity matters.** The Fraunces + Space Grotesk font pairing and color scheme from the current site carry over. Users should recognize the same visual identity.

4. **`website/` is self-contained.** It has its own `package.json` and does not depend on the CLI `package.json`. This keeps concerns separated.

5. **No hosting decisions in this initiative.** Where to deploy (Vercel, Netlify, GitHub Pages, etc.) is a human decision made after the site builds correctly.

## Open Decisions for Human

1. **Deployment target** — Where will the Docusaurus site be hosted? (Recommendation: decide after build works.)
2. **Custom domain** — Is `tusq.dev` the production domain for the docs site?
3. **Old `websites/` cleanup** — When should the static HTML site be removed? (Recommendation: after Docusaurus deployment is confirmed.)
