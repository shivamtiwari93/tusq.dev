# Roadmap — tusq.dev Docs & Website Platform

## Phases

| Phase | Goal | Status |
|-------|------|--------|
| Planning | Define Docusaurus platform scope, content architecture, and acceptance criteria | Complete (parent run) |
| Implementation | Build Docusaurus site, migrate content, create docs and blog | Complete (parent run) |
| QA | Validate build, links, content accuracy, and product truth alignment | Complete (parent run) |

## Implementation Milestones

### M1: Docusaurus Project Setup (~0.5 day)
- [x] Initialize Docusaurus 3.x project in `website/` directory
- [x] Configure `docusaurus.config.ts` with site metadata, navbar, footer
- [x] Set up `package.json` with required dependencies
- [x] Configure TypeScript support
- [x] Verify `npm run build` and `npm start` work with default content

### M2: Brand & Theme (~0.5 day)
- [x] Migrate brand colors and fonts from `websites/styles.css` to `website/src/css/custom.css`
- [x] Configure Fraunces + Space Grotesk font loading
- [x] Set up custom color palette in Docusaurus theme config
- [x] Create or migrate any logo/favicon assets to `website/static/img/`

### M3: Homepage Component (~0.5 day)
- [x] Create custom homepage component at `website/src/pages/index.tsx`
- [x] Migrate hero section (eyebrow, headline, lede, CTA)
- [x] Migrate feature cards (What it does / ships / matters)
- [x] Migrate workflow steps section
- [x] Migrate V1 surface grid
- [x] Update CTAs to point to docs (Getting Started) instead of README.md

### M4: Documentation Pages (~1 day)
- [x] Create docs sidebar structure in `sidebars.ts`
- [x] Write Getting Started page (install + 6-command workflow)
- [x] Write CLI Reference page (all 8 commands, flags, exit codes)
- [x] Write Manifest Format page (capability fields, schema, examples)
- [x] Write Configuration page (tusq.config.json reference)
- [x] Write Supported Frameworks page (Express, Fastify, NestJS)
- [x] Write MCP Server page (describe-only behavior, tools/list, tools/call)
- [x] Write FAQ page (from MESSAGING.md claims/non-claims)

### M5: Blog Setup (~0.5 day)
- [x] Configure Docusaurus blog plugin (already built-in)
- [x] Adapt ANNOUNCEMENT.md into a blog post with proper frontmatter
- [x] Adapt RELEASE_NOTES.md into a blog post with proper frontmatter
- [x] Verify blog index and RSS feed generation

### M6: Navigation, 404, and Polish (~0.5 day)
- [x] Configure top navbar: Docs, Blog, GitHub
- [x] Verify docs sidebar ordering and grouping
- [x] Create custom 404 page (adapt from `websites/404.html`)
- [x] Add SEO metadata (Open Graph, descriptions) to all pages
- [x] Run broken-link checker (built into Docusaurus build)

### M7: Product Truth Audit (~0.5 day)
- [x] Review every page against MESSAGING.md "Product Truth" section
- [x] Review every page against MESSAGING.md "Claims We Must Not Make"
- [x] Verify framework support is mentioned on homepage and in docs
- [x] Verify MCP describe-only is clearly stated wherever serve is mentioned
- [x] Verify no deferred features (runtime learning, plugin API, etc.) are presented as current

## Key Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content drift from product truth | Overclaiming damages credibility | M7 audit against MESSAGING.md; PM review before merge |
| Docusaurus version/config issues | Build failures | Pin to latest stable 3.x; use default plugins only |
| Brand inconsistency with current site | Jarring visual transition | Migrate exact colors/fonts from existing CSS |
| Docs become stale as CLI evolves | User confusion | Docs are derived from spec; updating spec triggers doc update |
