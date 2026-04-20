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
| `domain` | string | Inferred from first path segment or controller prefix |
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
| **Cap** | **0.95** |

### 3. `tusq.manifest.json` — The Canonical Artifact

Produced by `tusq manifest`. This is the reviewable contract between code and agents — the central product of tusq.dev.

```json
{
  "schema_version": "1.0",
  "generated_at": "<ISO 8601 timestamp>",
  "source_scan": ".tusq/scan.json",
  "capabilities": [ "<Capability object — see below>" ]
}
```

**Capability object shape:**

```json
{
  "name": "get_users_users",
  "description": "GET /users capability in users domain",
  "method": "GET",
  "path": "/users",
  "input_schema": {
    "type": "object",
    "additionalProperties": true,
    "description": "<inference status>"
  },
  "output_schema": {
    "type": "object",
    "additionalProperties": true,
    "description": "<inference status>"
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
  "provenance": {
    "file": "src/app.ts",
    "line": 12
  },
  "confidence": 0.86,
  "review_needed": false,
  "approved": true,
  "domain": "users"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | `{method}_{domain}_{path_slug}` — unique identifier |
| `description` | string | Human-readable summary |
| `method` | string | HTTP method (uppercased) |
| `path` | string | Route path |
| `input_schema` | object | JSON Schema describing expected input parameters |
| `output_schema` | object | JSON Schema describing expected response shape |
| `side_effect_class` | string | `read` (GET/HEAD/OPTIONS), `write` (POST/PUT/PATCH), or `destructive` (DELETE or destructive handler names) |
| `sensitivity_class` | string | `unknown` (default in V1), `public`, `internal`, `confidential`, or `restricted` — see classification rules below |
| `auth_hints` | string[] | Auth-related middleware/decorators detected |
| `examples` | array | Request/response examples; static describe-only placeholder in V1 — see Examples specification below |
| `constraints` | object | Operational constraints on the capability (rate limits, payload limits, idempotency) — see Constraints specification below |
| `provenance` | object | Source file and line number |
| `confidence` | number | 0.0–0.95 |
| `review_needed` | boolean | `true` when `confidence < 0.8` |
| `approved` | boolean | Human-set gate; only `approved: true` capabilities compile into tools |
| `domain` | string | Logical grouping (inferred from route prefix) |

**V1 input/output schema limitations:** In V1, both `input_schema` and `output_schema` are always `{ "type": "object", "additionalProperties": true }` with a description indicating the inference status. Full schema inference (extracting actual property names and types from DTOs, Zod schemas, or Joi validators) is a V2 goal. The shapes are present and structurally valid JSON Schema, but intentionally conservative.

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

Each transformation is deterministic: the same input produces the same output. The `approved` field is the only human-in-the-loop gate. Nothing compiles without explicit human approval.

## Constraints

1. **Docusaurus version** — Use Docusaurus 3.x (latest stable)
2. **No ejecting** — Use swizzling only if needed for the homepage; prefer the plugin/theme API
3. **Monorepo-friendly** — The `website/` directory is self-contained with its own `package.json`
4. **Brand continuity** — Preserve the Fraunces + Space Grotesk font pairing and color scheme from the current site
5. **Content fidelity** — All user-facing content must be traceable to an accepted planning or launch artifact. Do not invent new product claims
