# Shlanu — Architecture

## Overview
Shlanu is a modular monolith SaaS application built with a React frontend and NestJS backend, using PostgreSQL as the primary data store.

## Technology Stack

### Frontend
- React 18+ with TypeScript (strict mode)
- Vite (build tool)
- React Router (routing)
- Tailwind CSS (styling)
- TanStack Query (data fetching)
- React Hook Form + Zod (forms & validation)
- Recharts (charts)
- date-fns (date handling)
- Lucide (icons)

### Backend
- Node.js 20+ with NestJS
- TypeScript (strict mode)
- Prisma ORM
- Swagger/OpenAPI (documentation)
- class-validator (validation)

### Database
- PostgreSQL 15+
- Prisma migrations

### Testing
- Vitest + React Testing Library (frontend)
- Supertest (backend integration)
- Playwright (e2e)

## Repository Structure

```
shlanu/
├── apps/
│   ├── web/              # React frontend (Vite)
│   └── api/              # NestJS backend
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   └── shared-config/    # Shared ESLint/TS config
├── docs/                 # Documentation
├── scripts/              # Utility scripts
├── docker-compose.yml    # Local development
├── package.json          # Root workspace config
└── README.md
```

## Architecture Decisions

### Modular Monolith
The application uses a modular monolith pattern:
- Clear domain boundaries within a single deployable
- Shared database with row-level security patterns
- No premature microservice extraction
- Understandable by one developer

### Data Ownership
- Every family-owned record has `familyId`
- All queries filter by verified family membership
- Cross-family access is impossible by design
- Authorization checked on every protected operation

### Authentication
- HTTP-only cookies for session tokens
- Secure password hashing (bcrypt)
- Rate limiting on auth endpoints
- CSRF protection for state-changing requests

### File Storage
- S3-compatible object storage behind abstraction
- Short-lived signed URLs for download
- Authorization before any storage operation
- Metadata in database, content in object storage

### Internationalization
- Hebrew (RTL) as default
- English (LTR) as secondary
- Direction controlled by language setting
- Locale-aware formatting throughout

## API Design
- RESTful endpoints under `/api/v1`
- Consistent error response format
- Pagination for collections
- OpenAPI/Swagger documentation
- Versioned API

## Security Architecture
- Family-scoped authorization on every operation
- Input validation on all boundaries
- SQL injection prevention through Prisma ORM
- XSS prevention through React escaping
- CSRF protection on state-changing requests
- Security headers (CSP, HSTS, X-Frame-Options)
- No secrets in source control
- Audit logging for important operations

## Deployment Architecture
- Docker Compose for local development
- Separate dev/prod configurations
- Managed PostgreSQL in production
- Health check endpoints
- Structured logging
- Environment-based secrets management
