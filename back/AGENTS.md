# Air Temple backend

Read [.agent/project/PROJECT.md](.agent/project/PROJECT.md) for requirements and active profiles, [.agent/project/CONTEXT.md](.agent/project/CONTEXT.md) for implemented behavior, and [.agent/project/DECISIONS.md](.agent/project/DECISIONS.md) for accepted choices. Apply the shared rules in [.agent/rules/](.agent/rules/) and the profiles listed in the project specification.

For initialization or reconfiguration, follow [.agent/bootstrap/BOOTSTRAP.md](.agent/bootstrap/BOOTSTRAP.md). Confirm open choices before implementing features that depend on them.

## Cross-stack code style

- Follow official language tooling and repository formatter/linter when available. Prefer local established naming conventions to universal rules about filename casing.
- Use explicit, meaningful identifiers. Avoid catch-all `utils`/`helpers` modules when ownership is known.
- Keep code cohesive and functions focused; do not extract every line or force tiny files.
- Comments should explain **why**, constraints and surprising behavior, rather than narrate obvious syntax.
- Avoid magic values when they represent business invariants, timeouts, rates, limits or policy.
- Do not ignore typed errors/exceptions or disguise failure as success.
- Do not add dependencies without a concrete benefit and maintenance justification.
- Use stack profiles for JSX/SCSS/GSAP or Go-specific conventions; rules here intentionally remain language-agnostic.
