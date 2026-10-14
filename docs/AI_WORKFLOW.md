# AI-Assisted Engineering Workflow

Use this with `AGENTS.md`. It is designed for fast, low-cost iterations without sacrificing reliability.

## Model routing (choose per task)
Model names and availability change. Choose by capability labels in Antigravity rather than relying on a model name that may disappear.

| Priority | Task | Model capability | Why |
|---|---|---|---|
| P0 | Production outage, auth/RLS, data loss, security, migrations, complex cross-file bug | Strongest reasoning/coding model available | Higher cost is justified by risk |
| P1 | Root-cause debugging, multi-file features, architecture, regression test design, code review | Strong coding/reasoning model | Best default for nontrivial work |
| P2 | Small isolated UI tweak, copy, CSS, simple component, routine test edits | Fast/cheap coding model | Good cost/speed tradeoff |
| P3 | Rename, simple text/docs, mechanical repetitive changes | Cheapest fast model | Low complexity |
| Review | After risky or broad change, use a different strong model if available | Independent reviewer | Catches blind spots; do not pay for this on every tiny task |

**Default recommendation:** use a fast/low-cost model to inspect and plan, then a strong coding model only when the change is cross-file, uncertain, or high risk. For a critical fix, do not optimize for token cost at the expense of correctness. Verify current pricing and Antigravity model availability in its UI before choosing; do not assume a model is free because its name or tier suggests so.

## Standard loop
1. Read `AGENTS.md`, then relevant sections of `docs/AI_WORKLOG.md`.
2. Inspect the smallest relevant code surface and existing tests.
3. Write a short evidence-based plan and acceptance criteria.
4. Implement one cohesive change; avoid bundling unrelated improvements.
5. Add a regression test.
6. Run targeted test → typecheck → full tests → production build, as applicable.
7. Review `git diff` for accidental edits, secrets, debug code, and unrelated formatting.
8. Give the user a manual test walkthrough and honest results.
9. Append a short worklog entry and any reusable project fact to docs.
10. Commit only if the user requests or the workflow is configured to commit; never deploy without permission.

## Token-control rules
- Do not paste the whole repository or huge logs into a prompt.
- Provide the exact error, reproduction steps, expected/actual behavior, and relevant files.
- Ask the agent to search usages and inspect only directly related callers.
- Request a concise plan before implementation, not a long essay.
- Ask for full verification and a practical test checklist, but concise summaries.
- If a command fails, share the first meaningful error plus nearby context, not thousands of lines.
- Do not repeat full context already saved in `AGENTS.md` or the worklog.
- For a second attempt, tell the agent what was already tried and require it to explain why the new attempt is different.
- Keep one issue per task unless two issues share the same root cause.

## Definition of done
A task is done only when:
- acceptance criteria are met,
- regression coverage exists where practical,
- relevant checks actually ran,
- no unrelated behavior was changed,
- the user has a manual verification checklist,
- deployment steps and limitations are stated,
- `docs/AI_WORKLOG.md` has a concise update.

A build passing is not proof that runtime behavior works. Test the actual route/flow and important failure states.
