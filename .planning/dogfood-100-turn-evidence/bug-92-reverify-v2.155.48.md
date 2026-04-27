# BUG-92 Carry-Forward Reverify — agentxchain v2.155.48

Date: 2026-04-27

Command:

```sh
npx --yes -p agentxchain@2.155.48 -c 'agentxchain run --continuous --vision .planning/VISION.md --max-runs 100 --max-idle-cycles 3 --poll-seconds 5 --triage-approval auto --auto-checkpoint'
```

Result:

- Continuous resume detected retained failed-acceptance turn `turn_60ca77d51809c98f`.
- The run loop reattempted and accepted that staged turn before assigning new work.
- The command did not print or block on `Turn already assigned`.
- After recovery, the framework assigned and accepted `turn_b7f84e0d69dcabf6` and `turn_80a266337a607f70`, then completed run `run_533b2f8c47cc0bf0`.

Evidence anchors:

- `.agentxchain/events.jsonl`
  - `turn_accepted` for `turn_60ca77d51809c98f`
  - `turn_accepted` for `turn_b7f84e0d69dcabf6`
  - `turn_accepted` for `turn_80a266337a607f70`
  - `run_completed` for `run_533b2f8c47cc0bf0`

Verdict: BUG-92 carry-forward remains closed on v2.155.48.
