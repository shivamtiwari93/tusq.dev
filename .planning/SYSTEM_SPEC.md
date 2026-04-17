# System Spec — tusq.dev

## Purpose

(Describe the problem this slice solves and why it exists.)

## Interface

(List the user-facing commands, files, APIs, or contracts this slice changes.)

## Behavior

(Describe the expected behavior, including important edge cases.)

## Error Cases

(List the failure modes and how the system should respond.)

## Acceptance Tests

- [ ] Name the executable checks that prove this slice works.

## Open Questions

- (Capture unresolved product or implementation questions here.)


## Template-Specific Guidance

**Purpose:** Describe the CLI tool, its primary users, and the workflow it enables. Include the core commands and why this tool exists.

**Interface:** List the user-facing commands, flags, and options. Reference command-surface.md for the full command table. Include stdin/stdout/stderr contracts.

**Behavior:** Describe the expected behavior for each primary command, including exit codes, output format (human vs JSON), and safe retry semantics.

**Error Cases:** List invalid-flag handling, missing-input behavior, permission errors, and network failure UX. Include expected error messages and help fallback behavior.

**Acceptance Tests:**
- [ ] Primary commands produce expected output and exit codes
- [ ] Help text is accurate for every user-facing command
- [ ] Invalid flags and missing inputs produce clear error messages
- [ ] Install and invocation paths verified on target platforms
