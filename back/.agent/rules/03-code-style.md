# Cross-stack code style

- Follow official language tooling and repository formatter/linter when available. Prefer local established naming conventions to universal rules about filename casing.
- Use explicit, meaningful identifiers. Avoid catch-all `utils`/`helpers` modules when ownership is known.
- Keep code cohesive and functions focused; do not extract every line or force tiny files.
- Comments should explain **why**, constraints and surprising behavior, rather than narrate obvious syntax.
- Avoid magic values when they represent business invariants, timeouts, rates, limits or policy.
- Do not ignore typed errors/exceptions or disguise failure as success.
- Do not add dependencies without a concrete benefit and maintenance justification.
- Use stack profiles for JSX/SCSS/GSAP or Go-specific conventions; rules here intentionally remain language-agnostic.
