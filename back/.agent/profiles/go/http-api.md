# Profile: Go HTTP API

Applies only to a Go HTTP server when selected.

- Define resource naming, endpoints, request/response schemas, error format, auth and pagination contract before expanding API surface.
- Respect HTTP methods and status codes. Validate input at trust boundaries, including payload limits and query constraints.
- Use explicit handler/controller functions; keep transport parsing/response formatting separate from domain rules when complexity justifies it.
- Use `net/http` by default unless a chosen framework or existing repository conventions justify otherwise.
- Propagate request contexts and configure server timeouts and body-size limits appropriate for the service.
- Do not leak internal errors; map domain failures to stable API errors.
- Authentication and authorization are separate concerns; check resource ownership and permissions server-side.
- Decide CORS, CSRF and cookie/session policy based on actual client deployment and auth mechanism; do not blindly allow all origins.
- Design idempotency for destructive/retryable operations where necessary. Add rate limiting and abuse controls based on threat model and exposure.
- Document public contract using repository-standard OpenAPI or concise route definitions when necessary. Do not introduce generators automatically.
- Check health/readiness and graceful shutdown if production deployment is in scope.
