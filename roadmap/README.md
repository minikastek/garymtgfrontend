# GaryMTG Frontend Roadmap

This directory is the planning source of truth for implementing the frontend
against the existing GaryMTG backend.

## Active plan

- [Frontend implementation roadmap](./frontend-implementation-roadmap.md)

## Workflow

1. Read `../AGENTS.md`, `../memory.md`, and the UX Oracle documents selected by
   `../ui-development/oracle/routing-map.md`.
2. Choose the next phase whose entry dependencies are satisfied.
3. Convert it into a task-level plan before implementation.
4. Deliver one vertical slice with loading, empty, error, and success states.
5. Record validation evidence and update roadmap status.
6. Capture durable decisions and lessons in `../memory.md`.

## Status vocabulary

- `Not started`: implementation has not begun.
- `In progress`: implementation or validation is active.
- `Blocked`: a named dependency prevents progress.
- `Complete`: acceptance criteria and required checks have passed.

Backend behavior and explicit product decisions take precedence over stale
roadmap assumptions.
