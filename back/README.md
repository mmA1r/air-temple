# Air Temple backend

The first gallery workflow accepts an original PNG, creates a private draft and lets the author publish it. The Go API uses PostgreSQL and a private media directory on your server.

## Run locally

1. Set `DATABASE_URL` to a PostgreSQL connection string and apply `migrations/001_artworks.sql` once to an empty database. In PowerShell run `psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -1 -f migrations/001_artworks.sql`.
2. Create a persistent directory outside all public web roots and set `MEDIA_DIR` to its absolute path. Grant the API service account read/write access. On Windows, restrict access using the folder ACL. Back up the database and media volume together and keep an independent copy of the originals.
3. Set `GOOGLE_CLIENT_ID` to the Google web client ID and `GOOGLE_AUTHOR_SUB` to the designated author's verified Google subject identifier.
4. Run `go run ./cmd/api`. The service listens on `127.0.0.1:8080` by default. Set `LISTEN_ADDR` to override. Use HTTPS for browser access in deployment.

## HTTP contract

Admin requests require `Authorization: Bearer <Google ID token>` issued for the configured client. A browser client can obtain this credential through Sign in with Google.

| Method and path | Request and response |
| --- | --- |
| POST /admin/artworks?title=… | URL-encoded title and raw PNG body. Returns 201 with a JSON `id`. |
| GET /admin/artworks/{id}/original | Streams the original PNG for author preview. Requires authorization on each request. |
| POST /admin/artworks/{id}/publish | Publishes a ready draft and returns 204. Safe to repeat. |
| GET /artworks?offset=0 | JSON array of up to 40 published works, newest first. |
| GET /artworks/{id}/original | Streams the original PNG as an attachment with HTTP range support. A draft or missing ID returns 404. |

The initial PNG limits are 64 MiB and 32 million pixels. The API preserves uploaded bytes. Interrupted uploads can leave private rows with `ready=false` and a complete or partial file under `artworks/{id}/original.png`. Inspect those rows when reconciling storage.

Run `go test ./...` and `go vet ./...` for local checks.

If upgrading an existing R2 installation, pause uploads, copy the bucket contents into `MEDIA_DIR` preserving object paths, and verify the files before switching the API. Existing artwork IDs and database rows carry over.
