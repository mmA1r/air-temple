# Universal working protocol

1. Check bootstrap/development mode in root AGENTS.md and open relevant files.
2. Before changes, inspect project scope, current code/config, existing conventions, and task-relevant profiles. Check unresolved required fields without repeating irrelevant setup interviews.
3. Implement the smallest complete change consistent with accepted constraints; avoid speculative dependencies and unrelated refactors.
4. No placeholder production code, fake integrations, TODO-only branches, or fabricated test outcomes. Explicit test doubles remain acceptable in tests.
5. Run applicable existing checks. Inspect imports, migrations, docs and public behavior affected by edits.
6. Summarize changes, actual verification and blockers. Update `CONTEXT.md` for durable verified facts and `DECISIONS.md` for newly accepted major decisions.

Prefer direct repository evidence over old docs. When a critical decision is unresolved, ask a focused question; when unrelated, proceed without blocking.
