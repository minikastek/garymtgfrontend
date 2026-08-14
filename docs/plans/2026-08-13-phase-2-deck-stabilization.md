# Phase 2 specification and implementation plan

## Objective

Make deck creation and editing reliable against the existing backend while keeping incomplete decks editable and legality guidance actionable.

## Behavior specification

- List and detail screens distinguish loading, failure, empty, pending, and populated states.
- Add, quantity, removal, and board-move actions render only backend-confirmed decks.
- Rejected mutations preserve the last confirmed deck and state that no change was applied.
- Rename is saved independently from card changes.
- Copy limits use normalized front-face names across both boards; basic lands are exempt.
- Legality feedback states the specific correction while incomplete decks remain editable.
- Quantity, move, and removal controls have descriptive labels, 44 px targets, and focus recovery.

## Implementation plan

1. Extract and test pure deck rules.
2. Replace local card edits with granular API mutations.
3. Use one atomic full-deck patch only for board moves because no move endpoint exists.
4. Add resilient list/detail/search states and action feedback.
5. Validate tests, lint, build, audit, and focused browser workflows.

## Trade-off

Board moves use `PATCH /decks/:id` with both arrays. Remove-then-add could lose data, while add-then-remove can violate copy limits.
