# Starting Every New Antigravity Session

1. Open the project root.
2. Ensure `AGENTS.md` is present and the agent reads it.
3. Ask the agent to read `docs/AI_WORKFLOW.md` and only the latest relevant entries in `docs/AI_WORKLOG.md`.
4. Start with one task using the template below. Attach a screenshot/error only if it helps reproduce the issue.
5. Ask the agent to inspect first, state the evidence, then implement and test. Do not ask it to “fix everything” in one giant prompt.
6. Before accepting the work, review its diff, command results, manual test steps, and deployment notes.
7. At the end of the session, ask it to update the worklog and list unfinished tasks.
8. Before closing the session, save/commit the project files including these instruction docs so they are available next time. The chat transcript alone is not persistent project memory.

## Copy/paste starter prompt

Read `AGENTS.md`, `docs/AI_WORKFLOW.md`, and the relevant latest notes in `docs/AI_WORKLOG.md` first. Treat these repository files as the persistent project rules. My task is:

**Task:** [describe one bug/feature]
**Where:** [page/component/route, if known]
**Steps to reproduce:** [numbered steps]
**Expected:** [what should happen]
**Actual:** [what happens + exact error]
**Constraints:** Preserve existing behavior and design; avoid unrelated refactors; prioritize low token use and minimal safe changes.

Work in this order:
1. Inspect relevant code, usages, and tests before editing.
2. Give me a concise root-cause hypothesis and acceptance criteria.
3. Implement the smallest complete fix and add/update regression tests.
4. Run targeted tests, typecheck, full tests, and production build as applicable. Report exact commands and actual results; never claim unrun tests passed.
5. Review the diff for regressions, secrets, and unrelated changes.
6. Update `docs/AI_WORKLOG.md`.
7. Finish with root cause, implementation, files changed, verification, manual test walkthrough, deployment/rollback notes, and remaining risks.

Do not stop after explaining what I should do: if the task is actionable and safe, make the code change in the workspace.
