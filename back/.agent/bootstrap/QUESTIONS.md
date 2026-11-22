# Adaptive question bank

Only ask questions that meaningfully affect choices. Group 3–5 at a time, using the user's answers to skip irrelevant categories.

## Minimum product definition

- What problem does the product solve, and who will use it?
- What is the smallest workflow that must work end-to-end in version 1?
- Which features are explicitly out of scope?
- Is this an empty project or an existing repository to preserve?

## Boundaries

- Browser app, API-only, CLI, worker or a combination? Who consumes the API?
- Public content, private content or both? Account creation and roles?
- Hosting and spending limits? Is there a mandatory provider?
- What data/files must persist, and what happens if a job fails?

## If an image gallery is in scope

- Who can upload: owner, registered users, invited artists or anyone?
- Public showcase, private albums, marketplace, or social network? Does it need search, likes, follows, collections?
- Approximate image count, size, formats and derivatives? Originals preserved? Videos allowed?
- Should files live on local disks or object storage? CDN, signed URLs, quotas?
- Is content moderation, copyright/takedown handling or private access required?

## Go-specific follow-up

- Standard library `net/http` or a preferred HTTP framework? Existing repository conventions win.
- Database selected? SQL migrations and query style? Transaction requirements?
- Background processing needed for image conversion, metadata extraction, cleanup or notifications?
- Deployment: one binary/container/managed service? Config, health/readiness, logging and shutdown expectations?

## Agent customization

- What conventions are non-negotiable? What must never be changed automatically?
- Is domain-first/package-by-feature organization suitable, or is a simpler layout preferred?
- Which checks must run before completion?
