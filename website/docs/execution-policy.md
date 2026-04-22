# Execution Policy (M20)

The execution policy scaffold is an opt-in, repo-local governance artifact that extends `tusq serve` with argument validation and auditable dry-run plan emission on the MCP `tools/call` path.

No live API execution is added. `tools/call` under any policy mode stays in-process. `executed: false` is always present in every dry-run response.

## Authoring a policy file

The recommended path is `tusq policy init` (V1.2). It generates a valid policy file without requiring you to know the schema:

```bash
# Generate a describe-only policy (safe default)
tusq policy init

# Generate a dry-run policy scoped to two capabilities
tusq policy init --mode dry-run --reviewer ops@example.com --allowed-capabilities get_users_users,post_users_users

# Preview the output without writing
tusq policy init --mode dry-run --dry-run
```

The generated file passes `loadAndValidatePolicy()` byte-for-byte, so it is accepted immediately by `tusq serve --policy`. Use `--force` to overwrite an existing file.

Hand-authoring is still supported as an advanced alternative — the schema is documented below.

## Policy file shape

File: `.tusq/execution-policy.json`.

```json
{
  "schema_version": "1.0",
  "mode": "dry-run",
  "allowed_capabilities": ["get_users_id", "list_orders"],
  "reviewer": "ops@example.com",
  "approved_at": "2026-04-22T05:20:21Z"
}
```

| Field | Type | Required | Behavior |
|-------|------|----------|----------|
| `schema_version` | string | yes | Must be `"1.0"` or `tusq serve` exits 1 |
| `mode` | `"describe-only"` \| `"dry-run"` | yes | `"describe-only"` is a no-op (identical to V1 without `--policy`); `"dry-run"` enables argument validation and plan emission |
| `allowed_capabilities` | string[] \| null | no | When present, dry-run plans are only produced for the listed compiled tool names; other names return -32602 |
| `reviewer` | string \| null | no | Echoed into `dry_run_plan.policy.reviewer` for audit; never used for authorization |
| `approved_at` | string (ISO-8601 UTC) \| null | no | Echoed into `dry_run_plan.policy.approved_at`; never used for authorization |

## Modes

### `mode: "describe-only"`

Byte-for-byte identical to running `tusq serve` without `--policy`. The policy file is loaded and validated (so startup errors still apply), but no behavior changes.

### `mode: "dry-run"`

Argument validation and plan emission are enabled for `tools/call` requests:

1. If `allowed_capabilities` is set and the requested tool is not in the list, the server returns a -32602 error with `data.reason: "capability not permitted under current policy"`.
2. Arguments at `params.arguments` are validated against the compiled tool's `parameters` schema.
3. On validation success, a `dry_run_plan` is built and returned with `executed: false`.
4. On validation failure, a -32602 error is returned with `data.validation_errors`.

The approval gate is preserved: only capabilities with `approved: true` in the manifest are compiled, and only compiled tools are served. `allowed_capabilities` is a strict subset filter on top of the approval gate, not a replacement for it.

## Dry-run response example

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "name": "get_users_id",
    "description": "Retrieve a specific user by ID",
    "executed": false,
    "policy": {
      "mode": "dry-run",
      "reviewer": "ops@example.com",
      "approved_at": "2026-04-22T05:20:21Z"
    },
    "dry_run_plan": {
      "method": "GET",
      "path": "/users/42",
      "path_params": { "id": "42" },
      "query": {},
      "body": null,
      "headers": { "Accept": "application/json" },
      "auth_context": { "hints": ["Authorization"], "required": true },
      "side_effect_class": "read",
      "sensitivity_class": "unknown",
      "redaction": { "pii_fields": [], "log_level": "full", "mask_in_traces": false, "retention_days": null },
      "plan_hash": "<SHA-256 hex of canonical plan content>",
      "evaluated_at": "2026-04-22T05:20:22Z"
    },
    "schema": {
      "parameters": { "type": "object", "properties": { "id": { "type": "string" } }, "required": ["id"] },
      "returns": { "type": "object", "additionalProperties": true }
    }
  }
}
```

`plan_hash` is a SHA-256 over a canonical JSON serialization of `{method, path, path_params, query, body, headers}`. Identical inputs produce identical hashes.

**Important:** `executed: false` is always present. Consumers MUST NOT interpret a `dry_run_plan` as evidence of a performed request. `policy.reviewer` and `policy.approved_at` are audit echoes only — they do not authorize live execution.

## Validation failure response example

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "error": {
    "code": -32602,
    "message": "Invalid arguments for tool: get_users_id",
    "data": {
      "validation_errors": [
        { "path": "/id", "reason": "required field missing" }
      ]
    }
  }
}
```

## Argument validation rules (V1.1)

| Rule | Behavior |
|------|----------|
| Required fields | Each missing field listed in `parameters.required` produces one `validation_errors` entry |
| Primitive type checks | `string`, `number`, `integer`, `boolean` mismatches produce `reason: "expected <type>, got <actual>"` |
| Unknown properties | Rejected when schema declares `additionalProperties: false`; tolerated otherwise |
| Path params | Substituted into `dry_run_plan.path` on validation success |

No network validation, no remote schema fetch. Validation runs fully in-process.

## Startup failure UX

| Failure | Message |
|---------|---------|
| `--policy` path missing | `Policy file not found:` followed by the path |
| Policy file is not valid JSON | `Invalid policy JSON at:` followed by the path and parser message |
| Unsupported `schema_version` | `Unsupported policy schema_version:` followed by the value and supported list |
| Unknown `mode` | `Unknown policy mode:` followed by the value and allowed list |
| `allowed_capabilities` not an array of strings | `Invalid allowed_capabilities in policy:` followed by the offending value |

## Invariants

1. Only capabilities with `approved: true` appear in `tools/list` (unchanged from V1).
2. `tools/call` on an unapproved or missing capability returns -32602 (unchanged from V1).
3. `mode: "dry-run"` never relaxes the approval gate. `allowed_capabilities` is a strict subset filter on top of approval.
4. No outbound HTTP, DB, or socket I/O to the target product under any policy mode.
5. `executed: false` MUST appear in every dry-run response.

## V1.1 limitations

| Limitation | Deferred to |
|------------|-------------|
| Live execution | Later increment past V1.1 |
| Confirm and approve ladders on serve | Later increment |
| Policy authoring CLI (`tusq policy`) | V2 |
| Policy diff and history | V2 |
| Schema validation depth (format, enum, oneOf, regex) | V2 |
| Authentication binding | V2 |
