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

### Write Body Placeholder (V1)

For `POST`, `PUT`, `PATCH`, and `DELETE` routes, `input_schema.properties.body` is emitted as an object placeholder. Its `source` is `request_body` unless a framework schema hint was detected, in which case it is `framework_schema_hint`.

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

In `v0.1.0`, `sensitivity_class` is always emitted as `unknown` by default. The field is present now so:

1. Human reviewers can manually set sensitivity in `tusq.manifest.json` before compile.
2. Compiled tool files and MCP metadata keep sensitivity available downstream.
3. Future inference can populate this field without changing the manifest shape.

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
  "log_level": "full",
  "mask_in_traces": false,
  "retention_days": null
}
```

- `approved_by` and `approved_at` default to `null`.
- `tusq compile` gates only on `approved: true`; approval metadata remains manifest-only audit context.
- `redaction` propagates to compiled tools and MCP `tools/call` so runtime consumers can apply masking/retention policy.

## Version history and digests (V1)

- `manifest_version` increments each time `tusq manifest` regenerates the file.
- `previous_manifest_hash` stores the SHA-256 hash of the full previous manifest bytes.
- `capability_digest` is a per-capability SHA-256 digest over content fields.
- `capability_digest` excludes `approved`, `approved_by`, `approved_at`, `review_needed`, and the digest field itself.
- Version-history fields are manifest-only metadata. They do not propagate to compiled tools or MCP `tools/list` / `tools/call`.

## Approval flow

V1 approval is explicit and manual.

1. Run `tusq manifest`.
2. Edit `tusq.manifest.json`.
3. Set `approved: true` for capabilities you want exposed (optionally also set `approved_by` and `approved_at`).
4. Run `tusq compile` to emit only approved capabilities.

## Regeneration behavior

When you regenerate a manifest, previously approved capabilities are preserved by method+path key when possible.
