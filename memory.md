# GaryMTG Frontend Memory

Read this file at the start of every task and improve it after meaningful work.
It stores durable context, not a transcript or changelog.

## Maintenance protocol

1. Record only verified project knowledge, explicit preferences, reusable
   patterns, failures with remedies, and durable decisions.
2. Include date, context, insight, confidence, and confirmation count.
3. Search before adding; update existing entries instead of duplicating them.
4. Replace or prune stale information when newer evidence contradicts it.
5. Never store secrets, access tokens, passwords, or personal data.
6. Never promote memory into a permanent `AGENTS.md` rule without user approval.

## Project map

### Frontend and backend are sibling repositories

- **Date:** 2026-08-13
- **Context:** Initial repository inspection and roadmap creation.
- **Insight:** `garymtgfrontend` is a React/Vite client and
  `../garymtgbackend` is its Express API. Backend routes are authoritative for
  payloads, ownership, authentication, card limits, and trade matching.
- **Confidence:** high
- **Confirmations:** 1

### Existing frontend foundation

- **Date:** 2026-08-13
- **Context:** Frontend inventory before implementation planning.
- **Insight:** Authentication, protected routing, deck screens, shared card
  components, and deck API helpers exist. Binders are a placeholder; wishlist
  and trade screens are absent.
- **Confidence:** high
- **Confirmations:** 1

### Collection APIs are asymmetric

- **Date:** 2026-08-13
- **Context:** Compared deck, binder, and wishlist backend routes.
- **Insight:** Decks have dedicated add, quantity-update, and removal endpoints.
  Binders and wishlists have card addition but currently require a full-resource
  `PATCH` to change quantities or remove cards. UI rollback or backend endpoint
  work must account for this.
- **Confidence:** high
- **Confirmations:** 1

### Trade matching is name-based

- **Date:** 2026-08-13
- **Context:** Reviewed the backend trade comparison contract.
- **Insight:** Trade comparison ignores edition and the second face of a
  double-faced card when matching normalized names. The UI must explain this.
- **Confidence:** high
- **Confirmations:** 1

## Effective patterns

### Unauthorized responses use a browser event boundary

- **Date:** 2026-08-13
- **Context:** Phase 1 API and session foundation.
- **Insight:** `src/api.js` removes an existing token and emits
  `garymtg:session-expired` after authenticated `401` responses. `AuthProvider`
  consumes that event, preventing API/auth circular imports and avoiding false
  expiry messages for unauthenticated login failures.
- **Confidence:** high
- **Confirmations:** 1

### API contract tests can remain dependency-free

- **Date:** 2026-08-13
- **Context:** Added test-first coverage before the full React test stack.
- **Insight:** Node's built-in test runner, native `Response`, and small browser
  stubs are sufficient for URL, header, payload, normalized-error, and session
  event contracts in `src/api.js`. Rendered interaction tests still need the
  Phase 6 tooling.
- **Confidence:** medium
- **Confirmations:** 1

### Preserve the existing visual direction while formalizing it

- **Date:** 2026-08-13
- **Context:** Phase 0 component and token audit.
- **Insight:** The charcoal, blue-gray, and gold theme is coherent with the
  product and should remain. Extend its project tokens and shared components
  incrementally instead of adopting a new component library or visual reset.
- **Confidence:** medium
- **Confirmations:** 1

### Keep a confirmed resource snapshot during mutations

- **Date:** 2026-08-13
- **Context:** Defined one interaction model for decks, binders, and wishlists.
- **Insight:** Route-level collection state should retain the last backend-
  confirmed resource, replace it from successful responses, and restore it after
  rejected optimistic changes. This hides transport differences without hiding
  domain rules.
- **Confidence:** medium
- **Confirmations:** 1

### Keep network access behind the API module

- **Date:** 2026-08-13
- **Context:** Existing frontend architecture review.
- **Insight:** `src/api.js` is the established HTTP boundary. New pages should
  use exported functions rather than direct `fetch` calls so auth and error
  behavior remain consistent.
- **Confidence:** medium
- **Confirmations:** 1

### Share card UI without sharing incompatible rules

- **Date:** 2026-08-13
- **Context:** Planned decks, binders, and wishlists together.
- **Insight:** Reuse card search and presentation, but keep deck legality and
  collection persistence rules in their feature layers.
- **Confidence:** medium
- **Confirmations:** 1

## User preferences

### Godmode is mandatory

- **Date:** 2026-08-13
- **Context:** Explicit user instruction for all repository work.
- **Insight:** Invoke `godmode:activation` and all relevant Godmode skills on
  every task in this repository.
- **Confidence:** high
- **Confirmations:** 1

### Maintain agent memory continuously

- **Date:** 2026-08-13
- **Context:** Explicit request for memory that improves future agent work.
- **Insight:** Read this file before work and update it after every meaningful
  task with deduplicated, durable knowledge.
- **Confidence:** high
- **Confirmations:** 1

## Decisions and open questions

### Delay collection abstraction until wishlists

- **Date:** 2026-08-13
- **Context:** Phase 3 binder implementation after deck stabilization.
- **Insight:** Reuse `CardSearch`, `CardTile`, request feedback, and confirmed-response conventions now, but wait for the wishlist implementation before extracting a generic collection state layer. Two non-deck examples are needed to avoid encoding binder-only assumptions.
- **Confidence:** high
- **Confirmations:** 1

### Binder quantity changes use immutable full patches

- **Date:** 2026-08-13
- **Context:** The backend exposes binder add-card but not quantity or removal endpoints.
- **Insight:** Build a new `cards` array from the confirmed binder, send it through `PATCH /binders/:id`, and replace state only with the response. Never mutate the confirmed array in place.
- **Confidence:** high
- **Confirmations:** 1

### Deck mutations use confirmed server snapshots

- **Date:** 2026-08-13
- **Context:** Phase 2 deck stabilization.
- **Insight:** Render the deck returned by each granular mutation instead of editing card arrays optimistically. Failed requests then cannot appear saved, and backend legality remains authoritative.
- **Confidence:** high
- **Confirmations:** 1

### Board moves require one atomic full-resource patch

- **Date:** 2026-08-13
- **Context:** The backend has granular add, quantity, and removal endpoints but no move endpoint.
- **Insight:** Remove-then-add can lose data, while add-then-remove can violate copy limits. Use one `PATCH /decks/:id` containing both boards until an atomic move route exists.
- **Confidence:** high
- **Confirmations:** 1

### Roadmap sequence

- **Date:** 2026-08-13
- **Context:** First detailed frontend implementation plan.
- **Insight:** Build shared foundations, stabilize decks, implement binders,
  implement wishlists, then implement trade comparison. Trade depends on
  reliable binder and wishlist flows.
- **Confidence:** medium
- **Confirmations:** 1

### Questions requiring confirmation

- **Date:** 2026-08-13
- **Context:** Roadmap dependency review.
- **Insight:** Confirm supported browsers/viewports, deployment, token storage,
  exact deck formats, printing-specific trade intent, and whether binder and
  wishlist mutation endpoints will be expanded before these become permanent
  constraints.
- **Confidence:** medium
- **Confirmations:** 1

## Failure analysis

### Development watchers can restart child API processes

- **Date:** 2026-08-13
- **Context:** Phase 2 failed-mutation browser validation.
- **Insight:** Killing only the process listening on the backend port is insufficient when `node --watch` owns it; the watcher can restart the child and invalidate a network-failure simulation. Stop the watcher session and confirm the port is free before testing disconnected behavior.
- **Confidence:** high
- **Confirmations:** 1

### Source text contains encoding corruption

- **Date:** 2026-08-13
- **Context:** Phase 0 source audit of existing Spanish UI components.
- **Insight:** Several existing strings and symbols are stored or rendered as
  mojibake. Any file touched in upcoming UI phases must preserve UTF-8, and the
  release requires a targeted Spanish-copy encoding pass.
- **Confidence:** high
- **Confirmations:** 1

### Transitive dependency advisory during Phase 1

- **Date:** 2026-08-13
- **Context:** Phase 1 frontend completion gate.
- **Insight:** The installed dependency graph initially included a vulnerable
  `nanoid` release. `npm audit fix` resolved it without a breaking upgrade. Keep
  `npm audit --audit-level=high` in the PR completion gate so lockfile drift is
  caught before shipping.
- **Confidence:** high
- **Confirmations:** 1
# Phase 4 wishlist management

- Wishlist persistence mirrors binders: dedicated card additions and complete card-array patches for quantity changes or removal.
- Client state adopts only confirmed wishlist responses; failed mutations retain the last server-confirmed view.
- Shared UI primitives are proven useful, but binder and wishlist page state remains separate until trade comparison establishes a durable abstraction.
- Wishlist descriptions follow the backend 280-character cap and quantities are clamped to at least one.
