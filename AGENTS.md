# Project Agent Guidance

## Repository purpose

This is the React + Vite frontend for GaryMTG, a Spanish-language Magic: The
Gathering collection and trading assistant. It communicates with the sibling
`../garymtgbackend` Express API. Authenticated users should be able to search
cards, build decks, organize owned cards in binders, maintain wishlists, and
compare another user's binder with a personal wishlist.

The app currently includes authentication, protected routes, deck screens,
shared card components, and a placeholder binder screen. The active delivery
plan is `roadmap/frontend-implementation-roadmap.md`.

## Technology and service boundary

- React 19, Vite 8, React Router, Tailwind CSS 4, and Oxlint.
- `src/api.js` is the frontend HTTP boundary.
- `src/AuthContext.jsx` owns authentication state and session restoration.
- `src/App.jsx` owns routing and protected-route behavior.
- The backend is authoritative for payloads, ownership, authentication, deck
  legality, and trade matching. Frontend checks improve feedback but never
  replace backend validation.

## Required agent workflow

Godmode is mandatory for every task in this repository.

1. Invoke `godmode:activation` before any task action or response.
2. Select and follow every other relevant Godmode skill.
3. Read `memory.md` before planning or editing. Update it after every meaningful
   task using its knowledge-capture format.
4. Read `roadmap/README.md` and the active roadmap phase before planned feature
   work.
5. Keep product copy in Spanish unless product direction explicitly changes.
   Keep code identifiers and developer documentation in English.
6. Reuse existing components and conventions before adding new patterns.
7. Treat loading, empty, error, success, disabled, keyboard, focus, and
   responsive behavior as part of each feature.
8. Run validation appropriate to the change and record only checks actually run.

## Source organization

- `src/pages/`: route-level screens.
- `src/components/`: reusable UI and interactions.
- `src/api.js`: authenticated API functions; pages must not call `fetch`
  directly.
- `src/index.css`: global styles and current tokens.
- `ui-development/oracle/`: mandatory UX process guidance.
- `roadmap/`: implementation order, scope, and acceptance criteria.
- `memory.md`: durable project knowledge, decisions, and lessons.

## Change discipline

- Preserve useful backend errors in clear, safe Spanish UI feedback.
- Protect account routes and handle missing or expired sessions consistently.
- Keep destructive actions explicit and provide failure recovery.
- Update the roadmap when scope, dependencies, order, or status changes.
- Store durable insights in `memory.md`, not a raw activity log.

<!-- UX-ORACLE:START -->
## UX Oracle extension

For every task that changes a user interface, read and apply:

- `ui-development/oracle/UX_ORACLE.md`
- `ui-development/oracle/routing-map.md`
- `ui-development/oracle/agent-process.md`
- `ui-development/oracle/trust-and-trends-roadmap.md`
- `ui-development/oracle/project-usage-guide.md`
- `ui-development/project-profile.md`, when it exists

Use `ui-development/oracle/pr-oracle-template.md` for PRs, tickets, or other external reviews. These documents supplement this repository's existing instructions. Accessibility requirements, established project constraints, and explicit user requirements take precedence.
<!-- UX-ORACLE:END -->
