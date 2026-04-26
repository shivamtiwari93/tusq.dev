# BUG-88 Reverify — agentxchain v2.155.42

Date: 2026-04-26
Repo: `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev`
Branch: `agentxchain-dogfood-100-turn-2026-04`
Package: `agentxchain@2.155.42`

## Command

```bash
npx --yes -p agentxchain@2.155.42 -c 'agentxchain run --continuous --vision .planning/VISION.md --max-runs 100 --max-idle-cycles 3 --poll-seconds 5 --triage-approval auto --auto-checkpoint'
```

## Result

BUG-88 no longer reproduces on the same large accumulated dogfood session.

Evidence:

- The resumed run completed with `Status: completed`, `Turns: 2`, `Errors: none`.
- The run wrote a fresh governance report: `.agentxchain/reports/report-run_24ccd92f593d8647.md`.
- The run wrote a fresh governance export: `.agentxchain/reports/export-run_24ccd92f593d8647.json` at approximately 11 MB.
- A second continuous run also completed with `Status: completed`, `Turns: 4`, `Errors: none`.
- The second run wrote `.agentxchain/reports/report-run_7894753f9c47c8e3.md` and `.agentxchain/reports/export-run_7894753f9c47c8e3.json`.
- `grep -R "Invalid string length\\|Governance export write failed\\|Export write exceeded" .agentxchain/reports/report-run_24ccd92f593d8647.md .agentxchain/reports/report-run_7894753f9c47c8e3.md .agentxchain/reports/report-run_e40832d436a42d75.md` returned no matches.

## Follow-On Blocker

The same continuous session later paused on a new staged-result schema-shape failure:

```text
acceptTurn(qa): Validation failed at stage schema: objections[0].id must match pattern OBJ-NNN.
```

Blocked turn: `turn_4125be3cf057395a`.

This is not BUG-88. It is another BUG-78/BUG-79-class staged-result normalization gap around objection object shape, discovered after BUG-88 was reverified.
