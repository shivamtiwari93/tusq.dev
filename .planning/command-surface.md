# Site Surface — tusq.dev Docs & Website Platform

## M16 Product CLI Surface

M16 adds the first active diff command on top of the manifest version fields already specified in SYSTEM_SPEC.md. REQ-039 through REQ-044 passed on 2026-04-21.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq diff` | Compare manifest versions and surface capability changes | Diff computed successfully and no requested gate failed |
| `tusq diff --from old.json --to new.json` | Compare two explicit manifest files | Added, removed, changed, and unchanged counts were computed |
| `tusq diff --json --from old.json --to new.json` | Emit machine-readable structured diff output | stdout is parseable JSON matching SYSTEM_SPEC.md |
| `tusq diff --review-queue --from old.json --to new.json` | Print capabilities requiring review after a manifest change | Review queue was computed from added, changed, unapproved, and review-needed capabilities |
| `tusq diff --fail-on-unapproved-changes --from old.json --to new.json` | CI gate for changed capabilities that lack approval | All added or changed capabilities are approved and no gate failed |
| `tusq approve <capability-name>` | Approve one manifest capability with reviewer audit metadata | Capability exists and was approved in the manifest |
| `tusq approve --all` | Approve all unapproved or review-needed manifest capabilities intentionally | All selected capabilities were approved in the manifest |

### `tusq approve` Options

| Option | Description | Default |
|--------|-------------|---------|
| `[capability-name]` | Name of one capability to approve | Required unless `--all` is set |
| `--all` | Approve every unapproved or review-needed capability | Disabled |
| `--reviewer <id>` | Reviewer identity written to `approved_by` | `TUSQ_REVIEWER`, `USER`, or `LOGNAME` |
| `--manifest <path>` | Manifest file to update | `tusq.manifest.json` |
| `--dry-run` | Print selected approvals without writing | Disabled |
| `--json` | Print structured approval output | Human-readable summary |

### `tusq approve` Failure UX

| Failure | User sees |
|---------|-----------|
| Missing target | Message asking for a capability name or `--all` |
| Name and `--all` together | Message explaining that only one selection mode can be used |
| Missing manifest | Message asking the user to run `tusq manifest` first |
| Unknown capability | `Capability not found:` followed by the requested name |

### `tusq diff` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--from <path>` | Previous manifest path | Locally resolvable predecessor when unambiguous; otherwise required for deterministic comparisons |
| `--to <path>` | Current manifest path | `tusq.manifest.json` |
| `--json` | Print structured JSON only | Human-readable summary |
| `--review-queue` | Include capabilities requiring human review | Omitted |
| `--fail-on-unapproved-changes` | Exit 1 if added or changed capabilities are unapproved | Disabled |

### `tusq diff` Failure UX

| Failure | User sees |
|---------|-----------|
| Missing `--from` predecessor | Message explaining that no predecessor manifest could be resolved and asking for `--from <path>` |
| Missing or invalid manifest path | File path plus "manifest not found" or parse error |
| Invalid manifest shape | Missing required root/capability fields listed by name |
| Unapproved change gate failure | `Review gate failed:` followed by capability names requiring approval |

## M20 Product CLI Surface

M20 extends the `tusq serve` command with an opt-in `--policy` flag that activates dry-run argument validation for MCP `tools/call`. No live execution is added. Describe-only stays the default when `--policy` is absent.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq serve` | MCP describe-only server (V1 default, unchanged) | Server bound and accepted describe-only responses |
| `tusq serve --policy <path>` | MCP server with opt-in execution policy loaded | Server bound, policy file validated, policy mode active |

### `tusq serve` Options (M20)

| Option | Description | Default |
|--------|-------------|---------|
| `--port <n>` | TCP port for the local MCP listener | `3333` |
| `--policy <path>` | Path to `.tusq/execution-policy.json`; enables dry-run mode when `mode: "dry-run"` | Unset (describe-only) |
| `--verbose` | Print policy resolution and request logs | Disabled |

### `tusq serve --policy` Failure UX

| Failure | User sees |
|---------|-----------|
| `--policy` path missing | `Policy file not found:` followed by the path provided |
| Policy file is not valid JSON | `Invalid policy JSON at:` followed by the path and parser message |
| Unsupported `schema_version` | `Unsupported policy schema_version:` followed by the value and the list of supported versions |
| Unknown `mode` | `Unknown policy mode:` followed by the value and the list of allowed modes |
| `allowed_capabilities` is not an array of strings | `Invalid allowed_capabilities in policy:` followed by the offending value |
| Policy file present but manifest missing | `Missing manifest:` directing the user to run `tusq manifest` first |

### `tools/call` Dry-Run Response (M20)

When the policy is loaded in `mode: "dry-run"` and the requested capability is approved and listed in `allowed_capabilities` (when set), `tools/call` with a `params.arguments` object returns:

| Field | Meaning |
|-------|---------|
| `executed` | Always `false` under dry-run; never evidence of a performed request |
| `policy.mode` | `"dry-run"` |
| `policy.reviewer` | Audit echo of the policy reviewer; never authz |
| `policy.approved_at` | Audit echo of the policy approval timestamp; never authz |
| `dry_run_plan.method` | HTTP method copied from the compiled tool |
| `dry_run_plan.path` | Compiled-tool path with path params substituted from validated arguments |
| `dry_run_plan.path_params` | Validated path parameter map |
| `dry_run_plan.query` | Query parameter object (empty in V1.1) |
| `dry_run_plan.body` | Validated body object or `null` |
| `dry_run_plan.headers` | Default request headers derived from the compiled tool |
| `dry_run_plan.auth_context` | `{hints, required}` derived from manifest `auth_hints` |
| `dry_run_plan.side_effect_class` | Copied from the compiled tool |
| `dry_run_plan.sensitivity_class` | Copied from the compiled tool |
| `dry_run_plan.redaction` | Copied from the compiled tool |
| `dry_run_plan.plan_hash` | SHA-256 hex of canonical `{method, path, path_params, query, body, headers}` |
| `dry_run_plan.evaluated_at` | ISO-8601 UTC timestamp |

### `tools/call` Dry-Run Failure UX (M20)

| Failure | JSON-RPC code | `data` payload |
|---------|---------------|----------------|
| Required argument missing | `-32602` | `validation_errors: [{path, reason: "required field missing"}]` |
| Argument type mismatch | `-32602` | `validation_errors: [{path, reason: "expected <type>, got <actual>"}]` |
| Unknown top-level property when schema is `additionalProperties: false` | `-32602` | `validation_errors: [{path, reason: "unknown property"}]` |
| Capability not in `allowed_capabilities` | `-32602` | `data.reason: "capability not permitted under current policy"` |
| Capability not approved | `-32602` | `data.reason: "capability not approved"` (unchanged from V1 semantics) |

## M21 Product CLI Surface

M21 adds one new local-only command, `tusq policy init`, that scaffolds a valid `.tusq/execution-policy.json` file so operators no longer hand-author the M20 policy artifact. No existing command surface is altered.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq policy init` | Write a default `.tusq/execution-policy.json` with `mode: "describe-only"` | File was written (or `--dry-run` printed content) and passes `loadAndValidatePolicy()` |
| `tusq policy init --mode dry-run` | Generate a dry-run policy instead of the describe-only default | File was written with `mode: "dry-run"` |
| `tusq policy init --allowed-capabilities a,b,c` | Generate a policy scoped to an explicit capability allow-list | File was written with `allowed_capabilities: ["a","b","c"]` |
| `tusq policy init --out custom/path.json` | Write the policy to a non-default location | File was written at the requested path |
| `tusq policy init --force` | Overwrite an existing policy file | Pre-existing file replaced; otherwise file was written |
| `tusq policy init --dry-run` | Print the would-be content to stdout without writing | Content printed; no file created |

### `tusq policy init` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--mode <describe-only\|dry-run>` | Value written to the generated `mode` field | `describe-only` |
| `--reviewer <id>` | Value written to the generated `reviewer` field | `TUSQ_REVIEWER`, then `USER`, then `LOGNAME`, then `unknown` |
| `--allowed-capabilities <name,name,...>` | Comma-separated list written to the generated `allowed_capabilities` array | Omitted (means "all approved capabilities in scope") |
| `--out <path>` | Target file path for the generated policy | `.tusq/execution-policy.json` |
| `--force` | Overwrite the target file if it already exists | Disabled |
| `--dry-run` | Print generated content to stdout; do not write the file | Disabled |
| `--json` | Emit a machine-readable confirmation object to stdout | Human-readable summary |
| `--verbose` | Echo resolved reviewer and target path to stderr | Disabled |

### `tusq policy init` Failure UX

| Failure | User sees |
|---------|-----------|
| Unknown `--mode` value | `Unknown policy mode:` followed by the offending value and the allowed list (`describe-only, dry-run`) |
| Empty or missing `--reviewer` value | `Invalid reviewer: reviewer identity cannot be empty` |
| Empty or malformed `--allowed-capabilities` | `Invalid allowed-capabilities: list cannot be empty or contain empty names` |
| Target file already exists without `--force` | `Policy file already exists:` followed by the path and `Re-run with --force to overwrite.` |
| Target path is unwritable (permission / EISDIR / ENOENT on parent that cannot be created) | `Could not write policy file:` followed by the path and the underlying errno message |
| Unknown flag | Standard CLI error `Unknown option:` followed by the flag name |

### `tusq policy init` Local-Only Invariants

| Invariant | How it shows up at the CLI |
|-----------|----------------------------|
| No network I/O | The command performs no HTTP, DB, or socket call; operators can run it with the network disabled |
| No manifest read | `tusq.manifest.json` is not opened; `--allowed-capabilities` names are accepted verbatim |
| No target-product call | No capability is executed, dry-run or otherwise; the generator never reaches the MCP server |
| Safe default mode | Default `mode` is `describe-only`; `dry-run` requires an explicit `--mode dry-run` flag |
| Validator round-trip | The generated file MUST pass `loadAndValidatePolicy()`; smoke coverage enforces this round-trip |

## M22 Product CLI Surface

M22 adds one new local-only subcommand, `tusq policy verify`, that validates an execution-policy file without starting an MCP server. It shares `loadAndValidatePolicy()` with the M20 `tusq serve --policy` startup path, so every accept/reject decision and every error message is identical across the two entry points. No existing command surface is altered; no new validation depth is added.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq policy verify` | Validate `.tusq/execution-policy.json` (pre-serve, pre-commit, or CI gate) | File passed `loadAndValidatePolicy()`; serve startup would accept this file |
| `tusq policy verify --policy <path>` | Validate a non-default policy file | File at `<path>` passed the shared validator |
| `tusq policy verify --json` | Emit structured verification output to stdout | JSON `{valid:true, path, policy}` printed; exit 0 |
| `tusq policy verify --verbose` | Echo resolved path and validator diagnostics to stderr | Human summary printed; verbose diagnostics on stderr |

### `tusq policy verify` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--policy <path>` | Path to the execution-policy file to validate | `.tusq/execution-policy.json` |
| `--json` | Emit a machine-readable result object to stdout (both success and failure cases) | Human-readable summary (stdout on success, stderr on failure) |
| `--verbose` | Echo resolved path and validator diagnostics to stderr | Disabled |

### `tusq policy verify` Failure UX (Parity with `tusq serve --policy`)

| Failure | User sees (identical across `serve --policy` and `policy verify`) |
|---------|---------|
| Policy file missing / ENOENT | `Policy file not found:` followed by the path |
| Policy file is not valid JSON | `Invalid policy JSON at:` followed by the path and parser message |
| Unsupported `schema_version` | `Unsupported policy schema_version:` followed by the value and the supported list |
| Unknown `mode` | `Unknown policy mode:` followed by the value and the allowed list (`describe-only, dry-run`) |
| `allowed_capabilities` is not an array of strings | `Invalid allowed_capabilities in policy:` followed by the offending value |

### `tusq policy verify` JSON Output Shape

| Case | stdout | exit |
|------|--------|------|
| Success | `{"valid": true, "path": "<resolved>", "policy": {"schema_version","mode","reviewer","approved_at","allowed_capabilities"}}` | `0` |
| Failure | `{"valid": false, "path": "<resolved>", "error": "<same message as non-JSON stderr output>"}` | `1` |

### `tusq policy verify` Local-Only Invariants

| Invariant | How it shows up at the CLI |
|-----------|----------------------------|
| No server startup | `tusq policy verify` never binds a TCP port; it runs synchronously and exits |
| No network I/O | No HTTP, DB, or MCP handshake; operators can run it with the network disabled |
| No manifest read | `tusq.manifest.json` is never opened; the verifier is a pure policy-file validator in V1.3 |
| No target-product call | No capability is executed, dry-run or otherwise; `policy verify` cannot reach the target product |
| Validator parity | `tusq policy verify` and `tusq serve --policy` share `loadAndValidatePolicy()`; a smoke parity fixture asserts identical exit code and error message across the two entry points for every failure case |

## M23 Product CLI Surface

M23 adds one opt-in flag (`--strict`) and one supporting flag (`--manifest <path>`) to the existing `tusq policy verify` subcommand. Under `--strict`, the verifier additionally reads `tusq.manifest.json` and cross-references every name in the policy's `allowed_capabilities` array against the manifest's approval-gated set (existence + `approved: true` + absence of `review_needed: true`). Default behavior (no `--strict`) is byte-for-byte identical to M22 — no manifest I/O, no new failure modes, no change in output. No existing command surface is altered; no new subcommand is introduced.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq policy verify --strict` | Validate policy file AND cross-check `allowed_capabilities` against approved capabilities in `tusq.manifest.json` | Policy passed `loadAndValidatePolicy()` AND every allowed name exists in the manifest, is `approved: true`, and is not `review_needed: true` |
| `tusq policy verify --strict --manifest <path>` | Same as above but consulting a non-default manifest path | Same invariants evaluated against the manifest at `<path>` |
| `tusq policy verify --strict --json` | Emit extended machine-readable verification output under strict mode | JSON `{valid:true, strict:true, path, manifest_path, manifest_version, policy, approved_allowed_capabilities}` printed; exit 0 |
| `tusq policy verify --strict --verbose` | Echo resolved policy + manifest paths and diagnostics to stderr | Human summary printed; verbose diagnostics on stderr |

### `tusq policy verify --strict` Options

| Option | Description | Default |
|--------|-------------|---------|
| `--policy <path>` | Path to the execution-policy file to validate | `.tusq/execution-policy.json` |
| `--strict` | Activate manifest-aware cross-reference on top of the M22 policy-file validation | Disabled (default is M22 behavior) |
| `--manifest <path>` | Path to the manifest consulted under `--strict`; supplying `--manifest` without `--strict` exits 1 before any file is read | `tusq.manifest.json` |
| `--json` | Emit a machine-readable result object to stdout (extended under `--strict`, including `strict_errors` on failure) | Human-readable summary |
| `--verbose` | Echo resolved policy path, manifest path, and diagnostics to stderr | Disabled |

### `tusq policy verify --strict` Failure UX

Strict-mode failure messages are distinct from M22 messages because strict checks are a new governance boundary that `tusq serve --policy` does NOT enforce. The M22 parity contract is preserved: an M22-level rejection still emits the M22 message byte-for-byte whether `--strict` is set or not. Strict-specific failures are emitted ONLY when the M22 validator accepts the policy and `--strict` is set.

| Failure | User sees |
|---------|-----------|
| `--manifest` supplied without `--strict` | `--manifest requires --strict` |
| `--strict` set but manifest file missing | `Manifest not found:` followed by the resolved manifest path |
| `--strict` set but manifest file unreadable | `Could not read manifest file:` followed by the path and the OS error message |
| `--strict` set but manifest is not valid JSON | `Invalid manifest JSON at:` followed by the path and parser message |
| `--strict` set but manifest has no `capabilities` array | `Invalid manifest shape at:` followed by the path and `: missing capabilities array` |
| Strict: allowed capability not in manifest | `Strict policy verify failed: allowed capability not found in manifest:` followed by the name |
| Strict: allowed capability present but `approved: false` | `Strict policy verify failed: allowed capability not approved:` followed by the name |
| Strict: allowed capability present and approved but `review_needed: true` | `Strict policy verify failed: allowed capability requires review:` followed by the name |

Multiple strict failures produce one message line per offending name in the order names appear in `allowed_capabilities`.

### `tusq policy verify --strict` JSON Output Shape

| Case | stdout | exit |
|------|--------|------|
| Success | `{"valid": true, "strict": true, "path": "<policy>", "manifest_path": "<manifest>", "manifest_version": <int>, "policy": {...}, "approved_allowed_capabilities": <int\|null>}` | `0` |
| Strict-check failure | `{"valid": false, "strict": true, "path": "<policy>", "manifest_path": "<manifest>", "error": "<first failure message>", "strict_errors": [{"name":"<name>","reason":"not_in_manifest\|not_approved\|requires_review"}, ...]}` | `1` |
| M22-level failure under `--strict` | `{"valid": false, "strict": true, "path": "<policy>", "manifest_path": null, "error": "<M22 message>", "strict_errors": []}` | `1` |
| `--manifest` without `--strict` | No JSON read/write attempted; exit 1 with `--manifest requires --strict` on stderr | `1` |

### `tusq policy verify --strict` Local-Only Invariants

| Invariant | How it shows up at the CLI |
|-----------|----------------------------|
| Opt-in only | Default `tusq policy verify` (no `--strict`) NEVER reads `tusq.manifest.json` even when it exists at the default path; a smoke test asserts this |
| Bounded reads | Exactly two files are read under `--strict`: the policy file and the manifest file. No scan file, no compiled tools, no `.git/`, no git lookups, no external includes |
| No server startup | `tusq policy verify --strict` never binds a TCP port; it runs synchronously and exits |
| No network I/O | No HTTP, DB, or MCP handshake; operators can run it with the network disabled |
| No target-product call | No capability is executed, dry-run or otherwise; strict verify cannot reach the target product |
| No manifest mutation | The manifest is read-only under `--strict`; no approval is recorded, no field is mutated, no `capability_digest` is re-computed |
| Alignment statement, not safety gate | A strict PASS proves policy/manifest alignment at verify time only — NOT runtime reachability, NOT manifest freshness, NOT execution safety |
| M22 parity preserved | M22 rejection messages are byte-identical whether `--strict` is set or not; `tusq serve --policy` is unchanged |

## M24 Product CLI Surface

M24 introduces NO new CLI command, NO new flag, and NO new subcommand. The operator-visible surface change is entirely in the shape of the generated `tusq.manifest.json` (and the downstream `tusq-tools/*.json` and MCP `tools/list` that inherit from it) for Fastify routes that declare a literal `schema.body` block. The scanner extends `extractFastifyRoutes` to capture declared field shapes into `input_schema.properties` and flip `additionalProperties` to `false`. All other extractor paths (Express, NestJS, Fastify-without-schema, Fastify-with-non-literal-schema) produce byte-identical manifests pre- and post-M24.

| Commands exercised | How M24 surfaces |
|--------------------|------------------|
| `tusq scan <path>` | The in-memory `scan.routes[i]` record carries a new `schema_fields` field when a Fastify route matches the literal-schema pattern; persisted `.tusq/scan.json` inherits the already-populated `input_schema` shape (no new top-level key) |
| `tusq manifest` | For Fastify routes with extracted schema fields, `capability.input_schema.properties` is populated with declared field names in source-literal order, `input_schema.required` carries declared names, `input_schema.additionalProperties` is `false`, and `input_schema.source` is `fastify_schema_body` |
| `tusq compile` | Compiled tool `parameters` inherits the populated `input_schema` shape; agents see real field names |
| `tusq serve` | MCP `tools/list` / `tools/call` inherit the populated shape; agents receive correct field names in `tools/list` responses |
| `tusq diff` | An M24-driven change in `input_schema` flips the per-capability `capability_digest` (M13); the diff review queue surfaces the change for explicit re-approval |

### Manifest Output Shape Under M24

| Capability situation | `input_schema` shape (post-M24) |
|----------------------|-------------------------------|
| Fastify route with literal `schema.body` block, top-level properties and required | `{ type: "object", properties: {<name>: {type: <string\|number\|integer\|boolean\|object\|array>}, ...}, required: [<names>], additionalProperties: false, source: "fastify_schema_body" }` |
| Fastify route with `schema` that does not parse as literal object (e.g., `schema: sharedSchema`) | Byte-identical to HEAD `35b7c9c` — M15 fall-back with `source: "framework_schema_hint"` |
| Fastify route with `schema` present but no `body` key | Byte-identical to HEAD `35b7c9c` |
| Fastify route with no `schema:` | Byte-identical to HEAD `35b7c9c` |
| Express route (any form) | Byte-identical to HEAD `35b7c9c` |
| NestJS route (any form) | Byte-identical to HEAD `35b7c9c` |

### Confidence Score Extension

| Route situation | Score bump from M24 |
|-----------------|---------------------|
| Fastify route with `schema_fields` captured | +0.04 on top of existing `schema_hint` +0.14 (capped at 0.95) |
| Fastify route with `schema_hint: true` only (literal extraction failed) | No M24 change — existing +0.14 |
| Any other route | No M24 change |

### Source Metadata Tag

| `input_schema.source` | When emitted |
|-----------------------|--------------|
| `fastify_schema_body` | M24 literal extraction succeeded; fields are what the source declares |
| `framework_schema_hint` | Only `schema_hint` boolean detected; fields not declared in manifest |
| `request_body` | Heuristic-only shape (no framework schema keyword detected) |

### Failure UX

M24 extraction either succeeds completely or produces no `schema_fields` at all. There is no operator-visible failure path — a malformed or non-literal Fastify schema does not cause `tusq scan` or `tusq manifest` to exit non-zero; the route silently falls back to M15 behavior. Reviewers distinguish the two outcomes by inspecting `input_schema.source` in the generated manifest.

| Situation | Operator sees |
|-----------|---------------|
| Fastify literal `schema.body` parsed successfully | `input_schema.source: "fastify_schema_body"` with populated `properties` |
| Fastify `schema` present but not a literal object | `input_schema.source: "framework_schema_hint"` with empty `properties` (same as pre-M24) |
| No Fastify `schema` keyword | `input_schema.source: "request_body"` (same as pre-M24) |

### M24 Local-Only Invariants

| Invariant | How it shows up at the scanner |
|-----------|--------------------------------|
| Static-only extraction | No `require('fastify')`, no `eval`, no `new Function`, no `ts-node`; regex + balanced-brace matching only |
| Zero new dependencies | `package.json` MUST NOT gain `ajv`, `fastify`, `@sinclair/typebox`, or any validator runtime in V1.5 |
| Graceful degradation | Any parse ambiguity drops the entire `schema_fields` record; partial extraction is forbidden |
| Deterministic output | Property key order is source-literal (declaration order); repeated `tusq scan` + `tusq manifest` runs produce byte-identical manifests |
| Non-Fastify fixtures untouched | Express and NestJS fixtures produce byte-identical manifests before and after M24 (a smoke test asserts this invariant) |
| Path param authority preserved | When a Fastify body field name collides with a path parameter, the path parameter wins in `input_schema.properties` |
| Source-literal framing | Manifest `input_schema.source: "fastify_schema_body"` tags the shape as "what the source declares," not "what the runtime enforces"; docs do not use "validator-backed" framing |

## M25 Product CLI Surface

M25 introduces NO new CLI command, NO new flag, and NO new subcommand. The operator-visible surface change is entirely in the shape of the generated `tusq.manifest.json` (and the downstream `tusq-tools/*.json` and MCP `tools/call` responses that inherit from it) for capabilities whose `input_schema.properties` keys match a fixed canonical set of well-known PII field names. The manifest generator adds a single pure function (`extractPiiFieldHints`) that runs after `buildInputSchema()` and populates `capability.redaction.pii_fields` deterministically.

| Commands exercised | How M25 surfaces |
|--------------------|------------------|
| `tusq scan <path>` | No scan-artifact shape change; `.tusq/scan.json` is byte-for-byte identical to HEAD `541abcd`; M25 operates entirely during manifest generation |
| `tusq manifest` | Each `capability.redaction.pii_fields` is populated with the original-case keys of `input_schema.properties` whose normalized form matches the canonical PII set; order = iteration order of `input_schema.properties` |
| `tusq compile` | Compiled tool `redaction.pii_fields` inherits the populated array verbatim; agents see the advisory field-name hints |
| `tusq serve` | MCP `tools/call` response `redaction` inherits the populated `pii_fields`; agents receive the hints as metadata alongside every tool-call plan |
| `tusq diff` | An M25-driven change in `redaction.pii_fields` flips the per-capability `capability_digest` (M13 already hashes `redaction` into the digest); the diff review queue surfaces the change for explicit re-approval |
| `tusq approve` | Unchanged — M25 does not modify approval semantics; reviewers continue to approve via the M18 flow |
| `tusq policy verify` / `tusq policy verify --strict` | Unchanged — M22 and M23 checks are orthogonal to `redaction` content; a populated `pii_fields` does not affect either verdict |

### Manifest Output Shape Under M25

| Capability situation | `redaction.pii_fields` (post-M25) |
|----------------------|------------------------------------|
| `input_schema.properties` contains canonical PII keys (`email`, `password`, `ssn`, ...) | `[<original-case key>, ...]` in declaration order |
| `input_schema.properties` contains normalized-form matches (`user_email`, `USER_EMAIL`, `userEmail`) | `[<original-case key>, ...]` — original case preserved, normalization only affects matching |
| `input_schema.properties` contains tail-match-only keys (`email_template_id`, `phone_book_url`) | `[]` — whole-key match only |
| `input_schema.properties` is empty or absent | `[]` — byte-identical to pre-M25 |
| Capability with no `input_schema.properties` | `[]` — byte-identical to pre-M25 |
| Non-PII capabilities across any framework | `[]` — byte-identical to pre-M25 |

### Canonical PII Name Set

Enumerated in SYSTEM_SPEC § M25. The full V1.6 set is frozen in `src/cli.js`:

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

### Sensitivity Class and Confidence Interactions

| Field | M25 effect |
|-------|------------|
| `capability.sensitivity_class` | Unchanged — stays `"unknown"` on every capability in V1.6; M25 does NOT auto-escalate |
| `capability.confidence` | Unchanged — M25 does NOT modify `scoreConfidence()`; PII name presence is not a confidence signal |
| `capability.redaction.log_level` | Unchanged — stays `null` in V1.6 |
| `capability.redaction.mask_in_traces` | Unchanged — stays `null` in V1.6 |
| `capability.redaction.retention_days` | Unchanged — stays `null` in V1.6 |
| `capability.capability_digest` | Re-computed when `pii_fields` changes (M13 hashes `redaction` into the digest) |

### Failure UX

M25 extraction either succeeds (populates `pii_fields`) or produces no match at all (`pii_fields: []`). There is no operator-visible failure path — M25 cannot cause `tusq manifest` to exit non-zero. Reviewers distinguish the two outcomes by inspecting `redaction.pii_fields` in the generated manifest.

| Situation | Operator sees |
|-----------|---------------|
| At least one `input_schema.properties` key matches the canonical set | `redaction.pii_fields: [<matches>]` in declaration order |
| No keys match | `redaction.pii_fields: []` (same as pre-M25) |
| `input_schema.properties` empty or absent | `redaction.pii_fields: []` (same as pre-M25) |

### M25 Local-Only Invariants

| Invariant | How it shows up at manifest generation |
|-----------|-----------------------------------------|
| Static-only extraction | Pure function over in-memory `input_schema.properties` object; no `fs.readFile`, no `require`, no `eval`, no `new Function` |
| Zero new dependencies | `package.json` MUST NOT gain `pii-detector`, `presidio`, `compromise`, or any NLP/PII library in V1.6 |
| Whole-key match only | A field named `email_template_id` MUST NOT be flagged as `email`; normalization strips `_`/`-` and lowercases the key, then compares against the frozen set |
| Deterministic output | `pii_fields` order equals iteration order of `input_schema.properties`; repeated `tusq scan` + `tusq manifest` runs produce byte-identical arrays |
| Non-PII capabilities untouched | Capabilities whose `input_schema.properties` has no canonical match produce `pii_fields: []` (byte-identical to HEAD `541abcd`) |
| No `sensitivity_class` auto-escalation | `sensitivity_class` remains `"unknown"` on every capability; M25 does not imply sensitivity |
| Source-literal framing | `redaction.pii_fields` is a field-name hint, NOT a runtime PII detection claim; docs do not use "PII-validated" or "compliant" framing (SYSTEM_SPEC Constraint 16) |

## M26 Product CLI Surface

M26 introduces NO new CLI command, NO new flag, and NO new subcommand. The operator-visible surface change is additive manifest metadata: every generated capability gains `capability.redaction.pii_categories`, a deterministic array parallel to the M25 `redaction.pii_fields` array. The array labels each matched PII field name with one frozen category key and leaves retention/log/trace defaults unset.

| Commands exercised | How M26 surfaces |
|--------------------|------------------|
| `tusq scan <path>` | No scan-artifact shape change; M26 operates during manifest generation over M25's already-emitted `pii_fields` array |
| `tusq manifest` | Populates `capability.redaction.pii_categories`; order and length match `redaction.pii_fields`; empty `pii_fields` produces `pii_categories: []` |
| `tusq compile` | Compiled tool metadata inherits `redaction.pii_categories` verbatim alongside `pii_fields` |
| `tusq serve` | MCP `tools/call` metadata includes `pii_categories` as advisory source-literal category labels; no runtime filtering or retention enforcement is added |
| `tusq diff` | First post-M26 scan flips `capability_digest` because `redaction` shape changes; reviewers must re-approve affected capabilities under M13 semantics |
| `tusq approve` | Unchanged; M26 does not auto-approve or bypass review |
| `tusq policy verify` / `tusq policy verify --strict` | Unchanged; strict verification remains approval-alignment based and does not inspect category content |

### Manifest Output Shape Under M26

| Capability situation | `redaction.pii_fields` | `redaction.pii_categories` |
|----------------------|-------------------------|-----------------------------|
| Fields `email`, `password` | `["email", "password"]` | `["email", "secrets"]` |
| Fields `user_email`, `ssn`, `credit_card` | `["user_email", "ssn", "credit_card"]` | `["email", "government_id", "payment"]` |
| No canonical PII field-name match | `[]` | `[]` |

### M26 Category Keys

The V1.7 category vocabulary is frozen and maps one-to-one from the M25 canonical name set: `email`, `phone`, `government_id`, `name`, `address`, `date_of_birth`, `payment`, `secrets`, and `network`.

### M26 Default Preservation

| Field | M26 effect |
|-------|------------|
| `capability.sensitivity_class` | Unchanged — stays `"unknown"`; category labels are not sensitivity inference |
| `capability.confidence` | Unchanged — category labels do not modify `scoreConfidence()` |
| `capability.redaction.log_level` | Unchanged — remains existing default `"full"` unless explicitly edited |
| `capability.redaction.mask_in_traces` | Unchanged — remains existing default `false` unless explicitly edited |
| `capability.redaction.retention_days` | Unchanged — remains `null`; organizational policy owns retention defaults |
| `capability.capability_digest` | Re-computed on first post-M26 scan because `redaction.pii_categories` is added |

### M26 Failure UX

M26 has one defensive failure path: if a `pii_fields` entry has no matching category in the frozen lookup, `tusq manifest` fails synchronously before writing a manifest. That indicates implementation drift between `PII_CANONICAL_NAMES` and `PII_CATEGORY_BY_NAME`; operators should treat it as a bug, not a policy decision.

| Situation | Operator sees |
|-----------|---------------|
| Every `pii_fields` entry maps to a category | `redaction.pii_categories` emitted in matching order |
| `pii_fields` is empty | `redaction.pii_categories: []` |
| A `pii_fields` entry lacks a category mapping | Manifest generation exits non-zero with a mapping-drift error |

### M26 Local-Only Invariants

| Invariant | How it shows up at manifest generation |
|-----------|-----------------------------------------|
| Static-only extraction | Pure function over `redaction.pii_fields`; no source re-scan, no value inspection |
| Zero new dependencies | `package.json` MUST NOT gain any PII, retention, NLP, or compliance library |
| Deterministic output | `pii_categories` order equals `pii_fields` order; repeated runs produce byte-identical arrays |
| No retention overclaim | `retention_days`, `log_level`, and `mask_in_traces` are not auto-populated from categories; existing defaults remain `null`, `"full"`, and `false` respectively |
| No sensitivity auto-escalation | `sensitivity_class` remains `"unknown"` on every capability |
| Source-literal framing | `pii_categories` labels M25 field-name matches; it is NOT runtime PII validation or retention-policy enforcement |

## M27 Product CLI Surface

M27 introduces exactly one new CLI noun, `redaction`, with exactly one subcommand, `review`. The shipped tusq CLI surface grows from 12 nouns (init, scan, manifest, compile, serve, review, docs, approve, diff, version, help, policy) to 13 nouns; the total entry-point count grows from 14 (counting `policy init` and `policy verify` separately) to 15 (adding `redaction review`). M27 mutates no existing command's observable behavior.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq redaction` | Enumerates `redaction` subcommands (prints `review`) | Successful subcommand listing |
| `tusq redaction review` | Emits a deterministic per-capability reviewer report aggregating M25 `pii_fields`, M26 `pii_categories`, and a frozen per-category advisory | The manifest was read successfully and the report was written to stdout |

### M27 Flags And Options

| Flag | Default | Effect |
|------|---------|--------|
| `--manifest <path>` | `tusq.manifest.json` (cwd) | Manifest file to read; file must exist and parse as JSON with a top-level `capabilities` array |
| `--capability <name>` | unset | Filter the report to a single capability by exact name; partial matches are NOT allowed |
| `--json` | unset | Emit machine-readable JSON instead of the human-readable report; same content-determinism guarantees apply |

There are no other flags. `tusq redaction review --help` prints the flag surface, exit codes, and the explicit "reviewer aid, not a runtime enforcement gate" callout.

### M27 Report Shape (JSON)

| Field | Source | Notes |
|-------|--------|-------|
| `manifest_path` | `--manifest` or default | Resolved input path |
| `manifest_version` | copied from manifest | Not re-stamped |
| `generated_at` | copied from manifest | Not re-stamped; keeps report content-deterministic |
| `capabilities[]` | manifest `capabilities` array order | One entry per capability (unless filtered) |
| `capabilities[].name` | manifest | Exact capability name |
| `capabilities[].approved` | manifest | Echoed verbatim (no M27 mutation) |
| `capabilities[].sensitivity_class` | manifest | Echoed verbatim; always `"unknown"` under V1.8 |
| `capabilities[].pii_fields` | manifest `redaction.pii_fields` | Echoed verbatim |
| `capabilities[].pii_categories` | manifest `redaction.pii_categories` | Echoed verbatim (same length and order as `pii_fields`) |
| `capabilities[].advisories[]` | frozen lookup | One entry per distinct category in category-appearance order |
| `capabilities[].advisories[].category` | frozen M26 category key | One of the nine V1.7 categories |
| `capabilities[].advisories[].text` | `PII_REVIEW_ADVISORY_BY_CATEGORY` | Frozen V1.8 wording; changes are material governance events |

### M27 Frozen Advisory Set (V1.8)

| Category | Advisory text (frozen V1.8; changes are material governance events) |
|----------|----------------------------------------------------------------------|
| `email` | `Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.` |
| `phone` | `Contact-PII field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.` |
| `government_id` | `High-sensitivity government-ID field detected — reviewer: apply your org's strictest retention, logging, and trace-redaction defaults.` |
| `name` | `Personal-name field detected — reviewer: decide whether the field should be logged in plaintext, masked, or redacted; retention follows your org's contact-data policy.` |
| `address` | `Physical-address field detected — reviewer: choose retention window, log masking, and trace redaction aligned with your org's contact-data policy.` |
| `date_of_birth` | `Date-of-birth field detected — reviewer: apply age-sensitive retention and redaction defaults; some jurisdictions treat DOB as higher-risk PII.` |
| `payment` | `Payment-data field detected — reviewer: apply your org's payment-data retention, logging, and masking rules (e.g., PCI-aligned defaults owned by your team).` |
| `secrets` | `Secret or credential field detected — reviewer: this field SHOULD NOT be logged in plaintext; apply trace redaction and minimal retention at your org's standard.` |
| `network` | `Network-identifier field detected — reviewer: choose retention and masking aligned with your org's logging policy; some jurisdictions treat IP addresses as PII.` |

### M27 Default Preservation

| Field / Command | M27 effect |
|-----------------|------------|
| `tusq.manifest.json` | Unchanged — mtime and content are byte-identical before/after any review run |
| `capability.redaction.retention_days` | Unchanged — stays `null` unless a reviewer hand-edits it |
| `capability.redaction.log_level` | Unchanged — stays `"full"` unless a reviewer hand-edits it |
| `capability.redaction.mask_in_traces` | Unchanged — stays `false` unless a reviewer hand-edits it |
| `capability.sensitivity_class` | Unchanged — stays `"unknown"`; advisory categories are not sensitivity inference |
| `capability.capability_digest` | Unchanged — M27 performs zero writes, so no first-run digest flip |
| `tusq scan` / `tusq manifest` / `tusq compile` / `tusq serve` / `tusq approve` / `tusq diff` / `tusq docs` / `tusq version` | Unchanged |
| `tusq policy init` / `tusq policy verify` (default) / `tusq policy verify --strict` | Unchanged — advisory content is never a strict input |

### M27 Failure UX

| Situation | Operator sees | Exit code |
|-----------|---------------|-----------|
| Manifest read successfully, capabilities enumerated | Per-capability report on stdout | 0 |
| `--manifest` points to a missing file | `Manifest not found: <path>` on stderr; no stdout | 1 |
| Manifest is present but not valid JSON | `Invalid manifest JSON: <path>` on stderr; no partial report | 1 |
| Manifest is valid JSON but lacks a top-level `capabilities` array | `Invalid manifest: missing capabilities array` on stderr; no partial report | 1 |
| `--capability <name>` specifies a name not present in the manifest | `Capability not found: <name>` on stderr; no stdout | 1 |
| Unknown subcommand under `tusq redaction` | `Unknown subcommand: <name>` on stderr | 1 |
| Unknown flag on `tusq redaction review` | `Unknown flag: <flag>` on stderr | 1 |

### M27 Local-Only Invariants

| Invariant | How it shows up at review time |
|-----------|---------------------------------|
| Read-only | `tusq.manifest.json` is never opened for writing; mtime and content are byte-identical before/after any invocation |
| No network I/O | No HTTP, DB, socket, or DNS lookup; no `fetch`/`http.request`/`net.connect` call path reachable from the subcommand |
| Zero new dependencies | `package.json` MUST NOT gain any PII, compliance, retention, NLP, or table-rendering library |
| Deterministic output | Running twice on the same manifest produces byte-identical stdout in both human and `--json` modes; no wall-clock field inside per-capability entries |
| Frozen advisory set | `PII_REVIEW_ADVISORY_BY_CATEGORY` wording is locked by a smoke fixture; any wording change is a material governance event that MUST land under its own ROADMAP milestone |
| No scan re-run | The subcommand never calls the scanner or re-reads `src/` |
| No capability execution | The subcommand never calls a compiled tool or starts the MCP server |
| Reviewer-directive advisory text | Every advisory ends with "reviewer: ..." so the output explicitly reminds the operator the decision is theirs; no advisory claims the capability is compliant or runtime-safe |

## Primary Commands

All commands execute from the `website/` working directory.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `npm install` | Install Docusaurus and all dependencies | Dependencies resolved, `node_modules/` populated |
| `npm start` | Start local dev server with hot reload on port 3000 | Server running, site accessible at `http://localhost:3000` |
| `npm run build` | Produce static site in `website/build/` | All pages rendered, no broken links, zero errors |
| `npm run serve` | Serve the production build locally for verification | Built site accessible at `http://localhost:3000` |

### Content authoring commands

| Command | Purpose |
|---------|---------|
| Create `.md` file in `docs/` | Add a new documentation page |
| Create date-prefixed `.md` file in `blog/` | Add a new blog post |
| Edit `docusaurus.config.ts` | Modify site metadata, navbar, footer |
| Edit `sidebars.ts` | Modify docs sidebar structure |

## Flags And Options

### `npm run build`

| Option | Description | Default |
|--------|-------------|---------|
| `--locale` | Build for a specific locale | `en` (only locale in V1) |
| `--out-dir` | Override output directory | `build/` |

### `npm start`

| Option | Description | Default |
|--------|-------------|---------|
| `--port` | Dev server port | `3000` |
| `--host` | Dev server host binding | `localhost` |
| `--no-open` | Don't auto-open browser | Opens by default |

### `docusaurus.config.ts` key options

| Field | Purpose | V1 Value |
|-------|---------|----------|
| `title` | Site title in `<title>` and navbar | `tusq.dev` |
| `tagline` | Subtitle used in homepage meta | From MESSAGING.md one-liner |
| `url` | Production URL | TBD (human decision) |
| `baseUrl` | Base path | `/` |
| `onBrokenLinks` | Behavior on broken links | `throw` (fail build) |
| `onBrokenMarkdownLinks` | Behavior on broken MD links | `throw` |

## Failure UX

### Build failures

| Failure | Cause | User sees |
|---------|-------|-----------|
| Broken link | Internal link target does not exist | `npm run build` exits non-zero with error listing the broken link path and source file |
| Missing frontmatter | Doc page missing required `title` field | Build error with file path and missing field name |
| Syntax error in config | Invalid `docusaurus.config.ts` | Node.js error with stack trace pointing to config file |
| Missing dependency | `npm install` not run or failed | Module-not-found error with package name |

### Dev server failures

| Failure | Cause | User sees |
|---------|-------|-----------|
| Port conflict | Port 3000 already in use | Error message suggesting `--port` flag |
| Invalid MDX | Malformed JSX in `.md` file | Hot-reload error overlay in browser with file path and line number |

### Content failures

| Failure | Cause | User sees |
|---------|-------|-----------|
| 404 page | Unknown route | Custom 404 page with link back to homepage |
| Missing sidebar entry | Doc exists but not in `sidebars.ts` | Page accessible by direct URL but not in sidebar navigation |

## Navigation Structure

### Top Navbar

| Item | Type | Target |
|------|------|--------|
| tusq.dev | Brand/logo | Homepage (`/`) |
| Docs | Link | `/docs/getting-started` |
| Blog | Link | `/blog` |
| GitHub | External link | GitHub repository |

### Docs Sidebar

| Section | Page | Slug |
|---------|------|------|
| Getting Started | Getting Started | `/docs/getting-started` |
| Reference | CLI Reference | `/docs/cli-reference` |
| Reference | Manifest Format | `/docs/manifest-format` |
| Reference | Configuration | `/docs/configuration` |
| Guides | Supported Frameworks | `/docs/frameworks` |
| Guides | MCP Server | `/docs/mcp-server` |
| Help | FAQ | `/docs/faq` |

## Page Inventory

### Marketing Surface

| Page | Route | Content Source |
|------|-------|----------------|
| Homepage | `/` | `websites/index.html` + MESSAGING.md |
| 404 | `*` (fallback) | `websites/404.html` |

### Documentation Surface

| Page | Route | Content Source |
|------|-------|----------------|
| Getting Started | `/docs/getting-started` | SYSTEM_SPEC.md workflow + README |
| CLI Reference | `/docs/cli-reference` | command-surface.md (prior run) |
| Manifest Format | `/docs/manifest-format` | SYSTEM_SPEC.md manifest section |
| Configuration | `/docs/configuration` | SYSTEM_SPEC.md init section |
| Supported Frameworks | `/docs/frameworks` | SYSTEM_SPEC.md + MESSAGING.md |
| MCP Server | `/docs/mcp-server` | SYSTEM_SPEC.md serve section |
| FAQ | `/docs/faq` | MESSAGING.md claims/non-claims |

### Blog Surface

| Page | Route | Content Source |
|------|-------|----------------|
| Blog Index | `/blog` | Auto-generated by Docusaurus |
| Announcing tusq.dev v0.1.0 | `/blog/announcing-tusq-dev` | ANNOUNCEMENT.md |
| Release Notes: v0.1.0 | `/blog/release-notes-v0.1.0` | RELEASE_NOTES.md |

## Build Commands

| Command | Purpose | Working Dir |
|---------|---------|-------------|
| `npm install` | Install Docusaurus dependencies | `website/` |
| `npm start` | Start local dev server (port 3000) | `website/` |
| `npm run build` | Build static site to `website/build/` | `website/` |
| `npm run serve` | Serve built site locally | `website/` |

## Content Ownership

| Surface | Owner | Authority |
|---------|-------|-----------|
| Homepage copy | product_marketing | Must match MESSAGING.md product truth |
| Documentation | product_marketing | Derived from accepted SYSTEM_SPEC.md |
| Blog posts | product_marketing | Adapted from accepted launch artifacts |
| Site config/theme | dev | Technical implementation |

## Quality Gates

- **Build gate:** `npm run build` exits 0 with no broken-link warnings
- **Content gate:** Every page passes product truth audit against MESSAGING.md
- **Navigation gate:** All sidebar and navbar links resolve to existing pages
