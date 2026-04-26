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

## Regeneration behavior

When you regenerate a manifest, previously approved capabilities are preserved by method+path key when possible.
