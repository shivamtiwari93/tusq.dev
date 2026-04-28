---
title: Manifest Format
sidebar_label: Manifest Format
sidebar_position: 3
---

# Manifest Format

`tusq manifest` generates `tusq.manifest.json` as the review contract between discovery and compilation.

## Top-level fields

- `schema_version` (string)
- `manifest_version` (integer counter; starts at `1`)
- `previous_manifest_hash` (SHA-256 hash of previous manifest content, or `null` on first generation)
- `generated_at` (ISO timestamp)
- `source_scan` (path to `.tusq/scan.json`)
- `capabilities` (array)

## Capability fields

Each capability includes:

- `name`: stable capability identifier
- `description`: user-facing summary
- `method`: HTTP method
- `path`: route path
- `input_schema`: inferred input JSON schema (conservative in V1)
- `output_schema`: inferred output JSON schema (conservative in V1)
- `side_effect_class`: `read`, `write`, or `destructive`
- `sensitivity_class`: `unknown`, `public`, `internal`, `confidential`, or `restricted`
- `auth_hints`: inferred auth/middleware hints
- `examples`: usage examples (V1 defaults to a describe-only placeholder)
- `constraints`: operational limits object (`rate_limit`, `max_payload_bytes`, `required_headers`, `idempotent`, `cacheable`)
- `redaction`: operational masking/retention policy (`pii_fields`, `log_level`, `mask_in_traces`, `retention_days`)
- `provenance`: source file, line, framework, and handler metadata
- `confidence`: inference confidence score
- `review_needed`: true when confidence is below threshold
- `approved`: manual approval flag
- `approved_by`: approval identity string or `null`
- `approved_at`: approval timestamp string (ISO 8601) or `null`
- `domain`: domain grouping label
- `capability_digest`: SHA-256 digest of capability content fields (excludes approval/review metadata)

## V1 schema inference

In `v0.1.0`, `input_schema` and `output_schema` are intentionally conservative JSON Schema objects, but they now include first-pass route evidence when it can be inferred safely.

```json
{
  "type": "object",
  "properties": {},
  "required": [],
  "additionalProperties": true,
  "description": "<inference status message>"
}
```

The `description` varies by route confidence and available hints. Full body/query schema inference is still planned beyond `v0.1.0`, but V1 emits path parameters, write-body placeholders, array responses, object responses, and simple literal response properties when those are visible in route handlers.

### Path Parameter Extraction (V1)

When a route path contains explicit parameters (`:id` or `{id}`), `input_schema` is enriched with:

- `properties.<param>.type: "string"`
- `properties.<param>.source: "path"`
- `properties.<param>.description: "Path parameter: <param>"`
- `required: ["<param>", ...]`

Example for `/api/v1/users/:id`:

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

This gives downstream tool consumers explicit required arguments even when full body/query schema inference is not available yet.

### Fastify Schema Body Extraction (V1.5)

When a Fastify route declares a literal `schema: { body: { properties: {...} } }` block in its route-options object, `tusq scan` captures the declared top-level field shapes into `input_schema.properties`. This is a static extraction — no code is evaluated, no framework is imported.

- `input_schema.source` is set to `fastify_schema_body` when extraction succeeds.
- `input_schema.additionalProperties` is `false`, indicating the body shape is fully declared.
- Property key order matches the source declaration order (deterministic, not alphabetized).
- Only top-level fields are extracted (no nested property descent in V1.5).
- When the `schema` value is a variable reference (not a literal object), or when `body` is absent, or when any brace is unbalanced, the extractor falls back to the write-body placeholder described below — no partial extraction is emitted.

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "price": { "type": "number" },
    "active": { "type": "boolean" }
  },
  "required": ["name", "price"],
  "additionalProperties": false,
  "source": "fastify_schema_body",
  "description": "request body inferred from framework schema hints."
}
```

When a Fastify route also has path parameters, the path-derived fields appear first and win on name collision:

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "source": "path", "description": "Path parameter: id" },
    "name": { "type": "string" }
  },
  "required": ["id", "name"],
  "additionalProperties": false,
  "source": "fastify_schema_body",
  "description": "path parameters inferred from route pattern; request body inferred from framework schema hints."
}
```

The `source` value `fastify_schema_body` means "the declared body schema as it appears literally in source" — it does NOT mean the shape is validator-backed or runtime-enforced by Fastify. A capability's `capability_digest` includes `input_schema`, so an M24-driven shape change will flip the digest and require re-approval via `tusq approve`.

### Write Body Placeholder (V1)

For `POST`, `PUT`, `PATCH`, and `DELETE` routes without a literal Fastify `schema.body` block, `input_schema.properties.body` is emitted as an object placeholder. Its `source` is `request_body` unless a framework schema hint was detected, in which case it is `framework_schema_hint`.

```json
{
  "type": "object",
  "properties": {
    "body": {
      "type": "object",
      "additionalProperties": true,
      "source": "request_body"
    }
  },
  "required": [],
  "additionalProperties": true,
  "description": "request body expected for write operation."
}
```

### Response Shape Hints (V1)

When handlers visibly return or JSON-serialize arrays or object literals, `output_schema` records that evidence:

```json
{
  "type": "object",
  "additionalProperties": true,
  "properties": {
    "ok": {
      "type": "boolean"
    }
  },
  "description": "Inferred object response from handler return/json usage."
}
```

If the handler returns an array, `output_schema.type` is `array` with object items. When no reliable response evidence is found, V1 keeps the conservative object fallback.

### Capability Description Template (V1)

`description` is generated with a richer template:

`{verb} {noun} {qualifier} - {side_effect}, {auth_context} (handler: {handler_name})`

- `verb`: derived from method (`GET -> Retrieve`, `POST -> Create`, etc.)
- `noun`: inferred domain (`users`, `orders`, etc.)
- `qualifier`: derived from path params (`by id`, `by userId and orderId`, or empty)
- `side_effect`: `read-only`, `state-modifying`, or `destructive`
- `auth_context`: `requires <hints>` or `no authentication detected`
- handler suffix: included only when handler name is known (not inline/unknown)

Example:

`Retrieve user by id - read-only, requires requireAuth (handler: getUser)`

### Confidence Scoring (V1)

V1 confidence is heuristic and capped at `0.95`.

- Base: `0.62`
- Named handler: `+0.12`
- Auth hints present: `+0.08`
- Schema hint present: `+0.14`
- Non-root path: `+0.04`
- No schema hint: `-0.10`

`review_needed` remains `true` when `confidence < 0.8`.

## Classification fields (V1)

`side_effect_class` and `sensitivity_class` answer different governance questions:

- `side_effect_class`: does invoking this capability mutate state?
- `sensitivity_class`: what kind of data does this capability touch?

### `side_effect_class` rules

- `read`: assigned to `GET`, `HEAD`, and `OPTIONS`
- `write`: assigned to `POST`, `PUT`, and `PATCH` when there are no destructive signals
- `destructive`: assigned to `DELETE` or when path/handler names include destructive signals like `delete`, `destroy`, `remove`, or `revoke`

### `sensitivity_class` rules

Starting with M28, `sensitivity_class` is computed automatically by `tusq manifest` using a frozen six-rule first-match-wins decision table. The five legal values are:

| Value | Meaning |
|-------|---------|
| `restricted` | Irreversible, admin, or destructive operations — highest governance tier |
| `confidential` | Confirmed PII category evidence or write operations on financial/regulated routes |
| `internal` | Auth-gated or write operations that do not qualify for a higher tier |
| `public` | Evidence is present and no stronger rule matched |
| `unknown` | Zero static evidence (no verb, path, PII, auth, or preserve flag) |

**Six-rule decision table (frozen — any change is a governance event):**

| Rule | Trigger | Class |
|------|---------|-------|
| R1 | `preserve: true` flag | `restricted` |
| R2 | Admin/destructive verb (`delete`, `drop`, `truncate`, `admin`, `destroy`, `purge`, `wipe`) or admin-namespaced route | `restricted` |
| R3 | `redaction.pii_categories` is non-empty (from M25/M26 PII field-name detection) | `confidential` |
| R4 | Write verb + financial or regulated route/param (`payment`, `invoice`, `charge`, `billing`, `ssn`, `tax`, `account_number`) | `confidential` |
| R5 | `auth_hints` present or write verb (`create`, `update`, `write`, `post`, `put`, `patch`) | `internal` |
| R6 | Default — evidence present, no stronger rule matched | `public` |

Rules are evaluated top-to-bottom; the first match wins. R1 beats all — a capability with `preserve: true` is always `restricted` regardless of other signals.

**Zero-evidence guard:** Capabilities with no verb, no path, no PII categories, no `preserve` flag, and no auth hints receive `sensitivity_class: "unknown"` — never silently `"public"`.

**Digest-flip and re-approval (M13 semantics):** `sensitivity_class` is included in the content fields hashed into `capability_digest`. When M28 first computes a non-`"unknown"` value for a capability that previously had `"unknown"`, the digest changes and `approved` resets to `false`. Use `tusq diff` to review the change, then re-approve via `tusq approve`.

**Framing boundary (SYSTEM_SPEC Constraint 21):** `sensitivity_class` is reviewer-aid framing only. It MUST NOT be interpreted as runtime PII enforcement, automated compliance certification, or GDPR/HIPAA/PCI/SOC2 attestation. The classifier performs zero network, runtime, or policy calls. Reviewers own final sensitivity, masking, logging, and retention decisions.

**Compile and MCP surface:** `sensitivity_class` is NOT included in compiled tool definitions (`tusq-tools/*.json`) or MCP `tools/list`/`tools/call` responses. It is a manifest-and-review-surface field only.

## Auth Requirements (V1.10)

Starting with M29, `tusq manifest` automatically computes a structured `auth_requirements` record per capability as a pure deterministic function of the capability's middleware evidence. The record is a reviewer aid — it does NOT authenticate requests, enforce scopes, or certify OAuth/OIDC/SOC2/GDPR compliance.

**Shape:**

```json
{
  "auth_scheme": "bearer",
  "auth_scopes": [],
  "auth_roles": [],
  "evidence_source": "middleware_name"
}
```

**Closed `auth_scheme` enum (seven values):**

| Value | Meaning |
|-------|---------|
| `bearer` | Bearer-token / JWT / access-token middleware matched |
| `api_key` | API-key middleware matched |
| `session` | Session / cookie / passport-local middleware matched |
| `basic` | HTTP Basic-auth middleware matched |
| `oauth` | OAuth / OIDC / OpenID middleware matched |
| `none` | Explicit `auth_required: false` on a non-admin route |
| `unknown` | Zero evidence, or evidence present but no rule matched |

**Closed `evidence_source` enum (five values):** `middleware_name`, `route_prefix`, `auth_required_flag`, `sensitivity_class_propagation`, `none`.

**Frozen six-rule first-match-wins decision table:**

| Rule | Condition | `auth_scheme` | `evidence_source` |
|------|-----------|---------------|-------------------|
| R1 | middleware name matches `/bearer\|jwt\|access[_-]?token/i` | `bearer` | `middleware_name` |
| R2 | middleware name matches `/api[_-]?key\|x-api-key/i` | `api_key` | `middleware_name` |
| R3 | middleware name matches `/session\|cookie\|passport-local/i` | `session` | `middleware_name` |
| R4 | middleware name matches `/basic[_-]?auth/i` | `basic` | `middleware_name` |
| R5 | middleware name matches `/oauth\|oidc\|openid/i` | `oauth` | `middleware_name` |
| R6 | `auth_required === false` + non-admin route | `none` | `auth_required_flag` |
| Default | evidence present, no rule matched | `unknown` | `none` |

**Zero-evidence guard (first check before R1):** capabilities with no auth-related middleware, no route prefix, no auth flag, and no sensitivity signal receive `auth_scheme: "unknown"` with empty arrays — never silently `"none"`. `"none"` is reachable only from R6 (explicit `auth_required: false`).

**Scope/role extraction:** `auth_scopes` and `auth_roles` are extracted from middleware annotation literals in the capability record using frozen patterns (`/scopes?:\s*\[([^\]]+)\]/` and `/role[s]?:\s*\[([^\]]+)\]/`). Declaration order is preserved, deduplication is case-sensitive, and both arrays are always present (never `null`).

**Digest-flip and re-approval (AC-5):** `auth_requirements` is included in the content fields hashed into `capability_digest`. When M29 first computes a non-`"unknown"` value for a capability that previously had no `auth_requirements`, the digest changes and `approved` resets to `false`. Use `tusq diff` to review the change, then re-approve via `tusq approve`.

**Compile and MCP surface (AC-7):** `auth_requirements` is NOT included in compiled tool definitions (`tusq-tools/*.json`) or MCP `tools/list`/`tools/call`/`dry_run_plan` responses. It is a manifest-and-review-surface field only.

**Framing boundary (SYSTEM_SPEC Constraint 22):** `auth_requirements` is reviewer-aid framing only. tusq DOES NOT authenticate or authorize requests at runtime, DOES NOT certify OAuth/OIDC/SAML/SOC2/ISO27001 compliance, and DOES NOT validate token signatures or scope grants. `auth_scheme: "bearer"` means a middleware matched the R1 regex — not that tusq verifies bearer tokens. Reviewers own all AAA decisions.

**`tusq review` filter:** Use `--auth-scheme <scheme>` to display only capabilities matching a given scheme. Mutually compatible with `--sensitivity` (AND-style intersection). An unknown scheme value exits 1 with `Unknown auth scheme: <value>` on stderr.

## Confidence Tier Index (V1.17)

Starting with M36, `tusq confidence index` emits a static, read-only capability index grouped by a derived `confidence_tier` bucket. The tier is computed at read-time from the numeric `confidence` field already present in each capability; it is **never written back into `tusq.manifest.json`**.

**Frozen tier thresholds (Constraint 29):**

| `confidence` value | Derived tier |
|-------------------|-------------|
| `>= 0.85` | `high` |
| `>= 0.6` and `< 0.85` | `medium` |
| `< 0.6` | `low` |
| null / undefined / missing | `unknown` (no warning) |
| non-numeric / NaN / Infinity / out-of-[0,1] | `unknown` (warning emitted) |

**Closed four-value `confidence_tier` enum:** `high | medium | low | unknown`. Any addition is a material governance event.

**Closed two-value `aggregation_key` enum:** `tier` (for named buckets) and `unknown` (for the unknown bucket). Any addition is a material governance event.

**Bucket iteration order:** `high → medium → low → unknown`. This is a deterministic stable-output convention — NOT a quality-precedence statement, NOT an evidence-strength ranking.

**Non-persistence rule (Constraint 29):** `confidence_tier` MUST NOT appear as a key on any capability object inside `tusq.manifest.json`. It is a derived, ephemeral label that exists only in the index output. `tusq compile`, `tusq serve`, and all other commands are byte-identical before and after any `tusq confidence index` invocation.

**Framing boundary:** `tusq confidence index` is a planning aid only. It does NOT gate capability compilation, does NOT authenticate requests, does NOT re-classify the `confidence` field, and does NOT certify evidence quality. The `confidence` field itself remains a heuristic score set by `tusq manifest` — M36 only groups it into planning buckets.

## PII Field Count Tier Index (V1.18)

Starting with M37, `tusq pii index` emits a static, read-only capability index grouped by a derived `pii_field_count_tier` bucket. The tier is computed at read-time from the `pii_fields[]` array length already present in each capability's `redaction` object (M25-derived); it is **never written back into `tusq.manifest.json`**.

**Frozen tier function (Constraint 30):**

| `pii_fields` value | Derived tier |
|-------------------|-------------|
| Valid array, `length === 0` | `none` |
| Valid array, `1 <= length <= 2` | `low` |
| Valid array, `3 <= length <= 5` | `medium` |
| Valid array, `length >= 6` | `high` |
| null / missing / not-an-array | `unknown` (warning emitted) |
| array with non-string or empty-string element | `unknown` (warning emitted) |

Boundaries `0/2/5/6` are immutable once M37 ships. Any threshold change is a material governance event.

**Closed five-value `pii_field_count_tier` enum:** `none | low | medium | high | unknown`. Any addition is a material governance event.

**Closed two-value `aggregation_key` enum:** `tier` (for named buckets) and `unknown` (for the malformed/missing bucket). Any addition is a material governance event.

**Bucket iteration order:** `none → low → medium → high → unknown`. This is a deterministic stable-output convention — NOT a leakage-severity ranking, NOT an exposure-risk statement.

**Case-sensitive `--tier` filter:** Lowercase canonical values only. `HIGH` exits 1 with `Unknown pii field count tier: HIGH`.

**Non-persistence rule (Constraint 30):** `pii_field_count_tier` MUST NOT appear as a key on any capability object inside `tusq.manifest.json`. It is a derived, ephemeral label that exists only in the index output. `tusq compile`, `tusq serve`, and all other commands are byte-identical before and after any `tusq pii index` invocation.

**Framing boundary:** `tusq pii index` is a planning aid only. It does NOT detect PII at runtime, does NOT prevent data leakage, does NOT enforce redaction at runtime, does NOT certify GDPR/HIPAA/PCI/PHI compliance, and does NOT alter M25's canonical PII name set or `pii_fields[]` extraction rules. The `pii_fields[]` array remains the M25-derived source-literal name hint — M37 only groups it into planning buckets by array length.

## Required Input Field Count Tier Index (V1.20)

Starting with M39, `tusq input index` emits a static, read-only capability index grouped by a derived `required_input_field_count_tier` bucket. The tier is computed at read-time from the cardinality of the `input_schema.required[]` array already present in each capability (M11/M14/M24-derived); it is **never written back into `tusq.manifest.json`**.

| `capability.input_schema.required` condition | Derived tier |
|----------------------------------------------|--------------|
| Valid array, length === 0 | `none` |
| Valid array, 1 ≤ length ≤ 2 | `low` |
| Valid array, 3 ≤ length ≤ 5 | `medium` |
| Valid array, length ≥ 6 | `high` |
| `input_schema` missing / `null` / not a plain object (includes Array) | `unknown` |
| `required` missing / `null` / not an array | `unknown` |
| `required[]` contains non-string, empty string, `null`, array, or object element | `unknown` |

**Closed five-value `required_input_field_count_tier` enum:** `none | low | medium | high | unknown`. Any addition is a material governance event.

**Closed two-value `aggregation_key` enum:** `tier` (named buckets) | `unknown` (zero-evidence / malformed catchall). Any addition is a material governance event.

**Bucket iteration order:** `none → low → medium → high → unknown`. This is a stable-output convention only — NOT an exposure-risk ranking, NOT a blast-radius ranking, NOT an input-complexity ranking.

**Warnings:** When a capability lands in the `unknown` bucket due to malformed `input_schema` or `required` field data, a warning is emitted. In `--json` mode, warnings appear as `{ capability, reason }` objects in `warnings[]` (always present, even `[]`). In human mode, warnings write to stderr. Five frozen warning reason codes: `input_schema_field_missing`, `input_schema_field_not_object`, `required_field_missing`, `required_field_not_array`, `required_array_contains_non_string_or_empty_element`. Malformed values are bucketed as `unknown` — they are NOT silently coerced to an empty `required: []`.

**Case-sensitive `--tier` filter:** Lowercase canonical values only. `HIGH` exits 1 with `Unknown required input field count tier: HIGH`. A valid-but-absent tier exits 1 with `No capabilities found for required input field count tier: <tier>`.

**Non-persistence rule (Constraint 32):** `required_input_field_count_tier` MUST NOT appear as a key on any capability object inside `tusq.manifest.json`. It is a derived, ephemeral label that exists only in the index output. `tusq compile`, `tusq serve`, and all other commands are byte-identical before and after any `tusq input index` invocation.

**Framing boundary:** `tusq input index` is a planning aid only. It does NOT execute capability inputs at runtime, does NOT validate `input_schema.properties[]` conformance against any per-element schema, does NOT generate new inputs or example payloads, does NOT measure runtime call frequency or call patterns, does NOT certify exposure-safety, and does NOT alter M11/M14/M24's canonical input-schema extraction rules. The `input_schema.required[]` array remains the M11/M14/M24-derived source — M39 only groups it into planning buckets by array length. Whether a capability is "safe to expose" remains the reviewer's judgment combining `sensitivity_class`, `side_effect_class`, `auth_scheme`, `confidence`, and `required_input_field_count_tier` together.

### Input Schema Property Count Tier Index

The `tusq parameter index` command (M47) derives a per-tier capability breakdown from each capability's `input_schema.properties` object — the full set of declared input parameters for an MCP-listed tool. Directly answers the operator question: "for the tools generated from my capabilities, how many input parameters does each tool accept, and which destructive or restricted-sensitivity capabilities sit in the high-cardinality bucket where parameter sprawl most blunts review-by-eye?" Operationalizes VISION § MCP Server (lines 229–239) — "approval-aware tool listing." Distinct from M39 (which counts `input_schema.required[]` — a subset of properties marking mandatory parameters).

**Tier function** (thresholds `0/2/5/6` match M40 verbatim and are immutable):

| Tier | Condition |
|------|-----------|
| `none` | `Object.keys(input_schema.properties).length === 0` (no parameters) |
| `low` | `1 <= length <= 2` |
| `medium` | `3 <= length <= 5` |
| `high` | `length >= 6` |
| `unknown` | `input_schema` missing/not-a-plain-object, `properties` missing/not-a-plain-object, or any property descriptor value is not a plain non-null object |

**Malformed values:** When `input_schema` or `input_schema.properties` is malformed, a `Warning: capability '<name>' has malformed input_schema (<reason>)` is emitted to stderr (human mode) or recorded in `warnings[]` (JSON mode). Five frozen reason codes:
- `input_schema_field_missing` — no `input_schema` key or value is `null`
- `input_schema_field_not_object` — `input_schema` is not a plain object
- `input_schema_properties_field_missing` — no `properties` key
- `input_schema_properties_field_not_object` — `properties` is not a plain object
- `input_schema_properties_field_contains_invalid_descriptor` — `properties` has a value that is `null`, a primitive, or an array

**Bucket iteration order:** `none → low → medium → high → unknown` (ascending-numeric-tier convention only — NOT parameter-sprawl-precedence-ranked, NOT complexity-blast-radius-ranked, NOT tool-generation-difficulty-ranked, NOT review-burden-priority-ranked).

**Within-bucket ordering:** Capabilities appear in manifest declared order.

**Non-persistence:** `input_schema_property_count_tier` is reviewer-aid metadata only and is NEVER persisted into `tusq.manifest.json`. Nested properties (`input_schema.properties[].properties`) are NOT walked. The `required ∩ properties` intersection is NOT computed.

### Output Schema Property Count Tier Index

The `tusq output index` command (M40) derives a per-tier capability breakdown from each capability's `output_schema.properties` object, as populated by the M11/M14/M24 scan/compile pipeline from JSON Schema `responses` blocks, Fastify response schema literals, and handler-return-shape inference.

**Tier function** (thresholds `0/2/5/6` are immutable):

| Tier | Condition |
|------|-----------|
| `none` | `Object.keys(output_schema.properties).length === 0` |
| `low` | `1 <= length <= 2` |
| `medium` | `3 <= length <= 5` |
| `high` | `length >= 6` |
| `unknown` | `output_schema` missing/not-a-plain-object, `properties` missing/not-a-plain-object, or any property descriptor value is not a plain non-null object |

**`type:array` schemas:** When a capability's response shape is typed as `"array"`, the per-element schema lives under `output_schema.items`, not `output_schema.properties`. These capabilities are bucketed as `unknown` with reason `output_schema_properties_field_missing` — this is informative, not a defect. It signals that the top-level properties key is legitimately absent and the items schema is the relevant contract surface.

**Malformed values:** When `output_schema` or `output_schema.properties` is malformed, a `Warning: capability '<name>' has malformed output_schema (<reason>)` is emitted to stderr (human mode) or recorded in `warnings[]` (JSON mode). Five frozen reason codes:
- `output_schema_field_missing` — no `output_schema` key
- `output_schema_field_not_object` — `output_schema` is not a plain object
- `output_schema_properties_field_missing` — no `properties` key (includes `type:array`)
- `output_schema_properties_field_not_object` — `properties` is not a plain object
- `output_schema_properties_object_contains_non_object_property_descriptor` — `properties` has a value that is null, a primitive, an array, or a function

**Bucket iteration order:** `none → low → medium → high → unknown` (closed-enum deterministic stable-output convention only — NOT doc-drift-risk-ranked, NOT staleness-ranked, NOT contract-surface-area-ranked).

**Within-bucket ordering:** Capabilities appear in manifest declared order.

**Case-sensitive `--tier` filter:** Only lowercase values match. `--tier HIGH` exits 1 with `Unknown output schema property count tier: HIGH`.

**Non-persistence:** `output_schema_property_count_tier` is reviewer-aid metadata only and is NEVER persisted into `tusq.manifest.json`. The manifest is read-only during `tusq output index` — mtime, SHA-256, and all `capability_digest` values are byte-identical before and after the command.

### Output Schema Top-Level Type Index

The `tusq response index` command (M42) derives a per-type capability breakdown from each capability's `output_schema.type` field. This axis is orthogonal to the M40 Output Schema Property Count Tier (M40 asks "how many top-level properties?"; M42 asks "what JSON Schema primitive shape?"). Both read the `output_schema` field written by the M11/M14/M24 scan/compile pipeline; neither modifies it.

**Type function** (literal exact-string match against the six JSON Schema 2020-12 spec primitives):

| Type bucket | Condition |
|-------------|-----------|
| `object` | `output_schema.type === 'object'` |
| `array` | `output_schema.type === 'array'` |
| `string` | `output_schema.type === 'string'` |
| `number` | `output_schema.type === 'number'` |
| `boolean` | `output_schema.type === 'boolean'` |
| `null` | `output_schema.type === 'null'` |
| `unknown` | All other cases (see below) |

**`unknown` bucket conditions:** `output_schema` is missing, null, or not a plain object; `output_schema.type` is missing, null, or not a string; `output_schema.type` is a string not in the spec primitive set (including `'integer'`, `'tuple'`, `'enum'`, any custom value); `output_schema.type` is an array (array-of-types like `['object', 'null']`).

**`'integer'` → `unknown`:** The JSON Schema spec defines `integer` as a subset of `number`, but M42 does NOT coerce `'integer'` to `'number'`. `'integer'` is bucketed as `unknown` with reason `output_schema_type_field_value_not_in_json_schema_primitive_set`. This distinction is reserved for `M-Output-Type-Integer-Subset-Index-1`.

**Compositional schemas:** Schemas using `oneOf`/`anyOf`/`allOf` without a top-level `type` field are bucketed as `unknown` (reason `output_schema_type_field_missing`). No schema walking is performed.

**Array-of-types:** When `output_schema.type` is an array (valid in JSON Schema 2020-12 multi-type form), it is bucketed as `unknown` (reason `output_schema_type_field_not_string`) because the value is not a string.

**Malformed values:** When a capability's `output_schema` is malformed, a `Warning: capability '<name>' has malformed output_schema (<reason>)` is emitted to stderr (human mode) or recorded in `warnings[]` (JSON mode). Five frozen reason codes:
- `output_schema_field_missing` — no `output_schema` key on the capability
- `output_schema_field_not_object` — `output_schema` is not a plain object
- `output_schema_type_field_missing` — `output_schema` has no `type` field
- `output_schema_type_field_not_string` — `output_schema.type` is not a string
- `output_schema_type_field_value_not_in_json_schema_primitive_set` — `output_schema.type` is a string but not one of the six JSON Schema 2020-12 core primitive types

**Bucket iteration order:** `object → array → string → number → boolean → null → unknown` (closed-enum deterministic stable-output convention only — NOT data-contract-completeness-ranked, NOT shape-complexity-ranked, NOT data-lineage-blast-radius-ranked, NOT DTO-richness-ranked, NOT JSON-Schema-spec-precedence-ranked).

**Within-bucket ordering:** Capabilities appear in manifest declared order.

**Case-sensitive `--type` filter:** Only lowercase values match. `--type OBJECT` exits 1 with `Unknown output schema top-level type: OBJECT`.

**Non-persistence:** `output_schema_top_level_type` is reviewer-aid metadata only and is NEVER persisted into `tusq.manifest.json`. The manifest is read-only during `tusq response index` — mtime, SHA-256, and all `capability_digest` values are byte-identical before and after the command.

### Input Schema Primary Parameter Source Index

The `tusq request index` command (M43) derives a per-source capability breakdown from each capability's `input_schema.properties[*].source` fields, as populated by the M11/M14 scan/compile pipeline from Express/Fastify route handler parameter annotations. This axis is orthogonal to M39 (M39 asks "how many required input fields?"; M43 asks "what HTTP anatomy locus do input parameters come from?"). Symmetric to M42 (M42 = response-shape contract; M43 = request-input-locus contract).

**Source function** (applied to `input_schema.properties[*].source` values):

| Source bucket | Condition |
|---------------|-----------|
| `path` | All properties have `source === 'path'` (single uniform source) |
| `request_body` | All properties have `source === 'request_body'` (single uniform source) |
| `query` | All properties have `source === 'query'` (single uniform source) |
| `header` | All properties have `source === 'header'` (single uniform source) |
| `mixed` | Properties have multiple distinct source values, all within the four-value set |
| `none` | `input_schema.properties` is a valid plain object with zero keys |
| `unknown` | All other cases (see below) |

**`unknown` bucket conditions:** `input_schema` is missing, null, or not a plain object; `input_schema.properties` is missing, null, or not a plain object; any property whose `source` value is missing, not a string, is an array (`source: ['path', 'query']`), or is a string not in the closed four-value set (`path`, `request_body`, `query`, `header`) — including `'cookie'`, `'file'`, `'multipart'`, `'form-data'`, and any other unrecognized value.

**Cookie and file/multipart source values → `unknown`:** The `cookie`-locus and file/multipart-locus distinctions are reserved for `M-Input-Source-Cookie-Bucket-1` and `M-Input-Source-File-Bucket-1`. All such values are bucketed as `unknown` with reason `input_schema_property_source_field_missing_or_invalid`.

**`mixed` bucket:** A single catchall for capabilities whose properties span multiple source loci. No per-locus-pair enumeration (e.g., `path+request_body` as a distinct bucket) is performed; that is reserved for `M-Input-Source-Mixed-Pair-Enumeration-Index-1`.

**Optional-vs-required collapse:** All properties' `source` fields are consulted regardless of `input_schema.required[]` membership. The optional-only vs required-only locus splits are reserved for `M-Input-Source-Optional-vs-Required-Split-1`.

**Malformed values:** When a capability's `input_schema` or its properties are malformed, a `Warning: capability '<name>' has malformed input_schema (<reason>)` is emitted to stderr (human mode) or recorded in `warnings[]` (JSON mode). Five frozen reason codes:
- `input_schema_field_missing` — no `input_schema` key on the capability
- `input_schema_field_not_object` — `input_schema` is not a plain object
- `input_schema_properties_field_missing` — `input_schema` has no `properties` field
- `input_schema_properties_field_not_object` — `input_schema.properties` is not a plain object
- `input_schema_property_source_field_missing_or_invalid` — a property has a missing, non-string, array, or unrecognized `source` value

**Bucket iteration order:** `path → request_body → query → header → mixed → none → unknown` (closed-enum deterministic stable-output convention only — NOT security-blast-radius-ranked, NOT workflow-criticality-ranked, NOT permission-sensitivity-ranked, NOT HTTP-spec-precedence-ranked).

**Within-bucket ordering:** Capabilities appear in manifest declared order.

**Case-sensitive `--source` filter:** Only lowercase values match. `--source PATH` exits 1 with `Unknown input schema primary parameter source: PATH`.

**Non-persistence:** `input_schema_primary_parameter_source` is reviewer-aid metadata only and is NEVER persisted into `tusq.manifest.json`. The manifest is read-only during `tusq request index` — mtime, SHA-256, and all `capability_digest` values are byte-identical before and after the command.

### Description Word Count Tier Index

The `tusq description index` command (M44) derives a per-tier capability breakdown from each capability's `description` string field, as populated by the M11/M14 scan/compile pipeline. This axis is orthogonal to all prior count-tier axes (M37–M41 measure structural cardinalities of typed manifest array fields; M44 measures the unstructured natural-language whitespace-token count of a single string field — a fundamentally different axis class). Directly operationalizes VISION § Public Docs And Market-Facing Truth (lines 91-97) — description-word-count is the most fundamental structural proxy for customer-facing-claim contradiction surface.

**Tier function** (thresholds `7`/`14` are immutable; tier function `description.trim().split(/\s+/u).length`):

| Tier | Condition |
|------|-----------|
| `low` | `token_count <= 7` |
| `medium` | `8 <= token_count <= 14` |
| `high` | `token_count >= 15` |
| `unknown` | `description` is null/missing/non-string/empty-after-trim |

**Tokenization rules (all immutable):**
- Tokenization: `description.trim().split(/\s+/u).length` — purely whitespace-based with the `/u` flag for Unicode whitespace
- Markdown is NOT stripped
- HTML tags are NOT stripped
- Punctuation is NOT stripped
- Numbers are NOT stripped
- CJK / RTL / no-whitespace scripts are NOT grapheme-clustered (no per-language handling)
- Sub-schema walking is NOT performed: `input_schema.description`, `output_schema.description`, and `examples[].description` are NOT consulted

**Malformed values:** Three frozen reason codes for the `unknown` bucket:
- `description_field_missing` — no `description` key on the capability
- `description_field_not_string` — `description` is not a string
- `description_field_empty_after_trim` — `description` trims to an empty string

**Bucket iteration order:** `low → medium → high → unknown` (ascending tier numeric span — deterministic stable-output convention only; NOT doc-quality-ranked, NOT doc-completeness-ranked, NOT doc-richness-ranked, NOT doc-staleness-blast-radius-ranked, NOT customer-facing-truth-surface-ranked).

**Within-bucket ordering:** Capabilities appear in manifest declared order.

**Case-sensitive `--tier` filter:** Only lowercase values match. `--tier LOW` exits 1 with `Unknown description word count tier: LOW`.

**Non-persistence:** `description_word_count_tier` is reviewer-aid metadata only and is NEVER persisted into `tusq.manifest.json`. The manifest is read-only during `tusq description index` — mtime, SHA-256, and all `capability_digest` values are byte-identical before and after the command.

### Output Schema Items Type Index

The `tusq items index` command (M45) derives a per-bucket capability breakdown from each capability's `output_schema.items.type` field, for array-typed responses only. This axis is orthogonal to M42 (which buckets on `output_schema.type` top-level primitive — object vs array vs string vs number vs boolean vs null); M45 measures, for array-typed responses only, the SHAPE OF EACH ARRAY ELEMENT. M42 says "is this a table?"; M45 says "if it's a table, what's in each row?" Directly operationalizes VISION § Frontend, Design System, And Product UX (lines 66–72) — `items.type` is the most fundamental structural claim about how each array element will render in the frontend product.

**Tier function** (classification of `output_schema.items.type`):

| Bucket | Condition |
|--------|-----------|
| `object` | `output_schema.type === 'array'` AND `items.type === 'object'` |
| `array` | `output_schema.type === 'array'` AND `items.type === 'array'` |
| `string` | `output_schema.type === 'array'` AND `items.type === 'string'` |
| `number` | `output_schema.type === 'array'` AND `items.type === 'number'` |
| `integer` | `output_schema.type === 'array'` AND `items.type === 'integer'` (first-class, NOT collapsed to number) |
| `boolean` | `output_schema.type === 'array'` AND `items.type === 'boolean'` |
| `null` | `output_schema.type === 'array'` AND `items.type === 'null'` |
| `not_applicable` | `output_schema.type` is a string but not `'array'` (valid named bucket — emits NO warning) |
| `unknown` | `output_schema` null/non-object/missing, `output_schema.type` non-string, or `items` malformed/items.type outside closed set |

**Integer-NOT-collapsed-to-number rule:** Unlike M42 (which buckets `integer` as `unknown`), M45 treats `integer` as a first-class bucket. A typed array of integers (`[1, 2, 3]`) is a distinct rendering target from a typed array of arbitrary numbers (`[1.5, 2.7, 3.9]`) — frontend tables format integers without decimal points differently from floats.

**Not-applicable is valid:** A capability with `output_schema.type === 'object'` (M42 `object` bucket) has no `items.type` to evaluate. It lands in `not_applicable`, which is a valid named bucket and emits NO warning. Only the `unknown` bucket (malformed/missing `output_schema` or `items`) triggers warnings.

**Malformed values:** Five frozen warning reason codes for the `unknown` bucket:
- `output_schema_field_missing` — no `output_schema` key on the capability
- `output_schema_field_not_object` — `output_schema` is not a plain non-null object
- `output_schema_items_field_missing_when_type_is_array` — `output_schema.type === 'array'` but `items` is missing/null/non-object
- `output_schema_items_field_not_object_when_type_is_array` — `items` is present but is an array (tuple-style) or non-object
- `output_schema_items_type_field_missing_or_invalid_when_type_is_array` — `items` is a plain object but `items.type` is missing, non-string, or outside the closed seven-value JSON-Schema primitive set

**No-walking rules:** Compositional items (`oneOf`/`anyOf`/`allOf` without top-level `type`) → `unknown`; tuple-style items (items as array) → `unknown`; multi-type items (`items.type` as array) → `unknown`; nested-array element typing (`items.items.type`) is NOT examined.

**Bucket iteration order:** `object → array → string → number → integer → boolean → null → not_applicable → unknown` (JSON-Schema 2020-12 spec primitive enumeration reading order with object first — deterministic stable-output convention only; NOT UI-rendering-precedence-ranked, NOT frontend-blast-radius-ranked, NOT table-vs-list-priority-ranked, NOT render-complexity-ranked).

**Within-bucket ordering:** Capabilities appear in manifest declared order.

**Case-sensitive `--items-type` filter:** Only lowercase values match. `--items-type OBJECT` exits 1 with `Unknown output schema items type: OBJECT`.

**Non-persistence:** `output_schema_items_type` is reviewer-aid metadata only and is NEVER persisted into `tusq.manifest.json`. The manifest is read-only during `tusq items index` — mtime, SHA-256, and all `capability_digest` values are byte-identical before and after the command.

### Output Schema Strictness Index

The `tusq strictness index` command (M46) derives a per-bucket capability breakdown from each capability's `output_schema.additionalProperties` boolean field, for object-typed responses only. This axis is orthogonal to M40 (which counts `output_schema.properties` keys on object responses — "how many top-level keys?"), M42 (which buckets on `output_schema.type` top-level primitive — "what shape at all?"), and M45 (which buckets on `output_schema.items.type` per-element shape for array responses — "what's in each row?"). M46 measures, for object-typed responses only, whether the response schema is CLOSED (`additionalProperties === false`) or OPEN (`additionalProperties === true`) — a fundamentally different axis class (boolean strictness gate, not numeric tier, not categorical primitive type, not categorical locus class). Directly operationalizes VISION § Tools (lines 164–173) — "AI tools with **strict schemas**, normalized errors, dry-run and confirmation support, IAM context requirements, audit metadata, provenance back to source."

**Tier function** (classification of `output_schema.additionalProperties`):

| Bucket | Condition |
|--------|-----------|
| `strict` | `output_schema.type === 'object'` AND `output_schema.additionalProperties === false` |
| `permissive` | `output_schema.type === 'object'` AND `output_schema.additionalProperties === true` |
| `not_applicable` | `output_schema.type` is a string but not `'object'` (valid named bucket — emits NO warning) |
| `unknown` | `output_schema` null/non-object/missing, `output_schema.type` non-string, or `output_schema.type === 'object'` with missing/non-boolean `additionalProperties` |

**Boolean-only contract:** JSON-Schema 2020-12 allows `additionalProperties` as either a boolean or a schema object. M46 reads ONLY the boolean form. Schema-as-`additionalProperties` (e.g., `{ "type": "string" }`) buckets as `unknown` with reason `output_schema_additional_properties_not_boolean_when_type_is_object`. This is intentional and frozen. Schema-object `additionalProperties` walking is reserved for `M-Strictness-Schema-As-AdditionalProperties-1`.

**Not-applicable is valid:** A capability with `output_schema.type === 'array'` (M45 array bucket) has no `additionalProperties` to evaluate at the top level. It lands in `not_applicable`, which is a valid named bucket and emits NO warning. Only the `unknown` bucket (malformed/missing `output_schema` or non-boolean `additionalProperties`) triggers warnings.

**Malformed values:** Five frozen warning reason codes for the `unknown` bucket:
- `output_schema_field_missing` — no `output_schema` key on the capability
- `output_schema_field_not_object` — `output_schema` is not a plain non-null object
- `output_schema_type_missing_or_invalid` — `output_schema.type` is missing, null, or not a string
- `output_schema_additional_properties_missing_when_type_is_object` — `output_schema.type === 'object'` but `additionalProperties` key absent
- `output_schema_additional_properties_not_boolean_when_type_is_object` — `output_schema.type === 'object'` and `additionalProperties` present but not a boolean (includes schema-as-`additionalProperties`)

**No-walking rules:** Per-nested-property `additionalProperties` under `properties.x.additionalProperties` is NOT walked (reserved for `M-Strictness-Per-Property-1`); `output_schema.items.additionalProperties` for array-of-object items is NOT walked (reserved for `M-Strictness-Items-Object-1`); `input_schema.additionalProperties` strictness is reserved for `M-Strictness-Input-Schema-1`.

**Bucket iteration order:** `strict → permissive → not_applicable → unknown` (closed-then-open boolean enumeration, falsy-first in JavaScript convention — deterministic stable-output convention only; NOT security-blast-radius-ranked, NOT strictness-precedence-ranked, NOT contract-quality-ranked, NOT tool-generation-safety-ranked).

**Within-bucket ordering:** Capabilities appear in manifest declared order.

**Case-sensitive `--strictness` filter:** Only lowercase values match. `--strictness STRICT` exits 1 with `Unknown output schema strictness: STRICT`.

**Non-persistence:** `output_schema_strictness` is reviewer-aid metadata only and is NEVER persisted into `tusq.manifest.json`. The manifest is read-only during `tusq strictness index` — mtime, SHA-256, and all `capability_digest` values are byte-identical before and after the command.

**Orthogonality summary:** M40 = how many properties (numeric tier); M42 = what top-level type (categorical primitive); M45 = what items type for array responses (categorical locus); M46 = is the object-typed response schema strict or permissive (boolean strictness gate). These four axes are independent aggregation dimensions on the same `output_schema` field.

### Path Segment Count Tier Index

The `tusq path index` command (M41) derives a per-tier capability breakdown from each capability's `path` URL string field, as populated by the M11/M14 route-extraction pipeline from Express `app.<verb>(<path>, ...)` literals, Fastify route `url` strings, and equivalent framework adapters.

**Tier function** (thresholds `0/2/4/5` are immutable):

| Tier | Condition |
|------|-----------|
| `none` | `path.split('/').filter(Boolean).length === 0` (path is `"/"`) |
| `low` | `1 <= count <= 2` (e.g., `/users`, `/api/users`) |
| `medium` | `3 <= count <= 4` (e.g., `/api/v1/users`, `/api/v1/users/:id`) |
| `high` | `count >= 5` (e.g., `/api/v1/orgs/:orgId/projects`) |
| `unknown` | `path` missing/null/not-a-string, empty string, no leading `/`, or contains an empty interior segment after `split('/')` |

**Path-parameter rule:** `:id`-style path parameters count as one segment each. No special unwrapping or downscaling is performed. `/api/v1/users/:id` has 4 segments and lands in `medium`.

**Malformed values:** When a capability's `path` field is malformed, a `Warning: capability '<name>' has malformed path (<reason>)` is emitted to stderr (human mode) or recorded in `warnings[]` (JSON mode). Five frozen reason codes:
- `path_field_missing` — no `path` key on the capability
- `path_field_not_string` — `path` is not a string
- `path_field_empty_string` — `path` is an empty string
- `path_field_does_not_start_with_forward_slash` — `path` does not begin with `/`
- `path_field_contains_empty_interior_segment` — `path` contains `//` or ends with a trailing `/` other than the root path `"/"`

**Bucket iteration order:** `none → low → medium → high → unknown` (closed-enum deterministic stable-output convention only — NOT sprawl-risk-ranked, NOT blast-radius-ranked, NOT depth-ranked, NOT operator-visibility-ranked).

**Within-bucket ordering:** Capabilities appear in manifest declared order.

**Case-sensitive `--tier` filter:** Only lowercase values match. `--tier HIGH` exits 1 with `Unknown path segment count tier: HIGH`.

**Non-persistence:** `path_segment_count_tier` is reviewer-aid metadata only and is NEVER persisted into `tusq.manifest.json`. The manifest is read-only during `tusq path index` — mtime, SHA-256, and all `capability_digest` values are byte-identical before and after the command.

## Examples Count Tier Index (V1.19)

Starting with M38, `tusq examples index` emits a static, read-only capability index grouped by a derived `examples_count_tier` bucket. The tier is computed at read-time from the cardinality of the `examples[]` array already present in each capability (M11-derived); it is **never written back into `tusq.manifest.json`**.

| `capability.examples` condition | Derived tier |
|---------------------------------|--------------|
| Valid array, length === 0 | `none` |
| Valid array, 1 ≤ length ≤ 2 | `low` |
| Valid array, 3 ≤ length ≤ 5 | `medium` |
| Valid array, length ≥ 6 | `high` |
| Missing / null / not-an-array / contains null/array/non-object element | `unknown` |

**Closed five-value `examples_count_tier` enum:** `none | low | medium | high | unknown`. Any addition is a material governance event.

**Closed two-value `aggregation_key` enum:** `tier` (named buckets) | `unknown` (zero-evidence catchall). Any addition is a material governance event.

**Bucket iteration order:** `none → low → medium → high → unknown`. This is a stable-output convention only — NOT a documentation-quality ranking, NOT a documentation-completeness gate.

**Warnings:** When a capability lands in the `unknown` bucket due to malformed `examples` field data, a warning is emitted. In `--json` mode, warnings appear as `{ capability, reason }` objects in `warnings[]`. Frozen warning reason codes: `examples_field_missing`, `examples_field_not_array`, `examples_array_contains_null_element`, `examples_array_contains_array_element`, `examples_array_contains_non_object_element`.

**Case-sensitive `--tier` filter:** Lowercase canonical values only. `HIGH` exits 1 with `Unknown examples count tier: HIGH`. A valid-but-absent tier exits 1 with `No capabilities found for examples count tier: <tier>`.

**Non-persistence rule (Constraint 31):** `examples_count_tier` MUST NOT appear as a key on any capability object inside `tusq.manifest.json`. It is a derived, ephemeral label that exists only in the index output. `tusq compile`, `tusq serve`, and all other commands are byte-identical before and after any `tusq examples index` invocation.

**Framing boundary:** `tusq examples index` is a planning aid only. It does NOT validate API documentation completeness at runtime, does NOT enforce that all capabilities have examples, does NOT certify documentation quality, and does NOT alter M11's `examples[]` extraction rules. The `examples[]` array remains the M11-derived source — M38 only groups it into planning buckets by array length.

## Examples and constraints (V1)

`examples` and `constraints` are part of the manifest in `v0.1.0` so downstream tooling can keep governance and usage context stable.

- `examples` defaults to a single placeholder entry with a describe-only note.
- `constraints` defaults to:

```json
{
  "rate_limit": null,
  "max_payload_bytes": null,
  "required_headers": [],
  "idempotent": null,
  "cacheable": null
}
```

Both fields can be manually edited in `tusq.manifest.json`, and `tusq compile` preserves those values into `tusq-tools/*.json` and MCP `tools/call`.

## Redaction and approval metadata (V1)

- `redaction` defaults to:

```json
{
  "pii_fields": [],
  "pii_categories": [],
  "log_level": "full",
  "mask_in_traces": false,
  "retention_days": null
}
```

- `approved_by` and `approved_at` default to `null`.
- `tusq compile` gates only on `approved: true`; approval metadata remains manifest-only audit context.
- `redaction` propagates to compiled tools and MCP `tools/call` so runtime consumers can apply masking/retention policy.

### PII Field-Name Redaction Hints (V1.6)

`tusq manifest` automatically populates `redaction.pii_fields` by matching each `input_schema.properties` key name against a frozen canonical set of well-known PII field names. This is a pure, zero-dependency, in-memory extraction — no AST parsing, no value inspection, no network I/O.

**Normalization rule:** each key is normalized with `toLowerCase()` then stripping `_` and `-`. The normalized form is looked up as a whole key in the canonical set. Substring and tail matches are forbidden.

- `user_email` → normalizes to `useremail` → **matches** (in canonical set)
- `email_template_id` → normalizes to `emailtemplateid` → **does NOT match** (not in canonical set)
- Original casing is preserved in the output: `user_email` stays `user_email`, not `useremail`.

**Canonical V1.6 set (36 normalized names, 9 categories):**

| Category | Canonical names |
|----------|----------------|
| Email | `email`, `emailaddress`, `useremail` |
| Phone | `phone`, `phonenumber`, `mobile`, `mobilephone`, `telephone` |
| Government ID | `ssn`, `socialsecuritynumber`, `taxid`, `nationalid` |
| Name | `firstname`, `lastname`, `fullname`, `middlename` |
| Address | `streetaddress`, `zipcode`, `postalcode` |
| Date of birth | `dateofbirth`, `dob`, `birthdate` |
| Payment | `creditcard`, `cardnumber`, `cvv`, `cvc`, `bankaccount`, `iban` |
| Secrets | `password`, `passphrase`, `apikey`, `accesstoken`, `refreshtoken`, `authtoken`, `secret` |
| Network | `ipaddress` |

**Invariants:**
- `sensitivity_class` is NOT auto-escalated — it stays `"unknown"` in V1.6 regardless of `pii_fields` content.
- `log_level`, `mask_in_traces`, and `retention_days` are NOT auto-populated.
- Applies uniformly to Express, Fastify, and NestJS capabilities.
- V1.6 canonical list is frozen. Any expansion requires its own ROADMAP milestone with a re-approval expectation.

**This is a source-literal name hint, NOT runtime PII detection.** A `pii_fields` entry means the field's normalized name matches a canonical name. It does NOT prove the field carries PII at runtime, does NOT imply GDPR/HIPAA/PCI compliance, and must not be described as "PII detection" or "PII-validated." Final redaction posture remains the reviewer's responsibility.

### PII Field-Name Category Labels (V1.7)

`tusq manifest` also populates `redaction.pii_categories`. This array is parallel to `redaction.pii_fields`: it has the same length, the same order, and one category label for each matched field-name entry.

Example:

```json
{
  "pii_fields": ["email", "password", "credit_card"],
  "pii_categories": ["email", "secrets", "payment"],
  "log_level": "full",
  "mask_in_traces": false,
  "retention_days": null
}
```

If `pii_fields` is empty, `pii_categories` is `[]` (never absent).

**Canonical V1.7 category keys:**

| Category key | Source canonical names |
|--------------|------------------------|
| `email` | `email`, `emailaddress`, `useremail` |
| `phone` | `phone`, `phonenumber`, `mobile`, `mobilephone`, `telephone` |
| `government_id` | `ssn`, `socialsecuritynumber`, `taxid`, `nationalid` |
| `name` | `firstname`, `lastname`, `fullname`, `middlename` |
| `address` | `streetaddress`, `zipcode`, `postalcode` |
| `date_of_birth` | `dateofbirth`, `dob`, `birthdate` |
| `payment` | `creditcard`, `cardnumber`, `cvv`, `cvc`, `bankaccount`, `iban` |
| `secrets` | `password`, `passphrase`, `apikey`, `accesstoken`, `refreshtoken`, `authtoken`, `secret` |
| `network` | `ipaddress` |

**What V1.7 does NOT do:**

- It does not inspect values or execute application code.
- It does not fetch dictionaries or use a compliance/PII library.
- It does not auto-set `sensitivity_class`.
- It does not auto-populate `log_level`, `mask_in_traces`, or `retention_days`; existing defaults remain `"full"`, `false`, and `null` unless a reviewer edits them.
- It does not enforce retention in `tusq serve` or `tusq policy verify --strict`.
- It does not prove GDPR/HIPAA/PCI compliance.

**This is a source-literal category label, NOT runtime retention-policy enforcement.** A `pii_categories` entry only labels the canonical category that produced the matching `pii_fields` entry. Use it as reviewer evidence when deciding masking, logging, and retention policy manually.

## Version history and digests (V1)

- `manifest_version` increments each time `tusq manifest` regenerates the file.
- `previous_manifest_hash` stores the SHA-256 hash of the full previous manifest bytes.
- `capability_digest` is a per-capability SHA-256 digest over content fields.
- `capability_digest` excludes `approved`, `approved_by`, `approved_at`, `review_needed`, and the digest field itself.
- Version-history fields are manifest-only metadata. They do not propagate to compiled tools or MCP `tools/list` / `tools/call`.

## Manifest diffs and review queues (V1)

`tusq diff` compares two manifest files without changing either file:

```bash
tusq diff --from old.manifest.json --to tusq.manifest.json --review-queue
```

Capabilities are matched by `name`.

- Present only in `--to`: `added`
- Present only in `--from`: `removed`
- Present in both with different `capability_digest`: `changed`
- Present in both with the same `capability_digest`: `unchanged`

The review queue includes added capabilities, changed capabilities, unapproved capabilities, and capabilities with `review_needed: true`. `--fail-on-unapproved-changes` exits non-zero when added or changed capabilities are not approved or still require review.

This is a local manifest-file comparison. It does not maintain a history store, read manifests from git, or automatically invalidate approvals during `tusq manifest`.

## Approval flow

V1 approval is explicit and repo-local.

1. Run `tusq manifest`.
2. Inspect `tusq.manifest.json` and `tusq review`.
3. Run `tusq approve <capability-name> --reviewer <id>` for one capability, or `tusq approve --all --reviewer <id>` to approve all unapproved or review-needed capabilities.
4. Run `tusq compile` to emit only approved capabilities.

`tusq approve` sets `approved: true`, clears `review_needed`, and records `approved_by` plus `approved_at`. Use `--dry-run` before writing and `--json` for automation-friendly output.

## Domain Index

The `domain` field on each capability drives per-domain bucketing in `tusq domain index`. The command groups capabilities by their declared `domain` value in manifest first-appearance order and emits a per-domain index with name-and-counters fields only.

**How bucketing works:**

| `domain` field value | Bucket |
|----------------------|--------|
| A non-empty string (e.g. `"users"`, `"billing"`) | Named domain bucket with `aggregation_key: "domain"` |
| `null`, missing, or empty-string | Zero-evidence `unknown` bucket with `aggregation_key: "unknown"` |

The `unknown` bucket is always appended last in the output, regardless of where the first domainless capability appears in the manifest. The ordering of named domain buckets follows the manifest's `capabilities[]` first-appearance order — never alphabetized.

**What domain index reads and what it never does:**

- Reads: `capability.domain`, `capability.name`, `capability.approved`, `capability.side_effect_class`, `capability.sensitivity_class`, `capability.auth_requirements.auth_scheme`.
- Never modifies the manifest. Never flips `capability_digest`. Never writes to `.tusq/`.
- `tusq domain index` is a planning aid only — it does NOT generate skill packs, rollout plans, workflow definitions, or agent personas.

```bash
# View domain index
tusq domain index

# Filter to a single domain
tusq domain index --domain users

# View the zero-evidence bucket
tusq domain index --domain unknown

# Machine-readable JSON
tusq domain index --json
```

## Side-Effect Index

The `side_effect_class` field on each capability drives per-bucket aggregation in `tusq effect index`. The command groups capabilities by their declared `side_effect_class` value in a deterministic closed-enum order and emits a per-bucket index with name-and-counters fields only.

**How bucketing works:**

| `side_effect_class` field value | Bucket | `aggregation_key` |
|---------------------------------|--------|-------------------|
| `"read"` | `read` bucket | `"class"` |
| `"write"` | `write` bucket | `"class"` |
| `"destructive"` | `destructive` bucket | `"class"` |
| `null`, missing, empty-string, or any other value | Zero-evidence `unknown` bucket | `"unknown"` |

**Bucket iteration order:** `read → write → destructive → unknown` (closed-enum order). This is distinct from M31's domain-index first-appearance rule — M32 buckets on a closed enum, so the output order is globally deterministic regardless of the order capabilities appear in the manifest. The `unknown` bucket is always appended last. Empty buckets do not appear.

**Within each bucket:** Capability names appear in manifest declared order (NOT alphabetized), mirroring M31.

**What side-effect index reads and what it never does:**

- Reads: `capability.side_effect_class`, `capability.name`, `capability.approved`, `capability.sensitivity_class`, `capability.auth_requirements.auth_scheme`.
- Never modifies the manifest. Never flips `capability_digest`. Never writes to `.tusq/`.
- `tusq effect index` is a planning aid only — it does NOT enforce side-effect policy at runtime, does NOT derive a composite risk tier, does NOT generate confirmation flows, does NOT certify destructive-action safety, and does NOT alter the M30 `gated_reason: destructive_side_effect` surface-eligibility rule.

```bash
# View side-effect index
tusq effect index

# Filter to a single class
tusq effect index --effect destructive

# View the zero-evidence bucket
tusq effect index --effect unknown

# Machine-readable JSON
tusq effect index --json
```

## Sensitivity Index

The `sensitivity_class` field on each capability (derived by the M28 classifier) drives per-bucket aggregation in `tusq sensitivity index`. The command groups capabilities by their `sensitivity_class` value in a deterministic closed-enum order and emits a per-bucket index with name-and-counters fields only.

**How bucketing works:**

| `sensitivity_class` field value | Bucket | `aggregation_key` |
|---------------------------------|--------|-------------------|
| `"public"` | `public` bucket | `"class"` |
| `"internal"` | `internal` bucket | `"class"` |
| `"confidential"` | `confidential` bucket | `"class"` |
| `"restricted"` | `restricted` bucket | `"class"` |
| `null`, missing, empty-string, or any other value | Zero-evidence `unknown` bucket | `"unknown"` |

**Bucket iteration order:** `public → internal → confidential → restricted → unknown` (closed-enum order). This is distinct from M31's domain-index first-appearance rule — M33 buckets on a closed enum (the M28 `SENSITIVITY_CLASSES` constant), so the output order is globally deterministic regardless of the order capabilities appear in the manifest. The `unknown` bucket is always appended last. Empty buckets do not appear.

**Within each bucket:** Capability names appear in manifest declared order (NOT alphabetized), mirroring M31 and M32.

**What sensitivity index reads and what it never does:**

- Reads: `capability.sensitivity_class`, `capability.name`, `capability.approved`, `capability.side_effect_class`, `capability.auth_requirements.auth_scheme`.
- Never modifies the manifest. Never flips `capability_digest`. Never writes to `.tusq/`.
- Never modifies the M28 `sensitivity_class` derivation rules. Never alters the M30 `gated_reason: restricted_sensitivity` or `gated_reason: confidential_sensitivity` surface-eligibility rules.
- `tusq sensitivity index` is a planning aid only — it does NOT enforce sensitivity policy at runtime, does NOT enforce data-class access control, does NOT certify GDPR/HIPAA/SOC2/PCI compliance, does NOT generate retention policy, and does NOT derive a composite risk tier.

```bash
# View sensitivity index
tusq sensitivity index

# Filter to a single class
tusq sensitivity index --sensitivity confidential

# View the zero-evidence bucket
tusq sensitivity index --sensitivity unknown

# Machine-readable JSON
tusq sensitivity index --json
```

## HTTP Method Index

The `method` field on each capability (emitted verbatim by the scanner since M1 with the value as declared in the source route, e.g., `"GET"`, `"POST"`, `"DELETE"`) drives per-bucket aggregation in `tusq method index`. The command groups capabilities by their `method` value in a deterministic closed-enum order and emits a per-bucket index with name-and-counters fields only.

**How bucketing works:**

| `method` field value | Bucket | `aggregation_key` |
|----------------------|--------|-------------------|
| `"GET"` | `GET` bucket | `"method"` |
| `"POST"` | `POST` bucket | `"method"` |
| `"PUT"` | `PUT` bucket | `"method"` |
| `"PATCH"` | `PATCH` bucket | `"method"` |
| `"DELETE"` | `DELETE` bucket | `"method"` |
| `null`, missing, empty-string, `"HEAD"`, `"OPTIONS"`, `"TRACE"`, `"CONNECT"`, or any non-canonical value | Zero-evidence `unknown` bucket | `"unknown"` |

**Bucket iteration order:** `GET → POST → PUT → PATCH → DELETE → unknown` (closed-enum order). This is distinct from M31's domain-index first-appearance rule — M34 buckets on a closed enum (the five canonical REST verbs), so the output order is globally deterministic regardless of the order capabilities appear in the manifest. The `unknown` bucket is always appended last. Empty buckets do not appear.

**Important:** The iteration order (`GET → POST → PUT → PATCH → DELETE`) matches the conventional REST CRUD reading order (GET=read, POST=create, PUT=replace, PATCH=update, DELETE=delete) but carries **no risk semantic**. It is a stable-output convention only — docs, README, CLI help, and launch artifacts MUST NOT describe it as "low-to-high risk," "destructive-ascending," "safety-ordered," or any phrase implying risk semantics.

**Within each bucket:** Capability names appear in manifest declared order (NOT alphabetized), mirroring M31, M32, and M33.

**Case-sensitive `--method` filter:** The `--method` filter matches verbatim against the closed-enum values. Lowercase values like `get` or `delete` exit 1 with `Unknown method: <value>` — do not silently coerce case. The manifest's `method` field is emitted verbatim uppercase by the scanner; reviewer scripts should use uppercase filter values consistently.

**What HTTP method index reads and what it never does:**

- Reads: `capability.method`, `capability.name`, `capability.approved`, `capability.side_effect_class`, `capability.auth_requirements.auth_scheme`.
- Never modifies the manifest. Never flips `capability_digest`. Never writes to `.tusq/`.
- Never modifies the M32 `side_effect_class` derivation rules (which use `method` as one of several inputs). Never alters the M30 `gated_reason: destructive_side_effect` surface-eligibility rule.
- `tusq method index` is a planning aid only — it does NOT route HTTP methods at runtime, does NOT validate REST conventions (idempotency, safety, cacheability), does NOT certify idempotency class, does NOT automatically classify destructive verbs (DELETE appearing in the index is a bucket label, not a destructive-side-effect attestation), and does NOT derive a composite risk tier.

```bash
# View HTTP method index
tusq method index

# Filter to a single method (case-sensitive uppercase)
tusq method index --method DELETE

# View the zero-evidence bucket
tusq method index --method unknown

# Machine-readable JSON
tusq method index --json
```

## Auth Scheme Index

The `auth_requirements.auth_scheme` field on each capability (emitted by the M29 auth-requirements classifier with one of the seven closed-enum values) drives per-bucket aggregation in `tusq auth index`. The command groups capabilities by their `auth_scheme` value in a deterministic closed-enum order and emits a per-bucket index with name-and-counters fields only.

**How bucketing works:**

| `auth_requirements.auth_scheme` value | Bucket | `aggregation_key` |
|---------------------------------------|--------|-------------------|
| `"bearer"` | `bearer` bucket | `"scheme"` |
| `"api_key"` | `api_key` bucket | `"scheme"` |
| `"session"` | `session` bucket | `"scheme"` |
| `"basic"` | `basic` bucket | `"scheme"` |
| `"oauth"` | `oauth` bucket | `"scheme"` |
| `"none"` | `none` bucket | `"scheme"` |
| `"unknown"`, missing `auth_requirements`, null/missing `auth_scheme`, or any non-canonical value | `unknown` bucket | `"unknown"` |

**Bucket iteration order:** `bearer → api_key → session → basic → oauth → none → unknown` (closed-enum order). The `unknown` bucket is always appended last. Empty buckets do not appear.

**Important:** The iteration order mirrors the M29 AUTH_SCHEMES decision table ordering but carries **no IAM-strength semantic**. It is a stable-output convention only — docs, README, CLI help, and launch artifacts MUST NOT describe it as "strength-ordered," "trust-ranked," "security-ascending," or any phrase implying security or trust semantics.

**Within each bucket:** Capability names appear in manifest declared order (NOT alphabetized), mirroring M31, M32, M33, and M34.

**Case-sensitive `--scheme` filter:** The `--scheme` filter matches verbatim against the closed-enum values. Uppercase values like `BEARER` exit 1 with `Unknown auth scheme: BEARER` — do not silently coerce case. The manifest's `auth_scheme` field uses verbatim lowercase values; reviewer scripts should use lowercase filter values consistently.

**Per-bucket cross-axis flags:**
- `has_destructive_side_effect` — true if any capability in the bucket has `side_effect_class === "destructive"`. Useful for spotting whether the `none` or `unknown` auth bucket contains destructive capabilities.
- `has_restricted_or_confidential_sensitivity` — true if any capability in the bucket has `sensitivity_class === "restricted"` or `sensitivity_class === "confidential"`. Useful for spotting the highest-attention combination (low/unknown auth + high sensitivity).

**What auth scheme index reads and what it never does:**

- Reads: `capability.auth_requirements.auth_scheme`, `capability.name`, `capability.approved`, `capability.side_effect_class`, `capability.sensitivity_class`.
- Never modifies the manifest. Never flips `capability_digest`. Never writes to `.tusq/`.
- Never modifies M29's `auth_scheme` derivation rules. Never alters the M30 surface-plan gating rules.
- `tusq auth index` is a planning aid only — it does NOT enforce authentication at runtime, does NOT validate OAuth/OIDC tokens, does NOT certify SOC2/GDPR/HIPAA compliance, does NOT generate auth adapters, and does NOT derive IAM posture.

```bash
# View auth scheme index
tusq auth index

# Filter to a single scheme (case-sensitive lowercase)
tusq auth index --scheme bearer

# View capabilities with no auth (or unknown auth)
tusq auth index --scheme none
tusq auth index --scheme unknown

# Machine-readable JSON
tusq auth index --json
```

## Regeneration behavior

When you regenerate a manifest, previously approved capabilities are preserved by method+path key when possible.
