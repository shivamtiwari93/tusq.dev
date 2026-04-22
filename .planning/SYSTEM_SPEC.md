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

## Constraints

1. **Docusaurus version** — Use Docusaurus 3.x (latest stable)
2. **No ejecting** — Use swizzling only if needed for the homepage; prefer the plugin/theme API
3. **Monorepo-friendly** — The `website/` directory is self-contained with its own `package.json`
4. **Brand continuity** — Preserve the Fraunces + Space Grotesk font pairing and color scheme from the current site
5. **Content fidelity** — All user-facing content must be traceable to an accepted planning or launch artifact. Do not invent new product claims
