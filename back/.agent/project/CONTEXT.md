# Current implementation context

**Maintenance:** Agent updates verified repository facts after relevant code/architecture changes. This is not a place for guesses, requirements, secrets or temporary task logs.

## Verified repository state

- Last inspected: 2026-11-22
- The Go service entry point and PNG gallery handlers live in cmd/api.
- Admin routes verify Google ID tokens and check the configured author subject. Public reads require a published row. Private previews stream through the authenticated API.
- PostgreSQL schema is installed manually from migrations/001_artworks.sql. Raw PNG files live in a private directory under MEDIA_DIR keyed by artwork UUID.
- README.md documents configuration variables, HTTP routes and local startup.
- Verification commands: go test ./..., go vet ./..., go build ./...

## Established conventions

- Root instructions define cross-stack code style. Project requirements and selected Go profiles live in PROJECT.md.

## Known constraints and debt

- Failed uploads may leave private, incomplete records requiring reconciliation. Optional attachments and homepage editing are pending.

## Last substantial verified changes

- Added the first PNG draft, preview, publish and download workflow.
