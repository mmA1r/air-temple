# Project specification

Status: PARTIAL

## Core intent (required)

- Project name: Air Temple
- Purpose: A personal gallery where one author shares finished artwork, original files and the creation process.
- Primary users: Gallery visitors and the author.
- Anyone can browse the gallery and download all files attached to a published artwork without signing in. Each artwork has an original PNG and may include a PSD, process video and ordered JPG steps.
- The author uses an admin panel to upload a required PNG, attach any combination of optional assets, order creation steps and edit homepage text, links and images.
- Each artwork starts as an author-only draft. The author previews it and explicitly publishes it once the original PNG is available. Draft artwork and its attachments are accessible only to the author, including by direct link.
- Homepage scope: Basic content editing is sufficient for v1. Complex animation editing is deferred pending confirmation.
- Application type: Go backend for the gallery website and author admin panel.
- Active profiles:
  - `.agent/profiles/go/go-service.md`
  - `.agent/profiles/go/http-api.md`
  - `.agent/profiles/go/media-gallery.md`

## Technical decisions (may initially be UNSET)

- Language/runtime: Go
- Framework/router: Go net/http
- Database/migrations: PostgreSQL with numbered SQL migrations
- File or object storage: Private self-hosted media directory
- Authentication/authorization: Visitors browse and download anonymously. The author signs in with Google. Only the author's designated Google account can access the admin panel and author operations.
- Background jobs: UNSET
- Hosting/deployment: UNSET
- Testing/verification commands: go test ./..., go vet ./..., go build ./...
- Current media inventory: 140 PSD files and 241 PNG files. The two largest PSDs shown are 251,477 KB and 236,054 KB. Total library size, video sizes and download traffic are UNSET.
- Security/privacy requirements: UNSET
- SEO/social sharing: UNSET

## Additional context

- Explicit preferences:
- Forbidden changes/dependencies:
- Integrations:
- Reference materials:
- Environments and env variable NAMES only:
- Proposed architecture: One Go HTTP service owns artwork, media associations, editable homepage content and author operations. Keep homepage layout and motion in the frontend. Use smaller previews for browsing and retain the exact downloadable originals.
- Persistence: Use PostgreSQL for gallery metadata and a private self-hosted volume for media bytes.
- Open technology choices: Hosting and capacity planning are deferred.
- Last reviewed: 2026-11-22
