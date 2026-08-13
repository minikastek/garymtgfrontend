# UI Project Profile

- **Product and primary user task:** GaryMTG is a Spanish-language Magic: The
  Gathering web app. Authenticated players organize decklists, owned cards, and
  wanted cards, then compare another user's binder with a personal wishlist.
- **Supported platforms and browsers:** Responsive web. Provisional support is
  the current and previous major versions of Chrome, Edge, Firefox, and Safari,
  plus current mobile Chrome and Safari. This must be confirmed before release.
- **Design system and component source:** Project-owned React components in
  `src/components/` with Tailwind utility classes. No external component system
  is installed.
- **Token source:** Tailwind theme values in `src/index.css`. The current source
  defines core colors and the sans-serif font; the remaining token gaps are
  tracked in `component-audit.md`.
- **Accessibility baseline:** WCAG 2.2 AA. Use semantic HTML first, visible
  keyboard focus, accessible names, 44 by 44 CSS-pixel touch targets where
  practical, and WAI-ARIA APG behavior for any custom composite widget.
- **Supported viewport range and breakpoints:** Design from 320 CSS pixels wide
  upward. Existing responsive tiers use Tailwind `sm` (640px) and `md` (768px);
  wider layouts should remain readable through at least 1440px. Verify reflow at
  400% zoom where applicable.
- **Localization/content constraints:** Product copy is Spanish. Code,
  identifiers, and developer documentation are English. Preserve accents and
  punctuation in UTF-8 and test long card names, set metadata, and double-faced
  card names.
- **UI test commands:** `npm test` runs Node-native API contract tests;
  `npm run lint` and `npm run build` validate source and production bundling.
  Rendered component interaction tests are planned in roadmap Phase 6.
- **Accessibility test commands/tools:** Manual only: keyboard navigation,
  visible focus, browser zoom/reflow, contrast inspection, and representative
  screen-reader checks. Automation is planned but will not replace manual checks.
- **Visual regression method:** None configured. Use documented manual checks at
  narrow and wide viewports until a repeatable method is adopted.
- **PR/review location:** GitHub pull requests using
  `ui-development/oracle/pr-oracle-template.md` for UI-impacting changes.
- **Named UX/accessibility owner for exceptions:** Repository maintainers. Any
  exception requires an explicit owner, rationale, risk, and reviewer approval
  in the pull request.

## Representative journey baseline

**Journey:** Create a deck, search for a card, add it to main or sideboard,
change its quantity, and understand legality feedback.

**Known risks:**

- Card search uses a placeholder without a visible label.
- Several compact controls do not yet guarantee the target size baseline.
- Focus styling is inconsistent outside text fields.
- Some Spanish text is visibly mis-encoded in source.
- Async mutations do not yet share a confirmed-state rollback convention.

**Task-success signal:** The user can complete the journey without an invalid
quantity, unexplained legality result, stale optimistic state, or keyboard trap.

**Baseline accessibility evidence:** Source review only. A full manual journey
check has not yet been recorded, so the baseline verdict is `Iterate` rather than
`Ship`.
