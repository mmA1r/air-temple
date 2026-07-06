# Air Temple Gallery

Personal artwork gallery with a Next.js frontend, Go backend, PostgreSQL metadata storage, and S3-compatible media storage.

## Structure

```text
frontend/          Next.js + React + TypeScript + SCSS
backend/           Go REST API
docker-compose.yml Local PostgreSQL, MinIO, backend, frontend
```

## Local Development

1. Copy environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Start the frontend with mock data:

```bash
docker compose up --build
```

3. Open:

- Frontend: http://localhost:3000

The frontend uses mock artworks by default, so Go, PostgreSQL, and MinIO are not required for UI review.

To start the backend stack too:

```bash
docker compose --profile backend up --build
```

Backend URLs:

- Backend API: http://localhost:8080/api/health
- MinIO Console: http://localhost:9001

Default local admin credentials are defined in `backend/.env.example`.

## Manual Development

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Mock mode is enabled by default through `NEXT_PUBLIC_API_MODE=mock`. Set `NEXT_PUBLIC_API_MODE=api` to use the Go backend.

Backend:

```bash
cd backend
go mod download
go run ./cmd/api
```

## Media Policy

- PostgreSQL stores metadata only.
- S3-compatible storage stores media files.
- Public previews can be served directly.
- Originals, PSD files, sequence archives, and future videos are delivered through signed download URLs.
