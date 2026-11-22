# Profile: Media gallery / user-generated images

This is a **domain-specific checklist**, not an imposed storage vendor or architecture. Load only when image storage, upload or processing is part of the project.

## Required design decisions (ask, don't guess)

- Gallery type: private owner-only / invited collaborators / multi-user social platform / marketplace.
- Ownership, roles, visibility, original-file policy, allowed MIME types/formats/sizes, quotas, upload limits, copyright and deletion expectations.
- Storage target (local vs object storage), CDN strategy, public/private URLs, serving semantics and retention/recovery.
- Processing: thumbnails, formats, EXIF policy, orientations, async jobs, retries and deduplication needs.
- Browse/search semantics: tagging, filtering, ranking, pagination, collections, moderation and discovery.

## Implementation invariants

- Do not trust extensions or client-declared MIME alone; inspect content and enforce byte limits at the boundary.
- Never construct unsanitized filesystem paths from user-provided names; keep stable opaque asset IDs and enforce authorization for private files.
- Image decoding and transformation are resource-intensive: bound dimensions, CPU, memory, concurrency and work queues as appropriate.
- Keep metadata DB and object-storage consistency explicit: upload states, retry/cleanup process and orphan handling.
- Generate derivatives deterministically when useful; do not block normal API requests on expensive conversions if latency requires background processing.
- Never assume uploading implies the right to publish or that publicly accessible media bypasses deletion/privacy policy.
- Plan abuse controls and moderation only for the actual audience/exposure; private personal galleries may not need social-network infrastructure.
- Preserve originals only if selected. Strip sensitive EXIF/location metadata from public derivatives if appropriate to the privacy requirements.
- Use cursor pagination for evolving large feeds when stable ordering is needed; simple lists may use simpler paging.

## Domain boundaries (illustrative, not required)

```text
internal/
  gallery/        # albums, collections, visibility
  media/          # upload lifecycle, derivatives, metadata
  identity/       # accounts, sessions, roles if needed
  discovery/      # search/feed if needed
  platform/
    storage/      # selected implementation
    database/     # selected implementation
```

No packages or services should be created without implemented functionality.
