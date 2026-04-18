# Command Surface — tusq.dev V1

## Primary Commands

| Command | Purpose | Inputs | Output / Side Effects |
|---------|---------|--------|------------------------|
| `tusq init` | Initialize project config | Optional: `--framework <name>` | Creates `tusq.config.json` |
| `tusq scan <path>` | Scan codebase for capabilities | Path to repo root; `--framework`, `--format`, `--verbose` | Internal capability model; stdout summary |
| `tusq manifest` | Generate capability manifest | `--out <path>`, `--format` | Creates/updates `tusq.manifest.json` |
| `tusq compile` | Compile tools from manifest | `--out <path>`, `--dry-run` | Creates `tusq-tools/` with JSON tool defs |
| `tusq serve` | Start local MCP server | `--port <n>` | Runs MCP server on localhost |
| `tusq review` | Review manifest (print summary) | `--format` | Prints manifest summary to stdout |
| `tusq version` | Print version | None | Version string to stdout |
| `tusq help` | Print usage | Optional: command name | Help text to stdout |

## Flags And Options

| Flag | Commands | Meaning | Default |
|------|----------|---------|---------|
| `--format json` | scan, manifest, review | Machine-parseable JSON output | human-readable |
| `--out <path>` | manifest, compile | Custom output path | `./tusq.manifest.json` / `./tusq-tools/` |
| `--port <n>` | serve | MCP server port | 3100 |
| `--dry-run` | compile | Preview without writing | false |
| `--framework <name>` | init, scan | Override auto-detection | auto |
| `--verbose` | all | Detailed progress output | false |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | User error (bad input, missing config, no routes found) |
| 2 | Internal error (file system, unexpected crash) |

## Failure UX

- **Expected error messages:** All errors include the failed action, the reason, and a suggested next step (e.g., "No tusq config found. Run `tusq init` first.")
- **Help / usage fallback:** Unknown commands and invalid flags print contextual help text and exit 1
- **Safe retry behavior:** All commands are idempotent or additive. `tusq init` warns on re-run. `tusq manifest` merges with existing approvals. `tusq compile --dry-run` is always safe.
