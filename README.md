# GaryMTG Frontend

GaryMTG is a Spanish-language Magic: The Gathering collection and trading
assistant. This repository contains the React client; the sibling
`garymtgbackend` repository provides authentication, card search, decks,
binders, wishlists, and trade-comparison APIs.

## Current capabilities

- Register, sign in, restore a session, and access protected routes.
- Search normalized Magic card data and pricing through the backend.
- Create, edit, and delete decks with main/sideboard legality feedback.
- View the current binder placeholder while the collection workflows are built.

The implementation sequence and current status live in
[`roadmap/frontend-implementation-roadmap.md`](./roadmap/frontend-implementation-roadmap.md).

## Technology

- React 19
- Vite 8
- React Router
- Tailwind CSS 4
- Oxlint

## Prerequisites

- Node.js and npm
- The `garymtgbackend` repository available beside this repository

Expected workspace layout:

```text
GaryMtgMarket/
|-- garymtgfrontend/
`-- garymtgbackend/
```

## Local setup

Install the frontend dependencies:

```powershell
cd garymtgfrontend
npm install
```

In a second terminal, install and start the backend:

```powershell
cd garymtgbackend
npm install
npm run dev
```

The backend listens on `http://localhost:3001` and exposes the API under
`/api`.

Start the frontend:

```powershell
cd garymtgfrontend
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## API configuration

Copy `.env.example` to `.env.local` when the backend uses a different origin:

```powershell
Copy-Item .env.example .env.local
```

The default configuration is:

```dotenv
VITE_API_URL=http://localhost:3001/api
```

Trailing slashes are normalized by the API client. Restart the Vite development
server after changing environment values.

Do not place secrets in frontend environment variables. Values prefixed with
`VITE_` are bundled into client code and are visible to users.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production bundle |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Node-native API contract tests |

API boundary tests are configured with Node's built-in test runner. Automated
React component and interaction testing remains tracked in Phase 6.

## Repository map

| Path | Responsibility |
| --- | --- |
| `src/pages/` | Route-level screens |
| `src/components/` | Reusable presentation and interaction components |
| `src/api.js` | Authenticated backend requests |
| `src/AuthContext.jsx` | Authentication and session state |
| `src/App.jsx` | Routing and protected routes |
| `src/index.css` | Tailwind import, theme values, and global styles |
| `ui-development/` | UX profile, interaction guidance, and Oracle process |
| `roadmap/` | Delivery phases and acceptance criteria |
| `memory.md` | Durable project knowledge and decisions for agents |

## Development workflow

1. Read `AGENTS.md`, `memory.md`, and the active roadmap phase.
2. For UI work, follow `ui-development/oracle/routing-map.md` and the project
   profile.
3. Keep network calls in `src/api.js` and product copy in Spanish.
4. Implement relevant loading, empty, error, success, disabled, keyboard, focus,
   and responsive states.
5. Run the checks that apply and report only verification actually performed.
6. Update roadmap status and durable memory when the work changes either.

## Backend data note

The backend currently persists local development data in JSON files created at
runtime. Do not commit generated user, deck, binder, or wishlist data.

## Documentation

- [Frontend roadmap](./roadmap/frontend-implementation-roadmap.md)
- [UI project profile](./ui-development/project-profile.md)
- [Component and token audit](./ui-development/component-audit.md)
- [Collection interaction model](./ui-development/collection-interaction-model.md)
- [UX Oracle guide](./ui-development/oracle/README.md)
