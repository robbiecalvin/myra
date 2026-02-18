# Project: Myra - Pocket Sommelier
# Phase 2 Next Steps - Retailer Infrastructure & SaaS Layer

---

## Scope

Phase 1 baseline is complete (mobile app + recommendation API + security upgrade to Expo SDK 54).
This document now tracks only remaining Phase 2 work.

---

## Now (highest priority)

### 1. Foundation: Auth, Roles, and Data Model

- Add PostgreSQL integration to backend
- Implement migrations for:
  - `users`
  - `stores`
  - `store_inventory`
  - `hold_requests`
  - `store_analytics`
- Implement JWT auth and role-based access control (`consumer | retailer | admin`)
- Add protected route middleware and request validation standards

Definition of done:
- Authenticated retailer can create and read their own store
- Unauthorized access to retailer/admin routes is blocked
- Migrations run cleanly in local/dev

### 2. Retailer Registration + Store Profiles

- Create backend endpoints for retailer account creation and store profile CRUD
- Add mobile visibility hooks for "Stores Near You" listing data source
- Ensure free-tier defaults are enforced on new store creation

Definition of done:
- Retailer onboarding flow works end-to-end via API
- Store profile persists and updates correctly
- Free-tier restrictions are applied server-side

### 3. Stripe Subscription Integration

- Add Stripe subscription product and checkout/session endpoints
- Implement webhook endpoint with signature verification
- Update `stores.subscription_tier` and `stores.subscription_status` from webhook events
- Add downgrade handling on failed/cancelled subscriptions

Definition of done:
- Test webhook events update subscription state correctly
- Premium features are gated strictly by subscription status

### 4. Inventory Upload (Premium)

- Build CSV upload endpoint for premium stores
- Implement CSV schema mapping + validation
- Replace store inventory atomically on successful upload
- Add query path for recommendation/store matching by in-stock items

Definition of done:
- Valid CSV uploads succeed and replace inventory
- Invalid CSV uploads fail with explicit errors
- Inventory is queryable by recommendation result logic

### 5. Priority Placement Logic

- Implement ranking service in backend (no UI sorting logic):
  - Premium stores first
  - Distance ordering within premium
  - Free-tier stores afterwards
- Expose ranked store results endpoint for mobile consumption

Definition of done:
- Ranking outputs deterministic order per rules
- Service is unit-tested and isolated from UI

---

## Soon

### 6. Hold Request Flow

- Backend: create/list/update hold requests (`pending | confirmed | declined`)
- Retailer-side endpoints for processing requests
- Consumer-side mobile integration for request status display

### 7. Retailer Dashboard (Web)

- Scaffold separate web dashboard app
- Add login, store profile editor, inventory upload UI, hold request management
- Add subscription status visibility

### 8. Analytics Event Pipeline (Phase 2 baseline)

- Record events for:
  - store profile views
  - recommendation references
  - hold requests
- Add retailer-facing summary endpoints

---

## Later (Phase 2 completion hardening)

### 9. Security hardening and operational controls

- API rate limiting on sensitive endpoints
- CORS policy tightening by environment
- Input validation audits for all new endpoints
- Secrets/config review for Stripe and JWT

### 10. Integration testing + release readiness

- End-to-end tests for registration -> subscription -> inventory -> ranking -> hold flow
- Dashboard/backend contract tests
- Production deployment runbook updates

---

## Non-goals (do not implement in this phase)

- Push notifications
- Promotion engine
- AI personalization per user
- Referral systems
- Multi-store chain dashboards
- Deep analytics reporting

---

## Deliverables for Phase 2 completion

1. Retailer registration system
2. Stripe subscriptions + webhook state sync
3. Premium inventory upload system
4. Priority placement in store results
5. Hold request workflow
6. Retailer dashboard (web)
7. Updated README and version report
8. Verified lint/test/build/security checks
9. Git commit and push
