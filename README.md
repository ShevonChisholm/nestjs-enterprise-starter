# NestJS Enterprise Starter

A production-ready NestJS starter demonstrating configuration management, request validation, health checks, and a scalable backend foundation. Future phases will add PostgreSQL, Prisma, authentication, RBAC, Swagger, logging, testing, Docker, and CI/CD.

## Phase 1: Configuration Foundation

Phase 1 establishes the runtime and structural foundation needed for future enterprise features while keeping the application intentionally small.

### Implemented Features

- Global, reusable configuration powered by `@nestjs/config`
- Joi-based environment validation with startup fail-fast behavior
- Typed, namespaced application configuration
- Global request validation with secure input handling defaults
- Modular health check endpoint
- Scalable feature-first project structure

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
| `DATABASE_URL` | Yes | None | Reserved for the future database phase |
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
  "environment": "development"
}
```

## Architecture Notes

### Configuration Foundation

Configuration is centralized under `src/config` and loaded globally so feature modules can consume one consistent runtime contract. Application-level values are namespaced and typed to make reuse explicit and reduce direct access to `process.env`.

### Environment Validation

Joi validates environment variables before the NestJS application finishes bootstrapping. The API fails fast when required values are missing or invalid, preventing incomplete or unsafe deployments from accepting traffic.

### Request Validation

A global `ValidationPipe` strips unknown properties, rejects non-whitelisted input, and transforms request data into DTO-compatible types. This creates a consistent validation boundary for the feature modules added in later phases.

### Health Check Purpose

The lightweight `/health` endpoint provides an availability signal for developers, deployment platforms, load balancers, and monitoring systems without depending on database or authentication infrastructure.

### Future Phases

This phase provides the configuration, validation, and module boundaries that future PostgreSQL, Prisma, authentication, and RBAC features will build upon. Those concerns are intentionally excluded from Phase 1.
