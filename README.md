# Shlanu

> כל מה שהמשפחה צריכה, במקום אחד

Shlanu is a family life management SaaS application that helps families coordinate daily tasks, schedules, baby routines, household spending, and reminders through a shared, secure workspace.

## Features

- **Task Management** — Create, assign, and track family tasks
- **Family Calendar** — Coordinate events and schedules
- **Baby Tracker** — Log feeding, sleep, and diaper changes
- **Family Budget** — Track expenses and budgets
- **Notifications** — Stay informed with in-app notifications
- **Multi-language** — Hebrew (RTL) and English (LTR)
- **Responsive** — Mobile-first design
- **Accessible** — Keyboard navigation, skip links, and an on-page accessibility panel
- **Motion with restraint** — GSAP entrances that respect the reduced-motion setting

## Technology Stack

### Frontend
- React 18+ with TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- React Router
- React Hook Form + Zod
- GSAP for motion

### Backend
- NestJS
- TypeScript
- Mongoose (MongoDB ODM)

### Infrastructure
- Docker Compose
- MongoDB

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd shlanu
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp apps/api/.env.example apps/api/.env
```

4. Start local infrastructure (MongoDB):
```bash
docker-compose up -d
```

5. Seed demo data (optional):
```bash
npm run db:seed
```

6. Start development servers:
```bash
npm run dev
```

7. Open http://localhost:5173

### Demo Accounts
- **Email**: demo@shlanu.app / **Password**: demo1234
- **Email**: sarah@shlanu.app / **Password**: demo1234

## Project Structure

```
shlanu/
├── apps/
│   ├── web/              # React frontend
│   └── api/              # NestJS backend
├── packages/
│   └── shared-types/     # Shared TypeScript types
├── eslint.config.mjs    # Lint rules for the whole workspace
├── docs/                 # Documentation
├── docker-compose.yml    # Local infrastructure
└── README.md
```

## Documentation

- [Product Specification](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Design System](docs/DESIGN_SYSTEM.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
- [Security](docs/SECURITY.md)
- [Test Plan](docs/TEST_PLAN.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run build` | Build all packages |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:e2e` | Run the API end-to-end suite |
| `npm run db:seed` | Seed demo data |

## License

Private — All rights reserved
