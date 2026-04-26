# BUG-89 Reverify — agentxchain@2.155.43

## Summary

QA turn `turn_4125be3cf057395a` with `objections[0].id: "OBJ-002-M31"` accepted cleanly on `agentxchain@2.155.43` without manual staging JSON edits. The staged-result normalizer rewrote the invalid ID to `OBJ-001` and emitted the `staged_result_auto_normalized` audit event.

## Environment

- Project: tusq.dev
- Branch: agentxchain-dogfood-100-turn-2026-04
- Shipped package: agentxchain@2.155.43
- Run: run_e40832d436a42d75
- Turn: turn_4125be3cf057395a (qa)
- Checkpoint: ed1e77a796020462d719df5dba4e4da7105c5a69

## Evidence

### Turn acceptance output

```
Turn Accepted
────────────────────────────────────────────

Turn:     turn_4125be3cf057395a
Role:     qa
Status:   completed
Summary:  Challenged dev M31 implementation, ran independent verification (npm test exit 0, 22 scenarios), added REQ-146–REQ-167 (22 new M31 acceptance criteria) to acceptance matrix, updated ship-verdict.md with 9-point challenge, updated RELEASE_NOTES.md with M31 verification entry; all 167 criteria pass; ship verdict SHIP; OBJ-002-M31 (low, non-blocking) raised for flag-value assertion coverage gap.
Proposed: dev
Accepted: git:44eb87e2099cc61b657d39f807590043e86fadfe
Cost:     $0.00
Checkpoint: ed1e77a796020462d719df5dba4e4da7105c5a69
```

### Normalization event

```json
{
  "event_type": "staged_result_auto_normalized",
  "timestamp": "2026-04-26T19:50:32.162Z",
  "run_id": "run_e40832d436a42d75",
  "turn": {
    "turn_id": "turn_4125be3cf057395a",
    "role_id": "qa"
  },
  "payload": {
    "field": "objections[0].id",
    "original_value": "OBJ-002-M31",
    "normalized_value": "OBJ-001",
    "rationale": "invalid_objection_id_rewritten"
  }
}
```

## Closure

- reproduces-on-tester-sequence: NO
- Manual staging JSON edits: NONE
- Operator accept-turn: YES (but only because the dogfood session was paused on BUG-89; the normalization itself is automatic)
- Shipped version: agentxchain@2.155.43
