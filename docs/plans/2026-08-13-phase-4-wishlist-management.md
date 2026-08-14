# Phase 4: Wishlist management

## Goal

Deliver the wishlist workflow required by trade comparison while preserving the interaction and persistence guarantees established by binders.

## Contract

- Authenticated users can list, create, open, edit, and delete only their own wishlists.
- Names are required and descriptions are normalized to 280 characters.
- Cards are added through `POST /wishlists/:id/cards`.
- Quantity changes and removals send a complete immutable `cards` array through `PATCH /wishlists/:id`.
- The interface adopts only confirmed server responses, so failed requests retain the last confirmed wishlist.
- Quantities cannot fall below one.

## Delivery

- Add protected `/wishlists` and `/wishlists/:id` routes.
- Add loading, empty, failure, save, and deletion states.
- Reuse card search and card tile primitives with wishlist-specific labels.
- Cover totals, immutable quantity changes, removal, and metadata normalization with pure tests.
- Keep collection page state explicit until trade comparison reveals a stable shared boundary.
