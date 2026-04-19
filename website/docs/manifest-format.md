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
- `auth_hints`: inferred auth/middleware hints
- `provenance`: source file and line metadata
- `confidence`: inference confidence score
- `review_needed`: true when confidence is below threshold
- `approved`: manual approval flag
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

## Approval flow

V1 approval is explicit and manual.

1. Run `tusq manifest`.
2. Edit `tusq.manifest.json`.
3. Set `approved: true` for capabilities you want exposed.
4. Run `tusq compile` to emit only approved capabilities.

## Regeneration behavior

When you regenerate a manifest, previously approved capabilities are preserved by method+path key when possible.
