# PM Signoff — tusq.dev Docs & Website Platform

Approved: YES

> Planning artifacts reviewed and approved for the Docusaurus docs/website/blog platform initiative.
> Re-confirmed in run_a47f1dd6629dba75 (turn_160ed0ff8cedc45e) after parent run (run_c8a4701ce0d4952d) completed all phases but stalled awaiting human approval. Fresh PM review challenged two issues: (1) ROADMAP milestones were shown as unchecked despite implementation being complete — fixed by marking all milestones done; (2) SYSTEM_SPEC file tree listed incorrect blog filename (dots vs hyphens) — fixed to match actual file. Build re-verified: `npm run build` exits 0 with no errors.

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
