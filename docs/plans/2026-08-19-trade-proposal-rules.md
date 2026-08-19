# Trade Proposal Rules Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use godmode:task-runner to implement this plan task-by-task.

**Goal:** Provide reusable frontend rules for composing two-sided card proposals and displaying non-authoritative price estimates.

**Architecture:** Extend the existing pure `tradeRules` module rather than coupling proposal behavior to a React page. Preserve the backend as pricing and ownership authority by submitting identifiers and quantities only.

**Tech Stack:** JavaScript ES modules, Node built-in test runner.

---

### Task 1: Define proposal selection behavior

**Files:**
- Modify: `src/tradeRules.js`
- Test: `test/trade-rules.test.js`

Add immutable quantity selection keyed by binder and card, clamp quantities to available inventory, and remove zero-quantity lines.

### Task 2: Define estimate behavior

**Files:**
- Modify: `src/tradeRules.js`
- Test: `test/trade-rules.test.js`

Calculate USD estimates using Card Kingdom retail with Scryfall USD fallback, round totals to cents, and report cards without prices.

### Task 3: Protect the backend submission boundary

**Files:**
- Modify: `src/tradeRules.js`
- Test: `test/trade-rules.test.js`

Build proposals from recipient, binder, card, and positive quantity identifiers only. Reject incomplete proposals and exclude names, images, and browser-provided prices.

### Task 4: Validate and document

Run `npm test`, `npm run lint`, and `npm run build`. Record the verified rule in the roadmap and project memory.

