# FamilyOS — Team Ownership

## Team Structure

### Technical Lead
- Integration between teams
- Shared contracts and types
- Architecture decisions
- Code review and conflict resolution
- End-to-end acceptance
- Final release readiness

### Team A — Product, UX and Design System
**Owner**: Product/Design Lead

Responsibilities:
- Product information architecture
- User journeys and screen specifications
- Design tokens and component guidelines
- Responsive behavior
- Hebrew RTL and English LTR
- Accessibility standards
- Visual consistency

Deliverables:
- docs/PRODUCT_SPEC.md
- docs/DESIGN_SYSTEM.md
- Screen and interaction specifications
- Component inventory
- Visual acceptance checklist

### Team B — Frontend Engineering
**Owner**: Frontend Lead

Responsibilities:
- React application architecture
- Routing and protected routes
- Reusable UI components
- Dashboard and feature modules
- Forms, validation, feedback states
- Responsive navigation
- Data fetching and cache invalidation
- Localization and RTL support

Deliverables:
- Working frontend
- Design-system components
- Typed API client
- Frontend tests
- Responsive and accessibility verification

### Team C — Backend and Data Engineering
**Owner**: Backend Lead

Responsibilities:
- NestJS modules and REST API
- PostgreSQL data model
- Authentication and session management
- Family membership and authorization
- Business rules and validation
- Audit logging
- File metadata and upload integration
- Notifications

Deliverables:
- Database migrations
- Seed data
- API contracts and OpenAPI documentation
- Integration tests
- Secure family-scoped access

### Team D — QA, Security and Reliability
**Owner**: QA Lead

Responsibilities:
- Test strategy
- Unit, integration, and end-to-end testing
- Permission-boundary testing
- Responsive and browser verification
- Dependency and configuration review
- Error handling and observability
- Release-readiness checklist

Deliverables:
- docs/TEST_PLAN.md
- Automated regression tests
- Security test cases
- Reproducible bug reports
- Release checklist

### Team E — Platform, Delivery and Documentation
**Owner**: Platform Lead

Responsibilities:
- Environment configuration
- Local development setup
- CI pipeline
- Database migration workflow
- Deployment configuration
- README and architecture documentation
- Demo environment

Deliverables:
- .env.example
- Docker Compose for local dependencies
- CI configuration
- README.md
- Deployment instructions
- Demo account seeding instructions

## Working Rules
- One owner per file or module
- API contracts agreed before parallel implementation
- No independent rewrites of shared configuration
- Separate branches/worktrees when supported
- Integrate small changes frequently
- Run formatting, linting, type checking, and tests before accepting changes
- Never merge unverified implementations
- Keep shared task status and document blockers
