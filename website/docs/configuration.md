---
title: Configuration
sidebar_label: Configuration
sidebar_position: 4
---

# Configuration

`tusq init` creates `tusq.config.json` in your project root.

## Default shape

```json
{
  "version": 1,
  "framework": "express",
  "scan": {
    "include": ["**/*.js", "**/*.ts"],
    "exclude": ["node_modules", ".git", ".tusq", "dist", "build", "coverage"]
  },
  "output": {
    "scan_file": ".tusq/scan.json",
    "manifest_file": "tusq.manifest.json",
    "tools_dir": "tusq-tools"
  }
}
```

## Key sections

- `framework`: selected or detected framework (`express`, `fastify`, `nestjs`, or `unknown`).
- `scan.include` / `scan.exclude`: file selection for scanning.
- `output.scan_file`: where scan results are written.
- `output.manifest_file`: manifest output path.
- `output.tools_dir`: compile output directory.

## Notes

- If the file already exists, `tusq init` does not overwrite it.
- `tusq scan` requires this file to exist and exits with a clear message when missing.
