---
title: Supported Frameworks
sidebar_label: Supported Frameworks
sidebar_position: 5
---

# Supported Frameworks

`tusq.dev v0.1.0` supports three Node.js backend frameworks:

- Express
- Fastify
- NestJS

## What support means in V1

For these frameworks, `tusq scan` can infer route candidates using static, heuristic parsing and emit `.tusq/scan.json` with:

- method and path
- handler hints
- auth hints
- schema hint presence
- provenance (file and line)
- confidence score
- basic domain grouping

## Fastify: literal schema-body extraction (V1.5)

For Fastify routes that declare a literal `schema: { body: { properties: {...} } }` block directly in their route-options object, `tusq scan` extracts the declared top-level field shapes into `input_schema.properties`. This is a static extraction — no code is evaluated, no framework is imported, no validator is invoked.

- `input_schema.source` is set to `fastify_schema_body` when extraction succeeds.
- `input_schema.additionalProperties` is `false`, indicating the body shape is fully declared.
- Property key order matches the source declaration order (deterministic, not alphabetized).
- Only top-level fields are extracted. Nested property descent (e.g. `properties.address.properties.zip`) is V2 scope.
- When the `schema` value is a variable reference (not a literal object), when `body` is absent, or when any brace is unbalanced, the extractor falls back to the permissive write-body placeholder — no partial extraction is emitted.
- `schema.params` and `schema.querystring` are not extracted in V1.5. Path parameters continue to be extracted via the M15 path-parameter inference.

The `fastify_schema_body` source tag means "the declared body schema as it appears literally in source" — it does NOT imply the shape is runtime-validated by Fastify or ajv. See [`manifest-format.md`](/docs/manifest-format) for the full extraction rules and fall-back semantics.

## What support does not mean

- Full AST/type-level semantic understanding
- Runtime traffic learning
- Perfect auth or policy inference
- Cross-language ecosystem support

## Not supported in V1

- Python frameworks
- Go frameworks
- Java frameworks
- Arbitrary plugin-defined framework adapters

Those are planned beyond v0.1.0.
