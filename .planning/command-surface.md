# Site Surface — tusq.dev Docs & Website Platform

### M48: Output Schema First Property Type Index — Product CLI Surface

**Status:** Shipped in `run_f61946531dda2fe6` / `turn_7aca0e4acba46509` (dev implementation). V1.29.

**Commands:**

| Command | Description |
|---------|-------------|
| `tusq shape` | Top-level noun dispatcher — prints subcommand help |
| `tusq shape index` | Emit a per-bucket capability index from `output_schema.properties[Object.keys[0]].type` when `output_schema.type === 'object'` |

**Flags:**

| Flag | Default | Effect |
|------|---------|--------|
| `--first-type <value>` | (all buckets) | Filter output to a single first-property-type bucket; case-sensitive lowercase-only; exits 1 if value not in closed nine-value enum or if bucket is absent |
| `--manifest <path>` | `tusq.manifest.json` | Path to the manifest file |
| `--out <path>` | (stdout) | Write index to file; stdout is empty on success; `.tusq/` paths rejected |
| `--json` | (human text) | Emit machine-readable JSON including `first_property_types[]` and `warnings[]` |

**Bucket-key enum (closed nine-value):**

| Key | Meaning |
|-----|---------|
| `string` | `properties[firstKey].type === 'string'` |
| `number` | `properties[firstKey].type === 'number'` |
| `integer` | `properties[firstKey].type === 'integer'` |
| `boolean` | `properties[firstKey].type === 'boolean'` |
| `null` | `properties[firstKey].type === 'null'` |
| `object` | `properties[firstKey].type === 'object'` (nested structural) |
| `array` | `properties[firstKey].type === 'array'` (nested list) |
| `not_applicable` | `output_schema.type !== 'object'` OR zero-property object (NO warning) |
| `unknown` | Malformed `output_schema` or invalid first-property descriptor (warning emitted) |

**Aggregation-key enum (closed three-value):** `first_property_type` (seven primitive buckets) | `not_applicable` | `unknown`

**Bucket iteration order:** `string → number → integer → boolean → null → object → array → not_applicable → unknown` (scalar-primitives-first → null → structural-primitives → exits; NOT SDK-complexity-ranked)

**Per-bucket entry shape (frozen 8 fields):** `output_schema_first_property_type`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`

**CLI surface growth:** 31 → 32 commands. `shape` inserted alphabetically between `sensitivity` and `strictness` (`s`=`s`, `e`(101)<`h`(104)<`t`(116) at position 1).

**Local-only invariants:** Non-persistence (`output_schema_first_property_type` never written to manifest); all 18 peer index commands byte-identical pre/post; manifest mtime unchanged.

### M47: Input Schema Property Count Tier Index — Product CLI Surface

**Status:** Shipped in `run_240679669ee78f0b` / `turn_cc1f4a9f48f528e8` (dev implementation). V1.28.

**Commands:**

| Command | Description |
|---------|-------------|
| `tusq parameter index` | Emit a per-tier capability index from `input_schema.properties` Object.keys cardinality |
| `tusq parameter index --help` | Print command help |

**Flags:**

| Flag | Default | Effect |
|------|---------|--------|
| `--tier <value>` | all tiers | Filter to single bucket (case-sensitive lowercase) |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file (suppresses stdout) |
| `--json` | human text | Emit machine-readable JSON |

**Bucket-key enum** (closed five-value; immutable; matches M40 verbatim):

| Value | Condition |
|-------|-----------|
| `none` | `Object.keys(input_schema.properties).length === 0` |
| `low` | `1 <= length <= 2` |
| `medium` | `3 <= length <= 5` |
| `high` | `length >= 6` |
| `unknown` | malformed `input_schema` or `input_schema.properties` |

**Aggregation_key enum** (closed two-value; immutable; matches M40 verbatim): `tier` (named buckets) | `unknown`

**Bucket iteration order:** `none → low → medium → high → unknown` (ascending-numeric-tier convention — NOT parameter-sprawl-precedence-ranked, NOT complexity-blast-radius-ranked, NOT tool-generation-difficulty-ranked, NOT review-burden-priority-ranked)

**Per-bucket entry shape** (8 fields): `input_schema_property_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`

**`--json` top-level shape:** `{ manifest_path, manifest_version, generated_at, tiers[], warnings[] }`. `warnings[]` always present (empty `[]` when no malformed capabilities).

**Failure UX:**

| Condition | Exit | Stderr |
|-----------|------|--------|
| `--tier NONE` (uppercase) | 1 | `Unknown input schema property count tier: NONE` |
| `--tier xyz` (invalid) | 1 | `Unknown input schema property count tier: xyz` |
| `--tier medium` absent bucket | 1 | `No capabilities found for input schema property count tier: medium` |
| `--tier` no value | 1 | `Missing value for --tier` |
| `--unknown-flag` | 1 | `Unknown flag: --unknown-flag` |
| Manifest not found | 1 | `Manifest not found: <path>` |
| Malformed manifest JSON | 1 | `Invalid manifest JSON: <path>` |
| Missing capabilities array | 1 | `Invalid manifest: missing capabilities array` |
| `--out .tusq/` path | 1 | `--out path must not be inside .tusq/` |

**Local-only invariants:**
- `input_schema_property_count_tier` MUST NOT be written into `tusq.manifest.json`
- Manifest mtime byte-identical pre/post; `tusq compile` byte-identical pre/post
- Nested properties (`input_schema.properties[].properties`) NOT walked (reserved for `M-Parameter-Nested-Properties-1`)
- `required ∩ properties` intersection NOT computed (reserved for `M-Parameter-Required-Property-Count-1`)
- CLI surface: 30 → 31. New noun `parameter` between `output` and `path`
- Distinct from M39 (`tusq input index` — counts `required[]` length); orthogonal to M40 (`tusq output index` — output side); orthogonal to M43 (`tusq request index` — categorical source classification)

---

### M46: Output Schema Strictness Index — Product CLI Surface

**Status:** Shipped in `run_7c4036f0eba4cde3` / `turn_c5d62ccd1c2a4bcd` (dev implementation). V1.27.

| Command | Shape |
|---------|-------|
| `tusq strictness` | `tusq strictness <subcommand>` |
| `tusq strictness index` | `tusq strictness index [--strictness <value>] [--manifest <path>] [--out <path>] [--json]` |

| Flag | Default | Notes |
|------|---------|-------|
| `--strictness <strict\|permissive\|not_applicable\|unknown>` | all buckets | Case-sensitive lowercase only; unknown value → exit 1 |
| `--manifest <path>` | `tusq.manifest.json` in cwd | Manifest file to read |
| `--out <path>` | stdout | Write to file; no stdout on success; `.tusq/` prefix rejected |
| `--json` | human text | Machine-readable JSON (includes `warnings[]`) |

| Bucket key | Aggregation key | Condition |
|------------|----------------|-----------|
| `strict` | `strictness` | `output_schema.type === 'object'` AND `additionalProperties === false` |
| `permissive` | `strictness` | `output_schema.type === 'object'` AND `additionalProperties === true` |
| `not_applicable` | `not_applicable` | `output_schema.type` is string but not `'object'` (no warning) |
| `unknown` | `unknown` | `output_schema` missing/malformed, `type` non-string, or non-boolean `additionalProperties` |

| aggregation_key value | Meaning |
|----------------------|---------|
| `strictness` | capability is object-typed with valid boolean `additionalProperties` |
| `not_applicable` | capability is NOT object-typed |
| `unknown` | `output_schema` or `additionalProperties` is missing/malformed |

**Tier function** reading `output_schema.additionalProperties` boolean only:
1. `output_schema` null/undefined/missing/non-object/array → `unknown` (reason: `output_schema_field_missing` or `output_schema_field_not_object`)
2. `output_schema.type` missing/non-string → `unknown` (reason: `output_schema_type_missing_or_invalid`)
3. `output_schema.type` is string but not `'object'` → `not_applicable` (no warning)
4. `output_schema.type === 'object'` AND `additionalProperties` absent → `unknown` (reason: `output_schema_additional_properties_missing_when_type_is_object`)
5. `output_schema.type === 'object'` AND `additionalProperties` present but non-boolean → `unknown` (reason: `output_schema_additional_properties_not_boolean_when_type_is_object`)
6. `output_schema.type === 'object'` AND `additionalProperties === false` → `strict`
7. `output_schema.type === 'object'` AND `additionalProperties === true` → `permissive`

**Per-bucket entry shape (8 fields):** `output_schema_strictness`, `aggregation_key`, `capability_count`, `capabilities[]` (manifest order), `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`.

**Bucket iteration order:** `strict → permissive → not_applicable → unknown` (closed-then-open boolean enumeration, falsy-first; NOT security-blast-radius-ranked, NOT strictness-precedence-ranked). Empty buckets absent.

**Default-preservation:** All 29 prior commands (`init, scan, manifest, compile, serve, review, docs, approve, auth, confidence, description, diff, domain, effect, examples, input, items, method, output, path, pii, policy, redaction, request, response, sensitivity, surface, version, help`) retain byte-identical stdout/stderr/exit-code behavior. CLI surface: 29 → 30.

**Failure UX:**
- `Unknown output schema strictness: <value>` → stderr, exit 1 (case-sensitive filter; `STRICT` and `Permissive` both fail)
- `No capabilities found for output schema strictness: <value>` → stderr, exit 1 (absent bucket)
- `Unknown flag: --<flag>` → stderr, exit 1
- `Manifest not found: <path>` → stderr, exit 1
- `Invalid manifest JSON: <path>` → stderr, exit 1
- `Invalid manifest: missing capabilities array` → stderr, exit 1
- `--out path must not be inside .tusq/` → stderr, exit 1
- `Cannot write to --out path: <path>` → stderr, exit 1
- `Warning: capability '<name>' has malformed output_schema strictness (<reason>)` → stderr (human); `warnings[]` entry (`--json`)

**Local-only invariants:**
- `tusq.manifest.json` mtime + SHA-256 + per-capability `capability_digest` byte-identical before/after run
- `output_schema_strictness` NOT written into `tusq.manifest.json`
- `tusq compile`, `tusq surface plan`, `tusq domain index`, `tusq effect index`, `tusq sensitivity index`, `tusq method index`, `tusq auth index`, `tusq confidence index`, `tusq pii index`, `tusq examples index`, `tusq input index`, `tusq output index`, `tusq path index`, `tusq response index`, `tusq request index`, `tusq description index`, `tusq items index` all byte-identical before/after `tusq strictness index` run

### M45: Output Schema Items Type Index — Product CLI Surface

| Command | Shape |
|---------|-------|
| `tusq items` | `tusq items <subcommand>` |
| `tusq items index` | `tusq items index [--items-type <value>] [--manifest <path>] [--out <path>] [--json]` |

| Flag | Default | Notes |
|------|---------|-------|
| `--items-type <value>` | all types | Case-sensitive lowercase; `OBJECT` exits 1 |
| `--manifest <path>` | `tusq.manifest.json` | Resolved relative to cwd |
| `--out <path>` | stdout | Writes JSON; no stdout on success; rejected if inside `.tusq/` |
| `--json` | human text | Includes `warnings[]` for malformed output_schema/items fields |

| Bucket key | Tier function condition |
|------------|------------------------|
| `object` | `output_schema.type === 'array'` AND `items.type === 'object'` |
| `array` | `output_schema.type === 'array'` AND `items.type === 'array'` |
| `string` | `output_schema.type === 'array'` AND `items.type === 'string'` |
| `number` | `output_schema.type === 'array'` AND `items.type === 'number'` |
| `integer` | `output_schema.type === 'array'` AND `items.type === 'integer'` (NOT collapsed to number) |
| `boolean` | `output_schema.type === 'array'` AND `items.type === 'boolean'` |
| `null` | `output_schema.type === 'array'` AND `items.type === 'null'` |
| `not_applicable` | `output_schema.type` is a string but not `'array'` (emits NO warning) |
| `unknown` | `output_schema` null/non-object/missing; `output_schema.type` non-string; items malformed; items.type outside closed set |

| `aggregation_key` value | When |
|------------------------|------|
| `items_type` | Capability has a named primitive items-type bucket (one of the seven JSON-Schema primitives) |
| `not_applicable` | Capability has `output_schema.type !== 'array'` |
| `unknown` | Capability has malformed/missing `output_schema` or `items` |

| Per-bucket entry field | Type | Notes |
|------------------------|------|-------|
| `output_schema_items_type` | string | One of the nine closed-enum values |
| `aggregation_key` | string | `items_type`, `not_applicable`, or `unknown` |
| `capability_count` | integer | Count of capabilities in bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Count with `approved === true` |
| `gated_count` | integer | Count with `approved !== true` |
| `has_destructive_side_effect` | boolean | true if any cap has `side_effect_class === 'destructive'` |
| `has_restricted_or_confidential_sensitivity` | boolean | true if any cap has `sensitivity_class === 'restricted'` or `'confidential'` |

| Bucket iteration order | Notes |
|-----------------------|-------|
| `object → array → string → number → integer → boolean → null → not_applicable → unknown` | Deterministic stable-output convention only — NOT UI-rendering-precedence-ranked, NOT frontend-blast-radius-ranked |

| Failure condition | Exit | Stderr |
|-------------------|------|--------|
| Manifest not found | 1 | `Manifest file not found: <path>` |
| Manifest not valid JSON | 1 | `Failed to parse manifest JSON: <message>` |
| Manifest missing capabilities | 1 | `Manifest is missing capabilities array` |
| Unknown `--items-type` value | 1 | `Unknown output schema items type: <value>` |
| `--items-type` with no value | 1 | `--items-type requires a value` |
| `--manifest` with no value | 1 | `--manifest requires a value` |
| `--out` with no value | 1 | `--out requires a value` |
| Unknown flag | 1 | `Unknown flag: <flag>` |
| `--out` path inside `.tusq/` | 1 | `--out path must not be inside .tusq/` |
| `--out` parent dir not writable | 1 | `--out parent directory does not exist or is not writable` |

| Local-only invariant | Rule |
|----------------------|------|
| Manifest read-only | mtime + SHA-256 + all `capability_digest` values byte-identical pre/post |
| `tusq compile` idempotent | Byte-identical output before and after `tusq items index` |
| Other index commands idempotent | All 14 existing index commands byte-identical before and after |
| No new dependencies | `package.json` and `package-lock.json` unmodified |
| Non-persistence | `output_schema_items_type` MUST NOT appear in `tusq.manifest.json` after run |

### M44: Description Word Count Tier Index — Product CLI Surface

| Command | Shape |
|---------|-------|
| `tusq description` | `tusq description <subcommand>` |
| `tusq description index` | `tusq description index [--tier <low\|medium\|high\|unknown>] [--manifest <path>] [--out <path>] [--json]` |

| Flag | Default | Notes |
|------|---------|-------|
| `--tier <value>` | all tiers | Case-sensitive lowercase; `LOW` exits 1 |
| `--manifest <path>` | `tusq.manifest.json` | Resolved relative to cwd |
| `--out <path>` | stdout | Writes JSON; no stdout on success; rejected if inside `.tusq/` |
| `--json` | human text | Includes `warnings[]` for malformed description fields |

| Bucket key | Tier function condition |
|------------|------------------------|
| `low` | `description.trim().split(/\s+/u).length <= 7` |
| `medium` | token count 8–14 inclusive |
| `high` | token count >= 15 |
| `unknown` | `description` missing / null / non-string / empty-after-trim |

| `aggregation_key` value | When |
|------------------------|------|
| `tier` | Capability has a named tier bucket (`low`, `medium`, `high`) |
| `unknown` | Capability has missing/null/non-string/empty-after-trim description |

| Per-bucket entry field | Type | Notes |
|------------------------|------|-------|
| `description_word_count_tier` | string | One of the four closed-enum values |
| `aggregation_key` | string | `tier` or `unknown` |
| `capability_count` | integer | Count of capabilities in bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Count with `approved === true` |
| `gated_count` | integer | Count with `approved !== true` |
| `has_destructive_side_effect` | boolean | true if any cap has `side_effect_class === 'destructive'` |
| `has_restricted_or_confidential_sensitivity` | boolean | true if any cap has `sensitivity_class === 'restricted'` or `'confidential'` |

| Bucket iteration order | Notes |
|-----------------------|-------|
| `low → medium → high → unknown` | Deterministic stable-output convention only — NOT doc-quality-ranked, NOT doc-richness-ranked |

| Warning reason code | When emitted |
|--------------------|-------------|
| `description_field_missing` | capability has no `description` field |
| `description_field_not_string` | `description` is present but not a string |
| `description_field_empty_after_trim` | `description` is a string that is empty or whitespace-only after trim |

| Failure condition | Exit | Stderr |
|-------------------|------|--------|
| Manifest not found | 1 | `Manifest file not found: <path>` |
| Manifest not valid JSON | 1 | `Failed to parse manifest JSON: <message>` |
| Manifest missing capabilities | 1 | `Manifest is missing capabilities array` |
| Unknown `--tier` value | 1 | `Unknown description word count tier: <value>` |
| `--tier` with no value | 1 | `--tier requires a value` |
| `--manifest` with no value | 1 | `--manifest requires a value` |
| `--out` with no value | 1 | `--out requires a value` |
| Unknown flag | 1 | `Unknown flag: <flag>` |
| `--out` path inside `.tusq/` | 1 | `--out path must not be inside .tusq/` |
| `--out` parent dir not writable | 1 | `--out parent directory does not exist or is not writable` |

| Local-only invariant | Rule |
|----------------------|------|
| Manifest read-only | mtime + SHA-256 + all `capability_digest` values byte-identical pre/post |
| `tusq compile` idempotent | Byte-identical output before and after `tusq description index` |
| Other index commands idempotent | All 13 existing index commands byte-identical before and after |
| No new dependencies | `package.json` and `package-lock.json` unmodified |

### M43: Input Schema Primary Parameter Source Index — Product CLI Surface

| Command | Shape |
|---------|-------|
| `tusq request` | `tusq request <subcommand>` |
| `tusq request index` | `tusq request index [--source <path\|request_body\|query\|header\|mixed\|none\|unknown>] [--manifest <path>] [--out <path>] [--json]` |

| Flag | Default | Notes |
|------|---------|-------|
| `--source <value>` | all sources | Case-sensitive lowercase; `PATH` exits 1 |
| `--manifest <path>` | `tusq.manifest.json` | Resolved relative to cwd |
| `--out <path>` | stdout | Writes JSON; no stdout on success; rejected if inside `.tusq/` |
| `--json` | human text | Includes `warnings[]` for malformed input_schema fields |

| Bucket key | Source function condition |
|------------|--------------------------|
| `path` | All `input_schema.properties[*].source` === `'path'` (single uniform source) |
| `request_body` | All `input_schema.properties[*].source` === `'request_body'` (single uniform source) |
| `query` | All `input_schema.properties[*].source` === `'query'` (single uniform source) |
| `header` | All `input_schema.properties[*].source` === `'header'` (single uniform source) |
| `mixed` | Properties have multiple distinct source values, all in four-value set |
| `none` | `input_schema.properties` is a valid plain object with zero keys |
| `unknown` | input_schema missing/null/not-object; properties missing/null/not-object; any property source missing/not-string/array/not-in-four-value-set |

| `aggregation_key` value | When |
|------------------------|------|
| `source` | Capability has a named source bucket (`path`, `request_body`, `query`, `header`, `mixed`, `none`) |
| `unknown` | Capability has malformed or missing input_schema or properties field, or invalid source value |

| Per-bucket entry field | Type | Notes |
|------------------------|------|-------|
| `input_schema_primary_parameter_source` | string | One of the seven closed-enum values |
| `aggregation_key` | string | `source` or `unknown` |
| `capability_count` | integer | Count of capabilities in bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Count with `approved === true` |
| `gated_count` | integer | Count with `approved !== true` |
| `has_destructive_side_effect` | boolean | true if any cap has `side_effect_class === 'destructive'` |
| `has_restricted_or_confidential_sensitivity` | boolean | true if any cap has `sensitivity_class === 'restricted'` or `'confidential'` |

| Bucket iteration order | Notes |
|-----------------------|-------|
| `path → request_body → query → header → mixed → none → unknown` | Deterministic stable-output convention only — NOT security-blast-radius-ranked, NOT workflow-criticality-ranked |

| Warning reason code | When emitted |
|--------------------|-------------|
| `input_schema_field_missing` | capability has no `input_schema` field |
| `input_schema_field_not_object` | `input_schema` is present but not a plain object |
| `input_schema_properties_field_missing` | `input_schema` is an object but has no `properties` field |
| `input_schema_properties_field_not_object` | `input_schema.properties` is not a plain object |
| `input_schema_property_source_field_missing_or_invalid` | A property has missing, non-string, array, or unrecognized `source` value |

| Failure condition | Exit | Stderr |
|-------------------|------|--------|
| Manifest not found | 1 | `Manifest not found: <path>` |
| Manifest not valid JSON | 1 | `Manifest is not valid JSON: <path>` |
| Unknown `--source` value | 1 | `Unknown input schema primary parameter source: <value>` |
| `--source` with no value | 1 | `Missing value for --source` |
| Unknown flag | 1 | `Unknown flag: --<flag>` |
| `--out` path inside `.tusq/` | 1 | `Output path must not be inside .tusq/` |

| Local-only invariant | Rule |
|----------------------|------|
| Manifest read-only | mtime + SHA-256 + all `capability_digest` values byte-identical pre/post |
| `tusq compile` idempotent | Byte-identical output before and after `tusq request index` |
| Other index commands idempotent | All 12 existing index commands byte-identical before and after |
| No new dependencies | `package.json` and `package-lock.json` unmodified |

### M42 Charter Sketch Reservation — 2026-04-27, run_f33f485bb7998de9, turn_57c7b57416c90a9f

PM bound **M42: Static Capability Output Schema Top-Level Type Index Export from Manifest Evidence (~0.5 day) — V1.23 (PROPOSED)** in this turn. CLI surface growth: 25 → 26 commands. New top-level noun `response` with single subcommand `index`, inserted alphabetically between `redaction` and `sensitivity` in the post-`docs` block (`redaction` < `response` because `r`=`r`, `e`=`e`, `d` (100) < `s` (115) at position 2; `response` < `sensitivity` because `r` (114) < `s` (115) at position 0). Command shape: `tusq response index [--type <object|array|string|number|boolean|null|unknown>] [--manifest <path>] [--out <path>] [--json]`. Closed seven-value bucket-key enum (`object | array | string | number | boolean | null | unknown`); closed two-value aggregation_key enum (`type | unknown`); literal exact-string tier match against the six JSON Schema 2020-12 spec primitives; case-sensitive lowercase-only `--type` filter; result-array field name `types` (plural, categorical — NOT `tiers`); per-bucket 8-field entry shape (`output_schema_top_level_type`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`); top-level `warnings[]` (only in `--json`, always present even when empty) with five frozen reason codes (`output_schema_field_missing`, `output_schema_field_not_object`, `output_schema_type_field_missing`, `output_schema_type_field_not_string`, `output_schema_type_field_value_not_in_json_schema_primitive_set`); closed-enum bucket iteration order `object → array → string → number → boolean → null → unknown` (deterministic stable-output convention only); read-only invariants (manifest mtime + SHA-256 + every capability_digest byte-identical pre/post; `tusq compile` and the eleven existing index commands byte-identical pre/post); non-persistence rule (`output_schema_top_level_type` MUST NOT be written into `tusq.manifest.json`); orthogonal to M40 (M40 measures top-level property count on `output_schema.properties`; M42 measures top-level primitive type on `output_schema.type` — same field, different axis); `'integer'` bucketed as `unknown` (integer-subset distinction reserved for `M-Output-Type-Integer-Subset-Index-1`); compositional schemas (`oneOf`/`anyOf`/`allOf`) without top-level `type` bucketed as `unknown`; array-of-types (`type: ['object', 'null']`) bucketed as `unknown`. The full Product CLI Surface detail block (two-row command table, four-flag table, bucket-key enum table, aggregation_key enum table, tier-function rules table, per-bucket entry shape table, bucket iteration order table, default-preservation table for the 25 unchanged commands, failure UX table, local-only invariants table) will be materialized in the dev implementation turn before any source code lands; this Reservation block names the charter and freezes the surface decisions for dev to carry forward verbatim.

### M42: Output Schema Top-Level Type Index — Product CLI Surface

| Command | Shape |
|---------|-------|
| `tusq response` | `tusq response <subcommand>` |
| `tusq response index` | `tusq response index [--type <object\|array\|string\|number\|boolean\|null\|unknown>] [--manifest <path>] [--out <path>] [--json]` |

| Flag | Default | Notes |
|------|---------|-------|
| `--type <value>` | all types | Case-sensitive lowercase; `OBJECT` exits 1 |
| `--manifest <path>` | `tusq.manifest.json` | Resolved relative to cwd |
| `--out <path>` | stdout | Writes JSON; no stdout on success; rejected if inside `.tusq/` |
| `--json` | human text | Includes `warnings[]` for malformed output_schema fields |

| Bucket key | Tier function condition |
|------------|------------------------|
| `object` | `output_schema.type === 'object'` |
| `array` | `output_schema.type === 'array'` |
| `string` | `output_schema.type === 'string'` |
| `number` | `output_schema.type === 'number'` |
| `boolean` | `output_schema.type === 'boolean'` |
| `null` | `output_schema.type === 'null'` |
| `unknown` | output_schema missing/null/not-object; type missing/null/not-string; type value not in six-primitive set (incl. `'integer'`); type is an array |

| `aggregation_key` value | When |
|------------------------|------|
| `type` | Capability has one of the six JSON Schema spec primitives as top-level type |
| `unknown` | Capability has malformed or missing output_schema or type field |

| Per-bucket entry field | Type | Notes |
|------------------------|------|-------|
| `output_schema_top_level_type` | string | One of the seven closed-enum values |
| `aggregation_key` | string | `type` or `unknown` |
| `capability_count` | integer | Count of capabilities in bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Count with `approved === true` |
| `gated_count` | integer | Count with `approved !== true` |
| `has_destructive_side_effect` | boolean | true if any cap has `side_effect_class === 'destructive'` |
| `has_restricted_or_confidential_sensitivity` | boolean | true if any cap has `sensitivity_class === 'restricted'` or `'confidential'` |

| Bucket iteration order | Notes |
|-----------------------|-------|
| `object → array → string → number → boolean → null → unknown` | Deterministic stable-output convention only — NOT data-contract-completeness-ranked |

| Warning reason code | When emitted |
|--------------------|-------------|
| `output_schema_field_missing` | capability has no `output_schema` field |
| `output_schema_field_not_object` | `output_schema` is present but not a plain object (null, primitive, array) |
| `output_schema_type_field_missing` | `output_schema` is an object but has no `type` field |
| `output_schema_type_field_not_string` | `output_schema.type` exists but is not a string (e.g. array-of-types) |
| `output_schema_type_field_value_not_in_json_schema_primitive_set` | `output_schema.type` is a string but not one of the six spec primitives (e.g. `'integer'`) |

| Failure scenario | stderr | exit |
|-----------------|--------|------|
| `--manifest` file not found | `Manifest file not found: <path>` | 1 |
| Manifest not valid JSON | `Failed to parse manifest JSON: <msg>` | 1 |
| Manifest missing capabilities | `Manifest is missing capabilities array` | 1 |
| `--type` not in seven-value enum | `Unknown output schema top-level type: <value>` | 1 |
| `--out` inside `.tusq/` | `--out path must not be inside .tusq/` | 1 |
| Unknown flag | `Unknown flag: <flag>` | 1 |
| `--type` with no value | `--type requires a value` | 1 |

| Local-only invariant | Rule |
|---------------------|------|
| Non-persistence | `output_schema_top_level_type` MUST NOT be written into `tusq.manifest.json` |
| Read-only | Manifest mtime + SHA-256 + every `capability_digest` byte-identical pre/post |
| Determinism | Three consecutive runs produce byte-identical stdout |
| No new dependency | Zero new entries in `package.json` / `package-lock.json` |

### M41: Path Segment Count Tier Index — Product CLI Surface

| Command | Shape |
|---------|-------|
| `tusq path` | `tusq path <subcommand>` |
| `tusq path index` | `tusq path index [--tier <none\|low\|medium\|high\|unknown>] [--manifest <path>] [--out <path>] [--json]` |

| Flag | Default | Notes |
|------|---------|-------|
| `--tier <value>` | all tiers | Case-sensitive lowercase; `HIGH` exits 1 |
| `--manifest <path>` | `tusq.manifest.json` | Resolved relative to cwd |
| `--out <path>` | stdout | Writes JSON; no stdout on success; rejected if inside `.tusq/` |
| `--json` | human text | Includes `warnings[]` for malformed path fields |

| Bucket key | Tier function condition |
|------------|------------------------|
| `none` | segment count === 0 (path is `/`) |
| `low` | 1 ≤ count ≤ 2 |
| `medium` | 3 ≤ count ≤ 4 |
| `high` | count ≥ 5 |
| `unknown` | path null/missing/not-string/empty/no-leading-`/`/empty interior segment |

| `aggregation_key` value | When |
|------------------------|------|
| `tier` | Named bucket (none/low/medium/high) |
| `unknown` | Unknown bucket |

| Per-bucket field | Description |
|-----------------|-------------|
| `path_segment_count_tier` | Bucket key |
| `aggregation_key` | `tier` or `unknown` |
| `capability_count` | Number of capabilities in bucket |
| `capabilities[]` | Capability names in manifest declared order |
| `approved_count` | Count where `approved === true` |
| `gated_count` | Count where `approved !== true` |
| `has_destructive_side_effect` | Any capability has `side_effect_class === 'destructive'` |
| `has_restricted_or_confidential_sensitivity` | Any capability has `sensitivity_class === 'restricted'\|'confidential'` |

| Bucket order | Position |
|-------------|---------|
| `none → low → medium → high → unknown` | Deterministic stable-output convention only (NOT sprawl-risk-ranked) |

| Warning reason code | Trigger |
|--------------------|---------|
| `path_field_missing` | `capability.path` absent or null |
| `path_field_not_string` | `capability.path` is not a string |
| `path_field_empty_string` | `capability.path === ''` |
| `path_field_does_not_start_with_forward_slash` | Path is non-empty string not starting with `/` |
| `path_field_contains_empty_interior_segment` | Path contains `//` or trailing `/` (other than `/` itself) |

| Exit code | Condition |
|-----------|-----------|
| 0 | Index produced (including empty-capabilities manifest) |
| 1 | Missing/invalid manifest, unknown flag, unknown tier, `--out` path error, or unknown subcommand |

| Local-only invariant | Rule |
|---------------------|------|
| Read-only manifest | `tusq path index` MUST NOT mutate `tusq.manifest.json` |
| Non-persistence | `path_segment_count_tier` MUST NOT be written to manifest |
| No statistical aggregates | No min/max/mean; no cross-axis derived roll-ups |
| No route-registry conformance | No path validation against runtime registered routes |
| No URL generation | No new URL examples or path payloads generated |
| Path-parameter rule | `:id` syntax counts as one segment; not unwrapped or downscaled |
| Trailing-slash rule | `/users/` → unknown + warning (manifest is canonical) |

CLI surface growth: 24 → 25 commands. `path` inserted alphabetically between `output` and `pii`.

### M40: Output Schema Property Count Tier Index — Product CLI Surface

| Command | Shape |
|---------|-------|
| `tusq output` | `tusq output <subcommand>` |
| `tusq output index` | `tusq output index [--tier <none\|low\|medium\|high\|unknown>] [--manifest <path>] [--out <path>] [--json]` |

| Flag | Description |
|------|-------------|
| `--tier <value>` | Filter to a single bucket (case-sensitive lowercase; absent tier exits 1) |
| `--manifest <path>` | Manifest file to read (default: `tusq.manifest.json`) |
| `--out <path>` | Write index to file (no stdout on success; `.tusq/` rejected) |
| `--json` | Emit machine-readable JSON (includes `warnings[]`) |

| Bucket Key | Condition |
|-----------|-----------|
| `none` | `Object.keys(output_schema.properties).length === 0` |
| `low` | `1 <= length <= 2` |
| `medium` | `3 <= length <= 5` |
| `high` | `length >= 6` |
| `unknown` | `output_schema` missing/non-object, `output_schema.properties` missing/non-object, or any property descriptor is non-object; `type:array` schemas (no `properties` key) are bucketed here — informative, not a defect |

| aggregation_key | When |
|----------------|------|
| `tier` | For `none`, `low`, `medium`, `high` buckets |
| `unknown` | For `unknown` bucket |

| Per-bucket Field | Description |
|-----------------|-------------|
| `output_schema_property_count_tier` | Bucket key |
| `aggregation_key` | `tier` or `unknown` |
| `capability_count` | Number of capabilities in bucket |
| `capabilities[]` | Capability names in manifest declared order |
| `approved_count` | Count where `approved === true` |
| `gated_count` | Count where `approved !== true` |
| `has_destructive_side_effect` | Any capability has `side_effect_class === 'destructive'` |
| `has_restricted_or_confidential_sensitivity` | Any capability has `sensitivity_class === 'restricted'` or `'confidential'` |

| Bucket Iteration Order |
|----------------------|
| `none → low → medium → high → unknown` (closed-enum deterministic stable-output convention only) |

**Failure UX:**
- Unknown flag → stderr `Unknown flag: --<flag>`, exit 1, empty stdout
- `--tier` with no value → stderr `Missing value for --tier`, exit 1
- Missing manifest → stderr `Manifest not found: <path>`, exit 1
- Invalid manifest JSON → stderr `Invalid manifest JSON: <path>`, exit 1
- Missing capabilities array → stderr `Invalid manifest: missing capabilities array`, exit 1
- Unknown tier value → stderr `Unknown output schema property count tier: <value>`, exit 1
- Absent tier filter → stderr `No capabilities found for output schema property count tier: <tier>`, exit 1
- `--out` inside `.tusq/` → stderr `--out path must not be inside .tusq/`, exit 1
- `--out` unwritable → stderr `Cannot write to --out path: <path>`, exit 1

**Local-only invariants:**
- `output_schema_property_count_tier` MUST NOT be persisted into `tusq.manifest.json`
- Manifest is never mutated by `tusq output index`
- Zero new dependencies added to `package.json`
- `--tier` filter is case-sensitive lowercase-only
- `warnings[]` always present in `--json` mode (even when empty)
- `type:array` schemas bucketed as `unknown` with reason `output_schema_properties_field_missing` — informative, not a defect

> **M40 Charter Sketch Reservation — 2026-04-27 in run_0ce75469bde80380 (turn_f4192b1598e8a30f, PM attempt 1) at HEAD `61800d7`.** This PM turn binds **M40: Static Capability Output Schema Property Count Tier Index Export from Manifest Evidence — V1.21 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`. Scope decision resolved: M40 introduces a new top-level noun `output` with a single subcommand `index` (mirroring M27 `redaction review`, M30 `surface plan`, M31 `domain index`, M32 `effect index`, M33 `sensitivity index`, M34 `method index`, M35 `auth index`, M36 `confidence index`, M37 `pii index`, M38 `examples index`, M39 `input index`); CLI surface grows from **23 → 24** commands (init, scan, manifest, compile, serve, review, docs, approve, **auth**, **confidence**, diff, domain, effect, **examples**, **input**, method, **output**, **pii**, policy, redaction, sensitivity, surface, version, help) with `output` inserted alphabetically between `method` and `pii` in the post-`docs` block (`method` vs `output`: `m` (109) < `o` (111) in ASCII; `output` vs `pii`: `o` (111) < `p` (112) in ASCII). The full command-surface § M40 detail block (two-row command table for `tusq output` enumerator and `tusq output index`, four-flag table for `--tier`, `--manifest`, `--out`, `--json`, closed five-value `output_schema_property_count_tier` bucket-key enum table (`none | low | medium | high | unknown`) — distinct from M37's pii-fields-derived enum, M38's examples-derived enum, and M39's input-schema-required-derived enum because M40 derives from the cardinality of the manifest's per-capability `output_schema.properties` object (M11/M14/M24-derived) which holds the documented response contract surface, not PII-name hints (M37), eval-seed entries (M38), or contract-required input fields (M39), closed two-value `aggregation_key` enum table (`tier | unknown`), frozen tier-function thresholds table (`none if Object.keys(output_schema.properties).length === 0`, `low if 1 <= length <= 2`, `medium if 3 <= length <= 5`, `high if length >= 6`, `unknown if output_schema or output_schema.properties is missing/malformed/contains-non-object-property-descriptor`), per-bucket 8-field entry shape table (`output_schema_property_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`), top-level `warnings[]` array rule (only in `--json`; five frozen reason codes `output_schema_field_missing`/`output_schema_field_not_object`/`output_schema_properties_field_missing`/`output_schema_properties_field_not_object`/`output_schema_properties_object_contains_non_object_property_descriptor`), closed-enum bucket iteration order table (`none → low → medium → high → unknown` — explicitly NOT a doc-drift-risk-precedence statement, NOT a staleness ranking, NOT a contract-surface-area ranking, NOT a drift-blast-radius ranking; the order is a deterministic stable-output convention only), within-bucket manifest-declared-order rule, empty-buckets-omitted rule, **case-sensitive `--tier` filter rule** (lowercase only; uppercase values like `HIGH` exit 1 with `Unknown output schema property count tier:`), `type:array` informative-bucketing rule (response shapes typed as `"array"` are bucketed as `unknown` with reason `output_schema_properties_field_missing` — informative, not a defect), malformed-object handling rule (bucketed as `unknown`, NOT silently coerced; with stderr/`warnings[]` entry citing one of five frozen reason codes), non-persistence rule (`output_schema_property_count_tier` MUST NOT be written into `tusq.manifest.json`), nested-walk-not-performed rule (only top-level `properties` keys are counted; `properties.X.properties` nested walks reserved for `M-Output-Schema-Nested-Property-Index-1`), non-runtime-output-executor/non-output-schema-validator/non-doc-contradiction-detector/non-output-generator/non-doc-accuracy-certifier boundary statement, default-preservation table for the 23 unchanged commands, failure UX table, local-only invariants table) is reserved for the dev role's implementation phase per the M27–M39 PM-vs-dev ownership split. The § M39 Product CLI Surface block (M39 input-required-tier-index planner — V1.20 SHIPPED), § M38 (V1.19 SHIPPED), § M37 (V1.18 SHIPPED), § M36 (V1.17 SHIPPED), § M35 (V1.16 SHIPPED), § M34 (V1.15 SHIPPED), § M33 (V1.14 SHIPPED), § M32 (V1.13 SHIPPED), and § M31 (V1.12 SHIPPED) carry forward verbatim. The closed five-value `output_schema_property_count_tier` bucket-key enum, the closed two-value `aggregation_key` enum, the frozen tier-function thresholds (`0 / 2 / 5 / 6` boundaries), the closed-enum bucket iteration order, the alphabetic-insertion-position decision (between `method` and `pii` in the post-`docs` block), the four-flag set, the case-sensitive lowercase-only `--tier` filter rule, the non-persistence-of-`output_schema_property_count_tier` rule, the malformed-object-bucketed-as-unknown rule with five frozen reason codes, the `type:array → unknown` informative-bucketing rule, and the nested-walk-not-performed rule are PM-frozen and MUST be carried forward unchanged by the dev materialization turn. The 23-command CLI surface is intact at this PM turn — M40 is unchecked planned work, not shipped (the 24th command `output` lands in implementation). No source code modified by this PM turn.

> **M39 Charter Sketch Reservation — 2026-04-27 in run_533b2f8c47cc0bf0 (turn_2c2363ba816afba6, PM attempt 1) at HEAD `d90bd90`.** This PM turn binds **M39: Static Capability Required Input Field Count Tier Index Export from Manifest Evidence — V1.20 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`. Scope decision resolved: M39 introduces a new top-level noun `input` with a single subcommand `index` (mirroring M27 `redaction review`, M30 `surface plan`, M31 `domain index`, M32 `effect index`, M33 `sensitivity index`, M34 `method index`, M35 `auth index`, M36 `confidence index`, M37 `pii index`, M38 `examples index`); CLI surface grows from **22 → 23** commands (init, scan, manifest, compile, serve, review, docs, approve, **auth**, **confidence**, diff, domain, effect, **examples**, **input**, method, **pii**, policy, redaction, sensitivity, surface, version, help) with `input` inserted alphabetically between `examples` and `method` in the post-`docs` block (`examples` vs `input`: `e` (101) < `i` (105) in ASCII; `input` vs `method`: `i` (105) < `m` (109) in ASCII). The full command-surface § M39 detail block (two-row command table for `tusq input` enumerator and `tusq input index`, four-flag table for `--tier`, `--manifest`, `--out`, `--json`, closed five-value `required_input_field_count_tier` bucket-key enum table (`none | low | medium | high | unknown`) — distinct from M37's pii-fields-derived enum and M38's examples-derived enum because M39 derives from the cardinality of the manifest's per-capability `input_schema.required[]` array (M11/M14/M24-derived) which contains contract-required input field names, not PII-name hints (M37) or eval-seed object entries (M38), closed two-value `aggregation_key` enum table (`tier | unknown`), frozen tier-function thresholds table (`none if required.length === 0`, `low if 1 <= required.length <= 2`, `medium if 3 <= required.length <= 5`, `high if required.length >= 6`, `unknown if input_schema or required is missing/malformed/contains-non-string-or-empty-element`), per-bucket 8-field entry shape table (`required_input_field_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`), top-level `warnings[]` array rule (only in `--json`; five frozen reason codes `input_schema_field_missing`/`input_schema_field_not_object`/`required_field_missing`/`required_field_not_array`/`required_array_contains_non_string_or_empty_element`), closed-enum bucket iteration order table (`none → low → medium → high → unknown` — explicitly NOT an exposure-risk-precedence statement, NOT a blast-radius ranking, NOT an easy-call ranking, NOT an input-complexity ranking; the order is a deterministic stable-output convention only), within-bucket manifest-declared-order rule, empty-buckets-omitted rule, **case-sensitive `--tier` filter rule** (lowercase only; uppercase values like `HIGH` exit 1 with `Unknown required input field count tier:`), malformed-array handling rule (bucketed as `unknown`, NOT silently coerced; with stderr/`warnings[]` entry citing one of five frozen reason codes), non-persistence rule (`required_input_field_count_tier` MUST NOT be written into `tusq.manifest.json`), non-runtime-executor/non-schema-validator/non-input-generator/non-exposure-safety-certifier boundary statement, default-preservation table for the 22 unchanged commands, failure UX table, local-only invariants table) is reserved for the dev role's implementation phase per the M27–M38 PM-vs-dev ownership split. The § M38 Product CLI Surface block (M38 examples-count-tier-index planner — V1.19 SHIPPED), § M37 (V1.18 SHIPPED), § M36 (V1.17 SHIPPED), § M35 (V1.16 SHIPPED), § M34 (V1.15 SHIPPED), § M33 (V1.14 SHIPPED), § M32 (V1.13 SHIPPED), and § M31 (V1.12 SHIPPED) carry forward verbatim. The closed five-value `required_input_field_count_tier` bucket-key enum, the closed two-value `aggregation_key` enum, the frozen tier-function thresholds (`0 / 2 / 5 / 6` boundaries), the closed-enum bucket iteration order, the alphabetic-insertion-position decision (between `examples` and `method` in the post-`docs` block), the four-flag set, the case-sensitive lowercase-only `--tier` filter rule, the non-persistence-of-`required_input_field_count_tier` rule, and the malformed-array-bucketed-as-unknown rule with five frozen reason codes are PM-frozen and MUST be carried forward unchanged by the dev materialization turn. The 22-command CLI surface is intact at this PM turn — M39 is unchecked planned work, not shipped (the 23rd command `input` lands in implementation). No source code modified by this PM turn.

> **M38 Charter Sketch Reservation — 2026-04-27 in run_0c5145f830f5940e (turn_5f9db83b54b7b58f, PM attempt 1) at HEAD `cd81f5e`.** This PM turn binds **M38: Static Capability Examples Count Tier Index Export from Manifest Evidence — V1.19 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`. Scope decision resolved: M38 introduces a new top-level noun `examples` with a single subcommand `index` (mirroring M27 `redaction review`, M30 `surface plan`, M31 `domain index`, M32 `effect index`, M33 `sensitivity index`, M34 `method index`, M35 `auth index`, M36 `confidence index`, M37 `pii index`); CLI surface grows from **21 → 22** commands (init, scan, manifest, compile, serve, review, docs, approve, **auth**, **confidence**, diff, domain, effect, **examples**, method, **pii**, policy, redaction, sensitivity, surface, version, help) with `examples` inserted alphabetically between `effect` and `method` (`effect` vs `examples`: `e` = `e`, `f` (102) < `x` (120) in ASCII; `examples` vs `method`: `e` < `m`). The full command-surface § M38 detail block (two-row command table for `tusq examples` enumerator and `tusq examples index`, four-flag table for `--tier`, `--manifest`, `--out`, `--json`, closed five-value `examples_count_tier` bucket-key enum table (`none | low | medium | high | unknown`) — distinct from M37's pii-fields-derived enum because M38 derives from the cardinality of object-shaped `examples[]` array entries (M11-derived) rather than the string-shaped per-field hints that drive M37, closed two-value `aggregation_key` enum table (`tier | unknown`), frozen tier-function thresholds table (`none if examples.length === 0`, `low if 1 <= examples.length <= 2`, `medium if 3 <= examples.length <= 5`, `high if examples.length >= 6`, `unknown if missing/not-array/contains-non-object-element/contains-null-element/contains-array-element`), per-bucket 8-field entry shape table (`examples_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`), top-level `warnings[]` array rule (only in `--json`; five frozen reason codes `examples_field_missing`/`examples_field_not_array`/`examples_array_contains_non_object_element`/`examples_array_contains_null_element`/`examples_array_contains_array_element`), closed-enum bucket iteration order table (`none → low → medium → high → unknown` — explicitly NOT a coverage-quality-precedence statement, NOT a test-strength ranking, NOT an eval-readiness ranking; the order is a deterministic stable-output convention only), within-bucket manifest-declared-order rule, empty-buckets-omitted rule, **case-sensitive `--tier` filter rule** (lowercase only; uppercase values like `HIGH` exit 1 with `Unknown examples count tier:`), malformed-array handling rule (bucketed as `unknown`, NOT silently coerced; with stderr/`warnings[]` entry), non-persistence rule (`examples_count_tier` MUST NOT be written into `tusq.manifest.json`), non-runtime-executor/non-schema-validator/non-generator/non-eval-certifier boundary statement, default-preservation table for the 21 unchanged commands, failure UX table, local-only invariants table) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31/M32/M33/M34/M35/M36/M37 PM-vs-dev ownership split. The § M37 Product CLI Surface block (M37 pii-field-count-tier-index planner — V1.18 SHIPPED), § M36 (Static Capability Confidence Tier Index Export — V1.17 SHIPPED), § M35 (V1.16 SHIPPED), § M34 (V1.15 SHIPPED), § M33 (V1.14 SHIPPED), § M32 (V1.13 SHIPPED), and § M31 (V1.12 SHIPPED) carry forward verbatim. The closed five-value `examples_count_tier` bucket-key enum, the closed two-value `aggregation_key` enum, the frozen tier-function thresholds (`0 / 2 / 5 / 6` boundaries), the closed-enum bucket iteration order, the alphabetic-insertion-position decision (between `effect` and `method`), the four-flag set, the case-sensitive lowercase-only `--tier` filter rule, the non-persistence-of-`examples_count_tier` rule, and the malformed-array-bucketed-as-unknown rule with five frozen reason codes are PM-frozen and MUST be carried forward unchanged by the dev materialization turn. The 21-command CLI surface is intact at this PM turn — M38 is unchecked planned work, not shipped (the 22nd command `examples` lands in implementation). No source code modified by this PM turn.

> **M37 Charter Sketch Reservation — 2026-04-27 in run_0b366d58febc99be (turn_741c43114034bab7, PM attempt 1).** This PM turn binds **M37: Static Capability PII Field Count Tier Index Export from Manifest Evidence — V1.18 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`. Scope decision resolved: M37 introduces a new top-level noun `pii` with a single subcommand `index` (mirroring M27 `redaction review`, M30 `surface plan`, M31 `domain index`, M32 `effect index`, M33 `sensitivity index`, M34 `method index`, M35 `auth index`, M36 `confidence index`); CLI surface grows from **20 → 21** commands (init, scan, manifest, compile, serve, review, docs, approve, **auth**, **confidence**, diff, domain, effect, method, **pii**, policy, redaction, sensitivity, surface, version, help) with `pii` inserted alphabetically between `method` and `policy` (`method` vs `pii`: `m` < `p`; `pii` vs `policy`: `pi` < `po` because second-char `i` < `o`). The full command-surface § M37 detail block (two-row command table for `tusq pii` enumerator and `tusq pii index`, four-flag table for `--tier`, `--manifest`, `--out`, `--json`, closed five-value `pii_field_count_tier` bucket-key enum table (`none | low | medium | high | unknown`) — distinct from M36's four-value enum because M37 is derived from the cardinality of a manifest array (e.g., `pii_fields[]`) rather than from a numeric scalar, closed two-value `aggregation_key` enum table (`tier | unknown`), frozen tier-function thresholds table (`none if length === 0`, `low if 1 <= length <= 2`, `medium if 3 <= length <= 5`, `high if length >= 6`, `unknown if missing/non-array/malformed`), per-bucket 8-field entry shape table (`pii_field_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`), top-level `warnings[]` array rule (only in `--json`), closed-enum bucket iteration order table (`none → low → medium → high → unknown` — explicitly NOT a risk-precedence statement, NOT a leakage-severity ranking, NOT a sensitivity-ladder; the order is a deterministic stable-output convention only), within-bucket manifest-declared-order rule, empty-buckets-omitted rule, **case-sensitive `--tier` filter rule** (lowercase only; uppercase values like `HIGH` exit 1 with `Unknown PII field count tier:`), malformed-field-array handling rule (bucketed as `unknown`, NOT silently coerced; with stderr/`warnings[]` entry), non-persistence rule (`pii_field_count_tier` MUST NOT be written into `tusq.manifest.json`), non-runtime-redactor/non-DLP-engine/non-PII-classifier boundary statement, default-preservation table for the 20 unchanged commands, failure UX table, local-only invariants table) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31/M32/M33/M34/M35/M36 PM-vs-dev ownership split. The § M36 Product CLI Surface block (M36 confidence-tier-index planner — V1.17 SHIPPED), § M35 (V1.16 SHIPPED), § M34 (V1.15 SHIPPED), § M33 (V1.14 SHIPPED), § M32 (V1.13 SHIPPED), and § M31 (V1.12 SHIPPED) carry forward verbatim. The closed five-value `pii_field_count_tier` bucket-key enum, the closed two-value `aggregation_key` enum, the frozen tier-function thresholds (`0 / 2 / 5 / 6` boundaries), the closed-enum bucket iteration order, the alphabetic-insertion-position decision (between `method` and `policy`), the four-flag set, the case-sensitive lowercase-only `--tier` filter rule, the non-persistence-of-`pii_field_count_tier` rule, and the malformed-array-bucketed-as-unknown rule are PM-frozen and MUST be carried forward unchanged by the dev materialization turn. The 20-command CLI surface is intact at this PM turn — M37 is unchecked planned work, not shipped (the 21st command `pii` lands in implementation). No source code modified by this PM turn.

> **M36 Charter Sketch Reservation — 2026-04-26 in run_8580d828f0e1cc1e (turn_f657958213bbfb9d, PM attempt 1) at HEAD `7c6b47e`.** This PM turn binds **M36: Static Capability Confidence Tier Index Export from Manifest Evidence — V1.17 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`. Scope decision resolved: M36 introduces a new top-level noun `confidence` with a single subcommand `index` (mirroring M27 `redaction review`, M30 `surface plan`, M31 `domain index`, M32 `effect index`, M33 `sensitivity index`, M34 `method index`, M35 `auth index`); CLI surface grows from **19 → 20** commands (init, scan, manifest, compile, serve, review, docs, approve, **auth**, **confidence**, diff, domain, effect, method, policy, redaction, sensitivity, surface, version, help) with `confidence` inserted alphabetically between `auth` and `diff` (`auth` vs `confidence`: `a` < `c`; `confidence` vs `diff`: `c` < `d`). The full command-surface § M36 detail block (two-row command table for `tusq confidence` enumerator and `tusq confidence index`, four-flag table for `--tier`, `--manifest`, `--out`, `--json`, closed four-value `confidence_tier` bucket-key enum table (`high | medium | low | unknown`) — distinct from M35's seven-value enum because `confidence_tier` is M36-derived from the numeric `confidence` field rather than referenced from a pre-existing M-axis constant, closed two-value `aggregation_key` enum table (`tier | unknown`), frozen tier-function thresholds table (`high if confidence >= 0.85`, `low if confidence < 0.6`, `medium if 0.6 <= confidence < 0.85`, `unknown if missing/non-numeric/out-of-[0,1]`), per-bucket 8-field entry shape table (`confidence_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`), top-level `warnings[]` array rule (only in `--json`), closed-enum bucket iteration order table (`high → medium → low → unknown` — explicitly NOT a quality-precedence statement, NOT an evidence-strength ranking, NOT a trust-ranking; the order is a deterministic stable-output convention only), within-bucket manifest-declared-order rule, empty-buckets-omitted rule, **case-sensitive `--tier` filter rule** (lowercase only; uppercase values like `HIGH` exit 1 with `Unknown confidence tier:`), out-of-range/non-numeric value handling rule (bucketed as `unknown`, NOT silently coerced; with stderr/`warnings[]` entry), non-persistence rule (`confidence_tier` MUST NOT be written into `tusq.manifest.json`), default-preservation table for the 19 unchanged commands, failure UX table, local-only invariants table) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31/M32/M33/M34/M35 PM-vs-dev ownership split. The § M35 Product CLI Surface block (M35 auth-scheme-index planner — V1.16 SHIPPED with synchronous-mismatch guard refinement closed in run_152b21c8bbaa78d9), § M34 (V1.15 SHIPPED), § M33 (V1.14 SHIPPED), § M32 (V1.13 SHIPPED), and § M31 (V1.12 SHIPPED) carry forward verbatim. The closed four-value `confidence_tier` bucket-key enum, the closed two-value `aggregation_key` enum, the frozen tier-function thresholds (`0.85` and `0.6`), the closed-enum bucket iteration order, the alphabetic-insertion-position decision (between `auth` and `diff`), the four-flag set, the case-sensitive lowercase-only `--tier` filter rule, the non-persistence-of-`confidence_tier` rule, and the out-of-range-bucketed-as-unknown rule are PM-frozen and MUST be carried forward unchanged by the dev materialization turn. Independent baseline re-verified on HEAD `7c6b47e`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (26 scenarios)"; zero source drift in `src/`, `bin/`, `tests/`, `website/`. The 19-command CLI surface is intact — M36 is unchecked planned work, not shipped. No source code modified by this PM turn.

> **M35 Synchronous Mismatch Guard Refinement — 2026-04-26 in run_152b21c8bbaa78d9 (turn_ec2716f4b8fe4ff4, PM attempt 1) at HEAD `dd91aa2`.** Intake charter `intent_1777244614389_af70` (vision_scan, category `roadmap_open_work_detected`) re-injected the M35 V1.16 (PROPOSED) `auth_scheme` bucket-key enum line — the 9th vision_scan stale-checkbox recurrence pattern. Independent re-verification on HEAD `dd91aa2`: `npm test` exit 0 with 26 scenarios; 19-command CLI surface intact (init, scan, manifest, compile, serve, review, docs, approve, **auth**, diff, domain, effect, method, policy, redaction, sensitivity, surface, version, help) with `auth` between `approve` and `diff` (note: actual alphabetic placement is `approve → auth → diff` — `diff` (`d`) sorts before `compile` (`c`) was a typo in the original M35 charter; the implementation correctly placed `auth` between `approve` and `diff` because `app < aut < dif < com` is FALSE — actually `app < aut < com < dif`, so the canonical alphabetic ordering of the noun-block portion is `approve, auth, compile, diff, domain, effect, method, policy, redaction, sensitivity, surface`; `compile` is in the operational top-of-help block, not the alphabetic noun-block, which is why `auth` lands between `approve` and `diff` in the help enumeration); `tusq auth index --help` exits 0 with planning-aid framing and closed-enum bucket iteration order `bearer → api_key → session → basic → oauth → none → unknown`; case-sensitive lowercase `--scheme` enforcement confirmed (`--scheme BEARER` exit 1). M35 is substantively shipped at V1.16. Reconciled documentation drift: 19 of 20 M35 ROADMAP checkboxes flipped `[ ]→[x]`. **Line 629 deliberately remains `[ ]`** — the charter's sharpened sub-requirement "M35 MUST reference the M29 `AUTH_SCHEMES` constant directly + synchronous mismatch guard" is NOT strictly satisfied: `src/cli.js:108` declares `AUTH_SCHEME_INDEX_BUCKET_ORDER` as an independent literal array, no runtime mismatch guard. Dev-implementation directive: derive `AUTH_SCHEME_INDEX_BUCKET_ORDER` from `AUTH_SCHEMES` AND add a synchronous module-init guard. The four-flag set, the closed seven-value `auth_scheme` bucket-key enum table, the closed two-value `aggregation_key` enum table, the per-bucket 8-field entry shape, and the closed-enum bucket iteration order are PM-frozen and MUST be carried forward unchanged. No source code modified by this PM turn.

> **M35 Charter Sketch Reservation — 2026-04-26 in run_0b373a30d182816a (turn_d7fc926d1c177c66, PM attempt 1) at HEAD `b129ca9`.** This PM turn binds **M35: Static Capability Auth Scheme Index Export from Manifest Evidence — V1.16 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`. Scope decision resolved: M35 introduces a new top-level noun `auth` with a single subcommand `index` (mirroring M27 `redaction review`, M30 `surface plan`, M31 `domain index`, M32 `effect index`, M33 `sensitivity index`, M34 `method index`); CLI surface grows from **18 → 19** commands (init, scan, manifest, compile, serve, review, docs, approve, **auth**, diff, domain, effect, method, policy, redaction, sensitivity, surface, version, help) with `auth` inserted alphabetically between `approve` and `compile` (`approve` vs `auth`: `app` < `aut` because `p` < `u`; `auth` vs `compile`: `a` < `c`). The full command-surface § M35 detail block (two-row command table for `tusq auth` enumerator and `tusq auth index`, four-flag table for `--scheme`, `--manifest`, `--out`, `--json`, closed seven-value `auth_scheme` bucket-key enum table (`bearer | api_key | session | basic | oauth | none | unknown`) referenced from M29 `AUTH_SCHEMES` (note `unknown` is already a member of M29 AUTH_SCHEMES, distinct from M34 where `unknown` was synthesized outside the canonical five), closed two-value `aggregation_key` enum table (`scheme | unknown`), per-bucket 8-field entry shape table (`auth_scheme`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`), closed-enum bucket iteration order table (`bearer → api_key → session → basic → oauth → none → unknown` — explicitly NOT an IAM-strength-precedence statement, NOT a trust-ranking, NOT a security-strength ladder despite the visual ordering of `bearer` first and `none → unknown` last; mirroring M32/M33/M34's closed-enum convention with `unknown` appended last), within-bucket manifest-declared-order rule, empty-buckets-omitted rule, **case-sensitive `--scheme` filter rule** (lowercase only; uppercase values like `BEARER` exit 1 with `Unknown auth scheme:`), default-preservation table for the 18 unchanged commands, failure UX table, local-only invariants table) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31/M32/M33/M34 PM-vs-dev ownership split. The § M34 Product CLI Surface block (M34 method-index planner — V1.15 SHIPPED), the § M33 Product CLI Surface block (M33 sensitivity-index planner — V1.14 SHIPPED), the § M32 Product CLI Surface block (M32 effect-index planner — V1.13 SHIPPED), and the § M31 Product CLI Surface block (M31 domain-index planner — V1.12 SHIPPED) carry forward verbatim. The closed seven-value `auth_scheme` bucket-key enum, the closed two-value `aggregation_key` enum, the closed-enum bucket iteration order, the alphabetic-insertion-position decision (between `approve` and `compile`), the four-flag set, the case-sensitive lowercase-only `--scheme` filter rule, the M35 implementation MUST reference M29 `AUTH_SCHEMES` directly rule, and the M35 implementation MUST NOT modify M29's classifier rule are PM-frozen and MUST be carried forward unchanged by the dev materialization turn. Independent baseline re-verified on HEAD `b129ca9`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (25 scenarios)"; zero source drift in `src/`, `bin/`, `tests/`, `website/`. The 18-command CLI surface is intact — M35 is unchecked planned work, not shipped. No source code modified by this PM turn.

> **M34 Re-Affirmation (Stale-Checkbox Reconciliation) — 2026-04-26, run_9b4197b36f01ca42, turn_2ef90ba3bbd49667, PM attempt 1, HEAD `88762ba`.** The dev-materialized § M34 Product CLI Surface block from the prior run chain (run_bf8efb6b9c733000) is the source of truth and is unchanged in this run. 18-command CLI surface confirmed intact: init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, **method**, policy, redaction, sensitivity, surface, version, help (`method` inserted alphabetically between `effect` and `policy`). `tusq method index --help` exits 0 with planning-aid framing callout `This is a planning aid, not a runtime HTTP-method router, REST-convention validator, or idempotency classifier.` and closed-enum bucket iteration order `GET → POST → PUT → PATCH → DELETE → unknown`. `node bin/tusq.js method index --method get --manifest tests/fixtures/express-sample/tusq.manifest.json` exits 1 with `Unknown method: get` on stderr (case-sensitive uppercase enforcement confirmed). `npm test` exits 0 with `Eval regression harness passed (25 scenarios)`. Zero source drift in `src/`, `bin/`, `tests/`, `website/`, `package.json`, `package-lock.json`.

> **M34 Charter Sketch Reservation — 2026-04-26 in run_bf8efb6b9c733000 (turn_8656b25a486eaa6d, PM attempt 1) at HEAD `8921229`.** This PM turn binds **M34: Static Capability HTTP Method Index Export from Manifest Evidence — V1.15 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`. Scope decision resolved: M34 introduces a new top-level noun `method` with a single subcommand `index` (mirroring M27 `redaction review`, M30 `surface plan`, M31 `domain index`, M32 `effect index`, M33 `sensitivity index`); CLI surface grows from **17 → 18** commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, **method**, policy, redaction, sensitivity, surface, version, help) with `method` inserted alphabetically between `effect` and `policy` (`method` vs `policy`: `m` < `p`; `method` vs `effect`: `e` < `m`). The full command-surface § M34 detail block (two-row command table for `tusq method` enumerator and `tusq method index`, four-flag table for `--method`, `--manifest`, `--out`, `--json`, closed five-value `http_method` bucket-key enum table (`GET | POST | PUT | PATCH | DELETE`) plus `unknown` zero-evidence catchall (six total) covering canonical REST verbs that tusq's scanner already emits in the manifest's `method` field with HEAD/OPTIONS/TRACE/CONNECT/non-standard verbs aggregated into `unknown`, closed two-value `aggregation_key` enum table (`method | unknown`), per-bucket 8-field entry shape table (`http_method`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_unknown_auth`), closed-enum bucket iteration order table (`GET → POST → PUT → PATCH → DELETE → unknown` — explicitly NOT a CRUD-risk-precedence statement, NOT destructive-ascending, NOT a safety ladder despite matching the conventional REST CRUD reading order; mirroring M32/M33's closed-enum convention with `unknown` appended last), within-bucket manifest-declared-order rule, empty-buckets-omitted rule, **case-sensitive `--method` filter rule** (uppercase only; lowercase values like `get` exit 1 with `Unknown method:`), default-preservation table for the 17 unchanged commands, failure UX table, local-only invariants table) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31/M32/M33 PM-vs-dev ownership split. The § M33 Product CLI Surface block (M33 sensitivity-index planner — V1.14 SHIPPED), the § M32 Product CLI Surface block (M32 effect-index planner — V1.13 SHIPPED), and the § M31 Product CLI Surface block (M31 domain-index planner — V1.12 SHIPPED) carry forward verbatim. The closed five-value-plus-unknown `http_method` bucket-key enum, the closed two-value `aggregation_key` enum, the closed-enum bucket iteration order, the alphabetic-insertion-position decision (between `effect` and `policy`), the four-flag set, the case-sensitive uppercase-only `--method` filter rule, and the M34 implementation MUST NOT modify the upstream scanner's `method` field rule are PM-frozen and MUST be carried forward unchanged by the dev materialization turn. Independent baseline re-verified on HEAD `8921229`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (24 scenarios)"; zero source drift in `src/`, `bin/`, `tests/`, `website/`. The 17-command CLI surface is intact — M34 is unchecked planned work, not shipped. No source code modified by this PM turn.

> **M33 Re-Affirmation (Stale-Checkbox Reconciliation) — 2026-04-26, run_cd98cdad0fb83285, turn_73d77d855d310a6c, PM attempt 1, HEAD `753cf31`.** The dev-materialized § M33 CLI Surface block from the prior run chain is the source of truth and is unchanged in this run. 17-command CLI surface confirmed intact: init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, policy, redaction, **sensitivity**, surface, version, help. `tusq sensitivity index --help` exits 0 with planning-aid framing callout and closed-enum bucket iteration order `public → internal → confidential → restricted → unknown`. `npm test` exits 0 with `Eval regression harness passed (24 scenarios)`. Zero source drift in `src/`, `bin/`, `tests/`, `website/`, `package.json`, `package-lock.json`.

> **M33 Charter Sketch Reservation — 2026-04-26 in run_4506c41d74e23e8e (turn_8803f8edb25d1a0e, PM attempt 1) at HEAD `2dcec80`.** This PM turn binds **M33: Static Capability Sensitivity Index Export from Manifest Evidence — V1.14 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`. Scope decision resolved: M33 introduces a new top-level noun `sensitivity` with a single subcommand `index` (mirroring M27 `redaction review`, M30 `surface plan`, M31 `domain index`, and M32 `effect index`); CLI surface grows from **16 → 17** commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, policy, redaction, **sensitivity**, surface, version, help) with `sensitivity` inserted alphabetically between `redaction` and `surface` (`sensitivity` vs `surface`: `s-e` < `s-u`). The full command-surface § M33 detail block (two-row command table for `tusq sensitivity` enumerator and `tusq sensitivity index`, four-flag table for `--sensitivity`, `--manifest`, `--out`, `--json`, closed five-value `sensitivity_class` bucket-key enum table (`public | internal | confidential | restricted | unknown`) aligned 1:1 with the existing M28 `SENSITIVITY_CLASSES` constant, closed two-value `aggregation_key` enum table (`class | unknown`), per-bucket entry shape table (8 fields: `sensitivity_class`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_unknown_auth`), closed-enum bucket iteration order table (`public → internal → confidential → restricted → unknown` — explicitly NOT a risk-precedence statement; mirroring M32's closed-enum convention with `unknown` appended last), within-bucket manifest-declared-order rule, empty-buckets-omitted rule, default-preservation table for the 16 unchanged commands, failure UX table, local-only invariants table) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31/M32 PM-vs-dev ownership split. The § M32 Product CLI Surface block (M32 effect-index planner — V1.13 SHIPPED) and the § M31 Product CLI Surface block (M31 domain-index planner — V1.12 SHIPPED) carry forward verbatim. The closed five-value `sensitivity_class` bucket-key enum, the closed two-value `aggregation_key` enum, the closed-enum bucket iteration order, the alphabetic-insertion-position decision (between `redaction` and `surface`), the four-flag set, and the M33 implementation MUST-reference-M28-SENSITIVITY_CLASSES rule (not redeclare an independent constant) are PM-frozen and MUST be carried forward unchanged by the dev materialization turn. Independent baseline re-verified on HEAD `2dcec80`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (23 scenarios)"; zero source drift in `src/`, `bin/`, `tests/`, `website/`. The 16-command CLI surface is intact — M33 is unchecked planned work, not shipped. No source code modified by this PM turn.

> Re-affirmed on 2026-04-26 in run_7183d8c70482329b (turn_f69f5083f63ad652, PM attempt 1) at HEAD `79cf211`. The **16**-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, **domain**, **effect**, policy, redaction, surface, version, help) is preserved exactly with `effect` inserted alphabetically between `domain` and `policy`. The § M32 Product CLI Surface section is unchanged: the 15 → 16 noun growth, the two-row command table (`tusq effect` enumerator and `tusq effect index`), the four-flag table (`--effect`, `--manifest`, `--out`, `--json`), the closed four-value `side_effect_class` bucket-key enum table (`read | write | destructive | unknown`), the closed two-value `aggregation_key` enum table (`class | unknown`), the per-bucket 8-field entry shape table, the closed-enum bucket iteration order rule (`read → write → destructive → unknown`), the within-bucket manifest declared order rule, the empty-buckets-omitted rule, the failure UX table, and the local-only invariants table all remain in place verbatim. M32 was incorrectly re-charterable from this run's intake intent (`intent_1777236173495_2303`) because the ROADMAP M32 checkboxes were stale-unchecked despite the milestone being fully shipped at V1.13 (`run_ae841429202c5bb7` completed all four phases through launch); this PM turn flips the 20 checkboxes to reflect verified shipped state and emits no surface changes. Baseline re-verified before this edit: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (23 scenarios)" on HEAD `79cf211`; `node bin/tusq.js help` enumerates the 16-command CLI surface; `node bin/tusq.js effect index --help` exits 0 with the planning-aid framing callout `This is a planning aid, not a runtime side-effect enforcer or risk-tier classifier.` and the closed-enum bucket iteration order `read → write → destructive → unknown`. No source code was modified by this PM turn.

> **M32 Charter Sketch Reservation — 2026-04-26 in run_ae841429202c5bb7 (turn_b5d4f652077b62be, PM attempt 1) at HEAD `f858d36`.** This PM turn binds **M32: Static Capability Side-Effect Index Export from Manifest Evidence — V1.13 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`. Scope decision resolved: M32 introduces a new top-level noun `effect` with a single subcommand `index` (mirroring M27 `redaction review`, M30 `surface plan`, and M31 `domain index`); CLI surface grows from **15 → 16** commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, **effect**, policy, redaction, surface, version, help) with `effect` inserted alphabetically between `domain` and `policy`. The full command-surface § M32 detail block (two-row command table for `tusq effect` enumerator and `tusq effect index`, four-flag table for `--effect`, `--manifest`, `--out`, `--json`, closed four-value `side_effect_class` bucket-key enum table (`read | write | destructive | unknown`), closed two-value `aggregation_key` enum table (`class | unknown`), per-bucket entry shape table (8 fields), closed-enum bucket iteration order table (`read → write → destructive → unknown`), within-bucket manifest-declared-order rule, empty-buckets-omitted rule, default-preservation table for the 15 unchanged commands, failure UX table, local-only invariants table) is reserved for the dev role's implementation phase per the M27/M28/M29/M30/M31 PM-vs-dev ownership split. The § M31 Product CLI Surface block (M31 domain-index planner — V1.12 SHIPPED) carries forward verbatim. The closed four-value `side_effect_class` bucket-key enum, the closed two-value `aggregation_key` enum, the closed-enum bucket iteration order, the alphabetic-insertion-position decision (between `domain` and `policy`), and the four-flag set are PM-frozen and MUST be carried forward unchanged by the dev materialization turn. Independent baseline re-verified on HEAD `f858d36`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (22 scenarios)"; zero source drift in `src/`, `bin/`, `tests/`, `website/`. The 15-command CLI surface is intact — M32 is unchecked planned work, not shipped. No source code modified by this PM turn.

> Re-affirmed on 2026-04-26 in run_25308eabf162ba8b (turn_cf57b41e62c05af6, PM attempt 1) at HEAD `6c7e7fd`. The **15**-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, **domain**, policy, redaction, surface, version, help) is preserved exactly with `domain` inserted alphabetically between `diff` and `policy`. The § M31 Product CLI Surface section is unchanged: the 14 → 15 noun growth, the two-row command table (`tusq domain` enumerator and `tusq domain index`), the four-flag table (`--domain`, `--manifest`, `--out`, `--json`), the closed two-value `aggregation_key` enum table (`domain | unknown`), the per-domain 8-field entry shape table, the manifest first-appearance ordering rule (with `unknown` appended last), the failure UX table, and the local-only invariants table all remain in place verbatim. M31 was incorrectly re-charterable from this run's intake intent (intent_1777233493634_b5f9) because the ROADMAP M31 checkboxes were stale-unchecked despite the milestone being fully shipped at V1.12 (run_e40832d436a42d75 completed all four phases through launch); this PM turn flips the checkboxes to reflect verified shipped state and emits no surface changes. Baseline re-verified before this edit: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (22 scenarios)" on HEAD `6c7e7fd`; `node bin/tusq.js help` enumerates the 15-command CLI surface; `node bin/tusq.js domain index --help` exits 0 with the planning-aid framing callout. No source code was modified by this PM turn.

> **M31 Charter Sketch Reservation — 2026-04-26 in run_e40832d436a42d75 (turn_104e8064c293ba9f, PM attempt 1) at HEAD `dcf9098`.** This PM turn binds **M31: Static Capability Domain Index Export from Manifest Evidence — V1.12 (PROPOSED)** in `.planning/ROADMAP.md` and `.planning/PM_SIGNOFF.md`. Scope decision resolved: M31 introduces a new top-level noun `domain` with a single subcommand `index` (mirroring M27 `redaction review` and M30 `surface plan`); CLI surface grows from **14 → 15** commands (init, scan, manifest, compile, serve, review, docs, approve, diff, **domain**, policy, redaction, surface, version, help) with `domain` inserted alphabetically between `diff` and `policy`. The full command-surface § M31 detail block (two-row command table for `tusq domain` enumerator and `tusq domain index`, four-flag table for `--domain`, `--manifest`, `--out`, `--json`, closed two-value `aggregation_key` enum table, per-domain entry shape table, default-preservation table for the 14 unchanged commands, failure UX table, local-only invariants table) is reserved for the dev role's implementation phase per the M27/M28/M29/M30 PM-vs-dev ownership split. The § M30 Product CLI Surface block (M30 surface-plan planner — V1.11 SHIPPED) carries forward verbatim. The closed two-value `aggregation_key` enum (`domain | unknown`), the alphabetic-insertion-position decision (between `diff` and `policy`), and the four-flag set are PM-frozen and MUST be carried forward unchanged by the dev materialization turn. Independent baseline re-verified on HEAD `dcf9098`: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (21 scenarios)"; zero source drift in `src/`, `bin/`, `tests/`, `website/`. The 14-command CLI surface is intact — M31 is unchecked planned work, not shipped. No source code modified by this PM turn.

> Re-affirmed on 2026-04-26 in run_7894753f9c47c8e3 (turn_b2926375e6189caf, PM attempt 1) at HEAD `b6bfcb8`. The 14-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, surface, version, help) is preserved exactly. The § M30 Product CLI Surface section is unchanged: the 13 → 14 noun growth (`surface` inserted alphabetically between `redaction` and `version` per the help output emitted by the shipped V1.11 build), the two-row command table (`tusq surface` enumerator and `tusq surface plan`), the four-flag table (`--surface`, `--manifest`, `--out`, `--json`), the closed four-value `surface` and six-value `gated_reason` enum table, the per-surface eligibility precedence table, the per-surface gate set listing, the plan-shape JSON field table, the frozen `brand_inputs_required` named-list table, the default-preservation table for the 13 unchanged commands, the ten-row failure UX table, and the sixteen-row local-only invariants table all remain in place verbatim. M30 was incorrectly re-charterable from this run's intake intent (intent_1777223991256_bb53) because the ROADMAP M30 checkboxes were stale-unchecked despite the milestone being fully shipped at V1.11 (run_24ccd92f593d8647 completed all four phases through launch); this PM turn flips the checkboxes to reflect verified shipped state and emits no surface changes. Baseline re-verified before this edit: `npm test` exits 0 with "Smoke tests passed" and "Eval regression harness passed (21 scenarios)" on HEAD `b6bfcb8`; `node bin/tusq.js help` enumerates the 14-command CLI surface; `node bin/tusq.js surface plan --help` exits 0 with the planning-aid framing callout. No source code was modified by this PM turn.

> Re-affirmed on 2026-04-26 in run_24ccd92f593d8647 (turn_5f551e9f95cc3829, PM attempt 1) at HEAD `e524f7b`. This turn re-anchors PM participation in this gate artifact for the current run, refreshing the stale `non_progress_signature` recorded in `.agentxchain/state.json`. The § M30 Product CLI Surface section (chartered in turn_fa7dbb75b01943f5, commit da8a75e) is unchanged: the 13 → 14 noun growth (`surface` inserted alphabetically between `serve` and `redaction`), the two-row command table (`tusq surface` enumerator and `tusq surface plan`), the four-flag table (`--surface`, `--manifest`, `--out`, `--json`), the closed four-value `surface` and six-value `gated_reason` enum table, the per-surface eligibility precedence table, the per-surface gate set listing, the plan-shape JSON field table, the frozen `brand_inputs_required` named-list table, the default-preservation table for the 13 unchanged commands, the ten-row failure UX table, and the sixteen-row local-only invariants table all remain in place verbatim. M30 ships `surface` as the 14th CLI noun under V1.11 — planned work, not shipped. Baseline re-verified before this edit: `npm test` exits 0 with 20 scenarios on HEAD `e524f7b`; the currently-shipped 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly. No source code was modified by this PM turn.

> Re-affirmed on 2026-04-26 in run_d69cb0392607d170 (turn_641188dc0c4b7616, PM attempt 1) at HEAD `5e1feae`. The 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly. The optional `--sensitivity <class>` filter on the existing `tusq review` command (M28, V1.9) and the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command (M29, V1.10) remain mutually compatible via AND-style intersection — both are reviewer-aid filters that do not modify exit-code semantics or hide unapproved capabilities. M28 was incorrectly re-charterable from this run's intake intent (intent_1777180727050_1210) because the ROADMAP M28 checkboxes were stale-unchecked despite the milestone being shipped at V1.9; this PM turn flips the checkboxes to reflect verified shipped state and emits no surface changes. The compile-surface-invariant AND serve-surface-invariant for `auth_requirements` (M29) and the AC-9 compile/approve/serve invariants for `sensitivity_class` (M28) both hold: neither field appears in compiled tool definitions emitted by `tusq compile` to `tools/*.json`, and neither appears in any `tusq serve` MCP response shape (`tools/list`, `tools/call`, `dry_run_plan`). No source code was modified by this PM turn.

> Re-affirmed on 2026-04-25 in run_8fe3b8b418dc589c (turn_5d368031b5a8881a, PM attempt 2) at HEAD `1943326`. The § M29 Product CLI Surface below carries the closed seven-value `auth_scheme` enum, the closed five-value `evidence_source` enum, the frozen six-rule decision table, the manifest output shape, the failure UX (unrecognized `--auth-scheme` value exits 1 with empty stdout before any output), and the local-only invariants — all chartered in the prior run (commit 66cec85, turn_480dc289e36bfeba) and re-anchored in turn_018f55250ec41d6d. This turn re-anchors that content for the current child run so the planning_signoff gate observes in-run PM participation. The 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly; the only operator-visible surface added by M29 remains the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command (mutually compatible with M28's `--sensitivity <class>` via AND-style intersection — no new noun, no new subcommand, no environment-variable gate). The compile-surface-invariant AND serve-surface-invariant both hold: `auth_requirements` MUST NOT appear as a top-level key in any compiled tool definition emitted by `tusq compile` to `tools/*.json`, AND MUST NOT appear in any `tusq serve` MCP response shape (`tools/list`, `tools/call`, `dry_run_plan`). No source code was modified by this PM turn.

> Re-affirmed on 2026-04-25 in run_44a179ccf81697c3 (turn_018f55250ec41d6d, PM attempt 4) at HEAD `5600a0d`. The § M29 Product CLI Surface below was authored in the prior run (commit 66cec85, turn_480dc289e36bfeba) and carries the closed seven-value `auth_scheme` enum, the closed five-value `evidence_source` enum, the frozen six-rule decision table, the manifest output shape, the failure UX (unrecognized `--auth-scheme` value exits 1 with empty stdout before any output), and the local-only invariants. This turn re-anchors that content for the current run and codifies an explicit compile-surface-invariant alongside the existing serve-surface-invariant: `auth_requirements` MUST NOT appear as a top-level key in any compiled tool definition emitted by `tusq compile` to `tools/*.json`, AND MUST NOT appear in any `tusq serve` MCP response shape (`tools/list`, `tools/call`, `dry_run_plan`). The 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly; the only operator-visible surface added by M29 is the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command (mutually compatible with M28's `--sensitivity <class>` via AND-style intersection). No source code was modified by this PM turn.

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
| Manifest read successfully, `capabilities: []` (empty array — valid scaffold state) | Single line `No capabilities in manifest — nothing to review.` on stdout in human mode; `{manifest_path, manifest_version, generated_at, capabilities: []}` on stdout in `--json` mode | 0 |
| `--manifest` points to a missing file | `Manifest not found: <path>` on stderr; stdout is empty | 1 |
| Manifest is present but not valid JSON | `Invalid manifest JSON: <path>` on stderr; stdout is empty (no partial report) | 1 |
| Manifest is valid JSON but lacks a top-level `capabilities` array (or it is non-array) | `Invalid manifest: missing capabilities array` on stderr; stdout is empty | 1 |
| `--capability <name>` specifies a name not present in the manifest | `Capability not found: <name>` on stderr; stdout is empty | 1 |
| Unknown subcommand under `tusq redaction` | `Unknown subcommand: <name>` on stderr; stdout is empty | 1 |
| Unknown flag on `tusq redaction review` | `Unknown flag: <flag>` on stderr; stdout is empty | 1 |

**Stream discipline:** Every exit-1 row above has `stdout === ""`. Operators who pipe stdout to a file get a zero-byte file on failure. Error text is written to stderr only. Detection-before-output means no partial JSON or human section is written before an error surfaces. The empty-capabilities case (row 2) is deliberately exit 0 — a fresh `tusq init` repo with no routes yet is a valid scaffold state, not a hard failure.

### M27 Local-Only Invariants

| Invariant | How it shows up at review time |
|-----------|---------------------------------|
| Read-only | `tusq.manifest.json` is never opened for writing; mtime and content are byte-identical before/after any invocation |
| No network I/O | No HTTP, DB, socket, or DNS lookup; no `fetch`/`http.request`/`net.connect` call path reachable from the subcommand |
| Zero new dependencies | `package.json` MUST NOT gain any PII, compliance, retention, NLP, or table-rendering library |
| Deterministic output | Running twice on the same manifest produces byte-identical stdout in both human and `--json` modes; no wall-clock field inside per-capability entries |
| Frozen advisory set | `PII_REVIEW_ADVISORY_BY_CATEGORY` wording is locked by a smoke fixture; any wording change is a material governance event that MUST land under its own ROADMAP milestone |
| Advisory byte-exactness | Every advisory uses the em-dash character U+2014, not ASCII hyphen-minus U+002D or en-dash U+2013; stdout is UTF-8; smoke fixture locks the exact byte sequence at merge time |
| No scan re-run | The subcommand never calls the scanner or re-reads `src/` |
| No capability execution | The subcommand never calls a compiled tool or starts the MCP server |
| Reviewer-directive advisory text | Every advisory ends with "reviewer: ..." so the output explicitly reminds the operator the decision is theirs; no advisory claims the capability is compliant or runtime-safe |

## M28 Product CLI Surface

M28 introduces NO new CLI noun and NO new subcommand. The 13-noun CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly. The only operator-visible surface change is one optional filter flag on the existing `tusq review` command (`--sensitivity <class>`) plus an additive manifest field (`capability.sensitivity_class`) that surfaces in `tusq review`, `tusq docs`, and `tusq diff` output. M28 mutates the observable behavior of `tusq manifest` (it now emits a computed `sensitivity_class` instead of constant `"unknown"`) and the per-capability rendering of `tusq review`, `tusq docs`, and `tusq diff` (they now display the field) but introduces no new entry point.

| Command | M28 surface change |
|---------|--------------------|
| `tusq manifest` | Each capability gains a computed `sensitivity_class` field via `classifySensitivity(cap)` |
| `tusq review [--sensitivity <class>]` | New optional filter flag; output displays `sensitivity_class` per capability |
| `tusq docs` | Per-capability section displays `sensitivity_class` |
| `tusq diff` | Sensitivity changes surface as review-required entries (via the existing M13 capability_digest flip) |
| `tusq compile` | Unchanged — output is byte-identical regardless of `sensitivity_class` value |
| `tusq approve` | Unchanged — gate logic depends only on `approved` / `review_needed` fields |
| `tusq serve` | Unchanged — MCP tool list is unaffected by `sensitivity_class` |
| `tusq policy init` / `tusq policy verify` (default and `--strict`) | Unchanged — `sensitivity_class` is never a policy input |
| `tusq redaction review` | Unchanged stdout/stderr behavior; the existing field echo continues to copy the manifest's `sensitivity_class` value verbatim (now a computed value instead of constant `"unknown"`) |

### M28 Flags And Options

| Flag | Default | Effect |
|------|---------|--------|
| `--sensitivity <class>` (on `tusq review` only) | unset | Filter the review output to capabilities whose `sensitivity_class` matches; `<class>` MUST be one of `public`, `internal`, `confidential`, `restricted`, `unknown`; an unknown filter value exits 1 with `Unknown sensitivity class: <value>` on stderr before any output |

The filter is advisory-only: it does NOT change the exit-code semantics of `tusq review` (exit 0 still means no blocking concerns; exit 1 still means unapproved or low-confidence capabilities were found — the filter does not hide those). Operators remain responsible for reviewing all capabilities regardless of sensitivity label.

### M28 Closed Enum

| Value | Assigned by | Meaning |
|-------|-------------|---------|
| `public` | R6 default | Evidence is present and no stronger rule matched |
| `internal` | R5 | `auth_required === true` OR write-set verb without PII/financial signal |
| `confidential` | R3 or R4 | Non-empty `redaction.pii_categories` (R3) or write verb + financial route/param (R4) |
| `restricted` | R1 or R2 | `preserve === true` (R1) or admin/destructive verb / admin-namespaced route (R2) |
| `unknown` | zero-evidence guard | No verb, no route, no params, no redaction, no preserve flag, no `auth_required` |

The five values are the entire legal set. No other value, nullable, or wildcard is permitted in `capability.sensitivity_class`.

### M28 Frozen Decision Table (Six Rules, First-Match-Wins)

| Rule | Condition | Assigned class |
|------|-----------|----------------|
| R1 | `capability.preserve === true` | `restricted` |
| R2 | `capability.verb` in `{delete, drop, truncate, admin, destroy, purge, wipe}` OR route segment matches `^(admin|root|superuser)(/|$)` | `restricted` |
| R3 | `capability.redaction.pii_categories` is non-empty | `confidential` |
| R4 | `capability.verb` in `{create, update, write, post, put, patch}` AND (route OR any param key) matches `/payment|invoice|charge|billing|ssn|tax|account_number/i` | `confidential` |
| R5 | `capability.auth_required === true` OR (verb in write set AND no PII/financial signal) | `internal` |
| R6 | (no prior rule matched, evidence present) | `public` |

Rule precedence is fixed: R1 beats all others; R2 beats R3; R3 beats R4; earlier rules always win. The frozen rule table is enumerated verbatim in SYSTEM_SPEC § M28 and codified in Constraint 21; any rule change is a material governance event requiring its own ROADMAP milestone.

### M28 Manifest Output Shape

| Field | M28 effect |
|-------|------------|
| `capability.sensitivity_class` | Computed by `classifySensitivity(cap)` on every manifest generation; closed five-value enum |
| `capability.capability_digest` | Re-computed because `sensitivity_class` is now a content field; flips on first post-M28 manifest regeneration for every capability that previously had `"unknown"` and now receives a computed value |
| `capability.approved` | Resets to `false` on digest flip per existing M13 semantics; reviewers re-attest before promotion |
| All other capability fields | Unchanged |

### M28 Default Preservation

| Field / Command | M28 effect |
|-----------------|------------|
| `tusq compile` output | Byte-identical regardless of `sensitivity_class` value (AC-9 invariant) |
| `tusq approve` gate | Unchanged — depends only on `approved` and `review_needed` |
| `tusq serve` MCP surface | Unchanged — tool-list filter is `approved: true` AND `review_needed: false` |
| `tusq policy verify` (default and `--strict`) | Unchanged — `sensitivity_class` is never a policy input |
| `tusq redaction review` output | Unchanged stdout/stderr discipline; field echo follows the manifest |
| 13-command CLI surface | Preserved exactly — no new top-level noun, no new subcommand |
| Empty-stdout invariant | All exit-1 paths continue to write empty stdout with stderr-only error text |
| Em-dash U+2014 invariant | Preserved in any new help text or error messages introduced by M28 |

### M28 Failure UX

| Situation | Operator sees | Exit code |
|-----------|---------------|-----------|
| `tusq review --sensitivity <legal-value>` matches at least one capability | Filtered review output on stdout | 0 (when no blocking concerns remain) |
| `tusq review --sensitivity <legal-value>` matches zero capabilities | Empty review section on stdout | 0 |
| `tusq review --sensitivity <illegal-value>` | `Unknown sensitivity class: <value>` on stderr; stdout is empty; legal values list is part of the error message | 1 |
| `--sensitivity` provided without a value | `--sensitivity requires a value` on stderr; stdout is empty | 1 |

**Stream discipline:** Every exit-1 row above has `stdout === ""`. Operators who pipe stdout to a file get a zero-byte file on failure. Error text is written to stderr only.

### M28 Local-Only Invariants

| Invariant | How it shows up at review time |
|-----------|---------------------------------|
| Pure function | `classifySensitivity` has no I/O, no network, no clock, no filesystem reads beyond the manifest record |
| Deterministic | Same manifest record → same `sensitivity_class`; byte-stable across Node.js processes and platforms |
| Closed enum | No value outside `{public, internal, confidential, restricted, unknown}` may be emitted |
| Zero-evidence unknown | Capabilities with no verb, no route, no params, no redaction, no preserve, no auth_required MUST receive `"unknown"` (never silently `"public"`) |
| Zero new dependencies | `package.json` MUST NOT gain any classification, ML, compliance, or sensitivity-inference library |
| Compile-output-invariant | `tusq compile` output is byte-identical for two manifests differing only in `sensitivity_class`; golden-file smoke assertion enforces this at merge time |
| Frozen rule table | The six-rule first-match-wins table is locked by SYSTEM_SPEC § M28, Constraint 21, and the eval regression scenarios; any rule change is a material governance event requiring its own ROADMAP milestone |
| Reviewer-aid framing | `sensitivity_class` MUST NOT be presented as runtime PII enforcement, automated compliance certification, or GDPR/HIPAA/PCI/SOC2 attestation in any docs, marketing, CLI output, or eval scenario |

## M29 Product CLI Surface

M29 introduces NO new CLI noun and NO new subcommand. The 13-noun CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) is preserved exactly. The only operator-visible surface change is one optional filter flag on the existing `tusq review` command (`--auth-scheme <scheme>`) plus an additive structured manifest field (`capability.auth_requirements`) that surfaces in `tusq review`, `tusq docs`, and `tusq diff` output. M29 mutates the observable behavior of `tusq manifest` (it now emits a computed `auth_requirements` record on every capability) and the per-capability rendering of `tusq review`, `tusq docs`, and `tusq diff` (they now display the field) but introduces no new entry point.

| Command | M29 surface change |
|---------|--------------------|
| `tusq manifest` | Each capability gains a computed `auth_requirements` record via `classifyAuthRequirements(cap)` |
| `tusq review [--auth-scheme <scheme>]` | New optional filter flag (mutually compatible with `--sensitivity`); output displays `auth_requirements` per capability |
| `tusq docs` | Per-capability section displays `auth_requirements` |
| `tusq diff` | Auth-requirements changes surface as review-required entries (via the existing M13 `capability_digest` flip) |
| `tusq compile` | Unchanged — output is byte-identical regardless of `auth_requirements` value |
| `tusq approve` | Unchanged — gate logic depends only on `approved` / `review_needed` fields |
| `tusq serve` | Unchanged — `tools/list`, `tools/call`, `dry_run_plan` response shapes do NOT include `auth_requirements` |
| `tusq policy init` / `tusq policy verify` (default and `--strict`) | Unchanged — `auth_requirements` is never a policy input |
| `tusq redaction review` | Unchanged — stdout/stderr discipline preserved byte-for-byte |

### M29 Flags And Options

| Flag | Default | Effect |
|------|---------|--------|
| `--auth-scheme <scheme>` (on `tusq review` only) | unset | Filter the review output to capabilities whose `auth_requirements.auth_scheme` matches; `<scheme>` MUST be one of `bearer`, `api_key`, `session`, `basic`, `oauth`, `none`, `unknown`; an unknown filter value exits 1 with `Unknown auth scheme: <value>` on stderr before any output |
| `--auth-scheme` + `--sensitivity` | both unset | When both are supplied, results are filtered AND-style (a capability must match both filters); mutual compatibility is asserted in the smoke suite |

The filter is advisory-only: it does NOT change the exit-code semantics of `tusq review` (exit 0 still means no blocking concerns; exit 1 still means unapproved or low-confidence capabilities were found — the filter does not hide those). Operators remain responsible for reviewing all capabilities regardless of `auth_scheme` label.

### M29 Closed `auth_scheme` Enum (Seven Values)

| Value | Assigned by | Meaning |
|-------|-------------|---------|
| `bearer` | R1 | Middleware-name matches `/bearer\|jwt\|access[_-]?token/i` |
| `api_key` | R2 | Middleware-name matches `/api[_-]?key\|x-api-key/i` |
| `session` | R3 | Middleware-name matches `/session\|cookie\|passport-local/i` |
| `basic` | R4 | Middleware-name matches `/basic[_-]?auth/i` |
| `oauth` | R5 | Middleware-name matches `/oauth\|oidc\|openid/i` |
| `none` | R6 | `auth_required === false` AND non-admin route prefix |
| `unknown` | zero-evidence guard or default | No middleware, no route, no `auth_required`, no `sensitivity_class` signal — OR evidence present but no rule matched |

The seven values are the entire legal set. No other value, nullable, or wildcard is permitted in `auth_requirements.auth_scheme`.

### M29 Closed `evidence_source` Enum (Five Values)

| Value | Meaning |
|-------|---------|
| `middleware_name` | Classification driven by R1–R5 middleware-name regex match |
| `route_prefix` | Classification driven by route segment evidence |
| `auth_required_flag` | Classification driven by R6 `auth_required === false` path |
| `sensitivity_class_propagation` | Classification informed by `sensitivity_class` (admin/restricted route gating) |
| `none` | Zero-evidence guard fired; record is `unknown` with empty arrays |

### M29 Frozen Decision Table (Six Rules, First-Match-Wins)

| Rule | Condition | Assigned `auth_scheme` |
|------|-----------|------------------------|
| R1 | Any middleware_name matches `/bearer\|jwt\|access[_-]?token/i` | `bearer` |
| R2 | Any middleware_name matches `/api[_-]?key\|x-api-key/i` | `api_key` |
| R3 | Any middleware_name matches `/session\|cookie\|passport-local/i` | `session` |
| R4 | Any middleware_name matches `/basic[_-]?auth/i` | `basic` |
| R5 | Any middleware_name matches `/oauth\|oidc\|openid/i` | `oauth` |
| R6 | `auth_required === false` AND no admin/restricted route prefix | `none` |
| default | (no prior rule matched) | `unknown` |

Rule precedence is fixed: R1 beats all others; earlier rules always win. The frozen rule table is enumerated verbatim in SYSTEM_SPEC § M29 and codified in Constraint 22; any rule change is a material governance event requiring its own ROADMAP milestone.

### M29 Frozen Scope/Role Extraction Rules

| Rule | Pattern | Behavior |
|------|---------|----------|
| Scopes | `/scopes?:\s*\[([^\]]+)\]/` over middleware-annotation literals | Preserved declaration order; case-sensitive dedup; `[]` on zero matches |
| Roles | `/role[s]?:\s*\[([^\]]+)\]/` over middleware-annotation literals | Preserved declaration order; case-sensitive dedup; `[]` on zero matches |

The extractor reads ONLY already-built capability record fields. No regex over arbitrary source files. No filesystem reads beyond what manifest generation performs.

### M29 Manifest Output Shape

| Field | M29 effect |
|-------|------------|
| `capability.auth_requirements` | Computed by `classifyAuthRequirements(cap)` on every manifest generation; closed-shape record `{ auth_scheme, auth_scopes, auth_roles, evidence_source }` |
| `capability.auth_requirements.auth_scheme` | Closed seven-value enum `{bearer, api_key, session, basic, oauth, none, unknown}` |
| `capability.auth_requirements.auth_scopes` | `string[]`, order-preserved, case-sensitively deduped, `[]` when zero matches (never `null`, never absent) |
| `capability.auth_requirements.auth_roles` | `string[]`, order-preserved, case-sensitively deduped, `[]` when zero matches (never `null`, never absent) |
| `capability.auth_requirements.evidence_source` | Closed five-value enum `{middleware_name, route_prefix, auth_required_flag, sensitivity_class_propagation, none}` |
| `capability.capability_digest` | Re-computed because `auth_requirements` is now a content field; flips on first post-M29 manifest regeneration for every capability |
| `capability.approved` | Resets to `false` on digest flip per existing M13 semantics; reviewers re-attest before promotion |
| All other capability fields | Unchanged |

### M29 Default Preservation

| Field / Command | M29 effect |
|-----------------|------------|
| `tusq compile` output | Byte-identical regardless of `auth_requirements` value (AC-7 invariant) |
| `tusq approve` gate | Unchanged — depends only on `approved` and `review_needed` |
| `tusq serve` MCP surface | Unchanged — `auth_requirements` MUST NOT appear in `tools/list`, `tools/call`, or `dry_run_plan` responses |
| `tusq policy verify` (default and `--strict`) | Unchanged — `auth_requirements` is never a policy input |
| `tusq redaction review` output | Unchanged stdout/stderr discipline; field echo follows the manifest |
| 13-command CLI surface | Preserved exactly — no new top-level noun, no new subcommand |
| Empty-stdout invariant | All exit-1 paths continue to write empty stdout with stderr-only error text |
| Em-dash U+2014 invariant | Preserved in any new help text or error messages introduced by M29 |
| `--sensitivity` filter (M28) | Unchanged; `--auth-scheme` intersects AND-style with `--sensitivity` |

### M29 Failure UX

| Situation | Operator sees | Exit code |
|-----------|---------------|-----------|
| `tusq review --auth-scheme <legal-value>` matches at least one capability | Filtered review output on stdout | 0 (when no blocking concerns remain) |
| `tusq review --auth-scheme <legal-value>` matches zero capabilities | Empty review section on stdout | 0 |
| `tusq review --auth-scheme <illegal-value>` | `Unknown auth scheme: <value>` on stderr; stdout is empty; legal values list is part of the error message | 1 |
| `--auth-scheme` provided without a value | `--auth-scheme requires a value` on stderr; stdout is empty | 1 |
| `tusq review --auth-scheme bearer --sensitivity restricted` | Filtered review output, intersection AND-style; both filters validated independently | 0 (when no blocking concerns) / 1 (legal-value validation failure on either) |

**Stream discipline:** Every exit-1 row above has `stdout === ""`. Operators who pipe stdout to a file get a zero-byte file on failure. Error text is written to stderr only.

### M29 Local-Only Invariants

| Invariant | How it shows up at review time |
|-----------|---------------------------------|
| Pure function | `classifyAuthRequirements` has no I/O, no network, no clock, no filesystem reads beyond the manifest record |
| Deterministic | Same manifest record → same `auth_requirements`; byte-stable across Node.js processes and platforms |
| Closed enums | No value outside the seven-value `auth_scheme` set or the five-value `evidence_source` set may be emitted |
| Empty-array invariant | `auth_scopes` and `auth_roles` MUST be `[]` (never `null`, never absent) when zero matches are found |
| Zero-evidence unknown | Capabilities with no middleware, no route, no `auth_required`, no `sensitivity_class` signal MUST receive `unknown` (never silently `"none"`) |
| Zero new dependencies | `package.json` MUST NOT gain `passport`, `jsonwebtoken`, `oauth2-server`, or any AAA library |
| Compile-output-invariant | `tusq compile` output is byte-identical for two manifests differing only in `auth_requirements`; golden-file smoke assertion enforces this at merge time |
| Serve-surface-invariant | `tusq serve` `tools/list` / `tools/call` / `dry_run_plan` response shapes do NOT include `auth_requirements`; smoke assertion enforces this |
| Frozen rule table | The six-rule first-match-wins table is locked by SYSTEM_SPEC § M29, Constraint 22, and the eval regression scenarios; any rule change is a material governance event requiring its own ROADMAP milestone |
| Frozen scope/role extraction | The two extraction regexes and the order-preserving case-sensitive dedup are locked by SYSTEM_SPEC § M29 and the eval regression scenarios |
| Reviewer-aid framing | `auth_requirements` MUST NOT be presented as runtime AAA enforcement, automated AAA certification, or OAuth/OIDC/SAML/SOC2/ISO27001 attestation in any docs, marketing, CLI output, or eval scenario |

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

## Run-Specific Re-Affirmation — run_94746c3508844fcb / turn_6551742f923b14ee

This command-surface document is re-anchored unchanged in run `run_94746c3508844fcb` (turn `turn_6551742f923b14ee`, planning phase, attempt 1) on HEAD `782780b`. Independent verification: `node bin/tusq.js help` on HEAD 782780b enumerates exactly the 13 shipped commands — init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help — matching this surface document's M29 § "13-command CLI surface preserved exactly" invariant. The only new operator-visible surface from M29 (V1.10) is the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command (mutually compatible with M28's `--sensitivity` via AND-style intersection): no new top-level noun, no new subcommand, no environment-variable gate, no new dependency in `package.json`. The M29 manifest output shape (`auth_requirements: { auth_scheme, auth_scopes, auth_roles, evidence_source }` with closed seven-value and five-value enums, AC-4 zero-evidence `unknown` guard, frozen six-rule decision table, frozen scope/role extraction rules), the AC-7 `tusq compile` byte-identity invariant, and the stronger MCP-surface invariant (`tusq serve` `tools/list` / `tools/call` / `dry_run_plan` byte-for-byte unchanged, `auth_requirements` MUST NOT appear in any MCP response) all carry forward verbatim from the parent run chain. `npm test` exits 0 with 16 scenarios. This re-affirmation makes no surface mutation; it records this run's independent verification for audit continuity.

## Run-Specific Re-Affirmation — run_6d12fe85d0e51576 / turn_534487732e1e53b2

This command-surface document is re-anchored unchanged in run `run_6d12fe85d0e51576` (turn `turn_534487732e1e53b2`, planning phase, attempt 1) on HEAD `b7cd4b0`. Independent verification: `node bin/tusq.js help` on HEAD b7cd4b0 enumerates exactly the 13 shipped commands — init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help — matching this surface document's M29 § "13-command CLI surface preserved exactly" invariant. The only new operator-visible surface from M29 (V1.10) is the optional `--auth-scheme <scheme>` filter on the existing `tusq review` command (mutually compatible with M28's `--sensitivity` via AND-style intersection): no new top-level noun, no new subcommand, no environment-variable gate, no new dependency in `package.json`. The M29 manifest output shape (`auth_requirements: { auth_scheme, auth_scopes, auth_roles, evidence_source }` with closed seven-value and five-value enums, AC-4 zero-evidence `unknown` guard, frozen six-rule decision table, frozen scope/role extraction rules), the AC-7 `tusq compile` byte-identity invariant, and the stronger MCP-surface invariant (`tusq serve` `tools/list` / `tools/call` / `dry_run_plan` byte-for-byte unchanged, `auth_requirements` MUST NOT appear in any MCP response) all carry forward verbatim from the parent run chain. `npm test` exits 0 with 16 scenarios. This re-affirmation makes no surface mutation; it records this run's independent verification for audit continuity.

## Run-Specific Re-Affirmation — run_2ee1a03651d5d485 / turn_2cc0b42362df3fd3

This command-surface document is re-anchored unchanged in run `run_2ee1a03651d5d485` (turn `turn_2cc0b42362df3fd3`, planning phase, attempt 1) on HEAD `a46d3cb`. Independent verification: `node bin/tusq.js help` on HEAD a46d3cb enumerates exactly the 13 shipped commands — init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help — matching this surface document's M29 § "13-command CLI surface preserved exactly" invariant. `npm test` exits 0 with 16 scenarios.

**Vision-derived charter received this turn (intent_1777171732846_289f, p2):** "[vision] The Promise: embeddable chat, widget, command-palette, and voice surfaces." The PM has materialized a charter sketch in `.planning/ROADMAP_NEXT_CANDIDATES.md` § "Vision-Derived Charter Candidate: Static Embeddable-Surface Plan Export (V2 First Step)" proposing a single new top-level noun `surface` with subcommand `plan`, frozen four-value `surface` enum (`chat`/`palette`/`widget`/`voice`), and four-flag surface (`--surface`/`--manifest`/`--out`/`--json`). If chartered, the CLI surface would grow from 13 → 14 commands; this is the first new top-level noun proposal since `redaction` (M27). PM has **explicitly flagged** that the operator should weigh `tusq plan surface` as a sub-noun under a future planning hub before binding the charter, since adding a new top-level noun every milestone would dilute the operator-facing surface discipline. This re-affirmation makes no surface mutation; it records this run's independent verification and the candidate charter for audit continuity.

## Run-Specific Re-Affirmation — run_42732dba3268a739 / turn_1e0689ffd021d2d5

This command-surface document is re-anchored unchanged in run `run_42732dba3268a739` (turn `turn_1e0689ffd021d2d5`, planning phase, attempt 1, runtime `local-pm`) on HEAD `1d3f074`. Independent verification: `node bin/tusq.js help` on HEAD 1d3f074 enumerates exactly the 13 shipped commands — init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help — matching this surface document's M29 § "13-command CLI surface preserved exactly" invariant. `npm test` exits 0 with `Smoke tests passed` and `Eval regression harness passed (16 scenarios)`.

**Vision-derived charter received this turn (intent_1777173722739_5899, p2):** "[vision] The Promise: a self-hostable runtime and MCP server." Distinct from the prior run's embeddable-surface charter; this run targets the runtime + MCP half of **The Promise**. The PM has materialized a charter sketch in `.planning/ROADMAP_NEXT_CANDIDATES.md` § "Vision-Derived Charter Candidate: MCP Server Static Descriptor Export (V2 Self-Host First Step)" for a static, deterministic, manifest-only command that captures the *describe-only* shape of `tusq serve` (which is already in this 13-command surface as the existing `serve` command — "Start describe-only local MCP endpoint") into a registry-compatible static JSON file.

**Open scope decision the operator must resolve at the planning_signoff gate (PM does NOT pre-commit to any form):** noun-vs-flag form for the new command — (A) new top-level noun `mcp` with subcommand `export` (CLI surface 13 → 14, compounding top-level surface growth alongside the prior run's proposed `surface` noun → 13 → 15 if both vision-derived charters bind in form (A)), (B) flag-only extension `tusq serve --export <path>` (CLI surface stays at 13; overloads the `serve` verb — which today only starts a server — with a non-server emit mode, which conflicts with the "verbs do one thing" surface discipline this document holds), (C) subcommand under a future `plan` hub (`tusq plan mcp` alongside the proposed `tusq plan surface`; presupposes chartering a `plan` hub first).

**PM scope-protection callout (this is the surface document's responsibility):** if the operator binds **both** vision-derived charters in form (A), the CLI surface would grow from 13 → 15 commands in two consecutive milestones. This document's M29 § established the "13-command CLI surface preserved exactly" invariant; that invariant has held across M27 (added `redaction` as the first new noun since the original 12-command surface — 12 → 13), M28 (no new noun, only `--sensitivity` filter on existing `tusq review`), and M29 (no new noun, only `--auth-scheme` filter on existing `tusq review`). Adding **two** new top-level nouns in two consecutive milestones would break the cadence the surface discipline has held since M28. The operator should weigh form (B) or form (C) for at least one of the two charters before binding both as form (A). PM does NOT pre-commit to any resolution; the operator decides at the planning_signoff gate.

**This re-affirmation makes no surface mutation.** The charter sketch is intentionally housed in the candidate backlog (not in this document) because binding it requires human approval at the planning_signoff gate. The 13-command CLI surface (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) remains intact on HEAD 1d3f074. Both vision-derived candidates coexist in `ROADMAP_NEXT_CANDIDATES.md` as mutually-independent operator-decision-pending items — neither presupposes the other.

## M30 Product CLI Surface

> **PM scope binding (run_24ccd92f593d8647, turn_fa7dbb75b01943f5, planning phase):** This § materializes the M30 CLI surface contract at PM scope level. The dev role is accountable for the implementation-level surface details (help-text byte sequence, exit-code constants, smoke fixtures) during the implementation phase per the M27/M28/M29 precedent.

M30 introduces exactly one new top-level CLI noun, `surface`, with exactly one subcommand, `plan`. The shipped tusq CLI surface grows from 13 nouns (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, version, help) to **14 nouns** (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, surface, version, help); the total entry-point count grows by one (`tusq surface plan`). The new noun `surface` is inserted alphabetically between `serve` and `redaction` in the help enumeration so the help block remains stably ordered. M30 mutates no existing command's observable behavior.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq surface` | Enumerates `surface` subcommands (prints `plan`) | Successful subcommand listing |
| `tusq surface plan` | Emits a deterministic per-surface plan describing what each embeddable surface (chat, palette, widget, voice) **would** look like for the current manifest under current sensitivity/auth/side-effect posture | The manifest was read successfully and the plan was written to stdout (or to `--out <path>` if supplied) |

### M30 Flags And Options

| Flag | Default | Effect |
|------|---------|--------|
| `--surface <chat\|palette\|widget\|voice\|all>` | `all` | Restrict output to one surface, or emit all four; `all` produces sections in the frozen order chat → palette → widget → voice |
| `--manifest <path>` | `tusq.manifest.json` (cwd) | Manifest file to read; file must exist and parse as JSON with a top-level `capabilities` array |
| `--out <path>` | unset | Write the plan output to `<path>` instead of stdout; on success, stdout is empty; the path MUST NOT resolve inside `.tusq/` |
| `--json` | unset | Emit machine-readable JSON instead of the human-readable plan; same content-determinism guarantees apply |

There are no other flags. `tusq surface plan --help` prints the flag surface, the closed four-value `surface` enum (plus `all`), the closed six-value `gated_reason` enum, exit codes, and the explicit "This is a planning aid, not a runtime surface generator" callout.

### M30 Closed Enums

| Enum | Values |
|------|--------|
| `surface` (frozen four-value) | `chat`, `palette`, `widget`, `voice` |
| `gated_reason` (frozen six-value) | `unapproved`, `restricted_sensitivity`, `confidential_sensitivity`, `destructive_side_effect`, `auth_scheme_unknown`, `auth_scheme_oauth_pending_v2` |

Both enums are immutable once M30 ships. Adding a value (e.g., `email` or `slack-bot` to `surface`; a new gating reason) is a material governance event under its own ROADMAP milestone with a fresh re-approval expectation and a RELEASE_NOTES entry. An implementation-time error (synchronous throw) MUST fire if `classifyGating(capability, surface)` ever returns a value outside the closed `gated_reason` set.

### M30 Per-Surface Eligibility Precedence (First-Match-Wins)

| Order | Gate | `gated_reason` on failure |
|-------|------|---------------------------|
| 1 | `capability.approved === true` | `unapproved` |
| 2 | `capability.sensitivity_class !== "restricted"` (chat / palette / voice; widget exception) | `restricted_sensitivity` |
| 3 | `capability.sensitivity_class !== "confidential"` (chat / palette / voice; widget exception) | `confidential_sensitivity` |
| 4 | side-effect class allowance (palette and voice forbid destructive) | `destructive_side_effect` |
| 5 | `capability.auth_requirements.auth_scheme !== "unknown"` (all surfaces) | `auth_scheme_unknown` |
| 6 | `capability.auth_requirements.auth_scheme !== "oauth"` (all surfaces; deferred to V2) | `auth_scheme_oauth_pending_v2` |

Per-surface gate set: chat (1, 2, 3, 5, 6 — destructive verbs allowed); palette (1, 2, 3, 4, 5, 6 — lowest-risk surface); widget (1, 5, 6 — confidential/restricted permitted under same-session proxy semantics; split by side-effect class into `action_widgets`/`insight_widgets`); voice (1, 2, 3, 4, 5, 6 — destructive flows reserved for V2 confirmation milestone).

### M30 Plan Shape (JSON)

| Field | Source | Notes |
|-------|--------|-------|
| `manifest_path` | `--manifest` or default | Resolved input path |
| `manifest_version` | copied from manifest | Not re-stamped (M27 fallback applies) |
| `generated_at` | copied from manifest | Not re-stamped; keeps plan content-deterministic |
| `surfaces[]` | enum-driven; frozen order chat → palette → widget → voice | Empty array when `capabilities: []` |
| `surfaces[].surface` | one of `chat`/`palette`/`widget`/`voice` | Closed four-value enum |
| `surfaces[].eligible_capabilities[]` | manifest declared order | Capability names; gates 1+per-surface pass |
| `surfaces[].gated_capabilities[]` | manifest declared order | `{name, reason}` objects with closed-enum reason |
| `surfaces[].entry_points` | per-surface keyed object | Derived from M9 domain + verb data |
| `surfaces[].redaction_posture` | per eligible capability | Copy-forward of M27 advisory set verbatim |
| `surfaces[].auth_posture` | per eligible capability | Copy-forward of M29 `auth_requirements` verbatim |
| `surfaces[].brand_inputs_required[]` | frozen named-list per surface | Names only; no values; no template strings |

### M30 Frozen `brand_inputs_required` Named-Lists (V1.11)

| Surface | `brand_inputs_required[]` (frozen names; no values) |
|---------|-----------------------------------------------------|
| `chat` | `["brand.tone", "brand.color_primary", "brand.color_secondary", "brand.font_family"]` |
| `palette` | `["brand.color_primary", "brand.font_family"]` |
| `widget` | `["brand.color_primary", "brand.color_accent", "brand.layout_density", "brand.radius"]` |
| `voice` | `["brand.tone", "voice.persona", "voice.greeting"]` |

The lists are immutable once M30 ships; any addition is a material governance event under its own ROADMAP milestone.

### M30 Default Preservation

| Field / Command | M30 effect |
|-----------------|------------|
| `tusq.manifest.json` | Unchanged — mtime and content are byte-identical before/after any plan run |
| `capability.capability_digest` | Unchanged — M30 performs zero writes to manifest, so no digest flip |
| `tusq scan` / `tusq manifest` / `tusq compile` / `tusq serve` / `tusq approve` / `tusq diff` / `tusq docs` / `tusq version` / `tusq help` | Unchanged |
| `tusq policy init` / `tusq policy verify` (default and `--strict`) | Unchanged |
| `tusq review` / `tusq redaction review` | Unchanged |

### M30 Failure UX

| Situation | Operator sees | Exit code |
|-----------|---------------|-----------|
| Plan succeeded | Per-surface plan on stdout (or written to `--out` path with empty stdout) | 0 |
| Empty-capabilities (`capabilities: []`, valid scaffold state) | Single line `No capabilities in manifest — nothing to plan.` on stdout in human mode; `{manifest_path, manifest_version, generated_at, surfaces: []}` on stdout in `--json` mode | 0 |
| `--manifest` points to a missing file | `Manifest not found: <path>` on stderr; stdout empty | 1 |
| Manifest is present but not valid JSON | `Invalid manifest JSON: <path>` on stderr; stdout empty | 1 |
| Manifest is valid JSON but lacks a top-level `capabilities` array (or it is non-array) | `Invalid manifest: missing capabilities array` on stderr; stdout empty | 1 |
| `--surface <value>` is not in the closed five-token set | `Unknown surface: <value>` on stderr; stdout empty | 1 |
| Unknown subcommand under `tusq surface` | `Unknown subcommand: <name>` on stderr; stdout empty | 1 |
| Unknown flag on `tusq surface plan` | `Unknown flag: <flag>` on stderr; stdout empty | 1 |
| `--out <path>` is unwritable | `Cannot write to --out path: <path>` on stderr; stdout empty | 1 |
| `--out <path>` resolves inside `.tusq/` | `--out path must not be inside .tusq/` on stderr; stdout empty | 1 |

**Stream discipline:** Every exit-1 row above has `stdout === ""`. Operators who pipe stdout to a file get a zero-byte file on failure. Detection-before-output means no partial JSON or human section is written before an error surfaces. The empty-capabilities case (row 2) is deliberately exit 0 — a fresh `tusq init` repo with no routes yet is a valid scaffold state, not a hard failure.

### M30 Local-Only Invariants

| Invariant | How it shows up at plan time |
|-----------|-------------------------------|
| Read-only manifest | `tusq.manifest.json` is never opened for writing; mtime and content byte-identical before/after any invocation |
| No `.tusq/` write | `tusq surface plan` MUST NOT create or modify any file under `.tusq/`; `--out` rejects any path resolving inside `.tusq/` |
| No network I/O | No HTTP, DB, socket, or DNS lookup; no `fetch`/`http.request`/`net.connect` reachable from the subcommand |
| Zero new dependencies | `package.json` MUST NOT gain React, Vue, Lit, Web Speech polyfill, audio runtime, markdown renderer, or any chat/widget/voice/palette UI library |
| Zero `capability_digest` flips | Hash-before vs hash-after assertion is byte-identical on every capability |
| `tusq compile` byte-identity | Golden-file smoke assertion confirms compile output is byte-identical pre and post-M30 |
| `tusq serve` MCP surface byte-identity | `tools/list`, `tools/call`, `dry_run_plan` byte-for-byte unchanged; surface-plan fields MUST NOT appear in any MCP response |
| Deterministic output | Running twice on the same manifest produces byte-identical stdout in both human and `--json` modes; iteration order is fixed (surface enum chat → palette → widget → voice; capabilities in manifest declared order); no wall-clock fields inside per-surface entries |
| Frozen four-value `surface` enum | Locked by smoke fixture; any addition is a material governance event |
| Frozen six-value `gated_reason` enum | Locked by smoke fixture and synchronous throw on out-of-set return; any addition is a material governance event |
| Frozen `brand_inputs_required` named-lists | Names only; no values; no template strings; no brand profile read; locked by smoke fixture |
| First-match-wins gating | When a capability fails multiple gates, only the first failing gate's reason is recorded (e.g., `approved=false` AND `auth_scheme="oauth"` records `unapproved`, never `auth_scheme_oauth_pending_v2`) |
| M27 advisory copy-forward verbatim | No recomputation, no new advisory text |
| M29 `auth_requirements` copy-forward verbatim | No recoercion of `unknown` → `none` |
| Planning-aid framing | Help text, docs, README, launch artifacts MUST use "planning aid" language; MUST NOT use "generates a chat client", "renders a widget", "hosts a voice interface", "runs a command palette", "ships a runnable surface", "auto-brands the embed", "certifies accessibility", "publishes to a marketplace" |
| Future surface-generator milestones reserved | M-Chat-1, M-Palette-1, M-Widget-1, M-Voice-1 ship under their own ROADMAP entries with fresh acceptance contracts; M30 is **not** a substitute for any of them |

## M31 Product CLI Surface

M31 (Static Capability Domain Index Export from Manifest Evidence — V1.12) adds the `domain` top-level noun with a single subcommand `index`. The CLI surface grows from **14 → 15** commands, with `domain` inserted alphabetically between `diff` and `policy`.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq domain` | Enumerate domain subcommands | Help text printed |
| `tusq domain index` | Emit a per-domain capability index from manifest evidence | Index produced (or empty-capabilities manifest) |

### `tusq domain index` Flags

| Flag | Default | Effect |
|------|---------|--------|
| `--domain <name>` | unset (all domains) | Filter to a single domain bucket by manifest-declared name or the literal `unknown` |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | unset | Write index to file; no stdout on success |
| `--json` | unset | Emit machine-readable JSON |

### `aggregation_key` Enum (Frozen Two-Value)

| Value | Meaning |
|-------|---------|
| `domain` | The bucket aggregates capabilities sharing a named manifest `domain` value |
| `unknown` | The bucket aggregates capabilities whose `domain` field is `null`, missing, or empty-string |

The two-value enum is immutable once M31 ships. Any addition is a material governance event requiring its own ROADMAP milestone.

### Per-Domain Entry Shape

| Field | Type | Description |
|-------|------|-------------|
| `domain` | string | The manifest-declared domain value, or the literal `"unknown"` for the zero-evidence bucket |
| `aggregation_key` | `"domain" \| "unknown"` | Closed two-value enum |
| `capability_count` | integer | Number of capabilities in this bucket |
| `capabilities[]` | string[] | Capability names in manifest first-appearance order |
| `approved_count` | integer | Capabilities where `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_destructive_side_effect` | boolean | Any capability has `side_effect_class === "destructive"` |
| `has_restricted_or_confidential_sensitivity` | boolean | Any capability has `sensitivity_class ∈ {"restricted","confidential"}` |
| `has_unknown_auth` | boolean | Any capability has `auth_requirements.auth_scheme === "unknown"` or no auth_requirements |

### Iteration Order

Per-domain iteration order is the manifest's **first appearance** order — deterministic, never alphabetized. The `unknown` bucket (if any capability lacks a domain) is **always appended last**, regardless of where the first domainless capability appears in the manifest.

### M31 Default-Preservation Table (14 Commands Unchanged)

| Command | Behavior |
|---------|----------|
| All 14 existing commands (init, scan, manifest, compile, serve, review, docs, approve, diff, policy, redaction, surface, version, help) | Byte-identical stdout, stderr, and exit codes before and after M31 |

### M31 Failure UX

| Situation | Operator sees | Exit code |
|-----------|---------------|-----------|
| Index succeeded | Per-domain index on stdout (or written to `--out` path with empty stdout) | 0 |
| Empty-capabilities (`capabilities: []`, valid scaffold state) | Single line `No capabilities in manifest — nothing to index.` on stdout in human mode; `{manifest_path, manifest_version, generated_at, domains: []}` on stdout in `--json` mode | 0 |
| `--manifest` points to a missing file | `Manifest not found: <path>` on stderr; stdout empty | 1 |
| Manifest is present but not valid JSON | `Invalid manifest JSON: <path>` on stderr; stdout empty | 1 |
| Manifest is valid JSON but lacks a top-level `capabilities` array | `Invalid manifest: missing capabilities array` on stderr; stdout empty | 1 |
| `--domain <value>` does not match any bucket | `Unknown domain: <value>` on stderr; stdout empty | 1 |
| Unknown subcommand under `tusq domain` | `Unknown subcommand: <name>` on stderr; stdout empty | 1 |
| Unknown flag on `tusq domain index` | `Unknown flag: <flag>` on stderr; stdout empty | 1 |
| `--out <path>` is unwritable | `Cannot write to --out path: <path>` on stderr; stdout empty | 1 |
| `--out <path>` resolves inside `.tusq/` | `--out path must not be inside .tusq/` on stderr; stdout empty | 1 |

### M31 Local-Only Invariants

| Invariant | How it shows up at index time |
|-----------|-------------------------------|
| Read-only manifest | `tusq.manifest.json` is never opened for writing; mtime and content byte-identical before/after any invocation |
| No `.tusq/` write | `tusq domain index` MUST NOT create or modify any file under `.tusq/`; `--out` rejects any path resolving inside `.tusq/` |
| No network I/O | No HTTP, DB, socket, or DNS lookup |
| Zero new dependencies | `package.json` MUST NOT gain any new package |
| Zero `capability_digest` flips | Hash-before vs hash-after assertion is byte-identical on every capability |
| `tusq compile` byte-identity | Golden-file smoke assertion confirms compile output is byte-identical pre and post-M31 |
| `tusq surface plan` byte-identity | `tusq surface plan` output byte-for-byte unchanged pre and post-M31 |
| Deterministic output | Running twice on the same manifest produces byte-identical stdout in both human and `--json` modes; iteration order is fixed (manifest first-appearance order; `unknown` appended last); no wall-clock fields inside per-domain entries |
| Frozen two-value `aggregation_key` enum | Locked by eval scenario and synchronous throw on out-of-set return; any addition is a material governance event |
| Planning-aid framing | Help text, docs, README, launch artifacts MUST use "planning aid" language; MUST NOT use "generates skill packs", "rollout plan", "workflow definitions", "agent personas", or "domain access enforcement" |
| Future domain-export milestones reserved | M-Skills-1, M-Rollout-1, M-Workflow-1, M-Agent-Persona-1 ship under their own ROADMAP entries with fresh acceptance contracts; M31 is **not** a substitute for any of them |

## M32 Product CLI Surface

M32 (Static Capability Side-Effect Index Export from Manifest Evidence — V1.13) adds the `effect` top-level noun with a single subcommand `index`. The CLI surface grows from **15 → 16** commands, with `effect` inserted alphabetically between `domain` and `policy`.

| Command | Purpose | Exit 0 means |
|---------|---------|--------------|
| `tusq effect` | Enumerate effect subcommands | Help text printed |
| `tusq effect index` | Emit a per-side-effect-class capability index from manifest evidence | Index produced (or empty-capabilities manifest) |

### `tusq effect index` Flags

| Flag | Default | Effect |
|------|---------|--------|
| `--effect <read\|write\|destructive\|unknown>` | unset (all classes) | Filter to a single side-effect class bucket |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | unset | Write index to file; no stdout on success |
| `--json` | unset | Emit machine-readable JSON |

### `side_effect_class` Bucket-Key Enum (Frozen Four-Value)

| Value | Condition |
|-------|-----------|
| `read` | Capabilities with `side_effect_class === "read"` |
| `write` | Capabilities with `side_effect_class === "write"` |
| `destructive` | Capabilities with `side_effect_class === "destructive"` |
| `unknown` | Capabilities whose `side_effect_class` is `null`, missing, empty-string, or any value outside the three-value classifier set |

The four-value enum is immutable once M32 ships. Any addition is a material governance event requiring its own ROADMAP milestone.

### `aggregation_key` Enum (Frozen Two-Value)

| Value | Meaning |
|-------|---------|
| `class` | The bucket aggregates capabilities sharing a named `side_effect_class` value (`read`, `write`, or `destructive`) |
| `unknown` | The bucket aggregates capabilities in the zero-evidence catchall bucket |

The two-value enum is immutable once M32 ships. Any addition is a material governance event requiring its own ROADMAP milestone.

### Per-Bucket Entry Shape

| Field | Type | Description |
|-------|------|-------------|
| `side_effect_class` | string | One of `"read"`, `"write"`, `"destructive"`, or `"unknown"` |
| `aggregation_key` | `"class" \| "unknown"` | Closed two-value enum |
| `capability_count` | integer | Number of capabilities in this bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Capabilities where `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_restricted_or_confidential_sensitivity` | boolean | Any capability has `sensitivity_class ∈ {"restricted","confidential"}` |
| `has_unknown_auth` | boolean | Any capability has `auth_requirements.auth_scheme === "unknown"` or no auth_requirements |

### Iteration Order

Bucket iteration follows the **closed-enum order: `read → write → destructive`**, then `unknown` last. This is distinct from M31's first-appearance rule. Within each bucket, capability names follow **manifest declared order**. Empty buckets MUST NOT appear.

### M32 Default-Preservation Table (15 Commands Unchanged)

| Command | Behavior |
|---------|----------|
| All 15 existing commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, policy, redaction, surface, version, help) | Byte-identical stdout, stderr, and exit codes before and after M32 |

### M32 Failure UX

| Situation | Operator sees | Exit code |
|-----------|---------------|-----------|
| Index succeeded | Per-bucket index on stdout (or written to `--out` path with empty stdout) | 0 |
| Empty-capabilities (`capabilities: []`, valid scaffold state) | Single line `No capabilities in manifest — nothing to index.` on stdout in human mode; `{manifest_path, manifest_version, generated_at, effects: []}` on stdout in `--json` mode | 0 |
| `--manifest` points to a missing file | `Manifest not found: <path>` on stderr; stdout empty | 1 |
| Manifest is present but not valid JSON | `Invalid manifest JSON: <path>` on stderr; stdout empty | 1 |
| Manifest is valid JSON but lacks a top-level `capabilities` array | `Invalid manifest: missing capabilities array` on stderr; stdout empty | 1 |
| `--effect <value>` is not one of the four closed enum values | `Unknown effect: <value>` on stderr; stdout empty | 1 |
| `--effect <value>` is a valid enum value but no capabilities exist in that bucket | `Unknown effect: <value>` on stderr; stdout empty | 1 |
| Unknown subcommand under `tusq effect` | `Unknown subcommand: <name>` on stderr; stdout empty | 1 |
| Unknown flag on `tusq effect index` | `Unknown flag: <flag>` on stderr; stdout empty | 1 |
| `--out <path>` is unwritable | `Cannot write to --out path: <path>` on stderr; stdout empty | 1 |
| `--out <path>` resolves inside `.tusq/` | `--out path must not be inside .tusq/` on stderr; stdout empty | 1 |

### M32 Local-Only Invariants

| Invariant | How it shows up at index time |
|-----------|-------------------------------|
| Read-only manifest | `tusq.manifest.json` is never opened for writing; mtime and content byte-identical before/after any invocation |
| No `.tusq/` write | `tusq effect index` MUST NOT create or modify any file under `.tusq/`; `--out` rejects any path resolving inside `.tusq/` |
| No network I/O | No HTTP, DB, socket, or DNS lookup |
| Zero new dependencies | `package.json` MUST NOT gain any new package |
| Zero `capability_digest` flips | Hash-before vs hash-after assertion is byte-identical on every capability |
| `tusq compile` byte-identity | Golden-file smoke assertion confirms compile output is byte-identical pre and post-M32 |
| `tusq surface plan` byte-identity | `tusq surface plan` output byte-for-byte unchanged pre and post-M32 |
| `tusq domain index` byte-identity | `tusq domain index` output byte-for-byte unchanged pre and post-M32 |
| Deterministic output | Running twice on the same manifest produces byte-identical stdout in both human and `--json` modes; iteration order is fixed by the closed enum (`read → write → destructive → unknown`); no wall-clock fields inside per-bucket entries |
| Frozen four-value `side_effect_class` enum | Locked by eval scenario and synchronous throw on out-of-set return; any addition is a material governance event |
| Frozen two-value `aggregation_key` enum | Locked by eval scenario and synchronous throw on out-of-set return; any addition is a material governance event |
| Closed-enum order is NOT risk-precedence | The `read → write → destructive → unknown` order is a stable-output convention; docs/README/CLI-help MUST NOT describe it as "risk-ascending," "low-to-high," "safety-ordered," or any phrase implying risk semantics |
| Planning-aid framing | Help text, docs, README, launch artifacts MUST use "planning aid" language; MUST NOT use "enforces side-effect policy", "derives risk tier", "generates confirmation flows", "certifies destructive-action safety", or "alters the M30 gating rule" |
| Future side-effect milestones reserved | M-Risk-1, M-Confirm-1 ship under their own ROADMAP entries with fresh acceptance contracts; M32 is **not** a substitute for any of them |

## M33 Product CLI Surface

M33 (Static Capability Sensitivity Index Export from Manifest Evidence — V1.14) adds the `sensitivity` top-level noun with a single subcommand `index`. The CLI surface grows from **16 → 17** commands, with `sensitivity` inserted alphabetically between `redaction` and `surface` (`sensitivity` vs `surface`: `s-e` < `s-u`).

### M33 Command Table

| Command | Description |
|---------|-------------|
| `tusq sensitivity` | Enumerate subcommands block (mirrors `tusq effect`, `tusq domain`, `tusq surface`, etc.) |
| `tusq sensitivity index` | Produce a read-only, deterministic sensitivity-class index of the manifest's capabilities |

### M33 Flags

| Flag | Type | Default | Notes |
|------|------|---------|-------|
| `--sensitivity <class>` | string | all classes | Filter to a single sensitivity class bucket; unrecognized value exits 1 with `Unknown sensitivity: <value>` |
| `--manifest <path>` | string | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | string | — | Write index to file; no stdout on success; rejected if path is inside `.tusq/` |
| `--json` | boolean | false | Emit machine-readable JSON |

### M33 Frozen Five-Value `sensitivity_class` Bucket-Key Enum

| Value | Description |
|-------|-------------|
| `public` | Named class: publicly-accessible capability |
| `internal` | Named class: internal-use capability |
| `confidential` | Named class: confidential capability |
| `restricted` | Named class: restricted/high-sensitivity capability |
| `unknown` | Zero-evidence catchall for null/missing/invalid `sensitivity_class` |

The five-value enum aligns 1:1 with the M28 `SENSITIVITY_CLASSES` constant. M33 MUST reference `SENSITIVITY_CLASSES` directly — no independent enum is declared. The enum is immutable once M33 ships; any addition is a material governance event requiring its own ROADMAP milestone.

### M33 Frozen Two-Value `aggregation_key` Enum

| Value | Applied to |
|-------|-----------|
| `class` | Named buckets (`public`, `internal`, `confidential`, `restricted`) |
| `unknown` | Zero-evidence catchall bucket |

The two-value enum is immutable once M33 ships. Any addition is a material governance event requiring its own ROADMAP milestone.

### M33 Per-Bucket Entry Shape

| Field | Type | Notes |
|-------|------|-------|
| `sensitivity_class` | string | One of the five enum values |
| `aggregation_key` | string | `"class"` or `"unknown"` |
| `capability_count` | integer | Capabilities in this bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Capabilities with `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_destructive_side_effect` | boolean | True iff any capability in bucket has `side_effect_class === "destructive"` |
| `has_unknown_auth` | boolean | True iff any capability in bucket has `auth_requirements.auth_scheme === "unknown"` |

### M33 Bucket Iteration Order

Closed-enum order: `public → internal → confidential → restricted`, then `unknown` last. This is a deterministic stable-output convention — **NOT** a risk-precedence statement. Within each bucket, capabilities appear in manifest declared order.

### M33 Default-Preservation Table (16 Commands Unchanged)

| Commands | Invariant |
|----------|-----------|
| All 16 existing commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, policy, redaction, surface, version, help) | Byte-identical stdout, stderr, and exit codes before and after M33 |

### M33 Failure UX

| Error condition | Exit code | stderr | stdout |
|-----------------|-----------|--------|--------|
| Missing manifest file | 1 | `Manifest not found: <path>` | empty |
| Invalid JSON in manifest | 1 | `Invalid manifest JSON: <path>` | empty |
| Missing capabilities array | 1 | `Invalid manifest: missing capabilities array` | empty |
| Unknown `--sensitivity` value | 1 | `Unknown sensitivity: <value>` | empty |
| Unknown subcommand | 1 | `Unknown subcommand: <name>` | empty |
| Unknown flag | 1 | `Unknown flag: --<name>` | empty |
| `--out` unwritable | 1 | `Cannot write to --out path: <path>` | empty |
| `--out` inside `.tusq/` | 1 | `--out path must not be inside .tusq/` | empty |

### M33 Local-Only Invariants

| Invariant | Verification |
|-----------|-------------|
| Read-only manifest | mtime/content byte-identical before and after every `tusq sensitivity index` invocation |
| No `.tusq/` writes | Confirmed by absence of new files in `.tusq/` after any invocation |
| Zero `capability_digest` flips | Hash-before vs hash-after assertion is byte-identical on every capability |
| `tusq compile` byte-identity | Golden-file smoke assertion confirms compile output is byte-identical pre and post-M33 |
| `tusq surface plan` byte-identity | `tusq surface plan` output byte-for-byte unchanged pre and post-M33 |
| `tusq domain index` byte-identity | `tusq domain index` output byte-for-byte unchanged pre and post-M33 |
| `tusq effect index` byte-identity | `tusq effect index` output byte-for-byte unchanged pre and post-M33 |
| Deterministic output | Running twice on the same manifest produces byte-identical stdout in both human and `--json` modes; iteration order is fixed by the closed enum (`public → internal → confidential → restricted → unknown`); no wall-clock fields inside per-bucket entries |
| Frozen five-value `sensitivity_class` enum | Locked by eval scenario and synchronous throw on out-of-set return; any addition is a material governance event |
| Frozen two-value `aggregation_key` enum | Locked by eval scenario and synchronous throw on out-of-set return; any addition is a material governance event |
| Closed-enum order is NOT risk-precedence | The `public → internal → confidential → restricted → unknown` order is a stable-output convention; docs/README/CLI-help MUST NOT describe it as "risk-ascending," "sensitivity-ordered," "low-to-high," or any phrase implying risk semantics |
| Planning-aid framing | Help text, docs, README, launch artifacts MUST use "planning aid" language; MUST NOT use "enforces sensitivity policy", "certifies GDPR/HIPAA/PCI compliance", "generates retention policy", "alters the M28 classifier", or "alters the M30 gating rule" |
| Future sensitivity milestones reserved | M-Risk-1, M-Compliance-1 ship under their own ROADMAP entries with fresh acceptance contracts; M33 is **not** a substitute for any of them |

## M39 Product CLI Surface

M39 (Static Capability Required Input Field Count Tier Index Export from Manifest Evidence — V1.20) adds the `input` top-level noun with a single subcommand `index`. The CLI surface grows from **22 → 23** commands, with `input` inserted alphabetically between `examples` and `method` (`examples` vs `input`: `e` (101) < `i` (105); `input` vs `method`: `i` (105) < `m` (109)).

### M39 Command Table

| Command | Description |
|---------|-------------|
| `tusq input` | Print enumerate-subcommands block for input |
| `tusq input index` | Index capabilities by required input field count tier (static, read-only, planning aid) |

### M39 Flags

| Flag | Default | Effect |
|------|---------|--------|
| `--tier <none\|low\|medium\|high\|unknown>` | all tiers | Filter to single required input field count tier bucket; **case-sensitive lowercase only**; unrecognized value exits 1 with `Unknown required input field count tier: <value>`; valid-but-absent tier exits 1 with `No capabilities found for required input field count tier: <tier>` |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success; rejected if path is inside `.tusq/` |
| `--json` | human text | Emit machine-readable JSON |

### M39 Frozen Five-Value `required_input_field_count_tier` Bucket-Key Enum

`none | low | medium | high | unknown`

The enum is immutable once M39 ships. Any addition is a material governance event. `required_input_field_count_tier` is derived from `capability.input_schema.required[]` array cardinality (M11/M14/M24-derived) and is distinct from M37's `pii_field_count_tier` (string-shaped per-field hints) and M38's `examples_count_tier` (object-shaped eval-seed entries).

### M39 Frozen Two-Value `aggregation_key` Enum

| Value | Applied to |
|-------|-----------|
| `tier` | Named tier buckets (`none`, `low`, `medium`, `high`) |
| `unknown` | Zero-evidence / malformed input_schema catchall |

### M39 Frozen Tier Function Thresholds

| `capability.input_schema.required` condition | `required_input_field_count_tier` |
|----------------------------------------------|-----------------------------------|
| Valid array, `length === 0` | `none` |
| Valid array, `1 ≤ length ≤ 2` | `low` |
| Valid array, `3 ≤ length ≤ 5` | `medium` |
| Valid array, `length ≥ 6` | `high` |
| `input_schema` missing / `null` / `undefined` | `unknown` (warning: `input_schema_field_missing`) |
| `input_schema` not a plain non-null object (includes Array) | `unknown` (warning: `input_schema_field_not_object`) |
| `required` field missing / `null` / `undefined` | `unknown` (warning: `required_field_missing`) |
| `required` field not an array | `unknown` (warning: `required_field_not_array`) |
| `required[]` contains non-string, empty string, `null`, array, or object element | `unknown` (warning: `required_array_contains_non_string_or_empty_element`) |

Boundaries `0/2/5/6` are immutable once M39 ships.

### M39 Bucket Iteration Order

`none → low → medium → high → unknown` (closed-enum order — NOT an exposure-risk ranking, NOT a blast-radius ranking, NOT an input-complexity ranking)

### M39 Per-Bucket 8-Field Entry Shape

| Field | Type | Notes |
|-------|------|-------|
| `required_input_field_count_tier` | string | One of the five enum values |
| `aggregation_key` | string | `"tier"` or `"unknown"` |
| `capability_count` | integer | Capabilities in this bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Capabilities with `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_destructive_side_effect` | boolean | True iff any capability in bucket has `side_effect_class === "destructive"` |
| `has_restricted_or_confidential_sensitivity` | boolean | True iff any capability in bucket has `sensitivity_class` in `{restricted, confidential}` |

### M39 Warnings Shape

Warnings are emitted when `required_input_field_count_tier === "unknown"` due to malformed `input_schema` or `required` field data.

- **JSON mode**: `warnings[]` array of `{ capability: string, reason: string }` objects appended to the JSON output object (always present, even `[]`).
- **Human mode**: warning lines on stderr only.

Frozen five-value warning reason code enum: `input_schema_field_missing | input_schema_field_not_object | required_field_missing | required_field_not_array | required_array_contains_non_string_or_empty_element`

### M39 Failure UX

| Condition | Exit | stderr | stdout |
|-----------|------|--------|--------|
| Missing manifest | 1 | `Manifest file not found: <path>` | empty |
| Malformed JSON | 1 | `Failed to parse manifest JSON: <message>` | empty |
| Missing capabilities | 1 | `Manifest is missing capabilities array` | empty |
| Unknown flag | 1 | `Unknown flag: --<name>` | empty |
| Unknown tier filter value | 1 | `Unknown required input field count tier: <value>` | empty |
| Valid tier but no capabilities | 1 | `No capabilities found for required input field count tier: <tier>` | empty |
| Unknown subcommand | 1 | `Unknown subcommand: <name>` | empty |
| `--out` unwritable | 1 | `--out parent directory does not exist or is not writable` | empty |
| `--out` inside `.tusq/` | 1 | `--out path must not be inside .tusq/` | empty |
| Empty capabilities | 0 | — | `No capabilities in manifest — nothing to index.` |

### M39 Local-Only Invariants

- Zero manifest mutations; `tusq.manifest.json` mtime/content byte-identical before and after every invocation
- `required_input_field_count_tier` MUST NOT be written into `tusq.manifest.json`
- All prior index commands (`tusq domain index`, `tusq effect index`, `tusq sensitivity index`, `tusq method index`, `tusq auth index`, `tusq confidence index`, `tusq pii index`, `tusq examples index`) produce byte-identical output pre and post-M39
- Zero new dependencies in `package.json`

### M39 Planning-Aid Boundary

This is a planning aid, not a runtime input executor, input-schema validator, input generator, or exposure-safety certifier. `required_input_field_count_tier` is reviewer-aid metadata derived from `capability.input_schema.required[]` array cardinality and is NOT persisted into the manifest.

## M38 Product CLI Surface

M38 (Static Capability Examples Count Tier Index Export from Manifest Evidence — V1.19) adds the `examples` top-level noun with a single subcommand `index`. The CLI surface grows from **21 → 22** commands, with `examples` inserted alphabetically between `effect` and `method` (`effect` vs `examples`: `e` = `e`, `f` (102) < `x` (120); `examples` vs `method`: `e` < `m`).

### M38 Command Table

| Command | Description |
|---------|-------------|
| `tusq examples` | Print enumerate-subcommands block for examples |
| `tusq examples index` | Index capabilities by examples count tier (static, read-only, planning aid) |

### M38 Flags

| Flag | Default | Effect |
|------|---------|--------|
| `--tier <none\|low\|medium\|high\|unknown>` | all tiers | Filter to single examples count tier bucket; **case-sensitive lowercase only**; unrecognized value exits 1 with `Unknown examples count tier: <value>`; valid-but-absent tier exits 1 with `No capabilities found for examples count tier: <tier>` |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success; rejected if path is inside `.tusq/` |
| `--json` | human text | Emit machine-readable JSON |

### M38 Frozen Five-Value `examples_count_tier` Bucket-Key Enum

`none | low | medium | high | unknown`

The enum is immutable once M38 ships. Any addition is a material governance event requiring its own ROADMAP milestone. `examples_count_tier` is derived entirely from `capability.examples[]` array cardinality (M11-derived) and is distinct from M37's `pii_field_count_tier` (which derives from string-shaped per-field hints).

### M38 Frozen Two-Value `aggregation_key` Enum

| Value | Applied to |
|-------|-----------|
| `tier` | Named tier buckets (`none`, `low`, `medium`, `high`) |
| `unknown` | Zero-evidence / malformed examples catchall |

### M38 Frozen Tier Function Thresholds

| `capability.examples` condition | `examples_count_tier` |
|---------------------------------|-----------------------|
| Valid array, `length === 0` | `none` |
| Valid array, `1 ≤ length ≤ 2` | `low` |
| Valid array, `3 ≤ length ≤ 5` | `medium` |
| Valid array, `length ≥ 6` | `high` |
| Field missing / `null` / not-an-array | `unknown` (warning: `examples_field_missing` or `examples_field_not_array`) |
| Array contains `null` element | `unknown` (warning: `examples_array_contains_null_element`) |
| Array contains array element | `unknown` (warning: `examples_array_contains_array_element`) |
| Array contains non-object element (other) | `unknown` (warning: `examples_array_contains_non_object_element`) |

Function examines each element; first non-object/null/array element short-circuits to `unknown`.

### M38 Bucket Iteration Order

`none → low → medium → high → unknown` (closed-enum order — NOT an examples-richness ranking)

### M38 Per-Bucket 8-Field Entry Shape

| Field | Type | Notes |
|-------|------|-------|
| `examples_count_tier` | string | One of the five enum values |
| `aggregation_key` | string | `"tier"` or `"unknown"` |
| `capability_count` | integer | Capabilities in this bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Capabilities with `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_destructive_side_effect` | boolean | True iff any capability in bucket has `side_effect_class === "destructive"` |
| `has_restricted_or_confidential_sensitivity` | boolean | True iff any capability in bucket has `sensitivity_class` in `{restricted, confidential}` |

### M38 Warnings Shape

Warnings are emitted when `examples_count_tier === "unknown"` due to malformed `examples` field data.

- **JSON mode**: `warnings[]` array of `{ capability: string, reason: string }` objects appended to the JSON output object.
- **Human mode**: warning lines on stderr only.

Frozen five-value warning reason code enum: `examples_field_missing | examples_field_not_array | examples_array_contains_null_element | examples_array_contains_array_element | examples_array_contains_non_object_element`

### M38 Failure UX

| Condition | Exit | stderr | stdout |
|-----------|------|--------|--------|
| Missing manifest | 1 | `Manifest not found: <path>` | empty |
| Malformed JSON | 1 | `Invalid manifest JSON: <path>` | empty |
| Missing capabilities | 1 | `Invalid manifest: missing capabilities array` | empty |
| Unknown flag | 1 | `Unknown flag: --<name>` | empty |
| Unknown tier filter value | 1 | `Unknown examples count tier: <value>` | empty |
| Valid tier but no capabilities | 1 | `No capabilities found for examples count tier: <tier>` | empty |
| Unknown subcommand | 1 | `Unknown subcommand: <name>` | empty |
| `--out` unwritable | 1 | `Cannot write to --out path: <path>` | empty |
| `--out` inside `.tusq/` | 1 | `--out path must not be inside .tusq/` | empty |
| Empty capabilities | 0 | — | `No capabilities in manifest — nothing to index.` |

### M38 Local-Only Invariants

- Zero manifest mutations; `tusq.manifest.json` mtime/content byte-identical before and after every invocation
- `examples_count_tier` MUST NOT be written into `tusq.manifest.json`
- All prior index commands (`tusq domain index`, `tusq effect index`, `tusq sensitivity index`, `tusq method index`, `tusq auth index`, `tusq confidence index`, `tusq pii index`) produce byte-identical output pre and post-M38
- Zero new dependencies in `package.json`

### M38 Planning-Aid Boundary

This is a planning aid, not a runtime examples validator, documentation completeness enforcer, or compliance certifier. `examples_count_tier` is reviewer-aid metadata derived from `capability.examples[]` array cardinality and is NOT persisted into the manifest.

## M37 Product CLI Surface

M37 (Static Capability PII Field Count Tier Index Export from Manifest Evidence — V1.18) adds the `pii` top-level noun with a single subcommand `index`. The CLI surface grows from **20 → 21** commands, with `pii` inserted alphabetically between `method` and `policy` (`method` vs `pii`: `m` < `p`; `pii` vs `policy`: `pi` < `po` because `i` < `o`).

### M37 Command Table

| Command | Description |
|---------|-------------|
| `tusq pii` | Print enumerate-subcommands block for pii |
| `tusq pii index` | Index capabilities by PII field count tier (static, read-only, planning aid) |

### M37 Flags

| Flag | Default | Effect |
|------|---------|--------|
| `--tier <none\|low\|medium\|high\|unknown>` | all tiers | Filter to single PII field count tier bucket; **case-sensitive lowercase only** |
| `--manifest <path>` | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | stdout | Write index to file; no stdout on success |
| `--json` | human text | Emit machine-readable JSON |

### M37 Frozen Five-Value `pii_field_count_tier` Enum

`none | low | medium | high | unknown`

### M37 Frozen Tier Function

| `pii_fields` value | Tier |
|-------------------|------|
| Valid array, length === 0 | `none` |
| Valid array, 1 ≤ length ≤ 2 | `low` |
| Valid array, 3 ≤ length ≤ 5 | `medium` |
| Valid array, length ≥ 6 | `high` |
| null / missing / not-an-array / non-string element / empty string | `unknown` (warning) |

### M37 Bucket Iteration Order

`none → low → medium → high → unknown` (closed-enum order — NOT a leakage-severity ranking)

### M37 Per-Bucket 8-Field Entry Shape

`pii_field_count_tier`, `aggregation_key`, `capability_count`, `capabilities[]`, `approved_count`, `gated_count`, `has_destructive_side_effect`, `has_restricted_or_confidential_sensitivity`

### M37 Planning-Aid Boundary

This is a planning aid, not a runtime PII detector, data-leakage prevention engine, runtime redaction enforcer, or compliance certifier. `pii_field_count_tier` is reviewer-aid metadata derived from M25 source-literal name hints and is NOT persisted into the manifest.

## M36 Product CLI Surface

M36 (Static Capability Confidence Tier Index Export from Manifest Evidence — V1.17) adds the `confidence` top-level noun with a single subcommand `index`. The CLI surface grows from **19 → 20** commands, with `confidence` inserted alphabetically between `auth` and `diff` (`auth` vs `confidence`: `a` < `c`; `confidence` vs `diff`: `c` < `d`).

### M36 Command Table

| Command | Description |
|---------|-------------|
| `tusq confidence` | Print enumerate-subcommands block for confidence |
| `tusq confidence index` | Index capabilities by confidence tier (static, read-only, planning aid) |

### M36 Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--tier <value>` | Filter to a single confidence tier bucket; case-sensitive lowercase | All tiers |
| `--manifest <path>` | Manifest file to read | `tusq.manifest.json` |
| `--out <path>` | Write index to file (no stdout on success); rejected inside `.tusq/` | stdout |
| `--json` | Emit machine-readable JSON | Human text |

### M36 Frozen Tier Function Thresholds

| Condition | `confidence_tier` |
|-----------|------------------|
| `confidence >= 0.85` | `high` |
| `0.6 <= confidence < 0.85` | `medium` |
| `confidence < 0.6` | `low` |
| null / undefined / missing | `unknown` (no warning) |
| non-numeric / NaN / Infinity / out-of-[0,1] | `unknown` (warning emitted) |

Thresholds `0.85` and `0.6` are frozen. Any change is a material governance event.

### M36 Frozen Four-Value `confidence_tier` Bucket-Key Enum

| Value | Bucket | Notes |
|-------|--------|-------|
| `high` | Named | confidence >= 0.85 |
| `medium` | Named | 0.6 <= confidence < 0.85 |
| `low` | Named | confidence < 0.6 |
| `unknown` | Unknown | null/undefined/missing/non-numeric/out-of-[0,1] |

`confidence_tier` is M36-derived from the numeric `confidence` field — it is NOT referenced from a pre-existing constant. Case-sensitive lowercase for `--tier` filter.

### M36 Frozen Two-Value `aggregation_key` Enum

| Value | Applied to |
|-------|-----------|
| `tier` | All three named tier buckets (high, medium, low) |
| `unknown` | The unknown bucket |

### M36 Closed-Enum Bucket Iteration Order

`high → medium → low → unknown`

This is a deterministic stable-output convention only — NOT a quality-precedence statement, NOT an evidence-strength ranking, NOT a trust-ranking.

### M36 Per-Bucket 8-Field Entry Shape

| Field | Type | Notes |
|-------|------|-------|
| `confidence_tier` | string | One of the four enum values |
| `aggregation_key` | string | `"tier"` or `"unknown"` |
| `capability_count` | integer | Capabilities in this bucket |
| `capabilities[]` | string[] | Manifest declared order |
| `approved_count` | integer | `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_destructive_side_effect` | boolean | Any cap with `side_effect_class === "destructive"` |
| `has_restricted_or_confidential_sensitivity` | boolean | Any cap with `sensitivity_class` in `{restricted, confidential}` |

### M36 Top-Level `warnings[]` Array Rule

`warnings[]` is present in `--json` output always (even when empty). Each entry is a string describing a non-null/undefined but non-numeric, NaN, Infinity, or out-of-[0,1] confidence value encountered. In human mode, warnings are emitted to stderr (not stdout). `confidence_tier` is NEVER written into `tusq.manifest.json`.

### M36 Failure UX

| Condition | Exit | stderr | stdout |
|-----------|------|--------|--------|
| Missing manifest | 1 | `Manifest not found: <path>` | empty |
| Malformed JSON | 1 | `Invalid manifest JSON: <path>` | empty |
| Missing capabilities | 1 | `Invalid manifest: missing capabilities array` | empty |
| Unknown flag | 1 | `Unknown flag: --<name>` | empty |
| Unknown confidence tier filter | 1 | `Unknown confidence tier: <value>` | empty |
| Unknown subcommand | 1 | `Unknown subcommand: <name>` | empty |
| `--out` unwritable | 1 | `Cannot write to --out path: <path>` | empty |
| `--out` inside `.tusq/` | 1 | `--out path must not be inside .tusq/` | empty |
| Empty capabilities | 0 | — | `No capabilities in manifest — nothing to index.` |

### M36 Local-Only Invariants

- Zero manifest mutations; `tusq.manifest.json` mtime/content byte-identical before and after every invocation
- Zero `capability_digest` flips
- `confidence_tier` MUST NOT be written into `tusq.manifest.json` (post-run manifest JSON contains no `confidence_tier` key on any capability)
- `tusq compile`, `tusq serve`, `tusq policy verify`, `tusq redaction review`, `tusq surface plan`, `tusq domain index`, `tusq effect index`, `tusq sensitivity index`, `tusq method index`, `tusq auth index` outputs byte-identical pre and post-M36
- Zero new dependencies in `package.json`

## M35 Product CLI Surface

M35 (Static Capability Auth Scheme Index Export from Manifest Evidence — V1.16) adds the `auth` top-level noun with a single subcommand `index`. The CLI surface grows from **18 → 19** commands, with `auth` inserted alphabetically between `approve` and `compile` (`approve` vs `auth`: `app` < `aut` because `p` < `u`; `auth` vs `compile`: `a` < `c`).

### M35 Command Table

| Command | Description |
|---------|-------------|
| `tusq auth` | Print enumerate-subcommands block for auth |
| `tusq auth index` | Index capabilities by auth scheme (static, read-only, planning aid) |

### M35 Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--scheme <value>` | Filter to a single auth scheme bucket; case-sensitive lowercase | All schemes |
| `--manifest <path>` | Manifest file to read | `tusq.manifest.json` |
| `--out <path>` | Write index to file (no stdout on success); rejected inside `.tusq/` | stdout |
| `--json` | Emit machine-readable JSON | Human text |

### M35 Frozen Seven-Value `auth_scheme` Bucket-Key Enum

| Value | Bucket | Notes |
|-------|--------|-------|
| `bearer` | Named | JWT/Bearer-token auth |
| `api_key` | Named | API key auth |
| `session` | Named | Session/cookie auth |
| `basic` | Named | HTTP Basic auth |
| `oauth` | Named | OAuth/OIDC auth |
| `none` | Named | No auth required |
| `unknown` | Unknown | No static evidence or explicit unknown |

Aligns 1:1 with M29 `AUTH_SCHEMES` constant. Referenced directly — no independent constant. Case-sensitive lowercase for `--scheme` filter.

### M35 Frozen Two-Value `aggregation_key` Enum

| Value | Applied to |
|-------|-----------|
| `scheme` | All six named scheme buckets |
| `unknown` | The unknown bucket |

### M35 Closed-Enum Bucket Iteration Order

`bearer → api_key → session → basic → oauth → none → unknown`

This is a deterministic stable-output convention only — NOT an IAM-strength-precedence statement, NOT a trust-ranking, NOT a security-strength ladder.

### M35 Per-Bucket 8-Field Entry Shape

| Field | Type | Notes |
|-------|------|-------|
| `auth_scheme` | string | One of the seven enum values |
| `aggregation_key` | string | `"scheme"` or `"unknown"` |
| `capability_count` | integer | Capabilities in this bucket |
| `capabilities[]` | string[] | Manifest declared order |
| `approved_count` | integer | `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_destructive_side_effect` | boolean | Any cap with `side_effect_class === "destructive"` |
| `has_restricted_or_confidential_sensitivity` | boolean | Any cap with `sensitivity_class` in `{restricted, confidential}` |

### M35 Failure UX

| Condition | Exit | stderr | stdout |
|-----------|------|--------|--------|
| Missing manifest | 1 | `Manifest not found: <path>` | empty |
| Malformed JSON | 1 | `Invalid manifest JSON: <path>` | empty |
| Missing capabilities | 1 | `Invalid manifest: missing capabilities array` | empty |
| Unknown flag | 1 | `Unknown flag: --<name>` | empty |
| Unknown auth scheme filter | 1 | `Unknown auth scheme: <value>` | empty |
| Unknown subcommand | 1 | `Unknown subcommand: <name>` | empty |
| `--out` unwritable | 1 | `Cannot write to --out path: <path>` | empty |
| `--out` inside `.tusq/` | 1 | `--out path must not be inside .tusq/` | empty |
| Empty capabilities | 0 | — | `No capabilities in manifest — nothing to index.` |

### M35 Local-Only Invariants

- Zero manifest mutations; `tusq.manifest.json` mtime/content byte-identical before and after every invocation
- Zero `capability_digest` flips
- `tusq compile`, `tusq serve`, `tusq policy verify`, `tusq redaction review`, `tusq surface plan`, `tusq domain index`, `tusq effect index`, `tusq sensitivity index`, `tusq method index` outputs byte-identical pre and post-M35
- Zero new dependencies in `package.json`

## M34 Product CLI Surface

M34 (Static Capability HTTP Method Index Export from Manifest Evidence — V1.15) adds the `method` top-level noun with a single subcommand `index`. The CLI surface grows from **17 → 18** commands, with `method` inserted alphabetically between `effect` and `policy` (`method` vs `policy`: `m` < `p`; `method` vs `effect`: `e` < `m`).

### M34 Command Table

| Command | Description |
|---------|-------------|
| `tusq method` | Enumerate subcommands block (mirrors `tusq sensitivity`, `tusq effect`, `tusq domain`, `tusq surface`, etc.) |
| `tusq method index` | Produce a read-only, deterministic HTTP method index of the manifest's capabilities |

### M34 Flags

| Flag | Type | Default | Notes |
|------|------|---------|-------|
| `--method <value>` | string | all methods | Filter to a single HTTP method bucket; **case-sensitive uppercase only**; unrecognized value exits 1 with `Unknown method: <value>` |
| `--manifest <path>` | string | `tusq.manifest.json` | Manifest file to read |
| `--out <path>` | string | — | Write index to file; no stdout on success; rejected if path is inside `.tusq/` |
| `--json` | boolean | false | Emit machine-readable JSON |

### M34 Frozen Six-Value `http_method` Bucket-Key Enum

| Value | Description |
|-------|-------------|
| `GET` | Named method: HTTP GET (read/query) |
| `POST` | Named method: HTTP POST (create/submit) |
| `PUT` | Named method: HTTP PUT (replace) |
| `PATCH` | Named method: HTTP PATCH (partial update) |
| `DELETE` | Named method: HTTP DELETE (delete) |
| `unknown` | Zero-evidence catchall for null/missing/empty-string/HEAD/OPTIONS/non-canonical `method` values |

The enum is immutable once M34 ships; any addition is a material governance event requiring its own ROADMAP milestone. M34 MUST NOT modify, override, or augment the upstream scanner's `method` field; the enum is a bucket-key, not a re-classifier.

### M34 Frozen Two-Value `aggregation_key` Enum

| Value | Applied to |
|-------|-----------|
| `method` | Named buckets (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) |
| `unknown` | Zero-evidence catchall bucket |

The two-value enum is immutable once M34 ships. Any addition is a material governance event requiring its own ROADMAP milestone.

### M34 Per-Bucket Entry Shape

| Field | Type | Notes |
|-------|------|-------|
| `http_method` | string | One of the six enum values (`"GET"`, `"POST"`, `"PUT"`, `"PATCH"`, `"DELETE"`, `"unknown"`) |
| `aggregation_key` | string | `"method"` or `"unknown"` |
| `capability_count` | integer | Capabilities in this bucket |
| `capabilities[]` | string[] | Capability names in manifest declared order |
| `approved_count` | integer | Capabilities with `approved === true` |
| `gated_count` | integer | `capability_count - approved_count` |
| `has_destructive_side_effect` | boolean | True iff any capability in bucket has `side_effect_class === "destructive"` |
| `has_unknown_auth` | boolean | True iff any capability in bucket has `auth_requirements.auth_scheme === "unknown"` |

### M34 Bucket Iteration Order

Closed-enum order: `GET → POST → PUT → PATCH → DELETE`, then `unknown` last. This is a deterministic stable-output convention that matches the conventional REST CRUD reading order but carries **no risk semantic** — **NOT** a risk-precedence statement, NOT destructive-ascending, NOT safety-ordered. Within each bucket, capabilities appear in manifest declared order.

### M34 Default-Preservation Table (17 Commands Unchanged)

| Commands | Invariant |
|----------|-----------|
| All 17 existing commands (init, scan, manifest, compile, serve, review, docs, approve, diff, domain, effect, policy, redaction, sensitivity, surface, version, help) | Byte-identical stdout, stderr, and exit codes before and after M34 |

### M34 Failure UX

| Error condition | Exit code | stderr | stdout |
|-----------------|-----------|--------|--------|
| Missing manifest file | 1 | `Manifest not found: <path>` | empty |
| Invalid JSON in manifest | 1 | `Invalid manifest JSON: <path>` | empty |
| Missing capabilities array | 1 | `Invalid manifest: missing capabilities array` | empty |
| Unknown `--method` value (including lowercase like `get`) | 1 | `Unknown method: <value>` | empty |
| Unknown subcommand | 1 | `Unknown subcommand: <name>` | empty |
| Unknown flag | 1 | `Unknown flag: --<name>` | empty |
| `--out` unwritable | 1 | `Cannot write to --out path: <path>` | empty |
| `--out` inside `.tusq/` | 1 | `--out path must not be inside .tusq/` | empty |

### M34 Local-Only Invariants

| Invariant | Verification |
|-----------|-------------|
| Read-only manifest | mtime/content byte-identical before and after every `tusq method index` invocation |
| No `.tusq/` writes | Confirmed by absence of new files in `.tusq/` after any invocation |
| Zero `capability_digest` flips | Hash-before vs hash-after assertion is byte-identical on every capability |
| `tusq compile` byte-identity | Golden-file smoke assertion confirms compile output is byte-identical pre and post-M34 |
| `tusq surface plan` byte-identity | Output byte-for-byte unchanged pre and post-M34 |
| `tusq domain index` byte-identity | Output byte-for-byte unchanged pre and post-M34 |
| `tusq effect index` byte-identity | Output byte-for-byte unchanged pre and post-M34 |
| `tusq sensitivity index` byte-identity | Output byte-for-byte unchanged pre and post-M34 |
| Deterministic output | Running twice on the same manifest produces byte-identical stdout in both human and `--json` modes; iteration order is fixed by the closed enum (`GET → POST → PUT → PATCH → DELETE → unknown`); no wall-clock fields inside per-bucket entries |
| Frozen six-value `http_method` enum | Locked by eval scenario and synchronous throw on out-of-set return; any addition is a material governance event |
| Frozen two-value `aggregation_key` enum | Locked by eval scenario and synchronous throw on out-of-set return; any addition is a material governance event |
| Case-sensitive `--method` filter | `get`, `delete`, etc. exit 1 with `Unknown method:`; only uppercase canonical values accepted |
| Closed-enum order is NOT risk-precedence | The `GET → POST → PUT → PATCH → DELETE → unknown` order is a stable-output convention; docs/README/CLI-help MUST NOT describe it as "risk-ascending," "destructive-ascending," "safety-ordered," or any phrase implying risk semantics |
| Planning-aid framing | Help text, docs, README, launch artifacts MUST use "planning aid" language; MUST NOT use "routes HTTP methods at runtime", "validates REST conventions", "certifies idempotency", "alters the M32 side_effect_class derivation", or "alters the M30 gating rule" |
| Future method milestones reserved | M-Risk-1, M-Idempotency-1, M-RestConv-1 ship under their own ROADMAP entries with fresh acceptance contracts; M34 is **not** a substitute for any of them |
