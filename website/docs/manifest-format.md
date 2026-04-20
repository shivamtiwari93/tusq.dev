---
title: Manifest Format
sidebar_label: Manifest Format
sidebar_position: 3
---

# Manifest Format

`tusq manifest` generates `tusq.manifest.json` as the review contract between discovery and compilation.

## Top-level fields

- `schema_version` (string)
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
- `provenance`: source file and line metadata
- `confidence`: inference confidence score
- `review_needed`: true when confidence is below threshold
- `approved`: manual approval flag
- `approved_by`: approval identity string or `null`
- `approved_at`: approval timestamp string (ISO 8601) or `null`
- `domain`: domain grouping label

## V1 schema limitations

In `v0.1.0`, both `input_schema` and `output_schema` are intentionally conservative JSON Schema objects.

```json
{
  "type": "object",
  "additionalProperties": true,
  "description": "<inference status message>"
}
```

The `description` varies by route confidence and available hints, but the structural shape above is fixed in V1.
Full property-level schema inference is planned beyond `v0.1.0`.

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

## Approval flow

V1 approval is explicit and manual.

1. Run `tusq manifest`.
2. Edit `tusq.manifest.json`.
3. Set `approved: true` for capabilities you want exposed (optionally also set `approved_by` and `approved_at`).
4. Run `tusq compile` to emit only approved capabilities.

## Regeneration behavior

When you regenerate a manifest, previously approved capabilities are preserved by method+path key when possible.
