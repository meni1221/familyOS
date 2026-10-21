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

## ADR-009: No document storage
**Status**: Superseded — the document vault was removed
**Decision**: Shlanu does not store uploaded files, and has no documents module.
**Rationale**: A vault built on a container's local disk keeps its promise only until the next deploy, and an S3-compatible bucket is not available to this deployment. Keeping the module would mean shipping an upload button that quietly loses files.
**Consequences**: No `UPLOADS_DIR`, upload limits or orphaned files to reconcile. If object storage arrives later the feature returns as a new module with a real provider behind it, rather than as a half-wired one.

## ADR-010: No Redis in MVP
**Status**: Accepted
**Decision**: Do not add Redis or external caching in the MVP.
**Rationale**: Premature optimization. MongoDB can handle the expected load. Add caching only when metrics justify it.
**Consequences**: Simpler infrastructure, but may need to add caching later if performance requires it.
