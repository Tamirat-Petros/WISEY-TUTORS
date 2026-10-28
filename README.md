# Wisey Tutors

Wisey Tutors is being developed as a tutoring services platform. This repository contains the **backend foundation only**; the frontend will be handled in a later phase.

## Backend

`backend/` is a TypeScript REST API built with Node.js 24 LTS, Express 5, PostgreSQL 17, Prisma ORM 7, Zod, and Pino. It includes tutor and subject catalog models, public enquiry and session-request endpoints, admin authentication and inbox routes, health probes, OpenAPI documentation, and a container build.

## Run locally

1. Install Node.js 24 LTS and Docker Desktop.
2. Copy `backend/.env.example` to `backend/.env`. Set a private `AUTH_ACCESS_SECRET` (at least 32 characters), `BOOTSTRAP_ADMIN_EMAIL`, and a `BOOTSTRAP_ADMIN_PASSWORD` of at least 14 characters.
3. From the repository root, start PostgreSQL: `docker compose up -d db`.
4. From `backend/`, run `npm install`, `npm run db:deploy`, and `npm run db:seed`.
5. From `backend/`, run `npm run dev`. The API defaults to `http://localhost:4000`; docs are at `/api/docs`.

No default administrator account or password is shipped. See [backend setup and API notes](backend/README.md).

All changes are local for review. Nothing has been pushed.
