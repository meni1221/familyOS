# Shlanu — Implementation Plan

## Phase 0 — Repository and Planning ✅
- [x] Inspect repository
- [x] Create specification documents
- [x] Establish ownership boundaries
- [x] Confirm dependency and runtime compatibility
- [x] Create task dependency graph

## Phase 1 — Foundation and Design System
- [ ] Initialize monorepo with npm workspaces
- [ ] Configure TypeScript (strict), ESLint, Prettier
- [ ] Set up Vite + React frontend
- [ ] Set up NestJS backend
- [ ] Configure Tailwind CSS with design tokens
- [ ] Create shared types package
- [ ] Build core UI components
- [ ] Establish RTL/LTR behavior
- [ ] Create landing page
- [ ] Create app shell with navigation

## Phase 2 — Authentication and Family Workspace
- [ ] Database schema with Prisma
- [ ] Authentication (register, login, logout, sessions)
- [ ] Family creation
- [ ] Membership system
- [ ] Invitation flow
- [ ] Authorization infrastructure
- [ ] Onboarding flow

## Phase 3 — Tasks and Dashboard
- [ ] Task CRUD operations
- [ ] Assignment and status changes
- [ ] Dashboard with real data
- [ ] Quick actions
- [ ] Empty states and filtering

## Phase 4 — Calendar and Notifications
- [ ] Calendar views (month, week, agenda)
- [ ] Event CRUD
- [ ] In-app notifications
- [ ] Read/unread behavior
- [ ] Reminder foundation

## Phase 5 — Baby Tracker
- [ ] Baby profile
- [ ] Feeding, sleep, diaper, note logs
- [ ] Timeline and summaries
- [ ] Module enable/disable

## Phase 6 — Budget and Documents
- [ ] Budget and expense workflows
- [ ] Category summaries
- [ ] Document upload/download
- [ ] Storage abstraction
- [ ] Expiration reminders

## Phase 7 — Hardening and Polish
- [ ] Full test suite
- [ ] Security review
- [ ] Responsive review
- [ ] Accessibility review
- [ ] Performance optimization

## Phase 8 — Portfolio and Release
- [ ] Production build
- [ ] Deployment configuration
- [ ] Documentation
- [ ] Demo data
- [ ] README

## Team Structure

### Team A — Product, UX, Design System
- Product spec, design system, component guidelines

### Team B — Frontend Engineering
- React app, routing, components, forms, RTL, i18n

### Team C — Backend and Data
- NestJS API, PostgreSQL, auth, authorization, business rules

### Team D — QA, Security, Reliability
- Tests, security tests, verification

### Team E — Platform, Delivery, Documentation
- CI/CD, deployment, docs, demo environment

## First Vertical Slice
The smallest complete vertical slice:
1. User registers → creates family → sees dashboard
2. User can create and complete a task
3. User can add a calendar event
4. User can view notifications

This slice demonstrates: auth, family workspace, data persistence, real UI, and authorization.
