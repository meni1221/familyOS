# FamilyOS — Architecture Decision Records

## ADR-001: Modular Monolith
**Status**: Accepted
**Decision**: Use a modular monolith architecture instead of microservices.
**Rationale**: The application is small enough that a monolith is more maintainable, debuggable, and deployable. Domain boundaries are clear, and the codebase remains understandable by one developer.
**Consequences**: Simpler deployment, easier debugging, but requires discipline to maintain boundaries.

## ADR-002: NestJS for Backend
**Status**: Accepted
**Decision**: Use NestJS as the backend framework.
**Rationale**: Provides dependency injection, modular architecture, excellent TypeScript support, and built-in validation. Well-suited for a modular monolith.
**Consequences**: More structure than Express, but better long-term maintainability.

## ADR-003: Prisma ORM
**Status**: Accepted
**Decision**: Use Prisma for database access.
**Rationale**: Type-safe queries, excellent migration system, prevents SQL injection through parameterized queries, great TypeScript integration.
**Consequences**: Generated types, migration workflow, but adds build step.

## ADR-004: TanStack Query for Data Fetching
**Status**: Accepted
**Decision**: Use TanStack Query (React Query) for server state management.
**Rationale**: Automatic caching, background updates, optimistic updates, deduplication. Eliminates need for Redux/Zustand for server state.
**Consequences**: Learning curve, but significantly reduces boilerplate.

## ADR-005: HTTP-Only Cookies for Sessions
**Status**: Accepted
**Decision**: Use HTTP-only cookies with secure session tokens instead of localStorage.
**Rationale**: XSS protection (tokens not accessible via JavaScript), automatic CSRF protection with SameSite=Strict.
**Consequences**: Requires CSRF tokens for state-changing requests, but more secure.

## ADR-006: Tailwind CSS
**Status**: Accepted
**Decision**: Use Tailwind CSS for styling.
**Rationale**: Utility-first approach, excellent for consistent design tokens, easy RTL support, great developer experience.
**Consequences**: HTML can be verbose, but configuration is centralized.

## ADR-007: Zod for Validation
**Status**: Accepted
**Decision**: Use Zod for input validation at API boundaries and form validation.
**Rationale**: Type inference, composable schemas, consistent error messages, works well with TypeScript.
**Consequences**: Additional dependency, but excellent developer experience.

## ADR-008: Hebrew-First RTL
**Status**: Accepted
**Decision**: Hebrew is the default language with full RTL support. English is secondary with LTR.
**Rationale**: Primary market is Israel. RTL is not an afterthought but built into the foundation.
**Consequences**: All layouts must be direction-aware from the start.

## ADR-009: S3-Compatible Storage Abstraction
**Status**: Accepted
**Decision**: Abstract file storage behind an interface, with S3-compatible storage as the default.
**Rationale**: Allows local development with MinIO, easy migration to AWS S3 or other providers.
**Consequences**: Additional abstraction layer, but provides flexibility.

## ADR-010: No Redis in MVP
**Status**: Accepted
**Decision**: Do not add Redis or external caching in the MVP.
**Rationale**: Premature optimization. PostgreSQL can handle the expected load. Add caching only when metrics justify it.
**Consequences**: Simpler infrastructure, but may need to add caching later if performance requires it.
