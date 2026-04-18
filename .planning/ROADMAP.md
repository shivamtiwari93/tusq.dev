# Roadmap — tusq.dev Docs & Website Platform

## Phases

| Phase | Goal | Status |
|-------|------|--------|
| Planning | Define Docusaurus platform scope, content architecture, and acceptance criteria | In progress |
| Implementation | Build Docusaurus site, migrate content, create docs and blog | Pending |
| QA | Validate build, links, content accuracy, and product truth alignment | Pending |

## Implementation Milestones

### M1: Docusaurus Project Setup (~0.5 day)
- [ ] Initialize Docusaurus 3.x project in `website/` directory
- [ ] Configure `docusaurus.config.ts` with site metadata, navbar, footer
- [ ] Set up `package.json` with required dependencies
- [ ] Configure TypeScript support
- [ ] Verify `npm run build` and `npm start` work with default content

### M2: Brand & Theme (~0.5 day)
- [ ] Migrate brand colors and fonts from `websites/styles.css` to `website/src/css/custom.css`
- [ ] Configure Fraunces + Space Grotesk font loading
- [ ] Set up custom color palette in Docusaurus theme config
- [ ] Create or migrate any logo/favicon assets to `website/static/img/`

### M3: Homepage Component (~0.5 day)
- [ ] Create custom homepage component at `website/src/pages/index.tsx`
- [ ] Migrate hero section (eyebrow, headline, lede, CTA)
- [ ] Migrate feature cards (What it does / ships / matters)
- [ ] Migrate workflow steps section
- [ ] Migrate V1 surface grid
- [ ] Update CTAs to point to docs (Getting Started) instead of README.md

### M4: Documentation Pages (~1 day)
- [ ] Create docs sidebar structure in `sidebars.ts`
- [ ] Write Getting Started page (install + 6-command workflow)
- [ ] Write CLI Reference page (all 8 commands, flags, exit codes)
- [ ] Write Manifest Format page (capability fields, schema, examples)
- [ ] Write Configuration page (tusq.config.json reference)
- [ ] Write Supported Frameworks page (Express, Fastify, NestJS)
- [ ] Write MCP Server page (describe-only behavior, tools/list, tools/call)
- [ ] Write FAQ page (from MESSAGING.md claims/non-claims)

### M5: Blog Setup (~0.5 day)
- [ ] Configure Docusaurus blog plugin (already built-in)
- [ ] Adapt ANNOUNCEMENT.md into a blog post with proper frontmatter
- [ ] Adapt RELEASE_NOTES.md into a blog post with proper frontmatter
- [ ] Verify blog index and RSS feed generation

### M6: Navigation, 404, and Polish (~0.5 day)
- [ ] Configure top navbar: Docs, Blog, GitHub
- [ ] Verify docs sidebar ordering and grouping
- [ ] Create custom 404 page (adapt from `websites/404.html`)
- [ ] Add SEO metadata (Open Graph, descriptions) to all pages
- [ ] Run broken-link checker (built into Docusaurus build)

### M7: Product Truth Audit (~0.5 day)
- [ ] Review every page against MESSAGING.md "Product Truth" section
- [ ] Review every page against MESSAGING.md "Claims We Must Not Make"
- [ ] Verify framework support is mentioned on homepage and in docs
- [ ] Verify MCP describe-only is clearly stated wherever serve is mentioned
- [ ] Verify no deferred features (runtime learning, plugin API, etc.) are presented as current

## Key Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content drift from product truth | Overclaiming damages credibility | M7 audit against MESSAGING.md; PM review before merge |
| Docusaurus version/config issues | Build failures | Pin to latest stable 3.x; use default plugins only |
| Brand inconsistency with current site | Jarring visual transition | Migrate exact colors/fonts from existing CSS |
| Docs become stale as CLI evolves | User confusion | Docs are derived from spec; updating spec triggers doc update |
