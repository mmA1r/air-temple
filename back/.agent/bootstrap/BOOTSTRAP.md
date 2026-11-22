# Project configuration bootstrap — agent protocol

Run when the root `AGENTS.md` enters Bootstrap Mode, or the user requests `Initialize agent kit` / `Reconfigure project rules`.

## Principles

- This is a **conversation-driven instruction**, not an executable questionnaire, autonomous installer, or guaranteed background process.
- Before asking, inspect the README, manifests, source tree, lockfiles and relevant configuration. Report verified facts and flag contradictions. For a blank repository, do not pretend it has a stack.
- Ask **at most 3–5 high-value related questions in each turn**. Questions must be based on what is still unknown and consequential. Do not bombard users with the entire checklist.
- Offer 2–3 clear alternatives with implications when the user has not selected a technology; never treat an illustrative example as a requirement.
- Distinguish **confirmed**, **inferred from evidence**, **proposed**, **undecided**. Require explicit user confirmation for consequential proposed decisions (hosting, privacy, auth, storage, data durability, monetization).
- Do not invent answers to fill template fields. Use `UNSET` for unresolved critical facts; `NOT_APPLICABLE` for explicitly irrelevant ones.
- Do not silently overwrite existing custom rules or an initialized PROJECT.md. Show intended changes and preserve user-authored sections. Reconfiguration should be targeted.

## Discovery sequence (adaptive)

1. **Intent:** product goal, primary users, MVP, out-of-scope items, single/multiple clients, whether project already exists.
2. **Functional scope:** concrete workflows, data entities, file/media requirements, authentication, user content moderation if relevant, APIs/integrations, admin operations.
3. **Nonfunctional needs:** expected load and file volume, privacy/security, storage durability, latency, accessibility, SEO if relevant, compliance if known, supported environments.
4. **Technical/deployment constraints:** preferred language/framework, database, storage, hosting/provider, runtime, cloud budget, migrations, background jobs, observability, CI, tests. Mark choices undecided until confirmed.
5. **Agent preferences:** simplicity vs scaling, naming/layer conventions, strict constraints, file ownership, formatting and delivery expectations. Reuse shared defaults if unanswered.

See `QUESTIONS.md` for targeted prompts, not a mandatory survey.

## Selection & composition

- Select **only relevant** exact paths from `.agent/profiles/`. Never load all profiles.
- UI React/Vite project: `.agent/profiles/react/react-vite-landing.md` only if the project is actually a React/Vite landing.
- Go service: `.agent/profiles/go/go-service.md`.
- HTTP API: `.agent/profiles/go/http-api.md`.
- Media-heavy gallery/image service: `.agent/profiles/go/media-gallery.md`.
- For any unsupported technology, create a narrowly scoped new profile based on **confirmed** project requirements and official or repository evidence; do not impersonate an expert by inventing conventions.
- Select overlapping profiles only if their scope is distinct and compatible. Explain conflicts before committing.

## Artifacts & output

1. Populate `.agent/project/PROJECT.md` using `.agent/templates/PROJECT.template.md`, preserving confirmed facts, choices, explicit unknowns and exact active profile paths.
2. Populate `.agent/project/CONTEXT.md` with **verified** current architecture and repository findings. For new repositories, write `Not implemented yet` rather than invented structure.
3. Add adopted architectural choices to `.agent/project/DECISIONS.md` (decision, rationale, consequences, status/date).
4. Create or modify scoped profiles only as needed. Keep generic rules in `.agent/rules/`, never in domain-specific profiles.
5. Mark `Status: READY` when all required core project intent fields have explicit answers and selected profile paths exist. `PARTIAL` is allowed if non-blocking technical decisions remain open. Keep `NOT_INITIALIZED` if product intent is still unknown.
6. Show summary: confirmed constraints, selected profiles, chosen architecture, unresolved decisions and resulting file paths. Avoid building app code until explicitly requested.

## Bootstrap safety checks

- Confirm root AGENTS.md points to real files and selected profile paths exist.
- Do not equate a starter-kit example directory layout with an already implemented architecture.
- Never commit or write secrets; refer to env-variable **names** only.
- When adapting an established repo, prefer observed conventions to a speculative migration.
