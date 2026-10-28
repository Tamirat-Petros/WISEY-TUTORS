# Wisey Tutors API

## Stack and layout

- **Node.js 24 LTS + TypeScript** with strict compiler settings
- **Express 5** for the versioned REST API
- **PostgreSQL 17 + Prisma ORM 7** with the official PostgreSQL driver adapter
- **Zod** for runtime validation of environment settings, query parameters, and request bodies
- **Pino**, Helmet, CORS allowlisting, per-process rate limits, graceful shutdown, and health probes
- **OpenAPI 3.1** served through Swagger UI at `/api/docs`

The code is organized by domain under `src/modules/`. Public catalog reads and enquiry flows are separate from authenticated staff workflows. The frontend is intentionally out of scope for this phase.

## Local setup

1. Install Node.js 24 LTS and Docker Desktop.
2. Copy `.env.example` to `.env`. Generate a private `AUTH_ACCESS_SECRET` with at least 32 characters. Set a bootstrap admin email and a password of at least 14 characters.
3. Start PostgreSQL from the repository root: `docker compose up -d db`.
4. In this folder, run `npm install`.
5. Apply the initial schema: `npm run db:deploy` (the checked-in migration is ready to apply).
6. Seed standard subjects and create the owner account: `npm run db:seed`.
7. Start the API: `npm run dev`.

The API listens on port 4000 by default. Readiness and liveness endpoints are `/health/ready` and `/health/live`.

## API outline

- `GET /api/v1/catalog/subjects`
- `GET /api/v1/catalog/tutors?subject=mathematics&page=1&pageSize=12`
- `POST /api/v1/inquiries`
- `POST /api/v1/booking-requests`
- `POST /api/v1/auth/login`, `/refresh`, `/logout`
- `GET /api/v1/admin/inquiries` and `PATCH /api/v1/admin/inquiries/:id/status`
- `GET /api/v1/admin/booking-requests` and `PATCH /api/v1/admin/booking-requests/:id/status`

See `docs/openapi.yaml` or open `/api/docs` while the API is running for request shapes and responses. Public form payloads require `privacyConsent: true` and accept an optional empty `website` honeypot field.

## Security and operations

- Admin passwords are Argon2id hashes. Bootstrap credentials are read only from the environment and are never shipped as defaults.
- Access tokens are short-lived HS256 JWTs. High-entropy refresh tokens are stored only as SHA-256 hashes, set in an HttpOnly cookie, and rotated atomically. Reuse revokes the token family; sessions have a maximum lifetime.
- CORS is restricted to `FRONTEND_ORIGINS`; cookies are secure in production. Set `AUTH_COOKIE_SAME_SITE=none` for a cross-site frontend/API deployment over HTTPS, or keep `lax` for same-site/local setups.
- Sensitive request headers are redacted in logs. Request bodies are not logged.
- The included rate limiter uses in-memory counters. Use a shared store such as Redis before running multiple API instances.
- Public enquiries contain contact data and learner age band. Configure retention/deletion, privacy notice, access control, backups, and a real mail provider before collecting live data.
- This scaffold does not send email, provide parent/student accounts, confirm tutor availability, take payments, or perform calendar booking yet. Booking requests are requests for follow-up, not confirmed appointments.

## Useful scripts

- `npm run dev` — reload-on-change local server
- `npm run build` — generate Prisma Client and compile TypeScript
- `npm start` — run the compiled server
- `npm run typecheck` — typecheck sources and generated Prisma Client
- `npm run db:validate` — validate the Prisma schema
- `npm run db:deploy` — apply committed migrations
- `npm run db:migrate -- --name <name>` — create a development migration
- `npm run db:seed` — seed subjects and optional bootstrap owner

## Container and deployment

Build from this directory with `docker build -t wisey-tutors-api .`. The multi-stage image runs as the unprivileged Node user. Provide `DATABASE_URL`, `AUTH_ACCESS_SECRET`, `FRONTEND_ORIGINS`, and the production cookie/proxy settings at runtime. Run `npm run db:deploy` as a release step before switching traffic. Use managed PostgreSQL, a secret manager, HTTPS, and shared rate-limit storage for multi-instance deployments.

No hosting provider or real credentials have been selected yet. The Git remote has not been changed and no changes have been pushed.
