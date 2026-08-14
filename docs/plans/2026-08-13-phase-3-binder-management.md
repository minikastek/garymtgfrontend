# Phase 3 specification and implementation plan

## Objective

Allow authenticated users to create binders, edit metadata, and maintain owned card printings and quantities against the existing backend.

## Behavior specification

- Binder list and detail distinguish loading, empty, failure, pending, and success states.
- Creation requires a trimmed name; descriptions are optional and limited to 280 characters.
- Add operations use the dedicated card endpoint and replace local data with its confirmed binder.
- Quantity and removal operations build a new cards array and send one full-resource patch.
- Failed patches leave the last confirmed binder visible and explicitly state that no change applied.
- Adding an existing printing increments its quantity; persisted quantities never fall below one.
- Metadata and destructive actions have independent, duplicate-safe pending states.
- Card controls remain keyboard accessible and removal restores focus to the contents heading.

## Implementation plan

1. Add pure binder count, metadata, quantity, and removal helpers with Node tests.
2. Replace the binder placeholder with list, create, and empty/error states.
3. Add protected binder detail routing and metadata CRUD.
4. Reuse card search and tiles with binder-specific quantity semantics.
5. Validate API persistence, rollback, keyboard behavior, and narrow layouts.

## Deliberate constraint

Do not extract a generic collection framework yet. Wishlists are the second comparable implementation and will reveal which behavior is genuinely shared.
