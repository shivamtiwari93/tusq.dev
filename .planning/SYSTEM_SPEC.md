# System Spec — tusq.dev Docs & Website Platform

## Purpose

Build the tusq.dev public-facing website, documentation, and blog using Docusaurus. This replaces the current static HTML landing page (`websites/`) with a maintainable, extensible docs platform that serves as the primary entry point for developers evaluating and using tusq.dev.

**What this delivers:** A Docusaurus-powered site with three surfaces — marketing homepage, CLI/usage documentation, and a blog — all aligned with the accepted V1 product truth from the prior planning/launch artifacts.

**What this does NOT deliver:** New product features, CLI changes, or any content that extends beyond the verified V1 boundary. The Docusaurus platform is a content delivery mechanism, not a product change.

## Scope — what ships

### In scope

1. **Docusaurus project setup** — Initialize a Docusaurus project within the repo (e.g., `website/` directory), configured with TypeScript, custom theme colors, and the tusq.dev brand identity
2. **Homepage migration** — Migrate the current `websites/index.html` landing page content into a Docusaurus custom homepage component, preserving the hero, feature cards, workflow steps, and V1 surface grid
3. **Documentation site** — Create user-facing docs pages derived from the accepted planning artifacts:
   - Getting Started (install, init, scan, manifest, compile, serve workflow)
   - CLI Reference (all 8 commands with flags, from command-surface.md)
   - Manifest Format (tusq.manifest.json schema and fields)
   - Configuration (tusq.config.json reference)
   - Supported Frameworks (Express, Fastify, NestJS — what works, what doesn't)
   - MCP Server (describe-only behavior, tools/list, tools/call)
   - FAQ (sourced from MESSAGING.md claims/non-claims)
4. **Blog setup** — Configure the built-in Docusaurus blog plugin with:
   - Launch announcement post (from ANNOUNCEMENT.md)
   - Release notes post (from RELEASE_NOTES.md)
   - Blog index and RSS feed
5. **Navigation and sidebar** — Top nav with Docs, Blog, GitHub link. Docs sidebar with logical grouping
6. **Product truth alignment** — All content must stay within the claims defined in MESSAGING.md "Product Truth" and "Claims We Can Defend" sections. No overclaiming
7. **SEO and metadata** — Proper `<title>`, `<meta description>`, Open Graph tags on all pages
8. **404 page** — Custom 404 page (migrate from `websites/404.html`)
9. **Build and deploy readiness** — `npm run build` produces a static site suitable for deployment to any static host

### Out of scope

- Hosting/deployment configuration (Vercel, Netlify, GitHub Pages setup) — human decision
- Custom Docusaurus plugins
- Search integration (Algolia, etc.) — can be added later
- i18n / localization
- Analytics integration
- Interactive demos or embedded terminals
- API reference auto-generation from source code
- Any content about features not shipped in V1 presented as current capabilities

## Content Architecture

### Documentation pages

| Page | Source | Purpose |
|------|--------|---------|
| Getting Started | SYSTEM_SPEC.md workflow + README quickstart | First-run developer experience |
| CLI Reference | command-surface.md | Complete command/flag reference |
| Manifest Format | SYSTEM_SPEC.md manifest section | Schema documentation for tusq.manifest.json |
| Configuration | SYSTEM_SPEC.md init section | tusq.config.json reference |
| Supported Frameworks | SYSTEM_SPEC.md scope + MESSAGING.md | Express, Fastify, NestJS details |
| MCP Server | SYSTEM_SPEC.md serve section | Describe-only MCP behavior |
| FAQ | MESSAGING.md claims/non-claims | Common questions and honest answers |

### Blog posts

| Post | Source | Purpose |
|------|--------|---------|
| Announcing tusq.dev v0.1.0 | ANNOUNCEMENT.md | Launch narrative |
| Release Notes: v0.1.0 | RELEASE_NOTES.md | Changelog and feature list |

### Homepage sections

| Section | Source | Content |
|---------|--------|---------|
| Hero | websites/index.html + MESSAGING.md | One-line positioning + CTA |
| What it does / ships / matters | websites/index.html cards | Three feature cards |
| Workflow | websites/index.html steps | 5-step terminal workflow |
| V1 Surface | websites/index.html grid | 8 shipped capabilities |

## File Structure

```
website/
├── docusaurus.config.ts        # Site config, navbar, footer, metadata
├── sidebars.ts                 # Docs sidebar structure
├── package.json                # Docusaurus dependencies
├── tsconfig.json
├── src/
│   ├── pages/
│   │   └── index.tsx           # Custom homepage component
│   └── css/
│       └── custom.css          # Brand colors, fonts (from websites/styles.css)
├── docs/
│   ├── getting-started.md      # Install + workflow
│   ├── cli-reference.md        # All 8 commands
│   ├── manifest-format.md      # tusq.manifest.json schema
│   ├── configuration.md        # tusq.config.json
│   ├── frameworks.md           # Supported frameworks
│   ├── mcp-server.md           # Describe-only MCP
│   └── faq.md                  # FAQ
├── blog/
│   ├── 2026-04-18-announcing-tusq-dev.md
│   └── 2026-04-18-release-notes-v0.1.0.md
└── static/
    └── img/                    # Any images/logos
```

## Behavior

### Build

- `cd website && npm install && npm run build` produces a complete static site in `website/build/`
- Build must complete with zero errors and zero warnings (Docusaurus broken-link checker must pass)
- All internal links resolve. No dead links

### Development

- `cd website && npm start` runs local dev server with hot reload
- Default port: 3000 (Docusaurus default)

### Content ownership

- Product-marketing owns all website, docs, and blog content
- Docs content is derived from accepted planning artifacts but written in user-facing language (not internal planning jargon)
- Blog posts are adapted from launch artifacts, not copy-pasted

## Acceptance Tests

### Setup
- [ ] `website/` directory exists with a valid Docusaurus project
- [ ] `cd website && npm install` succeeds
- [ ] `cd website && npm run build` succeeds with zero errors

### Homepage
- [ ] Homepage renders with hero, feature cards, workflow steps, and V1 surface grid
- [ ] Homepage content matches MESSAGING.md product truth — no overclaiming
- [ ] Homepage links to docs and blog

### Documentation
- [ ] All 7 docs pages exist and render without errors
- [ ] Getting Started page contains the full 6-command workflow
- [ ] CLI Reference page documents all 8 commands with flags
- [ ] Manifest Format page describes all capability fields
- [ ] MCP Server page explicitly states describe-only behavior
- [ ] FAQ page addresses "Does it execute tools?" and "Which frameworks?"
- [ ] Docs sidebar navigation works correctly

### Blog
- [ ] Blog index page lists all posts
- [ ] Launch announcement post renders correctly
- [ ] Release notes post renders correctly
- [ ] Blog RSS feed is generated

### Navigation
- [ ] Top navbar has Docs, Blog, and GitHub links
- [ ] All internal links resolve (no broken links)
- [ ] 404 page renders for unknown routes

### Product truth
- [ ] No page claims tusq.dev executes live API calls in V1
- [ ] No page claims support for Python, Go, Java, or frameworks beyond Express/Fastify/NestJS
- [ ] No page presents runtime learning, plugin API, or hosted execution as current features
- [ ] Framework support is visible on homepage and in docs

## Constraints

1. **Docusaurus version** — Use Docusaurus 3.x (latest stable)
2. **No ejecting** — Use swizzling only if needed for the homepage; prefer the plugin/theme API
3. **Monorepo-friendly** — The `website/` directory is self-contained with its own `package.json`
4. **Brand continuity** — Preserve the Fraunces + Space Grotesk font pairing and color scheme from the current site
5. **Content fidelity** — All user-facing content must be traceable to an accepted planning or launch artifact. Do not invent new product claims
