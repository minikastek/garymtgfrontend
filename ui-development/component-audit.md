# Component and Token Audit

**Date:** 2026-08-13

**Scope:** `src/index.css` and reusable components present at the start of Phase 0.

## Summary

The existing interface has a clear dark fantasy direction: charcoal surfaces,
muted blue-gray text, and a gold accent suited to a Magic collection product.
The component set is small enough to evolve without adopting an external design
system. The next implementation phases should formalize the current direction
instead of replacing it.

This audit is evidence from source inspection. It does not claim visual,
contrast, keyboard, screen-reader, or browser validation.

## Existing token inventory

| Category | Current source | Assessment |
| --- | --- | --- |
| Background | `--color-bg` | Established |
| Surfaces | `--color-surface`, `--color-surface-2` | Established |
| Muted text | `--color-muted` | Established; contrast must be measured |
| Accent | `--color-accent`, `--color-accent-hover` | Established |
| Danger | `--color-danger` | Established; contrast must be measured |
| Typography | `--font-sans` | One stack established |
| Spacing | Tailwind utilities and arbitrary values | No project scale documented |
| Radius | Mixed Tailwind and arbitrary values | No project scale documented |
| Shadows | Component-local Tailwind utilities | No elevation scale documented |
| Breakpoints | Tailwind defaults used at `sm` and `md` | Partial convention |
| Z-index | `z-50` in navigation | No layer scale documented |
| Motion | `transition-colors` in controls | No duration/reduced-motion rule |

## Component inventory

| Component | Reusable role | Strengths | Gaps to resolve |
| --- | --- | --- | --- |
| `Button` | Primary, ghost, and danger actions | Central variants and composition through `as` | No explicit focus-visible treatment, loading contract, size variants, or guaranteed touch target |
| `PageShell` | Main content width and page spacing | Consistent max width and semantic `main` | Fixed spacing is not yet tied to documented responsive tokens |
| `Navbar` | Session-aware global navigation | Semantic header/nav and compact account menu | Menu keyboard/focus behavior is incomplete; active route style and production handling of `/test` are missing |
| `CardSearch` | Query and card result selection | Clear busy/error branches and responsive result grid | Search lacks a visible label; empty results reuse error styling; board selector semantics and announcements need definition |
| `CardTile` | Card image, metadata, price, and quantity actions | Real card content, image fallback, lazy loading | Duplicated buttons bypass `Button`; accessible names, optimistic rollback, touch targets, and feature-specific quantity rules need work |
| `DeckLegalityTag` | Legal/incomplete deck feedback | Provides counts and explanatory messages | Color contrast and announcement behavior are unverified; “legal” wording needs format context if formats are introduced |

## Cross-cutting findings

### P0 before release

- Repair source encoding so Spanish copy and symbols render as intended.
- Add visible labels and accessible names to form and icon-like controls.
- Establish consistent visible focus and keyboard behavior for every interaction.
- Measure semantic color contrast against the surfaces where each color appears.

### P1 during Phase 1 and Phase 2

- Add shared loading/disabled behavior that prevents duplicate mutations.
- Separate empty states from errors instead of presenting both as failures.
- Establish confirmed-server-state rollback for optimistic collection changes.
- Gate or remove the `/test` route from production navigation.
- Define active navigation state and complete menu focus/escape behavior.

### P2 as collection workflows mature

- Formalize spacing, radius, elevation, z-index, and motion tokens based on
  repeated use rather than speculative scales.
- Extract shared collection components only after binder and wishlist behavior
  demonstrates stable commonality.
- Add stable image dimensions or aspect metadata where the API allows it to
  reduce layout shift.

## Reuse decisions

- Keep `Button`, `PageShell`, `CardSearch`, and `CardTile` as the starting
  primitives.
- Extend `Button` before adding new one-off action styles.
- Keep card presentation shared, but pass feature behavior through composed
  controls rather than embedding deck, binder, and wishlist rules in `CardTile`.
- Keep server data local to route-level feature state until repeated needs
  justify a server-state dependency.
- Do not add a component library during the current roadmap; the existing scope
  does not yet justify its bundle, migration, and maintenance cost.

## Validation backlog

1. Measure all text and control-state contrast combinations.
2. Record keyboard order and visible-focus evidence for the representative deck
   journey.
3. Check 320px, 640px, 768px, 1024px, and 1440px layouts plus 400% reflow.
4. Check Spanish accents, long card names, and double-faced names using UTF-8.
5. Add component interaction tests when Phase 6 establishes the test stack.
