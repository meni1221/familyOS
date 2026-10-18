# Shlanu — Architecture Decision Records

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

## ADR-003: Mongoose on MongoDB
**Status**: Accepted
**Decision**: Use MongoDB with Mongoose as the ODM.
**Rationale**: The domain is document-shaped — a family, its members, tasks, logs and expenses are naturally nested and read as a whole — so a document store fits better than a relational schema, and Mongoose gives typed schemas, validation and index management without a migration tool in the loop.
**Consequences**: No migration workflow to run at deploy time; schema changes are made in code and indexes are built on startup. Anything that needs a real transaction or a cross-document join has to be handled deliberately.

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

## ADR-009: File storage on the local disk
**Status**: Accepted (revisit before running more than one API instance)
**Decision**: Uploaded documents are written to the API server's filesystem under `UPLOADS_DIR`, behind a documents service that could later be swapped for object storage.
**Rationale**: One instance and one disk while the product is being built means no third-party credentials to manage and no SDK to keep current. MinIO sits in `docker-compose.yml` for whoever picks this up next.
**Consequences**: Uploads survive only with a persistent volume, and a second API instance would not see the first one's files. Moving to S3 is a matter of implementing the storage service, not of flipping a variable — the `STORAGE_*` placeholders in the env examples are not read by the code.

## ADR-010: No Redis in MVP
**Status**: Accepted
**Decision**: Do not add Redis or external caching in the MVP.
**Rationale**: Premature optimization. MongoDB can handle the expected load. Add caching only when metrics justify it.
**Consequences**: Simpler infrastructure, but may need to add caching later if performance requires it.
