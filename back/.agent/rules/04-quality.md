# Cross-stack quality

- Validate untrusted inputs, enforce authorization at real boundaries and avoid logging secrets or credentials.
- Choose tests that cover meaningful behavior and failure paths. Use existing test stack; do not install a test framework just to satisfy a template.
- Verify relevant compile/typecheck/lint/tests/build with commands present in repository, and state clearly what was not run.
- Treat accessibility, browser behavior, and animation concerns as UI-specific; treat API protocol, concurrency and shutdown as backend-specific.
- Check concurrency/races, timeouts, retry safety, resource limits, injection and data loss when relevant to implementation.
- Do not invent fake production integrations, API responses or test results. Fakes are permitted only as explicitly scoped test doubles.
- Keep dependency and configuration changes narrow; record major choices when adopted.
