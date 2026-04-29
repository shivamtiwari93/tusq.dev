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

## `tusq binding index`

Emit a deterministic, per-HTTP-request-anatomy-source capability index from manifest evidence. Groups capabilities by the `source` field of the FIRST property declared under `input_schema.properties` (Object.keys insertion-order index 0, when `input_schema.type === 'object'`), using a closed six-value bucket-key enum (`path | request_body | query | header | not_applicable | unknown`). This is a **planning aid, not a runtime request validator, request-conformance detector, SDK call-site generator, or widget-render-control deriver**.

**M43 vs M51 distinction:** `tusq request index` (M43) buckets on the UNION of ALL properties' `source` values (capability-wide categorical: `path | request_body | query | header | mixed | none | unknown`, where `mixed` denotes multi-locus capabilities and `none` denotes zero-property capabilities). `tusq binding index` (M51) buckets on ONLY `properties[firstKey].source` (single-property categorical: `path | request_body | query | header | not_applicable | unknown` — no `mixed` value because index 0 is a single property; `not_applicable` rather than `none` to parallel M48/M49/M50 first-property-axis convention).

```bash
tusq binding index [--source <value>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--source <path\|request_body\|query\|header\|not_applicable\|unknown>` | all sources | Filter to a single source bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed capabilities) |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown source value, `--out` path error, or unknown subcommand

**Bucket iteration order:** `path → request_body → query → header → not_applicable → unknown` (closed-enum order matching M43's first-four locus ordering — NOT security-blast-radius-ranked, NOT workflow-criticality-ranked, NOT permission-sensitivity-ranked, NOT HTTP-spec-precedence-ranked, NOT skill-composition-priority-ranked, NOT widget-render-precedence-ranked). Empty buckets do not appear.

**Classifier function (frozen):**

| Input | Result | Warning? |
|-------|--------|----------|
| `input_schema` missing/null/undefined | `unknown` | `input_schema_field_missing` |
| `input_schema` not a plain non-null object | `unknown` | `input_schema_field_not_object` |
| `input_schema.type` missing or non-string | `unknown` | `input_schema_type_missing_or_invalid` |
| `input_schema.type` is a string but not `'object'` | `not_applicable` | none |
| `type === 'object'`, `properties` missing/null/not-plain-object | `unknown` | `input_schema_properties_field_missing_when_type_is_object` |
| `type === 'object'`, `Object.keys(properties).length === 0` | `not_applicable` | none |
| `properties[firstKey]` not plain object, OR `.source` not a string, OR `.source` not in `{path,request_body,query,header}` | `unknown` | `input_schema_properties_first_property_source_invalid` |
| `properties[firstKey].source ∈ {path,request_body,query,header}` | `.source` verbatim | none |

**Case-sensitive filter:** `--source` values are matched verbatim. `--source PATH` exits 1 with `Unknown input schema first property source: PATH`. `--source cookie` exits 1 (cookie is NOT in the closed six-value enum; cookie-locus extension is reserved for `M-Binding-Cookie-Bucket-1`).

**Per-bucket fields:** `input_schema_first_property_source`, `aggregation_key` (`"source"` for four locus buckets, `"not_applicable"`, or `"unknown"`), `capability_count`, `capabilities[]` (manifest declared order), `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**`warnings[]` (JSON mode only):** Always present (empty `[]` when no malformed capabilities). Five frozen reason codes: `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_source_invalid`. The `not_applicable` bucket and all four locus buckets emit NO warning. Human mode emits one `Warning: capability '<name>' has malformed input_schema first property source (<reason>)` line per malformed capability to stderr.

**Invariants:**
- `tusq.manifest.json` is never modified; `input_schema_first_property_source` MUST NOT be written into the manifest.
- The six-value `input_schema_first_property_source` bucket-key enum, the three-value `aggregation_key` enum, the closed four-value property-source value set (`path`, `request_body`, `query`, `header`), and the five-value warning reason-code enum are frozen.
- Per-property source beyond index 0 NOT walked (reserved `M-Binding-All-Properties-Source-Index-1`).
- Nested-object property source NOT walked (reserved `M-Binding-Nested-Property-Source-Index-1`).
- OUTPUT-side first-property source NOT classified here (reserved `M-Binding-Output-First-Property-Source-Index-1`).
- Cookie/file/multipart locus extensions NOT in scope (reserved `M-Binding-Cookie-Bucket-1`, `M-Binding-File-Bucket-1`).
- Widget-render-control derivation NOT computed inline (reserved `M-Binding-Widget-Renderer-Crossref-1`).
- Runtime payload conformance NOT detected here (reserved `M-Binding-Runtime-Conformance-1`).
- SDK call-site signature generation NOT in scope (reserved `M-Binding-SDK-Generator-1`).
- Distinct from M43 (`tusq request index` — capability-wide source UNION), M47 (`tusq parameter index` — properties count), M49 (`tusq signature index` — firstKey primitive type), M50 (`tusq obligation index` — firstKey required-status), M48 (`tusq shape index` — output-side first-property type).

```bash
# All source buckets (human-readable)
tusq binding index

# All source buckets (JSON)
tusq binding index --json

# Single source bucket (lowercase — case-sensitive)
tusq binding index --source path --json

# Request-body-bound first properties
tusq binding index --source request_body --json

# Write to file
tusq binding index --out binding-index.json
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

## `tusq description index`

Emit a deterministic, per-description-word-count-tier capability index from manifest evidence. Groups capabilities by a tier derived from their `description` field's whitespace-token count using frozen thresholds (`low` for ≤7 tokens, `medium` for 8–14 tokens, `high` for ≥15 tokens, `unknown` for null/missing/non-string/empty-after-trim), in closed-enum order (`low → medium → high → unknown`). Tokenization is purely whitespace-based using `description.trim().split(/\s+/u).length` — markdown is NOT stripped, HTML tags are NOT stripped, numbers are NOT stripped, Unicode whitespace is handled by the `/u` flag. This is a **planning aid, not a runtime doc-quality enforcer, doc-contradiction detector, claim-richness certifier, or public-doc compliance auditor**.

```bash
tusq description index [--tier <low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--tier <low\|medium\|high\|unknown>` | all tiers | Filter to a single description word count tier bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON with `tiers[]` and `warnings[]` |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown description word count tier, `--out` path error, or unknown subcommand

**Frozen tier function** (thresholds `7`/`14` are immutable):

| Token count | Tier |
|-------------|------|
| `count <= 7` | `low` |
| `8 <= count <= 14` | `medium` |
| `count >= 15` | `high` |
| null / undefined / missing `description` field | `unknown` (warning emitted) |
| `description` is not a string | `unknown` (warning emitted) |
| `description` is empty or whitespace-only after `.trim()` | `unknown` (warning emitted) |

**Bucket iteration order:** `low → medium → high → unknown` (ascending tier numeric span — closed-enum order, NOT doc-quality-ranked, NOT doc-completeness-ranked, NOT doc-richness-ranked). Empty buckets do not appear.

**Case-sensitive filter:** `--tier` values are matched verbatim. Uppercase values like `LOW` exit 1 with `Unknown description word count tier: LOW`.

**Per-bucket fields:** `description_word_count_tier`, `aggregation_key` (`"tier"` or `"unknown"`), `capability_count`, `capabilities[]` (manifest declared order), `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**`warnings[]` array:** Present in `--json` output always (even when empty). Three frozen reason codes:
- `description_field_missing` — no `description` key on the capability
- `description_field_not_string` — `description` is not a string
- `description_field_empty_after_trim` — `description` trims to an empty string

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- `description_word_count_tier` is NOT written into the manifest — it is derived at read-time only.
- The four-value `description_word_count_tier` enum, the two-value `aggregation_key` enum, and the tier thresholds (`7`/`14`) are frozen; any change is a material governance event.
- Sub-schema walking is NOT performed: `input_schema.description`, `output_schema.description`, and `examples[].description` are NOT consulted.

```bash
# All tiers (human-readable)
tusq description index

# All tiers (JSON)
tusq description index --json

# Single tier bucket
tusq description index --tier low --json

# High-verbosity bucket only
tusq description index --tier high --json

# Write to file
tusq description index --out description-tier-index.json
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

### `tusq items index`

Index capabilities by output schema items type (for array-typed responses). Groups capabilities by the JSON-Schema `output_schema.items.type` value in closed-enum order (`object → array → string → number → integer → boolean → null → not_applicable → unknown`). For capabilities where `output_schema.type === 'array'`, the `items.type` is the most fundamental structural claim about how each array element will render in the frontend: `object` → multi-column table; `string`/`number`/`integer`/`boolean`/`null` → single-column list; `array` → nested-array tree. Capabilities with `output_schema.type !== 'array'` land in the `not_applicable` bucket (valid named bucket, not an error). This is a **planning aid, not a runtime response validator, frontend component generator, or rendering completeness certifier**.

```bash
tusq items index [--items-type <value>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--items-type <value>` | all types | Filter to a single items-type bucket; **case-sensitive lowercase only** (`OBJECT` exits 1) |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success; rejected if path is inside `.tusq/` |
| `--json` | human text | Emit machine-readable JSON |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown/absent `--items-type`, `--out` path error, or unknown subcommand

**Bucket-key enum** (closed nine-value, immutable): `object | array | string | number | integer | boolean | null | not_applicable | unknown`

**Tier function:**

| `output_schema` condition | Bucket |
|---------------------------|--------|
| `output_schema` missing / null / not a plain object | `unknown` (reason: `output_schema_field_missing` or `output_schema_field_not_object`) |
| `output_schema.type` missing / null / not a string | `unknown` (reason: `output_schema_field_missing`) |
| `output_schema.type` is a string but not `'array'` | `not_applicable` (NO warning emitted) |
| `output_schema.type === 'array'`, `items` missing / malformed | `unknown` (reason: `output_schema_items_field_missing_when_type_is_array` or `output_schema_items_field_not_object_when_type_is_array`) |
| `output_schema.type === 'array'`, `items.type` missing or not in JSON-Schema primitive set | `unknown` (reason: `output_schema_items_type_field_missing_or_invalid_when_type_is_array`) |
| `output_schema.type === 'array'`, `items.type` in closed set | literal `items.type` value (one of seven primitives) |

> **Note:** `integer` is a **first-class bucket** in M45 — it is NOT collapsed into `number` (unlike M42 which buckets integer as unknown). A typed array of integers is a distinct frontend rendering target from a typed array of arbitrary numbers.

> **Note:** `not_applicable` is a valid named bucket and emits NO warning. It simply means the capability's output schema is not an array-typed response, so there is no `items.type` to evaluate.

**`warnings[]` array:** Present in `--json` output always (even when empty `[]` for shape stability). Five frozen warning reason codes: `output_schema_field_missing`, `output_schema_field_not_object`, `output_schema_items_field_missing_when_type_is_array`, `output_schema_items_field_not_object_when_type_is_array`, `output_schema_items_type_field_missing_or_invalid_when_type_is_array`. In human mode, warnings are emitted to stderr.

**Bucket iteration order:** `object → array → string → number → integer → boolean → null → not_applicable → unknown` (deterministic stable-output convention only — NOT UI-rendering-precedence-ranked, NOT frontend-blast-radius-ranked).

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- `output_schema_items_type` is NOT written into the manifest — it is derived at read-time only.
- Compositional items (`oneOf`/`anyOf`/`allOf`), tuple-style items (items as array), and multi-type items (`items.type` as array) all bucket as `unknown`.
- Nested-array element typing (`items.items.type`) is NOT examined.

```bash
# All items types (human-readable)
tusq items index

# All items types (JSON)
tusq items index --json

# Filter to object items type only
tusq items index --items-type object

# Filter to not_applicable bucket
tusq items index --items-type not_applicable --json

# Filter to integer bucket (first-class, not collapsed to number)
tusq items index --items-type integer --json

# Write to file
tusq items index --out items-type-index.json
```

## `tusq least index`

Emit a deterministic, per-first-input-property-minItems-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].minItems` is a non-negative integer (`bounded`), absent or `null` (`unbounded`), non-applicable (`not_applicable` — non-object input, zero-property object, or firstVal type is not `array`), or malformed (`unknown`). This is a **planning aid, not a runtime array-cardinality-floor validator, runtime array-element-counter, DTO-array-length-validator, static-understanding-coverage-tier-aggregator, route-extraction-quality-validator, framework-detection-strictness-aggregator, validation-layer-array-shape-validator, maxItems-crossref tool, uniqueItems-crossref tool, items-schema-crossref tool, doc-contradiction detector, LLM-min-items-inferrer, or statistical aggregator**.

**M73-vs-M62 (`floor` minLength) / M73-vs-M65 (`lower` minimum) / M73-vs-M67 (`above` exclusiveMinimum) distinctness:** `tusq floor index` (M62) reads `firstKey.minLength` (string Unicode-codepoint-count lower bound). `tusq lower index` (M65) reads `firstKey.minimum` (numeric value lower bound). `tusq above index` (M67) reads `firstKey.exclusiveMinimum` (exclusive numeric value lower bound). `tusq least index` (M73) reads `firstKey.minItems` (array element-count lower bound). All four are SIBLING-but-ORTHOGONAL bounded-range annotations on the same firstVal — each names a distinct JSON-Schema Draft 7 keyword covering a different data-type cardinality dimension.

```bash
tusq least index [--least <bounded|unbounded|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--least <bounded\|unbounded\|not_applicable\|unknown>` | all buckets | Filter to a single minItems annotation bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed `input_schema` or invalid first-property descriptor) |

**Classifier rule** (applied to `input_schema.properties[firstKey].minItems` when `input_schema.type === "object"` and `firstVal.type === "array"`):

| Outcome | Condition |
|---------|-----------|
| `bounded` | `Number.isInteger(properties[firstKey].minItems) && properties[firstKey].minItems >= 0` (NON-NEGATIVE-INTEGER-IS-VALID-MIN-ITEMS; **PRESENT-AS-PRESENT-ZERO**: `minItems: 0` → `bounded` — explicit-zero is semantically distinct from absent: the operator asserted the floor was considered and set to zero; NO-COERCION via `Number()`/`parseInt()`/`parseFloat()`) |
| `unbounded` | `properties[firstKey].minItems` is absent, `undefined`, or `null` (**ABSENT-AS-UNBOUNDED**: absent/undefined → `unbounded` — JSON-Schema Draft 7 default is no-floor; **NULL-AS-ABSENT**: `null` → `unbounded`, mirrors M55–M72; no warning in both cases) |
| `not_applicable` | `input_schema.type` is a string but not `"object"` OR zero-property object OR `firstVal.type` is a string but not `"array"` (**TYPE-APPLICABILITY-ARRAY**: mirrors M62 TYPE-APPLICABILITY-STRING for minLength — minItems is JSON-Schema-Draft-7-defined ONLY for array-typed properties) |
| `unknown` | `input_schema` missing/null/not-a-plain-object; `input_schema.type` missing or non-string; `input_schema.type === "object"` but `properties` missing/null/not-a-plain-object; `properties[firstKey]` not a plain object; OR `properties[firstKey].minItems` present non-null but not a non-negative integer (negative integer `-1`, fractional `0.5`/`1.5`, `NaN`, `Infinity`, `-Infinity`, string `'1'`, boolean `true`/`false`, array `[1]`, plain object `{}`) |

**Six frozen warning reason codes** (only `unknown` bucket emits warnings):
1. `input_schema_field_missing`
2. `input_schema_field_not_object`
3. `input_schema_type_missing_or_invalid`
4. `input_schema_properties_field_missing_when_type_is_object`
5. `input_schema_properties_first_property_descriptor_invalid`
6. `input_schema_properties_first_property_min_items_invalid_when_present` ← M73 axis-specific code; covers all invalid minItems values: negative-integer, fractional, NaN, Infinity, -Infinity, string, boolean, array, object; **NO-COERCION** via `Number()`/`parseInt()`/`parseFloat()`

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown minItems value, `--out` path error, or unknown subcommand

**Bucket iteration order:** `bounded → unbounded → not_applicable → unknown` (deterministic stable-output convention only — NOT schema-extraction-confidence-priority-ranked, NOT static-understanding-coverage-ranked, NOT route-extraction-quality-tier-ranked, NOT validation-layer-strictness-priority-ranked, NOT DTO-cardinality-floor-priority-ranked). Empty buckets do not appear.

**Invariants:**
- `tusq.manifest.json` is never modified; `input_schema_first_property_min_items` is NEVER written into the manifest (non-persistence rule).
- Object.keys insertion-order is used to determine `firstKey`; keys are NOT sorted or reordered.
- The classifier MUST NOT cross-reference `maxItems`, `uniqueItems`, `items`, `default`, `const`, `enum`, `required`, or any other JSON-Schema annotation.
- Per-property `minItems` annotation beyond the FIRST is NOT walked (reserved for `M-MinItems-All-Properties-Index-1`).

```bash
# All minItems annotation buckets (human-readable)
tusq least index

# All buckets (JSON)
tusq least index --json

# Bounded capabilities only (minItems is a non-negative integer)
tusq least index --least bounded --json

# Unbounded capabilities (minItems absent, null, or undefined)
tusq least index --least unbounded --json

# Write to file
tusq least index --out least-index.json
```

## `tusq regex index`

Emit a deterministic, per-first-input-property-pattern-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].pattern` is a non-empty string (`patterned`), absent or `null` (`unpatterned`), non-applicable (`not_applicable`), or malformed (`unknown`). This is a **planning aid, not a runtime regex validator, regex compiler, regex-syntax-error detector, doc-contradiction detector, LLM-pattern-inferrer, or pattern-format-crossref**.

**M59-vs-M53 distinctness:** `tusq hint index` (M53) reads `input_schema.properties[firstKey].format` (JSON-Schema's closed-vocabulary string-format hint such as `email`, `uri`, `date-time`). `tusq regex index` (M59) reads `input_schema.properties[firstKey].pattern` (JSON-Schema's open-ended regex string keyword). The two commands are read-only-invariant peers reading two orthogonal JSON-Schema string-validation primitives under two distinct nouns; neither alters the other's output bytes. The M53 `format` axis is a closed-vocabulary semantic hint; the M59 `pattern` axis is an open-ended regex constraint; an operator may set both, either, or neither on the same property.

```bash
tusq regex index [--regex <patterned|unpatterned|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--regex <patterned\|unpatterned\|not_applicable\|unknown>` | all buckets | Filter to a single pattern annotation bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed `input_schema` or invalid first-property descriptor) |

**Classifier rule** (applied to `input_schema.properties[firstKey].pattern` when `input_schema.type === "object"`):

| Outcome | Condition |
|---------|-----------|
| `patterned` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].pattern` is a string with `length >= 1` (WHITESPACE-ONLY-COUNTS-AS-PATTERNED — the classifier MUST NOT compile the regex or trim whitespace) |
| `unpatterned` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].pattern` is absent, `undefined`, or `null` (null-as-absent per M55/M56/M57/M58 precedent — no warning) |
| `not_applicable` | `input_schema.type` is a string but not `"object"` (non-object input has no first property) OR `input_schema.type === "object"` and `Object.keys(properties).length === 0` |
| `unknown` | `input_schema` missing/null/not-a-plain-object; `input_schema.type` missing or non-string; `input_schema.type === "object"` but `properties` missing/null/not-a-plain-object; `properties[firstKey]` not a plain object; OR `properties[firstKey].pattern` present non-null but not a string with length >= 1 (non-string OR empty-string `''`) |

**Six frozen warning reason codes** (only `unknown` bucket emits warnings):
1. `input_schema_field_missing`
2. `input_schema_field_not_object`
3. `input_schema_type_missing_or_invalid`
4. `input_schema_properties_field_missing_when_type_is_object`
5. `input_schema_properties_first_property_descriptor_invalid`
6. `input_schema_properties_first_property_pattern_invalid_when_present` ← M59 axis-specific code; covers BOTH non-string AND empty-string `pattern` malformations under a single consolidated code

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown pattern value, `--out` path error, or unknown subcommand

**Bucket iteration order:** `patterned → unpatterned → not_applicable → unknown` (deterministic stable-output convention only — NOT static-understanding-completeness-ranked, NOT schema-extraction-coverage-ranked, NOT input-validation-strength-ranked, NOT regex-coverage-ranked, NOT pre-flight-validation-readiness-ranked, NOT framework-detection-confidence-ranked, NOT route-extraction-completeness-ranked, NOT auth-detection-completeness-ranked). Empty buckets do not appear.

**Invariants:**
- `tusq.manifest.json` is never modified; `input_schema_first_property_pattern` is NEVER written into the manifest.
- Object.keys insertion-order is used to determine `firstKey`; keys are NOT sorted or reordered.
- The classifier MUST NOT compile the regex, MUST NOT validate regex syntax, and MUST NOT cross-reference the pattern against the M53 `.format` annotation.
- Per-property pattern annotation beyond the FIRST is NOT walked (reserved for `M-Regex-All-Properties-Pattern-Index-1`).
- Whitespace-only patterns (`'   '`) are classified as `patterned` at this milestone (string length >= 1 is the only check; whitespace-trim normalization deferred to `M-Regex-Pattern-Whitespace-Distribution-1`).
- Empty-string patterns (`''`) are classified as `unknown` with the 6th warning code (EMPTY-STRING IS-MALFORMED, deliberate alignment with M57's `title:''` → unknown precedent).

```bash
# All pattern annotation buckets (human-readable)
tusq regex index

# All buckets (JSON)
tusq regex index --json

# Patterned capabilities only (pattern is a non-empty string on first property)
tusq regex index --regex patterned --json

# Unpatterned capabilities (pattern absent, undefined, or null on first property)
tusq regex index --regex unpatterned --json

# Write to file
tusq regex index --out regex-index.json
```

## `tusq legacy index`

Emit a deterministic, per-first-input-property-deprecated-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].deprecated` is boolean `true` (`deprecated`), boolean `false` or absent or `null` (`active`), non-applicable (`not_applicable`), or malformed (`unknown`). This is a **planning aid, not a runtime integration-readiness ranker, sunset-priority ranker, side-effect-emitter triage tool, webhook-migration planner, billing-integration stability assessor, queue-job deprecation scheduler, analytics-event sunset planner, or CRM-sync lifecycle-stage classifier**.

**M58-vs-M57-vs-M56 distinctness:** `tusq caption index` (M57) reads `input_schema.properties[firstKey].title` (JSON-Schema's short-label keyword). `tusq sample index` (M56) reads `input_schema.properties[firstKey].examples` (JSON-Schema's per-property example-values keyword). `tusq legacy index` (M58) reads `input_schema.properties[firstKey].deprecated` (JSON-Schema's per-property lifecycle-stage annotation). These three commands are read-only-invariant peers reading three distinct JSON-Schema annotations under three distinct nouns.

```bash
tusq legacy index [--legacy <deprecated|active|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--legacy <deprecated\|active\|not_applicable\|unknown>` | all buckets | Filter to a single deprecated annotation bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed `input_schema` or invalid first-property descriptor) |

**Classifier rule** (applied to `input_schema.properties[firstKey].deprecated` when `input_schema.type === "object"`):

| Outcome | Condition |
|---------|-----------|
| `deprecated` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].deprecated === true` (strict boolean `true` only — NO truthy/falsy coercion) |
| `active` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].deprecated === false` (EXPLICIT-FALSE-IS-ACTIVE — no warning) OR `properties[firstKey].deprecated` is absent, `undefined`, or `null` (null-as-absent per M55/M56/M57 precedent — no warning) |
| `not_applicable` | `input_schema.type` is a string but not `"object"` (non-object input has no first property) OR `input_schema.type === "object"` and `Object.keys(properties).length === 0` |
| `unknown` | `input_schema` missing/null/not-a-plain-object; `input_schema.type` missing or non-string; `input_schema.type === "object"` but `properties` missing/null/not-a-plain-object; `properties[firstKey]` not a plain object; OR `properties[firstKey].deprecated` present non-null but NOT a boolean (string `'true'`, number `1`/`0`, array, object) |

**Six frozen warning reason codes** (only `unknown` bucket emits warnings):
1. `input_schema_field_missing`
2. `input_schema_field_not_object`
3. `input_schema_type_missing_or_invalid`
4. `input_schema_properties_field_missing_when_type_is_object`
5. `input_schema_properties_first_property_descriptor_invalid`
6. `input_schema_properties_first_property_deprecated_invalid_when_present` ← M58 axis-specific code; covers ALL non-boolean malformations (string/number/array/object) under a single consolidated code

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown deprecated value, `--out` path error, or unknown subcommand

**Bucket iteration order:** `deprecated → active → not_applicable → unknown` (deterministic stable-output convention only — NOT integration-readiness-ranked, NOT sunset-priority-ranked, NOT side-effect-emitter-triage-ranked, NOT webhook-migration-priority-ranked, NOT billing-integration-stability-ranked, NOT queue-job-deprecation-ranked, NOT analytics-event-sunset-ranked, NOT CRM-sync-lifecycle-stage-ranked). Empty buckets do not appear.

**Invariants:**
- `tusq.manifest.json` is never modified; `input_schema_first_property_deprecated` is NEVER written into the manifest.
- Object.keys insertion-order is used to determine `firstKey`; keys are NOT sorted or reordered.
- Per-property deprecated annotation beyond the FIRST is NOT walked (reserved for `M-Legacy-All-Properties-Index-1`).
- Strict boolean semantics: `deprecated === true` is the ONLY path to the `deprecated` bucket. Truthy values (number `1`, string `'true'`, object `{}`) all bucket as `unknown` with the 6th warning code.

```bash
# All deprecated annotation buckets (human-readable)
tusq legacy index

# All buckets (JSON)
tusq legacy index --json

# Deprecated capabilities only (strict boolean true on first property)
tusq legacy index --legacy deprecated --json

# Active capabilities (false, absent, or null deprecated on first property)
tusq legacy index --legacy active --json

# Write to file
tusq legacy index --out legacy-index.json
```

### `tusq output index`

Index capabilities by output schema property count tier.

```
tusq output index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--tier <value>` | Filter to a single tier bucket (case-sensitive lowercase) |
| `--manifest <path>` | Manifest file (default: `tusq.manifest.json`) |
| `--out <path>` | Write index to file (suppresses stdout) |
| `--json` | Machine-readable JSON output |

**Tier function** (applied to `Object.keys(output_schema.properties).length`):

| Tier | Condition |
|------|-----------|
| `none` | `length === 0` |
| `low` | `1 <= length <= 2` |
| `medium` | `3 <= length <= 5` |
| `high` | `length >= 6` |
| `unknown` | `output_schema` missing/not-an-object, `properties` missing/not-an-object, or `properties` contains a non-object descriptor |

> **Note on `type:array` schemas:** Response shapes typed as `"array"` have no top-level `properties` key (per-element shape lives under `items`). These are bucketed as `unknown` with reason `output_schema_properties_field_missing` — this is informative, not a defect. It signals "no top-level property-level doc-drift anchors; the items shape is the relevant contract surface."

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown tier, `--out` path error, or unknown subcommand

**Planning aid notice:** This command is a planning aid, not a runtime output executor, output-schema validator, doc-contradiction detector, output generator, or doc-accuracy certifier. Tiers are deterministic stable-output ordering only (NOT doc-drift-risk-ranked, NOT staleness-ranked).

### `tusq parameter index`

Index capabilities by input schema property count tier. Groups capabilities by the cardinality of `input_schema.properties` Object.keys in closed-enum order (`none → low → medium → high → unknown`). This is a **planning aid, not a runtime request validator, parameter-count-driven tool-listing budget generator, LLM-context-length policy engine, or MCP parameter-footprint certifier**.

```
tusq parameter index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--tier <value>` | Filter to a single tier bucket (case-sensitive lowercase) |
| `--manifest <path>` | Manifest file (default: `tusq.manifest.json`) |
| `--out <path>` | Write index to file (suppresses stdout) |
| `--json` | Machine-readable JSON output |

**Tier function** (applied to `Object.keys(input_schema.properties).length`; thresholds `0/2/5/6` match M40 verbatim and are immutable):

| Tier | Condition |
|------|-----------|
| `none` | `length === 0` (0 parameters — no parameter footprint) |
| `low` | `1 <= length <= 2` |
| `medium` | `3 <= length <= 5` |
| `high` | `length >= 6` |
| `unknown` | `input_schema` missing/not-an-object, `properties` missing/not-an-object, or `properties` contains a non-object descriptor |

> **Note:** `none` is a valid named bucket (capabilities with 0 input properties), not a malformation — no warning is emitted. Only `unknown` triggers warnings. Nested properties (`input_schema.properties[].properties`) are NOT walked (reserved for `M-Parameter-Nested-Properties-1`). The `required ∩ properties` intersection is NOT computed (M39 covers `input_schema.required[]` cardinality).

**Warning reason codes** (in `warnings[]` JSON field):
- `input_schema_field_missing` — `input_schema` key absent or `null`
- `input_schema_field_not_object` — `input_schema` is not a plain object
- `input_schema_properties_field_missing` — `input_schema.properties` key absent
- `input_schema_properties_field_not_object` — `input_schema.properties` is not a plain object
- `input_schema_properties_field_contains_invalid_descriptor` — a property descriptor is `null`, primitive, or array

**`--json` top-level shape:** `{ manifest_path, manifest_version, generated_at, tiers[], warnings[] }`. `warnings[]` is always present (empty `[]` when no malformed capabilities).

**Per-bucket fields:** `input_schema_property_count_tier`, `aggregation_key` (`"tier"` for named buckets, `"unknown"` for unknown), `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown tier, `--out` path error, or unknown subcommand

**Planning aid notice:** This command is a planning aid, not a runtime request validator, parameter-count-driven tool-listing budget generator, LLM-context-length policy engine, or MCP parameter-footprint certifier. Tiers are deterministic stable-output ordering only (NOT parameter-sprawl-precedence-ranked, NOT complexity-blast-radius-ranked).

### `tusq path index`

Index capabilities by URL path segment count tier.

```
tusq path index [--tier <none|low|medium|high|unknown>] [--manifest <path>] [--out <path>] [--json]
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--tier <value>` | Filter to a single tier bucket (case-sensitive lowercase) |
| `--manifest <path>` | Manifest file (default: `tusq.manifest.json`) |
| `--out <path>` | Write index to file (suppresses stdout) |
| `--json` | Machine-readable JSON output |

**Tier function** (applied to `path.split('/').filter(Boolean).length`; thresholds `0/2/4/5` are immutable):

| Tier | Condition |
|------|-----------|
| `none` | Segment count `=== 0` (path is `"/"`) |
| `low` | `1 <= count <= 2` (e.g., `/users`, `/api/users`) |
| `medium` | `3 <= count <= 4` (e.g., `/api/v1/users`, `/api/v1/users/:id`) |
| `high` | `count >= 5` (e.g., `/api/v1/orgs/:orgId/projects`) |
| `unknown` | `path` missing/null/not-a-string, empty string, no leading `/`, or contains empty interior segment (`//`) |

> **Note on path parameters:** `:id`-style path parameters count as one segment each — they are NOT unwrapped or downscaled. `/api/v1/users/:id` has 4 segments and lands in `medium`.

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown tier, `--out` path error, or unknown subcommand

**Planning aid notice:** This command is a planning aid, not a runtime URL router, path validator, route-registry validator, path-contradiction detector, URL generator, or route-registration certifier. Tiers are deterministic stable-output ordering only (NOT sprawl-risk-ranked, NOT blast-radius-ranked, NOT depth-ranked).

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

## `tusq fixed index`

Emit a deterministic, per-first-input-property-const-single-allowed-value-pin-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].const` is present with a non-`undefined` value (`pinned`), absent or `undefined` (`unpinned`), non-applicable (`not_applicable` — non-object input or zero-property object), or structurally malformed (`unknown`) in closed-enum order (`pinned → unpinned → not_applicable → unknown`). This is a **planning aid, not a runtime const enforcer, marketplace-pin-generator, MCP-server-output-generator, marketplace-package-generator, MCP-server-tool-call-wrapper-pin-enforcer, doc-contradiction detector, enum-aggregator, default-aggregator, value-type-distributor, value-cardinality-tier-distributor, joint-validity-validator, type-applicability validator, LLM-const-inferrer, or statistical aggregator**.

**M69-vs-M54-vs-M55 distinction:** `tusq fixed index` (M69) reads `input_schema.properties[firstKey].const` — the **FIRST input property's** JSON-Schema Draft 6+ `const` keyword: a single-allowed-value pin with **cardinality-EXACTLY-1** (`value === const`; the operator **MUST NOT** override the pin at runtime). `tusq choice index` (M54) reads `firstKey.enum` — the closed LIST of allowed values with **cardinality-≥1** (orthogonal cardinality of the closed-vocabulary constraint; an `enum` LIST may have multiple allowed values while `const` pins to exactly one). `tusq preset index` (M55) reads `firstKey.default` — the **operator-OVERRIDABLE** pre-fill seed value (orthogonal mutability semantic: the operator **MAY** override `default` at runtime, but **MUST NOT** diverge from `const`). Three orthogonal JSON-Schema keywords; neither alters the others' output bytes.

**M69-SPECIFIC invariants:**
- **NULL-IS-VALID-CONST:** `const: null` → `pinned` (no warning) — deliberate divergence from M55–M68 null-as-absent precedent; `null` is a valid JSON-Schema single-allowed-value pin ("value MUST be null"), mirroring M55's `default: null` → `defaulted` pattern.
- **FALSY-IS-VALID-CONST:** `const: false` / `const: 0` / `const: ""` / `const: []` / `const: {}` → `pinned` (no warning) — every JSON falsy is a legal declared pin value, mirrors M55's FALSY-DEFAULT-COUNTS-AS-DEFAULTED.
- **ANY-JSON-VALUE-IS-VALID-CONST:** any JSON value (string, number, boolean, null, array, object) → `pinned`; NO 6th warning code because the JSON-Schema `const` keyword accepts any JSON value type with no value-type failure mode (deliberate alignment with M55 pattern; deliberate divergence from M56–M68 six-frozen-codes pattern).
- **Undefined-as-absent (only):** `const: undefined` → `unpinned`; classifier uses `Object.prototype.hasOwnProperty.call(firstVal, 'const') && firstVal.const !== undefined`.

```
tusq fixed index [--fixed <pinned|unpinned|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--fixed <value>` | all buckets | Filter to single const annotation bucket; **case-sensitive lowercase only**: `pinned`, `unpinned`, `not_applicable`, `unknown` |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write JSON index to file (no stdout on success); rejects paths inside `.tusq/` |
| `--json` | false | Emit machine-readable JSON (includes `warnings[]` for malformed `input_schema`) |

**JSON output shape:**
```json
{
  "manifest_path": "<path>",
  "manifest_version": 1,
  "generated_at": "<ISO-8601>",
  "first_property_const_states": [
    {
      "input_schema_first_property_const": "pinned",
      "aggregation_key": "single_value_constraint",
      "capability_count": 2,
      "capabilities": ["submit_quote_score", "get_fixed_price"],
      "approved_count": 2,
      "gated_count": 0,
      "has_destructive_side_effect": false,
      "has_restricted_or_confidential_sensitivity": false
    }
  ],
  "warnings": []
}
```

**Const annotation rule** (applied to `input_schema.properties[firstKey].const` when `input_schema.type === "object"`):
- `pinned`: `Object.prototype.hasOwnProperty.call(firstVal, 'const') && firstVal.const !== undefined` — ANY JSON value (including `null`/`false`/`0`/`""`/`[]`/`{}`) is a valid pin
- `unpinned`: `const` key absent OR present with value `=== undefined`
- `not_applicable`: `input_schema.type` is a string but not `'object'`, OR zero-property object
- `unknown`: malformed `input_schema` or `firstVal` not a plain object

**Five frozen warning reason codes** (no axis-specific 6th — `const` accepts ANY JSON value): `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`.

**Exit codes:**
- `0`: Index produced (or empty-capabilities manifest)
- `1`: Missing/invalid manifest, unknown flag, unknown const annotation value, `--out` path error, or unknown subcommand

**Invariants:** `input_schema_first_property_const` is NOT written into the manifest (non-persistence rule). All 40 prior peer index commands remain byte-identical pre/post (`tusq surface plan`, `tusq domain index`, …, `tusq above index`, `tusq below index`, `tusq wire index`).

```
tusq fixed index
tusq fixed index --json
tusq fixed index --fixed pinned --json
tusq fixed index --fixed unpinned --json
tusq fixed index --out fixed-index.json
```

## `tusq mime index`

Emit a deterministic, per-first-input-property-contentMediaType-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].contentMediaType` is a non-empty string (`typed`), absent/null/empty-string (`untyped`), non-applicable (`not_applicable` — non-object input, zero-property object, or firstVal.type is a string other than 'string'), or malformed (`unknown`) in closed-enum order (`typed → untyped → not_applicable → unknown`). This is a **planning aid, not a runtime contentMediaType enforcer, MIME-type validator, content-negotiation tool, format-crossref tool, contentEncoding-crossref tool, type-applicability validator, pattern-crossref tool, LLM-contentMediaType-inferrer, or ingestion-pre-decoder**.

**M71-vs-M70 (wire) distinctness:** `tusq mime index` (M71) reads `input_schema.properties[firstKey].contentMediaType` — the IANA media-type identifier answering "what is the media type of the decoded payload?" (e.g. `application/json`, `text/plain`, `image/png`). `tusq wire index` (M70) reads `input_schema.properties[firstKey].contentEncoding` — the wire-format byte-transfer-encoding scheme answering "how is the byte stream encoded for transmission?" (e.g. `base64`, `quoted-printable`). The two keywords are **sibling but ORTHOGONAL** JSON-Schema Draft 7+ annotations. Joint `contentEncoding + contentMediaType` distribution deferred to `M-Mime-Encoding-Crossref-1`.

**M71-vs-M53 (shape) distinctness:** `tusq mime index` reads `firstKey.contentMediaType` (IANA media-type); `tusq shape index` (M53) reads `output_schema.properties[firstKey].type`. Different schema sides and different keywords.

**M71-vs-M62/M63 distinctness:** `tusq mime index` reads `firstKey.contentMediaType` (IANA annotation); M62 (`tusq format index`) reads `firstKey.format` (JSON-Schema `format` keyword); M63 (`tusq pattern index`) reads `firstKey.pattern`. Three distinct annotation dimensions; none cross-references or subsumes another at this milestone.

**M71-SPECIFIC invariants:**
- **NULL-AS-ABSENT:** `contentMediaType: null` → `untyped` (no warning) — mirrors M55–M70 null-as-absent precedent; null names no media type.
- **EMPTY-STRING-AS-ABSENT:** `contentMediaType: ""` → `untyped` (no warning) — empty string names no media type per RFC 6838.
- **TYPE-APPLICABILITY-STRING:** `firstVal.type` is a string but NOT `"string"` → `not_applicable` (no warning) — `contentMediaType` is only meaningful for string-typed properties (mirrors M62/M63/M70).
- **ANY-NON-EMPTY-STRING-IS-TYPED:** any non-empty string (including non-canonical / non-IANA / non-RFC-6838-form strings) → `typed` (no warning); IANA/RFC-6838-form validation deferred to `M-Mime-Canonical-Set-Validator-1`.
- **DRAFT-7-STRING-IS-VALID-CONTENT-MEDIA-TYPE:** non-string non-null non-absent `contentMediaType` (number/boolean/array/object) → `unknown` WITH 6th warning code `input_schema_properties_first_property_content_media_type_invalid_when_present`; NO-COERCION via `String()`.

**Warning reason codes (six frozen):**
1. `input_schema_field_missing`
2. `input_schema_field_not_object`
3. `input_schema_type_missing_or_invalid`
4. `input_schema_properties_field_missing_when_type_is_object`
5. `input_schema_properties_first_property_descriptor_invalid`
6. `input_schema_properties_first_property_content_media_type_invalid_when_present` _(M71-specific — non-string contentMediaType value)_

**Flags:**

| Flag | Description |
|------|-------------|
| `--mime <value>` | Filter to a single content-media-type bucket (case-sensitive lowercase; closed four-value enum `typed\|untyped\|not_applicable\|unknown`) |
| `--manifest <path>` | Manifest file to read (default: `tusq.manifest.json`) |
| `--out <path>` | Write index to file (no stdout on success; rejects `.tusq/` paths) |
| `--json` | Emit machine-readable JSON (includes `warnings[]` array) |

**Exit codes:**
- `0`: Index produced (or empty-capabilities manifest)
- `1`: Missing/invalid manifest, unknown flag, unknown content-media-type annotation value, `--out` path error, or unknown subcommand

**Invariants:** `input_schema_first_property_content_media_type` is NOT written into the manifest (non-persistence rule). All 41 prior peer index commands remain byte-identical pre/post.

```
tusq mime index
tusq mime index --json
tusq mime index --mime typed --json
tusq mime index --mime untyped --json
tusq mime index --out mime-index.json
```

## `tusq nullable index`

Emit a deterministic, per-first-input-property-nullable-boolean-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].nullable` is `true` (`nullable`), absent/undefined/null/false (`not_nullable`), non-applicable (`not_applicable` — non-object input or zero-property object), or malformed (`unknown`) in closed-enum order (`nullable → not_nullable → not_applicable → unknown`). This is a **planning aid, not a runtime nullable enforcer, database NULL constraint validator, ORM non-nullable field assessor, DTO serialization priority ranker, DB column nullability enforcer, required-crossref tool, default-crossref tool, type-applicability validator, LLM-nullability-inferrer, or DB-column-crossref tool**.

**M72-vs-M58/M60/M61 distinctness:** `tusq nullable index` (M72) reads `firstKey.nullable` (null-value permissibility). `tusq legacy index` (M58) reads `firstKey.deprecated` (lifecycle staleness). `tusq seal index` (M60) reads `firstKey.readOnly` (mutability direction — server-write-only). `tusq secret index` (M61) reads `firstKey.writeOnly` (direction — client-input-only). All four are boolean sibling axes per JSON-Schema Draft 7+/OpenAPI 3.0+, but each names a distinct semantic dimension: deprecated=lifecycle, readOnly=direction-out, writeOnly=direction-in, nullable=null-permissibility.

**M72-vs-M50 distinctness:** `tusq nullable index` (M72) reads `firstKey.nullable` (whether the value MAY be JSON `null`). `tusq obligation index` (M50) reads `firstKey ∈ input_schema.required[]` (whether the property is required). Required-and-nullable is a valid composition orthogonal to optional-and-non-null. The two axes are distinct; cross-referencing deferred to `M-Nullable-Required-Crossref-1`.

**NO-TYPE-APPLICABILITY:** Unlike M62/M63/M70/M71 which restrict applicability to string-typed properties via `TYPE-APPLICABILITY-STRING`, M72 explicitly applies to ALL JSON-Schema types. A `firstVal.type === 'integer'` with `nullable: true` is semantically valid — an integer column that may be NULL in the database. The classifier MUST NOT bucket as `not_applicable` based on `firstVal.type`.

**Classification rules:**

| Bucket | Condition |
|--------|-----------|
| `nullable` | `firstKey.nullable === true` (STRICT-BOOLEAN: must be exactly `true`; NO truthy coercion via `Boolean()/!!`) |
| `not_nullable` | `firstKey.nullable` absent, `undefined`, `null`, or `=== false` (ABSENT-AS-NOT-NULLABLE; NULL-AS-ABSENT; BOOLEAN-FALSE-AS-NOT-NULLABLE) |
| `not_applicable` | `input_schema.type` is a string but not `'object'` OR zero-property object (NO-TYPE-APPLICABILITY: firstVal.type does NOT trigger not_applicable) |
| `unknown` | malformed `input_schema`, `firstKey` not a plain object, or `nullable` present non-null but not a boolean (DRAFT-7-BOOLEAN-IS-VALID-NULLABLE: 6th warning code `input_schema_properties_first_property_nullable_invalid_when_present`; NO-COERCION via `Boolean()/!!`) |

**Flags:**

| Flag | Default | Description |
|------|---------|-------------|
| `--nullable <nullable\|not_nullable\|not_applicable\|unknown>` | all buckets | Filter to single bucket (case-sensitive lowercase) |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file |
| `--out <path>` | stdout | Write JSON to file |
| `--json` | human text | Emit machine-readable JSON |

**Example usage:**

```
tusq nullable index
tusq nullable index --json
tusq nullable index --nullable nullable --json
tusq nullable index --nullable not_nullable --json
tusq nullable index --out nullable-index.json
```

## `tusq wire index`

Emit a deterministic, per-first-input-property-contentEncoding-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].contentEncoding` is a non-empty string (`encoded`), absent/null/empty-string (`unencoded`), non-applicable (`not_applicable` — non-object input, zero-property object, or firstVal.type is a string other than 'string'), or malformed (`unknown`) in closed-enum order (`encoded → unencoded → not_applicable → unknown`). This is a **planning aid, not a runtime content-encoding enforcer, wire-payload decoder, base64-codec generator, mediaType-crossref tool, format-crossref tool, type-applicability validator, pattern-crossref tool, LLM-contentEncoding-inferrer, or ingestion-pre-decoder**.

**M70-SPECIFIC invariants:**
- **NULL-AS-ABSENT:** `contentEncoding: null` → `unencoded` (no warning) — mirrors M55–M68 null-as-absent precedent; null names no transfer-encoding scheme.
- **EMPTY-STRING-AS-ABSENT:** `contentEncoding: ""` → `unencoded` (no warning) — deliberate divergence from M69's FALSY-IS-VALID-CONST; empty string names no transfer-encoding scheme (mirrors M52/M53).
- **TYPE-APPLICABILITY-STRING:** `firstVal.type` is a string but NOT `"string"` → `not_applicable` (no warning) — `contentEncoding` is only meaningful for string-typed properties (mirrors M62/M63).
- **ANY-NON-EMPTY-STRING-IS-ENCODED:** any non-empty string (including non-canonical `"rot13"`, `"gzip"`, `"utf-7"`) → `encoded` (no warning); canonical RFC-2045/RFC-4648 seven-value vocabulary validation deferred to `M-Wire-Canonical-Set-Validator-1`.
- **DRAFT-7-STRING-IS-VALID-CONTENT-ENCODING:** non-string non-null non-absent `contentEncoding` (number/boolean/array/object) → `unknown` WITH 6th warning code `input_schema_properties_first_property_content_encoding_invalid_when_present`; NO-COERCION via `String()`.

**Warning reason codes (six frozen):**
1. `input_schema_field_missing`
2. `input_schema_field_not_object`
3. `input_schema_type_missing_or_invalid`
4. `input_schema_properties_field_missing_when_type_is_object`
5. `input_schema_properties_first_property_descriptor_invalid`
6. `input_schema_properties_first_property_content_encoding_invalid_when_present` _(M70-specific — non-string contentEncoding value)_

**Flags:**

| Flag | Description |
|------|-------------|
| `--wire <value>` | Filter to a single content-encoding bucket (case-sensitive lowercase; closed four-value enum `encoded\|unencoded\|not_applicable\|unknown`) |
| `--manifest <path>` | Manifest file to read (default: `tusq.manifest.json`) |
| `--out <path>` | Write index to file (no stdout on success; rejects `.tusq/` paths) |
| `--json` | Emit machine-readable JSON (includes `warnings[]` array) |

**Exit codes:**
- `0`: Index produced (or empty-capabilities manifest)
- `1`: Missing/invalid manifest, unknown flag, unknown content-encoding annotation value, `--out` path error, or unknown subcommand

**Invariants:** `input_schema_first_property_content_encoding` is NOT written into the manifest (non-persistence rule). All 40 prior peer index commands remain byte-identical pre/post.

```
tusq wire index
tusq wire index --json
tusq wire index --wire encoded --json
tusq wire index --wire unencoded --json
tusq wire index --out wire-index.json
```

## `tusq below index`

Emit a deterministic, per-first-input-property-exclusiveMaximum-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].exclusiveMaximum` is a finite number (`upper_exclusive_bounded`), absent/null/undefined (`upper_exclusive_unbounded`), non-applicable (`not_applicable` — non-object input or zero-property object), or malformed (`unknown`) in closed-enum order (`upper_exclusive_bounded → upper_exclusive_unbounded → not_applicable → unknown`). This is a **planning aid, not a runtime exclusiveMaximum enforcer, doc-contradiction detector, minimum-crossref tool, maximum-crossref tool, above-crossref tool, joint-validity-crossref tool, type-applicability validator, Draft-4-crossref tool, LLM-exclusiveMaximum inferrer, ecosystem-integration-compiler-criticality tier emitter, or statistical aggregator**.

**M68-vs-M67 distinction:** `tusq below index` (M68) reads `input_schema.properties[firstKey].exclusiveMaximum` (the **FIRST input property's** JSON-Schema Draft 6+ `exclusiveMaximum` finite-number keyword — a numeric-**exclusive**-UPPER-bound constraint; `value < exclusiveMaximum`; zero, negative, and fractional values ARE VALID as the bound itself; DRAFT-4-BOOLEAN-IS-INVALID: boolean `true`/`false` → unknown with 6th code). `tusq above index` (M67) reads `input_schema.properties[firstKey].exclusiveMinimum` (the **FIRST input property's** JSON-Schema Draft 6+ `exclusiveMinimum` finite-number keyword — a numeric-**exclusive**-LOWER-bound constraint; `value > exclusiveMinimum`). Opposite directions; neither alters the other's output bytes.

**M68-vs-M66 distinction:** `tusq below index` (M68) reads `firstKey.exclusiveMaximum` (numeric-exclusive-UPPER-bound; `value < exclusiveMaximum`); `tusq upper index` (M66) reads `firstKey.maximum` (numeric-inclusive-UPPER-bound; `value <= maximum`). Same direction, different equality semantics (strict vs. inclusive).

**M68-vs-M65 distinction:** `tusq below index` (M68) reads `firstKey.exclusiveMaximum` (numeric-exclusive-UPPER-bound); `tusq lower index` (M65) reads `firstKey.minimum` (numeric-inclusive-LOWER-bound). Opposite directions and opposite equality semantics.

```
tusq below index [--below <upper_exclusive_bounded|upper_exclusive_unbounded|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--below <value>` | Filter to a single exclusiveMaximum annotation bucket (case-sensitive lowercase, default: all buckets) |
| `--manifest <path>` | Manifest file to read (default: `tusq.manifest.json`) |
| `--out <path>` | Write index to file (rejects paths inside `.tusq/`) |
| `--json` | Emit machine-readable JSON |

**Bucket rules:**

- `upper_exclusive_bounded` — `typeof firstKey.exclusiveMaximum === 'number' && Number.isFinite(firstKey.exclusiveMaximum)` (STRICT: NO coercion; ZERO-IS-VALID: 0→upper_exclusive_bounded; NEGATIVE-IS-VALID: -273.15→upper_exclusive_bounded; FRACTIONAL-IS-VALID: 0.5→upper_exclusive_bounded; DRAFT-4-BOOLEAN-IS-INVALID: true/false→unknown)
- `upper_exclusive_unbounded` — `firstKey.exclusiveMaximum` absent, undefined, or null (null-as-absent per M55–M67 precedent — no warning)
- `not_applicable` — `input_schema.type` is a string but not `'object'`, OR zero-property object
- `unknown` — malformed `input_schema`, `firstKey` not a plain object, or `exclusiveMaximum` present non-null but not a finite number (NaN, Infinity, -Infinity, string `'0'`, boolean `true`/`false`, array `[0]`, plain object `{}`)

**Exit codes:** `0` = index produced; `1` = missing/invalid manifest, unknown flag, unknown exclusiveMaximum state, `--out` path error, or unknown subcommand

**Examples:**

```
tusq below index
tusq below index --json
tusq below index --below upper_exclusive_bounded --json
tusq below index --below upper_exclusive_unbounded --json
tusq below index --out below-index.json
```

## `tusq above index`

Emit a deterministic, per-first-input-property-exclusiveMinimum-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].exclusiveMinimum` is a finite number (`lower_exclusive_bounded`), absent/null/undefined (`lower_exclusive_unbounded`), non-applicable (`not_applicable` — non-object input or zero-property object), or malformed (`unknown`) in closed-enum order (`lower_exclusive_bounded → lower_exclusive_unbounded → not_applicable → unknown`). This is a **planning aid, not a runtime exclusiveMinimum enforcer, doc-contradiction detector, minimum-crossref tool, maximum-crossref tool, below-crossref tool, joint-validity-crossref tool, type-applicability validator, Draft-4-crossref tool, LLM-exclusiveMinimum inferrer, ecosystem-integration-compiler-criticality tier emitter, or statistical aggregator**.

**M67-vs-M65 distinction:** `tusq above index` (M67) reads `input_schema.properties[firstKey].exclusiveMinimum` (the **FIRST input property's** JSON-Schema Draft 6+ `exclusiveMinimum` finite-number keyword — a numeric-**exclusive**-LOWER-bound constraint; `value > exclusiveMinimum`; zero, negative, and fractional values ARE VALID as the bound itself; DRAFT-4-BOOLEAN-IS-INVALID: boolean `true`/`false` → unknown with 6th code). `tusq lower index` (M65) reads `input_schema.properties[firstKey].minimum` (the **FIRST input property's** JSON-Schema `minimum` finite-number keyword — a numeric-**inclusive**-LOWER-bound constraint; `value >= minimum`). The equality boundary semantics differ: M67's `exclusiveMinimum:5` means `value > 5`; M65's `minimum:5` means `value >= 5`. These two commands read orthogonal JSON-Schema validation keywords under two distinct nouns; neither alters the other's output bytes.

**M67-vs-M66 distinction:** `tusq above index` (M67) reads `firstKey.exclusiveMinimum` (numeric-exclusive-LOWER-bound); `tusq upper index` (M66) reads `firstKey.maximum` (numeric-inclusive-UPPER-bound). Opposite directions and opposite equality semantics.

**M67-vs-M64 distinction:** `tusq divisor index` (M64) reads `firstKey.multipleOf` (strictly-positive-finite-number numeric-divisibility; zero is INVALID per JSON-Schema). `tusq above index` (M67) reads `firstKey.exclusiveMinimum` (finite-number numeric-exclusive-lower-bound; zero IS VALID as the bound). These read orthogonal JSON-Schema validation keywords; neither alters the other's output bytes.

```
tusq above index [--above <lower_exclusive_bounded|lower_exclusive_unbounded|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--above <value>` | Filter to a single exclusiveMinimum annotation bucket (case-sensitive lowercase, default: all buckets) |
| `--manifest <path>` | Manifest file to read (default: `tusq.manifest.json`) |
| `--out <path>` | Write index to file (rejects paths inside `.tusq/`) |
| `--json` | Emit machine-readable JSON |

**Bucket rules:**

- `lower_exclusive_bounded` — `typeof firstKey.exclusiveMinimum === 'number' && Number.isFinite(firstKey.exclusiveMinimum)` (STRICT: NO coercion; ZERO-IS-VALID: 0→lower_exclusive_bounded; NEGATIVE-IS-VALID: -273.15→lower_exclusive_bounded; FRACTIONAL-IS-VALID: 0.5→lower_exclusive_bounded; DRAFT-4-BOOLEAN-IS-INVALID: true/false→unknown)
- `lower_exclusive_unbounded` — `firstKey.exclusiveMinimum` absent, undefined, or null (null-as-absent per M55–M66 precedent — no warning)
- `not_applicable` — `input_schema.type` is a string but not `'object'`, OR zero-property object
- `unknown` — malformed `input_schema`, `firstKey` not a plain object, or `exclusiveMinimum` present non-null but not a finite number (NaN, Infinity, -Infinity, string `'0'`, boolean `true`/`false`, array `[0]`, plain object `{}`)

**Exit codes:** `0` = index produced; `1` = missing/invalid manifest, unknown flag, unknown exclusiveMinimum state, `--out` path error, or unknown subcommand

**Examples:**

```
tusq above index
tusq above index --json
tusq above index --above lower_exclusive_bounded --json
tusq above index --above lower_exclusive_unbounded --json
tusq above index --out above-index.json
```

## `tusq upper index`

Emit a deterministic, per-first-input-property-maximum-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].maximum` is a finite number (`upper_bounded`), absent/null/undefined (`upper_unbounded`), non-applicable (`not_applicable` — non-object input or zero-property object), or malformed (`unknown`) in closed-enum order (`upper_bounded → upper_unbounded → not_applicable → unknown`). This is a **planning aid, not a runtime maximum enforcer, doc-contradiction detector, minimum-crossref tool, exclusiveMaximum-crossref tool, joint-validity-crossref tool, type-applicability validator, LLM-maximum inferrer, data-intelligence-compiler-criticality tier emitter, or statistical aggregator**.

**M66-vs-M65 distinction:** `tusq lower index` (M65) reads `input_schema.properties[firstKey].minimum` (the **FIRST input property's** JSON-Schema `minimum` finite-number keyword — a numeric-inclusive-LOWER-bound constraint; zero, negative, and fractional values ARE VALID). `tusq upper index` (M66) reads `input_schema.properties[firstKey].maximum` (the **FIRST input property's** JSON-Schema `maximum` finite-number keyword — a numeric-inclusive-UPPER-bound constraint; zero, negative, and fractional values ARE VALID). These two commands read orthogonal JSON-Schema validation keywords under two distinct nouns; neither alters the other's output bytes.

**M66-vs-M64 distinction:** `tusq divisor index` (M64) reads `input_schema.properties[firstKey].multipleOf` (the **FIRST input property's** JSON-Schema `multipleOf` strictly-positive-finite-number keyword — a numeric-divisibility constraint; zero is INVALID per JSON-Schema). `tusq upper index` (M66) reads `input_schema.properties[firstKey].maximum` (a finite-number numeric-inclusive-upper-bound constraint; zero IS VALID, negative numbers ARE VALID, fractional numbers ARE VALID). These read orthogonal JSON-Schema validation keywords; neither alters the other's output bytes.

**M66-specific classifier rules:**
- **ZERO-IS-VALID-UPPER-BOUND** (M66-SPECIFIC): `maximum: 0` → `upper_bounded` (no warning). JSON-Schema permits zero as a perfectly valid numeric-inclusive-upper-bound (e.g., `value <= 0` for non-positive deltas). Mirrors M65 ZERO-IS-VALID-LOWER-BOUND.
- **NEGATIVE-IS-VALID-UPPER-BOUND** (M66-SPECIFIC): `maximum: -273.15` → `upper_bounded` (no warning). JSON-Schema permits arbitrary negative finite-number upper bounds (e.g., `-273.15` for Celsius temperature upper bounds in cryogenic contexts).
- **FRACTIONAL-IS-VALID-UPPER-BOUND** (M66-SPECIFIC): `maximum: 0.5` → `upper_bounded` (no warning). The classifier uses `typeof v === 'number' && Number.isFinite(v)` — NOT `Number.isInteger(v) && v >= 0` as in M62/M63, and NOT `Number.isFinite(v) && v > 0` as in M64.

```bash
tusq upper index [--upper <upper_bounded|upper_unbounded|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--upper <upper_bounded\|upper_unbounded\|not_applicable\|unknown>` | all buckets | Filter to a single maximum annotation bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed `input_schema` or invalid first-property descriptor) |

**Classifier rule** (applied to `input_schema.properties[firstKey].maximum` when `input_schema.type === "object"`):

| Outcome | Condition |
|---------|-----------|
| `upper_bounded` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `typeof properties[firstKey].maximum === 'number' && Number.isFinite(properties[firstKey].maximum)` (STRICT: NO Number()/parseFloat()/truthy coercion; NOT >= 0, NOT > 0, NOT Number.isInteger; ZERO-IS-VALID-UPPER-BOUND: `maximum === 0` → `upper_bounded`; NEGATIVE-IS-VALID-UPPER-BOUND: `maximum === -273.15` → `upper_bounded`; FRACTIONAL-IS-VALID-UPPER-BOUND: `maximum === 0.5` → `upper_bounded`) |
| `upper_unbounded` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].maximum` is absent, `undefined`, or `null` (null-as-absent per M55–M65 precedent — no warning) |
| `not_applicable` | `input_schema.type` is a string but not `"object"` (non-object input has no first property) OR `input_schema.type === "object"` and `Object.keys(properties).length === 0` |
| `unknown` | `input_schema` missing/null/not-a-plain-object; `input_schema.type` missing or non-string; `input_schema.type === "object"` but `properties` missing/null/not-a-plain-object; `properties[firstKey]` not a plain object; OR `properties[firstKey].maximum` present non-null but NOT a finite number (NaN, Infinity, −Infinity, string `'0'`, boolean `true`, array `[0]`, plain object `{}`) |

**Bucket iteration order:** `upper_bounded → upper_unbounded → not_applicable → unknown` (deterministic stable-output convention — NOT data-intelligence-compiler-criticality-ranked, NOT semantic-layer-priority-ranked, NOT metric-catalog-completeness-tier-ranked, NOT safe-SQL-tool-strictness-ranked, NOT dashboard-Q&A-coverage-ranked, NOT anomaly-explanation-priority-ranked, NOT data-governance-artifact-deprecation-priority-ranked, NOT dashboard-fallback-guidance-strength-ranked).

**Six frozen warning reason codes** (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`, `input_schema_properties_first_property_maximum_invalid_when_present`). The sixth code covers ALL non-finite-number `maximum` malformations under a single consolidated code.

**Exit codes:**

| Code | Condition |
|------|-----------|
| `0` | Index produced (or empty-capabilities manifest) |
| `1` | Missing/invalid manifest, unknown flag, unknown `--upper` value, `--upper` value with absent bucket, `--out` path error, or unknown subcommand |

**Examples:**

```bash
# Human-readable output
tusq upper index

# JSON output
tusq upper index --json

# Filter to upper_bounded bucket
tusq upper index --upper upper_bounded --json

# Filter to upper_unbounded bucket
tusq upper index --upper upper_unbounded --json

# Write to file
tusq upper index --out upper-index.json
```

## `tusq lower index`

Emit a deterministic, per-first-input-property-minimum-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].minimum` is a finite number (`lower_bounded`), absent/null/undefined (`lower_unbounded`), non-applicable (`not_applicable` — non-object input or zero-property object), or malformed (`unknown`) in closed-enum order (`lower_bounded → lower_unbounded → not_applicable → unknown`). This is a **planning aid, not a runtime minimum enforcer, doc-contradiction detector, maximum-crossref tool, exclusiveMinimum-crossref tool, joint-validity-crossref tool, type-applicability validator, LLM-minimum inferrer, knowledge-and-copilot-compiler-criticality tier emitter, or statistical aggregator**.

**M65-vs-M64 distinction:** `tusq divisor index` (M64) reads `input_schema.properties[firstKey].multipleOf` (the **FIRST input property's** JSON-Schema `multipleOf` strictly-positive-finite-number keyword — a numeric-divisibility constraint; zero is INVALID per JSON-Schema). `tusq lower index` (M65) reads `input_schema.properties[firstKey].minimum` (the **FIRST input property's** JSON-Schema `minimum` finite-number keyword — a numeric-inclusive-lower-bound constraint; zero IS VALID, negative numbers ARE VALID, fractional numbers ARE VALID). These two commands read orthogonal JSON-Schema validation keywords under two distinct nouns; neither alters the other's output bytes.

**M65-vs-M62 distinction:** `tusq floor index` (M62) reads `input_schema.properties[firstKey].minLength` (the **FIRST input property's** JSON-Schema `minLength` non-negative-integer keyword — a string-length LOWER-bound constraint; applicable to strings; negative values and fractional values are INVALID). `tusq lower index` (M65) reads `input_schema.properties[firstKey].minimum` (a finite-number numeric-inclusive-lower-bound constraint; applicable to numeric types; negative finite values and zero ARE VALID). These read orthogonal JSON-Schema validation keywords; neither alters the other's output bytes.

**M65-specific divergences from M62/M63/M64:**
- **ZERO-IS-VALID-LOWER-BOUND** (M65-SPECIFIC): `minimum: 0` → `lower_bounded` (no warning). JSON-Schema permits zero as a perfectly valid numeric-inclusive-lower-bound (e.g., `quantity >= 0` for non-negative inventory counts). This diverges from M64 EXPLICIT-ZERO-IS-INVALID (`multipleOf: 0` → `unknown`).
- **NEGATIVE-IS-VALID-LOWER-BOUND** (M65-SPECIFIC): `minimum: -273.15` → `lower_bounded` (no warning). JSON-Schema permits arbitrary negative finite-number lower bounds (e.g., `-273.15` for Celsius temperature lower bounds). This diverges from M62/M63 (which require `>= 0`) and M64 (which requires `> 0`).
- **FRACTIONAL-IS-VALID-LOWER-BOUND** (M65-SPECIFIC): `minimum: 0.5` → `lower_bounded` (no warning). The classifier uses `typeof v === 'number' && Number.isFinite(v)` — NOT `Number.isInteger(v) && v >= 0` as in M62/M63, and NOT `Number.isFinite(v) && v > 0` as in M64.

```bash
tusq lower index [--lower <lower_bounded|lower_unbounded|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--lower <lower_bounded\|lower_unbounded\|not_applicable\|unknown>` | all buckets | Filter to a single minimum annotation bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed `input_schema` or invalid first-property descriptor) |

**Classifier rule** (applied to `input_schema.properties[firstKey].minimum` when `input_schema.type === "object"`):

| Outcome | Condition |
|---------|-----------|
| `lower_bounded` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `typeof properties[firstKey].minimum === 'number' && Number.isFinite(properties[firstKey].minimum)` (STRICT: NO Number()/parseFloat()/truthy coercion; NOT >= 0, NOT > 0, NOT Number.isInteger; ZERO-IS-VALID-LOWER-BOUND: `minimum === 0` → `lower_bounded`; NEGATIVE-IS-VALID-LOWER-BOUND: `minimum === -273.15` → `lower_bounded`; FRACTIONAL-IS-VALID-LOWER-BOUND: `minimum === 0.5` → `lower_bounded`) |
| `lower_unbounded` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].minimum` is absent, `undefined`, or `null` (null-as-absent per M55–M64 precedent — no warning) |
| `not_applicable` | `input_schema.type` is a string but not `"object"` (non-object input has no first property) OR `input_schema.type === "object"` and `Object.keys(properties).length === 0` |
| `unknown` | `input_schema` missing/null/not-a-plain-object; `input_schema.type` missing or non-string; `input_schema.type === "object"` but `properties` missing/null/not-a-plain-object; `properties[firstKey]` not a plain object; OR `properties[firstKey].minimum` present non-null but NOT a finite number (NaN, Infinity, −Infinity, string `'0'`, boolean `true`, array `[0]`, plain object `{}`) |

**Bucket iteration order:** `lower_bounded → lower_unbounded → not_applicable → unknown` (deterministic stable-output convention — NOT knowledge-and-copilot-compiler-criticality-ranked, NOT RAG-index-priority-ranked, NOT Q&A-pack-completeness-tier-ranked, NOT troubleshooting-tree-branching-priority-ranked, NOT employee-copilot-pre-validation-strictness-ranked, NOT customer-facing-help-content-coverage-ranked, NOT help-content-deprecation-priority-ranked, NOT copilot-fallback-guidance-strength-ranked).

**Six frozen warning reason codes** (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`, `input_schema_properties_first_property_minimum_invalid_when_present`). The sixth code covers ALL non-finite-number `minimum` malformations under a single consolidated code.

**Exit codes:**

| Code | Condition |
|------|-----------|
| `0` | Index produced (or empty-capabilities manifest) |
| `1` | Missing/invalid manifest, unknown flag, unknown `--lower` value, `--lower` value with absent bucket, `--out` path error, or unknown subcommand |

**Examples:**

```bash
# Human-readable output
tusq lower index

# JSON output
tusq lower index --json

# Filter to lower_bounded bucket
tusq lower index --lower lower_bounded --json

# Filter to lower_unbounded bucket
tusq lower index --lower lower_unbounded --json

# Write to file
tusq lower index --out lower-index.json
```

## `tusq divisor index`

Emit a deterministic, per-first-input-property-multipleOf-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].multipleOf` is a strictly-positive finite number (`multiple_constrained`), absent/null/undefined (`multiple_unconstrained`), non-applicable (`not_applicable` — non-object input or zero-property object), or malformed (`unknown`) in closed-enum order (`multiple_constrained → multiple_unconstrained → not_applicable → unknown`). This is a **planning aid, not a runtime multipleOf enforcer, doc-contradiction detector, minimum-crossref tool, maximum-crossref tool, joint-validity-crossref tool, type-applicability validator, LLM-multipleOf inferrer, governance-and-rollout-criticality tier emitter, or statistical aggregator**.

**M64-vs-M63 distinction:** `tusq ceiling index` (M63) reads `input_schema.properties[firstKey].maxLength` (the **FIRST input property's** JSON-Schema `maxLength` non-negative-integer keyword — a numeric-bound string-length UPPER-bound constraint; integer-only non-negative values). `tusq divisor index` (M64) reads `input_schema.properties[firstKey].multipleOf` (the **FIRST input property's** JSON-Schema `multipleOf` strictly-positive-finite-number keyword — a numeric-divisibility validation constraint; fractional positive values such as `0.5` are VALID). These two commands read orthogonal JSON-Schema validation keywords under two distinct nouns; neither alters the other's output bytes.

**M64-vs-M62 distinction:** `tusq floor index` (M62) reads `input_schema.properties[firstKey].minLength` (the **FIRST input property's** JSON-Schema `minLength` non-negative-integer keyword — a numeric-bound string-length LOWER-bound constraint; applicable to strings; integer-only). `tusq divisor index` (M64) reads `input_schema.properties[firstKey].multipleOf` (a strictly-positive-finite-number numeric-divisibility constraint; applicable to numeric types; fractional divisors valid). These read orthogonal JSON-Schema validation keywords; neither alters the other's output bytes.

**M64-specific divergences from M62/M63:**
- **EXPLICIT-ZERO-IS-INVALID**: `multipleOf: 0` → `unknown` WITH 6th warning code (NOT `multiple_constrained`). JSON-Schema strictly rejects `multipleOf: 0` because every number is trivially divisible by zero (degenerate). This is a deliberate divergence from M62 EXPLICIT-ZERO-IS-FLOORED (`minLength: 0` → `length_floored`) and M63 EXPLICIT-ZERO-IS-CAPPED (`maxLength: 0` → `length_capped`).
- **FRACTIONAL-DIVISORS-ARE-VALID**: `multipleOf: 0.5` → `multiple_constrained` (no warning). JSON-Schema's `multipleOf` permits fractional positive divisors for sub-unit quantization. The classifier uses `typeof v === 'number' && Number.isFinite(v) && v > 0` — NOT `Number.isInteger(v) && v >= 0` as in M62/M63.

```bash
tusq divisor index [--divisor <multiple_constrained|multiple_unconstrained|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--divisor <multiple_constrained\|multiple_unconstrained\|not_applicable\|unknown>` | all buckets | Filter to a single multipleOf annotation bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed `input_schema` or invalid first-property descriptor) |

**Classifier rule** (applied to `input_schema.properties[firstKey].multipleOf` when `input_schema.type === "object"`):

| Outcome | Condition |
|---------|-----------|
| `multiple_constrained` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `typeof properties[firstKey].multipleOf === 'number' && Number.isFinite(properties[firstKey].multipleOf) && properties[firstKey].multipleOf > 0` (STRICT: NO Number()/parseFloat()/truthy coercion; FRACTIONAL-DIVISORS-ARE-VALID: `multipleOf === 0.5` → `multiple_constrained`; EXPLICIT-ZERO-IS-INVALID: `multipleOf === 0` → `unknown`) |
| `multiple_unconstrained` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].multipleOf` is absent, `undefined`, or `null` (null-as-absent per M55–M63 precedent — no warning) |
| `not_applicable` | `input_schema.type` is a string but not `"object"` (non-object input has no first property) OR `input_schema.type === "object"` and `Object.keys(properties).length === 0` |
| `unknown` | `input_schema` missing/null/not-a-plain-object; `input_schema.type` missing or non-string; `input_schema.type === "object"` but `properties` missing/null/not-a-plain-object; `properties[firstKey]` not a plain object; OR `properties[firstKey].multipleOf` present non-null but NOT strictly-positive-finite (zero `0`, negative `−1`, fractional negative `−0.5`, NaN, Infinity, −Infinity, string `'5'`, boolean `true`, array `[5]`, plain object `{}`) |

**Bucket iteration order:** `multiple_constrained → multiple_unconstrained → not_applicable → unknown` (deterministic stable-output convention — NOT governance-and-rollout-criticality-ranked, NOT approval-gate-priority-ranked, NOT audit-log-completeness-tier-ranked, NOT kill-switch-target-priority-ranked, NOT review-queue-prioritization-ranked, NOT staged-rollout-stage-eligibility-ranked, NOT operator-documentation-completeness-ranked, NOT fallback-guidance-strength-ranked).

**Six frozen warning reason codes** (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`, `input_schema_properties_first_property_multiple_of_invalid_when_present`). The sixth code covers ALL non-strictly-positive-finite `multipleOf` malformations under a single consolidated code, including zero (EXPLICIT-ZERO-IS-INVALID).

**Exit codes:**

| Code | Condition |
|------|-----------|
| `0` | Index produced (or empty-capabilities manifest) |
| `1` | Missing/invalid manifest, unknown flag, unknown `--divisor` value, `--divisor` value with absent bucket, `--out` path error, or unknown subcommand |

**Examples:**

```bash
# Human-readable output
tusq divisor index

# JSON output
tusq divisor index --json

# Filter to multiple_constrained bucket
tusq divisor index --divisor multiple_constrained --json

# Filter to multiple_unconstrained bucket
tusq divisor index --divisor multiple_unconstrained --json

# Write to file
tusq divisor index --out divisor-index.json
```

## `tusq ceiling index`

Emit a deterministic, per-first-input-property-maxLength-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].maxLength` is a non-negative integer (`length_capped`), absent/null/undefined (`length_uncapped`), non-applicable (`not_applicable` — non-object input or zero-property object), or malformed (`unknown`) in closed-enum order (`length_capped → length_uncapped → not_applicable → unknown`). This is a **planning aid, not a runtime maxLength enforcer, doc-contradiction detector, minLength-crossref tool, pattern-crossref tool, format-crossref tool, type-applicability validator, LLM-maxLength inferrer, evals-and-regression coverage ranker, or statistical aggregator**.

**M63-vs-M62 distinction:** `tusq floor index` (M62) reads `input_schema.properties[firstKey].minLength` (the **FIRST input property's** JSON-Schema `minLength` non-negative-integer keyword — a numeric-bound string-length LOWER-bound constraint). `tusq ceiling index` (M63) reads `input_schema.properties[firstKey].maxLength` (the **FIRST input property's** JSON-Schema `maxLength` non-negative-integer keyword — a numeric-bound string-length UPPER-bound constraint). These two commands read orthogonal JSON-Schema string-length-bound keywords under two distinct nouns; neither alters the other's output bytes. An operator may set both (a length-bounded range), either, or neither on the same property.

**M63-vs-M59 distinction:** `tusq regex index` (M59) reads `input_schema.properties[firstKey].pattern` (a shape-bound regex string — JSON-Schema Draft 4+ string-shape validation keyword). `tusq ceiling index` (M63) reads `input_schema.properties[firstKey].maxLength` (a numeric integer ceiling — JSON-Schema Draft 4+ numeric-bound validation keyword). These read orthogonal JSON-Schema string-validation keywords under two distinct nouns; neither alters the other's output bytes.

```bash
tusq ceiling index [--ceiling <length_capped|length_uncapped|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--ceiling <length_capped\|length_uncapped\|not_applicable\|unknown>` | all buckets | Filter to a single maxLength annotation bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed `input_schema` or invalid first-property descriptor) |

**Classifier rule** (applied to `input_schema.properties[firstKey].maxLength` when `input_schema.type === "object"`):

| Outcome | Condition |
|---------|-----------|
| `length_capped` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `Number.isInteger(properties[firstKey].maxLength) && properties[firstKey].maxLength >= 0` (STRICT-NUMERIC: must be a non-negative integer, NO Number()/parseInt()/truthy coercion; EXPLICIT-ZERO-IS-CAPPED: `maxLength === 0` → `length_capped` — mirrors M58/M60/M61/M62 explicit-default-value precedent) |
| `length_uncapped` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].maxLength` is absent, `undefined`, or `null` (null-as-absent per M55/M56/M57/M58/M59/M60/M61/M62 precedent — no warning) |
| `not_applicable` | `input_schema.type` is a string but not `"object"` (non-object input has no first property) OR `input_schema.type === "object"` and `Object.keys(properties).length === 0` |
| `unknown` | `input_schema` missing/null/not-a-plain-object; `input_schema.type` missing or non-string; `input_schema.type === "object"` but `properties` missing/null/not-a-plain-object; `properties[firstKey]` not a plain object; OR `properties[firstKey].maxLength` present non-null but NOT a non-negative integer (negative integer `−1`, fractional `1.5`, NaN, Infinity, −Infinity, string `'100'`, boolean `true`, array `[1]`, plain object `{}`) |

**Bucket iteration order:** `length_capped → length_uncapped → not_applicable → unknown` (deterministic stable-output convention — NOT evals-and-regression-coverage-ranked, NOT schema-drift-severity-ranked, NOT permission-regression-priority-ranked, NOT marketplace-package-validation-strictness-tier-ranked, NOT UI-surface-smoke-test-criticality-ranked, NOT workflow-test-priority-ranked, NOT injection-payload-rejection-priority-ranked, NOT tool-input-truncation-priority-ranked).

**Six frozen warning reason codes** (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`, `input_schema_properties_first_property_max_length_invalid_when_present`). The sixth code covers ALL non-non-negative-integer `maxLength` malformations under a single consolidated code.

**Exit codes:**

| Code | Condition |
|------|-----------|
| `0` | Index produced (or empty-capabilities manifest) |
| `1` | Missing/invalid manifest, unknown flag, unknown `--ceiling` value, `--ceiling` value with absent bucket, `--out` path error, or unknown subcommand |

**Examples:**

```bash
# Human-readable output
tusq ceiling index

# JSON output
tusq ceiling index --json

# Filter to length_capped bucket
tusq ceiling index --ceiling length_capped --json

# Filter to length_uncapped bucket
tusq ceiling index --ceiling length_uncapped --json

# Write to file
tusq ceiling index --out ceiling-index.json
```

## `tusq floor index`

Emit a deterministic, per-first-input-property-minLength-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].minLength` is a non-negative integer (`length_floored`), absent/null/undefined (`length_unfloored`), non-applicable (`not_applicable` — non-object input or zero-property object), or malformed (`unknown`) in closed-enum order (`length_floored → length_unfloored → not_applicable → unknown`). This is a **planning aid, not a runtime minLength enforcer, doc-contradiction detector, maxLength-crossref tool, pattern-crossref tool, format-crossref tool, type-applicability validator, LLM-minLength inferrer, tool-and-skill-compiler strictness tier emitter, or statistical aggregator**.

**M62-vs-M59 distinction:** `tusq regex index` (M59) reads `input_schema.properties[firstKey].pattern` (the **FIRST input property's** JSON-Schema `pattern` regex string — a shape-bound input-validation constraint). `tusq floor index` (M62) reads `input_schema.properties[firstKey].minLength` (the **FIRST input property's** JSON-Schema `minLength` non-negative-integer keyword — a numeric-bound string-length lower-bound constraint). These two commands read orthogonal JSON-Schema string-validation keywords under two distinct nouns; neither alters the other's output bytes. An operator may set both, either, or neither on the same property.

**M62-vs-M53 distinction:** `tusq hint index` (M53) reads `input_schema.properties[firstKey].format` (a closed-vocabulary semantic hint such as `email`/`uri`/`date-time`). `tusq floor index` (M62) reads `input_schema.properties[firstKey].minLength` (a numeric integer floor). These read orthogonal JSON-Schema string-annotation keywords — orthogonal JSON-Schema string-annotation keywords, read-only-invariant peers.

```bash
tusq floor index [--floor <length_floored|length_unfloored|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--floor <length_floored\|length_unfloored\|not_applicable\|unknown>` | all buckets | Filter to a single minLength annotation bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed `input_schema` or invalid first-property descriptor) |

**Classifier rule** (applied to `input_schema.properties[firstKey].minLength` when `input_schema.type === "object"`):

| Outcome | Condition |
|---------|-----------|
| `length_floored` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `Number.isInteger(properties[firstKey].minLength) && properties[firstKey].minLength >= 0` (STRICT-NUMERIC: must be a non-negative integer, NO Number()/parseInt()/truthy coercion; EXPLICIT-ZERO-IS-FLOORED: `minLength === 0` → `length_floored` — mirrors M58/M60/M61 explicit-default-value precedent) |
| `length_unfloored` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].minLength` is absent, `undefined`, or `null` (null-as-absent per M55/M56/M57/M58/M59/M60/M61 precedent — no warning) |
| `not_applicable` | `input_schema.type` is a string but not `"object"` (non-object input has no first property) OR `input_schema.type === "object"` and `Object.keys(properties).length === 0` |
| `unknown` | `input_schema` missing/null/not-a-plain-object; `input_schema.type` missing or non-string; `input_schema.type === "object"` but `properties` missing/null/not-a-plain-object; `properties[firstKey]` not a plain object; OR `properties[firstKey].minLength` present non-null but NOT a non-negative integer (negative integer `−1`, fractional `1.5`, NaN, Infinity, −Infinity, string `'1'`, boolean `true`, array `[1]`, plain object `{}`) |

**Bucket iteration order:** `length_floored → length_unfloored → not_applicable → unknown` (deterministic stable-output convention — NOT tool-and-skill-compiler-strictness-ranked, NOT strict-tool-input-validation-strength-ranked, NOT chat-prompt-input-rejection-priority-ranked, NOT marketplace-package-strictness-tier-ranked, NOT MCP-tool-validation-tier-ranked, NOT empty-string-rejection-priority-ranked, NOT injection-attack-mitigation-priority-ranked, NOT domain-skill-pack-input-strictness-ranked).

**Six frozen warning reason codes** (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`, `input_schema_properties_first_property_min_length_invalid_when_present`). The sixth code covers ALL non-non-negative-integer `minLength` malformations under a single consolidated code.

**Exit codes:**

| Code | Condition |
|------|-----------|
| `0` | Index produced (or empty-capabilities manifest) |
| `1` | Missing/invalid manifest, unknown flag, unknown `--floor` value, `--floor` value with absent bucket, `--out` path error, or unknown subcommand |

**Examples:**

```bash
# Human-readable output
tusq floor index

# JSON output
tusq floor index --json

# Filter to length_floored bucket
tusq floor index --floor length_floored --json

# Filter to length_unfloored bucket
tusq floor index --floor length_unfloored --json

# Write to file
tusq floor index --out floor-index.json
```

## `tusq gloss index`

Emit a deterministic, per-first-input-property-description-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].description` is a non-empty trimmed string (`described`), missing/null/empty/whitespace-only (`undescribed`), non-applicable (`not_applicable` — non-object input or zero-property object), or malformed (`unknown`) in closed-enum order (`described → undescribed → not_applicable → unknown`). This is a **planning aid, not a runtime documentation validator, doc-contradiction detector, quality scorer, LLM synthesizer, or SDK help-text generator**.

**M52 vs M44 distinction:** `tusq description index` (M44) reads `capability.description` (the **capability-level** top-level description string) and buckets on its word count. `tusq gloss index` (M52) reads `input_schema.properties[firstKey].description` (the **FIRST input property's** docstring) and buckets on its presence. These two axes share the `description`-noun family but operate on entirely different fields.

```bash
tusq gloss index [--presence <value>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--presence <described\|undescribed\|not_applicable\|unknown>` | all presences | Filter to a single description-presence bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success; rejected if path is inside `.tusq/` |
| `--json` | human text | Emit machine-readable JSON |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown/absent presence value, `--out` path error, or unknown subcommand

**Classifier rules** (applied to `input_schema.properties[firstKey].description` when `input_schema.type === "object"`):

| Condition | Bucket |
|-----------|--------|
| `input_schema` missing/null/not-a-plain-object | `unknown` |
| `input_schema.type` missing or non-string | `unknown` |
| `input_schema.type` is a string but not `"object"` | `not_applicable` (no warning) |
| `input_schema.type === "object"`, `properties` missing/null/not-a-plain-object | `unknown` |
| `input_schema.type === "object"`, `Object.keys(properties).length === 0` | `not_applicable` (no warning) |
| `properties[firstKey]` is not a plain non-null object | `unknown` |
| `properties[firstKey].description` is present but `typeof !== "string"` (array/object/number/boolean) | `unknown` (strict-typing rule — malformed) |
| `properties[firstKey].description` is missing/`null`/`undefined` OR is a string with `trim().length === 0` | `undescribed` (no warning — documentation-completeness signal, not malformation) |
| `properties[firstKey].description` is a string with `trim().length > 0` | `described` (no warning) |

Object.keys insertion-order is used; key sequence is NOT sorted or reordered.

**Bucket iteration order:** `described → undescribed → not_applicable → unknown` (conventional "documented-first, undocumented-second, irrelevant-third, malformed-last" reading order — NOT documentation-completeness-ranked, NOT reviewer-priority-ranked, NOT maintenance-debt-ranked, NOT public-docs-gap-ranked, NOT launch-readiness-ranked, NOT copilot-composition-readiness-ranked, NOT onboarding-clarity-ranked). Empty buckets do not appear.

**`warnings[]` array:** Present in `--json` output always (even when empty). Contains `{ capability, reason }` objects for each capability landing in the `unknown` bucket. Five frozen warning reason codes: `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_description_invalid_when_present`. The `not_applicable`, `described`, and `undescribed` buckets emit NO warnings — they are valid named outcomes. In human mode, warnings are emitted to stderr.

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- `input_schema_first_property_description_presence` is NOT written into the manifest — it is derived at read-time only (non-persistence rule).
- The four-value `input_schema_first_property_description_presence` enum, the three-value `aggregation_key` enum, and the five-value warning reason-code enum are frozen; any addition is a material governance event.
- Per-property description beyond the FIRST is NOT walked (reserved for `M-Gloss-All-Properties-Description-Presence-Index-1`).
- Nested-property description under `input_schema.properties[key].properties` is NOT walked (reserved for `M-Gloss-Nested-Property-Description-Presence-Index-1`).
- `output_schema` first-property description is NOT classified (reserved for `M-Gloss-Output-First-Property-Description-Presence-Index-1`).
- `tusq gloss index` does NOT call any LLM, synthesize text, score quality, count words per first-property description, or detect description language.

```bash
# All presence buckets (human-readable)
tusq gloss index

# All presence buckets (JSON)
tusq gloss index --json

# Single presence bucket
tusq gloss index --presence described --json

# Undescribed capabilities (documentation gap)
tusq gloss index --presence undescribed --json

# Write to file
tusq gloss index --out gloss-index.json
```

## `tusq hint index`

Emit a deterministic, per-first-input-property-format-hint-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].format` is a non-empty trimmed string (`hinted`), missing/null/empty/whitespace-only (`unhinted`), non-applicable (`not_applicable` — non-object input or zero-property object), or malformed (`unknown`) in closed-enum order (`hinted → unhinted → not_applicable → unknown`). This is a **planning aid, not a runtime format validator, format-value distributor, format-contradiction detector, LLM inferrer, or SDK validator generator**.

**M53 vs M52 distinction:** `tusq gloss index` (M52) reads `input_schema.properties[firstKey].description` (the **FIRST input property's** docstring) and buckets on its presence. `tusq hint index` (M53) reads `input_schema.properties[firstKey].format` (the **FIRST input property's** JSON-Schema format keyword) and buckets on its presence. These two axes share the first-property-index family but operate on different fields.

```bash
tusq hint index [--hint <value>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--hint <hinted\|unhinted\|not_applicable\|unknown>` | all buckets | Filter to a single format-hint bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success; rejected if path is inside `.tusq/` |
| `--json` | human text | Emit machine-readable JSON |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown/absent hint value, `--out` path error, or unknown subcommand

**Classifier rules** (applied to `input_schema.properties[firstKey].format` when `input_schema.type === "object"`):

| Condition | Bucket |
|-----------|--------|
| `input_schema` missing/null/not-a-plain-object | `unknown` |
| `input_schema.type` missing or non-string | `unknown` |
| `input_schema.type` is a string but not `"object"` | `not_applicable` (no warning) |
| `input_schema.type === "object"`, `properties` missing/null/not-a-plain-object | `unknown` |
| `input_schema.type === "object"`, `Object.keys(properties).length === 0` | `not_applicable` (no warning) |
| `properties[firstKey]` is not a plain non-null object | `unknown` |
| `properties[firstKey].format` is present but `typeof !== "string"` (array/object/number/boolean) | `unknown` (strict-typing rule — malformed) |
| `properties[firstKey].format` is missing/`null`/`undefined` OR is a string with `trim().length === 0` | `unhinted` (no warning — absence signal, not malformation) |
| `properties[firstKey].format` is a string with `trim().length > 0` | `hinted` (no warning) |

Object.keys insertion-order is used; key sequence is NOT sorted or reordered.

**Bucket iteration order:** `hinted → unhinted → not_applicable → unknown` (conventional "hinted-first, unhinted-second, irrelevant-third, malformed-last" reading order — NOT knowledge-artifact-readiness-ranked, NOT reviewer-priority-ranked, NOT UX-affordance-completeness-ranked, NOT help-flow-readiness-ranked, NOT SDK-validator-readiness-ranked, NOT onboarding-clarity-ranked, NOT OpenAPI-conformance-ranked). Empty buckets do not appear.

**`warnings[]` array:** Present in `--json` output always (even when empty). Contains `{ capability, reason }` objects for each capability landing in the `unknown` bucket. Five frozen warning reason codes: `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_format_invalid_when_present`. The `not_applicable`, `hinted`, and `unhinted` buckets emit NO warnings — they are valid named outcomes. In human mode, warnings are emitted to stderr.

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- `input_schema_first_property_format_hint` is NOT written into the manifest — it is derived at read-time only (non-persistence rule).
- The four-value `input_schema_first_property_format_hint` enum, the three-value `aggregation_key` enum, and the five-value warning reason-code enum are frozen; any addition is a material governance event.
- Per-property format beyond the FIRST is NOT walked (reserved for `M-Hint-All-Properties`).
- Nested-property format under `input_schema.properties[key].properties` is NOT walked (reserved for `M-Hint-Nested`).
- `output_schema` first-property format is NOT classified (reserved for `M-Hint-Output`).
- `tusq hint index` does NOT validate format values against a format registry, cross-reference format vs OpenAPI/JSON-Schema spec enums, infer format from field names, or generate format hints.

```bash
# All format hint buckets (human-readable)
tusq hint index

# All format hint buckets (JSON)
tusq hint index --json

# Single format hint bucket
tusq hint index --hint hinted --json

# Unhinted capabilities (missing JSON-Schema format keyword)
tusq hint index --hint unhinted --json

# Write to file
tusq hint index --out hint-index.json
```

## `tusq choice index`

Emit a deterministic, per-first-input-property-enum-constraint-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].enum` is a non-empty array (`enumerated`), missing/null/undefined (`unenumerated`), non-applicable (`not_applicable` — non-object input or zero-property object), or malformed (`unknown`) in closed-enum order (`enumerated → unenumerated → not_applicable → unknown`). This is a **planning aid, not a runtime enum validator, enum-value distributor, enum-cardinality analyzer, LLM enum inferrer, or SDK picker generator**.

**M54 vs M53 distinction:** `tusq hint index` (M53) reads `input_schema.properties[firstKey].format` (the **FIRST input property's** JSON-Schema format keyword) and buckets on its presence. `tusq choice index` (M54) reads `input_schema.properties[firstKey].enum` (the **FIRST input property's** JSON-Schema enum constraint) and buckets on its presence. These two axes share the first-property-index family but operate on different fields and have different malformation semantics: M53 treats empty/whitespace-only format as `unhinted` (absent signal), while M54 treats empty-array enum as `unknown` (malformed — JSON-Schema requires enum to declare ≥1 allowed value).

```bash
tusq choice index [--choice <value>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--choice <enumerated\|unenumerated\|not_applicable\|unknown>` | all buckets | Filter to a single enum-constraint bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success; rejected if path is inside `.tusq/` |
| `--json` | human text | Emit machine-readable JSON |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown/absent choice value, `--out` path error, or unknown subcommand

**Classifier rules** (applied to `input_schema.properties[firstKey].enum` when `input_schema.type === "object"`):

| Condition | Bucket |
|-----------|--------|
| `input_schema` missing/null/not-a-plain-object | `unknown` |
| `input_schema.type` missing or non-string | `unknown` |
| `input_schema.type` is a string but not `"object"` | `not_applicable` (no warning) |
| `input_schema.type === "object"`, `properties` missing/null/not-a-plain-object | `unknown` |
| `input_schema.type === "object"`, `Object.keys(properties).length === 0` | `not_applicable` (no warning) |
| `properties[firstKey]` is not a plain non-null object | `unknown` |
| `properties[firstKey].enum` is present but not an Array (string/number/boolean/object) | `unknown` (strict-typing rule — malformed) |
| `properties[firstKey].enum` is present, is an Array, but `length === 0` | `unknown` (malformed — JSON-Schema requires `enum` to declare ≥1 allowed value; **deliberate divergence from M52/M53 empty-counts-as-absent precedent**) |
| `properties[firstKey].enum` is missing/`null`/`undefined` | `unenumerated` (no warning — semantically absent) |
| `properties[firstKey].enum` is an Array with `length >= 1` | `enumerated` (no warning; single-value is degenerate but structurally valid) |

Object.keys insertion-order is used; key sequence is NOT sorted or reordered.

**Bucket iteration order:** `enumerated → unenumerated → not_applicable → unknown` (deterministic stable-output convention only — NOT widget-composition-readiness-ranked, NOT reviewer-priority-ranked, NOT UX-affordance-completeness-ranked, NOT chat-affordance-readiness-ranked, NOT command-palette-readiness-ranked, NOT action-widget-readiness-ranked, NOT closed-vocabulary-coverage-ranked). Empty buckets do not appear.

**`warnings[]` array:** Present in `--json` output always (even when empty). Contains `{ capability, reason }` objects for each capability landing in the `unknown` bucket. Five frozen warning reason codes: `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_enum_invalid_when_present` (spans both non-array and empty-array malformations). The `not_applicable`, `enumerated`, and `unenumerated` buckets emit NO warnings — they are valid named outcomes. In human mode, warnings are emitted to stderr.

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- `input_schema_first_property_enum_constraint` is NOT written into the manifest — it is derived at read-time only (non-persistence rule).
- The four-value `input_schema_first_property_enum_constraint` enum, the three-value `aggregation_key` enum, and the five-value warning reason-code enum are frozen; any addition is a material governance event.
- Per-property enum beyond the FIRST is NOT walked (reserved for `M-Choice-All-Properties`).
- Nested-property enum under `input_schema.properties[key].properties` is NOT walked (reserved for `M-Choice-Nested`).
- `output_schema` first-property enum is NOT classified (reserved for `M-Choice-Output`).
- `tusq choice index` does NOT validate enum values against a value registry, cross-reference enum vs OpenAPI/SDK docs, infer missing enum vocabularies, analyze enum-cardinality tiers, or generate SDK/embeddable-widget picker stubs.

```bash
# All enum constraint buckets (human-readable)
tusq choice index

# All enum constraint buckets (JSON)
tusq choice index --json

# Single enum constraint bucket
tusq choice index --choice enumerated --json

# Unenumerated capabilities (no JSON-Schema enum constraint on first property)
tusq choice index --choice unenumerated --json

# Write to file
tusq choice index --out choice-index.json
```

## `tusq preset index`

Emit a deterministic, per-first-input-property-default-value-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].default` is present with any JSON value (`defaulted`), absent or `undefined` (`undefaulted`), non-applicable (`not_applicable` — non-object input or zero-property object), or malformed (`unknown`) in closed-enum order (`defaulted → undefaulted → not_applicable → unknown`). This is a **planning aid, not a runtime payload validator, doc-contradiction detector, default-value-type distributor, default-value-cardinality-tier distributor, LLM inferrer, SDK pre-fill generator, or voice-confirmation-policy enforcer**.

**M54 vs M55 distinction:** `tusq choice index` (M54) reads `input_schema.properties[firstKey].enum` (the **FIRST input property's** JSON-Schema enum constraint) and buckets on its presence. `tusq preset index` (M55) reads `input_schema.properties[firstKey].default` (the **FIRST input property's** JSON-Schema default value) and buckets on its presence. These two axes are orthogonal — an `enum`-constrained property MAY also carry a `default` value drawn from the enum set, MAY NOT, and an `unenumerated` property MAY also carry a `default` — the annotations are independent reviewer signals.

```bash
tusq preset index [--preset <value>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--preset <defaulted\|undefaulted\|not_applicable\|unknown>` | all buckets | Filter to a single default-value bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success; rejected if path is inside `.tusq/` |
| `--json` | human text | Emit machine-readable JSON |

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown/absent preset value, `--out` path error, or unknown subcommand

**Classifier rules** (applied to `input_schema.properties[firstKey].default` when `input_schema.type === "object"`):

| Condition | Bucket |
|-----------|--------|
| `input_schema` missing/null/not-a-plain-object | `unknown` |
| `input_schema.type` missing or non-string | `unknown` |
| `input_schema.type` is a string but not `"object"` | `not_applicable` (no warning) |
| `input_schema.type === "object"`, `properties` missing/null/not-a-plain-object | `unknown` |
| `input_schema.type === "object"`, `Object.keys(properties).length === 0` | `not_applicable` (no warning) |
| `properties[firstKey]` is not a plain non-null object | `unknown` (fifth frozen code: `input_schema_properties_first_property_descriptor_invalid`) |
| `properties[firstKey].default` has own property with value `!== undefined` | `defaulted` (no warning) |
| `properties[firstKey].default` key absent OR present with value `=== undefined` | `undefaulted` (no warning) |

**FALSY-DEFAULT-COUNTS-AS-DEFAULTED:** A `default` value of `null`/`false`/`0`/`""`/`[]`/`{}` is `defaulted` — the operator explicitly typed the falsy value as the pre-fill seed, carrying semantic intent. This deliberately diverges from M52/M53's empty-string-counts-as-absent precedent. HAS-OWN-PROPERTY-AND-NOT-UNDEFINED check: `Object.prototype.hasOwnProperty.call(firstVal, 'default') && firstVal.default !== undefined`. There is NO axis-specific malformation code because JSON-Schema `default` accepts ANY JSON value type.

Object.keys insertion-order is used; key sequence is NOT sorted or reordered.

**Bucket iteration order:** `defaulted → undefaulted → not_applicable → unknown` (deterministic stable-output convention only — NOT voice-interface-readiness-ranked, NOT reviewer-priority-ranked, NOT pre-fill-completeness-ranked, NOT UX-affordance-completeness-ranked, NOT agent-composition-readiness-ranked, NOT SaaS-onboarding-readiness-ranked, NOT copilot-pre-fill-readiness-ranked, NOT default-value-coverage-ranked). Empty buckets do not appear.

**`warnings[]` array:** Present in `--json` output always (even when empty). Contains `{ capability, reason }` objects for each capability landing in the `unknown` bucket. Five frozen warning reason codes: `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid` (fifth code — formally elevated from the M52/M53/M54 OBJ-004/OBJ-005/OBJ-006 undeclared pattern; M55 retires that pattern by making the firstVal-descriptor-invalid reason a first-class member of the PM-frozen set). The `not_applicable`, `defaulted`, and `undefaulted` buckets emit NO warnings — they are valid named outcomes. In human mode, warnings are emitted to stderr.

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- `input_schema_first_property_default_value` is NOT written into the manifest — it is derived at read-time only (non-persistence rule).
- The four-value `input_schema_first_property_default_value` enum, the three-value `aggregation_key` enum, and the five-value warning reason-code enum are frozen; any addition is a material governance event.
- Per-property default beyond the FIRST is NOT walked (reserved for `M-Preset-All-Properties-Default-Value-Index-1`).
- Nested-property default under `input_schema.properties[key].properties[nestedKey].default` is NOT walked (reserved for `M-Preset-Nested-Property-Default-Value-Index-1`).
- `output_schema` first-property default is NOT classified (reserved for `M-Preset-Output-First-Property-Default-Value-Index-1`).
- `tusq preset index` does NOT validate runtime payloads against the declared default value, cross-reference manifest first-property default vs OpenAPI/SDK docs, infer missing default values, analyze default-value types, compute default-value-cardinality tiers, generate SDK or voice pre-fill stubs, or enforce voice-confirmation policy on defaulted destructive capabilities.

```bash
# All default value buckets (human-readable)
tusq preset index

# All default value buckets (JSON)
tusq preset index --json

# Single default value bucket
tusq preset index --preset defaulted --json

# Undefaulted capabilities (no JSON-Schema default on first property)
tusq preset index --preset undefaulted --json

# Write to file
tusq preset index --out preset-index.json
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

## `tusq caption index`

Emit a deterministic, per-first-input-property-title-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].title` is a non-empty string (`titled`), absent or null (`untitled`), non-applicable (`not_applicable`), or malformed (`unknown`). This is a **planning aid, not a runtime payload validator, doc-contradiction detector, title-length-tier distributor, title-whitespace-distribution distributor, LLM title inferrer, brand-voice adapter, or chat-interface compiler**.

**M57-vs-M52-vs-M44 distinctness:** `tusq description index` (M44) reads the **capability-level top-level `description` field word-count tier** (a longer prose explanation of the entire capability). `tusq gloss index` (M52) reads the **per-property `input_schema.properties[firstKey].description` field** (a longer prose explanation of the first input parameter). `tusq caption index` (M57) reads the **per-property `input_schema.properties[firstKey].title` field** (JSON-Schema's per-property short-label keyword — a distinct annotation intended for UI rendering in confirmation prompts and slot-filling forms, NOT the longer prose description). These three commands are read-only-invariant peers; none alters the others' output bytes.

```bash
tusq caption index [--caption <value>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--caption <titled\|untitled\|not_applicable\|unknown>` | all buckets | Filter to a single title bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed `input_schema` or invalid first-property descriptor) |

**Classifier rule** (applied to `input_schema.properties[firstKey].title` when `input_schema.type === "object"`):

| Outcome | Condition |
|---------|-----------|
| `titled` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].title` is a `string` with `length >= 1`. Whitespace-only titles (e.g. `"   "`) count as `titled` at this milestone — whitespace-trim normalization is deferred to `M-Caption-Title-Whitespace-Distribution-Index-1`. |
| `untitled` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].title` is absent, `undefined`, or `null` (null-as-absent per M55/M56 precedent — no warning) |
| `not_applicable` | `input_schema.type` is a string but not `"object"` (non-object input has no first property) OR `input_schema.type === "object"` and `Object.keys(properties).length === 0` |
| `unknown` | `input_schema` missing/null/not-a-plain-object; `input_schema.type` missing or non-string; `input_schema.type === "object"` but `properties` missing/null/not-a-plain-object; `properties[firstKey]` not a plain object; `properties[firstKey].title` present non-null but NOT a `string`; OR `properties[firstKey].title` is a string with `length === 0` (empty string `""` is `unknown` WITH warning — deliberate alignment with M54 empty-`enum`-is-malformed and M56 empty-`examples`-is-malformed precedents) |

**Six frozen warning reason codes** (only `unknown` bucket emits warnings):
1. `input_schema_field_missing`
2. `input_schema_field_not_object`
3. `input_schema_type_missing_or_invalid`
4. `input_schema_properties_field_missing_when_type_is_object`
5. `input_schema_properties_first_property_descriptor_invalid`
6. `input_schema_properties_first_property_title_invalid_when_present` ← M57 axis-specific code; covers both non-string AND empty-string malformations under a single consolidated code

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown caption value, `--out` path error, or unknown subcommand

**Bucket iteration order:** `titled → untitled → not_applicable → unknown` (deterministic stable-output convention only — NOT chat-interface-readiness-ranked, NOT brand-matched-chat-readiness-ranked, NOT UX-label-completeness-ranked, NOT confirmation-prompt-readability-ranked, NOT form-widget-label-coverage-ranked, NOT embedded-chat-friendliness-ranked, NOT CSS-override-readiness-ranked). Empty buckets do not appear.

**Invariants:**
- `tusq.manifest.json` is never modified; `input_schema_first_property_title` is NEVER written into the manifest.
- Object.keys insertion-order is used to determine `firstKey`; keys are NOT sorted or reordered.
- Per-property title beyond the FIRST is NOT walked (reserved for `M-Caption-All-Properties-Title-Index-1`).

```bash
# All title buckets (human-readable)
tusq caption index

# All title buckets (JSON)
tusq caption index --json

# Titled capabilities (non-empty string title on first property)
tusq caption index --caption titled --json

# Untitled capabilities (no title field on first property)
tusq caption index --caption untitled --json

# Write to file
tusq caption index --out caption-index.json
```

## `tusq sample index`

Emit a deterministic, per-first-input-property-examples-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].examples` is a non-empty array (`exampled`), absent or null (`unexampled`), non-applicable (`not_applicable`), or malformed (`unknown`). This is a **planning aid, not a runtime payload validator, doc-contradiction detector, examples-element-type distributor, LLM inferrer, or marketplace-listing generator**.

**M56-vs-M40 distinctness:** `tusq examples index` (M40) reads the **capability-level top-level `examples` field** (worked-example invocation records `{name, request, response, ...}`). `tusq sample index` (M56) reads the **per-property `input_schema.properties[firstKey].examples` field** (JSON-Schema's per-property example-values keyword). These two commands are read-only-invariant peers reading two distinct JSON-Schema features under two distinct nouns.

```bash
tusq sample index [--sample <value>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--sample <exampled\|unexampled\|not_applicable\|unknown>` | all buckets | Filter to a single examples bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed `input_schema` or invalid first-property descriptor) |

**Classifier rule** (applied to `input_schema.properties[firstKey].examples` when `input_schema.type === "object"`):

| Outcome | Condition |
|---------|-----------|
| `exampled` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].examples` is a non-empty Array (`length >= 1`) |
| `unexampled` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].examples` is absent, `null`, or `undefined` (null-as-absent per JSON-Schema convention) |
| `not_applicable` | `input_schema.type` is a string but not `"object"` (non-object input has no first property) OR `input_schema.type === "object"` and `Object.keys(properties).length === 0` |
| `unknown` | `input_schema` missing/null/not-a-plain-object; `input_schema.type` missing or non-string; `input_schema.type === "object"` but `properties` missing/null/not-a-plain-object; `properties[firstKey]` not a plain object; OR `properties[firstKey].examples` present and non-null but not a non-empty array (empty array `[]` is `unknown` WITH warning — JSON-Schema requires `>=1` element; deliberate alignment with M54 empty-`enum`-is-malformed precedent) |

**Six frozen warning reason codes** (only `unknown` bucket emits warnings):
1. `input_schema_field_missing`
2. `input_schema_field_not_object`
3. `input_schema_type_missing_or_invalid`
4. `input_schema_properties_field_missing_when_type_is_object`
5. `input_schema_properties_first_property_descriptor_invalid`
6. `input_schema_properties_first_property_examples_invalid_when_present` ← M56 axis-specific code; covers both non-array AND empty-array malformations under a single consolidated code

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown sample value, `--out` path error, or unknown subcommand

**Bucket iteration order:** `exampled → unexampled → not_applicable → unknown` (deterministic stable-output convention only — NOT marketplace-readiness-ranked, NOT marketplace-discoverability-ranked, NOT OpenAI-ecosystem-readiness-ranked, NOT Claude/Anthropic-ecosystem-readiness-ranked, NOT MCP-registry-readiness-ranked, NOT example-prompt-coverage-ranked). Empty buckets do not appear.

**Invariants:**
- `tusq.manifest.json` is never modified; `input_schema_first_property_examples` is NEVER written into the manifest.
- Object.keys insertion-order is used to determine `firstKey`; keys are NOT sorted or reordered.
- Per-element type heterogeneity in `examples[]` is NOT classified at this milestone (reserved for `M-Sample-Examples-Element-Type-Distribution-Index-1`).

```bash
# All examples buckets (human-readable)
tusq sample index

# All examples buckets (JSON)
tusq sample index --json

# Exampled capabilities (non-empty examples array on first property)
tusq sample index --sample exampled --json

# Unexampled capabilities (no examples field on first property)
tusq sample index --sample unexampled --json

# Write to file
tusq sample index --out sample-index.json
```

## `tusq secret index`

Emit a deterministic, per-first-input-property-writeOnly-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].writeOnly` is boolean `true` (`write_only`), boolean `false` or absent or `null` (`not_write_only`), non-applicable (`not_applicable`), or malformed (`unknown`). This is a **planning aid, not a runtime writeOnly enforcer, credential-secrecy assessor, chat-mask-priority ranker, transcript-redaction-priority ranker, audit-log-redaction-tier ranker, surface-generator-output-suppression enforcer, one-time-vs-persistent-credential classifier, brand-safety checker, or widget-output-elicitability assessor**.

**M61-vs-M60 distinctness:** `tusq seal index` (M60) reads `input_schema.properties[firstKey].readOnly` (JSON-Schema Draft 7+'s per-property mutability boolean signaling server-set / not user-elicited). `tusq secret index` (M61) reads `input_schema.properties[firstKey].writeOnly` (JSON-Schema Draft 2019-09+'s per-property output-suppression boolean signaling that this value SHOULD NOT appear in API responses). These two commands are read-only-invariant peers reading two distinct JSON-Schema boolean keywords under two distinct nouns; neither alters the other's output bytes. An operator may set both, either, or neither on the same property — they are orthogonal annotations.

```bash
tusq secret index [--secret <write_only|not_write_only|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--secret <write_only\|not_write_only\|not_applicable\|unknown>` | all buckets | Filter to a single writeOnly annotation bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed `input_schema` or invalid first-property descriptor) |

**Classifier rule** (applied to `input_schema.properties[firstKey].writeOnly` when `input_schema.type === "object"`):

| Outcome | Condition |
|---------|-----------|
| `write_only` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].writeOnly === true` (strict boolean `true` only — NO truthy/falsy coercion; string `'true'`/number `1` → `unknown`) |
| `not_write_only` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].writeOnly === false` (EXPLICIT-FALSE-IS-NOT-WRITE-ONLY — no warning) OR `properties[firstKey].writeOnly` is absent, `undefined`, or `null` (null-as-absent per M55/M56/M57/M58/M59/M60 precedent — no warning) |
| `not_applicable` | `input_schema.type` is a string but not `"object"` (non-object input has no first property) OR `input_schema.type === "object"` and `Object.keys(properties).length === 0` |
| `unknown` | `input_schema` missing/null/not-a-plain-object; `input_schema.type` missing or non-string; `input_schema.type === "object"` but `properties` missing/null/not-a-plain-object; `properties[firstKey]` not a plain object; OR `properties[firstKey].writeOnly` present non-null but NOT a boolean (string `'true'`, number `1`/`0`, empty string, array, plain object) |

**Bucket iteration order:** `write_only → not_write_only → not_applicable → unknown` (deterministic stable-output convention — NOT a credential-secrecy ranking, NOT a chat-mask-priority ranking, NOT a transcript-redaction-priority ranking).

**Six frozen warning reason codes** (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`, `input_schema_properties_first_property_write_only_invalid_when_present`). The sixth code covers ALL non-boolean `writeOnly` malformations under a single consolidated code.

**Exit codes:**

| Code | Condition |
|------|-----------|
| `0` | Index produced (or empty-capabilities manifest) |
| `1` | Missing/invalid manifest, unknown flag, unknown `--secret` value, `--secret` value with absent bucket, `--out` path error, or unknown subcommand |

**Examples:**

```bash
# Human-readable output
tusq secret index

# JSON output
tusq secret index --json

# Filter to write_only bucket
tusq secret index --secret write_only --json

# Filter to not_write_only bucket
tusq secret index --secret not_write_only --json

# Write to file
tusq secret index --out secret-index.json
```

## `tusq seal index`

Emit a deterministic, per-first-input-property-readOnly-annotation-presence capability index from manifest evidence. Groups capabilities by whether `input_schema.properties[firstKey].readOnly` is boolean `true` (`readonly`), boolean `false` or absent or `null` (`mutable`), non-applicable (`not_applicable`), or malformed (`unknown`). This is a **planning aid, not a runtime readOnly enforcer, IAM-requirement-strength evaluator, server-set-vs-user-set classifier, parameter-mutability-tier distributor, end-user-prompt-eligibility enforcer, path-parameter-binding-tier ranker, schema-extraction-completeness assessor, writeOnly-crossref tool, or doc-contradiction detector**.

**M60-vs-M58 distinctness:** `tusq legacy index` (M58) reads `input_schema.properties[firstKey].deprecated` (JSON-Schema's per-property lifecycle-stage boolean signaling phase-out). `tusq seal index` (M60) reads `input_schema.properties[firstKey].readOnly` (JSON-Schema Draft 7+'s per-property mutability boolean signaling server-set / not user-elicited). These two commands are read-only-invariant peers reading two distinct JSON-Schema boolean keywords under two distinct nouns; neither alters the other's output bytes. An operator may set both, either, or neither on the same property — they are orthogonal annotations.

```bash
tusq seal index [--seal <readonly|mutable|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--seal <readonly\|mutable\|not_applicable\|unknown>` | all buckets | Filter to a single readOnly annotation bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed `input_schema` or invalid first-property descriptor) |

**Classifier rule** (applied to `input_schema.properties[firstKey].readOnly` when `input_schema.type === "object"`):

| Outcome | Condition |
|---------|-----------|
| `readonly` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].readOnly === true` (strict boolean `true` only — NO truthy/falsy coercion; string `'true'`/number `1` → `unknown`) |
| `mutable` | `input_schema.type === "object"`, `Object.keys(properties).length > 0`, `properties[firstKey].readOnly === false` (EXPLICIT-FALSE-IS-MUTABLE — no warning) OR `properties[firstKey].readOnly` is absent, `undefined`, or `null` (null-as-absent per M55/M56/M57/M58/M59 precedent — no warning) |
| `not_applicable` | `input_schema.type` is a string but not `"object"` (non-object input has no first property) OR `input_schema.type === "object"` and `Object.keys(properties).length === 0` |
| `unknown` | `input_schema` missing/null/not-a-plain-object; `input_schema.type` missing or non-string; `input_schema.type === "object"` but `properties` missing/null/not-a-plain-object; `properties[firstKey]` not a plain object; OR `properties[firstKey].readOnly` present non-null but NOT a boolean (string `'true'`, number `1`/`0`, empty string, array, plain object) |

**Bucket iteration order:** `readonly → mutable → not_applicable → unknown` (deterministic stable-output convention — NOT a mutability-tier ranking, NOT a capability-compiler-readiness ranking, NOT an IAM-requirement-strength ranking).

**Six frozen warning reason codes** (`input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`, `input_schema_properties_first_property_read_only_invalid_when_present`). The sixth code covers ALL non-boolean `readOnly` malformations under a single consolidated code.

**Exit codes:**

| Code | Condition |
|------|-----------|
| `0` | Index produced (or empty-capabilities manifest) |
| `1` | Missing/invalid manifest, unknown flag, unknown `--seal` value, `--seal` value with absent bucket, `--out` path error, or unknown subcommand |

**Examples:**

```bash
# Human-readable output
tusq seal index

# JSON output
tusq seal index --json

# Filter to readonly bucket
tusq seal index --seal readonly --json

# Filter to mutable bucket
tusq seal index --seal mutable --json

# Write to file
tusq seal index --out seal-index.json
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

## `tusq shape index`

Index capabilities by the primitive type of the FIRST property declared in `output_schema.properties` (Object.keys insertion-order index 0) when `output_schema.type === 'object'`. Planning aid only — not a runtime response validator, SDK type-definition generator, or JSON-Schema emitter.

```
tusq shape index [--first-type <value>] [--manifest <path>] [--out <path>] [--json]
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--first-type <value>` | Filter to one bucket. Case-sensitive lowercase-only. Exit 1 if unknown or absent. |
| `--manifest <path>` | Path to manifest (default: `tusq.manifest.json`) |
| `--out <path>` | Write to file (no stdout on success; `.tusq/` paths rejected) |
| `--json` | Machine-readable JSON with `first_property_types[]` and `warnings[]` |

**Bucket-key enum (closed nine-value):** `string` | `number` | `integer` | `boolean` | `null` | `object` | `array` | `not_applicable` | `unknown`

Classifier: reads `output_schema.properties[Object.keys(properties)[0]].type` (literal lower-case string, must be in `{string,number,integer,boolean,null,object,array}`). Returns `not_applicable` when `output_schema.type !== 'object'` or zero-property object (no warning). Returns `unknown` for malformed `output_schema` or invalid first-property descriptor (warning emitted with one of five frozen reason codes).

**Aggregation-key enum:** `first_property_type` (seven primitive buckets) | `not_applicable` | `unknown`

**Bucket iteration order:** `string → number → integer → boolean → null → object → array → not_applicable → unknown` (deterministic stable-output ordering only — NOT SDK-complexity-ranked, NOT tool-generation-difficulty-ranked)

**Five frozen warning reason codes:** `output_schema_field_missing`, `output_schema_field_not_object`, `output_schema_type_missing_or_invalid`, `output_schema_properties_field_missing_when_type_is_object`, `output_schema_properties_first_property_descriptor_invalid`

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown first-type value, --out path error, or unknown subcommand

**Examples:**

```sh
tusq shape index

tusq shape index --json

tusq shape index --first-type string

tusq shape index --first-type not_applicable --json

tusq shape index --out shape-index.json
```

## `tusq signature index`

Index capabilities by the primitive type of the FIRST property declared in `input_schema.properties` (Object.keys insertion-order index 0) when `input_schema.type === 'object'`. Planning aid only — not a runtime request validator, SDK call-site generator, or JSON-Schema emitter. Distinct from `tusq shape index` (M48, output-side first-property type), `tusq parameter index` (M47, input-property count), and `tusq request index` (M43, input primary parameter source).

```
tusq signature index [--first-type <value>] [--manifest <path>] [--out <path>] [--json]
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--first-type <value>` | Filter to one bucket. Case-sensitive lowercase-only. Exit 1 if unknown or absent. |
| `--manifest <path>` | Path to manifest (default: `tusq.manifest.json`) |
| `--out <path>` | Write to file (no stdout on success; `.tusq/` paths rejected) |
| `--json` | Machine-readable JSON with `first_property_types[]` and `warnings[]` |

**Bucket-key enum (closed nine-value):** `string` | `number` | `integer` | `boolean` | `null` | `object` | `array` | `not_applicable` | `unknown`

Classifier: reads `input_schema.properties[Object.keys(properties)[0]].type` (literal lower-case string, must be in `{string,number,integer,boolean,null,object,array}`). Returns `not_applicable` when `input_schema.type !== 'object'` or zero-property object (no warning). Returns `unknown` for malformed `input_schema` or invalid first-property descriptor (warning emitted with one of five frozen reason codes).

**Aggregation-key enum:** `first_property_type` (seven primitive buckets) | `not_applicable` | `unknown`

**Bucket iteration order:** `string → number → integer → boolean → null → object → array → not_applicable → unknown` (deterministic stable-output ordering only — NOT tool-call-difficulty-ranked, NOT LLM-context-cost-ranked)

**Five frozen warning reason codes:** `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_properties_first_property_descriptor_invalid`

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown first-type value, --out path error, or unknown subcommand

**Examples:**

```sh
tusq signature index

tusq signature index --json

tusq signature index --first-type string

tusq signature index --first-type not_applicable --json

tusq signature index --out signature-index.json
```

## `tusq obligation index`

Index capabilities by whether the FIRST declared property in `input_schema.properties` (Object.keys insertion-order index 0) is a member of `input_schema.required[]` when `input_schema.type === 'object'`. Planning aid only — not a runtime request validator, action-execution policy enforcer, SDK call-site generator, or runtime conformance detector. Distinct from `tusq input index` (M39, input_schema.required count cardinality), `tusq request index` (M43, input primary parameter source), `tusq parameter index` (M47, input-property count cardinality), `tusq shape index` (M48, output-side first-property type), and `tusq signature index` (M49, input-side first-property primitive type).

```
tusq obligation index [--status <value>] [--manifest <path>] [--out <path>] [--json]
```

**Flags:**

| Flag | Description |
|------|-------------|
| `--status <value>` | Filter to one bucket. Case-sensitive lowercase-only. Exit 1 if unknown or absent. |
| `--manifest <path>` | Path to manifest (default: `tusq.manifest.json`) |
| `--out <path>` | Write to file (no stdout on success; `.tusq/` paths rejected) |
| `--json` | Machine-readable JSON with `required_statuses[]` and `warnings[]` |

**Bucket-key enum (closed four-value):** `required` | `optional` | `not_applicable` | `unknown`

Classifier: reads `firstKey = Object.keys(input_schema.properties)[0]`; treats `requiredArr = Array.isArray(input_schema.required) ? input_schema.required : []`. Returns `required` if `requiredArr.includes(firstKey)`, `optional` if not (including missing/empty `required[]` — valid, no warning). Returns `not_applicable` when `input_schema.type !== 'object'` or zero-property object (no warning). Returns `unknown` for malformed `input_schema` or invalid `required[]` (warning emitted with one of five frozen reason codes).

**Aggregation-key enum:** `required_status` (required and optional buckets) | `not_applicable` | `unknown`

**Bucket iteration order:** `required → optional → not_applicable → unknown` (deterministic stable-output ordering only — NOT runtime-execution-safety-ranked, NOT call-site-strictness-ranked, NOT destructive-action-priority-ranked, NOT action-policy-precedence-ranked)

**Five frozen warning reason codes:** `input_schema_field_missing`, `input_schema_field_not_object`, `input_schema_type_missing_or_invalid`, `input_schema_properties_field_missing_when_type_is_object`, `input_schema_required_field_invalid_when_type_is_object`

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown status value, --out path error, or unknown subcommand

**Examples:**

```sh
tusq obligation index

tusq obligation index --json

tusq obligation index --status required

tusq obligation index --status not_applicable --json

tusq obligation index --out obligation-index.json
```

## `tusq strictness index`

Emit a deterministic, per-strictness capability index from manifest evidence. Groups capabilities by whether their `output_schema.additionalProperties` boolean is `false` (closed-key contract) or `true` (unspecified-field-tolerant) for object-typed responses, in closed-enum order (`strict → permissive → not_applicable → unknown`). Non-object responses bucket as `not_applicable` (no warning). Malformed or missing `output_schema` or non-boolean `additionalProperties` buckets as `unknown` with a warning. This is a **planning aid, not a runtime response validator, strict-schema middleware generator, or schema enforceability certifier**.

```bash
tusq strictness index [--strictness <strict|permissive|not_applicable|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--strictness <strict\|permissive\|not_applicable\|unknown>` | all buckets | Filter to a single strictness bucket (case-sensitive lowercase) |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON (includes `warnings[]` for malformed `output_schema`) |

**Strictness rule:**
- `strict` — `output_schema.type === 'object'` AND `output_schema.additionalProperties === false` (closed-key contract; LLM/caller may NOT introduce response fields not enumerated in `properties[]`)
- `permissive` — `output_schema.type === 'object'` AND `output_schema.additionalProperties === true` (unspecified-field-tolerant)
- `not_applicable` — `output_schema.type` is a string but not literal `'object'` (no warning emitted; includes array, string, number, boolean, null responses)
- `unknown` — `output_schema` or `output_schema.type` missing/malformed; OR `output_schema.type === 'object'` but `additionalProperties` is missing or non-boolean. Schema-as-`additionalProperties` (e.g., `{ "type": "string" }`) buckets as `unknown` (boolean-only contract; reserved for `M-Strictness-Schema-As-AdditionalProperties-1`).

**Exit codes:**
- `0` — Index produced (or empty-capabilities manifest)
- `1` — Missing/invalid manifest, unknown flag, unknown strictness value, `--out` path error, or unknown subcommand

**Bucket iteration order:** `strict → permissive → not_applicable → unknown` (closed-then-open boolean enumeration, falsy-first — NOT security-blast-radius-ranked, NOT strictness-precedence-ranked, NOT contract-quality-ranked, NOT tool-generation-safety-ranked). Empty buckets do not appear.

**Per-bucket fields:** `output_schema_strictness`, `aggregation_key` (`"strictness"` for strict/permissive, `"not_applicable"` for not_applicable, `"unknown"` for unknown), `capability_count`, `capabilities[]` (manifest declared order), `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**`--json` top-level shape:** `{ manifest_path, manifest_version, generated_at, strictnesses[], warnings[] }`. `warnings[]` is always present (empty `[]` when no malformed capabilities) for shape stability.

**Warning reason codes (five frozen values):**
- `output_schema_field_missing` — `output_schema` key absent from capability
- `output_schema_field_not_object` — `output_schema` is not a plain non-null object
- `output_schema_type_missing_or_invalid` — `output_schema.type` is missing or not a string
- `output_schema_additional_properties_missing_when_type_is_object` — `output_schema.type === 'object'` but `additionalProperties` key absent
- `output_schema_additional_properties_not_boolean_when_type_is_object` — `output_schema.type === 'object'` and `additionalProperties` present but not a boolean (includes schema-as-`additionalProperties`)

**Invariants:**
- `tusq.manifest.json` is never modified; mtime and content are unchanged after any invocation.
- `output_schema_strictness` is NOT written into `tusq.manifest.json` (non-persistence rule).
- Per-nested-property `additionalProperties` under `properties.x.additionalProperties` is NOT walked (reserved for `M-Strictness-Per-Property-1`).
- `output_schema.items.additionalProperties` for array-of-object items is NOT walked (reserved for `M-Strictness-Items-Object-1`).
- `input_schema.additionalProperties` strictness is reserved for `M-Strictness-Input-Schema-1`.
- The `--strictness` filter is case-sensitive lowercase-only; uppercase or mixed-case values exit `1` with `Unknown output schema strictness:`.
- The four-value `output_schema_strictness` enum, the three-value `aggregation_key` enum, and the five-value warning reason-code enum are frozen; any addition is a material governance event.

```bash
# All buckets (human-readable)
tusq strictness index

# All buckets (JSON)
tusq strictness index --json

# Single bucket
tusq strictness index --strictness permissive --json

# Filter to strict-schema capabilities only
tusq strictness index --strictness strict --json

# Write to file
tusq strictness index --out strictness-index.json
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

## `tusq request index`

Index capabilities by the primary HTTP request input parameter source declared in their `input_schema.properties[*].source` fields. Groups capabilities into seven source buckets (`path`, `request_body`, `query`, `header`, `mixed`, `none`, `unknown`) for planning review. This is a **planning aid, not a runtime request executor, request-payload validator, input-contract conformance detector, request generator, or input-contract certifier**.

```bash
tusq request index [--source <path|request_body|query|header|mixed|none|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--source <value>` | all sources | Filter to a single source bucket. Case-sensitive lowercase; `PATH` exits 1. |
| `--manifest <path>` | `tusq.manifest.json` | Path to manifest file. |
| `--out <path>` | stdout | Write JSON output to file. Rejected if inside `.tusq/`. |
| `--json` | human text | Emit machine-readable JSON with `sources[]` and `warnings[]`. |

**Source rule:** The primary source bucket is derived from `input_schema.properties[*].source` values. All property `source` values must be strings in the closed four-value set (`path`, `request_body`, `query`, `header`). If all properties share a single source value, that value is the bucket key. If properties have multiple distinct source values, the bucket is `mixed`. If properties is an empty object, the bucket is `none`. The `unknown` bucket covers all malformed cases (missing/malformed `input_schema`, missing/malformed `properties`, any property with a missing, non-string, array-valued, or unrecognized `source` value — including `cookie`, `file`, `multipart`, `form-data`).

**Bucket order (closed-enum):** `path → request_body → query → header → mixed → none → unknown` — deterministic stable-output convention only (HTTP anatomy reading order — NOT security-blast-radius-ranked, NOT workflow-criticality-ranked).

**Warnings** (in `--json` mode, always present even when empty):

| Reason code | When |
|-------------|------|
| `input_schema_field_missing` | Capability has no `input_schema` field |
| `input_schema_field_not_object` | `input_schema` is not a plain object |
| `input_schema_properties_field_missing` | `input_schema` has no `properties` field |
| `input_schema_properties_field_not_object` | `input_schema.properties` is not a plain object |
| `input_schema_property_source_field_missing_or_invalid` | A property has a missing, non-string, array, or unrecognized `source` value |

**Examples:**

```bash
# All sources (human-readable)
tusq request index

# All sources (JSON)
tusq request index --json

# Single source bucket
tusq request index --source path --json

# Mixed bucket only
tusq request index --source mixed --json

# Write to file
tusq request index --out request-source-index.json
```

## `tusq response index`

Index capabilities by the JSON Schema primitive type declared in their `output_schema.type` field. Groups capabilities into seven type buckets (`object`, `array`, `string`, `number`, `boolean`, `null`, `unknown`) for planning review. This is a **planning aid, not a runtime response executor, response-payload validator, data-contract conformance detector, response generator, or data-contract certifier**.

```bash
tusq response index [--type <object|array|string|number|boolean|null|unknown>] [--manifest <path>] [--out <path>] [--json]
```

| Flag | Default | Effect |
|------|---------|--------|
| `--type <value>` | all types | Filter to a single type bucket. Case-sensitive lowercase; `OBJECT` exits 1. |
| `--manifest <path>` | `tusq.manifest.json` | Path to manifest file. |
| `--out <path>` | stdout | Write JSON output to file. Rejected if inside `.tusq/`. |
| `--json` | human text | Emit machine-readable JSON with `types[]` and `warnings[]`. |

**Type rule:** Bucket key is the literal `output_schema.type` value if it is one of the six JSON Schema 2020-12 spec primitives (`object`, `array`, `string`, `number`, `boolean`, `null`). Bucketed as `unknown` if `output_schema` or `output_schema.type` is missing/malformed, the type string is not in the spec primitive set (e.g., `'integer'`, `'tuple'`, `'enum'`), or `output_schema.type` is an array (array-of-types). `'integer'` → `unknown` (integer-subset distinction reserved for `M-Output-Type-Integer-Subset-Index-1`). Compositional schemas (`oneOf`/`anyOf`/`allOf`) without a top-level `type` → `unknown`.

**Bucket order (closed-enum):** `object → array → string → number → boolean → null → unknown` — deterministic stable-output convention only (NOT data-contract-completeness-ranked, NOT shape-complexity-ranked).

**Warnings** (in `--json` mode, always present even when empty):

| Reason code | When |
|-------------|------|
| `output_schema_field_missing` | Capability has no `output_schema` field |
| `output_schema_field_not_object` | `output_schema` is not a plain object |
| `output_schema_type_field_missing` | `output_schema` has no `type` field |
| `output_schema_type_field_not_string` | `output_schema.type` is not a string |
| `output_schema_type_field_value_not_in_json_schema_primitive_set` | `output_schema.type` is a string but not a spec primitive |

**Examples:**

```bash
# All types (human-readable)
tusq response index

# All types (JSON)
tusq response index --json

# Single type bucket
tusq response index --type object --json

# Unknown bucket only
tusq response index --type unknown --json

# Write to file
tusq response index --out response-type-index.json
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
