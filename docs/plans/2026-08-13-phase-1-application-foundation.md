# Phase 1 Application Foundation Implementation Plan

> **For future agents:** Use `godmode:task-runner` or the current approved
> single-agent execution flow to implement this plan task by task.

**Goal:** Establish one configurable, tested API boundary and a predictable,
accessible application shell for all later collection features.

**Architecture:** Keep HTTP behavior in `src/api.js` and local/session state in
`AuthContext`. The API boundary emits a browser event after an unauthorized
response; the provider clears the session and protected routing carries a safe
reason to login. Existing React Router and Tailwind conventions remain in use.

**Tech stack:** React 19, React Router, Vite, Tailwind CSS, native Fetch, Node's
built-in test runner, and Oxlint.

---

## UX intent and Oracle checks

**User goal:** Navigate the app and recover from an expired session without stale
private content or a dead end.

**Mandatory laws:**

- Jakob's Law: navigation uses links, a disclosure button, and a conventional
  not-found recovery. Test with keyboard navigation and active-route inspection.
- Doherty Threshold: session expiry and menu interactions update immediately.
  Test that `401` emits the session event during the failed request.
- Proximity/Common Region: session-expiry feedback appears inside the login form.
  Test the redirected login state in the browser.
- Fitts's Law: navigation and menu actions provide at least a 44px control target
  where practical. Inspect computed boxes at narrow and desktop widths.

## Task 1: API boundary contract tests

**Files:**

- Create `test/api.test.js`.
- Modify `package.json`.

Steps:

1. Add a Node test script with `node --test test/*.test.js`.
2. Write tests for bearer headers, normalized status/message errors, unauthorized
   token clearing/event dispatch, binder payloads, wishlist payloads, and trade
   URL/payload encoding.
3. Run `npm test` and confirm failures identify missing Phase 1 behavior.

## Task 2: API boundary implementation

**Files:**

- Modify `src/api.js`.
- Create `.env.example`.

Steps:

1. Resolve the base URL from `VITE_API_URL`, trim trailing slashes, and retain the
   localhost fallback.
2. Use one request function for all endpoints, including `/auth/me`.
3. Throw an `ApiError` containing a safe message and HTTP status.
4. On `401`, remove the token and dispatch `garymtg:session-expired` without
   logging or exposing token data.
5. Add binder, wishlist, and trade helpers matching backend routes and payloads.
6. Run `npm test` and confirm all API contract tests pass.

## Task 3: Session and routing shell

**Files:**

- Modify `src/AuthContext.jsx`.
- Modify `src/App.jsx`.
- Modify `src/pages/Login.jsx`.
- Create `src/pages/NotFound.jsx`.

Steps:

1. Subscribe the provider to the session-expiry event and clear user state.
2. Preserve the attempted location when redirecting from a private route.
3. Show the session-expired message on login and return successful login to the
   intended safe in-app route.
4. Gate `/test` behind `import.meta.env.DEV`.
5. Add a wildcard not-found route with clear home and previous-page recovery.

## Task 4: Navigation accessibility and responsive behavior

**Files:**

- Modify `src/components/Navbar.jsx`.
- Modify `src/components/Button.jsx`.

Steps:

1. Add shared visible focus and disabled cursor behavior to `Button`.
2. Hide the test link outside development.
3. Add active-route styling and close the menu on route selection.
4. Add `aria-haspopup`, menu labeling, Escape handling, and focus return.
5. Preserve usable wrapping and targets at 320px and desktop widths.

## Task 5: Documentation and status

**Files:**

- Modify `README.md`.
- Modify `roadmap/frontend-implementation-roadmap.md`.
- Modify `ui-development/project-profile.md`.
- Modify `memory.md`.

Steps:

1. Document `VITE_API_URL`, `.env.example`, and `npm test`.
2. Mark Phase 1 complete only after all acceptance checks pass.
3. Capture durable API/session patterns and any failure evidence.

## Verification and completion

Run:

```powershell
npm test
npm run lint
npm run build
npm audit --audit-level=high
git diff --check
```

Expected: all commands exit zero. Lint must introduce no new warning; the known
Fast Refresh warning in `AuthContext.jsx` should be resolved while that file is
in scope.

Manual browser checks:

- Anonymous and authenticated navigation at 320px and desktop widths.
- Keyboard open/close/escape flow for the account menu with visible focus.
- Unknown route recovery.
- Expired-session redirect and message.
- `/test` absent from a production build and available in development.

Commit message:

```text
feat: establish frontend application foundation
```
