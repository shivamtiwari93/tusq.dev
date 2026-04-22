# Release Notes — tusq v0.1.0

## User Impact

tusq v0.1.0 is the first public release of the tusq capability compiler CLI. It gives Node.js developers a repeatable pipeline to:

1. **Scan** their Express, Fastify, or NestJS codebase and extract API routes automatically.
2. **Generate a manifest** (`tusq.manifest.json`) that lists discovered capabilities with confidence scores and domain grouping.
3. **Approve capabilities** by editing the manifest directly, then **compile** them into structured tool-definition JSON files.
4. **Expose** those tools over a describe-only MCP HTTP endpoint (`tusq serve`) that clients can inspect through `tools/list` and describe-only `tools/call`.
5. **Review** the current manifest summary at any time without re-scanning.

This release is intentionally narrow: it gives SaaS teams a governed, review-first way to expose a supported slice of their backend capability surface to MCP-aware tooling without claiming live execution, runtime learning, or broad framework coverage.

## Launch Framing

The broader repository narrative describes where tusq.dev is headed over time. The shipped v0.1.0 product is narrower. For launch messaging, the source of truth is the current `website/` experience plus these release notes, not the longer-horizon README roadmap.

The defendable v0.1.0 position is:

- open-source capability compiler CLI
- Node.js SaaS backends using Express, Fastify, or NestJS
- manual review and approval through `tusq.manifest.json`
- compile approved capabilities into JSON tool definitions
- expose those definitions through a local describe-only MCP endpoint by default
- optional opt-in governance track: scaffold a policy with `tusq policy init`, validate it with `tusq policy verify`, then run `tusq serve --policy` for dry-run plan emission (never live execution)

The shortest accurate launch story is: repo to reviewed manifest to approved tool definitions to inspectable describe-only MCP, with an optional one-command governance track (`tusq policy init` → `tusq policy verify` → `tusq serve --policy`) for teams that want CI-verifiable dry-run plans.

Homepage hero copy, homepage shipped-surface copy, site metadata, and these release notes now all use that same describe-only framing so the first skim and the detailed read make the same promise.

This release should not be described as a live execution engine, hosted platform, plugin ecosystem, runtime learning system, or shipped skill/agent generator.

The prior QA pass proved build and behavior, but it did not by itself validate every launch CTA. One important messaging correction for launch is install-path discipline: until package distribution is confirmed, external copy should not promise a public global install command.

## Website Consolidation

The public tusq.dev surface is now consolidated onto the Docusaurus app in `website/`. This was a migration of the existing live website into the canonical docs/blog app, not the introduction of a parallel third site. The legacy live-site structure from `websites/` was migrated over rather than replaced with template content:

1. The homepage keeps the same hero proposition, three-card explanation band, workflow steps, and V1 shipped-surface grid from the former live site.
2. The not-found experience preserves the legacy recovery pattern by sending users back to the homepage instead of dropping them onto a default Docusaurus error state.
3. The warm gradient, editorial typography, and paper-card styling cues were carried into the Docusaurus theme so docs, blog, and homepage read as one canonical product surface.
4. Site metadata now points to a tusq-specific social share card instead of the Docusaurus default asset, so off-site previews carry the same v0.1.0 positioning as the homepage and release notes.

`websites/` may remain in-repo temporarily for cleanup, but it is no longer the active website that release messaging or deployment readiness depends on.

## Capability Provenance

Each compiled tool definition in `tusq-tools/` carries a `provenance` field that links back to the originating source file and line number where the route was declared:

```json
{
  "name": "get_users_users",
  "provenance": { "file": "src/app.ts", "line": 12 },
  ...
}
```

This provenance chain is preserved end-to-end: `tusq scan` records it in `.tusq/scan.json`, `tusq manifest` carries it into `tusq.manifest.json`, and `tusq compile` writes it into the final tool definition files. The canonical artifact (the compiled tool) is therefore traceable back to the exact line of source code that defines the capability.

## Verification Summary

- Smoke test suite (`node tests/smoke.mjs`) passes end-to-end: scenarios covering all 6 commands, all 3 frameworks, approval persistence, dry-run compile, MCP RPC (including examples/constraints/redaction propagation), and SIGINT shutdown. Includes new framework-specific assertions for Fastify route count, named handler, schema-inferred input_schema, auth_hints, and NestJS guard inheritance and path composition.
- Manual CLI audit confirms correct UX for help, version, invalid commands, invalid flags, and missing-prerequisite errors.
- All 74 acceptance criteria in `.planning/acceptance-matrix.md` have status PASS (25 prior + 3 provenance-chain checks REQ-026–REQ-028 + REQ-029 roadmap page + REQ-030 manifest-format doc + REQ-031 sensitivity_class pipeline + REQ-032 auth_hints MCP runtime + REQ-033 examples/constraints pipeline + REQ-034 redaction/approval-audit pipeline + REQ-035 version-history/digest manifest-only fields + REQ-036 framework-specific deep extraction + REQ-037 first-pass manifest usability + REQ-038 review governance and schema inference + REQ-039–REQ-044 manifest diff and review queue + REQ-045–REQ-049 governed CLI eval regression harness + REQ-050–REQ-053 governed manifest approval CLI + REQ-054–REQ-057 repo-local capability documentation generator + REQ-058–REQ-063 opt-in execution policy / dry-run mode + REQ-064–REQ-069 policy scaffold generator / tusq policy init + REQ-070–REQ-074 policy verify command / tusq policy verify).
- Website consolidation checks pass: homepage structure, 404 behavior, styling cues, and canonical `website/` ownership are explicitly covered in the QA acceptance matrix and ship verdict.
- Provenance chain verified: scan.json, tusq.manifest.json, and tusq-tools/*.json all carry `provenance.{file,line}` on the express fixture end-to-end.
- Fastify scanner defect fixed: `fastify.get(path, {options}, handler)` 3-argument inline form was silently dropped; fix adds a multiline pattern to handle this form before the existing `fastify.route()` block.

## Upgrade Notes

This is an initial release. No migration required.

**Prerequisites:**
- Node.js ≥ 18
- Run from your project root (the directory containing `package.json`)

**Current try path:**
- Clone the repo and run the CLI locally against a supported project
- If you want a shell command during local evaluation, use the repo-local Node workflow rather than assuming a published package exists
- Publish a public package-manager install step only after distribution is confirmed

**Typical workflow:**
```
tusq init
tusq scan .
tusq manifest
tusq approve --all --reviewer you@example.com
tusq compile
tusq serve
```

## Governance Dimensions Shipped

Every compiled capability carries five governance fields through the pipeline (manifest → compile → MCP `tools/call`):

- **`side_effect_class`**: mutation type — `read`, `write`, or `destructive` (inferred from HTTP method and path/handler signals); also in `tools/list`
- **`sensitivity_class`**: data sensitivity — `unknown`, `public`, `internal`, `confidential`, or `restricted` (defaults to `unknown` in V1; manual overrides survive regeneration); also in `tools/list`
- **`auth_hints`**: detected auth/middleware identifiers — string array (empty array means no signal found, not that the endpoint is public); also in `tools/list`
- **`examples`**: usage examples — defaults to a single describe-only placeholder in V1; human-editable in `tusq.manifest.json`; propagates unchanged through compile to `tools/call`
- **`constraints`**: operational limits — five-field object (`rate_limit`, `max_payload_bytes`, `required_headers`, `idempotent`, `cacheable`); all null/empty defaults in V1; human-editable in manifest; propagates to `tools/call`
- **`redaction`**: operational masking/retention policy — four-field object (`pii_fields`, `log_level`, `mask_in_traces`, `retention_days`); permissive V1 defaults (empty pii_fields, full log_level, no masking, no retention limit); human-editable in manifest; propagates to compiled tools and `tools/call`

`side_effect_class`, `sensitivity_class`, and `auth_hints` appear in both `tools/list` and `tools/call` MCP responses. `examples`, `constraints`, and `redaction` appear in `tools/call` only (by design — they are per-capability operational detail, not listing metadata).

Approval audit fields (`approved_by`, `approved_at`) are manifest-only. They are preserved across manifest regeneration and provide a human-readable audit trail for the approval gate, but they are intentionally excluded from compiled tool definitions and all MCP responses.

## Version History and Capability Digest

`tusq.manifest.json` now carries three manifest-only version-history fields that enable change tracking across regenerations:

- **`manifest_version`** (manifest root, integer): starts at 1 and increments by 1 each time `tusq manifest` runs. Provides a monotonic counter for manifest lineage.
- **`previous_manifest_hash`** (manifest root, SHA-256 hex or null): SHA-256 hash of the entire prior manifest file bytes. `null` on first generation. Enables byte-level comparison between manifest generations without storing the full history.
- **`capability_digest`** (per capability, SHA-256 hex): deterministic SHA-256 of the capability's content fields only — name, description, method, path, schemas, all governance fields, provenance, confidence, domain. Explicitly excludes `approved`, `approved_by`, `approved_at`, `review_needed`, and `capability_digest` itself so approval-only edits do not change the digest. Stable key ordering (recursive alphabetical sort) makes the hash deterministic across runs.

These fields are manifest-only. They are not propagated to compiled tool definitions (`tusq-tools/*.json`) or MCP responses (`tools/list`, `tools/call`). They are V1 groundwork for a V2 diff CLI and history store.

## First-Pass Manifest Usability

The v0.1.0 manifest is designed to be usable by an LLM (or a human reviewer) on first pass without manual rewriting:

- **Path parameters are extracted** from route paths (`:id`, `{id}`) into `input_schema.properties` as required string fields tagged with `source: "path"`.
- **Domain inference skips well-known API prefixes** (`api`, `v1`–`v5`, `rest`, `graphql`, `internal`, `public`, `external`) before selecting the first meaningful path segment, so `GET /api/v1/users/:id` infers `domain="users"` rather than `api`.
- **Capability descriptions are generated from a template** (verb + target + side_effect + auth_context + handler) instead of a static `METHOD /path capability in domain domain` string, e.g. `Retrieve user by id - read-only, requires requireAuth (handler: getUser)`.
- **Schema-less routes take a confidence penalty** of `-0.10` in `scoreConfidence`, pushing schema-less named-handler routes with auth below the `0.8` review threshold so they surface as `review_needed=true` instead of silently auto-approving.

## Review Governance

`tusq review` is the approval gate and ships with governance-oriented output:

- **`tusq review --strict`** exits `1` with `Review gate failed: N unapproved, M low confidence.` on stderr when any capability is unapproved or flagged as low confidence. Exits `0` once every capability is approved and not flagged. Intended for CI use between manifest generation and compile.
- **`tusq review --verbose`** prints one line per capability with inferred `inputs=…`, `returns=…`, and `source=<file>, handler=<fn>, framework=<framework>` so reviewers see the inferred shape and provenance before approving.
- **Inferred input and output schemas** fill in obvious shapes so the manifest is not empty for first-pass consumers: write methods get `input_schema.properties.body` with `source: "request_body"`; handlers that return `res.json([…])` or `res.json({…})` produce `output_schema.type="array"` or an object schema with inferred primitive types for simple literal returns (e.g. `{ ok: true }` → `properties.ok.type="boolean"`).
- **Provenance carries `framework` and `handler`** through scan, manifest, and compiled tools so the review output and downstream tooling can show where a capability came from.

## Repo-Local Capability Documentation

`tusq docs` generates a Markdown document from your `tusq.manifest.json` without network access, execution, or external dependencies:

- Reads any manifest file (default `tusq.manifest.json`; override with `--manifest <path>`)
- Writes to stdout by default; use `--out <path>` to write a file instead
- Covers manifest metadata (`manifest_version`, `previous_manifest_hash`, `source_scan`) and per-capability sections (approval status, governance fields, input/output schemas, examples, constraints, redaction, and provenance)
- Capabilities are sorted deterministically by name so output is stable across repeated runs on the same manifest

Intended use: drop the generated Markdown into a wiki, PR description, or review ticket so stakeholders can read capability contracts without running the CLI.

## Opt-In Execution Policy (M20 — V1.1)

`tusq serve` now accepts an optional `--policy <path>` flag that loads a governance policy file from `.tusq/execution-policy.json` (or any explicit path). Without `--policy`, behavior is byte-for-byte identical to V1 describe-only. With `--policy`, the server enforces the declared mode:

- **`mode: "describe-only"`** — No change to `tools/call` behavior. Identical to running without `--policy`. Useful for attaching reviewer/audit metadata to describe-only deployments.
- **`mode: "dry-run"`** — `tools/call` returns a dry-run plan instead of the live schema response. The plan includes argument validation, path parameter substitution, method and path echoed from the compiled tool, a `plan_hash` (SHA-256 over canonical `{body, headers, method, path, path_params, query}`, sorted), and a `policy` echo (`mode`, `reviewer`, `approved_at`). `executed: false` is always present — no live API execution occurs under any policy mode.

**Policy file format** (`.tusq/execution-policy.json`):
```json
{
  "schema_version": "1.0",
  "mode": "dry-run",
  "allowed_capabilities": ["get_users_api_v1_users_id"],
  "reviewer": "ops@example.com",
  "approved_at": "2026-04-22T00:00:00Z"
}
```

**Startup failure UX** — `tusq serve --policy <path>` exits 1 with actionable messages for: missing file, invalid JSON, unsupported `schema_version`, unknown `mode`, and invalid `allowed_capabilities` type.

**Argument validation (V1.1 scope)** — Required field enforcement, primitive type checks (string/number/integer/boolean), and `additionalProperties: false` rejection. Returns JSON-RPC `-32602` with `data.validation_errors: [{path, reason}]` on failure. Object, array, and null typed parameters are not strictly validated in V1.1.

**Approval gate invariant preserved** — `allowed_capabilities` is a strict subset filter on top of the existing approval gate. Only approved capabilities appear in `tools/list`; `allowed_capabilities` cannot bypass that requirement.

**New eval scenarios** — Two new `tests/evals/governed-cli-scenarios.json` scenarios (`policy-dry-run-plan-shape`, `policy-dry-run-approval-gate`) extend the regression harness to 4 scenarios.

## Policy Scaffold Generator (M21 — V1.2)

`tusq policy init` generates a valid `.tusq/execution-policy.json` file that passes the M20 `loadAndValidatePolicy()` validator without any manual JSON authoring:

```
tusq policy init [--mode <describe-only|dry-run>] [--reviewer <id>] \
  [--allowed-capabilities <name,...>] [--out <path>] [--force] [--dry-run]
```

**Default behavior** — Running `tusq policy init` without flags produces a `mode:"describe-only"` policy (SYSTEM_SPEC Constraint 8: describe-only is always the safe default). The `approved_at` field is stamped at generation time as ISO-8601 and is not overridable from the CLI. The `reviewer` field is resolved from the `TUSQ_REVIEWER` environment variable, then `TUSQ_REVIEWER_ID`, then falls back to `"unknown"`.

**Flag surface:**
- `--mode dry-run` — generates a dry-run policy instead of describe-only
- `--allowed-capabilities a,b` — comma-separated list; trimmed, deduplicated, and validated (exits 1 on empty result)
- `--out <path>` — output path (defaults to `.tusq/execution-policy.json`)
- `--force` — overwrite an existing file; without this flag, exits 1 with `Policy file already exists:` if the target already exists
- `--dry-run` — prints the generated JSON to stdout and does NOT write the file
- `--json` / `--verbose` — standard output format flags

**Generator/validator alignment** (SYSTEM_SPEC Constraint 7) — Generated files pass `loadAndValidatePolicy()` byte-for-byte. The M21 round-trip smoke test (REQ-068) confirms this invariant: it generates a dry-run policy then starts `tusq serve --policy <generated>` to verify the server accepts the output.

**New eval scenario** — `policy-init-generator-round-trip` extends the governed-cli eval harness to 5 scenarios, asserting that a generated dry-run policy produces the same `tools/call dry_run_plan` shape as a hand-authored policy.

## Policy Verify Command (M22 — V1.3)

`tusq policy verify` validates an execution policy file against the same `loadAndValidatePolicy()` validator used by `tusq serve --policy`. It provides a fast, CI-friendly pre-flight check without starting a server.

**Why it matters** — Before M22, the only way to confirm a policy would be accepted by `tusq serve --policy` was to start the server. That is slow in CI and conflates policy validity with server startup failures. `tusq policy verify` closes the loop between `tusq policy init` (M21, scaffold) and `tusq serve --policy` (M20, enforce) with a dedicated, non-server validation step that fails fast in CI, returns a machine-readable JSON result under `--json`, and — critically — shares the exact same validator as the server (REQ-074 parity), so a `verify` PASS is a provable guarantee that `serve --policy` will accept the same file.

**Usage:**
```
tusq policy verify [--policy <path>] [--json] [--verbose]
```

Default policy path is `.tusq/execution-policy.json`; override with `--policy <path>`.

**Exit behavior:**
- Exit 0: policy is valid. Human-readable output: `Policy valid: <path> (mode: <mode>, reviewer: <reviewer>, allowed_capabilities: <unset|N>)`
- Exit 1: policy is invalid. Error message goes to stderr (or stdout under `--json`).

**Error conditions** (all exit 1, messages match `tusq serve --policy` exactly — shared validator):
- `Policy file not found: <path>` — file does not exist
- `Invalid policy JSON at: <path>` — file is not valid JSON
- `Unsupported policy schema_version: <v>. Supported: 1.0` — unknown schema version
- `Unknown policy mode: <mode>. Allowed: describe-only, dry-run` — unknown mode
- `Invalid allowed_capabilities in policy: must be an array of strings` — non-array type

**`--json` output shape:**

Success:
```json
{
  "valid": true,
  "path": "/path/to/execution-policy.json",
  "policy": {
    "schema_version": "1.0",
    "mode": "dry-run",
    "reviewer": "ops@example.com",
    "approved_at": "2026-04-22T07:43:59.949Z",
    "allowed_capabilities": null
  }
}
```

Failure:
```json
{
  "valid": false,
  "path": "/path/to/execution-policy.json",
  "error": "Unsupported policy schema_version: 9.9. Supported: 1.0"
}
```

**Parity guarantee** (REQ-074) — `tusq policy verify` and `tusq serve --policy` call `loadAndValidatePolicy()` without modification. Every error message emitted by `verify` is byte-identical to the error emitted by `serve --policy` for the same bad fixture. There is no standalone re-implementation of validation logic.

**All 74 acceptance criteria** (REQ-001–REQ-074) pass on HEAD 3e95062: `npm test` exits 0 with `Smoke tests passed` and `Eval regression harness passed (5 scenarios)`.

## Known V1 Limits And Non-Claims

- **Heuristic scanner:** Route extraction uses regex-based static analysis, not a full AST. Complex dynamic route registration patterns may be missed or produce low-confidence results. Users should review the manifest before compiling.
- **Describe-only and dry-run MCP:** `tusq serve` returns capability schemas and (with `--policy`) dry-run plans. Neither mode proxies or executes live API calls. Full execution support is planned for V2.
- **No plugin API:** Framework support (Express, Fastify, NestJS) is hardcoded. Community framework plugins are deferred to V2.
- **JavaScript/TypeScript only:** Python, Go, Java, and other ecosystems are not supported in V1.
- **Non-interactive review:** `tusq review` prints to stdout only. An interactive TUI for in-terminal approval is planned for V1.1.
- **Distribution still needs explicit confirmation:** the launch narrative should drive repo-local evaluation until a public package channel is actually available
