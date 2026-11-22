# Architecture decision log

Only log consequential choices that have been adopted. Do not present proposals as decisions.

Template for new entries:

## ADR-0001 — <short title>

- Date: YYYY-MM-DD
- Status: accepted | superseded | deprecated
- Context: problem and constraints
- Decision: chosen option
- Alternatives: options considered
- Consequences: tradeoffs, follow-up requirements

## ADR-0001 — Use Go for the backend

- Date: 2026-11-22
- Status: accepted
- Context: Air Temple needs a backend serving a single-author gallery and admin panel.
- Decision: Implement the backend in Go, as specified by the project owner.
- Alternatives: No other backend language was requested or evaluated.
- Consequences: Apply the Go profiles to backend work. Framework and persistence choices remain open.

## ADR-0002 — Allow anonymous gallery downloads

- Date: 2026-11-22
- Status: accepted
- Decision: Anyone can download all available files attached to a published artwork without an account.
- Rationale: The author wants visitors to have direct access to the original art and its creation materials.
- Consequences: Public reads and downloads work without a session. Uploads and content changes require author access.

## ADR-0003 — Publish artwork explicitly from a draft

- Date: 2026-11-22
- Status: accepted
- Decision: New artwork starts as a private draft. The author previews the work and publishes it through the admin panel.
- Rationale: The author can assemble the artwork and its optional creation materials before visitors see it.
- Consequences: Both gallery reads and file downloads respect publication status. Publication requires the original PNG. Optional attachments can be absent.

## ADR-0004 — Use Google sign-in for the author

- Date: 2026-11-22
- Status: accepted
- Decision: The author signs in with Google to access the admin panel.
- Consequences: The backend must verify the Google identity and grant author privileges only to the designated account. Visitors can continue to browse and download published work anonymously.

## ADR-0005 — Start with PostgreSQL and Cloudflare R2

- Date: 2026-11-22
- Status: superseded by ADR-0006
- Decision: Store artwork metadata in PostgreSQL and original media in a private R2 bucket. Authorize draft previews in Go. Allow temporary direct downloads for published files.
- Rationale: Large public downloads can bypass the application server. Stable artwork IDs keep visitor-facing routes independent of the storage provider.

## ADR-0006 — Store originals on a private self-hosted volume

- Date: 2026-11-22
- Status: accepted
- Decision: Keep metadata in PostgreSQL and store originals under MEDIA_DIR. Go checks access before serving previews and downloads.
- Consequences: The operator supplies download bandwidth, disk capacity and independent backups.
