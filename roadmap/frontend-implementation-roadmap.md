# GaryMTG Frontend Implementation Roadmap

**Status:** Active

**Last updated:** 2026-08-13

**Goal:** Complete the Spanish-language client for authentication, card search,
decks, binders, wishlists, and trade comparison using the existing backend.

## Current baseline

Available today:

- React 19, Vite 8, React Router, Tailwind CSS 4, and Oxlint.
- Registration, login, session restoration, and protected routes.
- Home, profile, deck list, deck detail, and API test pages.
- Shared button, shell, card search, card tile, navigation, and legality UI.
- Deck CRUD and card mutation functions in `src/api.js`.
- A placeholder binder page and the UX Oracle documentation.

Important gaps:

- The API origin is configurable through `VITE_API_URL` with a local fallback.
- Deck detail does not consistently use dedicated card mutation endpoints.
- Binder, wishlist, and trade workflows are missing.
- Binder and wishlist APIs lack dedicated quantity-update and removal endpoints;
  their full-resource `PATCH` is the current fallback.
- There is no frontend test stack, accessibility automation, or visual regression
  workflow.
- Phase 0 established the project profile, component audit, collection
  interaction model, and contributor setup documentation.

## Product and engineering principles

- Keep user-facing product copy in Spanish.
- Treat backend authentication, ownership, legality, and matching as authority.
- Show actionable feedback close to the action that caused it.
- Include loading, empty, error, success, disabled, and permission states.
- Design mobile-first while preserving useful desktop information density.
- Reuse card search and presentation; keep feature-specific mutation rules
  separate.
- Target WCAG 2.2 AA and prefer native semantics before ARIA.

## Target routes

| Route | Access | Purpose | Delivery phase |
| --- | --- | --- | --- |
| `/` | Public | Product introduction and calls to action | Existing / polish |
| `/login` | Public | Sign in | Existing / polish |
| `/crear-cuenta` | Public | Register | Existing / polish |
| `/perfil` | Private | Account summary | Existing / polish |
| `/decks` | Private | List and create decks | Phase 2 |
| `/decks/:id` | Private | Edit cards and review legality | Phase 2 |
| `/binders` | Private | List and create binders | Phase 3 |
| `/binders/:id` | Private | Edit binder metadata and cards | Phase 3 |
| `/wishlists` | Private | List and create wishlists | Phase 4 |
| `/wishlists/:id` | Private | Edit wishlist metadata and cards | Phase 4 |
| `/trade` | Private | Find users and compare collections | Phase 5 |
| `*` | Public | Friendly not-found state | Phase 1 |

The development-only `/test` route should be gated by environment or removed
from the production experience.

## Backend contract map

| Capability | Endpoint | Frontend responsibility |
| --- | --- | --- |
| Card search | `GET /api/cards?name=` | Query, result states, card selection |
| Decks | `GET/POST /api/decks` | List and create |
| Deck detail | `GET/PATCH/DELETE /api/decks/:id` | Load, rename, delete |
| Deck cards | `POST /api/decks/:id/cards` | Add to main or sideboard |
| Deck quantity | `PATCH /api/decks/:id/cards/:cardId` | Set quantity or zero |
| Deck removal | `DELETE /api/decks/:id/cards/:cardId` | Remove by board |
| Binders | `GET/POST /api/binders` | List and create |
| Binder detail | `GET/PATCH/DELETE /api/binders/:id` | Metadata, cards, delete |
| Binder addition | `POST /api/binders/:id/cards` | Add/increment printing |
| Wishlists | `GET/POST /api/wishlists` | List and create |
| Wishlist detail | `GET/PATCH/DELETE /api/wishlists/:id` | Metadata, cards, delete |
| Wishlist addition | `POST /api/wishlists/:id/cards` | Add/increment printing |
| User search | `GET /api/trade/users?q=` | Find another user |
| Public binders | `GET /api/trade/users/:userId/binders` | Select target binder |
| Comparison | `POST /api/trade/compare` | Compare target binder to own wishlist |

## Phase 0: Product and UX foundation

**Status:** Complete (2026-08-13)

**Outcome:** New work shares an explicit product profile and interaction model.

Work:

1. Create `ui-development/project-profile.md` from the Oracle template.
2. Record browsers, viewport range, Spanish localization, accessibility baseline,
   and current manual-only test limitations.
3. Audit `src/index.css` and existing components; document reusable tokens and
   component gaps before introducing new primitives.
4. Define the shared collection model: list, detail, card search, quantity
   controls, destructive actions, and asynchronous feedback.
5. Replace `README.md` with product purpose, prerequisites, setup, commands,
   backend dependency, and API environment configuration.

Delivered evidence:

- `ui-development/project-profile.md`
- `ui-development/component-audit.md`
- `ui-development/collection-interaction-model.md`
- `README.md`

Acceptance criteria:

- The project profile has no unresolved placeholders.
- Every planned feature has explicit async and non-happy states.
- A new contributor can run both projects without undocumented steps.

Validation:

- Review against `ui-development/oracle/project-usage-guide.md`.
- Confirm every documented command and path against repository configuration.

## Phase 1: API boundary and application shell

**Status:** Complete (2026-08-13)

**Outcome:** Features share request, routing, session, and feedback behavior.

Primary files:

- `src/api.js`
- `src/App.jsx`
- `src/components/Navbar.jsx`
- `src/components/PageShell.jsx` when shared feedback belongs there
- A new not-found page under `src/pages/`

Work:

1. Read the API origin from `VITE_API_URL`, retaining localhost only as a
   development fallback.
2. Normalize request errors to a user-safe message and HTTP status.
3. Handle unauthorized responses consistently and clear stale session state.
4. Add binder, wishlist, and trade API functions; pages must not call `fetch`.
5. Add routes as their screens become available and add a wildcard route.
6. Ensure navigation supports keyboard use, visible current route, narrow
   layouts, and authenticated/anonymous states.

Delivered implementation:

- `src/api.js` now owns environment configuration, normalized `ApiError`
  failures, token-aware session expiry, and all binder/wishlist/trade requests.
- `test/api.test.js` protects authorization, error, expiry, URL, and payload
  contracts with Node's built-in test runner.
- `src/AuthContext.jsx` and `src/auth.js` separate provider and hook concerns and
  consume one session-expiry event without circular imports.
- `src/App.jsx`, `src/pages/Login.jsx`, and `src/pages/NotFound.jsx` provide safe
  return navigation, expiry feedback, development-only test routing, and 404
  recovery.
- `src/components/Navbar.jsx` and `src/components/Button.jsx` add active,
  responsive, focus-visible, Escape, and touch-target behavior.

Acceptance criteria:

- All requests follow `VITE_API_URL` without source edits.
- Private calls include the stored token.
- Expired sessions follow one predictable sign-in recovery path.
- Unknown URLs render a useful route with navigation back to safety.

Checks:

- `npm run lint` exits successfully.
- `npm run build` creates a production bundle.
- Manual anonymous, authenticated, expired-session, mobile, and desktop checks.

Validation evidence:

- `npm test`: 6 API contract tests passed.
- `npm run lint`: passed with no warnings.
- `npm run build`: passed with `VITE_API_URL` configured; the development-only
  `/test` route was absent from the production bundle.
- `npm audit --audit-level=high`: no known high-severity vulnerabilities.
- Focused browser checks covered public and protected routes, 404 recovery,
  active navigation, account-menu Escape/focus behavior, touch targets, and a
  320 px layout without horizontal overflow.

## Phase 2: Stabilize decks

**Status:** Complete (2026-08-13)

**Outcome:** Deck operations persist safely and legality feedback is actionable.

Primary files:

- `src/pages/Decks.jsx`
- `src/pages/DeckDetail.jsx`
- `src/components/CardSearch.jsx`
- `src/components/CardTile.jsx`
- `src/components/DeckLegalityTag.jsx`
- `src/api.js` only for contract corrections

Work:

1. Make list creation, rename, delete, loading, empty, and failure states clear.
2. Use `addCardToDeck`, `updateCardQuantity`, and `removeCardFromDeck` for ordinary
   card changes rather than replacing the full deck.
3. Select main or sideboard before addition and prevent duplicate submissions.
4. Keep the last confirmed deck visible when the backend rejects a change.
5. Show main count, sideboard count, copy violations, and the action required to
   become legal.
6. Make quantity and delete controls keyboard accessible with correct focus
   recovery.

Acceptance criteria:

- Add, quantity change, board change, and removal persist after reload.
- Copy limits apply across both boards; basic-land exceptions work.
- Incomplete decks remain saveable while guidance stays visible.
- A failed mutation never remains displayed as successfully saved.

Checks:

- Exercise empty, incomplete, legal, copy violation, basic land, sideboard limit,
  slow request, and failed request cases.
- Run lint and build.

Delivered implementation:

- Pure, tested deck rules mirror backend counts, copy limits, basic-land exceptions, and board moves.
- Card mutations wait for server confirmation and preserve the last confirmed deck after failures.
- Rename, add, quantity, move, removal, and delete actions expose distinct pending and result feedback.
- Deck list, detail, search, and legality views provide explicit loading, empty, failure, and recovery states.
- Card controls have descriptive labels, 44 px targets, duplicate-submission protection, and focus recovery after removal.

Validation evidence:

- `npm test`: 11 tests passed, including copy limits, basic-land exceptions, correction guidance, and board moves.
- `npm run lint`: passed with no warnings.
- `npm run build`: production build passed.
- `npm audit --audit-level=high`: no known vulnerabilities.
- Browser workflow: create, rename, quantity update, reload persistence, board move, removal, focus recovery, and failed-mutation rollback passed.
- The 320 px deck detail layout rendered without horizontal overflow.
- External card search displayed its error state when the sandbox could not reach the card provider; mutation checks continued with a normalized card seeded through the local API.

## Phase 3: Implement binders

**Status:** Complete (2026-08-13)

**Outcome:** Users can organize owned printings and quantities.

Primary files:

- Replace `src/pages/Binders.jsx`.
- Add `src/pages/BinderDetail.jsx`.
- Update `src/App.jsx`, `src/components/Navbar.jsx`, and `src/api.js`.
- Extend shared card/collection components only where behavior is genuinely
  shared.

Work:

1. Build loading, empty, error, and populated binder list states.
2. Create binders with required name and optional 280-character description.
3. Add detail routing, metadata editing, count summary, and deletion.
4. Reuse card search to add a printing and quantity.
5. Until backend endpoints improve, update/remove cards by sending the complete
   `cards` array through `PATCH /binders/:id`.
6. Retain a confirmed snapshot and restore it after a failed full-resource patch.

Acceptance criteria:

- CRUD and card changes persist after reload.
- Adding the same printing increments quantity.
- Persisted quantities never fall below one.
- Empty search and failed search are distinguishable.
- Failed mutation restores confirmed data and explains the failure.

Checks:

- Exercise zero/multiple binders, empty binder, duplicate printing, long
  description, failed patch, and failed delete.
- Keyboard-check forms and quantity controls; run lint and build.

Delivered implementation:

- Binder list, create, detail, metadata edit, and delete workflows now use the existing protected API.
- Card addition uses the dedicated endpoint; quantity and removal use confirmed full-resource patches.
- Loading, empty, error, pending, success, and recovery states match the collection interaction model.
- Binder metadata is normalized and descriptions are limited to 280 characters in both UI and backend.
- Quantity controls preserve a minimum of one and removal restores focus to binder contents.

Validation evidence:

- `npm test`: 16 tests passed, including immutable quantity, minimum quantity, removal, count, and metadata rules.
- `npm run lint`: passed with no warnings.
- `npm run build`: production build passed.
- `npm audit --audit-level=high`: no known vulnerabilities.
- Browser workflow: create, metadata reload persistence, quantity reload persistence, failed-patch rollback, removal focus recovery, and delete navigation passed.
- Binder search and card controls use binder-specific copy, and the 320 px detail layout has no horizontal overflow.
- External card search remains dependent on the backend card providers; persistence checks used a normalized printing seeded through the local API.

## Phase 4: Implement wishlists

**Status:** Complete

**Outcome:** Users can maintain wanted cards for trade matching.

Primary files:

- Add `src/pages/Wishlists.jsx` and `src/pages/WishlistDetail.jsx`.
- Update `src/App.jsx`, `src/components/Navbar.jsx`, and `src/api.js`.
- Extract collection components only after binder/wishlist behavior proves the
  abstraction.

Work:

1. Implement list, create, detail, metadata, delete, and all async states.
2. Add wanted printings and quantities through the wishlist card endpoint.
3. Use full-resource `PATCH` plus confirmed-snapshot rollback for update/removal.
4. Explain that trade matching uses card names independently of edition.
5. Add a direct action to start trade comparison with this wishlist.

Acceptance criteria:

- All wishlist operations persist and match binder interaction conventions.
- Preferred printing and name-based matching are not misleadingly conflated.
- A selected wishlist can seed the trade flow.

Checks:

- Exercise empty, populated, duplicate, failure, long/double-faced names, delete,
  and narrow viewport cases; run lint and build.

## Phase 5: Trade discovery and comparison

**Status:** Not started

**Outcome:** Users can find another user and understand useful matches.

Primary files:

- Add `src/pages/Trade.jsx` or a small route-level flow under `src/pages/`.
- Add focused components under `src/components/` only when warranted.
- Update `src/App.jsx`, `src/components/Navbar.jsx`, and `src/api.js`.

Flow:

1. Search another user by username.
2. Select the user and load public binder summaries.
3. Select a target binder and personal wishlist.
4. Submit `targetUserId`, `binderId`, and `wishlistId`.
5. Show match count, available/wanted quantities, and relevant printings.
6. Allow any selection to change without restarting the flow.

Acceptance criteria:

- The signed-in user is excluded from results.
- No users, no binders, no wishlists, no matches, and failures have distinct
  guidance.
- Results explain name-based matching and quantity differences.
- Selection changes preserve reasonable prior context.
- The UI requests no private target collection data outside comparison output.

Checks:

- Use backend demo users for match, no-match, missing-resource, and unauthorized
  scenarios.
- Test keyboard/focus progression and narrow/wide result layouts.
- Run lint and build.

## Phase 6: Automated quality foundation

**Status:** Not started

**Outcome:** Critical behavior has repeatable regression protection.

Work:

1. Confirm compatible versions and configure Vitest, React Testing Library, and
   user-event, unless research identifies a better fit.
2. Test authorization headers, error normalization, and endpoint payloads.
3. Test login, deck quantities, binder/wishlist rollback, and trade selection.
4. Add useful automated accessibility checks while retaining manual keyboard,
   focus, reflow, and screen-reader evidence.
5. Add end-to-end happy paths after component contracts stabilize.
6. Update the project profile and README with actual commands and tooling.

Acceptance criteria:

- CI-ready commands cover lint, build, and tests.
- Critical flows have stable regression coverage.
- Accessibility claims distinguish automated and manual evidence.
- External card search is mocked at the frontend boundary.

## Phase 7: Release hardening

**Status:** Not started

**Outcome:** The complete client is deployable and supportable.

Work:

1. Remove or gate development-only UI and routes.
2. Review production API URL, CORS, token-storage risk, and expiry behavior.
3. Audit Spanish terminology, empty states, and destructive-action wording.
4. Check image failures, long names, and slow card/pricing responses.
5. Perform responsive, keyboard, focus, and screen-reader checks on all routes.
6. Document deployment configuration and known limitations.
7. Complete the Oracle evidence template for release review.

Release gate:

- Registration through trade comparison works with a clean backend dataset.
- Lint, build, tests, and selected end-to-end checks pass.
- No critical accessibility issue remains open.
- Production configuration includes no hard-coded secret.
- README, roadmap statuses, and `memory.md` match the shipped system.

## Recommended order

1. Complete Phases 0 and 1 as the foundation.
2. Stabilize decks before generalizing collection components.
3. Implement binders as the first complete collection flow.
4. Reuse proven binder patterns for wishlists without premature abstraction.
5. Implement trade only after binders and wishlists are reliable.
6. Build focused tests during each phase, then finish the wider quality layer.

## Decisions requiring confirmation

- Add backend binder/wishlist update/removal endpoints or retain full patches.
- Support a named deck format or retain generic 60/15 legality.
- Make exact printing relevant to future trade matching or keep name matching.
- Set official browser and minimum viewport support.
- Retain `localStorage` tokens for the first release or redesign session storage.
- Choose production frontend/backend deployment targets and origins.

## Definition of done for every task

- User goal, primary action, and relevant states are stated.
- Backend errors and ownership rules are handled without duplicated authority.
- Keyboard operation, focus, semantics, labels, and reflow are checked.
- Relevant lint, build, tests, and manual checks are run and recorded.
- Roadmap status and `memory.md` are updated with durable outcomes.

## Phase 5 progress: trade comparison flow

- Implemented the authenticated /trade journey: partial username search, player selection, public binder loading, personal wishlist selection, and name-based comparison results.
- Covered loading, empty, error, disabled, and populated states for each step, including explicit copy that matching ignores card edition.
- Added a focused payload contract helper and Node test coverage.
- Next bounded slice: extend comparison into reciprocal wants and an auto-trade proposal once the backend reciprocal-matching contract is available.
