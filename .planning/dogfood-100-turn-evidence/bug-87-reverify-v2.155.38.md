# BUG-87 Re-Verify Evidence — agentxchain@2.155.38

## Summary

BUG-87 blocked dev turn `turn_73dc44cfb9cef2c7` because `.tusq/plan.json` was dirty and unclassified after verification commands ran. The fix in `agentxchain@2.155.38` auto-normalizes undeclared verification-produced files as `disposition: "ignore"`, cleans them up, and filters them from the observation before downstream declared-vs-observed comparison.

## Reverification

- **Package:** `agentxchain@2.155.38` (via `npx --yes -p agentxchain@2.155.38`)
- **Project:** `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev`
- **Branch:** `agentxchain-dogfood-100-turn-2026-04`
- **Run:** `run_24ccd92f593d8647`
- **Turn:** `turn_73dc44cfb9cef2c7` (dev, implementation phase)
- **Command:** `npx --yes -p agentxchain@2.155.38 -c 'agentxchain accept-turn --turn turn_73dc44cfb9cef2c7 --checkpoint'`

## Result

Turn accepted cleanly:
- Status: completed
- Summary: Implemented M30 (tusq surface plan) in src/cli.js with classifyGating/buildSurfacePlan/cmdSurface; added M30 smoke tests (16 assertions) and eval scenario surface-plan-determinism (21 total); npm test exits 0
- Accepted ref: `git:d6d6bef76cbc94e130512aadada5a0f35f32028e`
- Checkpoint: `98712d90c2cb81764fa75c43b28c15c03ddf1de2`
- Proposed next: qa

## Audit Event

`verification_output_auto_normalized` event emitted:
```json
{
  "event_id": "evt_fca20fe4cdb0482b",
  "event_type": "verification_output_auto_normalized",
  "timestamp": "2026-04-26T15:20:45.856Z",
  "run_id": "run_24ccd92f593d8647",
  "phase": "implementation",
  "turn": {"turn_id": "turn_73dc44cfb9cef2c7", "role_id": "dev"},
  "payload": {
    "auto_classified_files": [".tusq/plan.json"],
    "restored_files": [".tusq/plan.json"],
    "disposition": "ignore",
    "rationale": "undeclared_verification_output_auto_normalized"
  }
}
```

## Conclusion

- No `jq` surgery on staging JSON.
- No `accept-turn` operator recovery.
- No manual `verification.produced_files` editing.
- Framework auto-normalized `.tusq/plan.json` and accepted the turn cleanly.
- BUG-87 does not reproduce on `agentxchain@2.155.38`.
