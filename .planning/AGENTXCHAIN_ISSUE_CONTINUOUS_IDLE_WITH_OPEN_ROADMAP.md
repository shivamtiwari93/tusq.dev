# Issue: Continuous vision mode exits idle even when ROADMAP.md has unchecked milestones and VISION.md has open scope

## Summary

AgentXchain continuous vision mode is marking the tusq.dev session complete with `runs_completed: 0` and no next objective, even though the repository currently contains unchecked roadmap milestones and the broader VISION.md still has explicit V2/V3 product scope.

This is no longer only the older "roadmap exhausted but vision still open" failure shape. The current tusq.dev state is stronger evidence: `.planning/ROADMAP.md` already contains unchecked M28 and M29 work, but continuous mode still reports completion/idle instead of dispatching PM or dev to continue that work.

## Environment

- Project: `tusq.dev`
- Workspace: `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev`
- Branch: `main`
- Date captured: `2026-04-26T00:51:50Z`
- Package checked via shipped npm tarball:

```sh
cd "/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev"
npx --yes -p agentxchain@latest -c 'agentxchain --version'
```

Observed output:

```text
2.155.25
```

Git state at capture time:

```sh
cd "/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev"
git status --short --branch
```

Observed output:

```text
## main...origin/main [ahead 2]
 M .agentxchain/continuous-session.json
 M .agentxchain/events.jsonl
 M .agentxchain/session.json
 M .agentxchain/state.json
```

Recent commits:

```sh
cd "/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev"
git log --oneline --decorate -6
```

Observed output:

```text
100d662 (HEAD -> main) Recover AgentXchain governed state after dogfood merge
b225861 checkpoint: turn_7774b27ecf2d1caf (role=qa, phase=qa)
fa7853e (origin/main, origin/HEAD) Document AgentXchain quote-back evidence
ca221a0 (agentxchain-dogfood-2026-04) checkpoint: turn_5c928016067e555a (role=product_marketing, phase=launch)
a439795 checkpoint: turn_ee155e3062a2395e (role=qa, phase=qa)
ab436bf checkpoint: turn_768db52384611260 (role=dev, phase=implementation)
```

## Current AgentXchain State

Command:

```sh
cd "/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev"
jq '{status, phase, run_id, active_turns, gates, blocked_on, blocked_reason, pending_run_completion, trigger_reason}' .agentxchain/state.json
```

Observed output:

```json
{
  "status": "completed",
  "phase": "launch",
  "run_id": "run_ce89ef5bd4b8cca8",
  "active_turns": {},
  "gates": null,
  "blocked_on": null,
  "blocked_reason": null,
  "pending_run_completion": null,
  "trigger_reason": null
}
```

Command:

```sh
cd "/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev"
jq '{session_id, vision_path, status, runs_completed, max_runs, idle_cycles, max_idle_cycles, current_run_id, current_vision_objective, next_objective, session_paused_anomaly}' .agentxchain/continuous-session.json
```

Observed output:

```json
{
  "session_id": "cont-34797773",
  "vision_path": ".planning/VISION.md",
  "status": "completed",
  "runs_completed": 0,
  "max_runs": 1,
  "idle_cycles": 1,
  "max_idle_cycles": 1,
  "current_run_id": "run_ce89ef5bd4b8cca8",
  "current_vision_objective": null,
  "next_objective": null,
  "session_paused_anomaly": null
}
```

Command:

```sh
cd "/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev"
npx --yes -p agentxchain@latest -c 'agentxchain status --json'
```

Relevant observed status fields:

```json
{
  "state": {
    "run_id": "run_ce89ef5bd4b8cca8",
    "status": "completed",
    "phase": "launch",
    "accepted_integration_ref": "git:100d662d4f259c05760e8804308f29334f14b82b",
    "active_turns": {},
    "blocked_on": null,
    "blocked_reason": null,
    "pending_run_completion": null,
    "phase_gate_status": {
      "planning_signoff": "passed",
      "implementation_complete": "passed",
      "qa_ship_verdict": "passed",
      "launch_ready": "passed"
    },
    "provenance": {
      "trigger": "intake",
      "created_by": "continuous_loop",
      "intake_intent_id": "intent_1777046032635_2eab"
    }
  },
  "continuous_session": {
    "session_id": "cont-34797773",
    "vision_path": ".planning/VISION.md",
    "runs_completed": 0,
    "max_runs": 1,
    "idle_cycles": 1,
    "max_idle_cycles": 1,
    "current_run_id": "run_ce89ef5bd4b8cca8",
    "current_vision_objective": null,
    "status": "completed",
    "expansion_iteration": 0
  },
  "pending_intents": [],
  "next_actions": []
}
```

## Product Evidence: Roadmap Is Not Exhausted

`/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.planning/ROADMAP.md` contains unchecked milestones M28 and M29.

Command:

```sh
cd "/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev"
rg -n "^### M2[89]|\\[ \\]" .planning/ROADMAP.md
```

Relevant observed output:

```text
.planning/ROADMAP.md:298:### M28: Static Sensitivity Class Inference from Manifest Evidence (~0.5 day)
.planning/ROADMAP.md:299:- [ ] Add `classifySensitivity(capability)` pure deterministic function in `src/cli.js` implementing the frozen six-rule first-match-wins decision table: R1 preserve→restricted, R2 admin/destructive verb or admin-namespaced route→restricted, R3 pii_categories non-empty→confidential, R4 write verb + financial-context route/param→confidential, R5 auth_required or narrow write→internal, R6 default→public
.planning/ROADMAP.md:300:- [ ] Capabilities with zero static evidence (no verb, no route, no params, no redaction, no preserve, no auth_required) MUST receive `sensitivity_class: "unknown"` — never silently default to "public"
.planning/ROADMAP.md:301:- [ ] Call `classifySensitivity` on every capability in manifest generation; the output is a closed five-value enum: `{public, internal, confidential, restricted, unknown}` — no other value, no nullable
.planning/ROADMAP.md:316:### M29: Static Auth Requirements Inference from Manifest Evidence (~0.5 day)
.planning/ROADMAP.md:317:- [ ] Add `classifyAuthRequirements(capability)` pure deterministic function in `src/cli.js` that returns a structured `auth_requirements` record with the closed shape `{ auth_scheme, auth_scopes, auth_roles, evidence_source }`. `auth_scheme` is one of the closed seven-value enum `{bearer, api_key, session, basic, oauth, none, unknown}` — no other value, no nullable. `evidence_source` is one of the closed five-value enum `{middleware_name, route_prefix, auth_required_flag, sensitivity_class_propagation, none}`.
```

This means the framework should not treat the project as complete or vision-exhausted. At minimum, M28 is directly actionable and should be routed into the normal governed flow.

## Product Evidence: VISION.md Still Has Broader Open Scope

`/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.planning/VISION.md` also contains explicit V2/V3 scope beyond M28/M29.

Command:

```sh
cd "/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev"
rg -n "V2|V3|runtime instrumentation|plugin|skill|rollout|competitive|feedback loop|migration|eval|regression" .planning/VISION.md
```

Relevant observed output:

```text
.planning/VISION.md:93:Every domain we ship opens a plugin surface. Every plugin surface invites contribution. Framework detectors, auth adapters, schema extractors, skill packs, rollout checklists, and eval fixtures are all leverage we do not have to build ourselves.
.planning/VISION.md:130:Framework detectors, auth detectors, schema extractors, skill grouping packs, and interface adapters all live behind plugin interfaces. The core stays small. The ecosystem grows around it.
.planning/VISION.md:187:- generate skills or domain agents from those groups
.planning/VISION.md:197:### Eval and regression infrastructure
.planning/VISION.md:210:### Migration and rollout tooling
.planning/VISION.md:228:## Roadmap shape: V1, V2, V3
.planning/VISION.md:257:### High-leverage in V2
.planning/VISION.md:263:- Eval and regression infrastructure:
.planning/VISION.md:265:- Migration and rollout tooling:
.planning/VISION.md:269:- Richer skill and workflow generation:
.planning/VISION.md:278:### Moat features in V3
.planning/VISION.md:283:  refine schemas, examples, tool boundaries, and skills from production observations.
```

## Why This Is A Framework Bug

The state proves AgentXchain had enough context to know this was an idle-expansion run. `agentxchain status --json` includes the following `provenance.trigger_reason`:

```text
[idle-expansion #1] Inspect VISION.md, ROADMAP.md, SYSTEM_SPEC.md, and current project state.
Derive the next concrete increment as a new intake intent with charter + acceptance_contract + priority.
If ALL vision goals are genuinely exhausted, declare vision_exhausted with per-heading classification.
```

However, the resulting session did not dispatch a new PM/dev run and did not preserve a next objective:

```json
{
  "runs_completed": 0,
  "current_vision_objective": null,
  "next_objective": null,
  "pending_intents": [],
  "next_actions": []
}
```

That is inconsistent with both:

1. Open roadmap work in `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.planning/ROADMAP.md`.
2. Open strategic scope in `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.planning/VISION.md`.

## Expected Behavior

When continuous vision mode is invoked and the current governed run is complete, AgentXchain should classify the planning baseline before declaring idle completion.

Expected behavior if unchecked roadmap items exist:

- Detect the first unchecked roadmap milestone, currently M28 in `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.planning/ROADMAP.md`.
- Start or queue a governed run for that milestone.
- Dispatch the correct next role. For M28, this should usually be `dev` if PM-owned planning artifacts already define sufficient acceptance criteria, or `pm` if the planning artifacts need refresh.
- Set a non-empty `current_vision_objective` or equivalent objective field.
- Increment progress only after an actual governed run is attempted, not after an idle check.

Expected behavior if roadmap is exhausted but VISION.md still contains unplanned scope:

- Dispatch PM in an explicit "derive next roadmap increment" mode.
- Ask PM to produce the next bounded milestone from VISION.md, not to revalidate old launch state.
- Emit status such as `roadmap_exhausted_vision_open`, not `completed`.
- Require a per-heading classification if and only if declaring `vision_exhausted`.

Expected behavior if VISION.md is truly exhausted:

- Emit an explicit `vision_exhausted` result.
- Include evidence mapping VISION headings to completed milestones or intentional non-goals.
- Do not leave `runs_completed: 0` as the only outcome of a session that claims completion.

## Actual Behavior

AgentXchain currently reports:

- `state.status: "completed"`
- `state.phase: "launch"`
- `active_turns: {}`
- `blocked_on: null`
- `continuous_session.status: "completed"`
- `continuous_session.runs_completed: 0`
- `continuous_session.idle_cycles: 1`
- `continuous_session.current_vision_objective: null`
- `pending_intents: []`
- `next_actions: []`

This makes the operator-facing state look terminal even though the product backlog contains unchecked, concrete work.

## Impact

This blocks full-auto operation for tusq.dev after the dogfood merge/recovery sequence.

The current user-visible failure is:

- AgentXchain appears healthy and terminal.
- No human escalation is shown.
- No next action is shown.
- No PM turn is active.
- No dev turn is active.
- ROADMAP.md still contains unimplemented work.
- VISION.md still contains broader V2/V3 scope.

In practical terms, the operator must manually inspect the planning files and realize AgentXchain stopped too early. That defeats the purpose of continuous vision-driven execution.

## Suspected Root Causes

1. Continuous idle detection appears to evaluate the current run terminal state without scanning the roadmap for unchecked milestones.
2. `runs_completed: 0` plus `status: completed` is treated as a valid terminal session even when no work was dispatched.
3. The idle-expansion objective is not persisted into `current_vision_objective`, `next_objective`, `pending_intents`, or `next_actions`.
4. The idle-expansion code path may be relying on completed gate state (`planning_signoff`, `implementation_complete`, `qa_ship_verdict`, `launch_ready`) instead of checking whether the planning artifacts contain open work.
5. There is no distinct state for "current governed run complete, but roadmap contains unchecked work."

## Proposed Fix

Add an explicit continuous-mode planning baseline classifier before declaring an idle session complete.

Suggested order:

1. If `.planning/ROADMAP.md` contains unchecked milestone items, derive the next objective from the first unchecked milestone and dispatch/queue work.
2. Else if `.planning/ROADMAP.md` has no unchecked milestone but `.planning/VISION.md` has unplanned strategic scope, dispatch PM in "derive next roadmap increment" mode.
3. Else declare `vision_exhausted`, but only with explicit evidence mapping VISION headings to completed milestones or accepted non-goals.

Suggested event/status vocabulary:

```text
roadmap_open_work_detected
roadmap_exhausted_vision_open
vision_exhausted
idle_completion_refused_open_roadmap
```

## Acceptance Criteria For The Fix

- Given the current tusq.dev state where `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.planning/ROADMAP.md` contains unchecked M28/M29 items, `agentxchain run --continuous --vision .planning/VISION.md` must not exit with `runs_completed: 0`, `status: completed`, and no objective.
- The session must either dispatch/queue a turn for M28 or produce a clear blocker explaining why M28 cannot be started.
- `agentxchain status --json` must expose a non-empty objective or next action when unchecked roadmap work exists.
- If the framework chooses PM instead of dev, the PM objective must explicitly name the open milestone or the VISION headings being converted into roadmap scope.
- If no unchecked roadmap items exist, but VISION.md still has V2/V3 scope, continuous mode must not claim full completion without a `vision_exhausted` evidence map.
- `runs_completed: 0` must not be presented as successful completion when the session performed no governed work and open roadmap items remain.

## Related Files

- `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.planning/VISION.md`
- `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.planning/ROADMAP.md`
- `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.planning/SYSTEM_SPEC.md`
- `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.planning/PM_SIGNOFF.md`
- `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.agentxchain/state.json`
- `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.agentxchain/session.json`
- `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.agentxchain/continuous-session.json`
- `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.agentxchain/events.jsonl`
- `/Users/shivamtiwari.highlevel/VS Code/1008apps/tusq.cloud/tusq.dev/.planning/AGENTXCHAIN_ISSUE_PM_IDLE_EXPANSION.md`

## Severity

High for Full Auto Mode.

This does not appear to corrupt product code, but it causes AgentXchain to report terminal success while concrete roadmap work remains. For dogfooding tusq.dev, that means the system looks idle/complete even though the next product increment is already written down.
