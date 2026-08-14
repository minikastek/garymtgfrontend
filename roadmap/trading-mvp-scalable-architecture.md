# Trading MVP: Scalable Architecture and Growth Plan

## 1. Purpose

Build a privacy-safe trading experience that discovers nearby players, finds reciprocal collection matches, and suggests editable trade bundles. The MVP must remain simple enough for the current team while preserving clear boundaries that can scale independently later.

The product must never automatically accept or complete a trade. "Automatic trade" means an automatically generated proposal that both players can inspect, edit, and explicitly accept.

## 2. Product outcome

A signed-in player can:

1. Publish an approximate trading location and choose whether it is visible.
2. Discover traders by country, region, and city.
3. Select which binders and wishlists participate in matching.
4. See reciprocal matches:
   - cards they want that the other player owns;
   - cards the other player wants that they own.
5. Generate up to five ranked trade suggestions.
6. Review exact printings, quantities, price source, price timestamp, and estimated value difference.
7. Edit a suggestion and send it as a proposal.
8. Accept, reject, cancel, or counter a proposal.

## 3. Rationale and scope decision

### Recommended option: scalable modular monolith

Use the existing Node/Express deployment, but reorganize trading as domain modules with explicit interfaces. Move durable multi-user state from JSON files to PostgreSQL before persisting trade proposals.

This gives the MVP transactional safety and searchable data without paying the operational cost of microservices, Redis, queues, distributed tracing, and eventual consistency before they are required.

### Alternatives

| Option | Effort | Coverage | Trade-off |
| --- | --- | --- | --- |
| Full distributed platform now | Massive | 100% speculative scale | High operational cost and slow delivery without measured demand |
| Modular monolith with PostgreSQL | Substantial | Full MVP and strong growth path | Requires a deliberate persistence migration |
| Extend JSON storage directly | Moderate | Demonstration only | Unsafe concurrent proposal updates and poor discovery/indexing |
| Defer automatic proposals | Low | Existing one-way comparison | Misses the core reciprocal trade value |

## 4. Architecture principles

1. **One deployment first.** Keep API, matching, and proposal orchestration in the Express application.
2. **Capabilities own behavior.** Organize backend code by `profiles`, `collections`, `discovery`, `matching`, `pricing`, and `trades` rather than one large route file.
3. **Pure matching core.** The matching engine receives plain snapshots and returns ranked suggestions without reading files, databases, HTTP, or global state.
4. **Interfaces at volatile boundaries.** Persistence and seller integrations sit behind repository/provider contracts.
5. **PostgreSQL is authoritative.** Redis may later accelerate reads or jobs, but never becomes the only source of collection, proposal, or price history.
6. **Snapshot mutable facts.** Sent proposals preserve card printing, quantity, price, currency, provider, and timestamp so later collection or market changes do not rewrite history.
7. **Extract only under pressure.** A module becomes a service only when independent scaling, deployment, reliability, or team ownership is measured and necessary.

## 5. Target modular monolith

```text
HTTP API / Express
  auth middleware
  profile and location module
  collection module
  trade discovery module
  reciprocal matching module
  pricing module
  proposal workflow module
        |
        +-- repository interfaces --> PostgreSQL
        +-- price provider interface --> seller APIs
        +-- clock/id interfaces --> deterministic tests
```

### Responsibility boundaries

| Module | Owns | Must not own |
| --- | --- | --- |
| Profiles | Public trade settings and approximate location | Card matching or seller API calls |
| Collections | Binder/wishlist visibility, cards, quantities, printing identity | Trade ranking |
| Discovery | Candidate filtering and privacy-safe location ranking | Proposal state transitions |
| Matching | Reciprocal intersections, bundle generation, ranking | Database or HTTP access |
| Pricing | Seller adapters, normalization, freshness, market snapshots | Deciding whether a trade is fair |
| Trades | Draft/sent/countered/accepted/rejected/cancelled lifecycle | Live mutation of binders or wishlists |

## 6. PostgreSQL data model

Use UUID or ULID identifiers, timestamps with timezone, foreign keys, constraints, and parameterized queries.

### Profiles and location

`trade_profiles`

| Field | Notes |
| --- | --- |
| `user_id` | Primary key and foreign key |
| `trading_enabled` | Opt-in, default false |
| `location_visibility` | `hidden`, `country`, `region`, or `city` |
| `country_code` | ISO 3166-1 alpha-2 |
| `region_code` | Stable provider-neutral region code |
| `city_id` | Canonical city identifier when available |
| `updated_at` | Audit timestamp |

Do not store or expose street addresses or exact coordinates in the MVP. Free-text labels may be displayed, but matching uses canonical identifiers.

### Collection participation

Add visibility and trading flags to binders and wishlists:

| Field | Notes |
| --- | --- |
| `visibility` | `private` or `public` |
| `trade_enabled` | Explicit opt-in |
| `version` | Incremented on mutation for snapshot freshness |

Store collection cards as rows keyed by collection, exact card printing, treatment, language, and condition when those attributes become available. Preserve a normalized oracle/name key separately for name-level matching.

### Market prices

`price_observations`

| Field | Notes |
| --- | --- |
| `printing_id` | Exact card printing |
| `provider` | Stable seller/provider key |
| `currency` | ISO 4217 code |
| `amount_minor` | Integer minor units, never floating point |
| `condition` | Normalized condition enum |
| `finish` | Normal, foil, etched, etc. |
| `available` | Availability signal |
| `listing_url` | Validated outbound URL from an allowlisted provider |
| `observed_at` | When the provider supplied or exposed the price |
| `expires_at` | Freshness boundary |

`market_snapshots` may later store a normalized reference value per printing/currency while retaining all original observations.

### Trade proposals

`trade_proposals`

| Field | Notes |
| --- | --- |
| `id` | UUID/ULID |
| `proposer_id` | Authenticated creator |
| `recipient_id` | Other player |
| `status` | State machine value |
| `currency` | Comparison currency |
| `proposer_value_minor` | Snapshot total |
| `recipient_value_minor` | Snapshot total |
| `pricing_observed_at` | Oldest observation used |
| `version` | Optimistic concurrency token |
| `expires_at` | Proposal expiry |
| `created_at`, `updated_at` | Audit timestamps |

`trade_proposal_items`

| Field | Notes |
| --- | --- |
| `proposal_id` | Parent proposal |
| `owner_id` | Player giving the card |
| `printing_id` | Exact printing snapshot |
| `card_name`, `set_code`, `collector_number` | Human-readable snapshot |
| `quantity` | Positive integer |
| `condition`, `finish`, `language` | Snapshot attributes |
| `unit_price_minor` | Price snapshot |
| `price_provider`, `price_observed_at` | Explainability |

Valid state transitions:

```text
draft -> sent -> accepted
              -> rejected
              -> countered -> accepted/rejected/countered
draft/sent/countered -> cancelled
sent/countered -> expired
```

Every transition verifies participant authorization and the expected proposal version in one database transaction.

## 7. Matching specification

### Inputs

| Input | Constraint |
| --- | --- |
| Requesting and target user | Different authenticated users with trading enabled |
| Binder selections | Owned by the corresponding player, public/trade-enabled |
| Wishlist selections | Owned by the corresponding player, trade-enabled |
| Candidate limit | Maximum 20 candidate card names per side |
| Bundle limit | Maximum 5 distinct card lines per side |
| Result limit | Maximum 5 suggestions |
| Value tolerance | Configurable, default 10% |
| Price policy | Same currency and freshness policy for both sides |

### Pipeline

1. Authorize both users and collection visibility.
2. Load immutable collection snapshots and versions.
3. Calculate both intersections by normalized card identity:
   - requester wishlist against target binders;
   - target wishlist against requester binders.
4. Cap quantities by both wanted quantity and available quantity.
5. Prefer exact requested printings; otherwise clearly label name-level substitutions.
6. Attach fresh price observations when available.
7. Rank individual candidates by wishlist priority, exact-printing preference, price confidence, and available quantity.
8. Generate bounded bundles rather than enumerating every combination.
9. Score bundles by mutual wishlist value, relative price difference, price coverage, and card-count simplicity.
10. Return the best distinct suggestions with explanations and warnings.

### Deterministic MVP scoring

```text
score =
  mutual_priority_score
  + exact_printing_bonus
  + price_coverage_bonus
  - relative_value_difference_penalty
  - bundle_complexity_penalty
```

Tie-break in a stable order using fewer card lines, smaller value difference, then printing ID. Scoring weights are server configuration with a version recorded in generated results.

### Price limitations

- Suggestions may be generated without complete prices, but must be labeled `price_incomplete`.
- Never describe a proposal as fair or guarantee card value.
- Show original seller currency, normalized comparison currency, provider, and observation time.
- Reject stale observations according to the configured freshness window.

## 8. API surface

Use consistent REST resources, cursor pagination for discovery, and idempotency keys for proposal creation.

```http
PATCH /api/trade/profile
GET   /api/trade/discovery?country=AR&region=AR-B&cityId=...&after=...
POST  /api/trade/matches
POST  /api/trade/suggestions
POST  /api/trade/proposals
GET   /api/trade/proposals?role=participant&status=sent&after=...
GET   /api/trade/proposals/:proposalId
POST  /api/trade/proposals/:proposalId/send
POST  /api/trade/proposals/:proposalId/accept
POST  /api/trade/proposals/:proposalId/reject
POST  /api/trade/proposals/:proposalId/counter
POST  /api/trade/proposals/:proposalId/cancel
```

`POST /api/trade/suggestions` returns generated, unsaved suggestions. `POST /api/trade/proposals` persists a user-selected or edited suggestion as a draft.

All mutation endpoints require authentication, participant authorization, input schemas, rate limits, and an expected version. Proposal creation also accepts an `Idempotency-Key` to prevent duplicate drafts after retries.

## 9. MVP delivery phases

### T0: Persistence and domain foundation

- Introduce PostgreSQL migrations and repository interfaces.
- Migrate users, binders, wishlists, and card rows from JSON.
- Keep route response contracts compatible during migration.
- Move secrets and database configuration to environment variables.
- Add integration tests for transactions, ownership, and concurrent updates.

Exit: JSON files are no longer authoritative and concurrent collection writes are safe.

### T1: Privacy-safe profiles and discovery

- Add trade opt-in, collection visibility, and country/region/city settings.
- Add indexed discovery with cursor pagination.
- Filter hidden users and the requesting user server-side.
- Rank exact city, then region, then country without exposing hidden precision.

Exit: users can find consenting traders by approximate location.

### T2: Reciprocal matching

- Extract the existing name-normalization behavior into a pure matching module.
- Compute both wishlist/binder intersections with quantity caps.
- Return exact-printing and substitution distinctions.
- Add bounded requests and deterministic unit/property tests.

Exit: two players can understand what each can give and receive.

### T3: Pricing foundation

- Define the seller provider interface and normalized observation model.
- Integrate one reliable provider first.
- Store timestamps, currency, condition, finish, availability, and listing URL.
- Add freshness rules, provider failure isolation, and price-confidence output.

Exit: matching can attach explainable market estimates without depending on a live provider response.

### T4: Automatic suggestions

- Generate bounded bundles synchronously from reciprocal candidates.
- Return up to five stable, ranked options.
- Support incomplete-price warnings and configurable tolerance.
- Explain why each proposal ranked and which constraints excluded cards.

Exit: users can select and edit a useful suggested trade.

### T5: Proposal workflow

- Persist draft and sent proposals with item/price snapshots.
- Implement participant-only state transitions with optimistic concurrency.
- Revalidate collection availability before send and accept.
- Add inbox/outbox UI and clear expired/stale warnings.

Exit: both players can negotiate and explicitly accept a proposal without automatic inventory transfer.

## 10. Non-functional acceptance criteria

- Discovery returns at most 20 users per page and does not reveal location beyond each user’s visibility setting.
- Matching returns at most 20 candidates per side and five suggestions.
- Matching output is deterministic for identical versioned inputs.
- A request cannot read private collections or proposals belonging to unrelated users.
- Proposal state transitions are atomic and reject stale versions.
- Duplicate create requests with the same idempotency key produce one proposal.
- Every price has provider, currency, condition/finish context, and timestamp.
- Provider outages do not block collection management or unpriced reciprocal matching.
- Logs contain identifiers and failure codes, but no tokens, exact locations, or private collection payloads.
- Unit tests cover the pure engine; integration tests cover SQL ownership/transactions; end-to-end tests cover discovery through proposal acceptance.

## 11. Scaling path: small to big

### Stage A: Small product

**Architecture:** One Express deployment plus managed PostgreSQL.

**Responsible components:**

- Express modules orchestrate requests.
- PostgreSQL handles transactions, filtering, indexing, and proposal history.
- The pure matching engine runs synchronously with strict candidate limits.
- Price refresh can initially run as a scheduled command in the same repository.

Do not add Redis, queues, microservices, Elasticsearch, or Kubernetes.

### Stage B: Growing product

Adopt only when measurements show one of these conditions:

- price refresh regularly exceeds request-safe execution windows;
- seller rate limits require retry/backoff scheduling;
- matching p95 exceeds 500 ms despite indexed queries and candidate bounds;
- synchronous matching consumes enough CPU to affect unrelated API latency;
- discovery queries exceed PostgreSQL targets after index/query optimization.

**Architecture changes:**

- Add Redis and BullMQ for price-refresh and matching jobs.
- Run worker processes from the same codebase and domain modules.
- Return `202 Accepted` plus job status only for workloads that exceed the synchronous budget.
- Add an outbox table so committed proposal events are delivered reliably.
- Add read models/materialized views for discovery and reciprocal candidate lookup.
- Add PostGIS only if radius/distance search becomes a product requirement; retain city-level privacy controls.

The API remains the owner of authorization and proposal state. Workers receive IDs, reload authorized snapshots, and write versioned results.

### Stage C: Large product

Extract services only when a module needs independent scaling, failure isolation, deployment cadence, or team ownership.

Likely extraction order:

1. **Pricing ingestion service:** high external I/O, provider rate limits, retries, and independent freshness objectives.
2. **Matching workers/service:** CPU-heavy optimization and independent autoscaling.
3. **Discovery/search service:** only if PostgreSQL/PostGIS and read models cannot meet measured search needs.
4. **Notification service:** asynchronous email/push delivery after proposal workflows mature.

Keep identity, authorization policy, and trade proposal transactions together until there is a concrete reason to split them. They form the consistency boundary.

Use versioned events such as `collection.changed`, `price.observed`, and `proposal.status_changed`. Publish through a transactional outbox before considering Kafka/NATS. Consumers must be idempotent.

### Stage D: Optimization platform

Only after product evidence shows users need larger or more complex bundles:

- replace bounded heuristic search with integer programming or min-cost flow;
- execute optimization asynchronously with deadlines and cancellation;
- maintain multiple objective profiles such as fewest cards, highest wishlist priority, or closest value;
- evaluate Google OR-Tools in a dedicated worker rather than embedding it in the request API;
- measure suggestion acceptance rate before increasing algorithmic complexity.

## 12. Future growth options

### Geographic growth

- Distance/radius search with PostGIS and coarse location cells.
- Store private coordinates only with explicit consent and expose approximate distance bands.
- Local game store and event-based meeting points.
- Shipping-enabled matching with country and logistics constraints.

### Matching growth

- Wishlist priorities and “must have” constraints.
- Acceptable printing, language, condition, and finish preferences.
- Cash/card balancing where legally and operationally appropriate.
- Multi-party cycle matching after two-party proposal adoption is proven.
- Learning-to-rank based on anonymous proposal acceptance signals, never as the source of authorization or inventory truth.

### Pricing growth

- Multiple seller adapters with per-provider health and rate limits.
- Region-specific sellers and currencies.
- FX snapshots and historical price charts.
- Median, trimmed mean, confidence bands, and liquidity signals.
- User-selected price policy for proposals.

### Trust and safety growth

- Blocks, reports, reputation, completed-trade feedback, and moderation queues.
- Messaging with abuse controls.
- Meeting-safety guidance and private contact exchange only after mutual consent.
- Fraud/anomaly signals that inform review but do not silently punish users.

### Platform growth

- Notifications for new nearby reciprocal matches.
- Saved searches and digest subscriptions.
- Public API/webhooks with scoped OAuth permissions.
- Analytics for match-to-proposal and proposal-to-acceptance conversion.

## 13. Explicitly excluded from the MVP

- Exact GPS proximity or street addresses.
- Automatic acceptance, inventory transfer, payment, escrow, or shipping.
- Real-time chat.
- Multi-party trades.
- AI-generated fairness claims.
- A microservice per module.
- Redis/Kafka/Elasticsearch/Kubernetes without measured need.
- Exhaustive combinatorial optimization.
- More than one seller integration before the provider contract is validated.

## 14. Architecture decision triggers

Architecture changes require recorded evidence:

| Decision | Trigger |
| --- | --- |
| Add PostgreSQL | Required before durable multi-user proposals |
| Add PostGIS | Radius search is approved and city/region filtering is insufficient |
| Add Redis/BullMQ | Work must survive requests, retry, schedule, or isolate CPU/I/O |
| Add read model | Indexed normalized SQL cannot meet measured discovery/match latency |
| Extract pricing | Provider workload needs independent scaling/reliability |
| Extract matching | CPU workload harms API latency or needs a different runtime |
| Add event broker | Transactional outbox throughput/consumer count outgrows direct delivery |
| Add OR-Tools | Bounded heuristic quality is measured as insufficient for adopted workflows |

## 15. Reference patterns

- Medusa’s module/workflow architecture informs capability boundaries and cross-module orchestration without requiring separate services.
- BullMQ is a candidate for durable Node background work only after asynchronous price or matching workloads are measured.
- Google OR-Tools is a future optimization-worker candidate, not an MVP dependency.
- Stripe/GitHub REST conventions inform idempotency, pagination, versioning, and consistent errors.

These are architectural references, not dependencies selected for the MVP.
