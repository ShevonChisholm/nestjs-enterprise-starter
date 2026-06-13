# NestJS Enterprise Starter

A production-ready NestJS starter demonstrating configuration management, request validation, PostgreSQL integration, JWT authentication, permission-based RBAC, health checks, and a scalable backend foundation. Future phases will add Swagger, logging, testing, Docker, and CI/CD.

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

## Phase 3A: Authentication Foundation

Phase 3A adds a production-style JWT authentication boundary with:

- User registration and login
- Short-lived access tokens
- Rotating refresh tokens
- Logout and current-user endpoints
- Argon2id password and refresh-token hashing
- Passport JWT strategies and route guards
- Validated request DTOs and safe user response DTOs

### Authentication Endpoints

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Create an account and issue tokens |
| `POST` | `/auth/login` | Public | Verify credentials and issue tokens |
| `POST` | `/auth/refresh` | Refresh bearer token | Rotate the refresh token and issue a new token pair |
| `POST` | `/auth/logout` | Access bearer token | Revoke the stored refresh credential |
| `GET` | `/auth/me` | Access bearer token | Return the current safe user profile |

Apply the authentication schema migration and regenerate Prisma Client:

```bash
npx prisma migrate dev --name add_auth_fields_to_user
npx prisma generate
```

### Register

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "firstName": "Shevon",
  "lastName": "Chisholm"
}
```

Registration and login return a safe user profile and token pair:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Shevon",
    "lastName": "Chisholm",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "tokens": {
    "accessToken": "jwt",
    "refreshToken": "jwt"
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

### Protected Routes And Rotation

Send the access token as a bearer token when requesting the current user or logging out:

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <access-token>"
```

Send the refresh token as a bearer token to rotate it:

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer <refresh-token>"
```

Each successful refresh returns a new access token and refresh token. The previous refresh token no longer matches the stored hash and cannot be reused.

Refresh response:

```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt"
}
```

Current-user response:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Shevon",
  "lastName": "Chisholm",
  "createdAt": "date",
  "updatedAt": "date"
}
```

Logout response:

```json
{
  "message": "Logged out successfully"
}
```

## Phase 3B: RBAC Foundation

Phase 3B adds database-backed role-based access control with permissions as the primary enforcement mechanism.

Roles group permissions for administration, while routes declare the precise permissions they require. This keeps authorization policies explicit and avoids coupling business endpoints to broad role names.

### Roles And Permissions

Seeded roles:

- `SUPER_ADMIN`: all permissions
- `ADMIN`: `users:create`, `users:read`, `users:update`, `roles:read`, and `permissions:read`
- `USER`: no administrative permissions by default

Seeded permissions:

```txt
users:create
users:read
users:update
users:delete
roles:create
roles:read
roles:update
roles:delete
permissions:read
```

The Prisma schema uses `Role`, `Permission`, `UserRole`, and `RolePermission` models. The join models make user-role and role-permission assignment explicit and prevent duplicate relationships.

Apply the RBAC migration and seed its fixed authorization data:

```bash
npx prisma migrate dev --name add_rbac_models
npx prisma db seed
```

The seed is idempotent: it creates or restores the fixed roles and permissions, then reconciles their mappings. It intentionally does not create a privileged user.

### Protected Users Route

`GET /users` requires a valid access token and the current `users:read` permission:

```bash
curl http://localhost:3000/users \
  -H "Authorization: Bearer <access-token>"
```

The endpoint returns safe user DTOs only. Password and refresh-token hashes are never included.

### Assign A Role Locally

Open Prisma Studio:

```bash
npx prisma studio
```

To grant a local user access:

1. Find the target user and the desired seeded role.
2. Create a `UserRole` record using their `userId` and `roleId`.
3. Call the protected route again with the same valid access token.

Because permissions are resolved from PostgreSQL for each authorized request, the role change takes effect immediately without logging in again or refreshing the JWT.

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
| `JWT_SECRET` | Yes | None | Access-token signing secret |
| `JWT_EXPIRES_IN` | No | `15m` | Access-token lifetime |
| `JWT_REFRESH_SECRET` | Yes | None | Refresh-token signing secret |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh-token lifetime |

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

### Authentication Boundaries

`UsersService` owns user persistence and explicitly maps Prisma records to safe response DTOs, preventing password and refresh-token hashes from reaching API responses. `AuthService` owns credential verification, token generation, rotation, and logout.

Passport strategies validate JWT signatures and reject deleted users before requests reach protected controllers. Guards apply the appropriate access-token or refresh-token strategy to each route, while DTOs and the global validation pipe enforce public request contracts.

Argon2id is used for password hashing because it is a memory-hard algorithm designed to resist credential-cracking attacks. Refresh tokens are also stored only as Argon2id hashes, so leaked database records cannot be used directly as active credentials.

### RBAC Boundaries

`@Permissions()` and `@Roles()` attach authorization requirements as NestJS metadata. `PermissionsGuard` requires every declared permission, while `RolesGuard` allows access when the user has at least one declared role. Routes without the corresponding metadata are unaffected by each guard.

`RbacService` centralizes role and permission queries and ignores soft-deleted roles and permissions. Permission-protected routes resolve current access from the database instead of embedding authorization state in JWT payloads, so revocations and grants apply without waiting for token expiry.

The JWT principal contains only the authenticated user ID and email. Authentication proves identity; the RBAC layer independently resolves what that identity may do.

### Future Phases

The configuration, validation, database, authentication, and authorization boundaries established in Phases 1 through 3B prepare the project for future business modules without coupling those concerns to infrastructure setup.
