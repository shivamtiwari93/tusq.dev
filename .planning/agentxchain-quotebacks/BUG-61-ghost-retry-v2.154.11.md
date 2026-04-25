# BUG-61 Quote-Back: Ghost-Turn Auto-Retry

Status: valid negative-path evidence on `agentxchain@2.154.11`.

Primary tusq.dev repo:

`/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev`

Test clone:

`/tmp/tusq-dev-v4b-215411`

Evidence directory:

`/tmp/tusq-agentxchain-v4b-20260424-215411`

Evidence files:

- `/tmp/tusq-agentxchain-v4b-20260424-215411/00-sequence.txt`
- `/tmp/tusq-agentxchain-v4b-20260424-215411/01-bug61-negative-evidence.txt`

Package version proof is in:

`/tmp/tusq-agentxchain-v4b-20260424-215411/00-sequence.txt`

Version output:

```text
$ npx --yes -p agentxchain@2.154.11 -c "agentxchain --version"
2.154.11
```

Setup note:

To force typed startup failures, the test clone config at `/tmp/tusq-dev-v4b-215411/agentxchain.json` was modified so all `local_cli` runtimes use `startup_watchdog_ms: 100`.

Run path:

- Resolved planning human escalation `hesc_0b1b166cd606d86d`.
- `agentxchain unblock hesc_0b1b166cd606d86d` advanced `run_71b762f4405c0fc5` from `planning` to `implementation`.
- `agentxchain checkpoint-turn --turn turn_b68e40fbb7b5d1f4` was required because the inherited tusq.dev state had legacy-empty `files_changed` history with dirty actor files.
- Continuous run with `--auto-retry-on-ghost --auto-retry-on-ghost-max-retries 3 --auto-retry-on-ghost-cooldown-seconds 5` dispatched a real `dev` turn through the `local-dev` adapter.

Command transcript:

`/tmp/tusq-agentxchain-v4b-20260424-215411/00-sequence.txt`

Key stdout:

```text
Turn assigned: turn_68526370af0ae924 -> dev
Run blocked
Recovery: ghost_turn
Action:   Turn turn_68526370af0ae924 failed to start within the startup watchdog window. Run `agentxchain reissue-turn --turn turn_68526370af0ae924 --reason ghost` to recover.
Ghost turn auto-retried (1/3): turn_68526370af0ae924 -> turn_c914574ccc483d4b
...
Ghost turn auto-retried (2/3): turn_c914574ccc483d4b -> turn_a58a555ac944c973
...
Ghost auto-retry exhausted (same_signature_repeat [local-dev|dev|stdout_attach_failed] after 2 attempts) for turn_a58a555ac944c973.
Active run blocked -- continuous loop paused. Recovery: Turn turn_a58a555ac944c973 failed to start within the startup watchdog window. Run `agentxchain reissue-turn --turn turn_a58a555ac944c973 --reason ghost` to recover.
```

Event evidence:

`/tmp/tusq-agentxchain-v4b-20260424-215411/01-bug61-negative-evidence.txt`

Auto-retry rows:

```json
{"event_type":"auto_retried_ghost","payload":{"attempt":1,"max_retries_per_run":3,"failure_type":"stdout_attach_failed","runtime_id":"local-dev"}}
{"event_type":"auto_retried_ghost","payload":{"attempt":2,"max_retries_per_run":3,"failure_type":"stdout_attach_failed","runtime_id":"local-dev"}}
```

Exhaustion row:

```json
{"event_type":"ghost_retry_exhausted","run_id":"run_71b762f4405c0fc5","timestamp":"2026-04-24T02:13:31.324Z","payload":{"turn_id":"turn_a58a555ac944c973","attempts":2,"max_retries_per_run":3,"failure_type":"stdout_attach_failed","runtime_id":"local-dev","exhaustion_reason":"same_signature_repeat","signature_repeat":{"signature":"local-dev|dev|stdout_attach_failed","consecutive":2},"diagnostic_bundle":{"final_signature":"local-dev|dev|stdout_attach_failed","attempts_log_length":2},"recovery_action":"Turn turn_a58a555ac944c973 failed to start within the startup watchdog window. Run `agentxchain reissue-turn --turn turn_a58a555ac944c973 --reason ghost` to recover."}}
```

Governed state mirror from `/tmp/tusq-dev-v4b-215411/.agentxchain/state.json`:

```json
{
  "status": "blocked",
  "blocked_category": "ghost_turn",
  "recovery_detail": "Auto-retry stopped early after 2 consecutive same-signature attempts [local-dev|dev|stdout_attach_failed] (stdout_attach_failed); last attempt 2/3. Turn turn_a58a555ac944c973 failed to start within the startup watchdog window. Run `agentxchain reissue-turn --turn turn_a58a555ac944c973 --reason ghost` to recover.",
  "recovery_action": "Turn turn_a58a555ac944c973 failed to start within the startup watchdog window. Run `agentxchain reissue-turn --turn turn_a58a555ac944c973 --reason ghost` to recover."
}
```

Continuous-session mirror from `/tmp/tusq-dev-v4b-215411/.agentxchain/continuous-session.json`:

```json
{
  "status": "paused",
  "ghost_retry": {
    "attempts": 2,
    "exhausted": true,
    "attempts_log": [
      {
        "old_turn_id": "turn_68526370af0ae924",
        "new_turn_id": "turn_c914574ccc483d4b",
        "failure_type": "stdout_attach_failed",
        "stderr_excerpt_present": true,
        "exit_code_present": true,
        "exit_signal_present": true
      },
      {
        "old_turn_id": "turn_c914574ccc483d4b",
        "new_turn_id": "turn_a58a555ac944c973",
        "failure_type": "stdout_attach_failed",
        "stderr_excerpt_present": true,
        "exit_code_present": true,
        "exit_signal_present": true
      }
    ]
  }
}
```

Summary counters:

```json
{
  "auto_retried_ghost": 2,
  "ghost_retry_exhausted": 1,
  "runtime_spawn_failed": 0,
  "stdout_attach_failed": 3
}
```

Conclusion:

BUG-61 negative path is proven on the shipped package. Auto-retry fires on typed `stdout_attach_failed` ghost failures, preserves retry attempt metadata, stops once the same signature repeats, emits one `ghost_retry_exhausted` row, mirrors blocked `ghost_turn` state, and keeps the manual `agentxchain reissue-turn --turn <id> --reason ghost` recovery string visible.
