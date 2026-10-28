# Wisey Tutors

Wisey Tutors is a tutoring services platform with a TypeScript REST API and a Next.js web application. The web experience includes a public tutoring site, a session request form, and a private staff inbox for managing incoming requests.

## Technology

- **Web:** Next.js App Router, React, TypeScript, Tailwind CSS 4, Motion, and Lucide icons
- **API:** Node.js 24, Express 5, PostgreSQL, Prisma ORM, Zod, and Pino
- **Design:** responsive dark navy and black surfaces with blue and orange accents

## Run locally

Install Node.js 24 LTS, npm 11, and Docker Desktop.

### 1. Configure and start the API

1. Copy backend/.env.example to backend/.env.
2. Set a private AUTH_ACCESS_SECRET (at least 32 characters), BOOTSTRAP_ADMIN_EMAIL, and a BOOTSTRAP_ADMIN_PASSWORD of at least 14 characters.
3. From the repository root, start PostgreSQL: docker compose up -d db.
4. From backend/, run npm install, npm run db:deploy, and npm run db:seed.
5. From backend/, run npm run dev.

The API defaults to http://localhost:4000; its health endpoint is /health/ready and its OpenAPI docs are at /api/docs. No default administrator credentials are included.

### 2. Run the web app

1. Copy frontend/.env.example to frontend/.env.local.
2. From frontend/, run npm install and npm run dev.
3. Open http://localhost:3000.

The public site is available at /. Staff can sign in at /admin/login; the protected inbox is at /admin.

## Production deployment

Build the frontend from frontend/ with npm run build, then serve it with npm start or deploy it to a Node-compatible Next.js host. Set NEXT_PUBLIC_API_BASE_URL to the deployed API base URL ending in /api/v1. Add the deployed frontend origin to the backend's comma-separated FRONTEND_ORIGINS setting so requests and secure refresh-cookie authentication are accepted.

Deploy the API and PostgreSQL using the instructions in backend/README.md. Keep secrets on the server and configure production cookie settings and HTTPS on the API host.

## Project structure

- frontend/ — Next.js public site and staff workspace
- backend/ — Express API, Prisma schema, migrations, and seed
- docker-compose.yml — local PostgreSQL service
