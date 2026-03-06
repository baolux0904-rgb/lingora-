# Lingora

> An English-learning app for kids focused on communication, vocabulary, quiz, and speaking.

---

## Monorepo Structure

```
lingora/
├── frontend/        # Next.js application (React, TypeScript)
├── backend/         # Node.js + Express REST API
├── docs/            # Architecture docs, blueprints, specs
├── package.json     # Root workspace manager
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Install all dependencies
```bash
npm install
```

### Run both apps in development
```bash
npm run dev
```

### Run individually
```bash
npm run dev:frontend   # http://localhost:3000
npm run dev:backend    # http://localhost:4000
```

---

## Workspaces

| Workspace    | Path         | Purpose                            |
|--------------|--------------|------------------------------------|
| `frontend`   | `./frontend` | Next.js UI — pages, components     |
| `backend`    | `./backend`  | Express API — routes, services     |

---

## Documentation

| File                          | Description                          |
|-------------------------------|--------------------------------------|
| `docs/project-blueprint.md`   | High-level architecture overview     |
| `docs/roadmap.md`             | Phased feature roadmap               |
| `docs/api-spec.md`            | REST API endpoint specification      |
| `docs/db-schema.md`           | Database schema planning             |

---

## Architecture Principles

- **Separation of concerns** — frontend and backend are fully independent packages
- **Layered backend** — routes → controllers → services → repositories
- **Feature-first frontend** — components organized by domain, not by type
- **No premature optimization** — structure grows with the product
- **TypeScript throughout** — types enforced on both sides

---

## Current Status

🟡 Scaffold only — no features implemented yet. See `docs/roadmap.md` for planned phases.
