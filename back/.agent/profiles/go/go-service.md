# Profile: Go service

Use only when selected in `PROJECT.md`. Applies to Go backend/service code, not to UI.

## Design

- Prefer Go standard library and idiomatic direct code. Introduce a web framework, ORM, dependency injection container or event bus only for a concrete need or established convention.
- Organize by domain/capability and actual ownership; do not impose Clean Architecture layers, `pkg/`, repositories, interfaces or generic service wrappers as ritual.
- `cmd/<app>/main.go` owns process composition; `internal/` contains private application packages. `pkg/` is optional for truly public reusable libraries; do not create it automatically.
- Define interfaces at the **consumer** boundary where replacement/testing is real. Avoid interfaces for every struct.
- Pass `context.Context` as the first parameter for operations that can block or be canceled. Respect cancellation and deadlines.
- Return errors with context (`fmt.Errorf("...: %w", err)`); avoid panic for ordinary failures. Do not log and return the same error unless the boundary warrants it.
- Avoid package-level mutable state. Make dependency lifetimes explicit.
- Name packages concise lower-case singular by responsibility; avoid `utils`, `common`, `models` catch-all packages.

## Operational quality

- Explicit config validation; secrets only in environment/secret manager, never in agent docs.
- Handle graceful shutdown, timeouts and termination of workers/servers where applicable.
- Use structured logs with safe fields; no access tokens, credentials or unnecessary personal data.
- Use `gofmt`, `go vet`, `go test ./...`; add race and integration tests when useful and environment permits.
- Keep deterministic unit tests, table-driven tests where clarity improves; test behavior at boundaries, not implementation detail.
- For databases: explicit migration ownership, transactions around invariants, bounded queries, connection limits and cancellation. Choose DB/driver only after project decisions.

## Minimal possible layout (not mandatory)

```text
cmd/api/main.go
internal/
  config/
  gallery/
  platform/
    storage/
```

Create directories only as corresponding code exists. Any layout in project documentation should reflect the actual repository, not this illustrative example.
