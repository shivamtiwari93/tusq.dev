# BUG-91 Carry-Forward Reverify — agentxchain v2.155.48

Date: 2026-04-27

Command:

```sh
npx --yes -p agentxchain@2.155.48 -c 'agentxchain run --continuous --vision .planning/VISION.md --max-runs 100 --max-idle-cycles 3 --poll-seconds 5 --triage-approval auto --auto-checkpoint'
```

Result:

- The run started with `.planning/dogfood-100-turn-evidence/turn-counter.jsonl` dirty from prior DOGFOOD evidence.
- Retained turn `turn_60ca77d51809c98f` accepted, and subsequent turns continued accepting under the same shipped command.
- No dirty-parity failure attributed unchanged baseline-dirty evidence to the retained turn.

Accepted carry-forward proof:

- `run_533b2f8c47cc0bf0`
  - `turn_60ca77d51809c98f`
  - `turn_b7f84e0d69dcabf6`
  - `turn_80a266337a607f70`
- `run_0ce75469bde80380`
  - `turn_f4192b1598e8a30f`
  - `turn_5dfd6a1036bcf940`
  - `turn_63c7cc83d4a3e120`
  - `turn_04f7bae213ce8fdc`
- `run_7bad406d9ea95ce5`
  - `turn_1bd2bd4cc7b1d330`
  - `turn_a58d22a53169262b`
  - `turn_17fc87e4651eb033`
  - `turn_c9c08fbcf6b60cd8`
- `run_f33f485bb7998de9`
  - `turn_57c7b57416c90a9f`
  - `turn_8f2c26df7726bc2e`

Verdict: BUG-91 carry-forward remains closed on v2.155.48.
