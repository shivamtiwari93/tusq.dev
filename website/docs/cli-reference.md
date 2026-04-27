---
title: CLI Reference
sidebar_label: CLI Reference
sidebar_position: 2
---

# CLI Reference

Global syntax:

```bash
tusq <command> [options]
```

## Commands

## `tusq init`

Initialize `tusq.config.json`.

```bash
tusq init [--framework <express|fastify|nestjs>] [--verbose]
```

## `tusq scan`

Scan a codebase and write `.tusq/scan.json`.

```bash
tusq scan <path> [--framework <name>] [--format json] [--verbose]
```

## `tusq manifest`

Generate `tusq.manifest.json` from scan data.

```bash
tusq manifest [--out <path>] [--format json] [--verbose]
```

## `tusq compile`

Compile approved capabilities into tool definition JSON files.

```bash
tusq compile [--out <path>] [--dry-run] [--verbose]
```

## `tusq serve`

Serve compiled tools over a local MCP endpoint. Without `--policy`, behavior is describe-only (V1 default). With `--policy`, the server loads an execution policy file and can validate arguments and emit dry-run plans.

```bash
tusq serve [--port <n>] [--policy <path>] [--verbose]
```

| Flag | Description | Default |
|------|-------------|---------|
| `--port <n>` | TCP port for the local MCP listener | `3333` |
| `--policy <path>` | Path to `.tusq/execution-policy.json`; enables dry-run mode when `mode: "dry-run"` | Unset (describe-only) |
| `--verbose` | Print policy resolution and request logs to stderr | Disabled |

If `--policy` is set and the file is missing, unreadable, contains invalid JSON, has an unsupported `schema_version`, or specifies an unknown `mode`, `tusq serve` exits 1 with an actionable message before starting the server.

See [Execution Policy](./execution-policy.md) for the full policy file shape, mode semantics, and dry-run response format.

## `tusq review`

Print grouped manifest summary for review. The text output includes approval state, confidence, inferred input/output shape summaries, source provenance, sensitivity class, and auth scheme so reviewers can triage the manifest without opening every capability object.

```bash
tusq review [--format json] [--strict] [--sensitivity <class>] [--auth-scheme <scheme>] [--verbose]
```

Example text row:

```text
- [x] get_users_users (GET /users) confidence=0.76 LOW_CONFIDENCE sensitivity=public auth=bearer inputs=none returns=array<object> source=src/app.ts:13 handler=listUsers framework=express
```

Use `--format json` when you need the full raw manifest.

Use `--strict` in CI to fail with exit code `1` when any capability is unapproved or marked `review_needed`.

Use `--sensitivity <class>` to filter the displayed output to capabilities with a specific M28 sensitivity class. Legal values: `unknown`, `public`, `internal`, `confidential`, `restricted`. An unrecognized value exits `1` before any output. The filter is display-only — it does not change the exit code (unapproved or low-confidence capabilities outside the filter still trigger a `--strict` failure).

Use `--auth-scheme <scheme>` to filter the displayed output to capabilities with a specific M29 auth scheme. Legal values: `unknown`, `bearer`, `api_key`, `session`, `basic`, `oauth`, `none`. An unrecognized value exits `1` before any output. Mutually compatible with `--sensitivity` — both filters intersect AND-style when combined. The filter is display-only and does not affect exit-code semantics.

`tusq docs` now includes an `#### Auth requirements` section per capability with the full `auth_requirements` object (auth_scheme, auth_scopes, auth_roles, evidence_source). `tusq diff` surfaces `auth_requirements` changes in the review queue via the M13 capability digest flip.

## `tusq docs`

Generate deterministic local Markdown documentation from a tusq manifest.

```bash
tusq docs [--manifest <path>] [--out <path>] [--verbose]
```

The generated Markdown is review/adoption documentation only. It includes manifest version metadata and per-capability sections for approval state, side-effect class, sensitivity class, auth hints, auth requirements, provenance, examples, constraints, and redaction. It does not publish hosted docs, call product APIs, or add live execution semantics.

If `--manifest` is omitted, tusq reads `tusq.manifest.json` from the current project config or working directory. If `--out` is omitted, tusq prints Markdown to stdout.

## `tusq auth index`

Emit a deterministic, per-auth-scheme capability index from manifest evidence. Groups capabilities by their `auth_requirements.auth_scheme` field in closed-enum order (`bearer → api_key → session → basic → oauth → none → unknown`), with a special `unknown` bucket for capabilities whose `auth_scheme` is `"unknown"`, missing, or any value outside the six named schemes. This is a **planning aid, not a runtime authentication enforcer or OAuth/OIDC/SAML/SOC2 compliance certifier**.

```bash
tusq auth index [--scheme <bearer|api_key|session|basic|oauth|none|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--scheme <bearer\|api_key\|session\|basic\|oauth\|none\|unknown>` | all schemes | Filter to a single auth scheme bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown auth scheme, `--out` path error, or unknown subcommand

**Bucket iteration order:** `bearer → api_key → session → basic → oauth → none → unknown` (closed-enum order — NOT manifest first-appearance order and NOT an IAM-strength-precedence statement). Empty buckets do not appear.

**Case-sensitive filter:** `--scheme` values are matched verbatim. Uppercase values like `BEARER` exit 1 with `Unknown auth scheme: BEARER` — do not silently coerce case.

**Per-bucket fields:** `auth_scheme`, `aggregation_key` (`"scheme"` or `"unknown"`), `capability_count`, `capabilities[]` (manifest declared order), `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- The seven-value `auth_scheme` enum and the two-value `aggregation_key` enum are frozen; any addition is a material governance event.
- An auth index is NOT a runtime authentication enforcer, NOT an OAuth/OIDC validator, NOT a compliance certifier, does NOT generate auth adapters, and does NOT modify M29's `auth_scheme` derivation rules.

```bash
# All auth schemes (human-readable)
tusq auth index

# All auth schemes (JSON)
tusq auth index --json

# Single scheme (lowercase — case-sensitive)
tusq auth index --scheme bearer --json

# Unknown/unprotected bucket
tusq auth index --scheme unknown --json

# Write to file
tusq auth index --out auth-index.json
```

## `tusq confidence index`

Emit a deterministic, per-confidence-tier capability index from manifest evidence. Groups capabilities by a tier derived from their numeric `confidence` field using frozen thresholds (`high` ≥ 0.85, `medium` in [0.6, 0.85), `low` < 0.6, `unknown` for null/undefined/missing/non-numeric/out-of-[0,1]), in closed-enum order (`high → medium → low → unknown`). This is a **planning aid, not a runtime confidence gate, evidence-quality scoring engine, or automated re-classifier**.

```bash
tusq confidence index [--tier <high|medium|low|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--tier <high\|medium\|low\|unknown>` | all tiers | Filter to a single confidence tier bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown confidence tier, `--out` path error, or unknown subcommand

**Frozen tier thresholds:**

| `confidence` value | Tier |
|-------------------|------|
| `>= 0.85` | `high` |
| `>= 0.6` and `< 0.85` | `medium` |
| `< 0.6` | `low` |
| null / undefined / missing | `unknown` (no warning) |
| non-numeric / NaN / Infinity / out-of-[0,1] | `unknown` (warning emitted) |

**Bucket iteration order:** `high → medium → low → unknown` (closed-enum order — NOT a quality-precedence statement and NOT an evidence-strength ranking). Empty buckets do not appear.

**Case-sensitive filter:** `--tier` values are matched verbatim. Uppercase values like `HIGH` exit 1 with `Unknown confidence tier: HIGH` — do not silently coerce case.

**Per-bucket fields:** `confidence_tier`, `aggregation_key` (`"tier"` or `"unknown"`), `capability_count`, `capabilities[]` (manifest declared order), `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**`warnings[]` array:** Present in `--json` output always (even when empty). Contains one string per capability whose `confidence` is non-null/undefined but non-numeric, NaN, Infinity, or outside [0, 1]. In human mode, warnings are emitted to stderr.

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- `confidence_tier` is NOT written into the manifest — it is derived at read-time only.
- The four-value `confidence_tier` enum and the two-value `aggregation_key` enum are frozen; any addition is a material governance event.
- A confidence index is NOT a runtime enforcer, NOT a quality gate, and does NOT re-classify or modify any capability field.

```bash
# All tiers (human-readable)
tusq confidence index

# All tiers (JSON)
tusq confidence index --json

# Single tier (lowercase — case-sensitive)
tusq confidence index --tier high --json

# Unknown/unclassifiable bucket
tusq confidence index --tier unknown --json

# Write to file
tusq confidence index --out confidence-index.json
```

## `tusq pii index`

Emit a deterministic, per-PII-field-count-tier capability index from manifest evidence. Groups capabilities by a tier derived from their `pii_fields[]` array length using frozen thresholds (`none` for length 0, `low` for 1–2, `medium` for 3–5, `high` for ≥6, `unknown` for null/missing/non-array/malformed), in closed-enum order (`none → low → medium → high → unknown`). This is a **planning aid, not a runtime PII detector, data-leakage prevention engine, runtime redaction enforcer, or compliance certifier**.

```bash
tusq pii index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--tier <none\|low\|medium\|high\|unknown>` | all tiers | Filter to a single PII field count tier bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown pii field count tier, `--out` path error, or unknown subcommand

**Frozen tier function:**

| `pii_fields` value | Tier |
|-------------------|------|
| Valid array, `length === 0` | `none` |
| Valid array, `1 <= length <= 2` | `low` |
| Valid array, `3 <= length <= 5` | `medium` |
| Valid array, `length >= 6` | `high` |
| null / undefined / missing | `unknown` (warning emitted) |
| not an array / non-string element / empty string element | `unknown` (warning emitted) |

**Bucket iteration order:** `none → low → medium → high → unknown` (closed-enum order — NOT a leakage-severity or exposure ranking). Empty buckets do not appear.

**Case-sensitive filter:** `--tier` values are matched verbatim. Uppercase values like `HIGH` exit 1 with `Unknown pii field count tier: HIGH` — do not silently coerce case.

**Per-bucket fields:** `pii_field_count_tier`, `aggregation_key` (`"tier"` or `"unknown"`), `capability_count`, `capabilities[]` (manifest declared order), `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**`warnings[]` array:** Present in `--json` output always (even when empty). Contains one string per capability whose `pii_fields` is null, missing, not an array, contains a non-string element, or contains the empty string. In human mode, warnings are emitted to stderr.

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- `pii_field_count_tier` is NOT written into the manifest — it is derived at read-time only.
- The five-value `pii_field_count_tier` enum and the two-value `aggregation_key` enum are frozen; any addition is a material governance event.
- A PII field count tier index is NOT a runtime enforcer, NOT a PII detector, and does NOT modify any capability field.

```bash
# All tiers (human-readable)
tusq pii index

# All tiers (JSON)
tusq pii index --json

# Single tier (lowercase — case-sensitive)
tusq pii index --tier high --json

# Unknown/malformed bucket
tusq pii index --tier unknown --json

# Write to file
tusq pii index --out pii-index.json
```

## `tusq approve`

Approve selected capabilities in `tusq.manifest.json` without hand-editing approval fields.

```bash
tusq approve [capability-name] [--all] [--reviewer <id>] [--manifest <path>] [--dry-run] [--json] [--verbose]
```

Use a capability name to approve exactly one capability. Use `--all` to approve every capability that is currently unapproved or still marked `review_needed`.

Approval sets `approved: true`, clears `review_needed`, and records `approved_by` plus `approved_at`. If `--reviewer` is omitted, tusq uses `TUSQ_REVIEWER`, `USER`, or `LOGNAME`.

Use `--dry-run` to inspect what would be approved without writing the manifest. Use `--json` for machine-readable approval output.

## `tusq diff`

Compare two manifest files and surface capability changes for review.

```bash
tusq diff [--from <path>] [--to <path>] [--json] [--review-queue] [--fail-on-unapproved-changes] [--verbose]
```

Use `--from` for the previous manifest and `--to` for the current manifest. If `--to` is omitted, tusq uses `tusq.manifest.json` in the current working directory. If `--from` is omitted and tusq cannot resolve a predecessor locally, the command exits `1` and asks for `--from <path>`.

The default text output reports added, removed, changed, and unchanged counts. Changed capabilities are matched by `name`, detected with `capability_digest`, and include top-level changed field names.

Use `--json` for machine-readable output with `summary`, `changes[]`, and optional `review_queue[]`.

Use `--review-queue` to list added, changed, unapproved, and low-confidence capabilities that need review.

Use `--fail-on-unapproved-changes` in CI to exit `1` when added or changed capabilities are unapproved or still marked `review_needed`.

## `tusq policy init`

Generate a valid `.tusq/execution-policy.json` governance artifact without hand-authoring the schema.

```bash
tusq policy init [--mode <describe-only|dry-run>]
                 [--reviewer <id>]
                 [--allowed-capabilities <name,name,...>]
                 [--out <path>]
                 [--force]
                 [--dry-run]
                 [--json]
                 [--verbose]
```

| Flag | Description | Default |
|------|-------------|---------|
| `--mode <describe-only\|dry-run>` | Policy mode for the generated file | `describe-only` |
| `--reviewer <id>` | Reviewer identity stamped in the file | `TUSQ_REVIEWER`, `USER`, `LOGNAME`, or `"unknown"` |
| `--allowed-capabilities <name,...>` | Comma-separated capability names to scope dry-run; omit to allow all approved capabilities | Omitted |
| `--out <path>` | Output path for the generated policy file | `.tusq/execution-policy.json` |
| `--force` | Overwrite the file if it already exists | Disabled |
| `--dry-run` | Print the generated JSON to stdout without writing | Disabled |
| `--json` | Print structured output including the written path and policy object | Disabled |

The generated file passes `loadAndValidatePolicy()` byte-for-byte — it is indistinguishable from a hand-authored policy as far as `tusq serve --policy` is concerned. The `.tusq/` directory is created automatically if missing.

Default mode is `"describe-only"`. To generate a dry-run policy: `tusq policy init --mode dry-run`.

Example three-line workflow:

```bash
tusq policy init --mode dry-run --reviewer ops@example.com
tusq serve --policy .tusq/execution-policy.json
```

See [Execution Policy](./execution-policy.md) for mode semantics and the full policy schema.

## `tusq policy verify`

Validate an execution-policy file without starting an MCP server. Shares `loadAndValidatePolicy()` with `tusq serve --policy`, so every accept/reject decision and every error message is identical across the two entry points.

```bash
tusq policy verify [--policy <path>]
                   [--json]
                   [--verbose]
```

| Flag | Description | Default |
|------|-------------|---------|
| `--policy <path>` | Path to the execution-policy file to validate | `.tusq/execution-policy.json` |
| `--json` | Emit a machine-readable result object to stdout (both success and failure) | Human-readable summary |
| `--verbose` | Print the resolved path to stderr | Disabled |

| Exit | Meaning |
|------|---------|
| `0` | Policy file was read, parsed, and accepted by the shared validator |
| `1` | Missing file, unreadable file, invalid JSON, unsupported `schema_version`, unknown `mode`, or invalid `allowed_capabilities` |

On success without `--json`, prints one line to stdout:

```
Policy valid: .tusq/execution-policy.json (mode: dry-run, reviewer: ops@example.com, allowed_capabilities: unset)
```

With `--json` on success:

```json
{
  "valid": true,
  "path": ".tusq/execution-policy.json",
  "policy": {
    "schema_version": "1.0",
    "mode": "dry-run",
    "reviewer": "ops@example.com",
    "approved_at": "2026-04-22T05:20:21.000Z",
    "allowed_capabilities": null
  }
}
```

With `--json` on failure:

```json
{
  "valid": false,
  "path": ".tusq/execution-policy.json",
  "error": "Unknown policy mode: live-fire. Allowed: describe-only, dry-run"
}
```

Typical pre-commit / CI usage:

```bash
tusq policy verify && tusq serve --policy .tusq/execution-policy.json
```

See [Execution Policy](./execution-policy.md) for the full policy schema and mode semantics.

### `tusq policy verify --strict` (manifest-aware)

When `--strict` is set, the verifier additionally reads `tusq.manifest.json` (or a path passed via `--manifest`) and cross-references every name in the policy's `allowed_capabilities` array against the manifest's approval-gated set. This is an opt-in CI/review-layer gate; default behavior is byte-for-byte identical to M22.

```bash
tusq policy verify [--policy <path>]
                   [--strict [--manifest <path>]]
                   [--json]
                   [--verbose]
```

| Flag | Description | Default |
|------|-------------|---------|
| `--strict` | Additionally cross-reference `allowed_capabilities` against the manifest | Disabled (M22 behavior) |
| `--manifest <path>` | Path to the manifest file consulted under `--strict` (requires `--strict`) | `tusq.manifest.json` |

Under `--strict`, the flag evaluation order is:

1. If `--manifest` is set without `--strict`, exit 1 with `--manifest requires --strict` before reading any file.
2. Run the M22 policy-file validator. If it fails, exit 1 with the M22 message. Strict checks do not run on a policy that fails M22 validation.
3. If `--strict` is set, read the manifest and cross-check every name in `allowed_capabilities`. On any failure, exit 1.
4. On full success, emit the success output and exit 0.

Strict-mode failure messages:

| Failure | Message |
|---------|---------|
| `--manifest` without `--strict` | `--manifest requires --strict` |
| Manifest file missing | `Manifest not found: <path>` |
| Manifest file unreadable | `Could not read manifest file: <path>: <OS error>` |
| Manifest file not valid JSON | `Invalid manifest JSON at: <path>: <parser message>` |
| Manifest has no `capabilities` array | `Invalid manifest shape at: <path>: missing capabilities array` |
| Capability not in manifest | `Strict policy verify failed: allowed capability not found in manifest: <name>` |
| Capability present but `approved: false` | `Strict policy verify failed: allowed capability not approved: <name>` |
| Capability present, approved, but `review_needed: true` | `Strict policy verify failed: allowed capability requires review: <name>` |

With `--strict --json` on success:

```json
{
  "valid": true,
  "strict": true,
  "path": ".tusq/execution-policy.json",
  "manifest_path": "tusq.manifest.json",
  "manifest_version": 2,
  "policy": {
    "schema_version": "1.0",
    "mode": "dry-run",
    "reviewer": "ops@example.com",
    "approved_at": "2026-04-22T05:20:21.000Z",
    "allowed_capabilities": ["get_users_users"]
  },
  "approved_allowed_capabilities": 1
}
```

With `--strict --json` on failure:

```json
{
  "valid": false,
  "strict": true,
  "path": ".tusq/execution-policy.json",
  "manifest_path": "tusq.manifest.json",
  "error": "Strict policy verify failed: allowed capability not approved: get_users_users",
  "strict_errors": [
    { "name": "get_users_users", "reason": "not_approved" }
  ]
}
```

**What a strict PASS does NOT prove:** a PASS is a policy/manifest alignment statement at verify time only — every name in `allowed_capabilities` exists in the manifest, is `approved: true`, and is not blocked on review. It is NOT an execution safety check, NOT a runtime gate, NOT a manifest freshness check, and NOT a pre-flight for `tusq serve --policy`. A strict PASS does not change what `tools/list` returns, does not authorize capability execution, and does not substitute for any approval workflow.

Canonical scaffold → verify → serve workflow:

```bash
tusq policy init --mode dry-run --reviewer ops@example.com
tusq policy verify --strict --json
tusq serve --policy .tusq/execution-policy.json
```

## `tusq domain index`

Emit a deterministic, per-domain capability index from manifest evidence. Groups capabilities by their `domain` field in manifest first-appearance order, with a special `unknown` bucket for capabilities whose domain is `null`, missing, or empty-string. This is a **planning aid, not a skill-pack/rollout/workflow generator**.

```bash
tusq domain index [--domain <name>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--domain <name>` | unset | Filter to a single domain bucket (use `unknown` for the zero-evidence bucket) |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | unset | Write index to file (no stdout on success) |
| `--json` | unset | Emit machine-readable JSON |

| Exit code | Meaning |
|-----------|---------|
| `0` | Index produced (or empty-capabilities manifest) |
| `1` | Missing/invalid manifest, unknown flag, unknown domain, `--out` path error, or unknown subcommand |

**`aggregation_key` enum (frozen two-value):**

| Value | Meaning |
|-------|---------|
| `"domain"` | Capabilities sharing a named manifest `domain` value |
| `"unknown"` | Capabilities whose `domain` is `null`, missing, or empty-string |

**Per-domain entry fields:** `domain`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`, `has_unknown_auth`. Top-level: `manifest_path`, `manifest_version`, `generated_at`, `domains[]`.

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- Per-domain iteration order is manifest first-appearance order (never alphabetized); `unknown` bucket is always last.
- The two-value `aggregation_key` enum is frozen; any addition is a material governance event.
- A domain index is NOT a skill-pack, NOT a rollout plan, NOT a workflow definition, and NOT an agent persona.

```bash
# All domains (human-readable)
tusq domain index

# All domains (JSON)
tusq domain index --json

# Single domain
tusq domain index --domain users --json

# Zero-evidence bucket
tusq domain index --domain unknown --json

# Write to file
tusq domain index --out domain-index.json
```

## `tusq effect index`

Emit a deterministic, per-side-effect-class capability index from manifest evidence. Groups capabilities by their `side_effect_class` field in closed-enum order (`read → write → destructive → unknown`), with a special `unknown` bucket for capabilities whose `side_effect_class` is `null`, missing, empty-string, or any value outside the closed three-value classifier set. This is a **planning aid, not a runtime side-effect enforcer or risk-tier classifier**.

```bash
tusq effect index [--effect <read|write|destructive|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--effect <read\|write\|destructive\|unknown>` | all classes | Filter to a single side-effect class bucket |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown effect class, `--out` path error, or unknown subcommand

**Bucket iteration order:** `read → write → destructive → unknown` (closed-enum order — NOT manifest first-appearance order and NOT a risk-precedence statement). Empty buckets do not appear.

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- Bucket iteration order follows the closed enum (`read → write → destructive`, then `unknown` last); within each bucket, capabilities appear in manifest declared order.
- The four-value `side_effect_class` enum and the two-value `aggregation_key` enum are frozen; any addition is a material governance event.
- A side-effect index is NOT a runtime side-effect enforcer, NOT a risk classifier, NOT a confirmation-flow generator, and does NOT alter the M30 surface-plan gating rule.

```bash
# All classes (human-readable)
tusq effect index

# All classes (JSON)
tusq effect index --json

# Single class
tusq effect index --effect destructive --json

# Zero-evidence bucket
tusq effect index --effect unknown --json

# Write to file
tusq effect index --out effect-index.json
```

## `tusq input index`

Emit a deterministic, per-required-input-field-count-tier capability index from manifest evidence. Groups capabilities by a tier derived from the cardinality of their `input_schema.required[]` array (M11/M14/M24-derived) in closed-enum order (`none → low → medium → high → unknown`), with a special `unknown` bucket for capabilities whose `input_schema` field is missing, not a plain object, whose `required` field is missing or not an array, or whose `required[]` array contains any non-string or empty-string element. This is a **planning aid, not a runtime input executor, input-schema validator, input generator, or exposure-safety certifier**.

```bash
tusq input index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--tier <none\|low\|medium\|high\|unknown>` | all tiers | Filter to a single required input field count tier bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success; rejected if path is inside `.tusq/` |
| `--json` | human text | Emit machine-readable JSON |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown/absent tier, `--out` path error, or unknown subcommand

**Tier function thresholds:**

| `capability.input_schema.required` condition | Tier |
|----------------------------------------------|------|
| Valid array, length === 0 | `none` |
| Valid array, 1 ≤ length ≤ 2 | `low` |
| Valid array, 3 ≤ length ≤ 5 | `medium` |
| Valid array, length ≥ 6 | `high` |
| `input_schema` missing / `null` / `undefined` | `unknown` (reason: `input_schema_field_missing`) |
| `input_schema` not a plain non-null object (includes Array) | `unknown` (reason: `input_schema_field_not_object`) |
| `required` missing / `null` / `undefined` | `unknown` (reason: `required_field_missing`) |
| `required` not an array | `unknown` (reason: `required_field_not_array`) |
| `required[]` contains non-string, empty string, `null`, array, or object element | `unknown` (reason: `required_array_contains_non_string_or_empty_element`) |

**Bucket iteration order:** `none → low → medium → high → unknown` (closed-enum order — NOT an exposure-risk ranking, NOT a blast-radius ranking). Empty buckets do not appear.

**`warnings[]` array:** Present in `--json` output always (even when empty `[]` for shape stability). Contains `{ capability, reason }` objects for each capability landing in the `unknown` bucket due to malformed `input_schema` or `required` field data. Five frozen warning reason codes: `input_schema_field_missing`, `input_schema_field_not_object`, `required_field_missing`, `required_field_not_array`, `required_array_contains_non_string_or_empty_element`. In human mode, warnings are emitted to stderr.

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- `required_input_field_count_tier` is NOT written into the manifest — it is derived at read-time only.
- The five-value `required_input_field_count_tier` enum and the two-value `aggregation_key` enum are frozen; any addition is a material governance event.
- A required input field count tier index is NOT a runtime enforcer, NOT an input-schema validator, NOT an input generator, and does NOT certify exposure-safety.

```bash
# All tiers (human-readable)
tusq input index

# All tiers (JSON)
tusq input index --json

# Single tier
tusq input index --tier high --json

# Zero-evidence bucket
tusq input index --tier unknown --json

# Write to file
tusq input index --out input-index.json
```

## `tusq examples index`

Emit a deterministic, per-examples-count-tier capability index from manifest evidence. Groups capabilities by a tier derived from the cardinality of their `examples[]` array in closed-enum order (`none → low → medium → high → unknown`), with a special `unknown` bucket for capabilities whose `examples` field is missing, `null`, not an array, or contains a `null`, array, or non-object element. This is a **planning aid, not a runtime examples validator, documentation-completeness enforcer, or compliance certifier**.

```bash
tusq examples index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--tier <none\|low\|medium\|high\|unknown>` | all tiers | Filter to a single examples count tier bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success; rejected if path is inside `.tusq/` |
| `--json` | human text | Emit machine-readable JSON |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown/absent tier, `--out` path error, or unknown subcommand

**Tier function thresholds:**

| `capability.examples` condition | Tier |
|---------------------------------|------|
| Valid array, length === 0 | `none` |
| Valid array, 1 ≤ length ≤ 2 | `low` |
| Valid array, 3 ≤ length ≤ 5 | `medium` |
| Valid array, length ≥ 6 | `high` |
| Missing / null / not-an-array / contains null/array/non-object | `unknown` |

**Bucket iteration order:** `none → low → medium → high → unknown` (closed-enum order — NOT a documentation-quality ranking). Empty buckets do not appear.

**`warnings[]` array:** Present in `--json` output always (even when empty). Contains `{ capability, reason }` objects for each capability landing in the `unknown` bucket due to malformed `examples` field data. Warning reason codes: `examples_field_missing`, `examples_field_not_array`, `examples_array_contains_null_element`, `examples_array_contains_array_element`, `examples_array_contains_non_object_element`. In human mode, warnings are emitted to stderr.

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- `examples_count_tier` is NOT written into the manifest — it is derived at read-time only.
- The five-value `examples_count_tier` enum and the two-value `aggregation_key` enum are frozen; any addition is a material governance event.
- A examples count tier index is NOT a runtime enforcer, NOT an API docs quality gate, and does NOT re-classify or modify any capability field.

```bash
# All tiers (human-readable)
tusq examples index

# All tiers (JSON)
tusq examples index --json

# Single tier
tusq examples index --tier high --json

# Zero-evidence bucket
tusq examples index --tier unknown --json

# Write to file
tusq examples index --out examples-index.json
```

## `tusq method index`

Emit a deterministic, per-HTTP-method capability index from manifest evidence. Groups capabilities by their verbatim `method` field value in closed-enum order (`GET → POST → PUT → PATCH → DELETE → unknown`), with a special `unknown` bucket for capabilities whose `method` is `null`, missing, empty-string, or any non-canonical value (HEAD, OPTIONS, etc.). This is a **planning aid, not a runtime HTTP-method router, REST-convention validator, or idempotency classifier**.

```bash
tusq method index [--method <GET|POST|PUT|PATCH|DELETE|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--method <GET\|POST\|PUT\|PATCH\|DELETE\|unknown>` | all methods | Filter to a single HTTP method bucket; **case-sensitive uppercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown method, `--out` path error, or unknown subcommand

**Bucket iteration order:** `GET → POST → PUT → PATCH → DELETE → unknown` (closed-enum order — NOT manifest first-appearance order and NOT a risk-precedence statement). Empty buckets do not appear. The order matches the conventional REST CRUD reading order (read, create, replace, update, delete) but carries no risk semantic.

**Case-sensitive filter:** `--method` values are matched verbatim. Lowercase values like `get` or `delete` exit 1 with `Unknown method: <value>` — do not silently coerce case.

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- Bucket iteration order follows the closed enum (`GET → POST → PUT → PATCH → DELETE`, then `unknown` last); within each bucket, capabilities appear in manifest declared order.
- The six-value `http_method` enum and the two-value `aggregation_key` enum are frozen; any addition is a material governance event.
- A method index is NOT a runtime HTTP-method router, NOT a REST-convention validator, NOT an idempotency classifier, does NOT modify the M32 `side_effect_class` derivation rules, and does NOT alter the M30 surface-plan gating rules.

```bash
# All methods (human-readable)
tusq method index

# All methods (JSON)
tusq method index --json

# Single method (uppercase — case-sensitive)
tusq method index --method DELETE --json

# Zero-evidence bucket
tusq method index --method unknown --json

# Write to file
tusq method index --out method-index.json
```

## `tusq sensitivity index`

Emit a deterministic, per-sensitivity-class capability index from manifest evidence. Groups capabilities by their M28-derived `sensitivity_class` field in closed-enum order (`public → internal → confidential → restricted → unknown`), with a special `unknown` bucket for capabilities whose `sensitivity_class` is `null`, missing, empty-string, or any value outside the closed four-value named set. This is a **planning aid, not a runtime sensitivity enforcer or compliance certifier**.

```bash
tusq sensitivity index [--sensitivity <public|internal|confidential|restricted|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--sensitivity <public\|internal\|confidential\|restricted\|unknown>` | all classes | Filter to a single sensitivity class bucket |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown sensitivity class, `--out` path error, or unknown subcommand

**Bucket iteration order:** `public → internal → confidential → restricted → unknown` (closed-enum order — NOT manifest first-appearance order and NOT a risk-precedence statement). Empty buckets do not appear.

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- Bucket iteration order follows the closed enum (`public → internal → confidential → restricted`, then `unknown` last); within each bucket, capabilities appear in manifest declared order.
- The five-value `sensitivity_class` enum (aligned 1:1 with the M28 `SENSITIVITY_CLASSES` constant) and the two-value `aggregation_key` enum are frozen; any addition is a material governance event.
- A sensitivity index is NOT a runtime sensitivity enforcer, NOT a compliance certifier, NOT a retention-policy generator, does NOT modify the M28 `sensitivity_class` derivation rules, and does NOT alter the M30 surface-plan gating rules.

```bash
# All classes (human-readable)
tusq sensitivity index

# All classes (JSON)
tusq sensitivity index --json

# Single class
tusq sensitivity index --sensitivity confidential --json

# Zero-evidence bucket
tusq sensitivity index --sensitivity unknown --json

# Write to file
tusq sensitivity index --out sensitivity-index.json
```

## `tusq redaction review`

Emit a deterministic, per-capability reviewer report aggregating M25 `redaction.pii_fields`, M26 `redaction.pii_categories`, and frozen per-category advisory text from `PII_REVIEW_ADVISORY_BY_CATEGORY`. This is a **reviewer aid, not a runtime enforcement gate**.

```bash
tusq redaction review [--manifest <path>] [--capability <name>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--capability <name>` | unset | Filter to one exact capability name |
| `--json` | unset | Emit machine-readable JSON |

| Exit code | Meaning |
|-----------|---------|
| `0` | Manifest read successfully; report emitted |
| `1` | Missing/invalid manifest, unknown capability, unknown flag, or unknown subcommand |

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- `sensitivity_class`, `retention_days`, `log_level`, and `mask_in_traces` are never auto-escalated or auto-populated.
- Advisory text uses the em-dash character (U+2014); wording is frozen in `PII_REVIEW_ADVISORY_BY_CATEGORY`.
- A review report is NOT a compliance certification, NOT runtime PII enforcement, and NOT a substitute for reviewer judgment.

```bash
# Human-readable report (default)
tusq redaction review

# Machine-readable JSON
tusq redaction review --json

# Filter to a single capability
tusq redaction review --capability post_auth_auth --json
```

## `tusq version`

Print the current version.

```bash
tusq version
```

## `tusq help`

Print command help.

```bash
tusq help
```

## Exit behavior

- Invalid command: exits `1` and prints help.
- Invalid flag: exits `1` and prints per-command usage.
- Missing prerequisites (no config / no scan / no manifest): exits `1` with an explicit error message.
- Diff gate failure: exits `1` with `Review gate failed:` and the capability names requiring approval.
