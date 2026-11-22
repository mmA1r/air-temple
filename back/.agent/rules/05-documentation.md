# Documentation lifecycle

- `PROJECT.md`: product intent, accepted constraints, active profiles and explicit unknowns. User intent is authoritative; agent may fill verified technical facts.
- `CONTEXT.md`: living **verified** facts about current implementation, modules, configuration paths, commands, dependencies and constraints. Update on material code changes, not every edit.
- `DECISIONS.md`: adopted consequential architectural decisions and their tradeoffs; use dated ADR entries. Proposals belong in discussion, not in accepted decisions.
- Docs and code must agree. When stale, inspect code and update docs; explain unresolved contradictions.
- Do not put credentials, personal data, raw logs or large generated dumps into docs.
- Never imply a context document is automatically updated outside an agent task. Read/write is an instruction, not background automation.
