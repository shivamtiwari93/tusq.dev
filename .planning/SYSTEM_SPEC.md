# System Spec — tusq.dev Docs & Website Platform

> Re-affirmed on 2026-04-25 in run_8fe3b8b418dc589c (turn_5d368031b5a8881a, PM attempt 2) at HEAD `1943326`. The § M29 section below carries the verbatim closed seven-value `auth_scheme` enum {bearer, api_key, session, basic, oauth, none, unknown}, the verbatim closed five-value `evidence_source` enum {middleware_name, route_prefix, auth_required_flag, sensitivity_class_propagation, none}, the frozen six-rule first-match-wins decision table (R1 /bearer\|jwt\|access[_-]?token/i → bearer; R2 /api[_-]?key\|x-api-key/i → api_key; R3 /session\|cookie\|passport-local/i → session; R4 /basic[_-]?auth/i → basic; R5 /oauth\|oidc\|openid/i → oauth; R6 auth_required === false AND non-admin route → none; default → unknown), the frozen scope/role extraction rules with order-preserving case-sensitive dedup, the zero-evidence `unknown` guard (NEVER silently `none`), the M13 `capability_digest` inclusion driving re-approval on flip, the AC-7 affirmative compile-surface-invariant AND serve-surface-invariant (`auth_requirements` MUST NOT appear in any compiled `tools/*.json` and MUST NOT appear in any `tusq serve` MCP response shape), and Constraint 22 (reviewer-aid framing — NOT runtime AAA enforcement, NOT OAuth/OIDC/SAML/SOC2 attestation). All chartered in the prior run (commit 66cec85, turn_480dc289e36bfeba) and re-anchored in turn_018f55250ec41d6d. This turn re-anchors that content for the current child run so the planning_signoff gate observes in-run PM participation. No source code modified by this turn.

> Re-affirmed on 2026-04-25 in run_44a179ccf81697c3 (turn_018f55250ec41d6d, PM attempt 4) at HEAD `5600a0d`. The § M29 section below was authored in the prior run (commit 66cec85, turn_480dc289e36bfeba) and carries the verbatim seven-value `auth_scheme` enum, the verbatim five-value `evidence_source` enum, the frozen six-rule first-match-wins decision table, the frozen scope/role extraction rules, the zero-evidence `unknown` guard, and Constraint 22. This turn re-anchors that content for the current run and adds ONE explicit affirmative invariant in § M29: in addition to the existing serve-surface-invariant ("`auth_requirements` MUST NOT appear in any `tusq serve` MCP response shape — `tools/list`, `tools/call`, or `dry_run_plan`"), § M29 also codifies a compile-surface-invariant in the same affirmative form: "`auth_requirements` MUST NOT appear as a top-level key in any compiled tool definition emitted by `tusq compile` to `tools/*.json`. Both invariants are stronger than the AC-7 byte-identity guarantee alone — byte-identity says the bytes are unchanged; the explicit affirmative invariants forbid an implementer from interpreting AC-7 as 'add the field but in a deterministic order so byte-identity holds for any given input'. The two invariants together close that ambiguity." No source code was modified by this PM turn.

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
   - CLI Reference (current CLI commands with flags, from command-surface.md)
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
| V1 Surface | websites/index.html grid | Shipped CLI capabilities |

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
│   └── 2026-04-18-release-notes-v0-1-0.md
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

## Interface

The tusq.dev docs platform exposes three user-facing interfaces:

### CLI Interface (Build Commands)

Developers interact with the Docusaurus site through standard npm scripts in the `website/` directory:

| Command | Description | Output |
|---------|-------------|--------|
| `npm install` | Install all Docusaurus dependencies | `node_modules/` |
| `npm start` | Launch local dev server with hot reload | Dev server on `http://localhost:3000` |
| `npm run build` | Build static site for production | Static files in `website/build/` |
| `npm run serve` | Serve the production build locally | Local server on `http://localhost:3000` |

All commands run from the `website/` working directory. No global CLI is required.

### Web Interface (Site Navigation)

Users navigate the site through:

- **Top navbar:** tusq.dev brand (→ homepage), Docs (→ `/docs/getting-started`), Blog (→ `/blog`), GitHub (→ external repo)
- **Docs sidebar:** Grouped by Getting Started, Reference (CLI Reference, Manifest Format, Configuration), Guides (Supported Frameworks, MCP Server), Help (FAQ)
- **Blog index:** Chronological list of posts with RSS feed

### Content Interface (Authoring)

Content authors interact with Docusaurus via:

- **Docs:** Markdown files in `website/docs/` with YAML frontmatter (`title`, `sidebar_label`, `sidebar_position`)
- **Blog:** Markdown files in `website/blog/` with date-prefixed filenames and author frontmatter
- **Homepage:** React component in `website/src/pages/index.tsx`
- **Config:** `docusaurus.config.ts` for site metadata, navbar, footer, and plugin settings

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

## The Canonical Artifact: Input and Output Shapes

This section formally specifies the shapes of every artifact that tusq.dev produces. These shapes are the contract between the CLI, the manifest, the compiled tools, and the MCP server. All downstream consumers (docs, agents, CI checks) depend on these shapes being stable and versioned.

### 1. `tusq.config.json` — Project Configuration (Input)

The configuration file that `tusq init` creates. It governs all subsequent CLI commands.

```json
{
  "version": 1,
  "framework": "express | fastify | nestjs | unknown",
  "scan": {
    "include": ["**/*.js", "**/*.ts"],
    "exclude": ["node_modules", ".git", ".tusq", "dist", "build", "coverage"]
  },
  "output": {
    "scan_file": ".tusq/scan.json",
    "manifest_file": "tusq.manifest.json",
    "tools_dir": "tusq-tools"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | integer | yes | Schema version; always `1` in V1 |
| `framework` | string | yes | Detected or user-specified framework |
| `scan.include` | string[] | yes | Glob patterns for source files to scan |
| `scan.exclude` | string[] | yes | Directory names to skip |
| `output.scan_file` | string | yes | Path for scan output relative to project root |
| `output.manifest_file` | string | yes | Path for manifest output relative to project root |
| `output.tools_dir` | string | yes | Directory for compiled tool definitions |

### 2. `.tusq/scan.json` — Scan Output

Produced by `tusq scan <path>`. Contains raw route discovery results before human review.

```json
{
  "generated_at": "<ISO 8601 timestamp>",
  "target_path": "<absolute path to scanned project>",
  "framework": "express | fastify | nestjs",
  "warnings": ["<string>"],
  "route_count": 2,
  "routes": [ "<Route object — see below>" ]
}
```

**Route object shape:**

```json
{
  "framework": "express | fastify | nestjs",
  "method": "GET | POST | PUT | PATCH | DELETE | OPTIONS | HEAD",
  "path": "/users/:id",
  "handler": "listUsers | inline_handler | unknown_handler",
  "domain": "users",
  "auth_hints": ["requireAuth", "AdminGuard"],
  "provenance": {
    "file": "src/app.ts",
    "line": 12
  },
  "confidence": 0.86,
  "input_schema": {
    "type": "object",
    "additionalProperties": true,
    "description": "<inference status message>"
  },
  "output_schema": {
    "type": "object",
    "additionalProperties": true,
    "description": "<inference status message>"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `framework` | string | Which framework detector matched this route |
| `method` | string | HTTP method (uppercased) |
| `path` | string | Route path, always starts with `/` |
| `handler` | string | Function name or `inline_handler` / `unknown_handler` |
| `domain` | string | Inferred from first meaningful path segment (after prefix-skipping) or controller prefix |
| `auth_hints` | string[] | Middleware/decorator names matching auth patterns |
| `provenance.file` | string | Relative path to source file |
| `provenance.line` | integer | 1-based line number |
| `confidence` | number | 0.0–0.95 score based on handler quality, auth hints, schema hints, path specificity |
| `input_schema` | object | JSON Schema for expected input; conservative (`additionalProperties: true`) in V1 |
| `output_schema` | object | JSON Schema for expected output; conservative in V1 |

**Confidence scoring (V1):**

| Signal | Score delta |
|--------|------------|
| Base score | +0.62 |
| Named handler (not inline/unknown) | +0.12 |
| Auth hints present | +0.08 |
| Schema hint detected (zod, joi, DTO) | +0.14 |
| Non-root path | +0.04 |
| No schema hint detected | -0.10 |
| **Cap** | **0.95** |

The schema-less penalty ensures routes without extractable schema signal (the majority in real codebases) trigger `review_needed: true` (threshold 0.8) even when handler name and auth are present. See First-Pass Manifest Usability section for detailed impact analysis.

#### Framework Support Depth — V1

The vision requires "support the most common framework stacks deeply within the first release" (VISION.md line 71). V1 delivers deep support for the three most widely used Node.js backend frameworks: **Express**, **Fastify**, and **NestJS**. "Deep" means every framework detector extracts the full Route object shape (method, path, handler, domain, auth_hints, provenance, confidence, schema_hint) using framework-specific patterns — not a single generic regex.

**Per-framework detection matrix:**

| Capability | Express | Fastify | NestJS |
|------------|---------|---------|--------|
| Route method extraction | `app.get/post/put/patch/delete/options/head` | `fastify.get/post/...` + `fastify.route({method})` | `@Get/@Post/@Put/@Patch/@Delete` decorators |
| Route path extraction | String literal in route call | String literal + `url`/`path` in route block | `@Controller()` prefix + method decorator argument |
| Named handler detection | Last identifier in handler expression | `handler:` property in route block | Next method signature after decorator |
| Inline handler detection | Arrow function / `function(` test | Arrow function / `function(` test | N/A (NestJS uses class methods) |
| Middleware chain extraction | All tokens except last in handler expression | Token extraction from inline handler | Class-level + method-level `@UseGuards` |
| Auth hint extraction | Handler expression + 3-line radius | Handler expression + 5-line radius + route block tokens | Class `@UseGuards` + method decorators + controller metadata |
| Schema hint detection | `zod`, `z.object`, `joi`, `schema` in 3-line radius | `schema:` property in 5-line radius | `dto`, `schema`, `zod`, `class-validator` in 4-line radius |
| Domain inference | First path segment | First path segment | Controller prefix or first path segment |
| Controller/prefix resolution | N/A | N/A | `@Controller('prefix')` → prepended to all method paths |
| Guard inheritance | N/A | N/A | Class-level guards inherited by all methods in controller |
| Deduplication | N/A | Cross-pattern dedup (inline + `fastify.route()` matches) | N/A |
| Nearby code radius | 3 lines | 5 lines (inline), full block (route object) | 4 lines |

**Why these three frameworks:**

Express, Fastify, and NestJS account for the overwhelming majority of Node.js backend API projects. Express is the default choice; Fastify is the performance-oriented alternative; NestJS is the enterprise/TypeScript-first framework built on top of Express or Fastify. Together they cover the spectrum from minimal to opinionated Node.js backends.

**Why Node.js only in V1:**

1. **Depth over breadth.** VISION line 114: "Support fewer stacks, deeper... done correctly, beats thin support for twelve." Shipping three deeply-supported frameworks with full governance metadata is more valuable than shallow support for many.
2. **Shared extraction infrastructure.** All three frameworks share the same runtime (Node.js), the same module system, and similar routing conventions. The confidence scoring, auth hint extraction, schema detection, and domain inference logic is reusable across all three without framework-specific reimplementation.
3. **Target audience alignment.** The V1 target user is a backend engineering team evaluating tusq.dev against a real codebase. Node.js backends are the most common target for AI-enablement due to the prevalence of REST APIs built on these frameworks.

**V1 framework detection limitations:**

| Limitation | Impact | V2 plan |
|-----------|--------|---------|
| Regex-based, not AST | May miss dynamically constructed routes or complex middleware chains | AST parsing with framework-specific visitors |
| No router composition | `express.Router()` sub-routers with `.use()` mounting not followed | Router graph resolution |
| No middleware ordering | Auth middleware order not captured | Middleware pipeline reconstruction |
| No re-export following | Routes defined in re-exported modules not discovered | Module resolution + re-export tracing |
| Single-file scope | Each file scanned independently; cross-file patterns missed | Multi-file analysis with import graph |
| No TypeScript type inference | Type annotations in handlers not used for schema extraction | TypeScript compiler API integration |

**V2 framework expansion plan:**

| Framework | Language | Priority | Rationale |
|-----------|----------|----------|-----------|
| Django REST Framework | Python | High | Most popular Python API framework; decorator-based routing similar to NestJS |
| FastAPI | Python | High | Growing rapidly; type-annotated routes enable richer schema extraction |
| Flask | Python | Medium | Widely used but less structured; fewer extraction signals |
| Spring Boot | Java | Medium | Enterprise standard; annotation-based routing |
| Gin / Echo | Go | Lower | Common but Go projects often use custom routing |

V2 framework support will be delivered through the plugin interface (VISION line 130: "Framework detectors... all live behind plugin interfaces"). Each framework adapter implements a standard `extractRoutes(content, filePath)` interface, enabling community contribution without core changes.

### 3. `tusq.manifest.json` — The Canonical Artifact

Produced by `tusq manifest`. This is the reviewable contract between code and agents — the central product of tusq.dev.

```json
{
  "schema_version": "1.0",
  "manifest_version": 1,
  "previous_manifest_hash": null,
  "generated_at": "<ISO 8601 timestamp>",
  "source_scan": ".tusq/scan.json",
  "capabilities": [ "<Capability object — see below>" ]
}
```

**Capability object shape:**

```json
{
  "name": "get_users_users",
  "description": "Retrieve users — read-only, requires requireAuth (handler: listUsers)",
  "method": "GET",
  "path": "/users",
  "input_schema": {
    "type": "object",
    "properties": {},
    "required": [],
    "additionalProperties": true,
    "description": "No required input detected; review optional query/body fields manually."
  },
  "output_schema": {
    "type": "array",
    "items": {
      "type": "object",
      "additionalProperties": true
    },
    "description": "Inferred array response from handler return/json usage."
  },
  "side_effect_class": "read | write | destructive",
  "sensitivity_class": "unknown | public | internal | confidential | restricted",
  "auth_hints": ["requireAuth"],
  "examples": [
    {
      "input": {},
      "output": {
        "note": "Describe-only mode in V1. Live execution is deferred to V1.1."
      }
    }
  ],
  "constraints": {
    "rate_limit": null,
    "max_payload_bytes": null,
    "required_headers": [],
    "idempotent": null,
    "cacheable": null
  },
  "redaction": {
    "pii_fields": [],
    "log_level": "full",
    "mask_in_traces": false,
    "retention_days": null
  },
  "provenance": {
    "file": "src/app.ts",
    "line": 12,
    "handler": "listUsers",
    "framework": "express"
  },
  "confidence": 0.86,
  "review_needed": false,
  "approved": true,
  "approved_by": null,
  "approved_at": null,
  "capability_digest": "a1b2c3d4e5f6...",
  "domain": "users"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | `{method}_{domain}_{path_slug}` — unique identifier (domain uses smart prefix-skipping) |
| `description` | string | Rich description: "{verb} {noun} {qualifier} — {side_effect}, {auth_context} (handler: {name})" |
| `method` | string | HTTP method (uppercased) |
| `path` | string | Route path |
| `input_schema` | object | JSON Schema describing expected input parameters |
| `output_schema` | object | JSON Schema describing expected response shape |
| `side_effect_class` | string | `read` (GET/HEAD/OPTIONS), `write` (POST/PUT/PATCH), or `destructive` (DELETE or destructive handler names) |
| `sensitivity_class` | string | `unknown` (default in V1), `public`, `internal`, `confidential`, or `restricted` — see classification rules below |
| `auth_hints` | string[] | Auth-related middleware/decorators detected |
| `examples` | array | Request/response examples; static describe-only placeholder in V1 — see Examples specification below |
| `constraints` | object | Operational constraints on the capability (rate limits, payload limits, idempotency) — see Constraints specification below |
| `redaction` | object | Redaction policy for this capability's input/output — see Redaction and Approval Metadata below |
| `provenance` | object | Source file, line number, handler, and framework metadata |
| `confidence` | number | 0.0–0.95 |
| `review_needed` | boolean | `true` when `confidence < 0.8` — see Redaction and Approval Metadata below |
| `approved` | boolean | Human-set gate; only `approved: true` capabilities compile into tools — see Redaction and Approval Metadata below |
| `approved_by` | string \| null | Identity of the human who approved this capability. `null` until explicitly set |
| `approved_at` | string \| null | ISO 8601 timestamp of when approval was granted. `null` until explicitly set |
| `capability_digest` | string | SHA-256 hex digest of content fields (excluding approval/review metadata and the digest itself). Enables change detection between manifest versions — see Version History and Diffs section |
| `domain` | string | Logical grouping (inferred from route prefix with smart prefix-skipping — see First-Pass Manifest Usability) |

**V1 input/output schema limitations:** In V1, `input_schema` and `output_schema` remain intentionally conservative, but they include first-pass route evidence when it is safe to infer. Path parameters become required string properties, write methods receive a `body` object placeholder, array returns are represented as `type: "array"`, and simple object literal responses expose property names and literal types. Full body/query schema inference from DTOs, Zod schemas, or Joi validators remains a V2 goal.

#### First-Pass Manifest Usability

VISION.md line 72 requires "produce manifests that are usable on first pass for real codebases, not toy examples." Line 73 adds: "treat manual manifest authoring as a failure of the engine, not a feature." The following four improvements use only information the scanner already computes to make first-pass output actionable without full manual rewrite.

##### 1. Path Parameter Extraction

Route paths like `/users/:id` and `/orders/{orderId}/items` contain explicit parameter names. V1 must extract these into `input_schema.properties` so that LLM consumers know what arguments to provide.

**Extraction rules:**

| Pattern | Regex | Example | Extracted parameter |
|---------|-------|---------|-------------------|
| Express/Fastify colon params | `/:([a-zA-Z_][a-zA-Z0-9_]*)` | `/users/:id` | `id` |
| OpenAPI-style brace params | `/\{([a-zA-Z_][a-zA-Z0-9_]*)\}` | `/orders/{orderId}` | `orderId` |

**V1 `input_schema` with path parameters:**

When path parameters are detected, `input_schema` is enriched:

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "source": "path",
      "description": "Path parameter: id"
    }
  },
  "required": ["id"],
  "additionalProperties": true,
  "description": "path parameters inferred from route pattern."
}
```

When no path parameters are detected, the schema remains conservative for read routes. For write routes, V1 adds a `body` object placeholder with `source: "request_body"` or `source: "framework_schema_hint"`.

**Pipeline propagation:** Path parameter extraction occurs in `finalizeRouteInference()` during `tusq scan`. The enriched `input_schema` flows unchanged through `tusq manifest` → `tusq compile` → `tusq serve` (both `tools/list` and `tools/call`).

**Agent implication:** An LLM receiving a tool with `required: ["id"]` in `input_schema` knows it must provide an `id` argument. Without this, the LLM has no signal about what the tool needs beyond `{ type: "object", additionalProperties: true }`.

**V1 limitations:**
- All path parameters are typed as `string` — no type inference from handler code
- Query parameters and request body fields are not extracted (V2 goal via DTO/Zod/Joi parsing)
- Path parameter descriptions are generic ("Path parameter: {name}") — no semantic inference

##### 2. Smart Domain Inference

The current `inferDomain()` takes the first non-parameter path segment. For routes mounted under API version prefixes (`/api/v1/users/:id`), this produces domain `api` — useless for grouping.

**V1 prefix-skipping rules:**

The following path segments are skipped when inferring domain:

| Prefix | Why it's skipped |
|--------|-----------------|
| `api` | Generic API namespace, not a business domain |
| `v1`, `v2`, `v3`, `v4`, `v5` | API version prefixes |
| `rest` | Transport-layer label |
| `graphql` | Transport-layer label |
| `internal` | Access-layer label, not a domain |
| `public` | Access-layer label, not a domain |
| `external` | Access-layer label, not a domain |

**Updated inference algorithm:**

1. Split path by `/`, filter out empty segments and parameter tokens (`:id`, `{id}`)
2. Skip segments matching the prefix-skip list (case-insensitive)
3. Take the first remaining segment as the domain
4. If no segments remain after skipping, fall back to `general`

**Examples:**

| Route path | Current domain | Corrected domain |
|-----------|---------------|-----------------|
| `/users` | `users` | `users` (unchanged) |
| `/api/v1/users/:id` | `api` | `users` |
| `/api/v2/orders/{orderId}/items` | `api` | `orders` |
| `/internal/admin/roles` | `internal` | `admin` |
| `/v1/health` | `v1` | `health` |
| `/` | `general` | `general` (unchanged) |

**Cascade effect on `name`:** Since `capabilityName()` uses `domain`, correcting the domain also fixes the capability name. `get_api_api_v1_users_id` becomes `get_users_users_id`.

##### 3. Rich Capability Descriptions

The current `describeCapability()` produces: `"GET /users capability in users domain"`. This template string conveys no semantic value to an LLM deciding whether to use a tool.

**V1 rich description template:**

```
{verb} {noun} {qualifier} — {side_effect}, {auth_context} (handler: {handler_name})
```

**Template field derivation:**

| Field | Source | Derivation rule |
|-------|--------|----------------|
| `verb` | HTTP method | GET → "Retrieve", POST → "Create", PUT → "Replace", PATCH → "Update", DELETE → "Delete", OPTIONS → "Check options for", HEAD → "Check" |
| `noun` | domain (after smart inference) | Singularize for single-resource paths (`/users/:id` → "user"), pluralize for collection paths (`/users` → "users") |
| `qualifier` | path parameters | "by {param}" for single param, "by {p1} and {p2}" for multiple, empty for collection routes |
| `side_effect` | `side_effect_class` | `read` → "read-only", `write` → "state-modifying", `destructive` → "destructive" |
| `auth_context` | `auth_hints` | Empty → "no authentication detected", non-empty → "requires {hint1}, {hint2}" |
| `handler_name` | `handler` field | As-is; omitted if `inline_handler` or `unknown_handler` |

**Examples:**

| Route | Current description | Rich description |
|-------|-------------------|-----------------|
| `GET /users` (handler: `listUsers`, auth: `[requireAuth]`) | "GET /users capability in users domain" | "Retrieve users — read-only, requires requireAuth (handler: listUsers)" |
| `GET /api/v1/users/:id` (handler: `getUser`, auth: `[requireAuth]`) | "GET /api/v1/users/:id capability in api domain" | "Retrieve user by id — read-only, requires requireAuth (handler: getUser)" |
| `POST /orders` (handler: `createOrder`, auth: `[requireAuth, AdminGuard]`) | "POST /orders capability in orders domain" | "Create orders — state-modifying, requires requireAuth, AdminGuard (handler: createOrder)" |
| `DELETE /users/:id` (handler: `inline_handler`, auth: `[]`) | "DELETE /users/:id capability in users domain" | "Delete user by id — destructive, no authentication detected" |

**V1 limitations:**
- Verb mapping is method-based only — handler name semantics not used (e.g., `POST /users/:id/disable` still says "Create" not "Disable")
- Noun singularization is heuristic (trailing `s` removal) — not linguistically robust
- No business-logic description extraction from code comments or JSDoc

**V2 plans:** Extract semantic descriptions from JSDoc `@description`, inline code comments above handler, and OpenAPI `summary`/`description` fields if available.

##### 4. Honest Confidence Scoring

The current confidence formula can produce 0.86 for a route with a named handler and auth hints but zero actual schema extraction. This misleads reviewers: the manifest shows `review_needed: false` for a route where the engine could not determine what parameters the tool accepts.

**V1 confidence adjustment:**

Add a penalty when no schema hint is detected:

| Signal | Score delta |
|--------|------------|
| Base score | +0.62 |
| Named handler (not inline/unknown) | +0.12 |
| Auth hints present | +0.08 |
| Schema hint detected (zod, joi, DTO) | +0.14 |
| Non-root path | +0.04 |
| **No schema hint detected** | **-0.10** |
| **Cap** | **0.95** |

**Impact on `review_needed` threshold (0.8):**

| Scenario | Old score | New score | `review_needed` change |
|----------|----------|----------|----------------------|
| Named handler + auth + schema hint + non-root | 0.95 | 0.95 | No change (still `false`) |
| Named handler + auth + no schema + non-root | 0.86 | 0.76 | `false` → `true` |
| Named handler + no auth + no schema + non-root | 0.78 | 0.68 | No change (still `true`) |
| Inline handler + no auth + no schema + non-root | 0.66 | 0.56 | No change (still `true`) |

The key correction: a route where the engine extracted the handler name and auth hints but failed to find any schema signals now correctly triggers `review_needed: true`. This is honest — the route needs human review to add parameter structure.

**V1 limitation:** The penalty is binary (present/absent). A V2 scoring model could weight partial schema extraction (e.g., path params extracted but body unknown) differently from zero extraction.

#### Side Effect Classification Rules

The `side_effect_class` field classifies whether invoking a capability mutates state. This classification drives agent safety decisions: an agent runtime can freely invoke `read` capabilities, require confirmation for `write`, and require explicit human approval for `destructive`.

| Class | Assigned when | Agent implication |
|-------|--------------|-------------------|
| `read` | HTTP method is GET, HEAD, or OPTIONS | Safe to invoke without confirmation |
| `write` | HTTP method is POST, PUT, or PATCH (and no destructive signals) | Requires confirmation before invocation |
| `destructive` | HTTP method is DELETE, **or** route path or handler name matches `/(delete\|destroy\|remove\|revoke)/i` | Requires explicit human approval |

**V1 implementation:** The `classifySideEffect(method, routePath, handler)` function in `src/cli.js` applies these rules deterministically. The classification is assigned during `tusq manifest` and propagated unchanged through `tusq compile` and `tusq serve`.

**Key design decision:** Handler/path name matching catches destructive operations that use non-DELETE methods (e.g., `POST /users/:id/deactivate` with handler `destroyUser`). This is intentionally conservative — false positives (flagging a non-destructive operation as destructive) are acceptable; false negatives (missing a destructive operation) are not.

#### Sensitivity Classification Rules

The `sensitivity_class` field classifies what kind of data a capability touches. This drives redaction, audit, and access-control decisions downstream. An agent runtime or governance layer uses sensitivity class to determine logging verbosity, payload redaction, and whether additional authorization is required.

| Class | Definition | Examples |
|-------|-----------|----------|
| `unknown` | No inference performed or insufficient signal | Default for all capabilities in V1 |
| `public` | Unauthenticated endpoint serving non-sensitive data | Health checks, public product catalog, documentation endpoints |
| `internal` | Authenticated endpoint with no sensitive data patterns | Internal dashboards, feature flags, non-PII settings |
| `confidential` | Handles PII, user data, or financial information | User profiles, email addresses, payment history, billing |
| `restricted` | Admin-only, security-critical, or regulated operations | Role/permission changes, API key management, audit logs, compliance exports |

**V1 sensitivity limitations:** In V1, `sensitivity_class` is always `"unknown"`. The field is present in the manifest shape to establish the contract, but no inference is performed. This mirrors the conservative approach used for `input_schema` and `output_schema`. The field exists so that:

1. Human reviewers can manually set sensitivity during manifest review (`tusq manifest` produces the field; humans edit it before `tusq compile`)
2. Downstream consumers (agent runtimes, governance tools) can rely on the field being present
3. V2 inference logic can populate it without changing the artifact shape

**V2 sensitivity inference (planned):** Future versions will infer sensitivity from:

| Signal | Inferred class |
|--------|---------------|
| No `auth_hints` + `side_effect_class: read` | `public` |
| `auth_hints` present + no sensitive path/handler patterns | `internal` |
| Path or handler matches `/(user|profile|email|password|payment|billing|invoice|card|ssn|pii)/i` | `confidential` |
| Path or handler matches `/(admin|role|permission|apikey|secret|audit|compliance)/i` | `restricted` |
| `auth_hints` contain admin/superadmin patterns | `restricted` |

#### Auth and Permission Expectations

The `auth_hints` field captures authentication and authorization signals detected in the source code. This is the third governance dimension in the canonical artifact, alongside `side_effect_class` (mutation type) and `sensitivity_class` (data sensitivity). Together, these three fields answer the core agent-safety questions:

| Field | Question it answers | Agent decision it drives |
|-------|-------------------|------------------------|
| `side_effect_class` | Does this mutate state? | Can the agent call this without confirmation? |
| `sensitivity_class` | What kind of data does this touch? | What audit/redaction rules apply? |
| `auth_hints` | What authentication/authorization is required? | Does the agent have sufficient credentials to attempt this? |

**V1 auth_hints detection rules:**

The `inferAuthHints(chunks)` function in `src/cli.js` extracts auth-related identifiers from handler expressions and nearby code (3-line radius). Detection uses pattern matching against the following regex:

```
/auth|guard|role|permission|admin|jwt|acl|rbac/i
```

| Pattern | What it catches | Examples |
|---------|----------------|----------|
| `auth` | General auth middleware | `requireAuth`, `isAuthenticated`, `authMiddleware` |
| `guard` | NestJS-style guards and route guards | `AuthGuard`, `RolesGuard`, `AdminGuard` |
| `role` | Role-based access control decorators | `@Roles('admin')`, `checkRole`, `roleMiddleware` |
| `permission` | Permission checks | `hasPermission`, `checkPermissions`, `PermissionGuard` |
| `admin` | Admin-only access | `isAdmin`, `adminOnly`, `AdminGuard` |
| `jwt` | JWT token validation | `jwtAuth`, `verifyJwt`, `JwtAuthGuard` |
| `acl` | Access control lists | `aclCheck`, `aclMiddleware` |
| `rbac` | Role-based access control | `rbacMiddleware`, `RbacGuard` |

**Framework-specific extraction:**

| Framework | Where auth hints are extracted from |
|-----------|-----------------------------------|
| Express | Handler expression + 3-line radius around route definition |
| Fastify | Inline handler expression + `fastify.route()` block options |
| NestJS | Class-level `@UseGuards()` decorators + method-level decorators + controller metadata |

**Auth hints shape:**

```json
{
  "auth_hints": ["requireAuth", "AdminGuard"]
}
```

The field is a `string[]` — an ordered, deduplicated list of identifier names that matched the auth pattern. The array is:
- **Empty (`[]`)** when no auth-related identifiers are detected. This does NOT mean the endpoint is unauthenticated — it means the scanner found no recognizable auth signal.
- **Non-empty** when one or more auth identifiers are found. The values are raw identifier names, not normalized roles or scopes.

**Agent implications of auth_hints:**

| Auth hints state | Agent interpretation | Recommended behavior |
|-----------------|---------------------|---------------------|
| Empty `[]` | No auth signal detected | Agent should treat as potentially unprotected; consult `sensitivity_class` before invoking |
| Contains general auth (e.g., `requireAuth`) | Endpoint requires authentication | Agent must present valid credentials; confirm identity context before invocation |
| Contains role/admin patterns (e.g., `AdminGuard`, `isAdmin`) | Endpoint requires elevated privileges | Agent must verify it holds the required role; require explicit human approval for admin operations |
| Contains multiple hints | Multiple auth layers detected | Agent must satisfy all detected requirements; treat as highest-privilege among detected hints |

**Confidence impact:** Each detected auth hint adds `+0.08` to the capability confidence score. Auth-protected endpoints are more likely to be intentional, well-defined capabilities.

**V1 auth limitations:**

1. **Detection is identifier-based, not semantic.** The scanner matches identifier names, not runtime behavior. A middleware named `authLogger` would match even though it only logs, not gates. False positives are acceptable; false negatives are not.
2. **No role or scope extraction.** V1 captures the *name* of the guard/middleware but not the *role or scope it requires*. `@Roles('admin', 'superadmin')` produces `auth_hints: ["Roles"]`, not `auth_hints: [{ role: "admin" }, { role: "superadmin" }]`.
3. **No tenant boundary detection.** Multi-tenant isolation (e.g., `tenantId` scoping) is not inferred.
4. **No least-privilege recommendations.** V1 does not generate minimum-required-permissions for each capability.
5. **Empty hints ≠ public.** An empty `auth_hints` array means no signal was found, not that the endpoint is unauthenticated. The scanner may miss auth applied at the router level, in middleware chains, or via framework conventions not covered by the regex.

**V2 auth and permission mapping (planned):**

Future versions will move from identifier matching to structured permission modeling:

| V2 capability | Description |
|--------------|-------------|
| Role extraction | Parse `@Roles()`, `@UseGuards(RolesGuard)`, and Express `role: ['admin']` to extract actual role names |
| Scope mapping | Extract OAuth scopes from `@Scopes()` decorators and `passport` configurations |
| Tenant boundary detection | Identify `tenantId`, `orgId`, or similar path/query parameters that indicate multi-tenant isolation |
| Least-privilege hints | Generate minimum required permissions per capability: `{ roles: ["admin"], scopes: ["users:write"] }` |
| Impersonation path detection | Flag capabilities where one user can act on behalf of another (e.g., admin impersonation endpoints) |
| Auth inheritance resolution | Resolve controller-level auth that applies to all methods, not just method-level decorators |

**V2 auth_hints shape (planned):**

```json
{
  "auth_hints": ["requireAuth", "AdminGuard"],
  "auth_requirements": {
    "authenticated": true,
    "roles": ["admin"],
    "scopes": ["users:read", "users:write"],
    "tenant_isolated": true,
    "impersonation_capable": false,
    "least_privilege": {
      "minimum_role": "admin",
      "minimum_scopes": ["users:read"]
    }
  }
}
```

The V2 shape adds `auth_requirements` as a structured companion to the existing `auth_hints` array. The `auth_hints` field remains for backward compatibility. The `auth_requirements` object is absent in V1 (not emitted), present with inferred values in V2.

#### Examples Specification

The `examples` field provides concrete request/response pairs that demonstrate how to invoke a capability. This is the fourth governance dimension listed in VISION.md: examples let agents understand expected usage patterns, and let human reviewers verify that the capability behaves as described.

| Field | Question it answers | Agent decision it drives |
|-------|-------------------|------------------------|
| `side_effect_class` | Does this mutate state? | Can the agent call this without confirmation? |
| `sensitivity_class` | What kind of data does this touch? | What audit/redaction rules apply? |
| `auth_hints` | What authentication/authorization is required? | Does the agent have sufficient credentials? |
| `examples` | What does a correct invocation look like? | How should the agent construct requests and interpret responses? |

**Example object shape:**

```json
{
  "input": { "<key>": "<value>" },
  "output": { "<key>": "<value>" },
  "description": "<optional human-readable explanation of this example>"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `input` | object | yes | Example request parameters — keys match `input_schema` properties |
| `output` | object | yes | Example response body — keys match `output_schema` properties |
| `description` | string | no | Human-readable note explaining what this example demonstrates |

**Agent implications of examples:**

| Examples state | Agent interpretation | Recommended behavior |
|---------------|---------------------|---------------------|
| Static V1 placeholder (describe-only note) | No real examples available | Agent must rely on `input_schema`/`output_schema` shapes alone; do not fabricate example data |
| Contains real input/output pairs | Capability has documented usage patterns | Agent may use examples to construct well-formed requests and validate response shapes |
| Multiple examples present | Capability has edge cases worth demonstrating | Agent should review all examples to understand the full range of valid invocations |

**V1 examples limitations:**

1. **Always static placeholder.** In V1, every capability's `examples` array contains exactly one entry with `input: {}` and `output: { note: "Describe-only mode in V1. Live execution is deferred to V1.1." }`. No real request/response data is generated.
2. **No inference from source code.** V1 does not extract example data from test files, JSDoc `@example` tags, or OpenAPI example fields.
3. **No validation against schemas.** V1 does not verify that example input/output conforms to `input_schema`/`output_schema`.
4. **Human-editable.** Like `approved` and `sensitivity_class`, examples can be manually authored in the manifest before `tusq compile`. The static placeholder is a starting point, not a final value.

**Pipeline propagation:** The `examples` field originates in `tusq.manifest.json`, is propagated unchanged through `tusq compile` to `tusq-tools/*.json`, and is returned in MCP `tools/call` responses. It is **not** present in `.tusq/scan.json` (scan discovers routes, not usage patterns).

```
.tusq/scan.json         — no examples field
tusq.manifest.json      — examples[] (static placeholder or human-authored)
tusq-tools/*.json       — examples[] (propagated from manifest)
MCP tools/call response — examples[] (propagated from compiled tool)
```

**V2 examples inference (planned):**

Future versions will infer real examples from multiple sources:

| V2 capability | Description |
|--------------|-------------|
| Test file extraction | Parse `*.test.js`, `*.spec.ts` files for request/response pairs matching the capability's route |
| JSDoc `@example` tags | Extract example blocks from handler function documentation |
| OpenAPI example fields | Pull `example` and `examples` from OpenAPI/Swagger specs if present |
| Runtime learning | Record real request/response pairs from instrumented traffic (requires opt-in) |
| Example validation | Verify all examples conform to `input_schema` and `output_schema`; flag mismatches |
| Negative examples | Include examples of invalid input and expected error responses |

**V2 example object shape (planned):**

```json
{
  "input": { "id": 42 },
  "output": { "name": "Alice", "email": "alice@example.com" },
  "description": "Fetch a user by ID",
  "source": "test",
  "source_file": "tests/users.test.js",
  "source_line": 87,
  "validated": true
}
```

The V2 shape adds `source` (where the example came from), `source_file`/`source_line` (provenance), and `validated` (whether it conforms to the capability's schemas). The V1 shape remains valid in V2 — new fields are additive.

#### Constraints Specification

The `constraints` field captures operational boundaries on a capability: rate limits, payload size limits, required headers, idempotency, and cacheability. This is the fifth governance dimension listed in VISION.md. Constraints let agents respect operational limits without trial-and-error, and let governance layers enforce quotas and retry policies.

| Field | Question it answers | Agent decision it drives |
|-------|-------------------|------------------------|
| `side_effect_class` | Does this mutate state? | Can the agent call this without confirmation? |
| `sensitivity_class` | What kind of data does this touch? | What audit/redaction rules apply? |
| `auth_hints` | What authentication/authorization is required? | Does the agent have sufficient credentials? |
| `examples` | What does a correct invocation look like? | How should the agent construct requests? |
| `constraints` | What operational limits apply? | How should the agent throttle, size, and retry? |

**Constraints object shape:**

```json
{
  "rate_limit": "<string | null>",
  "max_payload_bytes": "<integer | null>",
  "required_headers": ["<string>"],
  "idempotent": "<boolean | null>",
  "cacheable": "<boolean | null>"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rate_limit` | string \| null | yes | Human-readable rate limit (e.g., `"100/minute"`, `"10/second"`). `null` when unknown or unset |
| `max_payload_bytes` | integer \| null | yes | Maximum request body size in bytes. `null` when unknown or unset |
| `required_headers` | string[] | yes | Header names the endpoint requires beyond standard auth (e.g., `["X-Request-Id"]`, `["Content-Type"]`). Empty array when none |
| `idempotent` | boolean \| null | yes | Whether repeated identical calls produce the same result. `null` when unknown |
| `cacheable` | boolean \| null | yes | Whether responses can be cached. `null` when unknown |

**Agent implications of constraints:**

| Constraint field | Agent interpretation when set | Agent interpretation when null |
|-----------------|------------------------------|-------------------------------|
| `rate_limit` | Throttle invocations to stay within the stated limit | No rate information — agent should apply conservative defaults |
| `max_payload_bytes` | Validate request body size before sending | No size limit known — agent should avoid sending unbounded payloads |
| `required_headers` | Include all listed headers in every request | No special headers required beyond auth |
| `idempotent: true` | Safe to retry on transient failures without confirmation | Unknown — agent should treat as non-idempotent (no automatic retry for write/destructive) |
| `cacheable: true` | Agent may cache responses and reuse them within a reasonable TTL | Unknown — agent should not cache |

**V1 constraints limitations:**

1. **All fields default to null/empty.** In V1, `constraints` is always `{ rate_limit: null, max_payload_bytes: null, required_headers: [], idempotent: null, cacheable: null }`. No inference is performed.
2. **No detection from source code.** V1 does not scan for rate-limiting middleware (e.g., `express-rate-limit`, `@nestjs/throttler`), body-parser size configs, or caching decorators.
3. **Human-editable.** Like `sensitivity_class` and `examples`, constraints can be manually set in the manifest before `tusq compile`. The null defaults are starting points.
4. **The field is present to establish the contract** so downstream consumers can rely on it, and V2 inference logic can populate it without changing the artifact shape.

**Pipeline propagation:** The `constraints` field originates in `tusq.manifest.json`, is propagated unchanged through `tusq compile` to `tusq-tools/*.json`, and is returned in MCP `tools/call` responses. It is **not** present in `.tusq/scan.json`.

```
.tusq/scan.json         — no constraints field
tusq.manifest.json      — constraints {} (null defaults or human-authored)
tusq-tools/*.json       — constraints {} (propagated from manifest)
MCP tools/call response — constraints {} (propagated from compiled tool)
```

**V2 constraints inference (planned):**

Future versions will infer constraints from middleware and configuration:

| V2 capability | Description |
|--------------|-------------|
| Rate limit detection | Parse `express-rate-limit`, `@nestjs/throttler`, Fastify `fastify-rate-limit` configurations for window/max values |
| Payload size detection | Read `body-parser` `limit` option, Fastify `bodyLimit`, NestJS `@Body()` size decorators |
| Required headers detection | Identify custom header checks in middleware (`req.headers['x-request-id']`) |
| Idempotency inference | Mark GET/HEAD/OPTIONS as `idempotent: true`; detect idempotency-key middleware for POST endpoints |
| Cacheability inference | Detect `cache-control` header setting, `@CacheKey()` decorators, or CDN/proxy cache configuration |
| Timeout detection | Extract request timeout values from middleware or framework configuration |

**V2 constraints shape (planned):**

```json
{
  "rate_limit": "100/minute",
  "max_payload_bytes": 1048576,
  "required_headers": ["X-Request-Id", "X-Tenant-Id"],
  "idempotent": true,
  "cacheable": true,
  "timeout_ms": 30000,
  "retry_policy": {
    "max_retries": 3,
    "backoff": "exponential",
    "retry_on": [429, 503]
  }
}
```

The V2 shape adds `timeout_ms` and `retry_policy` as new fields. Existing V1 fields remain with the same semantics. The V1 shape is valid in V2 — new fields are additive.

#### Redaction and Approval Metadata

The `redaction`, `approved`, `approved_by`, `approved_at`, and `review_needed` fields form the sixth governance dimension in the canonical artifact. VISION.md line 60 explicitly lists "redaction and approval metadata" as a core component of the manifest. These fields answer two distinct questions:

| Field group | Question it answers | Who acts on it |
|-------------|-------------------|----------------|
| `redaction` | What data must be masked, minimized, or retained with limits? | Agent runtimes, logging systems, audit pipelines |
| `approved` + `approved_by` + `approved_at` + `review_needed` | Has a human reviewed and accepted this capability for compilation? | The `tusq compile` gate, governance dashboards, audit trails |

Together with the five previously specified dimensions, the governance model is now six fields:

| # | Field | Question |
|---|-------|----------|
| 1 | `side_effect_class` | Does this mutate state? |
| 2 | `sensitivity_class` | What kind of data does this touch? |
| 3 | `auth_hints` | What authentication/authorization is required? |
| 4 | `examples` | What does correct usage look like? |
| 5 | `constraints` | What operational limits apply? |
| 6 | `redaction` + approval metadata | What must be masked, and who approved this? |

##### Redaction Specification

The `redaction` object declares how an agent runtime, logging system, or governance layer should handle data flowing through a capability. This complements `sensitivity_class` (which says *what kind of data* a capability touches) by specifying *what to do about it* in operational contexts.

**Redaction object shape:**

```json
{
  "pii_fields": ["<string>"],
  "log_level": "full | redacted | silent",
  "mask_in_traces": true | false,
  "retention_days": <integer | null>
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pii_fields` | string[] | yes | Field names in input or output that contain PII and must be masked in logs/traces. Empty array when none identified |
| `log_level` | string | yes | How much of the request/response should be logged: `full` (everything), `redacted` (strip `pii_fields`), or `silent` (log only the invocation, not payloads) |
| `mask_in_traces` | boolean | yes | Whether request/response payloads should be masked in distributed traces (OpenTelemetry spans, etc.) |
| `retention_days` | integer \| null | yes | Maximum number of days to retain logs containing this capability's data. `null` when no policy is set |

**Agent implications of redaction:**

| Redaction state | Agent interpretation | Recommended behavior |
|----------------|---------------------|---------------------|
| `pii_fields: []` | No PII fields identified | Agent may log full payloads (subject to `log_level`) |
| `pii_fields: ["email", "ssn"]` | Named fields contain PII | Agent must mask these fields before logging, caching, or including in trace spans |
| `log_level: "full"` | No logging restrictions | Agent may include full request/response in logs |
| `log_level: "redacted"` | Strip PII before logging | Agent must remove `pii_fields` values from log entries |
| `log_level: "silent"` | Do not log payloads | Agent may log that the capability was invoked (name, timestamp, status) but must not include request or response bodies |
| `mask_in_traces: true` | Sensitive trace context | Agent must not attach request/response payloads to distributed trace spans |
| `retention_days: 30` | Time-limited retention | Logging/audit systems must enforce the stated retention period |
| `retention_days: null` | No retention policy set | Default organizational retention policy applies |

**V1 redaction limitations:**

1. **All fields default to empty/permissive.** In V1, `redaction` is always `{ pii_fields: [], log_level: "full", mask_in_traces: false, retention_days: null }`. No inference is performed.
2. **No PII detection from source code.** V1 does not scan for field names matching PII patterns (`email`, `password`, `ssn`, `phone`, etc.) in schemas, DTOs, or handler code.
3. **No framework-specific extraction.** V1 does not detect data masking middleware, logging sanitizers, or GDPR-related annotations.
4. **Human-editable.** Like `sensitivity_class`, `examples`, and `constraints`, redaction can be manually authored in the manifest before `tusq compile`. The permissive defaults are starting points, not final values.
5. **The field is present to establish the contract** so downstream consumers (agent runtimes, audit tools, compliance systems) can rely on it, and V2 inference logic can populate it without changing the artifact shape.

**Relationship to sensitivity_class:**

`sensitivity_class` and `redaction` are complementary, not redundant:

| Field | What it captures | Who sets it | What it drives |
|-------|-----------------|-------------|----------------|
| `sensitivity_class` | Category of data touched (unknown/public/internal/confidential/restricted) | Scanner (V2) or human (V1) | Access control decisions, audit tier selection |
| `redaction` | Specific operational masking and retention rules | Human (V1), scanner + policy engine (V2) | Logging behavior, trace masking, data retention |

A capability can be `sensitivity_class: "confidential"` (it touches PII) and `redaction: { pii_fields: ["email"], log_level: "redacted", mask_in_traces: true, retention_days: 90 }` (here's exactly what to mask and how long to keep it). Sensitivity is the classification; redaction is the operational response to that classification.

**Pipeline propagation:** The `redaction` field originates in `tusq.manifest.json`, is propagated unchanged through `tusq compile` to `tusq-tools/*.json`, and is returned in MCP `tools/call` responses. It is **not** present in `.tusq/scan.json` (scan discovers routes, not redaction policy) or MCP `tools/list` (summary view).

```
.tusq/scan.json         — no redaction field
tusq.manifest.json      — redaction {} (permissive defaults or human-authored)
tusq-tools/*.json       — redaction {} (propagated from manifest)
MCP tools/call response — redaction {} (propagated from compiled tool)
```

**V2 redaction inference (planned):**

Future versions will infer redaction policy from multiple signals:

| V2 capability | Description |
|--------------|-------------|
| PII field detection | Scan schema properties, DTO fields, and handler variables for PII patterns (`email`, `password`, `ssn`, `phone`, `address`, `dob`, `card_number`) |
| Sensitivity-driven defaults | Auto-set `log_level: "redacted"` and `mask_in_traces: true` for `confidential` capabilities; `log_level: "silent"` for `restricted` |
| Regulatory annotation detection | Parse GDPR, HIPAA, PCI-DSS annotations or comments in source code to set retention periods |
| Logging middleware analysis | Detect data-masking middleware (e.g., `morgan` custom formatters, `pino` redaction paths) to infer existing redaction behavior |
| Policy engine integration | Accept organizational redaction policies as input and apply them to capabilities matching sensitivity/domain criteria |

**V2 redaction shape (planned):**

```json
{
  "pii_fields": ["email", "phone", "billing_address"],
  "log_level": "redacted",
  "mask_in_traces": true,
  "retention_days": 90,
  "regulatory_tags": ["GDPR", "PCI-DSS"],
  "redaction_source": "inferred",
  "redaction_confidence": 0.82
}
```

The V2 shape adds `regulatory_tags` (which compliance frameworks apply), `redaction_source` (whether the policy was inferred or human-authored), and `redaction_confidence` (scanner confidence in the inferred policy). The V1 shape remains valid in V2 — new fields are additive.

##### Approval Metadata Specification

The `approved`, `approved_by`, `approved_at`, and `review_needed` fields form the human-in-the-loop gate in the tusq.dev pipeline. This is the only place where a human decision blocks automated compilation. Nothing compiles without `approved: true`.

**Approval fields shape:**

```json
{
  "review_needed": true,
  "approved": false,
  "approved_by": null,
  "approved_at": null
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `review_needed` | boolean | yes | `true` when `confidence < 0.8`. Signals that the capability has low confidence and should receive extra scrutiny during review |
| `approved` | boolean | yes | `true` when a human has reviewed and accepted this capability. Only `approved: true` capabilities pass through `tusq compile` |
| `approved_by` | string \| null | yes | Human-readable identifier (name, email, or username) of the person who approved. `null` until explicitly set |
| `approved_at` | string \| null | yes | ISO 8601 timestamp of when `approved` was set to `true`. `null` until explicitly set |

**Agent implications of approval metadata:**

| Approval state | Agent interpretation | Recommended behavior |
|---------------|---------------------|---------------------|
| `approved: false` | Capability has not been human-reviewed | Agent must not treat this as a reliable tool definition; capability is draft-quality |
| `approved: true, approved_by: null` | Approved but no audit trail | Agent may use the tool, but governance dashboards should flag missing provenance |
| `approved: true, approved_by: "alice@co.com"` | Approved with attribution | Full audit trail available; agent may use with confidence |
| `review_needed: true` | Low-confidence detection | Human reviewer should pay extra attention to this capability's accuracy |
| `review_needed: false` | High-confidence detection | Standard review process applies |

**How approval flows through the pipeline:**

1. `tusq manifest` generates capabilities with `approved: false` (new) or preserves existing `approved` values (regeneration). `approved_by` and `approved_at` are preserved from existing manifests when present.
2. A human reviews `tusq.manifest.json` and uses `tusq approve <capability-name> --reviewer <id>` or `tusq approve --all --reviewer <id>` to set `approved: true`, clear `review_needed`, and record `approved_by` plus `approved_at`.
3. `tusq compile` filters: only `approved: true` capabilities produce compiled tool files.
4. Compiled tools (`tusq-tools/*.json`) do **not** carry approval fields — their existence is proof of approval.
5. MCP `tools/list` and `tools/call` do **not** return approval fields — only approved capabilities are served.

```
.tusq/scan.json         — no approval fields (scan discovers, does not judge)
tusq.manifest.json      — review_needed, approved, approved_by, approved_at (the gate)
tusq-tools/*.json       — no approval fields (existence = approved)
MCP server responses    — no approval fields (only approved tools served)
```

**Review gate:**

`tusq review` prints a grouped, non-interactive summary for human and CI review. Each row includes approval state, confidence, inferred input/output shape summaries, and provenance. `tusq review --strict` exits `1` when any capability is unapproved or has `review_needed: true`, and exits `0` only when the manifest is fully approved and no low-confidence capability remains.

**V1 approval limitations:**

1. **`approved_by` and `approved_at` default to `null`.** They remain null until a reviewer approves a capability with `tusq approve` or manually edits the manifest. The `approved` boolean alone gates compilation.
2. **No interactive approval UI.** V1 ships a non-interactive `tusq approve` command, but not a TUI, web UI, approval history viewer, or multi-party workflow.
3. **No approval history.** V1 does not track when a capability was previously approved and then un-approved (e.g., after manifest regeneration changed its shape).
4. **No multi-party approval.** V1 supports a single `approved_by` identity. There is no countersignature or quorum requirement.

**V2 approval metadata (planned):**

| V2 capability | Description |
|--------------|-------------|
| Interactive approval UI | Guided terminal or web review flow on top of the non-interactive `tusq approve` primitive |
| Approval history | Track approval/revocation events with timestamps and identities in a `approval_history[]` array |
| Multi-party approval | Support `approved_by` as an array for capabilities requiring multiple reviewers |
| CI/CD integration | Gate deployment pipelines on approval status; fail builds if unapproved capabilities are referenced |
| Diff-aware re-approval | When `tusq manifest` regeneration changes a capability's shape, automatically set `approved: false` and flag for re-review |

**V2 approval shape (planned):**

```json
{
  "review_needed": true,
  "approved": true,
  "approved_by": "alice@company.com",
  "approved_at": "2026-04-19T10:30:00.000Z",
  "approval_history": [
    {
      "action": "approved",
      "by": "alice@company.com",
      "at": "2026-04-19T10:30:00.000Z",
      "note": "Reviewed after auth migration"
    }
  ]
}
```

The V2 shape adds `approval_history` for audit trail completeness. The V1 fields remain with the same semantics — new fields are additive.

#### Version History and Diffs

The `manifest_version`, `previous_manifest_hash`, and per-capability `capability_digest` fields form the seventh and final governance dimension in the canonical artifact. VISION.md line 61 explicitly lists "version history and diffs" as a core component of the manifest. Line 218 requires the system to "produce manifest diffs and review queues." These fields answer a distinct question from the other six dimensions:

| Field group | Question it answers | Who acts on it |
|-------------|-------------------|----------------|
| `manifest_version` + `previous_manifest_hash` | How has the manifest evolved? Which generation is this? | CI/CD pipelines, audit systems, diff tooling |
| `capability_digest` | Has this specific capability changed since the last manifest generation? | Re-approval workflows, review queues, diff consumers |

Together with the six previously specified dimensions, the governance model is now seven fields:

| # | Field | Question |
|---|-------|----------|
| 1 | `side_effect_class` | Does this mutate state? |
| 2 | `sensitivity_class` | What kind of data does this touch? |
| 3 | `auth_hints` | What authentication/authorization is required? |
| 4 | `examples` | What does correct usage look like? |
| 5 | `constraints` | What operational limits apply? |
| 6 | `redaction` + approval metadata | What must be masked, and who approved this? |
| 7 | `manifest_version` + `previous_manifest_hash` + `capability_digest` | How has the manifest evolved, and what changed? |

##### Manifest-Level Version Fields

Two fields are added to the manifest root (alongside `schema_version`, `generated_at`, and `source_scan`):

**Updated manifest root shape:**

```json
{
  "schema_version": "1.0",
  "manifest_version": 1,
  "previous_manifest_hash": null,
  "generated_at": "<ISO 8601 timestamp>",
  "source_scan": ".tusq/scan.json",
  "capabilities": [ "..." ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `manifest_version` | integer | yes | Monotonically increasing counter, starting at `1`. Incremented each time `tusq manifest` is run and produces a new manifest. If the manifest file already exists on disk and contains a valid `manifest_version`, the new value is `previous + 1`. If no prior manifest exists, the value is `1`. |
| `previous_manifest_hash` | string \| null | yes | SHA-256 hex digest of the entire previous `tusq.manifest.json` file content (byte-for-byte). `null` on first generation (no prior manifest exists). This creates a hash chain linking each manifest to its predecessor, enabling tamper detection and lineage verification. |

**Manifest version rules:**

| Scenario | `manifest_version` | `previous_manifest_hash` |
|----------|-------------------|-------------------------|
| First `tusq manifest` run (no prior manifest) | `1` | `null` |
| Subsequent `tusq manifest` run (prior manifest exists) | `previous + 1` | SHA-256 of prior manifest file |
| Manual edit of manifest (e.g., setting `approved: true`) | Unchanged (edits do not increment) | Unchanged |
| `tusq manifest` after manual edits | `previous + 1` | SHA-256 of prior (manually edited) manifest |

**Agent implications of manifest version fields:**

| Field state | Agent interpretation | Recommended behavior |
|-------------|---------------------|---------------------|
| `manifest_version: 1` | First-ever manifest for this project | All capabilities are new; no prior state to compare against |
| `manifest_version: N` (N > 1) | Manifest has been regenerated N times | Check `previous_manifest_hash` to verify lineage; compare with previous version if available |
| `previous_manifest_hash: null` | No predecessor exists | This is the initial manifest; no diff is possible |
| `previous_manifest_hash: "<hex>"` | Prior manifest hash recorded | Can verify integrity of prior manifest; enables diff computation |

##### Per-Capability Digest

Each capability gains a `capability_digest` field: a SHA-256 hex digest of the capability's content-addressable fields. This enables quick change detection without full object comparison.

**Digest computation:** The digest is computed over a deterministic JSON serialization of the capability's *content fields* — specifically, all fields **except**:
- `capability_digest` itself (circular)
- `approved` (human gate state, not content)
- `approved_by` (audit metadata, not content)
- `approved_at` (audit metadata, not content)
- `review_needed` (derived from confidence, not independent content)

The remaining fields are serialized as a JSON object with keys sorted alphabetically, no whitespace, and the resulting string is hashed with SHA-256.

**Capability digest shape (added to Capability object):**

```json
{
  "name": "get_users_users",
  "capability_digest": "a1b2c3d4e5f6...64-char-hex-string",
  "...": "other capability fields"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `capability_digest` | string | yes | SHA-256 hex digest of the capability's content fields (sorted-key JSON serialization, excluding approval/review metadata and the digest itself). 64-character lowercase hex string. |

**Agent implications of capability_digest:**

| Digest state | Agent interpretation | Recommended behavior |
|-------------|---------------------|---------------------|
| Same digest across manifest versions | Capability content unchanged | No re-review needed; approval state remains valid |
| Different digest across manifest versions | Capability content changed | Flag for re-review; consider resetting `approved: false` (V2 automation) |
| Digest present | Content is addressable | Can be used as cache key, deduplication signal, or change detection trigger |

**V1 version history limitations:**

1. **No `tusq diff` command.** V1 produces the fields that enable diffing but does not ship a CLI command to compute or display diffs. Users can compare manifests using standard JSON diff tools (e.g., `diff`, `jq`, `json-diff`).
2. **No history file.** V1 does not maintain a `.tusq/manifest-history.jsonl` or similar append-only log. The `previous_manifest_hash` field creates a single-step hash chain, not a full history. Users who need full history should use git (which already tracks `tusq.manifest.json`).
3. **No automatic re-approval on change.** V1 does not automatically set `approved: false` when a capability's `capability_digest` changes between manifest versions. This is a V2 feature (diff-aware re-approval).
4. **No diff format specification.** V1 establishes the fields but does not define a structured diff output format. The diff format is specified below as a V2 deliverable.
5. **Hash chain is advisory.** The `previous_manifest_hash` is not cryptographically verified by any V1 command. It exists for downstream consumers and future tooling.

**Pipeline propagation:** The version history fields live at different levels:

```
.tusq/scan.json         — no version fields (scan is stateless)
tusq.manifest.json      — manifest_version, previous_manifest_hash (root level)
                        — capability_digest (per capability)
tusq-tools/*.json       — no version fields (compiled tools are snapshots)
MCP server responses    — no version fields (runtime serves current state)
```

Version history is a manifest-only concern. Compiled tools and MCP responses are point-in-time snapshots of approved capabilities — they do not carry lineage information. The manifest is the single source of truth for version evolution.

**V2 version history and diff tooling (planned):**

Future versions will build on V1's fields to provide active diff and review capabilities:

| V2 capability | Description |
|--------------|-------------|
| `tusq diff` command | Compare current manifest to previous version (from git or a supplied file path); output added, removed, and changed capabilities with field-level detail |
| Structured diff format | JSON diff output with summary counts and per-capability change records (see format below) |
| Diff-aware re-approval | When `tusq manifest` regeneration changes a capability's `capability_digest`, automatically set `approved: false` and add to the review queue |
| `.tusq/manifest-history.jsonl` | Append-only log of manifest snapshots (version, hash, timestamp, summary of changes) for projects that want history beyond git |
| Git integration | `tusq diff --git HEAD~1` to compare manifest at current commit vs. previous commit |
| Review queue generation | `tusq review --changed` to list only capabilities whose digest changed since last approved version |
| CI/CD diff gate | `tusq diff --fail-on-unapproved-changes` exits non-zero if any changed capabilities lack re-approval |

**V2 diff output format (planned):**

```json
{
  "from_version": 3,
  "to_version": 4,
  "from_hash": "abc123...",
  "to_hash": "def456...",
  "generated_at": "2026-04-20T12:00:00.000Z",
  "summary": {
    "added": 1,
    "removed": 0,
    "changed": 2,
    "unchanged": 5
  },
  "changes": [
    {
      "type": "added",
      "capability": "post_billing_invoices",
      "digest": "new-digest-hex"
    },
    {
      "type": "changed",
      "capability": "get_users_users",
      "previous_digest": "old-digest-hex",
      "current_digest": "new-digest-hex",
      "fields_changed": ["path", "input_schema", "auth_hints"],
      "approval_invalidated": true
    },
    {
      "type": "removed",
      "capability": "delete_legacy_cleanup",
      "previous_digest": "old-digest-hex"
    },
    {
      "type": "unchanged",
      "capability": "get_health_health",
      "digest": "same-digest-hex"
    }
  ]
}
```

The V2 diff format is additive — it introduces a new output artifact (`tusq diff` result) without changing existing shapes. The V1 manifest fields (`manifest_version`, `previous_manifest_hash`, `capability_digest`) remain with the same semantics.

**M16 implementation target: `tusq diff` and review queue**

M16 promotes the first slice of the planned V2 diff work into the next implementation increment. The goal is not a full history store or git integration. The goal is a deterministic local command that turns existing manifest version fields into a reviewable change set.

**CLI interface:**

```bash
tusq diff [--from <manifest-path>] [--to <manifest-path>] [--json] [--review-queue] [--fail-on-unapproved-changes]
```

| Option | Required | Behavior |
|--------|----------|----------|
| `--from <manifest-path>` | optional | Previous manifest to compare from. If omitted, the command may use a locally available predecessor only when it can be resolved unambiguously. |
| `--to <manifest-path>` | optional | Current manifest to compare to. Defaults to `tusq.manifest.json` in the current working directory. |
| `--json` | optional | Print the structured diff output and no human summary text. |
| `--review-queue` | optional | Include or print the capabilities that require human review after the diff. |
| `--fail-on-unapproved-changes` | optional | Exit 1 when any added or changed capability is not approved. |

**Diff identity rules:**

Capabilities are matched by `name`. A capability present only in `to` is `added`. A capability present only in `from` is `removed`. A capability present in both with identical `capability_digest` is `unchanged`. A capability present in both with different `capability_digest` is `changed`.

When a changed capability is detected, the command compares normalized capability JSON excluding `capability_digest` itself and reports top-level `fields_changed`. Approval fields (`approved`, `approved_by`, `approved_at`, `review_needed`) remain visible as governance fields, but they do not override digest-based content-change detection.

**Human-readable output:**

The default output must include:

- from/to manifest paths and versions when present
- summary counts for added, removed, changed, unchanged
- one line per added, removed, or changed capability
- field names for changed capabilities
- review queue count when `--review-queue` is supplied
- a clear gate failure message when `--fail-on-unapproved-changes` exits non-zero

**Review queue rules:**

A capability enters the M16 review queue when any of these are true:

- it is `added`
- it is `changed`
- `approved !== true`
- `review_needed === true`

The review queue output must include capability name, change type, approved state, review-needed state, side effect class, sensitivity class, confidence, and provenance when available.

**M16 scope exclusions:**

- No `.tusq/manifest-history.jsonl` append-only history file
- No `--git` integration
- No automatic approval invalidation during `tusq manifest`
- No schema migration or manifest shape changes
- No MCP runtime changes

**Acceptance tests required by M16:**

- `tusq diff --from old.json --to new.json` exits 0 and prints summary counts for fixture manifests
- `tusq diff --json --from old.json --to new.json` emits parseable JSON matching the structured diff shape
- changed capabilities report `fields_changed`
- `--review-queue` includes added, changed, unapproved, and `review_needed` capabilities
- `--fail-on-unapproved-changes` exits 1 for added or changed unapproved capabilities and exits 0 when changed capabilities are approved
- invalid or missing manifest paths exit 1 with actionable errors
- `tusq help` and per-command help list the new command and options

### 4. `tusq-tools/*.json` — Compiled Tool Definitions (Output)

Produced by `tusq compile`. One JSON file per approved capability, plus an `index.json`.

**Individual tool shape (`tusq-tools/{name}.json`):**

```json
{
  "name": "get_users_users",
  "description": "GET /users capability in users domain",
  "parameters": {
    "type": "object",
    "additionalProperties": true,
    "description": "<input inference status>"
  },
  "returns": {
    "type": "object",
    "additionalProperties": true,
    "description": "<output inference status>"
  },
  "side_effect_class": "read",
  "sensitivity_class": "unknown",
  "auth_hints": ["requireAuth"],
  "examples": [
    {
      "input": {},
      "output": {
        "note": "Describe-only mode in V1. Live execution is deferred to V1.1."
      }
    }
  ],
  "constraints": {
    "rate_limit": null,
    "max_payload_bytes": null,
    "required_headers": [],
    "idempotent": null,
    "cacheable": null
  },
  "redaction": {
    "pii_fields": [],
    "log_level": "full",
    "mask_in_traces": false,
    "retention_days": null
  },
  "provenance": {
    "file": "src/app.ts",
    "line": 12
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Matches the capability name from the manifest |
| `description` | string | Human-readable summary |
| `parameters` | object | JSON Schema for tool input (from `input_schema`) |
| `returns` | object | JSON Schema for tool output (from `output_schema`) |
| `side_effect_class` | string | Same classification as manifest |
| `sensitivity_class` | string | Same classification as manifest |
| `auth_hints` | string[] | Auth requirements |
| `examples` | array | Static examples; in V1 always contain a describe-only note |
| `constraints` | object | Operational constraints; all null/empty in V1 — see Constraints specification |
| `redaction` | object | Redaction policy; permissive defaults in V1 — see Redaction specification |
| `provenance` | object | Source traceability |

**Tool index shape (`tusq-tools/index.json`):**

```json
{
  "generated_at": "<ISO 8601 timestamp>",
  "tool_count": 2,
  "tools": ["get_users_users", "post_users_users"]
}
```

### 5. MCP Server Responses (Output)

The `tusq serve` command exposes compiled tools via an HTTP JSON-RPC endpoint.

**`tools/list` response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "get_users_users",
        "description": "GET /users capability in users domain",
        "parameters": { "type": "object", "additionalProperties": true },
        "returns": { "type": "object", "additionalProperties": true }
      }
    ]
  }
}
```

**`tools/call` response (describe-only in V1):**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "name": "get_users_users",
    "description": "GET /users capability in users domain",
    "schema": {
      "parameters": { "type": "object", "additionalProperties": true },
      "returns": { "type": "object", "additionalProperties": true }
    },
    "examples": [
      {
        "input": {},
        "output": { "note": "Describe-only mode in V1. Live execution is deferred to V1.1." }
      }
    ],
    "constraints": {
      "rate_limit": null,
      "max_payload_bytes": null,
      "required_headers": [],
      "idempotent": null,
      "cacheable": null
    },
    "redaction": {
      "pii_fields": [],
      "log_level": "full",
      "mask_in_traces": false,
      "retention_days": null
    }
  }
}
```

**MCP error response:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32602,
    "message": "Unknown tool: nonexistent_tool"
  }
}
```

| Error code | Meaning |
|------------|---------|
| `-32601` | Method not found (unsupported RPC method) |
| `-32602` | Invalid params (unknown tool name) |

### Shape Lineage

The data flows through a strict pipeline where each stage narrows and enriches:

```
tusq.config.json          (user input — framework, paths, exclusions)
       │
       ▼
.tusq/scan.json            (discovered routes with inferred schemas)
       │
       ▼
tusq.manifest.json         (capabilities with approval gates + provenance)
       │  ▲
       │  │ human edits approved=true
       │  │
       ▼
tusq-tools/*.json          (compiled tools for approved capabilities only)
       │
       ▼
MCP server responses       (tools/list and tools/call over JSON-RPC)
```

Each transformation is deterministic: the same input produces the same output. The `approved` field is the only human-in-the-loop gate. Nothing compiles without explicit human approval. The `redaction` field propagates from manifest through compile to MCP `tools/call`, enabling agent runtimes to enforce data masking at every stage. Approval metadata (`approved`, `approved_by`, `approved_at`, `review_needed`) lives only in the manifest — downstream artifacts exist only for approved capabilities. Version history fields (`manifest_version`, `previous_manifest_hash`, `capability_digest`) also live only in the manifest — they track evolution of the canonical artifact itself and do not propagate to compiled tools or MCP responses.

## M20: Opt-In Local Execution Policy Scaffold for MCP serve

M20 is the first increment on the VISION "safe execution wrappers" ladder (VISION.md lines 177–181 and line 245). V1 currently ships describe-only MCP responses (the `V1_DESCRIBE_ONLY_NOTE` in `src/cli.js` line 11). M20 does **not** turn on live execution. It adds an opt-in, repo-local scaffold that lets an operator validate arguments against the approved compiled tool schema and produce an auditable dry-run execution plan, while preserving V1's byte-for-byte describe-only default.

### Scope boundary

- **In scope.** A policy file `.tusq/execution-policy.json`; a new `tusq serve --policy <path>` flag; a `mode: "dry-run"` extension of the `tools/call` response that validates arguments against the approved compiled tool `parameters` schema and emits a structured `dry_run_plan`; JSON-RPC validation error surfaces; fully local execution (no network I/O to the target product).
- **Out of scope.** Live API execution; confirmation or approve ladders on the serve path; mutating target-system state; authoring policies via CLI; multi-party policy approval; streaming or async plans; policy inheritance or wildcard capability matchers beyond the explicit `allowed_capabilities` list.

### Policy file shape

File: `.tusq/execution-policy.json`. Human-authored in V1.1; no CLI writer.

```json
{
  "schema_version": "1.0",
  "mode": "dry-run",
  "allowed_capabilities": ["get_users_id", "list_orders"],
  "reviewer": "ops@example.com",
  "approved_at": "2026-04-22T05:20:21Z"
}
```

| Field | Type | Required | V1.1 behavior |
|-------|------|----------|---------------|
| `schema_version` | string | yes | Must be `"1.0"` or the serve startup fails with exit 1 |
| `mode` | `"describe-only"` \| `"dry-run"` | yes | `"describe-only"` is a no-op (identical to V1 without `--policy`); `"dry-run"` enables argument validation and plan emission |
| `allowed_capabilities` | string[] \| null | no | When present, plans are only produced for the listed compiled tool names; other names fall back to describe-only responses even under `dry-run` |
| `reviewer` | string \| null | no | Echoed into `dry_run_plan.policy.reviewer` for audit; never used for authz |
| `approved_at` | string (ISO-8601 UTC) \| null | no | Echoed into `dry_run_plan.policy.approved_at`; never used for authz |

### CLI surface additions

- `tusq serve --policy <path>`
- If `--policy` is set and the file is missing, unreadable, invalid JSON, has an unsupported `schema_version`, or contains an unknown `mode`, `tusq serve` exits 1 with an actionable message.
- If `--policy` is not set, behavior is byte-for-byte identical to V1 describe-only.

### `tools/call` dry-run response shape

Response body under `mode: "dry-run"` for an approved, allowed capability where argument validation passes:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "name": "get_users_id",
    "description": "Retrieve a specific user by ID — read-only, requires authentication",
    "executed": false,
    "policy": {
      "mode": "dry-run",
      "reviewer": "ops@example.com",
      "approved_at": "2026-04-22T05:20:21Z"
    },
    "dry_run_plan": {
      "method": "GET",
      "path": "/users/42",
      "path_params": { "id": "42" },
      "query": {},
      "body": null,
      "headers": { "Accept": "application/json" },
      "auth_context": { "hints": ["Authorization"], "required": true },
      "side_effect_class": "read",
      "sensitivity_class": "unknown",
      "redaction": { "pii_fields": [], "log_level": "full", "mask_in_traces": false, "retention_days": null },
      "plan_hash": "<SHA-256 hex of canonical plan content>",
      "evaluated_at": "2026-04-22T05:20:22Z"
    },
    "schema": {
      "parameters": { "type": "object", "properties": { "id": { "type": "string" } }, "required": ["id"] },
      "returns": { "type": "object", "additionalProperties": true }
    }
  }
}
```

Agent implications:

- `executed: false` is always present under dry-run mode. Consumers MUST NOT interpret a `dry_run_plan` as evidence of a performed request.
- `plan_hash` is a SHA-256 over a canonical JSON serialization of `{method, path, path_params, query, body, headers}`. Identical inputs produce identical plans. This is the first primitive for future replay, diff, and eval tooling.
- `policy.reviewer` and `policy.approved_at` are audit echoes. They do NOT authorize live execution in V1.1.

Validation failure response (argument does not match `parameters` schema):

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32602,
    "message": "Invalid arguments for tool: get_users_id",
    "data": {
      "validation_errors": [
        { "path": "/id", "reason": "required field missing" }
      ]
    }
  }
}
```

| Error code | Meaning under M20 |
|------------|-------------------|
| `-32601` | Method not found (unchanged from V1) |
| `-32602` | Unknown tool, tool not in `allowed_capabilities`, or invalid arguments under dry-run mode |
| `-32603` | Internal error during plan construction (reserved; MUST NOT surface live-execution error semantics) |

### Approval gate invariants

The approval gate is preserved under M20:

1. Only capabilities with `approved: true` in the manifest appear in `tools/list` (existing V1 behavior, unchanged).
2. `tools/call` on an unapproved or missing capability still returns `-32602`.
3. `mode: "dry-run"` never relaxes the approval gate. `allowed_capabilities` is a strict subset filter on top of the approval gate, not a replacement for it.
4. Unapproved capabilities cannot be dry-run validated, even with a permissive policy file.

### Argument validation rules

Under `mode: "dry-run"`, arguments at `params.arguments` are validated against the approved compiled tool's `parameters` schema:

- `required` array is enforced; each missing field produces one `validation_errors` entry with `path: "/<field>"` and `reason: "required field missing"`.
- `type` is enforced for primitive types (`string`, `number`, `integer`, `boolean`); mismatches produce `reason: "expected <type>, got <actual>"`.
- Unknown top-level properties are rejected when the schema declares `additionalProperties: false`; tolerated otherwise (matches the V1 permissive default of `additionalProperties: true`).
- Path params extracted by M15 into `parameters.properties` are substituted into `dry_run_plan.path` on validation success. Path params are always string-coerced.
- No network validation, no remote schema fetch. Validation runs fully in-process.

### V1.1 limitations

| Limitation | V1.1 behavior | Deferred to |
|------------|---------------|-------------|
| Live execution | No outbound HTTP, DB, or socket I/O under any policy mode | Later increment past V1.1 |
| Confirm and approve ladders | No interactive confirmation or run-time approval on serve | Later increment |
| Policy authoring UX | Policy file is human-authored; no `tusq policy` CLI | V2 |
| Policy diff and history | No policy version hash chain or diff command | V2 |
| Schema validation depth | Only required-fields, primitive types, and `additionalProperties: false` rejection; no format/enum/oneOf/regex | V2 |
| Authentication checks | `auth_context` is echoed; no real identity binding | V2 |

### Pipeline propagation

```
tusq.manifest.json (approved capabilities, schemas, governance)
       │
       ▼
tusq-tools/*.json (compiled tools for approved capabilities only)
       │
       ▼                                  .tusq/execution-policy.json  (opt-in operator artifact)
MCP server responses ───── merges policy ─────────────┘
       │
       ├── describe-only (default or mode="describe-only")      → V1 shape unchanged
       └── dry-run       (mode="dry-run" + arguments present)   → adds `dry_run_plan`, `executed: false`, `policy`
```

The policy file is a **governance artifact**: review it like a manifest. No policy is required to run `tusq serve`; the default is V1 describe-only. Adoption is explicit, not implicit.

### Docs and tests required before implementation

- `website/docs/cli-reference.md` — document `tusq serve --policy <path>` and update exit-code table.
- `website/docs/execution-policy.md` (new) — policy file shape, modes, allowed_capabilities semantics, dry-run response example, validation error example, invariants.
- `website/docs/mcp-server.md` — add dry-run section alongside the existing describe-only documentation.
- `tests/smoke.mjs` — add policy-off (describe-only unchanged), policy-on dry-run success, and validation-failure scenarios; assert `executed: false`, `plan_hash` determinism, and error `data.validation_errors` shape.
- `tests/evals/governed-cli-scenarios.json` — add a dry-run scenario asserting plan shape and one asserting unapproved capabilities stay invisible under dry-run policy.
- `README.md` — add the `--policy` flag to the CLI reference table.

## M21: Execution Policy Scaffold Generator

### Purpose

M20 shipped `tusq serve --policy <path>` and specified the `.tusq/execution-policy.json` shape, but it left operators hand-authoring a governance artifact whose schema they have to derive from SYSTEM_SPEC.md. That is a VISION-breaking friction point: the product must "treat manual manifest authoring as a failure of the engine, not a feature" (VISION.md line 74). By extension, manual authoring of the policy artifact that controls the serve path is also a failure of the engine.

M21 adds a single, local-only CLI command — `tusq policy init` — that generates a valid policy file for the operator. The command does not touch the network, the manifest, or the target product. It writes one JSON file under the repo root, and that file is guaranteed to pass `loadAndValidatePolicy()` (the same validator `tusq serve --policy` invokes at startup).

### Scope Boundary

M21 is deliberately narrow:

- **In scope (V1.2):** scaffold a valid `.tusq/execution-policy.json` file, optionally override `mode`, `reviewer`, `allowed_capabilities`, and output path, support `--force`, `--dry-run`, and `--json` flags.
- **Out of scope (V1.2):** no interactive wizard; no inspection of `tusq.manifest.json` to propose `allowed_capabilities` values; no rotating-reviewer workflows; no encrypted storage; no multi-environment policy profiles (`--env dev`/`--env prod`); no policy migration from older schema versions (there are none yet); no live API execution under any code path.

The V1.2 limitations table below enumerates these explicitly so the dev turn cannot overreach into V2 territory.

### `tusq policy init` Command Shape

Synopsis:

```
tusq policy init [--mode <describe-only|dry-run>]
                 [--reviewer <id>]
                 [--allowed-capabilities <name,name,...>]
                 [--out <path>]
                 [--force]
                 [--dry-run]
                 [--json]
                 [--verbose]
```

Exit codes:

| Exit | Meaning |
|------|---------|
| `0` | File was written (or would have been written, under `--dry-run`) |
| `1` | Any failure condition in the failure UX table below |

Default behavior (no flags): write `.tusq/execution-policy.json` with `schema_version: "1.0"`, `mode: "describe-only"`, reviewer resolved via env-chain (`TUSQ_REVIEWER` → `USER` → `LOGNAME` → `"unknown"`), `approved_at` set to the current ISO-8601 UTC timestamp at generation time, and no `allowed_capabilities` field (meaning "all approved capabilities in scope"). Parent directory `.tusq/` is created with `{ recursive: true }` if it does not already exist.

### Generated Policy File Shape

The generated file is a strict subset of the M20 policy schema. No new fields are introduced in V1.2.

| Field | Required | V1.2 Default | Notes |
|-------|----------|--------------|-------|
| `schema_version` | yes | `"1.0"` | Hard-coded; must match `SUPPORTED_POLICY_VERSIONS` in `loadAndValidatePolicy()` |
| `mode` | yes | `"describe-only"` | Controlled by `--mode`; any value outside `{describe-only, dry-run}` exits 1 before any file write |
| `reviewer` | yes | Env-chain resolved identity | Controlled by `--reviewer`; never empty string — empty string exits 1 |
| `approved_at` | yes | ISO-8601 UTC generation time | Always stamped at generation; not overridable from CLI |
| `allowed_capabilities` | no | omitted | Controlled by `--allowed-capabilities <a,b,c>`; list is trimmed and de-duplicated in declaration order; empty list or list containing an empty token exits 1 |

The file is written with `JSON.stringify(policy, null, 2)` followed by a trailing newline, matching the formatting convention of `tusq approve` writes so that line-diff tooling stays sensible.

### `tusq policy init` Failure UX

| Failure | User sees | Side effect |
|---------|-----------|-------------|
| Unknown `--mode` value | `Unknown policy mode: <value>. Allowed: describe-only, dry-run` | No file written |
| Empty or missing `--reviewer` value | `Invalid reviewer: reviewer identity cannot be empty` | No file written |
| Empty or malformed `--allowed-capabilities` | `Invalid allowed-capabilities: list cannot be empty or contain empty names` | No file written |
| Target file exists without `--force` | `Policy file already exists: <path>. Re-run with --force to overwrite.` | No file written |
| Unwritable target path (permission or EISDIR) | `Could not write policy file: <path>: <errno message>` | No file written (or partial write is caught and message includes path) |
| Unknown flag | Standard CLI error: `Unknown option: <flag>` | No file written |

Every failure message ends in an actionable next step (re-run with a flag, fix the value). Error messages are written to `stderr` and the process exits `1`.

### `tools/call` and MCP Surface — Unchanged

M21 adds a generator command only. The MCP server behavior, the M20 dry-run response shape, the `executed: false` invariant, and the approval-gate filter are all unchanged. A generated policy file is indistinguishable, from `tusq serve --policy`'s perspective, from a hand-authored one. This is the stability contract M21 guarantees.

### V1.2 Limitations

| Limitation | Rationale | V2 Plan |
|------------|-----------|---------|
| No interactive prompt when `allowed_capabilities` is omitted | Avoids coupling `policy init` to TTY state; keeps CI usage trivial | V2 may add `--interactive` if operator telemetry shows it is needed |
| Does not read `tusq.manifest.json` to auto-suggest `allowed_capabilities` | Keeps the generator's file surface minimal and decoupled from manifest I/O | V2 `tusq policy suggest` can read the manifest and propose an initial scoped list |
| No policy migration | There is only one schema version (`"1.0"`); nothing to migrate | V2 `tusq policy migrate` when a `1.1` schema ships |
| No per-environment profiles | `--out` is sufficient for operators that want multiple policy files | V2 may add `--profile dev|prod` with a dedicated directory layout |
| No signature or checksum field on the generated file | Operators audit via git history in V1 | V2 signed-policy roadmap is tracked in the governance ladder, not M21 |

### Approval-Gate Invariant Preservation

M21 does not alter the approval-gate invariant set first stated in the M20 section of this spec. For clarity:

1. `tools/list` continues to filter by `approved: true` on the source manifest regardless of whether a policy file was generated by `tusq policy init`.
2. `allowed_capabilities`, when present in a generated policy, is a **strict subset filter** layered on top of approval. The generator never writes an `allowed_capabilities` entry for an unapproved capability name; names are accepted verbatim from the CLI, and a mismatch between `--allowed-capabilities` and the manifest is a run-time concern surfaced by `tusq serve --policy`, not a policy-generation-time concern.
3. `tusq policy init` performs no outbound I/O. It cannot leak capability names, manifest state, or reviewer identity beyond the local filesystem.

### Pipeline Propagation

```
tusq policy init
   └─ writes: .tusq/execution-policy.json (local file)

tusq serve --policy .tusq/execution-policy.json
   └─ reads: loadAndValidatePolicy(path)   # unchanged from M20
   └─ serves: tools/list (approved-only)   # unchanged from M20
              tools/call (dry-run plan under mode: "dry-run") # unchanged from M20
```

M21 inserts no new pipeline stage. It only adds a local file producer whose output is consumed, unchanged, by the M20 serve path.

### Docs and Tests Required Before Implementation

- `README.md` — add `policy init` to the CLI reference table; add a three-line example showing the default invocation.
- `website/docs/cli-reference.md` — add a `policy init` subsection with synopsis, options table, and failure UX table mirroring this spec.
- `website/docs/execution-policy.md` — insert an "Authoring a policy file" section that recommends `tusq policy init` as the default path and preserves the hand-authoring description as an advanced alternative.
- `tests/smoke.mjs` — add coverage for: default generation (asserts file exists, `schema_version: "1.0"`, `mode: "describe-only"`), `--mode dry-run` effect on generated file, `--allowed-capabilities a,b` produces exact array `["a", "b"]`, `--force` overwrite behavior, exit-1 on pre-existing file without `--force`, `--dry-run` prints to stdout without creating the target file, and a round-trip that generates a file and then starts `tusq serve --policy <generated path>` (or calls `loadAndValidatePolicy()` directly) to confirm the generated file is accepted.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario asserting that a generated dry-run policy produces the same `dry_run_plan` shape on `tools/call` as a hand-authored policy would, preventing generator drift.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-064 through REQ-069 acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M22: Execution Policy Verifier (Standalone Validator)

### Purpose

M20 shipped `tusq serve --policy <path>` and an in-process `loadAndValidatePolicy()` validator. M21 shipped `tusq policy init` to stop operators from hand-authoring the policy artifact. The remaining governance gap is that a policy file, once generated or edited, can only be validated by starting a live MCP server — a heavy, stateful action that is hostile to CI, pre-commit hooks, and headless review workflows. If a policy file drifts into invalidity (a manual edit, a merge resolution, a schema bump), the breakage surfaces at `tusq serve` startup — which is typically later than it should.

M22 adds exactly one new local-only subcommand, `tusq policy verify`, that runs the same `loadAndValidatePolicy()` the serve path runs, but as a pure validator: no server, no port bind, no MCP handshake, no target-product I/O. The command's entire purpose is to let a reviewer, a pre-commit hook, or a CI job answer the question "would `tusq serve --policy <path>` accept this file today?" without paying the cost of actually starting the server.

### Scope Boundary

M22 is deliberately narrow:

- **In scope (V1.3):** expose `loadAndValidatePolicy(path)` as a standalone `tusq policy verify` subcommand; support `--policy <path>`, `--json`, and `--verbose` flags; emit the same startup-failure messages `tusq serve --policy` emits, identically worded.
- **Out of scope (V1.3):** no additional validation depth (no format/enum/oneOf/regex/regex-for-capability-names); no auto-fix; no migrate; no cross-referencing `.tusq/execution-policy.json` against `tusq.manifest.json` to validate that `allowed_capabilities` actually name approved capabilities (that is V2 `tusq policy verify --strict` territory and requires manifest I/O the command is intentionally avoiding in V1.3); no signed-policy verification; no network I/O of any kind; no target-product I/O of any kind.

Everything the verifier rejects today must be something `tusq serve --policy` would also reject; everything the verifier accepts today must be something `tusq serve --policy` would also accept. No divergence is allowed under V1.3.

### `tusq policy verify` Command Shape

Synopsis:

```
tusq policy verify [--policy <path>]
                   [--json]
                   [--verbose]
```

Exit codes:

| Exit | Meaning |
|------|---------|
| `0` | Policy file was read, parsed, and accepted by `loadAndValidatePolicy()` |
| `1` | Any failure from `loadAndValidatePolicy()` or surrounding I/O (missing file, unreadable, bad JSON, unsupported `schema_version`, unknown `mode`, invalid `allowed_capabilities`) |

Default behavior (no flags): read `.tusq/execution-policy.json` from the current working directory, call `loadAndValidatePolicy(path)`, and on success print a one-line human summary to stdout (`Policy valid: <path> (mode: <mode>, reviewer: <reviewer>, allowed_capabilities: <count|unset>)`) and exit 0. On failure, write the validator's error message to stderr (byte-for-byte identical to the `tusq serve --policy` startup failure for the same input) and exit 1.

### `tusq policy verify` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--policy <path>` | Path to the execution-policy file to validate | `.tusq/execution-policy.json` |
| `--json` | Emit a machine-readable result object to stdout instead of the human summary | Human-readable summary |
| `--verbose` | Print the resolved path and validator diagnostics to stderr | Disabled |

### `tusq policy verify` JSON Output Shape

On success (exit 0), with `--json`:

```
{
  "valid": true,
  "path": "<resolved policy path>",
  "policy": {
    "schema_version": "1.0",
    "mode": "describe-only" | "dry-run",
    "reviewer": "<string>",
    "approved_at": "<ISO-8601 UTC>",
    "allowed_capabilities": null | ["<name>", ...]
  }
}
```

On failure (exit 1), with `--json`:

```
{
  "valid": false,
  "path": "<resolved policy path>",
  "error": "<same message written to stderr without --json>"
}
```

The non-`--json` path uses stdout for success and stderr for failure, matching the existing tusq CLI convention. With `--json`, the JSON object goes to stdout in both cases (so tooling can always parse stdout), and exit code is the authoritative success signal.

### `tusq policy verify` Failure UX

Every failure message must match the corresponding `tusq serve --policy` startup failure verbatim. This is the core M22 contract: a policy that fails `verify` fails `serve`, with the same words, and vice-versa.

| Failure | User sees (both `serve --policy` and `policy verify`) |
|---------|---------|
| `--policy` path missing or ENOENT | `Policy file not found:` followed by the path |
| Policy file unreadable (permissions, I/O error after the ENOENT check) | `Could not read policy file:` followed by the path and the OS error message |
| Policy file is not valid JSON | `Invalid policy JSON at:` followed by the path and parser message |
| Policy parses but is not a JSON object (array, `null`, or primitive) | `Invalid policy JSON at:` followed by the path and the literal suffix `: expected object` |
| Unsupported `schema_version` | `Unsupported policy schema_version:` followed by the value and the list of supported versions |
| Unknown `mode` | `Unknown policy mode:` followed by the value and the list of allowed modes |
| `allowed_capabilities` is not an array of strings | `Invalid allowed_capabilities in policy:` followed by the offending value |

If a future validation rule is added to `loadAndValidatePolicy()` for any reason, `tusq policy verify` picks it up automatically because both paths share the same validator. This is enforced by a smoke-test parity check (see Docs and Tests below).

### `tusq policy verify` Local-Only Invariants

| Invariant | How it shows up at the CLI |
|-----------|----------------------------|
| No server startup | `tusq policy verify` never binds a TCP port, never opens a socket; it runs synchronously and exits |
| No network I/O | No HTTP, DB, MCP handshake; operators can run it with networking disabled |
| No manifest read | `tusq.manifest.json` is never opened; the verifier is a pure policy-file validator in V1.3 |
| No target-product call | The verifier never invokes a compiled tool, never executes a dry-run plan |
| Validator parity | `tusq policy verify` and `tusq serve --policy` share `loadAndValidatePolicy()`; a smoke test asserts identical accept/reject behavior |

### Pipeline Propagation

```
tusq policy init
   └─ writes: .tusq/execution-policy.json                         # M21

tusq policy verify .tusq/execution-policy.json
   └─ reads:  loadAndValidatePolicy(path)                         # M22; pure validator
   └─ emits:  stdout summary or JSON; exit 0 or 1                 # M22

tusq serve --policy .tusq/execution-policy.json
   └─ reads:  loadAndValidatePolicy(path)                         # M20; unchanged, shared validator
   └─ serves: tools/list (approved-only), tools/call (policy mode)# M20
```

M22 inserts no new pipeline stage between `init` and `serve`; it inserts a *sibling* validator path that any CI or pre-commit workflow can call before `serve` is invoked. The shared validator contract guarantees that passing `verify` is equivalent to clean `serve --policy` startup.

### V1.3 Limitations

| Limitation | Rationale | V2 Plan |
|------------|-----------|---------|
| No format/enum/oneOf/regex validation | Matches the M20 V1.1 validation depth; raising depth here would make `verify` accept files that `serve` rejects or vice-versa | V2 raises the shared validator; both `verify` and `serve` pick up the new rule simultaneously |
| Does not read `tusq.manifest.json` to cross-check `allowed_capabilities` against approved capabilities | Keeps V1.3 strictly a *policy-file* validator, matches the M21 scope boundary | V2 `tusq policy verify --strict` can read the manifest and flag `allowed_capabilities` names that do not exist or are unapproved |
| No signed-policy / integrity check | No signing ships yet | V2 signed-policy roadmap is tracked in the governance ladder, not M22 |
| No auto-fix or migrate | V1.3 is intentionally read-only; it cannot change the policy file | V2 `tusq policy migrate` when a `1.1` schema ships |
| No exit-code flag for "warn only" | M22 is a hard gate or nothing | V2 may add `--warn-only` if operator telemetry shows a need |

### Approval-Gate Invariant Preservation

M22 does not alter the approval-gate invariant set first stated in the M20 section. For clarity:

1. `tools/list` continues to filter by `approved: true` on the source manifest regardless of whether a policy file was verified by `tusq policy verify`.
2. `tusq policy verify` does not read, touch, or opine on the manifest in V1.3. A passing `verify` is a statement about the policy file alone; it is *not* a statement that `allowed_capabilities` point to real or approved capabilities.
3. `tusq policy verify` performs no outbound I/O. It cannot leak capability names, reviewer identity, or policy content beyond the local filesystem and stdout/stderr.

### Validator Parity Contract

A dedicated smoke/eval scenario enforces that for every failing fixture (`empty-file.json`, `bad-schema-version.json`, `bad-mode.json`, `bad-allowed-capabilities.json`), `tusq policy verify` and `tusq serve --policy` exit the same way and print the same message. If a future validator change breaks parity, the smoke test fails before merge. This is the single most important contract M22 ships: **a policy that passes `verify` must start `serve`; a policy that fails `verify` must fail `serve` startup with the same message.**

### Docs and Tests Required Before Implementation

- `README.md` — add `policy verify` to the CLI reference table; add a two-line example showing the default invocation and a CI exit-code use case.
- `website/docs/cli-reference.md` — add a `policy verify` subsection with synopsis, options table, exit-code table, and a JSON-output example mirroring this spec.
- `website/docs/execution-policy.md` — insert a "Verifying a policy file" section that recommends `tusq policy verify` as the pre-serve / pre-commit / CI step; link it from the `tusq serve --policy` walkthrough and from the `tusq policy init` walkthrough.
- `tests/smoke.mjs` — add coverage for: (1) successful verification of a default-generated policy (round-trip `policy init` → `policy verify`), (2) exit-1 on missing file, (3) exit-1 on malformed JSON, (4) exit-1 on unsupported `schema_version`, (5) exit-1 on unknown `mode`, (6) exit-1 on non-array `allowed_capabilities`, (7) `--json` success shape matches the spec (valid, path, policy fields), (8) `--json` failure shape matches the spec (valid:false, path, error), (9) parity: every failure fixture exits 1 under BOTH `tusq policy verify --policy <fixture>` and `tusq serve --policy <fixture>` with byte-identical error messages.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario asserting that `tusq policy verify` exit codes and `--json` output remain stable across a round-trip from `tusq policy init` (prevents drift between generator, verifier, and validator).

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-070 through REQ-075 acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M23: Opt-In Strict Policy Verifier (Manifest-Aware)

### Purpose

M22 shipped `tusq policy verify` as a pure *policy-file* validator: given a path, does `loadAndValidatePolicy()` accept it, exactly as `tusq serve --policy` would at startup? That is a necessary but not sufficient governance check. A policy file can be internally valid yet still misaligned with the manifest the serve path will actually consult — for example, when `allowed_capabilities` names a capability that does not exist in `tusq.manifest.json`, or names one that exists but is `approved: false`, or one whose `review_needed: true` flag is still set. In those cases, `tusq serve --policy` will start successfully, `tools/list` will silently drop the unapproved or missing capability, and an operator's reviewer-level least-privilege expectation is quietly violated — the policy looked tight but the manifest never supported it.

M23 closes that gap with a single opt-in flag on the existing `tusq policy verify` subcommand: `--strict`. When set, the verifier additionally reads `tusq.manifest.json` (or a path passed via `--manifest <path>`) and cross-references every name in the policy's `allowed_capabilities` array against the manifest's approval-gated set. The check is strictly read-only: it introduces one additional local filesystem read and zero new I/O classes.

### Scope Boundary

M23 is deliberately narrow:

- **In scope (V1.4):** one new flag (`--strict`) and one supporting flag (`--manifest <path>`, consulted only under `--strict`) on the existing `tusq policy verify` subcommand. Under `--strict`, every name listed in `allowed_capabilities` is cross-checked against the manifest for existence, `approved: true`, and absence of `review_needed: true`. Default (`--strict` absent) behavior is byte-for-byte identical to M22.
- **Out of scope (V1.4):** no manifest-freshness check (no `previous_manifest_hash` chaining, no `manifest_version` ladder enforcement); no capability-schema quality check; no dry-run plan execution under `--strict`; no network I/O of any kind; no target-product I/O of any kind; no `tusq policy audit` / multi-source governance report (reserved for a future increment); no auto-fix or `--fix` flag; no strict-by-default escalation.

Strict mode is additive and opt-in. Everything default `tusq policy verify` rejects, `tusq policy verify --strict` also rejects; strict mode adds additional rejection cases on top of the M22 validator, never relaxes them.

### `tusq policy verify --strict` Command Shape

Synopsis (extended from M22):

```
tusq policy verify [--policy <path>]
                   [--strict [--manifest <path>]]
                   [--json]
                   [--verbose]
```

Flag evaluation order (enforced by dev implementation):

1. Parse flags. If `--manifest` is set without `--strict`, exit 1 with `--manifest requires --strict` and do not read any file. (This guard keeps the flag semantics unambiguous and prevents a future drift where `--manifest` gets silently repurposed.)
2. Run the M22 policy-file validator via `loadAndValidatePolicy(policyPath)`. If it fails, exit 1 with the M22 message exactly as before. Strict checks are NOT run on a policy that fails M22 validation — the operator's first fix is the policy file, not the manifest.
3. If `--strict` is set, resolve the manifest path (default `tusq.manifest.json`; overridable via `--manifest <path>`), read the manifest, and run strict checks as defined below. On any strict check failure, exit 1.
4. On success (M22 validator accepts the policy AND, if `--strict`, every strict check passes), emit the appropriate success output and exit 0.

Exit codes:

| Exit | Meaning |
|------|---------|
| `0` | Policy file passed `loadAndValidatePolicy()`; AND, if `--strict` was set, all strict checks passed |
| `1` | M22 validator rejected the policy, OR a strict check rejected the policy, OR `--manifest` was supplied without `--strict`, OR (strict-mode only) the manifest file was missing or unreadable or not valid JSON |

### `tusq policy verify` Options (extended for M23)

| Option | Description | Default |
|--------|-------------|---------|
| `--policy <path>` | Path to the execution-policy file to validate | `.tusq/execution-policy.json` |
| `--strict` | Additionally cross-reference `allowed_capabilities` against the manifest | Disabled (default is M22 behavior) |
| `--manifest <path>` | Path to the manifest file consulted under `--strict` | `tusq.manifest.json` |
| `--json` | Emit a machine-readable result object to stdout (extended shape under `--strict`) | Human-readable summary |
| `--verbose` | Print the resolved policy path, manifest path (if `--strict`), and diagnostics to stderr | Disabled |

### Strict Check Rules

Given a policy with `allowed_capabilities` = `N` (an array or `null`):

| Case | Behavior |
|------|----------|
| `N` is `null` / unset | Strict check passes trivially. Unset semantically means "all approved capabilities in the manifest are allowed," which is by definition manifest-aligned. (This matches the M20 `tools/list` filter semantics.) |
| `N` is an empty array | Strict check passes trivially. The policy authorizes zero capabilities; no misalignment is possible. |
| `N` is a non-empty array | For each name in `N`, the manifest MUST contain a capability whose `name` field equals that string, that capability MUST have `approved: true`, and that capability MUST NOT have `review_needed: true`. Strict errors are collected in deterministic order (the order in which names appear in `N`), not deduplicated across rules (a single name can fail multiple rules, producing multiple strict errors). |

### `tusq policy verify --strict` Failure UX

Strict-mode failure messages are new (they describe a new failure class and therefore cannot inherit from M22). The M22 parity contract applies only to policy-file validation; strict checks are a distinct governance boundary and `tusq serve --policy` does NOT enforce them (serve silently drops unlisted capabilities via `tools/list`, which is the M20 contract and MUST be preserved).

| Failure | User sees |
|---------|-----------|
| `--manifest` supplied without `--strict` | `--manifest requires --strict` |
| `--strict` set but manifest file missing | `Manifest not found:` followed by the resolved manifest path |
| `--strict` set but manifest file unreadable | `Could not read manifest file:` followed by the path and the OS error message |
| `--strict` set but manifest file is not valid JSON | `Invalid manifest JSON at:` followed by the path and parser message |
| `--strict` set but manifest has no `capabilities` array | `Invalid manifest shape at:` followed by the path and the literal suffix `: missing capabilities array` |
| Strict: allowed capability not present in manifest | `Strict policy verify failed: allowed capability not found in manifest:` followed by the name |
| Strict: allowed capability present but `approved: false` | `Strict policy verify failed: allowed capability not approved:` followed by the name |
| Strict: allowed capability present and approved but `review_needed: true` | `Strict policy verify failed: allowed capability requires review:` followed by the name |

Multiple strict failures for different names produce one message line per failure, emitted to stderr (or included in the `strict_errors` array under `--json`), in the order the names appear in `allowed_capabilities`.

### `tusq policy verify --strict` JSON Output Shape

On success (exit 0), with `--strict --json`:

```
{
  "valid": true,
  "strict": true,
  "path": "<resolved policy path>",
  "manifest_path": "<resolved manifest path>",
  "manifest_version": <integer>,
  "policy": {
    "schema_version": "1.0",
    "mode": "describe-only" | "dry-run",
    "reviewer": "<string>",
    "approved_at": "<ISO-8601 UTC>",
    "allowed_capabilities": null | ["<name>", ...]
  },
  "approved_allowed_capabilities": <integer>
}
```

Where `approved_allowed_capabilities` is the count of names in `allowed_capabilities` that passed strict checks (equal to `allowed_capabilities.length` on success, or `null` when `allowed_capabilities` is itself `null`/unset).

On failure (exit 1), with `--strict --json`:

```
{
  "valid": false,
  "strict": true,
  "path": "<resolved policy path>",
  "manifest_path": "<resolved manifest path or null if manifest I/O failed before read>",
  "error": "<same message written to stderr for the first failure>",
  "strict_errors": [
    {"name": "<capability name>", "reason": "not_in_manifest" | "not_approved" | "requires_review"}
  ]
}
```

On an M22-level rejection (policy-file validator failed), `strict` is `true` only when `--strict` was supplied; `strict_errors` is an empty array because strict checks never ran. The `error` field and behavior are identical to the M22 `--json` failure shape for that case.

### `tusq policy verify --strict` Local-Only Invariants

| Invariant | How it shows up at the CLI |
|-----------|----------------------------|
| No server startup | `tusq policy verify --strict` never binds a TCP port, never opens a socket; it runs synchronously and exits |
| No network I/O | No HTTP, DB, MCP handshake; operators can run it with networking disabled |
| Filesystem reads are bounded | Exactly two files are read under `--strict`: the policy file and the manifest file. No scan file, no compiled tools, no `.git/`, no external includes |
| No target-product call | The verifier never invokes a compiled tool, never executes a dry-run plan |
| No manifest writes | The manifest is read-only under `--strict`; no field is mutated, no approval is recorded, no `capability_digest` is re-computed |
| Default behavior unchanged | With `--strict` absent, no manifest I/O occurs even if `tusq.manifest.json` exists at the default path; M22 behavior is preserved byte-for-byte |

### Pipeline Propagation

```
tusq manifest                                                         # existing
   └─ writes: tusq.manifest.json                                      # approval-gated set lives here

tusq approve <name> [--all]                                           # existing
   └─ writes: tusq.manifest.json capabilities[*].approved=true       # approval gate

tusq policy init
   └─ writes: .tusq/execution-policy.json                             # M21

tusq policy verify .tusq/execution-policy.json
   └─ reads:  loadAndValidatePolicy(path)                             # M22; pure policy-file validator

tusq policy verify --strict .tusq/execution-policy.json
   └─ reads:  loadAndValidatePolicy(path)                             # M22; pure policy-file validator
   └─ reads:  tusq.manifest.json (or --manifest <path>)               # M23; manifest-aware cross-reference
   └─ emits:  stdout summary or JSON; exit 0 or 1                     # M23

tusq serve --policy .tusq/execution-policy.json
   └─ reads:  loadAndValidatePolicy(path)                             # M20; unchanged, shared validator
   └─ serves: tools/list (approved-only), tools/call (policy mode)    # M20
```

M23 inserts no new pipeline stage; it extends the M22 sibling validator with an opt-in manifest-aware branch. Default `tusq policy verify` is still the pure policy-file path.

### V1.4 Limitations

| Limitation | Rationale | V2 Plan |
|------------|-----------|---------|
| No manifest freshness / hash-chain check | Adding `previous_manifest_hash` validation here would couple strict verify to version-history semantics that `tusq diff` already owns; keeping concerns separate preserves each command's contract | V2 `tusq policy audit` can compose strict verify + diff + eval into one multi-source report |
| No execution reachability probe | Violates the local/offline invariant; a PASS is an alignment statement, not an execution-safety statement | Reserved for a hosted / opt-in operator tier, never for the local CLI |
| No `--fix` or auto-remediation | V1.4 is read-only by design; mutating the policy file during verify would make the command a writer and break the single-responsibility shape | V2 may add `tusq policy migrate` when a `1.1` schema ships |
| No strict-by-default escalation | Would silently break every M22 CI caller and couple verify to filesystem state (manifest presence); Constraint 11 forbids this | V2 may expose an operator-level default via a separate config, never via command drift |
| No warning / advisory output when strict is off but manifest exists | Clutters stdout/stderr for a correctly-scoped default case and muddies exit-code semantics | If operator telemetry ever justifies it, a `--warn-strict` opt-in flag is the right shape, not a default |

### Approval-Gate Invariant Preservation

M23 does not alter the approval-gate invariant set first stated in the M20 section. For clarity:

1. `tools/list` continues to filter by `approved: true` on the source manifest regardless of whether `tusq policy verify --strict` passed, failed, or was never run.
2. A passing `tusq policy verify --strict` is NOT authorization to execute any capability, and is NOT a substitute for `tools/list`'s at-serve-time approval filter. Strict mode is a reviewer-time alignment check, not a runtime gate.
3. A failing `tusq policy verify --strict` does NOT prevent `tusq serve --policy` from starting successfully with the same policy file — M23 does not change the serve path, and `tusq serve --policy` continues to silently drop unlisted/unapproved capabilities from `tools/list` as specified in M20. Strict verify is a CI/review-layer gate, not a serve-startup gate.
4. `tusq policy verify --strict` performs no outbound I/O. It cannot leak capability names, reviewer identity, policy content, or manifest content beyond the local filesystem and stdout/stderr.

### Validator Parity Contract (Extended)

The M22 validator-parity contract (every M22 rejection message is byte-identical between `tusq policy verify` and `tusq serve --policy`) is preserved verbatim under M23: strict mode runs strictly AFTER M22 validation, so the M22 error surface is unchanged. Strict-mode failure messages are NOT part of the M22 parity contract — `tusq serve --policy` does not perform strict checks and never will under V1.4, and strict-mode messages are distinct strings documented in the failure UX table above.

A dedicated smoke/eval scenario enforces two parity invariants:

1. **M22 parity preserved:** every M22 failure fixture still produces byte-identical messages across `tusq policy verify`, `tusq policy verify --strict` (when M22 validation fails first), and `tusq serve --policy`.
2. **Strict determinism:** repeated `tusq policy verify --strict` runs on the same policy and manifest produce identical exit codes, identical stdout, and identical `strict_errors` ordering. No nondeterminism is permitted.

### Docs and Tests Required Before Implementation

- `README.md` — add `policy verify --strict` to the CLI reference description; add a two-line example showing the strict invocation and the forbidden framing ("alignment check, not a runtime safety gate").
- `website/docs/cli-reference.md` — add a `policy verify --strict` subsection with synopsis, options table, strict-failure table, JSON-output example, and an explicit "what a strict PASS does NOT prove" note.
- `website/docs/execution-policy.md` — insert a "Strict verification (opt-in)" section that recommends `tusq policy verify --strict` as a CI/review-layer gate once a manifest exists; link it from both the `tusq policy init` walkthrough and the `tusq serve --policy` walkthrough; explicitly distinguish policy-file validation from manifest-aware strict validation.
- `tests/smoke.mjs` — add coverage for: (1) default `tusq policy verify` behavior is byte-for-byte identical to M22 even when `tusq.manifest.json` exists (no manifest I/O observed), (2) `--strict` success exit 0 on a generated policy whose `allowed_capabilities` are approved in the manifest, (3) `--strict` exit 1 on allowed-capability absent from manifest with exact failure message, (4) `--strict` exit 1 on allowed-capability present but unapproved, (5) `--strict` exit 1 on allowed-capability present and approved but `review_needed: true`, (6) `--strict` exit 1 when manifest file is missing with `Manifest not found:` message, (7) `--strict` exit 1 when manifest is malformed JSON, (8) `--manifest` without `--strict` exits 1 before any file is read, (9) `--strict --json` success shape matches the spec (valid, strict, path, manifest_path, manifest_version, policy, approved_allowed_capabilities), (10) `--strict --json` failure shape matches the spec (valid:false, strict:true, path, manifest_path, error, strict_errors), (11) `--strict` with `allowed_capabilities` unset passes on a populated manifest, (12) M22 parity: every existing M22 failure fixture still produces identical messages under `tusq policy verify` with and without `--strict`.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario asserting that `tusq policy verify --strict` produces deterministic `strict_errors` ordering across repeated runs on the same fixture (guards against nondeterminism in manifest traversal or Set-based deduplication).

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-075 through REQ-080-ish acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M24: Opt-In Fastify Schema Body-Field Extraction

### Purpose

VISION.md line 72 requires manifests that are "usable on first pass for real codebases, not toy examples." M15 addressed four of the first-pass usability gaps (path parameter extraction, smart domain inference, rich descriptions, honest confidence penalty). One gap remained: a Fastify route can declare a literal JSON-Schema `body` directly in its route-options object, and the V1.4 scanner discards that shape entirely — the existing `schema_hint` boolean detects only *presence* of the keyword `schema:` and never extracts the declared fields. An LLM receiving a manifest generated from a well-schema'd Fastify codebase sees `input_schema: { type: "object", additionalProperties: true }` and has no idea what fields to send, even though the source literally told the scanner which fields are required and what their types are.

M24 closes that gap for the deterministic case: when the Fastify route's `schema` value is a literal object, and the `body` key inside it is a literal object with `properties` and (optionally) `required`, the extractor captures the declared top-level field shapes into the manifest's `input_schema`. No library is imported; no code is evaluated; nothing about non-Fastify extractors changes.

### Scope Boundary

M24 ships exactly one extraction path: literal Fastify `schema.body` → manifest `input_schema.properties` (plus `input_schema.required` and `input_schema.additionalProperties: false`). Everything else is explicitly out of scope for V1.5:

| In-scope for M24 | Out-of-scope for V1.5 |
|------------------|-----------------------|
| Fastify route-options object containing a literal `schema: { body: { properties, required } }` block | Express-validator chain expressions (`body('x').isEmail()`) |
| Top-level primitive types on each property (`string`, `number`, `integer`, `boolean`, `object`, `array`) | Joi / Zod / Yup schema detection |
| Top-level `required` array literal | NestJS class-validator DTO decorators (`@IsEmail()`, `@IsNotEmpty()`) |
| Graceful degradation to M15 behavior on any parse ambiguity | Nested property descent below one level (`properties.address.properties.zip`) |
| Additive confidence bump (+0.04) when extraction succeeds | Format validation (`format: "email"`, `pattern: "^[a-z]+$"`, `enum`, `oneOf`, `anyOf`) |
| Fastify `schema.params` and `schema.querystring` extraction | Runtime validator execution or import |

### Extraction Rules

The Fastify extractor (`extractFastifyRoutes` in `src/cli.js`) runs the following algorithm **in addition to** the existing `schema_hint` detection:

1. Locate the route-options object for each route registration (existing pattern).
2. Within the options object, regex-locate `schema\s*:\s*\{`; if not found, emit no `schema_fields` and fall back to M15 behavior.
3. Balanced-brace-match forward from the `{` to find the end of the schema block; if the braces do not balance within the options block, fall back.
4. Inside the schema block, regex-locate `body\s*:\s*\{`; if not found, fall back.
5. Balanced-brace-match the body block; inside it, regex-locate `properties\s*:\s*\{` and balanced-brace-match the properties block.
6. Within the properties block, iterate top-level `<name>\s*:\s*\{` entries in **source order**. For each entry, balanced-brace-match the value block and extract the `type` string literal (one of `string|number|integer|boolean|object|array`). If no `type` is present, default to `"string"` (the Fastify default for an under-specified property).
7. Within the body block, regex-locate `required\s*:\s*\[` and balanced-bracket-match; parse the resulting array literal for string items.
8. If any step fails parse, the entire `schema_fields` record is dropped — the route falls back to M15 behavior byte-for-byte. Partial extraction is never emitted.

### Pipeline Propagation

```
tests/fixtures/fastify-sample/src/server.ts
   └─ extractFastifyRoutes()                                                 # M24; captures schema_fields when the pattern matches
      └─ finalizeRouteInference()                                            # merges schema_fields.body into input_schema
         └─ buildInputSchema()                                               # flips additionalProperties: false when schema_fields present
            └─ scanObject.routes[i].input_schema { properties, required, source: "fastify_schema_body", additionalProperties: false }
               └─ tusq.manifest.json capability.input_schema                 # same shape; schema_fields is not preserved, only the merged input_schema
                  └─ tusq-tools/*.json parameters                            # inherits the merged shape; agents see real field names
                     └─ MCP tools/list                                       # agents see real field names on callable tools
```

No new artifact shape is introduced. `schema_fields` lives only on the in-memory route record during manifest generation; the persisted artifact is the existing `input_schema` shape, now populated with real field names for Fastify routes that declare them.

### Confidence Model Extension

The existing `scoreConfidence()` branches are preserved verbatim. One additive branch is added: when `schema_fields` is captured, score += 0.04 (capped at 0.95). The existing `+0.14` for `schema_hint` is unchanged. A route with both a schema hint and captured schema fields therefore gains +0.18 total from the schema signal, reflecting the stronger grounding.

Routes without `schema_fields` capture the existing confidence behavior byte-for-byte.

### Source Metadata Tag

The manifest capability's `input_schema.source` field (already present at `src/cli.js:2552`) takes a new enumerated value under M24:

| `input_schema.source` | When emitted | Meaning |
|-----------------------|--------------|---------|
| `fastify_schema_body` | Fastify route with a literal `schema.body` block, successful M24 extraction | The declared body field shapes were captured verbatim from source; `additionalProperties` is `false` |
| `framework_schema_hint` | Fastify/Nest route with a non-extractable `schema:` reference (shared constant, computed object) | Only `schema_hint` was detected; fields are not declared in the manifest; M15/M24 fall-back path |
| `request_body` | Express-style handler body access without a schema declaration | Heuristic shape only; `additionalProperties: true` |

A reviewer can tell at a glance whether the manifest's `input_schema` shape is "what the source declares" or "what the heuristic guessed."

### Default Behavior Preservation Table

| Input | Pre-M24 manifest output | Post-M24 manifest output |
|-------|-------------------------|--------------------------|
| Fastify route with literal `schema.body` | `input_schema: { type: "object", additionalProperties: true, source: "framework_schema_hint" }` | `input_schema: { type: "object", properties: {...}, required: [...], additionalProperties: false, source: "fastify_schema_body" }` |
| Fastify route with `schema: sharedSchema` (non-literal) | `input_schema: { ..., source: "framework_schema_hint" }` | Byte-identical to pre-M24 |
| Fastify route with no `schema:` | `input_schema: { ..., source: "request_body" }` | Byte-identical to pre-M24 |
| Express route (any form) | current `input_schema` | Byte-identical to pre-M24 |
| NestJS route (any form) | current `input_schema` | Byte-identical to pre-M24 |

The only observable manifest change is on Fastify routes whose `schema.body` parses as a literal object with a literal `properties` block.

### Local-Only Invariants

| Invariant | How it shows up during scan/manifest |
|-----------|--------------------------------------|
| No dynamic evaluation | The extractor uses regex + balanced-brace matching on source text; no `require('fastify')`, no `eval`, no `new Function`, no `ts-node` |
| No network I/O | Scanner remains filesystem-only; no downloads, no registry lookups, no telemetry |
| No validator framework import | `src/cli.js` does NOT add a dependency on `ajv`, `fastify`, `@sinclair/typebox`, or any JSON-Schema runtime; M24 ships with zero new `package.json` entries |
| Graceful degradation | Any parse ambiguity falls back to M15 behavior byte-for-byte; partial schema extraction is forbidden |
| Deterministic output | Property key order is source-literal (declaration order); repeated runs produce byte-identical manifests |
| Path param authority | When a Fastify schema body field name collides with an M15 path parameter name, the path parameter wins (path is authoritative URL shape; body is authoritative payload shape) |

### V1.5 Limitations

| Limitation | Rationale | V2 Plan |
|------------|-----------|---------|
| Fastify only | Fastify's `schema` is literal JSON Schema by convention — the only deterministic case in the Node ecosystem. Express-validator, Joi, and Zod require chain-expression or AST parsing that is out of scope for a regex-based extractor | V2 `tusq scan --plugin express-validator` adds express-validator chain inference via an opt-in plugin; Joi/Zod follow the same plugin pattern |
| Body only (no `params`, no `querystring`, no `headers`) | Path params are already M15-extracted into `input_schema.properties`; extracting `schema.params` on top would create duplicate/conflicting shapes. `querystring` and `headers` are lower-value for first-pass usability | V2 may extract `schema.querystring` into a separate `query_schema` field on the capability; `schema.params` stays path-derived |
| Top-level fields only | One level of traversal covers the common case (flat request bodies); nested descent introduces recursion-depth policy and cycle handling that is out of scope for V1.5 | V2 plugin interface can descend deeper with explicit depth limits |
| No format validation | `format`, `pattern`, `enum`, `oneOf`, `anyOf`, `const`, `minLength`, `maxLength` are dropped by V1.5 — only `type` is preserved | V2 extracts the full JSON Schema subset and propagates it through `tools/call` for dry-run argument validation |
| No runtime validator execution | M24 is static-analysis-only; whether the Fastify runtime would actually accept a given payload is not proven by the manifest | V2 dry-run execution (`tusq serve --policy` under a future `mode: "validate"`) can invoke a JSON-Schema validator against the manifest shape |
| No diff-aware re-approval on `input_schema` change | A capability's `capability_digest` already includes `input_schema` (see M13), so an M24-driven shape change will flip the digest and require re-approval; M24 does not ship a one-click "accept new shape" workflow | V2 `tusq approve --schema-changes` may add a targeted approval path for schema-only drift |

### Approval-Gate Invariant Preservation

M24 does not alter the approval-gate invariant set first stated in the M20 section. For clarity:

1. A capability whose `input_schema` changes under M24 (from permissive placeholder to declared-field shape) MUST have its `capability_digest` re-computed; M13 semantics propagate verbatim. A reviewer MUST explicitly re-approve the capability for it to appear in `tools/list`.
2. `tools/list` continues to filter by `approved: true`. A newly-populated `input_schema` does NOT implicitly approve the capability; if approval was previously granted on a less-specific shape, M13 diff detection will surface the change for re-approval.
3. M24 does NOT change `tusq serve` behavior. The `input_schema` is passed through to `tools/list` and `tools/call` unchanged; under `--policy` dry-run, the narrow four-rule validator (see M20) operates against the new shape just as it operated against the old.

### Docs and Tests Required Before Implementation

- `README.md` — add a one-line note under the manifest-format section that Fastify routes with a literal `schema.body` block emit declared field shapes in `input_schema.properties`; name the `fastify_schema_body` source tag explicitly; do NOT use the phrase "validator-backed."
- `website/docs/manifest-format.md` — add a "Fastify schema body extraction" subsection documenting the extraction rules, the `source: "fastify_schema_body"` tag, the `additionalProperties: false` flip, the fall-back semantics when the schema is non-literal, and the V1.5 boundary (Fastify only, body only, top-level only, no format validation).
- `website/docs/frameworks.md` — extend the Fastify row to name "literal `schema.body` extraction" as a captured signal; link to the manifest-format subsection.
- `tests/smoke.mjs` — add coverage for: (a) Fastify route with literal `schema.body` produces `input_schema.properties` with declared field names in declaration order, `additionalProperties: false`, `source: "fastify_schema_body"`; (b) Fastify route with `schema: sharedSchema` (non-literal reference) produces byte-identical output to HEAD `35b7c9c` (M15 fall-back preserved); (c) Fastify route with `schema` present but no `body` key produces M15 fall-back output; (d) Fastify route combining a body schema and a path parameter surfaces both in `input_schema.properties` with path param winning on name collision; (e) Express fixture manifest is byte-identical pre/post-M24; (f) NestJS fixture manifest is byte-identical pre/post-M24; (g) repeated manifest generations on the Fastify fixture produce byte-identical property ordering.
- `tests/fixtures/fastify-sample/src/server.ts` — extend the existing Fastify sample to include at least one route with a literal `schema.body` block exercising `string`, `number`, `boolean` types, a `required` array, and a property name that collides with a path parameter. Add at least one route with `schema: sharedSchema` (non-literal reference) to exercise the fall-back path.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario asserting that the Fastify fixture manifest contains `input_schema.properties` with expected keys in declaration order, `additionalProperties: false` on the Fastify route, and that repeated runs (repeat_runs=3) produce byte-identical property ordering.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-081 through REQ-086-ish acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M25: Static PII Field-Name Redaction Hints

### Purpose

VISION.md lines 167–168 name "detect sensitive fields such as PII, payments, secrets, and regulated data" and "produce redaction and retention defaults" as a V1 data-and-schema-understanding responsibility. M12 added the `capability.redaction` shape with four fields (`pii_fields`, `log_level`, `mask_in_traces`, `retention_days`) but shipped them with permissive defaults — `pii_fields: []`, the other three `null` — deferring inference entirely to V2. That was correct in V1.0 when `input_schema.properties` was empty for most routes.

M15 (path-param extraction) and M24 (Fastify literal `schema.body` extraction) have since populated `input_schema.properties` with real declared field names for a meaningful slice of real SaaS codebases. The deterministic gap is now: every manifest generated against a codebase with declared `email`, `password`, or `ssn` body fields still emits `redaction.pii_fields: []`, even though the key names in `input_schema.properties` are literally telling the scanner which fields are sensitive. A reviewer looking at `tusq.manifest.json` sees `pii_fields: []` on a route that obviously handles PII and has to fix it by hand — the exact failure mode VISION.md line 73 flags ("treat manual manifest authoring as a failure of the engine, not a feature").

M25 closes that gap in the narrowest deterministic zone: match the already-populated `input_schema.properties` keys against a fixed canonical set of well-known PII field names, and populate `redaction.pii_fields` with the matching names in source-declaration order. No value inspection, no regex over source, no new dependency, no new CLI flag, no semantic claim beyond "the field name matches a canonical PII name."

### Scope Boundary

M25 ships exactly one extraction path: `input_schema.properties` keys → `redaction.pii_fields` array via a fixed canonical name set. Everything else is explicitly out of scope for V1.6:

| In-scope for M25 | Out-of-scope for V1.6 |
|------------------|------------------------|
| Whole-key case-insensitive match (normalized by stripping `_`/`-` and lowercasing) against a frozen canonical PII name set | Partial-key / tail-match (e.g., flagging `email_template_id` because it contains `email`) |
| Cross-framework application — same extractor runs against every `input_schema.properties` object regardless of Express/Fastify/NestJS provenance | Nested descent into `properties.address.properties.zip_code` (top-level keys only in V1.6) |
| Deterministic order matching `input_schema.properties` iteration order (source-literal declaration order from M15/M24) | Value inspection, payload sampling, or format-regex inference (e.g., detecting an email by regex on sample data) |
| `capability.redaction.pii_fields` populated as an array of original-case field names | Auto-population of `redaction.log_level`, `mask_in_traces`, or `retention_days` (these stay `null` in V1.6) |
| `capability_digest` re-computation when `redaction.pii_fields` changes (M13 semantics already cover this) | Auto-escalation of `capability.sensitivity_class` on PII match (stays `"unknown"`; explicit V2 increment owns sensitivity inference) |
| Narrow canonical list covering English-language common PII field names | Multi-locale PII names (Spanish, German, Portuguese, Japanese, etc.) — V2 plugin scope |
| Zero new dependencies, static in-memory computation | Runtime PII detection, sampling, or regulatory inference (GDPR/HIPAA/PCI mapping) |

### Canonical PII Name Set (V1.6)

The following set is enumerated explicitly and frozen in `src/cli.js`. All entries are shown in **normalized** form (lowercase, no underscores or hyphens). Match occurs when `key.toLowerCase().replace(/[_-]/g, '')` equals one of the entries.

| Category | Normalized names |
|----------|------------------|
| Email | `email`, `emailaddress`, `useremail` |
| Phone | `phone`, `phonenumber`, `mobile`, `mobilephone`, `telephone` |
| Government ID | `ssn`, `socialsecuritynumber`, `taxid`, `nationalid` |
| Name | `firstname`, `lastname`, `fullname`, `middlename` |
| Address | `streetaddress`, `zipcode`, `postalcode` |
| Date of birth | `dateofbirth`, `dob`, `birthdate` |
| Payment | `creditcard`, `cardnumber`, `cvv`, `cvc`, `bankaccount`, `iban` |
| Secrets | `password`, `passphrase`, `apikey`, `accesstoken`, `refreshtoken`, `authtoken`, `secret` |
| Network | `ipaddress` |

Expansions to this list are material governance events. Any V1.6.x or V2 expansion lands under its own ROADMAP milestone with a fresh re-approval expectation (reviewers re-evaluate affected capabilities via `tusq diff`) and a RELEASE_NOTES entry.

### Extraction Rules

The extractor (`extractPiiFieldHints` in `src/cli.js`) runs after `buildInputSchema()` finishes populating `capability.input_schema.properties`. For each generated capability:

1. If `input_schema.properties` is absent, empty, or not a plain object, return `[]`.
2. Iterate keys in object-insertion order (source-literal declaration order established under M15/M24).
3. For each key, compute `normalized = key.toLowerCase().replace(/[_-]/g, '')`.
4. If `normalized` is in the canonical set, push the **original-case** `key` into the result array.
5. Return the result array. No deduplication (insertion order already guarantees no duplicates from a single `properties` object).

The extractor is a pure function — no filesystem I/O, no side effects. It is invoked once per capability during manifest generation, immediately before `buildRedactionDefaults()` (which supplies the rest of the `redaction` shape).

### Pipeline Propagation

```
input_schema.properties (already populated by M15/M24/heuristic paths)
   └─ extractPiiFieldHints(properties)                                      # M25; pure function, in-memory only
      └─ capability.redaction.pii_fields                                    # populated array, declaration order
         └─ capability_digest (M13)                                         # re-hashed when pii_fields changes
            └─ tusq.manifest.json capability.redaction                      # persisted artifact
               └─ tusq-tools/*.json redaction                               # inherits pii_fields verbatim
                  └─ MCP tools/call redaction                               # agents see pii_fields as advisory metadata
```

No new artifact field is introduced. `redaction.pii_fields` is the existing M12 array; M25 simply supplies a non-empty default for routes whose `input_schema.properties` declares canonical PII names.

### Default Behavior Preservation Table

| Input | Pre-M25 `redaction.pii_fields` | Post-M25 `redaction.pii_fields` |
|-------|--------------------------------|----------------------------------|
| Capability with `input_schema.properties: { email: {...}, password: {...} }` | `[]` | `["email", "password"]` |
| Capability with `input_schema.properties: { user_email: {...}, FIRST_NAME: {...} }` | `[]` | `["user_email", "FIRST_NAME"]` |
| Capability with `input_schema.properties: { email_template_id: {...}, phone_book_url: {...} }` | `[]` | `[]` (whole-key match only) |
| Capability with `input_schema.properties: {}` or absent | `[]` | `[]` |
| Capability with path-param-only `input_schema.properties: { id: {...} }` | `[]` | `[]` (no canonical match) |
| Non-Fastify/Non-Express/Non-NestJS capability with no `input_schema.properties` | `[]` | `[]` |

The only observable manifest change is on capabilities whose `input_schema.properties` contains at least one key whose normalized form is in the canonical set.

### Confidence Model Interaction

M25 does NOT modify `scoreConfidence()`. PII field-name presence is not a confidence signal; it is a redaction signal. A capability with `redaction.pii_fields: ["email"]` has the same confidence score as the same capability without M25.

### Sensitivity Class Interaction

M25 does NOT modify `capability.sensitivity_class`. `sensitivity_class` remains `"unknown"` on every capability in V1.6. Auto-escalating to `"confidential"` or `"restricted"` on PII match would overclaim, because sensitivity is a composite judgment (data class + regulatory scope + organizational posture) that field-name matching alone cannot prove. Sensitivity inference is reserved for an explicit V2 increment.

### Local-Only Invariants

| Invariant | How it shows up during manifest generation |
|-----------|---------------------------------------------|
| No dynamic evaluation | The extractor is a pure function over an already-built `input_schema.properties` object; no `require`, no `eval`, no `new Function` |
| No network I/O | Manifest generation remains filesystem-only; no downloads, no registry lookups, no PII-dictionary fetch |
| No new runtime dependency | `package.json` MUST NOT gain `pii-detector`, `presidio`, `compromise`, or any NLP/PII library; M25 ships with zero new `package.json` entries |
| Graceful degradation | When `input_schema.properties` is absent or empty, `pii_fields: []` (byte-identical to pre-M25) |
| Deterministic output | `pii_fields` order is the iteration order of `input_schema.properties`; repeated runs produce byte-identical arrays |
| Whole-key match only | Partial / substring matches are forbidden; a field named `email_template_id` MUST NOT be flagged |
| No `sensitivity_class` auto-escalation | `sensitivity_class` stays `"unknown"` even when `pii_fields` is non-empty |
| No source-text regex | The extractor never opens or scans source files; it operates exclusively on the in-memory `input_schema.properties` object |

### V1.6 Limitations

| Limitation | Rationale | V2 Plan |
|------------|-----------|---------|
| English-language canonical names only | Covers the dominant real-SaaS case; multi-locale inference would require either a localization dictionary (new dependency) or locale detection (new heuristic) | V2 `tusq scan --plugin pii-multilocale` introduces opt-in localized canonical sets behind a plugin flag; per-language canonical files owned by contributors |
| Top-level keys only (no nested descent into `properties.address.properties.zip_code`) | V1.5 extraction already limits to one level of depth (M24 Constraint 13); consistency with the M24 boundary keeps the spec reviewable | V2 extends both M24 and M25 to nested descent under an explicit `max_depth` policy |
| Whole-key match only (no tail-match, no substring match) | Tail-matching creates false positives on innocuous names (`phone_book_url`, `email_template_id`); whole-key is the most defensible rule | V2 may ship an opt-in `tusq scan --pii-heuristic loose` mode for tail-matching; V1.6 keeps the conservative default |
| No value inspection | V1.6 is static-only by invariant (Constraint 15); inspecting values would violate the local-only boundary and require runtime sampling | V2 runtime-instrumentation increment may sample payloads under an explicit operator opt-in |
| No `log_level` / `mask_in_traces` / `retention_days` inference | These three fields encode organizational policy (log retention, redaction rules, regulatory deadlines) that field-name matching cannot derive | V2 reads a repo-local policy file (e.g., `.tusq/redaction-policy.json`) to supply organization-specific defaults |
| No `sensitivity_class` auto-escalation | Sensitivity is a composite judgment (data class + regulatory scope + org posture); field-name match alone cannot prove it | V2 sensitivity-inference increment ships with its own constraint entry and explicit escalation rules |
| Capability-digest flip on M25 upgrade | Every capability whose `input_schema.properties` contains a canonical PII name will see its digest flip on the first post-M25 scan, revoking effective approval until re-approval | Expected behavior — M13 approval gate is the correct migration path; RELEASE_NOTES MUST document the re-approval requirement |

### Approval-Gate Invariant Preservation

M25 does not alter the approval-gate invariant set first stated in the M20 section. For clarity:

1. A capability whose `redaction.pii_fields` changes under M25 (from `[]` to a non-empty array) MUST have its `capability_digest` re-computed; M13 semantics propagate verbatim. A reviewer MUST explicitly re-approve the capability for it to appear in `tools/list`.
2. `tools/list` continues to filter by `approved: true`. A newly-populated `redaction.pii_fields` does NOT implicitly approve the capability; if approval was previously granted on an empty `pii_fields`, M13 diff detection will surface the change for re-approval.
3. M25 does NOT change `tusq serve` behavior. The `redaction` shape is passed through to `tools/call` responses unchanged; agents see `pii_fields` as advisory metadata, not as an enforced constraint on payloads.
4. M25 does NOT change `tusq policy verify --strict` behavior. Strict mode's checks (name exists, approved, not review-needed) are orthogonal to redaction content; a capability with populated `pii_fields` and `approved: true` passes `--strict` on the same terms as one with empty `pii_fields` and `approved: true`.

### Docs and Tests Required Before Implementation

- `README.md` — add a one-line note under the manifest-format section that canonical PII field names (by whole-key normalized match) populate `redaction.pii_fields` by default; name the canonical set URL-reference (pointing to `website/docs/manifest-format.md`) and explicitly state that this is a source-literal name hint, not a runtime PII-detection claim; do NOT use "PII detection," "PII-validated," or "compliant" framing.
- `website/docs/manifest-format.md` — add a "PII Field-Name Redaction Hints" subsection enumerating the full canonical set, the normalization rule (lowercase + strip `_`/`-`), the whole-key match invariant, the no-auto-escalation rule for `sensitivity_class`, the fall-back semantics (empty `properties` → empty `pii_fields`), the V1.6 boundary (field-name-only, no value inspection, no nested descent, no format/regex), and the explicit framing that M25 does NOT prove runtime PII handling — `pii_fields` is a name hint, not a validation gate.
- `website/docs/redaction.md` (if present) or the manifest-format redaction subsection — add a "What M25 does NOT do" callout enumerating: does not inspect values, does not execute code, does not fetch any dictionary, does not prove regulatory compliance, does not auto-set `sensitivity_class`, does not modify `log_level` / `mask_in_traces` / `retention_days`.
- `tests/smoke.mjs` — add coverage for: (a) Fastify fixture route with literal `schema.body` declaring `email` and `password` produces `redaction.pii_fields: ["email", "password"]` in declaration order; (b) case/underscore/hyphen variants (`userEmail`, `user_email`, `USER_EMAIL`, `user-email`) all match; (c) whole-key invariant: `email_template_id`, `phone_book_url`, `ssn_document_uri` produce `pii_fields: []`; (d) capability with empty or absent `input_schema.properties` produces `pii_fields: []`; (e) Express and NestJS fixtures with no PII-named fields produce byte-identical manifests pre/post-M25; (f) repeated manifest generations produce byte-identical `pii_fields` ordering; (g) a capability whose `input_schema.properties` acquires a PII name flips `capability_digest` (M13) and surfaces under `tusq diff`; (h) `sensitivity_class` remains `"unknown"` on every capability even when `pii_fields` is populated; (i) `tusq policy verify --strict` is unchanged by M25 (strict's approval-alignment check does not inspect `redaction`).
- `tests/fixtures/fastify-sample/src/server.ts` — extend the existing Fastify sample to include at least one route whose literal `schema.body` declares `email`, `password`, and a non-PII field like `subject`; ensure the route exercises case/underscore variants.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario asserting that the Fastify fixture generates `redaction.pii_fields` in declaration order and that repeated runs (`repeat_runs=3`) produce byte-identical arrays.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-088 through REQ-094-ish acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M26: Static PII Category Labels for Redaction Hints

### Purpose

VISION.md line 168 names "produce redaction and **retention defaults**" as a V1 data-and-schema-understanding responsibility. M25 delivered the first half — it populates `redaction.pii_fields` with the canonical PII field-name hints derived statically from `input_schema.properties`. The second half (retention defaults) remains unserved: a reviewer looking at `tusq.manifest.json` sees `redaction.pii_fields: ["email", "password"]` but no signal that these two fields belong to *different* retention categories (email: contact PII with year-scale retention by org policy; password: secret with no-retention / immediate-hash by org policy). Auto-populating `retention_days` directly from a field-name match would conflate organizational policy with extracted evidence and silently reclassify approved capabilities — the same overclaim M25 rejected under Constraint 16.

The bounded path forward: emit a parallel `redaction.pii_categories` array (same length and order as `pii_fields`) where each entry labels the canonical category that produced the match. Categories are the exact nine buckets already enumerated in M25's canonical PII name set: `"email"`, `"phone"`, `"government_id"`, `"name"`, `"address"`, `"date_of_birth"`, `"payment"`, `"secrets"`, `"network"`. The category signal gives reviewers the data they need to set retention/log-level/mask-in-traces defaults by hand without the extractor silently doing it for them. `retention_days`, `log_level`, and `mask_in_traces` are not derived from categories and keep existing defaults (`null`, `"full"`, `false`) unless explicitly edited by a reviewer. `sensitivity_class` continues to stay `"unknown"` (M25 Constraint 16 propagates verbatim).

This is the smallest bounded increment that turns M25 from a flat name list into categorized retention-relevant evidence without overclaiming. It is a pure in-memory computation over M25's own output plus the frozen canonical name set that M25 already defines.

### Scope Boundary

M26 ships exactly one extraction path: M25's already-computed `redaction.pii_fields` array → a parallel `redaction.pii_categories` array via a frozen category lookup derived from the M25 canonical set. Everything else is explicitly out of scope for V1.7:

| In-scope for M26 | Out-of-scope for V1.7 |
|------------------|------------------------|
| Emit `redaction.pii_categories` — same length and same order as `pii_fields`; each entry is the canonical category label for the field at the same index | Auto-populating `redaction.retention_days` (keeps existing `null`; organizational policy owns retention) |
| Nine canonical categories, exactly matching M25's canonical-set row headings (normalized to snake_case category keys) | Auto-populating `redaction.log_level` or `redaction.mask_in_traces` (keeps existing defaults `"full"` and `false`) |
| Category keys use a frozen mapping table enumerated in `src/cli.js`: `PII_CANONICAL_NAMES` gains a sibling `PII_CATEGORY_BY_NAME` lookup from normalized name → category | Auto-escalating `capability.sensitivity_class` on category presence (stays `"unknown"`; Constraint 16 propagates to M26) |
| Pure function (`extractPiiFieldCategories(pii_fields, input_schema_properties)`) over M25's output | Introducing any new category beyond the nine M25 categories |
| Cross-framework application — category emission runs wherever `pii_fields` runs | Locale-aware category inference (multi-locale PII names remain V2 plugin scope) |
| `capability_digest` re-computation when `pii_categories` changes (M13 already hashes `redaction` into the digest) | Introducing a separate `redaction.retention_hints` array or new top-level redaction field (V2) |
| Deterministic output — categories array order matches `pii_fields` order which is already source-literal from M15/M24/M25 | Category-driven default filtering in `tusq serve` or `tusq policy verify --strict` (scoreless pass-through in V1.7) |

### Category Mapping (V1.7)

The category labels are the exact row headings from M25's canonical PII name set, normalized to lowercase snake_case. Every normalized name in `PII_CANONICAL_NAMES` MUST map to exactly one category key. The mapping is frozen and enumerated in `src/cli.js`:

| Category key | Source M25 normalized names |
|---------------|------------------------------|
| `email` | `email`, `emailaddress`, `useremail` |
| `phone` | `phone`, `phonenumber`, `mobile`, `mobilephone`, `telephone` |
| `government_id` | `ssn`, `socialsecuritynumber`, `taxid`, `nationalid` |
| `name` | `firstname`, `lastname`, `fullname`, `middlename` |
| `address` | `streetaddress`, `zipcode`, `postalcode` |
| `date_of_birth` | `dateofbirth`, `dob`, `birthdate` |
| `payment` | `creditcard`, `cardnumber`, `cvv`, `cvc`, `bankaccount`, `iban` |
| `secrets` | `password`, `passphrase`, `apikey`, `accesstoken`, `refreshtoken`, `authtoken`, `secret` |
| `network` | `ipaddress` |

The mapping is total and disjoint: every entry in `PII_CANONICAL_NAMES` has exactly one category; no name maps to two categories; no category key is emitted without at least one supporting entry in the canonical name set. Any V1.7.x or V2 expansion — whether adding a new normalized name to an existing category or adding a new category — is a material governance event and MUST land under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry, identical to the M25 canonical-set freeze rule.

### Extraction Rules

The extractor (`extractPiiFieldCategories` in `src/cli.js`) runs immediately after `extractPiiFieldHints` finishes populating `capability.redaction.pii_fields`. For each generated capability:

1. If `redaction.pii_fields` is empty or absent, return `[]`.
2. For each `key` in `redaction.pii_fields`, in order:
   - Compute `normalized = key.toLowerCase().replace(/[_-]/g, '')` (exactly the M25 normalization rule).
   - Look up `normalized` in `PII_CATEGORY_BY_NAME`. Because M25 already guarantees every entry in `pii_fields` has a matching normalized canonical name, the lookup MUST succeed. If it does not (which would indicate a bug in the M25/M26 name-set synchronization), throw synchronously during manifest generation so the operator sees an actionable error before any `tusq.manifest.json` is written.
   - Push the returned category key into the result array.
3. Return the result array. The result array's length equals `pii_fields.length` and its ordering equals `pii_fields` ordering.

The extractor is a pure function — no filesystem I/O, no side effects, no source-text inspection. It is invoked exactly once per capability, after `extractPiiFieldHints` and before `buildRedactionDefaults()` / `computeCapabilityDigest()`.

### Pipeline Propagation

```
input_schema.properties (already populated by M15/M24/heuristic paths)
   └─ extractPiiFieldHints(properties)                                      # M25; unchanged
      └─ capability.redaction.pii_fields                                    # M25 array, declaration order
         └─ extractPiiFieldCategories(pii_fields, properties)               # M26; pure function, in-memory only
            └─ capability.redaction.pii_categories                          # M26 array, same length + order as pii_fields
               └─ capability_digest (M13)                                   # re-hashed when pii_categories changes
                  └─ tusq.manifest.json capability.redaction                # persisted artifact
                     └─ tusq-tools/*.json redaction                         # inherits pii_categories verbatim
                        └─ MCP tools/call redaction                         # agents see pii_categories as advisory metadata
```

`redaction.pii_categories` is a new sibling to `redaction.pii_fields` inside the `redaction` object. It does not replace any existing field; it sits alongside `pii_fields`, `log_level`, `mask_in_traces`, and `retention_days`. The manifest schema version is unchanged in V1.7 (the shape expansion is additive).

### Default Behavior Preservation Table

| Input | Pre-M26 `redaction` | Post-M26 `redaction` |
|-------|---------------------|------------------------|
| Capability with `pii_fields: ["email", "password"]` | `{pii_fields: ["email", "password"], pii_categories: <absent>, log_level: "full", mask_in_traces: false, retention_days: null}` | `{pii_fields: ["email", "password"], pii_categories: ["email", "secrets"], log_level: "full", mask_in_traces: false, retention_days: null}` |
| Capability with `pii_fields: ["user_email", "FIRST_NAME"]` | `{pii_fields: ["user_email", "FIRST_NAME"], pii_categories: <absent>, ...}` | `{pii_fields: ["user_email", "FIRST_NAME"], pii_categories: ["email", "name"], ...}` |
| Capability with `pii_fields: []` | `{pii_fields: [], pii_categories: <absent>, ...}` | `{pii_fields: [], pii_categories: [], ...}` |
| Capability with empty/absent `input_schema.properties` | `{pii_fields: [], pii_categories: <absent>, ...}` | `{pii_fields: [], pii_categories: [], ...}` |

Every capability emits `pii_categories` as an array; an empty `pii_fields` produces an empty `pii_categories`. The field is never absent — this keeps the manifest shape predictable for downstream consumers.

### Confidence Model Interaction

M26 does NOT modify `scoreConfidence()`. Category presence, like field-name presence, is a redaction signal, not a confidence signal. A capability with `redaction.pii_categories: ["email", "secrets"]` has the same `confidence` as the same capability without M26.

### Sensitivity Class Interaction

M26 does NOT modify `capability.sensitivity_class`. `sensitivity_class` remains `"unknown"` on every capability in V1.7. Constraint 16 (M25 redaction-framing invariant) propagates verbatim to M26: auto-escalating sensitivity_class on category presence would overclaim, because a `secrets` category on a 2FA toggle is semantically different from a `secrets` category on a login route, and the extractor cannot tell these apart from field names alone. Sensitivity inference is reserved for an explicit V2 increment.

### Retention Defaults Interaction

M26 does NOT derive or mutate `redaction.retention_days`, `redaction.log_level`, or `redaction.mask_in_traces`. Existing defaults remain `null`, `"full"`, and `false` respectively unless explicitly edited by a reviewer. This is a conscious boundary: these fields encode organizational policy (regulatory deadlines, log-retention rules, tracing budgets) that a field-category label cannot derive without org-specific context. The M26 increment supplies the evidence reviewers need to set these fields by hand; it does NOT auto-populate them. A future V2 increment may read a repo-local policy file (e.g., `.tusq/redaction-policy.json`) keyed by category to supply org-specific defaults; that increment is explicitly out of scope for V1.7.

### Local-Only Invariants

| Invariant | How it shows up during manifest generation |
|-----------|---------------------------------------------|
| No dynamic evaluation | The extractor is a pure function over M25's `pii_fields` array and the frozen `PII_CATEGORY_BY_NAME` lookup; no `require`, no `eval`, no `new Function` |
| No network I/O | Manifest generation remains filesystem-only; no downloads, no registry lookups, no category-dictionary fetch |
| No new runtime dependency | `package.json` MUST NOT gain any new library for M26; the extractor uses only the M25 canonical set and the frozen category lookup |
| Graceful degradation | When `pii_fields` is empty or absent, `pii_categories: []` (the only emitted shape on non-PII capabilities) |
| Deterministic output | `pii_categories` order is identical to `pii_fields` order (source-literal declaration order); repeated runs produce byte-identical arrays |
| Total mapping | Every M25-match triggers exactly one category emission; no skipped entries, no duplicate categories emitted for the same index |
| No `sensitivity_class` auto-escalation | `sensitivity_class` stays `"unknown"` even when `pii_categories` is non-empty |
| No `retention_days` / `log_level` / `mask_in_traces` auto-population | Existing defaults remain `null`, `"full"`, and `false`; organizational-policy owns them, not the extractor |
| No source-text regex | The extractor never opens or scans source files; it operates exclusively on M25's in-memory `pii_fields` array |
| No runtime-enforced framing | `pii_categories` is a source-literal label, NOT a runtime PII-validation claim, NOT a regulatory-compliance claim, NOT a retention-policy enforcement (Constraint 18 propagates framing guardrails from Constraint 16) |

### V1.7 Limitations

| Limitation | Rationale | V2 Plan |
|------------|-----------|---------|
| Nine categories only | Matches M25's canonical set exactly; expanding the category vocabulary requires expanding the canonical name set, which is a material governance event | V2 may add categories alongside new canonical names under a dedicated expansion milestone |
| `retention_days` / `log_level` / `mask_in_traces` are not category-derived | Retention/log/trace policies encode org-specific regulatory deadlines that field categories alone cannot derive | V2 reads a repo-local policy file (e.g., `.tusq/redaction-policy.json`) keyed by category to supply org-specific defaults under an explicit opt-in |
| No cross-capability aggregation | `pii_categories` is a per-capability array; V1.7 does not emit a repo-level summary | V2 `tusq docs` may summarize category distribution across capabilities |
| No category-driven filtering in `tusq serve` or policy verifier | M25/M26 are descriptive; enforcement remains out of scope | V2 may add a policy-file rule that rejects a capability whose `pii_categories` contains a category not listed in `.tusq/redaction-policy.json` |
| No `sensitivity_class` auto-escalation | Same composite-judgment reasoning as M25 Constraint 16 | V2 sensitivity-inference increment ships with its own constraint entry |
| Capability-digest flip on M26 upgrade | Every capability with non-empty `pii_fields` gains a new `pii_categories` entry; under M13, the `redaction` hash changes and the capability requires re-approval | Expected behavior — M13 approval gate is the correct migration path; RELEASE_NOTES MUST document the re-approval requirement; capabilities with `pii_fields: []` flip from `pii_categories: <absent>` to `pii_categories: []`, which is also a digest-flipping change |

### Approval-Gate Invariant Preservation

M26 does not alter the approval-gate invariant set stated under M20/M25. For clarity:

1. A capability whose `redaction.pii_categories` changes under M26 (appears for the first time; every capability will see this on its first post-M26 scan) MUST have its `capability_digest` re-computed; M13 semantics propagate verbatim. A reviewer MUST explicitly re-approve the capability for it to appear in `tools/list`.
2. `tools/list` continues to filter by `approved: true`. A newly-populated `redaction.pii_categories` does NOT implicitly approve the capability; if approval was previously granted, M13 diff detection will surface the change for re-approval under `tusq diff`.
3. M26 does NOT change `tusq serve` behavior. The `redaction` shape is passed through to `tools/call` responses unchanged; agents see `pii_categories` as advisory metadata alongside `pii_fields`, not as an enforced constraint on payloads.
4. M26 does NOT change `tusq policy verify --strict` behavior. Strict mode's checks (name exists, approved, not review-needed) are orthogonal to redaction content; a capability with populated `pii_categories` and `approved: true` passes `--strict` on the same terms as a capability with populated `pii_fields` and `approved: true`.

### Digest Flip Scope

M26's first-scan digest flip applies to **every** capability, not only those with non-empty `pii_fields`. Reason: capabilities with `pii_fields: []` transition from `pii_categories: <absent>` to `pii_categories: []`, and the `redaction` object hash computed under M13 includes the object shape. This is a one-time migration event and is documented in the M26 RELEASE_NOTES entry. Post-migration, the digest only re-flips when `pii_fields` itself changes (same M25 semantics).

### Docs and Tests Required Before Implementation

- `README.md` — add a one-line note under the manifest-format section that every capability's `redaction.pii_categories` array labels each `pii_fields` entry with its canonical category (`email`, `phone`, `government_id`, `name`, `address`, `date_of_birth`, `payment`, `secrets`, `network`) and explicitly state that categories are source-literal name-category labels, NOT retention-policy enforcement or regulatory-compliance claims; do NOT use "auto-retention," "auto-redaction," or "compliant" framing.
- `website/docs/manifest-format.md` — extend the "PII Field-Name Redaction Hints" subsection (or add an adjoining "PII Field-Name Category Labels" subsection) enumerating the nine-category V1.7 mapping, explaining the one-to-one correspondence with `pii_fields`, the empty-array behavior when `pii_fields` is empty, the no-auto-population rule for `retention_days`/`log_level`/`mask_in_traces`, the no-auto-escalation rule for `sensitivity_class`, and the explicit framing that M26 does NOT prove runtime PII handling or retention-policy enforcement — `pii_categories` is a category label, not a validation gate.
- `website/docs/manifest-format.md` — add a "What M26 does NOT do" callout enumerating: does not inspect values, does not execute code, does not fetch any dictionary, does not prove regulatory compliance, does not auto-set `sensitivity_class`, does not auto-populate `log_level` / `mask_in_traces` / `retention_days`, does not enforce retention, does not filter in `tusq serve`.
- `tests/smoke.mjs` — add coverage for: (a) Fastify fixture route with literal `schema.body` declaring `email` and `password` produces `redaction.pii_categories: ["email", "secrets"]` alongside `pii_fields: ["email", "password"]`, same length and order; (b) capability with `pii_fields: []` produces `pii_categories: []` (array, not absent); (c) capability with mixed-category fields (`user_email` + `ssn` + `credit_card`) produces `pii_categories: ["email", "government_id", "payment"]` in declaration order matching `pii_fields`; (d) Express and NestJS fixtures — non-PII capabilities produce `pii_categories: []`; PII-name capabilities emit categories in the same order as `pii_fields`; (e) repeated manifest generations produce byte-identical `pii_categories` arrays; (f) `sensitivity_class` remains `"unknown"` on every capability even when `pii_categories` is populated; (g) `retention_days`, `log_level`, `mask_in_traces` keep existing defaults (`null`, `"full"`, `false`) on every capability; (h) `tusq policy verify --strict` is unchanged by M26 (strict's approval-alignment check does not inspect `redaction`); (i) every entry in `pii_fields` produces exactly one entry in `pii_categories` at the same index.
- `tests/fixtures/pii-hint-sample/` — extend the existing M25 fixture (or add a sibling) with at least one route whose literal `schema.body` declares two PII fields from **different** categories (e.g., `email` + `credit_card`) so the category emission exercises the cross-category path. The existing `POST /auth` (`email` + `password`) already exercises two categories (email + secrets) and can serve the category-mix test without a new route.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario (`pii-category-label-determinism`) asserting that a fixture exercising multiple categories produces the expected `pii_categories` array in declaration order and that the scenario is deterministic across three repeated runs. Total eval scenarios become **9**.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-094+ acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M27: Reviewer-Facing PII Redaction Review Report

### Purpose

After M26 labeled every PII field-name hint with a frozen category, reviewers still have no tusq-native way to see those signals per capability alongside an advisory reminder for the category-specific judgment calls they own (retention window, log level, trace masking). M27 closes that gap with a new read-only CLI subcommand, `tusq redaction review`, that aggregates the manifest's M25 `redaction.pii_fields` and M26 `redaction.pii_categories` per capability and attaches one frozen advisory string per category. M27 adds a reviewer aid; it does NOT add runtime enforcement, does NOT mutate the manifest, and does NOT change the behavior of `tusq scan`, `tusq manifest`, `tusq compile`, `tusq serve`, `tusq approve`, `tusq diff`, `tusq docs`, or `tusq policy verify`.

### Scope Boundary

| In V1.8 scope (M27) | Out of V1.8 scope (V2+) |
|---------------------|--------------------------|
| New CLI noun `redaction` with one subcommand `review` | No other `redaction` subcommands (e.g., `redaction set-retention`, `redaction classify`) |
| Read `tusq.manifest.json` and emit a deterministic reviewer report | Mutating the manifest, even to "apply recommended defaults" |
| Human-readable and `--json` output modes | Interactive TTY UI, `--watch`, ANSI coloring |
| Frozen nine-entry `PII_REVIEW_ADVISORY_BY_CATEGORY` lookup in `src/cli.js` | Locale-specific advisory strings, custom-advisory file override |
| One advisory line per distinct category per capability, in category-appearance order | Cross-capability aggregation, category heatmaps, severity scoring |
| Local/offline/deterministic | Fetching compliance-framework advisory text over the network |
| Zero change to `retention_days`, `log_level`, `mask_in_traces`, `sensitivity_class` | Auto-populating any of those fields based on report content |
| Zero change to `tusq serve`, `tusq policy verify` (default or `--strict`) | Gating serve or strict verification on report content |
| Zero new dependencies | Adding a PII/compliance/retention/NLP library |

### Command Shape

```
tusq redaction review [--manifest <path>] [--capability <name>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--manifest <path>` | `tusq.manifest.json` (cwd) | Manifest file to read |
| `--capability <name>` | unset | Filter report to a single capability by exact name |
| `--json` | unset | Emit machine-readable JSON instead of the human report |

There are no other flags. `tusq redaction` with no subcommand prints a short enumerate-subcommands block identical in shape to `tusq policy`. Unknown subcommands exit 1 with `Unknown subcommand:` followed by the name.

### Frozen Advisory Set (V1.8)

`PII_REVIEW_ADVISORY_BY_CATEGORY` is a frozen nine-entry lookup in `src/cli.js`. Every M26 category key maps to exactly one single-line reviewer-advisory string. The set is total and disjoint; any addition OR wording change is a material governance event that MUST land under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry.

| Category | Advisory string (single line, frozen V1.8) |
|----------|--------------------------------------------|
| `email` | `Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.` |
| `phone` | `Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.` |
| `government_id` | `High-sensitivity government-ID field detected — reviewer: apply your org's strictest retention, logging, and trace-redaction defaults.` |
| `name` | `Personal-name field detected — reviewer: decide whether the field should be logged in plaintext, masked, or redacted; retention follows your org's contact-data policy.` |
| `address` | `Physical-address field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.` |
| `date_of_birth` | `Date-of-birth field detected — reviewer: apply age-sensitive retention and redaction defaults; some jurisdictions treat DOB as higher-risk PII.` |
| `payment` | `Payment-data field detected — reviewer: apply your org's payment-data retention, logging, and masking rules (e.g., PCI-aligned defaults owned by your team).` |
| `secrets` | `Secret or credential field detected — reviewer: this field SHOULD NOT be logged in plaintext; apply trace redaction and minimal retention at your org's standard.` |
| `network` | `Network-identifier field detected — reviewer: choose retention and masking aligned with your org's logging policy; some jurisdictions treat IP addresses as PII.` |

The advisory strings are intentionally reviewer-directive (they each start with a noun phrase describing what was detected, followed by "reviewer:" and a reminder of the decision the reviewer still owns). None of them claim the capability is compliant, safe, or runtime-enforced; all of them delegate the retention/logging/masking choice to the reviewer.

### Report Shape (JSON)

```json
{
  "manifest_path": "tusq.manifest.json",
  "manifest_version": 7,
  "generated_at": "2026-04-22T12:34:56.000Z",
  "capabilities": [
    {
      "name": "users_createUser",
      "approved": true,
      "sensitivity_class": "unknown",
      "pii_fields": ["email", "password"],
      "pii_categories": ["email", "secrets"],
      "advisories": [
        { "category": "email",   "text": "Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy." },
        { "category": "secrets", "text": "Secret or credential field detected — reviewer: this field SHOULD NOT be logged in plaintext; apply trace redaction and minimal retention at your org's standard." }
      ]
    }
  ]
}
```

Invariants on the JSON shape:

- `manifest_path` is the resolved input path (exact `--manifest` value or the default `tusq.manifest.json`).
- `manifest_version` and `generated_at` are copied verbatim from the manifest's top-level fields (not re-stamped). This keeps the report content-deterministic for a given manifest input.
- `capabilities` is an array in the manifest's own `capabilities` declaration order.
- `pii_fields` and `pii_categories` are copied verbatim from the manifest (same length, same parallel order).
- `advisories` contains one entry per **distinct** category in the order that category first appears in `pii_categories`. A capability with `pii_categories: ["email", "secrets", "email"]` emits two advisory entries (`email`, `secrets`), not three; the appearance order is preserved.
- Capabilities with `pii_fields: []` emit `pii_fields: []`, `pii_categories: []`, and `advisories: []`.
- No ANSI escape codes, no wall-clock fields inside per-capability entries, no randomization. Repeated runs produce byte-identical JSON.

### Report Shape (Human)

Human output mirrors the JSON shape in plain text. For each capability, one section:

```
Capability: users_createUser
  approved: true
  sensitivity_class: unknown
  Redaction:
    pii_fields:     ["email", "password"]
    pii_categories: ["email", "secrets"]
    Advisories:
      - email:   Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.
      - secrets: Secret or credential field detected — reviewer: this field SHOULD NOT be logged in plaintext; apply trace redaction and minimal retention at your org's standard.
```

Capabilities with `pii_fields: []` produce a single reminder line `No canonical PII field-name matches — reviewer action: none required from M27.` within the `Redaction:` sub-block, with no `Advisories:` rows. The human report is plain-text-only (no ANSI escapes) so operators piping to file get byte-identical text.

### Edge-Case and Empty-Manifest Handling

The following edge cases are specified explicitly so the dev role cannot ship two defensible implementations that diverge on reviewer-visible behavior:

| Input manifest condition | Exit code | Human stdout | `--json` stdout | stderr |
|---------------------------|-----------|--------------|-----------------|--------|
| `capabilities` is a valid array with ≥1 entry | 0 | One section per capability as shown above | `{manifest_path, manifest_version, generated_at, capabilities: [...]}` | empty |
| `capabilities` is a valid array with exactly 0 entries (`capabilities: []`) | 0 | Single explicit line `No capabilities in manifest — nothing to review.` and nothing else | `{manifest_path, manifest_version, generated_at, capabilities: []}` (top-level fields still copied verbatim from manifest) | empty |
| Manifest file path cannot be opened | 1 | empty | empty | `Manifest not found: <path>` |
| Manifest file opens but `JSON.parse` throws | 1 | empty | empty | `Invalid manifest JSON: <path>` |
| Manifest parses but top-level `capabilities` is missing OR not an array | 1 | empty | empty | `Invalid manifest: missing capabilities array` |
| `--capability <name>` specifies a name not present in the manifest | 1 | empty | empty | `Capability not found: <name>` |
| Unknown flag on `tusq redaction review` | 1 | empty | empty | `Unknown flag: <flag>` |
| Unknown subcommand under `tusq redaction` | 1 | empty | empty | `Unknown subcommand: <name>` |

Invariants implied by the table:

- **Empty-array is NOT an error.** A manifest with `capabilities: []` is a valid scaffold state (a fresh `tusq init` repo with no routes yet) and M27 MUST treat it as an exit-0 "nothing to review" signal, not a hard failure. Conflating it with the `missing capabilities array` error path would break the scaffold/init-new-repo workflow.
- **stdout is empty on every exit-1 path.** No partial report, no JSON object with an `error` field, no trailing newline. Operators who pipe stdout to a file get a zero-byte file on failure. The `stdout === ""` invariant is asserted by smoke for every error case.
- **Error text goes to stderr only.** The six error messages above are written to `process.stderr` exclusively; none of them reach stdout under any flag combination.
- **Detection-before-output.** Every error path exits before any stdout bytes are written. A malformed manifest MUST NOT produce a half-written JSON object on stdout before the parse error surfaces.

### Optional Top-Level Manifest Field Fallback

The input manifest's own `manifest_version` and `generated_at` fields are copied verbatim to the report. Older fixtures (pre-M13 scaffolds or hand-authored minimal manifests) may lack either field; the rule is:

| Input manifest state | `--json` report | Human report |
|----------------------|-----------------|--------------|
| Both fields present and well-formed | Copied verbatim | Copied verbatim |
| `manifest_version` missing or non-number | Emitted with value `null` | Rendered as the literal string `unknown` |
| `generated_at` missing or non-ISO-string | Emitted with value `null` | Rendered as the literal string `unknown` |

M27 MUST NOT re-stamp either field with current wall-clock time. M27 MUST NOT omit either field from the `--json` output. M27 MUST NOT error out on a manifest that lacks either field — both are informational top-level context, not required inputs.

### Advisory Byte-Exactness Invariant

The frozen `PII_REVIEW_ADVISORY_BY_CATEGORY` strings enumerated above use the em-dash character (U+2014, `—`) in every entry, not an ASCII hyphen-minus (U+002D, `-`) and not an en-dash (U+2013, `–`). stdout is written as UTF-8; the byte sequence for each advisory is locked by a smoke fixture. Any character-level change — including hyphen drift, whitespace drift, or punctuation drift — is a material governance event that MUST land under its own ROADMAP milestone with a RELEASE_NOTES entry. This is not pedantry: teams that snapshot the review output for change-review CI will see a spurious diff on any byte-level drift, and the whole governance story rests on reviewers being able to trust the wording is stable between releases.

### Pipeline Propagation

```
tusq.manifest.json (authored or generated) ─▶
  tusq redaction review (read-only) ─▶
    stdout (human or --json) ─▶
      reviewer (offline) ─▶
        hand-edits retention_days/log_level/mask_in_traces/sensitivity_class (if they choose)
```

The manifest is never modified. No other artifact (`.tusq/execution-policy.json`, `tusq-tools/*.json`, `.tusq/scan.json`) is read or written. The reviewer is always in the loop; M27 adds no automated path from advisory text to manifest defaults.

### Default Behavior Preservation Table

| Command / Field | M27 effect |
|-----------------|------------|
| `tusq scan` | Unchanged (M27 does not re-scan source) |
| `tusq manifest` | Unchanged (M27 does not mutate the manifest) |
| `tusq compile` | Unchanged |
| `tusq serve` | Unchanged (no filtering based on advisory content) |
| `tusq approve` / `tusq diff` / `tusq docs` / `tusq version` | Unchanged |
| `tusq policy verify` (default) | Unchanged |
| `tusq policy verify --strict` | Unchanged (strict continues to check approval alignment only; M27 advisory content is NOT a strict input) |
| `capability.redaction.pii_fields` | Unchanged (read verbatim) |
| `capability.redaction.pii_categories` | Unchanged (read verbatim) |
| `capability.redaction.retention_days` / `log_level` / `mask_in_traces` | Unchanged — defaults stay `null` / `"full"` / `false` unless a reviewer hand-edits them |
| `capability.sensitivity_class` | Unchanged — stays `"unknown"`; M27 never escalates |
| `capability.capability_digest` | Unchanged — M27 does not mutate capability content, so there is no digest flip on first post-M27 run |

### Confidence Model Interaction

M27 does not modify `scoreConfidence()`, does not introduce new confidence inputs, and does not emit a confidence field in the review report. `scoreConfidence()` remains exactly the M15/M24 implementation.

### Sensitivity Class Interaction

M27 does not mutate `sensitivity_class`. The report echoes the manifest's `sensitivity_class` verbatim alongside `pii_fields` and `pii_categories` so the reviewer sees all three signals at once; that is a read, not a write. Constraint 16 (no auto-escalation under M25) and Constraint 18 (no auto-escalation under M26) propagate verbatim to M27 — no advisory category causes any sensitivity escalation.

### Local-Only Invariants

| Invariant | How it shows up at review time |
|-----------|---------------------------------|
| Read-only | `tusq.manifest.json` mtime and content are unchanged after any `tusq redaction review` invocation; smoke test asserts this |
| No network I/O | No HTTP, DB, socket, or DNS; smoke test exercises the default and `--json` paths with network disabled |
| Zero new dependencies | `package.json` MUST NOT gain any PII, compliance, retention, NLP, or table-rendering library |
| Deterministic output | Running twice on the same manifest produces byte-identical stdout (human and `--json`); no wall-clock field inside per-capability entries |
| No scan re-run | The subcommand never calls the scanner or re-reads `src/` |
| No capability execution | The subcommand never calls a compiled tool or starts the MCP server |
| Advisory set is frozen | `PII_REVIEW_ADVISORY_BY_CATEGORY` is enumerated in this spec and locked by a smoke fixture; any wording change is a material governance event |

### V1.8 Limitations

- English advisory strings only; multi-locale advisory sets are reserved for V2 under a plugin interface.
- No custom-advisory override file (so the frozen set is the single source of reviewer guidance; this is deliberate — allowing overrides in V1.8 would create the same governance-drift risk the frozen set is meant to prevent).
- No CSV/HTML/Markdown export mode; `--json` is the only machine-readable mode (stdout Markdown can be produced by a downstream tool from the `--json` output, which keeps the M27 surface small).
- No manifest-wide aggregates (total PII capabilities, per-category counts); the report is per-capability. Aggregate reporting is reserved for a later increment.
- No `--diff` / `--since` flag comparing two manifests; the existing `tusq diff` command covers that territory and M27 deliberately stays single-manifest.
- No reviewer identity or approval action is captured; M27 is purely informational. `tusq approve` remains the reviewer-action surface.

### Approval-Gate Invariant Preservation

M27 does NOT change the M13 approval gate. `tools/list` and `tools/call` continue to filter on `approved: true` and `review_needed: false` exactly as before. M27 does NOT auto-approve, does NOT clear `review_needed`, and does NOT mutate `approved_by`/`approved_at`. The review report is purely informational and reviewers continue to run `tusq approve` by hand when they want to approve a capability.

### Digest Flip Scope

M27 causes ZERO `capability_digest` flips on first post-M27 run because the manifest is not mutated. In contrast with M25 (narrow flip on PII-name capabilities) and M26 (broad flip across every capability), M27 is observationally invisible in `tusq diff`. The first run after upgrading to a version that includes M27 produces an identical manifest to the version before M27 landed.

### Docs and Tests Required Before Implementation

- `tusq help` — add `redaction` to the noun list (single additional line) and `redaction review` to the subcommand examples; the existing 12-command summary copy gains one new noun with one subcommand and becomes a 12-noun / 13-entry-point surface depending on counting convention (see command-surface.md for the exact table).
- `tusq redaction --help` — prints the subcommands block (`review`).
- `tusq redaction review --help` — prints the flag surface (`--manifest`, `--capability`, `--json`), exit codes, and the "reviewer aid, not a runtime enforcement gate" callout.
- `README.md` — add a short "Reviewer Review Report" subsection under the existing redaction coverage, linking to `website/docs/cli-reference.md` for detail and explicitly stating the advisory set is frozen and the command never mutates the manifest.
- `website/docs/cli-reference.md` — add a `tusq redaction review` section documenting the command shape, flags, exit codes, human output example, `--json` output example, the nine-entry advisory table (frozen V1.8 wording), and the explicit not-runtime-enforcement / not-compliance / not-a-substitute-for-reviewer-judgment framing required by Constraint 19.
- `website/docs/manifest-format.md` — extend the existing PII subsection with a "Reviewing PII redaction hints" paragraph pointing readers at `tusq redaction review`; no manifest-shape changes are documented because there are none.
- `tests/smoke.mjs` — add coverage for: (a) exit 0 on a manifest with M25/M26 PII capabilities, with the expected advisory lines; (b) `--json` round-trips through JSON.parse and preserves order; (c) `--capability <name>` filter to one capability on success; (d) `--capability <unknown>` exits 1 with `Capability not found:`; (e) missing manifest exits 1 with `Manifest not found:`; (f) malformed-JSON manifest exits 1 before any stdout; (g) byte-identical stdout across two runs in both modes; (h) `tusq.manifest.json` mtime and content are unchanged after a review run (the read-only invariant); (i) `sensitivity_class` in the report equals the manifest's value (no escalation); (j) capability with `pii_fields: []` renders the "no canonical PII field-name matches" line; (k) mixed-category capability renders distinct advisory lines in category-appearance order; (l) `tusq policy verify` (default) and `tusq policy verify --strict` stdout/exit code are byte-identical before and after an M27 run on the same fixture.
- `tests/evals/governed-cli-scenarios.json` — add one eval scenario (`redaction-review-determinism`) asserting that `tusq redaction review --json` produces byte-identical stdout across three repeated runs and that advisory ordering matches `pii_categories` appearance order. Total eval scenarios become **10**.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-101+ acceptance criteria (the specific REQ numbering is the QA role's call; naming them now would over-reach PM scope).

## M28: Static Sensitivity Class Inference from Manifest Evidence

### Purpose

M25–M27 shipped three redaction-metadata increments that gave reviewers structured PII signals but left `capability.sensitivity_class` frozen at `"unknown"` for every capability. The field has existed since M9, and Constraint 16 correctly prevented M25 from auto-escalating it on a PII name match alone. The gap is now addressable: a capability's manifest record already carries the verb, route, parameters, M26 PII categories, the M13 preserve flag, and write-effect markers — all of which are static, reviewer-authored evidence. A deterministic rule table over that evidence can produce a meaningful, reproducible sensitivity label without any network call, runtime probe, or policy inference.

M28 computes `sensitivity_class` as a pure deterministic function of the existing manifest record. The classifier is a frozen six-rule first-match-wins decision table producing a closed five-value enum: `{public, internal, confidential, restricted, unknown}`. Capabilities with zero static evidence return `"unknown"` explicitly rather than silently defaulting to `"public"`. The new label surfaces only in `tusq review`, `tusq docs`, and `tusq diff` as a reviewer aid. It MUST NOT alter `tusq compile` policy, `tusq approve` gating, or any runtime execution surface.

### Scope Boundary

| In scope (V1.9) | Out of scope (V1.9) |
|-----------------|---------------------|
| Pure deterministic classifier over manifest record fields only | Any network or runtime call |
| Closed five-value enum: public, internal, confidential, restricted, unknown | Open-ended or free-text sensitivity labels |
| Six-rule first-match-wins frozen decision table | Machine-learning inference or heuristic scoring |
| sensitivity_class surfaces in `tusq review`, `tusq docs`, `tusq diff` | New top-level CLI noun or flag |
| capability_digest flip + M13 approved=false reset on change | Altering `tusq compile`, `tusq approve`, or `tusq serve` behavior |
| `--sensitivity` optional filter on `tusq review` | Any runtime enforcement or PII compliance claim |
| M10 SYSTEM_SPEC section (M28 frozen rule table + non-certification boundary) | GDPR / HIPAA / PCI / SOC2 attestation of any kind |
| New Constraint 21 reserving reviewer-aid framing | Marketing or docs that frame sensitivity_class as runtime enforcement |

### Frozen Decision Table (Six Rules, First-Match-Wins)

The classifier evaluates rules in order; the first rule that matches the capability's manifest record determines the `sensitivity_class`. Rules are immutable once M28 ships; any rule change is a material governance event that MUST land under its own ROADMAP milestone with fresh re-approval expectations and a RELEASE_NOTES entry.

| Rule | Condition | Assigned class | Rationale |
|------|-----------|----------------|-----------|
| R1 | `capability.preserve === true` | `restricted` | Preserve flag signals irreversible or destructive-by-intent semantics |
| R2 | `capability.verb` in `{delete, drop, truncate, admin, destroy, purge, wipe}` OR route segment matches `/^(admin\|root\|superuser)/` | `restricted` | Admin/destructive verb or admin-namespaced route |
| R3 | `capability.redaction.pii_categories` is non-empty | `confidential` | Confirmed PII-category evidence from M26 static labels |
| R4 | `capability.verb` in `{create, update, write, post, put, patch}` AND (`capability.route` OR any param key) matches `/payment\|invoice\|charge\|billing\|ssn\|tax\|account_number/i` | `confidential` | Write verb into financial or regulated context |
| R5 | `capability.auth_required === true` OR (`capability.verb` in write set AND no PII/financial signal from R3/R4) | `internal` | Auth gate or narrow write that does not meet R3/R4 threshold |
| R6 | (no prior rule matched) | `public` | Default — only when evidence is present and all stronger rules fail |

**Rule precedence is fixed: R1 beats all others; R2 beats R3; R3 beats R4; earlier rules always win.**

Capabilities with zero static evidence (no verb, no route, no params, no redaction, no preserve flag, no auth_required) MUST receive `sensitivity_class: "unknown"`. This is a distinct sixth class, NOT a fallback to "public." The classifier MUST emit `"unknown"` explicitly when no manifest evidence is present to drive a rule — never silently default to `"public"` in the zero-evidence case.

### Eight-Case Smoke Matrix (AC-7)

| Case | Evidence | Expected class | Rule |
|------|----------|----------------|------|
| 1 | preserve=true, pii_categories non-empty | `restricted` | R1 beats R3 |
| 2 | verb=delete, pii_categories non-empty | `restricted` | R2 beats R3 |
| 3 | pii_categories non-empty, no preserve, verb=get | `confidential` | R3 |
| 4 | verb=post, route=/payments/new, pii_categories empty | `confidential` | R4 |
| 5 | auth_required=true, verb=get, pii_categories empty | `internal` | R5 |
| 6 | verb=put, no PII, no financial route | `internal` | R5 |
| 7 | verb=get, no auth, no PII | `public` | R6 |
| 8 | no verb, no route, no params, no redaction, no preserve, no auth_required | `unknown` | zero evidence |

### `classifySensitivity(capability)` Algorithm

```
function classifySensitivity(cap) {
  // Zero-evidence guard
  if (!cap.verb && !cap.route && (!cap.redaction?.pii_categories?.length)
      && !cap.preserve && !cap.auth_required) {
    return "unknown";
  }
  // R1: preserve flag
  if (cap.preserve === true) return "restricted";
  // R2: admin/destructive verb or route
  const RESTRICTED_VERBS = new Set(["delete","drop","truncate","admin","destroy","purge","wipe"]);
  if (RESTRICTED_VERBS.has((cap.verb || "").toLowerCase())) return "restricted";
  if (/^(admin|root|superuser)(\/|$)/i.test(cap.route || "")) return "restricted";
  // R3: PII category present
  if (cap.redaction?.pii_categories?.length) return "confidential";
  // R4: write verb + financial context
  const WRITE_VERBS = new Set(["create","update","write","post","put","patch"]);
  const FINANCIAL_RE = /payment|invoice|charge|billing|ssn|tax|account_number/i;
  if (WRITE_VERBS.has((cap.verb || "").toLowerCase())) {
    if (FINANCIAL_RE.test(cap.route || "") ||
        Object.keys(cap.input_schema?.properties || {}).some(k => FINANCIAL_RE.test(k))) {
      return "confidential";
    }
  }
  // R5: auth_required or narrow write
  if (cap.auth_required === true) return "internal";
  if (WRITE_VERBS.has((cap.verb || "").toLowerCase())) return "internal";
  // R6: default (evidence present, no stronger rule matched)
  return "public";
}
```

The function is pure: same input → same output, byte-stable across runs, no I/O, no clock, no randomness.

### Pipeline Propagation

```
tusq manifest
   └─ capabilities[*].sensitivity_class = classifySensitivity(cap)   # M28; pure function
   └─ capability_digest re-computed (sensitivity_class included)      # M13; unchanged algorithm
   └─ approved = false when digest flips                              # M13; unchanged gate

tusq review [--sensitivity <class>]
   └─ displays sensitivity_class per capability                       # M28; reviewer-aid surface

tusq docs
   └─ renders sensitivity_class in per-capability sections            # M28; reviewer-aid surface

tusq diff
   └─ surfaces sensitivity_class changes in review queue              # M28; reviewer-aid surface

tusq compile
   └─ output is byte-identical regardless of sensitivity_class        # M28; AC-9 invariant

tusq approve
   └─ gate logic is unchanged (approved/review_needed only)           # M28; AC-9 invariant

tusq serve
   └─ MCP surface is unchanged                                        # M28; AC-9 invariant
```

### `tusq review` Optional `--sensitivity` Filter

The only new surface flag in M28 is an optional `--sensitivity <class>` filter on the existing `tusq review` command. When supplied, the review output lists only capabilities whose `sensitivity_class` matches the given value. It MUST NOT change the exit code semantics of `tusq review` (exit 0 still means no blocking concerns; exit 1 still means unapproved/low-confidence capabilities were found — the filter does not hide those). When the supplied value is not in the legal enum, exit 1 with an actionable message before any output. The filter is advisory-only: operators remain responsible for reviewing all capabilities regardless of sensitivity label.

### AC-9 Compile / Approve / Runtime Invariant Preservation

`tusq compile` output MUST be byte-identical for two manifests that differ only in `sensitivity_class` value. The compiled tool shape does NOT include `sensitivity_class` in V1.9; no sensitivity gate is applied at compile time. `tusq approve` acceptance criteria (approved/review_needed) are unchanged. `tusq serve` tool-list filtering continues to use only `approved: true` and `review_needed: false`. Any golden-file assertion that compares `tusq compile` output before and after a `sensitivity_class` change MUST pass without modification.

### Digest Flip Scope and AC-5

`sensitivity_class` is included in the content fields hashed to produce `capability_digest` (M13). When M28 first computes a non-`"unknown"` value for a capability that previously had `"unknown"`, the digest flips and `approved` resets to `false`. The capability disappears from `tools/list` until a reviewer re-approves it via `tusq approve`. This is the correct migration path for M28 adoption; RELEASE_NOTES MUST document the expected re-approval sweep on first post-M28 manifest regeneration.

### V1.9 Limitations

| Limitation | Rationale | V2 plan |
|------------|-----------|---------|
| No multi-locale or natural-language route parsing | Route segment matching is regex on ASCII patterns only; non-English or path-aliased routes may miss a classification | V2 plugin interface for locale-aware route classifiers |
| No org-policy override file for sensitivity rules | Hardcoded rule table is the governance guarantee; overrides would drift reviewers | V2 policy-as-code tier with a signed rule table |
| No partial-route confidence weighting | R4 financial match is binary; ambiguous routes (e.g., `/orders`) are classified by verb alone | V2 scoring model that weights multiple signals |
| No reviewer-assignable sensitivity override | Reviewers can observe sensitivity in the review output but cannot override it in the manifest in V1.9 | V2 `tusq approve --sensitivity <class>` to record reviewer override with audit trail |

### Non-Compliance-Certification Boundary

`sensitivity_class` is reviewer-aid framing only. tusq DOES NOT certify, enforce, or attest GDPR, HIPAA, PCI, SOC2, or any other regulatory compliance at runtime. `sensitivity_class: "restricted"` does NOT mean the capability is runtime-restricted from unauthorized callers; it means the manifest evidence pattern matched the R1 or R2 rule and a reviewer should pay heightened attention. DOCS, CLI help, launch artifacts, and any external communication MUST NOT frame `sensitivity_class` as a runtime data-access control, a regulatory compliance proof, or an automated governance certification.

### Edge-Case Invariants

- A capability with `preserve === null` (not `true`) MUST NOT trigger R1.
- A capability with `verb: "DELETE"` (uppercase) MUST trigger R2 after `toLowerCase()` normalization.
- A route of `/admin-panel` MUST NOT trigger R2; the regex is `^(admin|root|superuser)(\/|$)` requiring the segment to BE admin/root/superuser as a full path prefix, not merely contain it.
- `pii_categories: []` (empty array) MUST NOT trigger R3; the check is `length > 0`.
- A capability with auth_required present but false MUST NOT trigger R5; the check is `=== true`.

### Local-Only Invariants

| Invariant | Requirement |
|-----------|-------------|
| Pure function | `classifySensitivity` has no I/O, no network, no clock, no filesystem reads beyond the manifest |
| Deterministic | Same manifest record → same `sensitivity_class`, byte-stable across Node.js processes and platforms |
| Closed enum | No value outside `{public, internal, confidential, restricted, unknown}` may be emitted |
| Zero new dependencies | `package.json` MUST NOT gain any classification, ML, or compliance library |
| Compile-output-invariant | `tusq compile` output is byte-identical before and after M28 adoption |

### Docs and Tests Required Before Implementation

- `src/cli.js` — add `classifySensitivity(cap)` pure function and call it on every capability in manifest generation; update `tusq review` to render `sensitivity_class` per capability and accept optional `--sensitivity <class>` filter; update `tusq docs` to include `sensitivity_class` in per-capability sections; verify `tusq diff` already surfaces the field change (no change needed if diff compares `capability_digest` — digest flip is automatic from M13).
- `SYSTEM_SPEC.md` — this M28 section (already present after this edit); `## Constraints` gains Constraint 21.
- `README.md` — add one line under the manifest shape description noting `sensitivity_class` is computed by a static rule table; link to docs for the frozen rule table.
- `website/docs/manifest-format.md` — add a "Sensitivity Class" subsection documenting the five enum values, the six-rule table, the zero-evidence unknown bucket, the non-certification boundary, and the `--sensitivity` filter on `tusq review`.
- `website/docs/cli-reference.md` — update `tusq review` entry with `--sensitivity` flag and note that `tusq docs` and `tusq diff` now surface `sensitivity_class`.
- `tests/smoke.mjs` — add the 8-case smoke matrix (AC-7); add an assertion that `tusq compile` output is byte-identical for two capabilities differing only in `sensitivity_class`; add assertions that `tusq review --sensitivity restricted` filters correctly and that an unknown filter value exits 1.
- `tests/evals/governed-cli-scenarios.json` — add ≥3 eval regression scenarios: (1) R1>R3 precedence (preserve=true with PII → restricted); (2) R4 financial-route detection (post verb + payment route, no PII → confidential); (3) zero-evidence unknown bucket (empty record → unknown). Total eval scenarios become **≥13**.
- `tests/evals/governed-cli-scenarios.json` — verify AC-9 golden-file: a scenario that compiles two identical capabilities differing only in `sensitivity_class` and asserts identical compiled tool output.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-109+ acceptance criteria.

## M29: Static Auth Requirements Inference from Manifest Evidence

### Purpose

M10 shipped a single boolean `auth_required` field on each capability; M28 shipped static `sensitivity_class` inference. Reviewers still have no structured view of *what kind* of authentication a capability appears to expect: bearer token, API key, session cookie, basic auth, OAuth/OIDC, or none. This information is already implied by manifest evidence — the middleware-name strings recorded by the scanner, the route prefix, the `auth_required` boolean, and (post-M28) the `sensitivity_class` propagation — but it is not yet surfaced in a structured shape.

M29 computes a structured `auth_requirements` record per capability as a pure deterministic function of the existing manifest record. The classifier evaluates a frozen six-rule first-match-wins decision table over middleware-name strings to assign `auth_scheme`, extracts `auth_scopes` and `auth_roles` from middleware-annotation literals via a frozen extraction rule set, and returns a closed-shape record. The new label surfaces only in `tusq review`, `tusq docs`, and `tusq diff` as a reviewer aid. It MUST NOT alter `tusq compile` policy, `tusq approve` gating, `tusq serve` MCP responses, `tusq policy verify` (default or `--strict`), or `tusq redaction review` output.

### Scope Boundary

| In scope (V1.10) | Out of scope (V1.10) |
|------------------|----------------------|
| Pure deterministic classifier over manifest record fields only | Any network or runtime call |
| Closed seven-value `auth_scheme` enum: bearer, api_key, session, basic, oauth, none, unknown | Open-ended or free-text auth-scheme labels |
| Closed five-value `evidence_source` enum: middleware_name, route_prefix, auth_required_flag, sensitivity_class_propagation, none | Inference from arbitrary source-text grep |
| Frozen six-rule first-match-wins `auth_scheme` decision table | Token-signature validation, JWT-claim parsing, OAuth-flow simulation |
| Frozen scope/role extraction rules (regex over middleware annotation literals only) | Reading any source file beyond what manifest generation already reads |
| `auth_requirements` surfaces in `tusq review`, `tusq docs`, `tusq diff` | New top-level CLI noun or subcommand |
| `capability_digest` flip + M13 `approved=false` reset on change | Altering `tusq compile`, `tusq approve`, `tusq serve`, `tusq policy verify`, `tusq redaction review` behavior |
| Optional `--auth-scheme <scheme>` filter on existing `tusq review` | Any runtime AAA enforcement or compliance attestation claim |
| New SYSTEM_SPEC § M29 + Constraint 22 (reviewer-aid framing) | SOC2 / ISO27001 / OAuth2 / OIDC / SAML / GDPR / HIPAA / PCI attestation of any kind |

### Closed `auth_scheme` Enum (Seven Values)

| Value | Meaning |
|-------|---------|
| `bearer` | Middleware-name evidence matches bearer-token / JWT / access-token pattern |
| `api_key` | Middleware-name evidence matches API-key / x-api-key pattern |
| `session` | Middleware-name evidence matches session / cookie / passport-local pattern |
| `basic` | Middleware-name evidence matches HTTP Basic Auth pattern |
| `oauth` | Middleware-name evidence matches OAuth / OIDC / OpenID pattern |
| `none` | `auth_required === false` AND no admin/restricted route prefix; capability appears intentionally unauthenticated |
| `unknown` | Zero-evidence guard: no middleware, no route prefix, no `auth_required` flag, no `sensitivity_class` signal |

The seven values are the entire legal set. No other value, nullable, or wildcard is permitted in `auth_requirements.auth_scheme`.

### Closed `evidence_source` Enum (Five Values)

| Value | Meaning |
|-------|---------|
| `middleware_name` | Classification driven by R1–R5 middleware-name regex match |
| `route_prefix` | Classification driven by route segment evidence |
| `auth_required_flag` | Classification driven by R6 `auth_required === false` path |
| `sensitivity_class_propagation` | Classification informed by `sensitivity_class` (R2/R6 admin/restricted route gating) |
| `none` | Zero-evidence guard fired; record is `unknown` with empty arrays |

### Frozen Decision Table (Six Rules, First-Match-Wins)

The classifier evaluates rules in order against the capability's middleware-name list and `auth_required` flag; the first rule that matches determines `auth_scheme`. Rules are immutable once M29 ships; any rule change is a material governance event requiring its own ROADMAP milestone with fresh re-approval expectations and a RELEASE_NOTES entry.

| Rule | Condition | Assigned `auth_scheme` | `evidence_source` |
|------|-----------|------------------------|-------------------|
| R1 | Any middleware_name matches `/bearer|jwt|access[_-]?token/i` | `bearer` | `middleware_name` |
| R2 | Any middleware_name matches `/api[_-]?key|x-api-key/i` | `api_key` | `middleware_name` |
| R3 | Any middleware_name matches `/session|cookie|passport-local/i` | `session` | `middleware_name` |
| R4 | Any middleware_name matches `/basic[_-]?auth/i` | `basic` | `middleware_name` |
| R5 | Any middleware_name matches `/oauth|oidc|openid/i` | `oauth` | `middleware_name` |
| R6 | `auth_required === false` AND no admin/restricted route prefix | `none` | `auth_required_flag` |
| default | (no prior rule matched, evidence present) | `unknown` | `none` |

**Rule precedence is fixed: R1 beats all others; earlier rules always win.** A capability with both a `bearer`-matching middleware AND an `api_key`-matching middleware is classified as `bearer` (R1), never `api_key`.

### Zero-Evidence Guard

Capabilities with zero static evidence (no middleware names, no route prefix, no `auth_required` flag, no `sensitivity_class` signal) MUST receive:

```
auth_requirements: {
  auth_scheme: "unknown",
  auth_scopes: [],
  auth_roles: [],
  evidence_source: "none"
}
```

— never silently default to `"none"`. The zero-evidence guard is the first check in `classifyAuthRequirements` before the rule table runs. `"none"` is reachable only from R6 evidence (an explicit `auth_required: false` declaration paired with a non-admin route); it MUST NOT be the absence-of-evidence fallback.

### Frozen Scope/Role Extraction Rules

`auth_scopes` and `auth_roles` are derived from a frozen pure rule set:

- **Scopes** are extracted from middleware-annotation literals matching `/scopes?:\s*\[([^\]]+)\]/` over the capability's source-literal middleware list.
- **Roles** are extracted from middleware-annotation literals matching `/role[s]?:\s*\[([^\]]+)\]/` over the same surface.

Both arrays MUST:
- preserve declaration order (the order entries appear in the source-literal middleware annotation),
- be deduplicated case-sensitively (`"read:user"` and `"Read:User"` are distinct entries; only exact byte-equal duplicates are removed),
- be empty arrays (never `null`, never absent) when zero matches are found.

The extractor reads ONLY the already-built capability record fields (the source-literal middleware list captured by the M9/M15 scanner); no regex over arbitrary source files; no filesystem reads beyond what manifest generation already performs.

### Eight-Case Smoke Matrix (AC-8)

| Case | Evidence | Expected `auth_scheme` | Expected scopes/roles |
|------|----------|------------------------|------------------------|
| 1 | middleware_name="requireBearerToken" | `bearer` | `[]`/`[]` |
| 2 | middleware_name="checkApiKey" | `api_key` | `[]`/`[]` |
| 3 | middleware_name="sessionGuard" | `session` | `[]`/`[]` |
| 4 | middleware_name="basicAuth" | `basic` | `[]`/`[]` |
| 5 | middleware_name="oauthMiddleware" | `oauth` | `[]`/`[]` |
| 6 | `auth_required=false`, route=/public/health | `none` | `[]`/`[]` |
| 7 | middleware annotation declares `scopes:["read:user","write:user"]` | (per other rules) | `["read:user","write:user"]` (preserved order, deduped) |
| 8 | zero-evidence empty record | `unknown` | `[]`/`[]` |

### `classifyAuthRequirements(capability)` Algorithm

```
function classifyAuthRequirements(cap) {
  const middlewareList = cap.middleware_names || [];
  const annotations = cap.middleware_annotations || [];
  // Zero-evidence guard
  const hasMiddleware = middlewareList.length > 0;
  const hasRoutePrefix = !!cap.route;
  const hasAuthFlag = typeof cap.auth_required === "boolean";
  const hasSensitivitySignal = cap.sensitivity_class && cap.sensitivity_class !== "unknown";
  if (!hasMiddleware && !hasRoutePrefix && !hasAuthFlag && !hasSensitivitySignal) {
    return { auth_scheme: "unknown", auth_scopes: [], auth_roles: [], evidence_source: "none" };
  }
  // Scope/role extraction (frozen rules; pure)
  const scopes = extractFrozenList(annotations, /scopes?:\s*\[([^\]]+)\]/);
  const roles = extractFrozenList(annotations, /role[s]?:\s*\[([^\]]+)\]/);
  // R1..R5: middleware-name first-match-wins
  const RULES = [
    [/bearer|jwt|access[_-]?token/i, "bearer"],
    [/api[_-]?key|x-api-key/i, "api_key"],
    [/session|cookie|passport-local/i, "session"],
    [/basic[_-]?auth/i, "basic"],
    [/oauth|oidc|openid/i, "oauth"],
  ];
  for (const [re, scheme] of RULES) {
    if (middlewareList.some(name => re.test(name))) {
      return { auth_scheme: scheme, auth_scopes: scopes, auth_roles: roles, evidence_source: "middleware_name" };
    }
  }
  // R6: explicit auth_required=false on non-admin route
  const isAdminRoute = /^\/(admin|root|superuser)(\/|$)/i.test(cap.route || "");
  if (cap.auth_required === false && !isAdminRoute) {
    return { auth_scheme: "none", auth_scopes: scopes, auth_roles: roles, evidence_source: "auth_required_flag" };
  }
  // default: evidence present but no rule matched
  return { auth_scheme: "unknown", auth_scopes: scopes, auth_roles: roles, evidence_source: "none" };
}
```

The function is pure: same input → same output, byte-stable across runs, no I/O, no clock, no randomness, no network, no auth-library import.

### Pipeline Propagation

```
tusq manifest
   └─ capabilities[*].auth_requirements = classifyAuthRequirements(cap)   # M29; pure function
   └─ capability_digest re-computed (auth_requirements included)            # M13; unchanged algorithm
   └─ approved = false when digest flips                                    # M13; unchanged gate

tusq review [--auth-scheme <scheme>] [--sensitivity <class>]
   └─ displays auth_requirements per capability                             # M29; reviewer-aid surface

tusq docs
   └─ renders auth_requirements in per-capability sections                  # M29; reviewer-aid surface

tusq diff
   └─ surfaces auth_requirements changes in review queue                    # M29; via M13 digest flip

tusq compile
   └─ output is byte-identical regardless of auth_requirements              # M29; AC-7 invariant

tusq approve
   └─ gate logic is unchanged (approved/review_needed only)                 # M29; AC-7 invariant

tusq serve
   └─ MCP surface (tools/list, tools/call, dry_run_plan) is unchanged       # M29; AC-7 invariant
   └─ auth_requirements MUST NOT appear in any serve response shape         # M29; AC-7 invariant

tusq policy verify (default and --strict)
   └─ unchanged                                                              # M29; AC-7/AC-10 invariant

tusq redaction review
   └─ unchanged                                                              # M29; AC-7/AC-10 invariant
```

### `tusq review` Optional `--auth-scheme` Filter

The only new surface flag in M29 is an optional `--auth-scheme <scheme>` filter on the existing `tusq review` command. When supplied, the review output lists only capabilities whose `auth_requirements.auth_scheme` matches the given value. It MUST NOT change the exit code semantics of `tusq review` (exit 0 still means no blocking concerns; exit 1 still means unapproved/low-confidence capabilities were found — the filter does not hide those). When the supplied value is not in the legal seven-value enum, exit 1 with `Unknown auth scheme: <value>` on stderr, empty stdout, before any output (matching M28's `--sensitivity` validation pattern).

The filter is mutually compatible with `--sensitivity`: both can be set in one invocation; they intersect AND-style. `tusq review --sensitivity restricted --auth-scheme bearer` lists only capabilities matching both filters.

### AC-7 Compile / Approve / Runtime Invariant Preservation

`tusq compile` output MUST be byte-identical for two manifests that differ only in `auth_requirements` value. The compiled tool shape does NOT include `auth_requirements` in V1.10. `tusq approve` acceptance criteria (`approved`/`review_needed`) are unchanged. `tusq serve` MCP surface (`tools/list`, `tools/call`, `dry_run_plan`) MUST NOT include `auth_requirements` in any response shape. `tusq policy verify` (default and `--strict`) and `tusq redaction review` behavior is byte-for-byte unchanged. Any golden-file assertion that compares `tusq compile` output before and after an `auth_requirements` change MUST pass without modification.

### Digest Flip Scope and AC-5

`auth_requirements` is included in the content fields hashed to produce `capability_digest` (M13). When M29 first computes a non-`"unknown"` value for a capability that previously had no `auth_requirements` field, the digest flips and `approved` resets to `false`. The capability disappears from `tools/list` until a reviewer re-approves it via `tusq approve`. RELEASE_NOTES MUST document the expected re-approval sweep on first post-M29 manifest regeneration.

A change to any field of `auth_requirements` — including the contents of `auth_scopes` or `auth_roles` arrays (e.g., adding a single scope `"read:user"`) — flips the digest. The diff queue under `tusq diff` surfaces the `auth_requirements` change as a non-empty review queue entry.

### V1.10 Limitations

| Limitation | Rationale | V2 plan |
|------------|-----------|---------|
| No multi-locale or natural-language middleware-name parsing | Middleware regex is ASCII patterns only; non-English middleware names may miss classification | V2 plugin interface for locale-aware classifiers |
| No org-policy override file for auth-scheme rules | Hardcoded rule table is the governance guarantee; overrides would drift reviewers | V2 policy-as-code tier with a signed rule table |
| No reviewer-assignable auth-scheme override | Reviewers can observe `auth_scheme` in the review output but cannot override it in the manifest in V1.10 | V2 `tusq approve --auth-scheme <scheme>` to record reviewer override with audit trail |
| No JWT-claim or scope-grant validation | Scopes/roles are extracted from middleware-annotation literals only; no token decoding or signature verification | Out of scope permanently for tusq; reserved for runtime-AAA-enforcement layers outside tusq |
| No detection of multi-scheme middleware chains | A capability with both bearer and api_key middleware is classified by R1 precedence (bearer); the alternate scheme is not separately recorded | V2 may add a `secondary_schemes` array if reviewer demand emerges |

### Non-Attestation Boundary

`auth_requirements` is reviewer-aid framing only. tusq DOES NOT authenticate or authorize requests at runtime, DOES NOT certify SOC2 / ISO27001 / OAuth2 / OIDC / SAML compliance, and DOES NOT validate token signatures or scope grants. `auth_scheme: "bearer"` does NOT mean tusq verifies bearer tokens; it means a middleware in the source matched the R1 regex and a reviewer should pay attention to bearer-token configuration. DOCS, CLI help, launch artifacts, and any external communication MUST NOT frame `auth_requirements` as runtime AAA enforcement, automated AAA certification, or any compliance attestation.

### Edge-Case Invariants

- A capability with `auth_required === undefined` (not `false`) MUST NOT trigger R6; the check is `=== false`.
- A capability with `middleware_names: ["BearerAuth", "checkApiKey"]` MUST classify as `bearer` (R1 precedence over R2).
- A capability with route `/admin/users` AND `auth_required: false` MUST NOT trigger R6; admin route prefix blocks the `none` classification (admin route requires authentication review regardless of the flag).
- A scopes annotation `scopes: ["read:user", "read:user", "write:user"]` MUST dedupe to `["read:user", "write:user"]` preserving first-occurrence order.
- A scopes annotation `scopes: ["read:user", "Read:User"]` MUST preserve both entries (case-sensitive dedup); `"Read:User"` is a distinct scope.

### Local-Only Invariants

| Invariant | Requirement |
|-----------|-------------|
| Pure function | `classifyAuthRequirements` has no I/O, no network, no clock, no filesystem reads beyond the manifest record |
| Deterministic | Same manifest record → same `auth_requirements`, byte-stable across Node.js processes and platforms |
| Closed enums | `auth_scheme` ∈ seven-value set; `evidence_source` ∈ five-value set; no other value, nullable, or wildcard |
| Empty-array invariant | `auth_scopes` and `auth_roles` MUST be `[]` (never `null`, never absent) when zero matches |
| Zero-evidence unknown | Capabilities with no middleware, no route, no `auth_required`, no `sensitivity_class` signal MUST receive `unknown` (never silently `"none"`) |
| Zero new dependencies | `package.json` MUST NOT gain `passport`, `jsonwebtoken`, `oauth2-server`, or any AAA library |
| Compile-output-invariant | `tusq compile` output is byte-identical before and after M29 adoption |
| Serve-surface-invariant | `tusq serve` `tools/list` / `tools/call` / `dry_run_plan` response shapes do NOT include `auth_requirements` |

### Docs and Tests Required Before Implementation

- `src/cli.js` — add `classifyAuthRequirements(cap)` pure function and call it on every capability in manifest generation; update `tusq review` to render `auth_requirements` per capability and accept optional `--auth-scheme <scheme>` filter (mutually compatible with `--sensitivity`); update `tusq docs` to include `auth_requirements` in per-capability sections; verify `tusq diff` already surfaces the field change (no change needed if diff compares `capability_digest` — digest flip is automatic from M13).
- `SYSTEM_SPEC.md` — this M29 section (already present after this edit); `## Constraints` gains Constraint 22.
- `README.md` — add one line under the manifest shape description noting `auth_requirements` is computed by a static rule table; link to docs for the frozen rule table.
- `website/docs/manifest-format.md` — add an "Auth Requirements" subsection documenting the seven-value `auth_scheme` enum, the five-value `evidence_source` enum, the six-rule table, the scope/role extraction rules, the zero-evidence `unknown` bucket, the non-attestation boundary, and the `--auth-scheme` filter on `tusq review`.
- `website/docs/cli-reference.md` — update `tusq review` entry with `--auth-scheme` flag (and document mutual compatibility with `--sensitivity`) and note that `tusq docs` and `tusq diff` now surface `auth_requirements`.
- `tests/smoke.mjs` — add the 8-case smoke matrix (AC-8); add an assertion that `tusq compile` output is byte-identical for two capabilities differing only in `auth_requirements`; add assertions that `tusq review --auth-scheme bearer` filters correctly, that an unknown filter value exits 1 with empty stdout, and that `--sensitivity` + `--auth-scheme` intersect AND-style.
- `tests/evals/governed-cli-scenarios.json` — add ≥3 eval regression scenarios: (1) bearer-token middleware detection precedence over generic `auth_required` (R1 wins); (2) scopes-array extraction with mixed-order declaration verifying preserved order and deduplication; (3) zero-evidence `unknown` bucket with empty `auth_scopes`/`auth_roles` arrays. Total eval scenarios become **≥16**.
- `tests/evals/governed-cli-scenarios.json` — verify AC-7 golden-file: a scenario that compiles two identical capabilities differing only in `auth_requirements` and asserts identical compiled tool output; a serve-surface assertion that `tools/list` / `tools/call` response shapes contain no `auth_requirements` key.

The dev role is accountable for implementing all items above. The QA role is accountable for independently re-verifying them as REQ-116+ acceptance criteria.

## Constraints

1. **Docusaurus version** — Use Docusaurus 3.x (latest stable)
2. **No ejecting** — Use swizzling only if needed for the homepage; prefer the plugin/theme API
3. **Monorepo-friendly** — The `website/` directory is self-contained with its own `package.json`
4. **Brand continuity** — Preserve the Fraunces + Space Grotesk font pairing and color scheme from the current site
5. **Content fidelity** — All user-facing content must be traceable to an accepted planning or launch artifact. Do not invent new product claims
6. **M20 local-only invariant** — The opt-in execution-policy scaffold MUST NOT perform live API execution. `tools/call` under any policy mode stays in-process; no outbound HTTP, DB, or socket I/O to the target product. `executed: false` MUST appear in every dry-run response.
7. **M21 local-only invariant** — `tusq policy init` MUST NOT perform any network, manifest, or target-product I/O. Its side effects are limited to writing one JSON file (and creating `.tusq/` if missing) under the repo root, plus stdout/stderr output. The generated file MUST pass `loadAndValidatePolicy()` byte-for-byte so no hidden code path makes the generator drift from the validator.
8. **M21 safe-default invariant** — The default `mode` for a generated policy is `"describe-only"`. An operator must explicitly pass `--mode dry-run` to generate a dry-run policy. The generator never flips describe-only behavior silently.
9. **M22 validator-parity invariant** — `tusq policy verify` and `tusq serve --policy` MUST share `loadAndValidatePolicy()` byte-for-byte. Every acceptance or rejection decision, and every error message, is identical across the two entry points. No standalone re-implementation of validation logic is permitted; any new validator rule lands in `loadAndValidatePolicy()` and is picked up by both paths at once. Smoke-test parity fixtures enforce this invariant at merge time.
10. **M22 local-only invariant** — `tusq policy verify` MUST NOT perform any network, manifest, or target-product I/O in V1.3. Its side effects are limited to reading the policy file path, writing to stdout/stderr, and exiting 0 or 1. It never binds a TCP port, never starts an MCP server, never reads `tusq.manifest.json`, and never invokes a compiled tool.
11. **M23 opt-in-strict invariant** — Strict manifest-aware verification is opt-in via the `--strict` flag on `tusq policy verify`. The default `tusq policy verify` path (no flag) MUST remain byte-for-byte identical to the M22 behavior: no manifest file is opened, no manifest path is resolved, and no new failure mode is exposed. `--strict` is never default, never inferred from filesystem state (e.g., presence of `tusq.manifest.json`), and never toggled by any other flag. `--manifest <path>` is only consulted when `--strict` is set and passing `--manifest` without `--strict` MUST exit 1 with `--manifest requires --strict` before any file is read.
12. **M23 least-privilege-validation invariant** — A passing `tusq policy verify --strict` run is strictly a policy/manifest alignment statement at verify time: every name in `allowed_capabilities` exists in the referenced manifest, is `approved: true`, and is not blocked on review. It is NOT a runtime safety gate. Strict mode MUST NOT be documented, described, or framed as an "execution safety check," a "pre-flight for serve --policy," a "manifest freshness check," a "runtime reachability probe," or any phrase that implies a PASS makes execution safe. Strict mode performs exactly two local filesystem reads (the policy file and the manifest file), writes to stdout/stderr, and exits 0 or 1. It never binds a TCP port, never opens a network socket, never executes any capability, never mutates the manifest, and never reads any other file.
13. **M24 static-literal-extraction invariant** — Fastify `schema.body` extraction is strictly static: the extractor reads source bytes via `fs.readFile` and applies regex + balanced-brace matching on the literal text. It MUST NOT import `fastify`, `ajv`, `@sinclair/typebox`, or any validator runtime; MUST NOT evaluate source code via `require`, `eval`, `new Function`, or `ts-node`; and MUST NOT make any network I/O. When the `schema` value is not a literal object, when `body` is not a literal object, when `properties` is absent, or when any brace/bracket is unbalanced, the extractor MUST drop the entire `schema_fields` record and fall back to M15 behavior byte-for-byte. Partial extraction is forbidden. Manifest output for non-Fastify fixtures and for Fastify routes without a literal `schema.body` block MUST be byte-for-byte identical to HEAD `35b7c9c`.
14. **M24 source-literal-framing invariant** — The extracted `input_schema` shape represents "what the source declares," NOT "what the Fastify runtime would validate." The manifest `input_schema.source` field tags the extraction as `fastify_schema_body`, and docs/README/CLI-help/launch artifacts MUST NOT describe it as "validator-backed," "runtime-validated," "ajv-validated," or any phrase that implies the manifest shape is enforced at runtime by the framework. The defensible framing is "the declared body schema as it appears literally in source." M24 does NOT invoke any JSON-Schema validator; propagation to `tools/call` dry-run validation continues to use the narrow four-rule validator specified under M20. Any future runtime-enforced validation lands under a separate milestone with its own constraint entry.
15. **M25 static-name-matching invariant** — PII field-name redaction hints are produced by a pure function over the already-built `input_schema.properties` object. The matching rule is whole-key case-insensitive comparison after normalization (`toLowerCase()` + strip `_` and `-`) against a frozen canonical set explicitly enumerated in `src/cli.js`. Partial-key, tail-match, or substring matching is forbidden: `email_template_id` MUST NOT match `email`. The extractor MUST NOT read any source file; MUST NOT inspect any value; MUST NOT invoke regex over source text; MUST NOT make network I/O; MUST NOT import any PII-detection or NLP library (no `pii-detector`, no `presidio`, no `compromise`). `redaction.pii_fields` ordering MUST equal the iteration order of `input_schema.properties` (source-literal declaration order from M15/M24). Repeated manifest generations on the same repo MUST produce byte-identical `pii_fields` arrays. Manifest output for capabilities whose `input_schema.properties` contains no canonical PII keys MUST be byte-for-byte identical to HEAD `541abcd`. Any expansion of the canonical set beyond the V1.6 list is a material governance event that MUST land under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry.
16. **M25 redaction-framing invariant** — A non-empty `redaction.pii_fields` array means "the field key matches a well-known PII canonical name." It does NOT mean the field carries PII at runtime, that the route is GDPR/HIPAA/PCI-compliant, or that any payload validation occurs. Docs/README/CLI-help/launch artifacts MUST NOT describe M25 as "PII detection," "PII validation," "PII-validated," "GDPR-compliant," "HIPAA-compliant," "PCI-compliant," "automated redaction," or any phrase that implies regulatory-grade or runtime-enforced PII handling. The defensible framing is "well-known PII field-name hints derived statically from source-declared field keys." M25 MUST NOT auto-escalate `capability.sensitivity_class` on PII match; `sensitivity_class` remains `"unknown"` until an explicit V2 sensitivity-inference increment ships with its own constraint entry. M25 MUST NOT auto-populate `redaction.log_level`, `redaction.mask_in_traces`, or `redaction.retention_days` — those remain `null` in V1.6 and are owned by a future organizational-policy increment.
17. **M26 static-category-labeling invariant** — PII field-name category labels are produced by a pure function over M25's already-emitted `redaction.pii_fields` array plus a frozen `PII_CATEGORY_BY_NAME` lookup enumerated in `src/cli.js`. The extractor MUST NOT read any source file; MUST NOT inspect any value; MUST NOT invoke regex over source text; MUST NOT make network I/O; MUST NOT import any PII-detection, NLP, retention-policy, or compliance library. `redaction.pii_categories` length MUST equal `redaction.pii_fields` length, and entries MUST appear in the same order (one-to-one index correspondence). Category keys are drawn from a frozen nine-entry set: `"email"`, `"phone"`, `"government_id"`, `"name"`, `"address"`, `"date_of_birth"`, `"payment"`, `"secrets"`, `"network"`. Every normalized name in M25's `PII_CANONICAL_NAMES` MUST map to exactly one category in `PII_CATEGORY_BY_NAME`; M25 and M26 freeze together. Any expansion of either the canonical name set or the category set is a material governance event that MUST land under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry. Repeated manifest generations on the same repo MUST produce byte-identical `pii_categories` arrays. When `redaction.pii_fields` is empty, `redaction.pii_categories` MUST be `[]` (never absent).
18. **M26 retention-framing invariant** — A populated `redaction.pii_categories` array means "each entry labels the M25 canonical category that produced the matching `pii_fields` entry." It does NOT mean the capability enforces any retention policy at runtime, does NOT prove regulatory compliance, and does NOT imply the manifest auto-sets retention defaults. Docs/README/CLI-help/launch artifacts MUST NOT describe M26 as "auto-retention," "automated redaction," "retention-policy enforcement," "GDPR-retention-compliant," "HIPAA-retention-compliant," or any phrase that implies runtime retention is governed by the manifest. The defensible framing is "canonical PII field-name category labels derived statically from M25's field-name matches, intended to help reviewers set retention/log/trace policy defaults by hand." M26 MUST NOT auto-populate `redaction.retention_days`, `redaction.log_level`, or `redaction.mask_in_traces` — existing defaults remain `null`, `"full"`, and `false` respectively unless explicitly edited by a reviewer, and those fields are owned by a future organizational-policy increment. M26 MUST NOT auto-escalate `capability.sensitivity_class` — it stays `"unknown"` (Constraint 16 propagates verbatim to M26). M26 MUST NOT filter capabilities in `tusq serve` or in `tusq policy verify --strict` based on category content; M26 is descriptive metadata only.
19. **M27 reviewer-aid-framing invariant** — The `tusq redaction review` subcommand is a reviewer aid, NOT a runtime enforcement gate, NOT a compliance certification, and NOT a substitute for reviewer judgment. Docs/README/CLI-help/launch artifacts MUST NOT describe M27 as "automated PII compliance," "automated redaction policy," "GDPR/HIPAA/PCI-ready check," "pre-flight check for serve," "runtime PII safeguard," "execution-safety gate," or any phrase that implies running the command makes a capability safer at runtime. The defensible framing is "a read-only reviewer report that aggregates the M25 field-name hints, the M26 category labels, and a frozen per-category advisory string for each capability." The V1.8 advisory set is explicitly enumerated in SYSTEM_SPEC § M27 and frozen in `src/cli.js` as `PII_REVIEW_ADVISORY_BY_CATEGORY`. Any addition or wording change is a material governance event that MUST land under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry. Every advisory string ends with a reviewer-directed reminder (it always says what the reviewer still has to decide) and never claims the manifest or the capability is compliant.
20. **M27 read-only invariant** — `tusq redaction review` is strictly read-only. It MUST NOT mutate `tusq.manifest.json`, MUST NOT write to `.tusq/execution-policy.json`, MUST NOT write to `tusq-tools/*.json`, MUST NOT write to `.tusq/scan.json`, MUST NOT create or modify any other repo file. It MUST NOT mutate `capability.redaction.retention_days`, `capability.redaction.log_level`, `capability.redaction.mask_in_traces`, `capability.sensitivity_class`, `capability.approved`, `capability.approved_by`, `capability.approved_at`, or `capability.review_needed`. It MUST NOT re-run the scanner, MUST NOT import `fastify`/`ajv`/`@sinclair/typebox` or any PII/compliance/retention/NLP library, MUST NOT bind a TCP port, MUST NOT start an MCP server, MUST NOT make any network I/O, and MUST NOT invoke any compiled tool. It MUST NOT change the observable behavior of `tusq scan`, `tusq manifest`, `tusq compile`, `tusq serve`, `tusq approve`, `tusq diff`, `tusq docs`, `tusq version`, `tusq policy init`, `tusq policy verify` (default), or `tusq policy verify --strict`. The only observable side effects of a `tusq redaction review` invocation are stdout output, stderr output, and a process exit code; a smoke test asserts that the manifest file's mtime and content are unchanged after any invocation, and that `tusq policy verify` (default and `--strict`) produces byte-identical stdout and exit code before and after running M27 on the same fixture.
21. **M28 sensitivity-class reviewer-aid framing invariant** — `sensitivity_class` is reviewer-aid framing only. It MUST NOT be presented as runtime PII enforcement, automated compliance certification, or GDPR/HIPAA/PCI/SOC2 attestation in any docs, marketing, CLI output, or eval scenario. The closed five-value enum `{public, internal, confidential, restricted, unknown}` is derived purely from already-shipped manifest evidence (verb, route, parameters, redaction PII categories, M13 preserve flag, write-effect markers) by a deterministic pure function (`classifySensitivity`) that performs zero network/runtime/policy calls. The frozen six-rule first-match-wins decision table (R1 preserve→restricted, R2 admin/destructive verb→restricted, R3 PII category→confidential, R4 write+financial-context→confidential, R5 auth_required or narrow_write→internal, R6 default→public) is immutable once M28 ships; any rule change is a material governance event that MUST land under its own ROADMAP milestone. Capabilities with zero static evidence MUST receive `sensitivity_class: "unknown"` — never silently "public." `tusq compile` output MUST be byte-identical regardless of `sensitivity_class` value. `tusq approve` gate logic MUST remain unchanged. `tusq serve` MCP surface MUST be unchanged. The only new CLI surface is an optional `--sensitivity <class>` filter on the existing `tusq review` command; no new top-level noun is introduced and the 13-command CLI surface is preserved exactly.
23. **Run-specific re-affirmation — run_94746c3508844fcb / turn_6551742f923b14ee** — This SYSTEM_SPEC is re-anchored unchanged in run `run_94746c3508844fcb` (turn `turn_6551742f923b14ee`, planning phase, attempt 1) on HEAD `782780b`. The M29 § (Static Auth Requirements Inference from Manifest Evidence — V1.10) and Constraint 22 (M29 auth-requirements reviewer-aid framing invariant) remain frozen as established in the parent run chain. Independent verification on HEAD 782780b: `npm test` exits 0 with `Eval regression harness passed (16 scenarios)`; `node bin/tusq.js help` enumerates exactly the 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help); the only new operator-visible surface from M29 is the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command, mutually compatible with M28's `--sensitivity` via AND-style intersection. The closed seven-value `auth_scheme` enum, closed five-value `evidence_source` enum, frozen six-rule first-match-wins decision table, frozen scope/role extraction rules, AC-4 zero-evidence `unknown` guard (returning `{auth_scheme: "unknown", auth_scopes: [], auth_roles: [], evidence_source: "none"}` — never silently `"none"`), M13 `capability_digest` inclusion driving a one-time re-approval sweep on first post-M29 manifest regeneration, AC-7 `tusq compile` byte-identity invariant AND the stronger MCP-surface invariant (`tusq serve` `tools/list` / `tools/call` / `dry_run_plan` byte-for-byte unchanged, `auth_requirements` MUST NOT appear in any MCP response), zero new dependencies in `package.json` (no `passport`, no `jsonwebtoken`, no `oauth2-server`), and the V1.10 disclosed limitation (the M9/M15 scanner does not set `auth_required`, so R6 is reachable in V1.10 only via manually-edited manifests) all carry forward verbatim. This entry makes no spec mutation; it records this run's independent verification for audit continuity.

22. **M29 auth-requirements reviewer-aid framing invariant** — `auth_requirements` is reviewer-aid framing only. It MUST NOT be presented as runtime authentication enforcement, runtime authorization enforcement, automated AAA certification, OAuth/OIDC/SAML/SOC2/ISO27001 compliance attestation, or token-signature validation in any docs, marketing, README, CLI help, launch artifact, or eval scenario. The closed seven-value `auth_scheme` enum `{bearer, api_key, session, basic, oauth, none, unknown}` and the closed five-value `evidence_source` enum `{middleware_name, route_prefix, auth_required_flag, sensitivity_class_propagation, none}` are derived purely from already-shipped manifest evidence (middleware-name list, route prefix, `auth_required` boolean, `sensitivity_class`, middleware-annotation literals) by a deterministic pure function (`classifyAuthRequirements`) that performs zero network calls, imports zero auth libraries (no `passport`, no `jsonwebtoken`, no `oauth2-server`), reads zero source files beyond what manifest generation already reads, and executes zero compiled tools. The frozen six-rule first-match-wins `auth_scheme` decision table (R1 bearer/jwt/access_token middleware, R2 api_key/x-api-key middleware, R3 session/cookie/passport-local middleware, R4 basic_auth middleware, R5 oauth/oidc/openid middleware, R6 `auth_required === false` AND non-admin route → `none`, default → `unknown`) and the frozen scope/role extraction rules (`/scopes?:\s*\[([^\]]+)\]/` and `/role[s]?:\s*\[([^\]]+)\]/` over middleware-annotation literals only, order-preserving case-sensitive dedup, empty-array on zero matches) are immutable once M29 ships; any rule change is a material governance event that MUST land under its own ROADMAP milestone. Capabilities with zero static evidence MUST receive `auth_requirements: { auth_scheme: "unknown", auth_scopes: [], auth_roles: [], evidence_source: "none" }` — never silently `"none"`. `tusq compile` output MUST be byte-identical regardless of `auth_requirements` value. `tusq approve` gate logic MUST remain unchanged. `tusq serve` MCP surface (`tools/list`, `tools/call`, `dry_run_plan`) MUST be byte-for-byte unchanged and MUST NOT include `auth_requirements` in any response shape. `tusq policy verify` (default and `--strict`) and `tusq redaction review` MUST be byte-for-byte unchanged. The only new CLI surface is an optional `--auth-scheme <scheme>` filter on the existing `tusq review` command (mutually compatible with `--sensitivity`); no new top-level noun is introduced and the 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly.

24. **Run-specific re-affirmation — run_6d12fe85d0e51576 / turn_534487732e1e53b2** — This SYSTEM_SPEC is re-anchored unchanged in run `run_6d12fe85d0e51576` (turn `turn_534487732e1e53b2`, planning phase, attempt 1) on HEAD `b7cd4b0`. The M29 § (Static Auth Requirements Inference from Manifest Evidence — V1.10) and Constraint 22 (M29 auth-requirements reviewer-aid framing invariant) remain frozen as established in the parent run chain. Independent verification on HEAD b7cd4b0: `npm test` exits 0 with `Eval regression harness passed (16 scenarios)`; `node bin/tusq.js help` enumerates exactly the 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help); the only new operator-visible surface from M29 is the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command, mutually compatible with M28's `--sensitivity` via AND-style intersection. The closed seven-value `auth_scheme` enum, closed five-value `evidence_source` enum, frozen six-rule first-match-wins decision table, frozen scope/role extraction rules, AC-4 zero-evidence `unknown` guard (returning `{auth_scheme: "unknown", auth_scopes: [], auth_roles: [], evidence_source: "none"}` — never silently `"none"`), M13 `capability_digest` inclusion driving a one-time re-approval sweep on first post-M29 manifest regeneration, AC-7 `tusq compile` byte-identity invariant AND the stronger MCP-surface invariant (`tusq serve` `tools/list` / `tools/call` / `dry_run_plan` byte-for-byte unchanged, `auth_requirements` MUST NOT appear in any MCP response), zero new dependencies in `package.json` (no `passport`, no `jsonwebtoken`, no `oauth2-server`), and the V1.10 disclosed limitation (the M9/M15 scanner does not set `auth_required`, so R6 is reachable in V1.10 only via manually-edited manifests) all carry forward verbatim. This entry makes no spec mutation; it records this run's independent verification for audit continuity.

25. **Run-specific re-affirmation — run_2ee1a03651d5d485 / turn_2cc0b42362df3fd3** — This SYSTEM_SPEC is re-anchored unchanged in run `run_2ee1a03651d5d485` (turn `turn_2cc0b42362df3fd3`, planning phase, attempt 1) on HEAD `a46d3cb`. The M29 § (Static Auth Requirements Inference from Manifest Evidence — V1.10) and Constraint 22 (M29 auth-requirements reviewer-aid framing invariant) remain frozen as established in the parent run chain. Independent verification on HEAD a46d3cb: `npm test` exits 0 with `Eval regression harness passed (16 scenarios)`; `node bin/tusq.js help` enumerates exactly the 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help). **Vision-derived charter received this turn (intent_1777171732846_289f, p2, charter "[vision] The Promise: embeddable chat, widget, command-palette, and voice surfaces"):** PM has materialized a charter sketch for `tusq surface plan` (a static, deterministic, manifest-only planner for the four embeddable surfaces) in `.planning/ROADMAP_NEXT_CANDIDATES.md`. The charter sketch is **not yet** bound into this SYSTEM_SPEC — binding it requires human approval at the planning_signoff gate and would add a new § (Surface Plan Static Export) plus Constraint 23 (`tusq surface plan` reviewer-aid framing forbidding runtime-chat/widget/palette/voice generation, brand certification, and accessibility-compliance claims). This entry makes no spec mutation; it records this run's independent verification and names the candidate charter for audit continuity.
