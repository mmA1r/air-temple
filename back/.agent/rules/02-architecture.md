# Cross-stack architecture and ownership

- Organize by domain, capability and actual ownership. Put feature-specific logic beside its feature; share only for genuinely independent consumers.
- Prefer explicit boundaries, straightforward data flow and the simplest architecture that meets confirmed nonfunctional requirements.
- Do not create empty directories, excessive layers, speculative interfaces, abstractions, service locators, or deep one-file folder chains.
- Adapt naming, ownership and layout to the language and selected technology profiles. **Never apply React component directory conventions to Go packages.**
- Existing repositories are evidence: avoid unrelated migrations. When moving files, update imports, aliases, tests, scripts and asset paths.
- Keep runtime logic, tooling and offline processing separate where appropriate.
- Architecture examples in profiles are illustrative, not demands to scaffold empty folder trees.
