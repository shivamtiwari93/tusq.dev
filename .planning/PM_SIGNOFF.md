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
