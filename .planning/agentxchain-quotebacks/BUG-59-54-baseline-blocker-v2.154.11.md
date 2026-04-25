# BUG-59 / BUG-54 Quote-Back: tusq.dev Baseline Blocker

Status: not closable from the current tusq.dev baseline on `agentxchain@2.154.11`.

Primary tusq.dev repo:

`/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev`

Test clone:

`/tmp/tusq-dev-v2-215411`

Evidence directory:

`/tmp/tusq-agentxchain-v2-20260424-215411`

Evidence files:

- `/tmp/tusq-agentxchain-v2-20260424-215411/00-preflight.txt`
- `/tmp/tusq-agentxchain-v2-20260424-215411/01-bug59-positive.txt`

Primary config file:

`/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/agentxchain.json`

Clone config file:

`/tmp/tusq-dev-v2-215411/agentxchain.json`

Package version proof is in:

`/tmp/tusq-agentxchain-v2-20260424-215411/00-preflight.txt`

Version output:

```text
COMMAND: npx --yes -p agentxchain@2.154.11 -c "agentxchain --version"
2.154.11
```

Baseline issue:

The current tusq.dev baseline has no approval policy. The preflight query against `/tmp/tusq-dev-v2-215411/agentxchain.json` shows:

```json
{
  "approval_policy": null,
  "gates": {
    "planning_signoff": {
      "requires_files": [
        ".planning/PM_SIGNOFF.md",
        ".planning/ROADMAP.md",
        ".planning/SYSTEM_SPEC.md"
      ],
      "requires_human_approval": true
    },
    "implementation_complete": {
      "requires_files": [
        ".planning/IMPLEMENTATION_NOTES.md"
      ],
      "requires_verification_pass": true
    },
    "qa_ship_verdict": {
      "requires_files": [
        ".planning/acceptance-matrix.md",
        ".planning/ship-verdict.md",
        ".planning/RELEASE_NOTES.md"
      ],
      "requires_human_approval": true
    },
    "launch_ready": {
      "requires_files": [
        ".planning/MESSAGING.md",
        ".planning/LAUNCH_PLAN.md",
        ".planning/CONTENT_CALENDAR.md",
        ".planning/ANNOUNCEMENT.md"
      ]
    }
  }
}
```

BUG-59 positive command:

Evidence:

`/tmp/tusq-agentxchain-v2-20260424-215411/01-bug59-positive.txt`

Command:

```text
npx --yes -p agentxchain@2.154.11 -c 'agentxchain run --continuous --vision .planning/VISION.md --max-runs 1 --max-idle-cycles 3 --poll-seconds 5 --triage-approval auto --auto-checkpoint --no-report'
```

Observed stdout:

```text
agentxchain run --continuous
  Vision: .planning/VISION.md
  Max runs: 1, Poll: 5s, Idle limit: 3
  Triage approval: auto

Idle cycle 1/3 -- no derivable work from vision.
Idle cycle 2/3 -- no derivable work from vision.
Idle cycle 3/3 -- no derivable work from vision.
All vision goals appear addressed (3 consecutive idle cycles). Stopping.

EXIT_CODE=0
```

State after command from `/tmp/tusq-dev-v2-215411/.agentxchain/state.json`:

```json
{
  "status": "blocked",
  "phase": "planning",
  "pending_run_completion": null,
  "blocked_on": "human:planning_signoff gate explicitly requires human approval before transitioning from planning to implementation. All four PM-owned workflow-kit artifacts (PM_SIGNOFF.md, ROADMAP.md, SYSTEM_SPEC.md, command-surface.md) cover M27 scope completely and are internally consistent with SYSTEM_SPEC Constraints 19 and 20. Baseline npm test green (10 scenarios); 13-command CLI surface intact with `redaction` noun at position 11. No PM edits are defensible without a new charter (see DEC-900). An agent PM cannot self-declare gate satisfaction on a human-required gate; routing to human reviewer.",
  "last_gate_failure": null
}
```

Approval-policy ledger query:

```text
COMMAND: jq -c 'select(.type == "approval_policy") | {timestamp, gate_type, gate_id, action, from_phase, to_phase, reason, matched_rule}' .agentxchain/decision-ledger.jsonl
```

Observed result:

```text
<no rows>
```

Conclusion:

BUG-59 cannot produce the expected approval-policy ledger rows from this tusq.dev baseline because `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/agentxchain.json` and `/tmp/tusq-dev-v2-215411/agentxchain.json` have `approval_policy: null`. BUG-54 also cannot be proven from this V2 run because the continuous command did not dispatch ten adapter-path turns; it idled out with `runs_completed=0`.
