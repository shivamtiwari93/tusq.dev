# Issue: PM does not derive the next roadmap increment from VISION.md after roadmap exhaustion

## Summary

AgentXchain continuous vision mode stops with "no derivable work from vision" even though `.planning/VISION.md` still contains substantial V2/V3 scope. The active run remains blocked on a stale M27 `planning_signoff` gate, and manual continuation inherits the blocked M27 parent context instead of routing PM to derive the next concrete roadmap/spec/intake increment.

This prevents full-auto, lights-out progress after the current roadmap is checked through the latest milestone. The framework appears to conflate "current roadmap is exhausted" with "the whole vision is complete."

## Environment

- Project: `tusq.dev`
- Workspace: `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev`
- Date observed: 2026-04-22
- AgentXchain npm/latest version checked with:

```sh
npm view agentxchain version
npx --yes -p agentxchain@latest -c 'agentxchain --version'
```

- Observed version: `2.154.7`
- Required execution path used for AgentXchain commands:

```sh
npx --yes -p agentxchain@latest -c 'agentxchain ...'
```

## Current observed state

`agentxchain status` reports a completed continuous vision session but a blocked active run:

```text
Continuous Vision-Driven Session
Session:     cont-f5049521
Vision:      .planning/VISION.md
Status:      completed
Runs:        0/1
Idle cycles: 1/1

Project:  tusq.dev
Phase:    planning
Run:      BLOCKED
Origin:   continuation from run_995056dd29cb9f11
Inherits: parent run_995056dd29cb9f11 (blocked)
Accepted: git:e9c7fe25b6ef015e0a95ff81020e2828f010ec81
Last role: pm
Turn:     No active turn

Blocked:  BLOCKED - planning_signoff exit gate explicitly requires human approval before transitioning from planning to implementation phase. All four PM-owned workflow-kit artifacts ... cover M27 scope ...

Human task: hesc_82dd03472d55f3a5
Type:     needs_decision
Unblock:  agentxchain unblock hesc_82dd03472d55f3a5
```

`.agentxchain/continuous-session.json` confirms the continuous loop did not dispatch work:

```json
{
  "session_id": "cont-f5049521",
  "vision_path": ".planning/VISION.md",
  "runs_completed": 0,
  "max_runs": 1,
  "idle_cycles": 1,
  "max_idle_cycles": 1,
  "current_run_id": "run_71b762f4405c0fc5",
  "current_vision_objective": null,
  "status": "completed",
  "startup_reconciled_run_id": "run_71b762f4405c0fc5"
}
```

`.agentxchain/state.json` confirms the run is a continuation from a blocked parent, not a clean "derive next increment" run:

```json
{
  "run_id": "run_71b762f4405c0fc5",
  "status": "blocked",
  "phase": "planning",
  "provenance": {
    "trigger": "continuation",
    "parent_run_id": "run_995056dd29cb9f11",
    "created_by": "operator"
  },
  "inherited_context": {
    "parent_run_id": "run_995056dd29cb9f11",
    "parent_status": "blocked",
    "parent_phases_completed": ["planning"],
    "parent_roles_used": ["pm"],
    "parent_blocked_reason": "human:planning_signoff gate explicitly requires human approval before transitioning from planning to implementation..."
  }
}
```

## Product evidence: vision is not exhausted

`.planning/VISION.md` still contains explicit future scope after the current implemented V1/V1.x roadmap:

- V2 runtime instrumentation: payload observation, auth context capture, failure and latency analysis, hot-path identification.
- V2 eval and regression infrastructure: golden-path tests, permission regression, schema regression, drift detection.
- V2 migration and rollout tooling: staged environment rollout, internal-first rollout modes, kill switches, fallback paths, rollout checklists.
- V2 richer docs/adoption surfaces: support docs, operator docs, security review artifacts, optional typed SDK generation.
- V2 richer skill/workflow/interface generation and stronger governance workflows.
- V3 runtime learning loop, advanced usage intelligence, competitive transition intelligence, automated improvement proposals, and deeper governance/change intelligence.

Relevant source location:

```text
.planning/VISION.md lines 257-290
```

## Product evidence: current roadmap is exhausted, not the vision

`.planning/ROADMAP.md` is checked through M27. The latest milestone is:

```text
### M27: Reviewer-Facing PII Redaction Review Report (~0.5 day)
```

All M27 checklist items are checked. No M28 or later roadmap increment exists.

Relevant source location:

```text
.planning/ROADMAP.md lines 271-292
```

That is the correct condition for PM to replenish the roadmap from `VISION.md`, not for AgentXchain to declare the entire vision complete.

## Human escalation evidence

`HUMAN_TASKS.md` shows the active blocker is stale M27 signoff rather than a new PM-derived item:

```text
### hesc_82dd03472d55f3a5 - needs_decision
- Created: 2026-04-22T14:05:07.661Z
- Run: run_71b762f4405c0fc5
- Phase: planning
- Blocked on: human:planning_signoff exit gate explicitly requires human approval before transitioning from planning to implementation phase. All four PM-owned workflow-kit artifacts ... cover M27 scope ...
- Continue: agentxchain unblock hesc_82dd03472d55f3a5
```

The blocker itself says the M27 artifacts already cover M27 scope. Approving it again does not derive M28; it risks re-entering the same stale M27 approval loop.

## Reproduction path

From the tusq.dev workspace:

```sh
npm view agentxchain version
npx --yes -p agentxchain@latest -c 'agentxchain --version'
npx --yes -p agentxchain@latest -c 'agentxchain status'
npx --yes -p agentxchain@latest -c 'agentxchain run --continuous --vision .planning/VISION.md --max-runs 1 --max-idle-cycles 1'
npx --yes -p agentxchain@latest -c 'agentxchain status'
```

Observed behavior across multiple package versions up to `2.154.7`:

```text
Idle cycle 1/1 - no derivable work from vision.
All vision goals appear addressed (1 consecutive idle cycles). Stopping.
```

Then status still reports:

```text
Status: completed
Runs: 0/1
Idle cycles: 1/1
Run: BLOCKED
Origin: continuation from run_995056dd29cb9f11
Inherits: parent run_995056dd29cb9f11 (blocked)
Blocked: planning_signoff ... cover M27 scope ...
```

## Expected behavior

When continuous vision mode reaches an idle state and the current roadmap has no unchecked milestone, AgentXchain should distinguish three cases:

1. Current increment complete.
2. Current roadmap exhausted.
3. Full vision exhausted.

If `.planning/VISION.md` still contains unplanned future scope, AgentXchain should route PM to derive the next bounded increment, for example M28, by updating the appropriate planning artifacts and/or intake state.

The PM should be instructed to:

- Ignore stale gate loops for already-completed milestones unless recovery explicitly targets them.
- Read `.planning/VISION.md`, `.planning/ROADMAP.md`, `.planning/SYSTEM_SPEC.md`, `.planning/PM_SIGNOFF.md`, and current product docs/code gaps.
- Select the next bounded, testable roadmap increment from remaining vision scope.
- Produce a concrete roadmap/spec/intake update for that increment.
- Only enter `planning_signoff` for the new increment after producing new scope.

## Actual behavior

AgentXchain stops in continuous mode with no derivable work:

- `runs_completed` remains `0`.
- `current_vision_objective` remains `null`.
- `status` becomes `completed`.
- The active run remains `blocked`.
- The active blocked reason is still M27 `planning_signoff`.
- PM's last role context is inherited from the blocked M27 parent.
- No M28 or next increment is created.

## Impact

This blocks full-auto development after the visible roadmap catches up to the latest implemented milestone.

Operationally, the human/operator must repeatedly intervene to:

- Detect that VISION.md still has unplanned scope.
- Avoid approving stale `planning_signoff` loops.
- Explain that M27 is done and should not be re-approved just to spin.
- Manually request PM-derived continuation.
- Potentially create or force a clean next-increment planning run.

Without those interventions, AgentXchain either stops idle or loops on stale human gates.

## Suspected root causes

1. The continuous derivation heuristic appears to use roadmap exhaustion or lack of unchecked items as a proxy for full vision completion.
2. Continuation runs inherit blocked milestone context too strongly, so PM remains anchored to M27 instead of deriving the next item from the remaining vision.
3. There is no explicit "roadmap replenishment" state transition for the case where the current roadmap is complete but `VISION.md` is not.
4. Human-gate recovery and next-increment derivation are conflated. A stale gate can dominate status even when the operator's intended action is "derive next work," not "approve old work."
5. Continuous mode can mark the session `completed` with `runs_completed: 0`, which hides that no product/planning progress occurred.

## Operator workaround used

The operator intentionally did not unblock `hesc_82dd03472d55f3a5` because the evidence showed it was an M27 signoff gate for already-covered M27 scope. Re-approving would likely re-enter the stale approval loop and would not create an M28 increment.

Instead, the operator inspected:

- `agentxchain status`
- `.agentxchain/continuous-session.json`
- `.agentxchain/state.json`
- `HUMAN_TASKS.md`
- `.planning/VISION.md`
- `.planning/ROADMAP.md`

The operator concluded that this is a framework-level idle-expansion failure and documented it here rather than mutating product code outside AgentXchain.

## Proposed fix

Add an explicit continuous-mode idle expansion path:

```text
If no active roadmap/intake item is derivable
AND current roadmap has no unchecked milestone
AND VISION.md has unplanned future sections or goals
THEN dispatch PM in "derive next roadmap increment" mode
WITHOUT inheriting stale blocked gate context as the primary objective.
```

The PM objective should be concrete:

```text
Derive the next bounded roadmap/spec/intake increment from remaining VISION.md scope and current product gaps. Do not re-verify or seek signoff for the previous completed milestone unless that is the explicit objective.
```

The framework should also emit a separate status when roadmap exhaustion is detected:

```text
Roadmap exhausted, vision still open, deriving next increment.
```

instead of:

```text
All vision goals appear addressed.
```

## Acceptance criteria

- With `.planning/ROADMAP.md` checked through M27 and no M28 present, continuous mode does not claim full vision completion while `.planning/VISION.md` still contains V2/V3 scope.
- Continuous mode creates or dispatches a PM turn with a clear next-increment derivation objective.
- The resulting PM turn produces a new bounded roadmap/spec/intake increment rather than revalidating M27.
- Stale human gates from the previous milestone do not dominate the objective of a clean next-increment derivation run.
- `agentxchain status` differentiates "no active turn because current roadmap is exhausted" from "vision fully complete."
- `runs_completed: 0` plus `status: completed` is not presented as successful product progress when no PM/dev/QA/product-marketing work was actually dispatched.
- If the framework truly determines that VISION.md is fully addressed, it reports the evidence: which vision sections/goals were mapped to which completed milestones.

## Severity

High for full-auto operation. This does not corrupt product code, but it prevents AgentXchain from operating lights-out beyond the current roadmap and causes repeated human/operator intervention.

## Related files

- `.planning/VISION.md`
- `.planning/ROADMAP.md`
- `.planning/PM_SIGNOFF.md`
- `.planning/SYSTEM_SPEC.md`
- `.planning/command-surface.md`
- `HUMAN_TASKS.md`
- `.agentxchain/continuous-session.json`
- `.agentxchain/state.json`
- `.agentxchain/session.json`
