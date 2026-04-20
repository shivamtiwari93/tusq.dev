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

### M8: Canonical Artifact Shape Specification (~0.5 day)
- [x] Document tusq.config.json input shape with all fields
- [x] Document .tusq/scan.json output shape including Route object
- [x] Document tusq.manifest.json canonical artifact shape including Capability object
- [x] Document tusq-tools/*.json compiled tool output shape
- [x] Document MCP server response shapes (tools/list, tools/call, errors)
- [x] Document confidence scoring formula
- [x] Document shape lineage (config → scan → manifest → tools → MCP)
- [x] Document V1 input/output schema limitations

### M9: Side Effects and Sensitivity Classification (~0.5 day)
- [x] Add `sensitivity_class` field to manifest capability object in `src/cli.js`
- [x] Default `sensitivity_class` to `"unknown"` for all capabilities in V1
- [x] Propagate `sensitivity_class` through `tusq compile` to compiled tool definitions
- [x] Propagate `sensitivity_class` through `tusq serve` to MCP server responses
- [x] Update `website/docs/manifest-format.md` to document both classification fields
- [x] Add side effect and sensitivity classification rules to docs
- [x] Update test fixtures to include `sensitivity_class` field
- [x] Verify `npm run build` in `website/` still passes with updated docs

### M10: Auth and Permission Expectations Specification (~0.5 day)
- [x] Formally specify `auth_hints` detection rules in SYSTEM_SPEC.md (regex pattern, framework-specific extraction)
- [x] Document agent implications of auth_hints (empty vs non-empty, role patterns, multi-hint)
- [x] Document V1 auth limitations (identifier-based only, no role extraction, no tenant boundaries)
- [x] Specify V2 auth and permission mapping roadmap (role extraction, scope mapping, tenant detection, least-privilege hints)
- [x] Specify V2 `auth_requirements` structured shape alongside existing `auth_hints` array
- [x] Document the three-field governance model: side_effect_class + sensitivity_class + auth_hints

### M11: Examples and Constraints Specification (~0.5 day)
- [x] Add `examples` field to manifest Capability object shape in SYSTEM_SPEC.md
- [x] Add `constraints` field to manifest Capability object shape in SYSTEM_SPEC.md
- [x] Formally specify Examples: shape, agent implications, V1 limitations (static placeholder), V2 inference (test extraction, JSDoc, OpenAPI, runtime learning)
- [x] Formally specify Constraints: shape (rate_limit, max_payload_bytes, required_headers, idempotent, cacheable), agent implications, V1 limitations (all null/empty), V2 inference (middleware detection)
- [x] Update compiled tool shape (`tusq-tools/*.json`) to include `constraints` field
- [x] Update MCP `tools/call` response shape to include `constraints` field
- [x] Document the five-field governance model: side_effect_class + sensitivity_class + auth_hints + examples + constraints

### M12: Redaction and Approval Metadata Specification (~0.5 day)
- [x] Add `redaction` field to manifest Capability object shape in SYSTEM_SPEC.md with 4-field structure (pii_fields, log_level, mask_in_traces, retention_days)
- [x] Add `approved_by` and `approved_at` fields to manifest Capability object to create audit trail for the approval gate
- [x] Formally specify Redaction: shape, agent implications, relationship to sensitivity_class, V1 permissive-default limitations, V2 PII detection and regulatory inference
- [x] Formally specify Approval Metadata: shape, pipeline flow (manifest-only gate), agent implications, V1 limitations (no approval workflow tooling), V2 plans (tusq approve CLI, approval history, multi-party approval)
- [x] Update compiled tool shape (`tusq-tools/*.json`) to include `redaction` field
- [x] Update MCP `tools/call` response shape to include `redaction` field
- [x] Document the six-field governance model: side_effect_class + sensitivity_class + auth_hints + examples + constraints + redaction/approval metadata

## Key Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content drift from product truth | Overclaiming damages credibility | M7 audit against MESSAGING.md; PM review before merge |
| Docusaurus version/config issues | Build failures | Pin to latest stable 3.x; use default plugins only |
| Brand inconsistency with current site | Jarring visual transition | Migrate exact colors/fonts from existing CSS |
| Docs become stale as CLI evolves | User confusion | Docs are derived from spec; updating spec triggers doc update |
