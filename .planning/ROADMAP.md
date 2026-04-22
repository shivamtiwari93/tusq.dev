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

### M13: Version History and Diffs Specification (~0.5 day)
- [x] Add `manifest_version` (integer, auto-incrementing) and `previous_manifest_hash` (SHA-256 hex | null) to manifest root shape in SYSTEM_SPEC.md
- [x] Add `capability_digest` (SHA-256 hex of content fields) to manifest Capability object shape in SYSTEM_SPEC.md
- [x] Formally specify Version History and Diffs: manifest-level version fields, per-capability digest computation rules, agent implications, V1 limitations (no diff CLI, no history file, no auto re-approval), pipeline propagation (manifest-only)
- [x] Specify V2 diff tooling roadmap: `tusq diff` command, structured diff output format, diff-aware re-approval, manifest history file, git integration, CI/CD diff gate
- [x] Update manifest root shape to include new fields alongside existing `schema_version`, `generated_at`, `source_scan`
- [x] Document the seven-field governance model: side_effect_class + sensitivity_class + auth_hints + examples + constraints + redaction/approval metadata + version history/diffs

### M14: Framework Support Depth Specification (~0.5 day)
- [x] Add per-framework detection matrix to SYSTEM_SPEC.md documenting what V1 extracts for Express, Fastify, and NestJS
- [x] Document why Node.js-only is the correct V1 scope (depth over breadth, shared infrastructure, target audience)
- [x] Document V1 framework detection limitations (regex-based, no router composition, single-file scope)
- [x] Specify V2 framework expansion plan (Django REST, FastAPI, Flask, Spring Boot, Gin/Echo) with priority and rationale
- [x] Document V2 plugin interface for community framework adapters

### M15: First-Pass Manifest Usability (~1 day)
- [x] Implement path parameter extraction in `finalizeRouteInference()` — extract `:param` and `{param}` tokens from route paths into `input_schema.properties` with `required` array
- [x] Implement smart domain inference in `inferDomain()` — skip common API prefixes (`api`, `v1`–`v5`, `rest`, `graphql`, `internal`, `public`, `external`) before selecting first meaningful segment
- [x] Implement rich capability descriptions in `describeCapability()` — use verb/noun/qualifier/side_effect/auth_context template instead of static "METHOD /path capability in domain domain"
- [x] Implement honest confidence penalty in `scoreConfidence()` — subtract 0.10 when no schema hint is detected, pushing schema-less routes below `review_needed` threshold of 0.8
- [x] Update smoke tests to assert: path params appear in `input_schema.properties`, domain inference skips prefixes, descriptions contain handler name and auth context, confidence is below 0.8 for schema-less routes with named handler + auth
- [x] Update `website/docs/manifest-format.md` to document path parameter extraction, rich descriptions, and updated confidence scoring

### M16: Manifest Diff and Review Queue (~1 day)
- [x] Add `tusq diff` command to compare two manifest files with explicit `--from <path>` and `--to <path>` inputs
- [x] Default `tusq diff` to comparing the current `tusq.manifest.json` against the predecessor implied by `previous_manifest_hash` only when a predecessor file is available locally
- [x] Emit a human-readable diff summary with added, removed, changed, and unchanged capability counts
- [x] Emit `--json` output using the planned structured diff shape from SYSTEM_SPEC.md
- [x] Detect changed capabilities by `capability_digest` and report field-level changes for changed records
- [x] Generate a review queue for added, changed, unapproved, and `review_needed` capabilities
- [x] Add `--fail-on-unapproved-changes` to exit non-zero when added or changed capabilities are not approved
- [x] Update `tusq help`, command reference docs, manifest docs, README examples, and smoke tests for the new diff workflow

### M17: Governed CLI Eval/Regression Harness (~0.5 day)
- [x] Add versioned eval scenarios for governed CLI workflows in `tests/evals/governed-cli-scenarios.json`
- [x] Add an executable Node eval runner in `tests/eval-regression.mjs`
- [x] Validate review-gate behavior for low-confidence/unapproved capabilities before compile
- [x] Validate compiled tool-call metadata including auth hints, side-effect class, schema sources, examples, constraints, redaction, and manifest-only approval metadata boundaries
- [x] Validate manifest diff review queues and CI failure behavior for changed unapproved capabilities
- [x] Wire the eval harness into `npm test` alongside the existing smoke suite

### M18: Governed Manifest Approval CLI (~0.5 day)
- [x] Add `tusq approve` command for repo-local manifest approval without hand-editing approval fields
- [x] Support one-capability approval by name and intentional `--all` approval for unapproved or review-needed capabilities
- [x] Record reviewer identity and ISO timestamp in `approved_by` and `approved_at`
- [x] Clear `review_needed` when a capability is approved so `tusq review --strict` can pass after reviewer action
- [x] Support `--dry-run`, `--json`, and `--manifest <path>` for safe review and automation
- [x] Update smoke coverage, CLI help, README, docs, and planning references for the approval workflow

### M19: Repo-Local Capability Documentation Generator (~0.5 day)
- [x] Add `tusq docs` command to generate Markdown capability documentation from a local manifest
- [x] Support `--manifest <path>` to specify a non-default manifest file
- [x] Support `--out <path>` to write generated Markdown to a file instead of stdout
- [x] Render manifest metadata (version, hash, scan reference) and per-capability sections (approval, governance, schema, examples, constraints, redaction, provenance) in deterministic sorted order
- [x] Update CLI help, README, and website CLI-reference docs for the docs command
- [x] Add smoke coverage for stdout output, --manifest, --out, generated sections, approval metadata, and deterministic output

### M20: Opt-In Local Execution Policy Scaffold for MCP serve (~0.5 day)
- [x] Specify `.tusq/execution-policy.json` shape (`schema_version`, `mode: "describe-only" | "dry-run"`, optional `allowed_capabilities`) in SYSTEM_SPEC.md
- [x] Add `tusq serve --policy <path>` flag that activates dry-run validation mode; absent flag preserves V1 describe-only behavior byte-for-byte
- [x] Extend `tools/call` under `mode: "dry-run"` to accept `params.arguments`, validate them against the approved compiled tool's `parameters` schema (required fields enforced, `additionalProperties` respected), and return a structured `dry_run_plan` object
- [x] `dry_run_plan` fields: `method`, `path`, `path_params`, `query`, `body`, `headers`, `auth_context`, `side_effect_class`, `sensitivity_class`, `redaction`, `plan_hash` (SHA-256 of canonical plan content), and `evaluated_at` (ISO-8601 UTC)
- [x] Emit JSON-RPC error `-32602` with `data.validation_errors` (array of `{path, reason}`) when argument validation fails; no plan is produced
- [x] Keep execution fully local/offline — no HTTP request, DB call, or network I/O to the target product under any policy mode
- [x] Policy resolution errors (missing file when `--policy` is set, invalid JSON, unknown `mode`, unsupported `schema_version`) exit 1 at serve startup with an actionable message
- [x] Add smoke coverage for policy-off (describe-only unchanged), policy-on dry-run success, validation failure paths, and plan_hash determinism
- [x] Add eval regression scenarios for dry-run plan structure, approval-gate enforcement (unapproved capabilities remain invisible to `tools/list` and reject in `tools/call`), and validation-error surfaces
- [x] Update CLI help, README, and website CLI-reference docs to describe the `--policy` flag and `.tusq/execution-policy.json` shape; add an `execution-policy.md` docs page

### M21: Execution Policy Scaffold Generator (~0.5 day)
- [x] Add `tusq policy init` command that scaffolds a valid `.tusq/execution-policy.json` with sensible defaults, so operators no longer hand-author the M20 policy file
- [x] Default output path is `.tusq/execution-policy.json`; parent directory created if missing; honor `--out <path>` to write elsewhere
- [x] Default `schema_version: "1.0"` and `mode: "describe-only"` (the safest possible V1.2 default — preserves describe-only behavior even when `tusq serve --policy` is invoked with the generated file)
- [x] Support `--mode <describe-only|dry-run>` to select the generated mode; any other value exits 1 with an actionable message before any file is written
- [x] Support `--reviewer <id>` with the same env-chain fallback used by `tusq approve` (`TUSQ_REVIEWER`, `USER`, `LOGNAME`, then literal `"unknown"`); the reviewer identity is written to the generated `reviewer` field
- [x] Stamp `approved_at` as the ISO-8601 UTC generation timestamp
- [x] Support `--allowed-capabilities <name,name,...>` to set an initial scope filter; omitting the flag leaves `allowed_capabilities` unset (meaning "all approved"); empty or whitespace-only list exits 1
- [x] Support `--force` to overwrite an existing target file; without `--force`, a pre-existing target exits 1 with `Policy file already exists:` and the path; `--dry-run` prints the would-be content to stdout without writing and without requiring `--force`
- [x] Support `--json` for a machine-readable confirmation (path, mode, reviewer, approved_at, allowed_capabilities) intended for automation
- [x] Keep the command fully local/offline — no network I/O, no target-product calls, no MCP handshake; file I/O only
- [x] The generated file MUST pass `loadAndValidatePolicy()` byte-for-byte so `tusq serve --policy <generated path>` succeeds without any further human edits
- [x] Add smoke coverage for default generation, `--mode dry-run`, `--allowed-capabilities`, `--force` overwrite vs exit-1 existing-file path, `--dry-run` no-write behavior, and a round-trip that loads the generated file through `loadAndValidatePolicy()`
- [x] Update CLI help, README, `website/docs/cli-reference.md`, and `website/docs/execution-policy.md` to describe the new `policy init` command and link it from the `tusq serve --policy` walkthrough

### M22: Execution Policy Verifier (~0.5 day)
- [x] Add `tusq policy verify` subcommand that runs the same `loadAndValidatePolicy()` as `tusq serve --policy` but without starting a server, so operators can gate CI and pre-commit hooks on policy validity
- [x] Default `--policy` target is `.tusq/execution-policy.json`; honor `--policy <path>` to validate a non-default file
- [x] Exit 0 on a policy that `loadAndValidatePolicy()` accepts; exit 1 on any validator rejection (missing file, bad JSON, unsupported `schema_version`, unknown `mode`, invalid `allowed_capabilities`)
- [x] Every failure message MUST be byte-for-byte identical to the message `tusq serve --policy` emits at startup for the same input; no wording divergence permitted
- [x] Default stdout summary on success: `Policy valid: <path> (mode: <mode>, reviewer: <reviewer>, allowed_capabilities: <count|unset>)`
- [x] Support `--json` for machine-readable output; on success emit `{valid:true, path, policy: {schema_version, mode, reviewer, approved_at, allowed_capabilities}}`; on failure emit `{valid:false, path, error}` to stdout and still exit 1
- [x] Support `--verbose` to echo the resolved path and validator diagnostics to stderr
- [x] Keep the command fully local/offline — no network I/O, no TCP bind, no MCP handshake, no target-product call, no manifest read in V1.3
- [x] Reuse the existing `loadAndValidatePolicy()` function from the M20 serve path; no standalone re-implementation of validation logic is permitted (the validator is the contract)
- [x] Add smoke coverage for: (a) successful verification of a default `tusq policy init` output, (b) exit-1 on missing file, malformed JSON, unsupported `schema_version`, unknown `mode`, and non-array `allowed_capabilities`, (c) `--json` success and failure shapes, (d) parity fixtures that confirm `tusq policy verify` and `tusq serve --policy` produce the same exit code and the same message for every failure case
- [x] Add one eval regression scenario asserting the round-trip `tusq policy init` → `tusq policy verify` is stable (generator/verifier/validator remain aligned)
- [x] Update CLI help, README, `website/docs/cli-reference.md`, and `website/docs/execution-policy.md` to describe the new `policy verify` subcommand and link it from both the `tusq policy init` and `tusq serve --policy` walkthroughs

### M23: Opt-In Strict Policy Verifier (Manifest-Aware) (~0.5 day)
- [ ] Add `--strict` flag to the existing `tusq policy verify` subcommand that cross-references the policy file's `allowed_capabilities` against `tusq.manifest.json` in addition to the M22 policy-file validation
- [ ] `--strict` is strictly opt-in; default `tusq policy verify` (no flag) MUST remain byte-for-byte identical to M22 behavior (no manifest I/O, no new failure modes, no inspection of the manifest file even when it exists at the default path)
- [ ] Add `--manifest <path>` flag that is consulted ONLY when `--strict` is set; default manifest path is `tusq.manifest.json` in the current working directory
- [ ] Under `--strict`, exit 1 with `Manifest not found:` followed by the path when the manifest file does not exist; M22 failure modes still apply first (policy-file validation is evaluated before any manifest I/O)
- [ ] Under `--strict`, when `allowed_capabilities` is an array, every listed name MUST (a) exist as a capability in the manifest, (b) have `approved: true`, and (c) NOT have `review_needed: true`
- [ ] Under `--strict`, when `allowed_capabilities` is unset (meaning "all approved"), strict mode MUST pass on the alignment check (unset is semantically broader-than-manifest and cannot name a non-existent capability)
- [ ] Strict-mode failure messages: `Strict policy verify failed: allowed capability not found in manifest: <name>`; `Strict policy verify failed: allowed capability not approved: <name>`; `Strict policy verify failed: allowed capability requires review: <name>`; each message is emitted once per offending name in deterministic order
- [ ] Strict-mode human summary on success: `Strict policy verify passed: <path> (manifest: <manifest-path>, allowed_capabilities: <count|unset>, approved: <count>)`
- [ ] Strict-mode `--json` success shape extends the M22 shape with `{manifest_path, manifest_version, approved_allowed_capabilities}`; strict-mode `--json` failure shape extends the M22 shape with `{strict_errors: [{name, reason}]}`
- [ ] Keep the command fully local/offline under `--strict` — `--strict` reads ONLY the policy file and the manifest file; no network I/O, no TCP bind, no MCP handshake, no target-product call, no execution of any capability
- [ ] Strict mode does NOT validate manifest freshness (`previous_manifest_hash`, `manifest_version` chaining), does NOT verify schema-source quality, does NOT execute a dry-run plan — a PASS is strictly a policy/manifest alignment statement at verify time
- [ ] Add smoke coverage for: (a) default `tusq policy verify` behavior is byte-for-byte identical to M22 (no manifest I/O) even when a manifest exists, (b) `--strict` exit 0 on a generated policy whose `allowed_capabilities` are approved in the manifest, (c) `--strict` exit 1 when an allowed capability is absent from the manifest, (d) `--strict` exit 1 when an allowed capability is present but unapproved, (e) `--strict` exit 1 when an allowed capability has `review_needed: true`, (f) `--strict` exit 1 when the manifest file is missing, (g) `--strict --json` success and failure shapes, (h) `--strict` with `allowed_capabilities` unset passes on a populated manifest
- [ ] Add one eval regression scenario asserting that `tusq policy verify --strict` produces deterministic strict_errors ordering across repeated runs on the same fixture
- [ ] Update CLI help, README, `website/docs/cli-reference.md`, and `website/docs/execution-policy.md` to describe the new `--strict` flag, the `--manifest` flag, the strict-mode failure cases, and the explicit narrative that a PASS is a least-privilege alignment statement, not a runtime execution safety guarantee

## Key Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content drift from product truth | Overclaiming damages credibility | M7 audit against MESSAGING.md; PM review before merge |
| Docusaurus version/config issues | Build failures | Pin to latest stable 3.x; use default plugins only |
| Brand inconsistency with current site | Jarring visual transition | Migrate exact colors/fonts from existing CSS |
| Docs become stale as CLI evolves | User confusion | Docs are derived from spec; updating spec triggers doc update |
| M20 dry-run plan mistaken for live execution | Operator confusion, false safety expectations | Dry-run response carries an explicit `executed: false` marker and `V1_DRY_RUN_NOTE` string; docs reserve live execution for a later increment |
| Execution policy drift between manifest governance and serve | Approved capabilities could expose unvalidated plans if policy parser bypasses approval | `tools/list` and `tools/call` continue to filter by `approved: true`; policy mode never relaxes the approval gate |
| M21 default flipping operators into dry-run by accident | Operators expect describe-only semantics but get dry-run plan responses | `tusq policy init` defaults to `mode: "describe-only"`; switching to dry-run requires an explicit `--mode dry-run` flag and is echoed in stdout and `--json` confirmation |
| M21 generator drift from `loadAndValidatePolicy()` | Generated policy could fail validation at `tusq serve --policy` time, breaking operator onboarding | Smoke test performs a round-trip: generate → `loadAndValidatePolicy()`; any drift in the validator or generator surfaces as a failing test before merge |
| M22 verifier/server validator divergence | A `tusq policy verify` pass that `tusq serve --policy` rejects (or vice versa) would destroy the only governance contract the verifier ships | Dev MUST reuse `loadAndValidatePolicy()` — no standalone validator. Smoke parity fixtures assert identical exit code and error message for every failure case before merge (SYSTEM_SPEC Constraint 9) |
| M22 scope creep into manifest-aware strict mode | Adding manifest cross-reference in V1.3 would violate the local-only boundary and conflate policy-file validation with capability-approval validation | Scope boundary table explicitly reserves manifest-aware `--strict` for V2; V1.3 is strictly a policy-file validator; Constraint 10 forbids manifest reads under `policy verify` |
| M23 accidental strict-default / CI regression on existing `tusq policy verify` callers | If `--strict` is silently activated (e.g. auto-on when a manifest exists), every existing M22 CI job starts failing on pre-manifest scaffolds and pre-approval policies for no operator benefit | `--strict` is strictly opt-in (SYSTEM_SPEC Constraint 11); default `tusq policy verify` preserves M22 behavior byte-for-byte; a smoke test asserts the default path does not open `tusq.manifest.json` even when it exists |
| M23 strict PASS misread as runtime execution safety | Narrative drift: a passing `--strict` run could be framed as "safe to execute," causing operators to skip further review or tighten the approval gate prematurely | SYSTEM_SPEC Constraint 12 codifies strict PASS as a policy/manifest alignment statement only; docs/README/CLI-help forbid framings like "runtime check," "execution-safety gate," "pre-flight for serve," or any phrase that implies a PASS makes execution safe; launch artifacts inherit the forbidden-framing list |
