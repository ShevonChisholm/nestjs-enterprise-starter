# NestJS Enterprise Starter

A production-ready NestJS starter demonstrating configuration management, request validation, PostgreSQL integration, health checks, and a scalable backend foundation. Future phases will add authentication, RBAC, Swagger, logging, testing, Docker, and CI/CD.

## Phase 1: Configuration Foundation

Phase 1 establishes the runtime and structural foundation needed for future enterprise features while keeping the application intentionally small.

### Implemented Features

- Global, reusable configuration powered by `@nestjs/config`
- Joi-based environment validation with startup fail-fast behavior
- Typed, namespaced application configuration
- Global request validation with secure input handling defaults
- Modular health check endpoint
- Scalable feature-first project structure

## Phase 2: PostgreSQL + Prisma Foundation

Phase 2 adds the persistence foundation used by future business modules:

- PostgreSQL datasource configuration
- Prisma schema and generated client
- Initial `User` model with a reusable audit-field pattern
- Centralized database lifecycle management through `DatabaseModule` and `PrismaService`
- Database-aware health checks with safe failure responses

### PostgreSQL Requirement

PostgreSQL must be running and the configured database must exist before applying migrations. The default local connection string is:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nestjs_enterprise_starter
```

Create the database and update the credentials in `.env` when your local PostgreSQL setup differs.

### Prisma Setup

Apply the initial schema during development:

```bash
npx prisma migrate dev --name init
```

Generate Prisma Client after schema changes:

```bash
npx prisma generate
```

Open Prisma Studio to inspect local data:

```bash
npx prisma studio
```

## Environment Setup

Copy the example environment file and replace placeholder secrets with secure values:

```bash
cp .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

The application requires the following runtime configuration:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | None | Current runtime environment |
| `PORT` | No | `3000` | HTTP server port |
| `DATABASE_URL` | Yes | None | PostgreSQL connection string used by Prisma |
| `JWT_SECRET` | Yes | None | Reserved for the future authentication phase |
| `JWT_EXPIRES_IN` | No | `15m` | Future access-token lifetime |
| `JWT_REFRESH_SECRET` | Yes | None | Reserved for future refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Future refresh-token lifetime |

## Run The Project

```bash
npm install
npm run start:dev
```

The API is available at `http://localhost:3000` by default.

## Health Check

Use the health endpoint to confirm that the API process is available and running in the expected environment:

```http
GET /health
```

Example response:

```json
{
  "status": "ok",
  "environment": "development",
  "database": "connected"
}
```

When PostgreSQL is unavailable, the endpoint returns HTTP `503 Service Unavailable` with `database` set to `disconnected`.

## Architecture Notes

### Configuration Foundation

Configuration is centralized under `src/config` and loaded globally so feature modules can consume one consistent runtime contract. Application-level values are namespaced and typed to make reuse explicit and reduce direct access to `process.env`.

### Environment Validation

Joi validates environment variables before the NestJS application finishes bootstrapping. The API fails fast when required values are missing or invalid, preventing incomplete or unsafe deployments from accepting traffic.

### Request Validation

A global `ValidationPipe` strips unknown properties, rejects non-whitelisted input, and transforms request data into DTO-compatible types. This creates a consistent validation boundary for the feature modules added in later phases.

### Health Check Purpose

The `/health` endpoint provides an availability signal for developers, deployment platforms, load balancers, and monitoring systems. It runs a minimal database query so consumers can distinguish a healthy API from one whose essential PostgreSQL dependency is unavailable.

### Database Foundation

Prisma is wrapped in a reusable NestJS `DatabaseModule` and `PrismaService` instead of being instantiated inside feature modules. This centralizes connection lifecycle management, gives modules one consistent database client, and provides a safe connectivity helper for operational health checks.

### Future Phases

The configuration, validation, and database boundaries established in Phases 1 and 2 prepare the project for authentication, RBAC, and future business modules without coupling those concerns to infrastructure setup.
