# BUG-93 Carry-Forward Reverify — agentxchain v2.155.48

Date: 2026-04-27

Command:

```sh
npx --yes -p agentxchain@2.155.48 -c 'agentxchain run --continuous --vision .planning/VISION.md --max-runs 100 --max-idle-cycles 3 --poll-seconds 5 --triage-approval auto --auto-checkpoint'
```

Result:

- DOGFOOD proof evidence under `.planning/dogfood-100-turn-evidence/` existed before the v2.155.48 run.
- The retained recovery run accepted `turn_60ca77d51809c98f`, `turn_b7f84e0d69dcabf6`, and `turn_80a266337a607f70`.
- No retained-turn dirty parity failure was raised for DOGFOOD proof evidence paths.
- Additional runs completed or progressed under the same shipped command:
  - `run_0ce75469bde80380` completed with 4 turns and no errors.
  - `run_7bad406d9ea95ce5` completed with 4 turns and no final errors. It had one transient code-143 dispatch rejection for `turn_a58d22a53169262b`, then retried and accepted the same turn through the framework path.
  - `run_f33f485bb7998de9` was intentionally stopped by the operator after graceful SIGINT; the active dev turn finished and accepted before stop.

Verdict: BUG-93 carry-forward remains closed on v2.155.48.
