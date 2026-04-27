# BUG-94 Reverify — agentxchain v2.155.48

Date: 2026-04-27

Command:

```sh
npx --yes -p agentxchain@2.155.48 -c 'agentxchain run --continuous --vision .planning/VISION.md --max-runs 100 --max-idle-cycles 3 --poll-seconds 5 --triage-approval auto --auto-checkpoint'
```

Package verification:

- `npm view agentxchain@2.155.48 version` -> `2.155.48`
- `npx --yes -p agentxchain@2.155.48 -c 'agentxchain --version'` -> `2.155.48`

Result:

- Retained failed-acceptance turn `turn_60ca77d51809c98f` in run `run_533b2f8c47cc0bf0` accepted through the continuous run loop at `2026-04-27T13:35:48.960Z`.
- No manual `accept-turn`, staging JSON edit, or gate mutation was used.
- The prior BUG-94 schema failure did not recur:
  - no `Missing required field: decisions`
  - no `Missing required field: objections`
- The same recovered run then accepted QA turn `turn_b7f84e0d69dcabf6` and launch/dev turn `turn_80a266337a607f70`.
- Run `run_533b2f8c47cc0bf0` completed with status `completed`, 3 turns, 0 approved gates, and no errors.

Evidence anchors:

- `.agentxchain/events.jsonl`
  - `turn_accepted` for `turn_60ca77d51809c98f` at `2026-04-27T13:35:48.960Z`
  - `turn_accepted` for `turn_b7f84e0d69dcabf6` at `2026-04-27T13:42:18.421Z`
  - `turn_accepted` for `turn_80a266337a607f70` at `2026-04-27T13:44:54.782Z`
  - `run_completed` for `run_533b2f8c47cc0bf0` at `2026-04-27T13:44:54.782Z`
- `.planning/dogfood-100-turn-evidence/turn-counter.jsonl`
  - strict counter reset to 1 because the v2.155.48 shipped-package invocation created continuous session `cont-76603154` after prior session `cont-a2567aec`.
  - counter values 1, 2, and 3 record the recovered run's accepted turns under `agentxchain_version: "2.155.48"`.

Verdict: BUG-94 is closed by shipped-package evidence.
