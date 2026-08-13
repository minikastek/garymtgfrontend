# Collection Interaction Model

This specification defines the shared user experience for decks, binders, and
wishlists. It standardizes user intent and feedback while preserving each
resource's backend rules.

## UX intent

**User:** An authenticated Magic player.

**Need:** Find a card and update a deck, binder, or wishlist quickly.

**Outcome:** The collection visibly matches the last backend-confirmed state and
the user understands any rule or failure that prevented a change.

**Primary action:** Add a selected card printing with a quantity to the active
collection.

**Constraints:** Spanish copy, WCAG 2.2 AA, 320px and wider layouts, external
search latency, backend-authoritative validation, and no configured UI test
runner yet.

## Shared information architecture

Every collection feature follows the same broad structure:

1. Collection index: title, short purpose, create action, and resource summaries.
2. Collection detail: identity/metadata, count summary, card search, and contents.
3. Card row or tile: printing information, quantity, price when available, and
   feature-appropriate actions.
4. Feedback region: pending, success when useful, validation error, or recovery
   guidance near the initiating control.

Decks additionally expose main/sideboard placement and legality. Binders and
wishlists expose descriptions. Trade comparison consumes binders and wishlists
but does not mutate them.

## State model

| State | Required behavior |
| --- | --- |
| Initial loading | Preserve page structure, expose a textual loading status, and avoid showing a false empty state |
| Empty collection index | Explain the resource's value and provide one clear create action |
| Empty collection detail | Keep card search prominent and explain how to add the first card |
| Search idle | Show a visible label, concise hint, and no stale error |
| Search pending | Disable duplicate submission and announce that search is active |
| Search empty | State that no cards matched and suggest refining the name; do not style as a system failure |
| Search error | Preserve the query, explain the failure, and offer retry |
| Mutation pending | Disable only conflicting controls and retain readable confirmed data |
| Mutation success | Replace local data with the backend response; use a transient announcement only when the visible result is insufficient |
| Validation error | Keep confirmed data, associate the message with the failed control, and explain the next valid action |
| Network/server error | Restore confirmed data, retain user context, and offer retry |
| Permission/session error | Stop mutations, remove stale protected content, and guide the user to sign in again |
| Delete pending | Prevent repeated confirmation and keep the resource visible until success |
| Delete success | Navigate to the collection index and place focus at a useful heading or status |

## Mutation contract

1. A route-level feature owns server data and a last-confirmed snapshot.
2. A control may display a pending intention, but it must not imply persistence
   before the backend responds.
3. On success, replace local resource state with the response resource.
4. On failure, restore the confirmed snapshot and keep the failed intent clear
   enough to retry.
5. Disable only controls that conflict with the active request; unrelated
   reading and navigation remain available.
6. Backend validation messages are authoritative but may be rewritten into safe,
   actionable Spanish without changing their meaning.

Decks use dedicated card mutation endpoints. Binders and wishlists currently use
their add-card endpoint and full-resource `PATCH` for quantity/removal. That
transport difference must not produce a different user-facing interaction.

## Quantity controls

- Use native buttons with accessible names containing the card name and action.
- Show the current quantity as text, not only through color or position.
- Meet the project's touch-target baseline where layout permits.
- Prevent a decrement below the domain minimum and explain any backend maximum.
- For decks, quantity zero may remove through the dedicated endpoint.
- For binders and wishlists, removal is an explicit action and the resulting full
  cards array is patched until the backend contract changes.
- Do not encode deck copy limits into shared card presentation components.

## Card search and selection

- Search has a persistent visible label and realistic Spanish example.
- Submission is explicit; debouncing may be added later only with cancellation
  and stale-response protection.
- Results preserve backend printing identity (`id`, set, collector number).
- Empty and error results are separate states.
- Result cards expose card name, set, collector number, rarity, image fallback,
  available price source, quantity, and an unambiguous add action.
- Deck search exposes main/sideboard placement before addition. Other collection
  types omit board controls instead of displaying irrelevant choices.

## Destructive actions

- Rename/edit operations do not require confirmation.
- Resource deletion requires a confirmation that names the resource and states
  the consequence.
- Card removal is immediately understandable and may be direct when the user can
  easily add the card again; failure still restores confirmed state.
- Confirmation cancellation returns focus to the initiating control.
- Deletion failure keeps the resource visible and offers retry.

## Responsive behavior

- At 320px, forms and primary actions stack in logical reading order.
- Card grids begin with two columns only when card names and controls remain
  usable; otherwise use one column.
- At wider breakpoints, increase columns without changing keyboard or DOM order.
- Long names and translated copy wrap without covering controls.
- No action depends on hover; hover only supplements focus and active states.

## Accessibility behavior

- Use `main`, headings, sections, forms, lists, buttons, and links semantically.
- Every field has a visible label and every button has an accessible name.
- Use `aria-live` conservatively for async status that is not otherwise apparent.
- Keep focus visible and predictable after create, delete, retry, and route change.
- Use text plus color for legality, errors, and success.
- Any future custom menu, tabs, dialog, or composite widget follows the relevant
  WAI-ARIA Authoring Practices pattern.

## UX law mapping

| Law/pattern | Classification | Application | Measurable criterion |
| --- | --- | --- | --- |
| Jakob's Law | Mandatory | Reuse familiar list/detail/search/action patterns | A keyboard user can identify and activate the primary action without instructions |
| Doherty Threshold | Mandatory | Show immediate pending feedback for external/API latency | Feedback appears in the same render cycle as submission |
| Proximity/Common Region | Mandatory | Keep status and validation near the initiating control | Every failure message is programmatically or visually associated with its action |
| Fitts's Law | Mandatory | Make common quantity and add actions easy to target | Primary touch controls target 44 by 44 CSS pixels where practical |
| Tesler's Law | Optional | Hide transport differences while preserving domain rules | Binder/wishlist full patches do not create a different interaction model |

## Acceptance checks for implementing features

1. Complete the primary journey with keyboard only and visible focus.
2. Verify loading, empty, error, success, disabled, and session-expired states.
3. Simulate one rejected mutation and confirm the UI restores server-confirmed
   data without losing search or selection context.
4. Check 320px and desktop layouts plus zoom/reflow.
5. Confirm Spanish accents and long card names render correctly.
6. Run configured lint, build, and test commands and record exact results.

Until these checks are executed for a concrete screen, its Oracle verdict remains
`Iterate`.
