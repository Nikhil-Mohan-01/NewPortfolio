# Execution plan template

Use this for any task that touches more than a couple of files or has real design decisions. Copy it to `.agent/plans/<spec-name>.md`, fill it in, and **keep it updated while you work**: it is the single record of progress, so someone could resume from it cold.

---

## Plan: <title>
Spec: `specs/<file>.md`
Branch: `feat/<name>`
Status: not started | in progress | blocked | done

### 1. Goal and non-goals
One paragraph on the outcome. Then list what is explicitly out of scope (copy from the spec's strict-scope section).

### 2. Repo findings
What exists already: framework, conventions, scripts, dependencies. If the repo is empty, say so.

### 3. Decisions and assumptions
Each decision, with the reason. Anything ambiguous in the spec and how you resolved it.

### 4. Milestones
Each milestone must be independently runnable and checkable.

- [ ] M1: <name>
  - Files:
  - Done when:
  - How to verify:
- [ ] M2: ...

### 5. Risks
What could go wrong (performance, seams, compatibility) and how each milestone reduces it.

### 6. Progress log
Dated one-liners: what finished, what changed from the plan, what surprised you.

### 7. Verification
Map each acceptance criterion from the spec to the evidence (command output, screenshot, measurement). Mark anything unverified and say why.

### 8. Final report
Files changed · how to run · tuning parameters · checks run · limitations.
