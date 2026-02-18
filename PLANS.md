# Project: Myra – Pocket Sommelier
# Phase 2: Retailer Infrastructure & SaaS Layer

---

## OBJECTIVE

Expand Myra from a consumer-only recommendation app into a retailer-enabled marketplace platform.

Phase 2 introduces:

- Retailer registration
- Store profiles
- Tiered subscription model
- Inventory upload system
- Priority placement logic
- Analytics dashboard foundation

This phase transforms Myra into a scalable SaaS-ready system.

---

## HIGH-LEVEL GOAL

Enable liquor stores to:

1. Create a store profile (Free Tier)
2. Upgrade to Premium Tier (Monthly Subscription)
3. Upload inventory data
4. Gain priority placement in "Where to Buy" results
5. Receive analytics on user interaction
6. Accept hold requests from users

---

## TECH STACK EXPANSION

Backend:
- Extend existing API (Node.js Express OR Python FastAPI)
- PostgreSQL database (recommended over SQLite for scalability)
- JWT-based authentication
- Role-based access control

Payments:
- Stripe subscription integration
- Webhook handling for subscription updates

Frontend (Mobile):
- Retailer visibility layer added to Results screen
- Store listing UI
- Hold request UI

Frontend (Web Dashboard):
- Separate retailer admin dashboard (React or Next.js)
- Protected routes
- Inventory management interface

---

## DATABASE SCHEMA (PHASE 2)

Create new tables:

### Users
- user_id
- email
- role (consumer | retailer | admin)
- created_at

### Stores
- store_id
- owner_user_id
- name
- address
- city
- province
- postal_code
- latitude
- longitude
- subscription_tier (free | premium)
- subscription_status
- created_at

### Store_Inventory
- inventory_id
- store_id
- product_name
- category
- price
- in_stock (boolean)
- last_updated

### Hold_Requests
- request_id
- store_id
- user_id
- product_name
- status (pending | confirmed | declined)
- created_at

### Store_Analytics
- analytics_id
- store_id
- event_type (view | recommendation_reference | hold_request)
- timestamp

---

## FEATURE SET (PHASE 2)

### 1. Store Registration (Free Tier)

Retailers can:

- Create account
- Register store profile
- Appear on map view
- Be listed under "Stores Near You"

Free Tier Limitations:
- No inventory upload
- No priority ranking
- No hold requests
- No analytics dashboard

---

### 2. Premium Subscription Tier

Monthly recurring payment via Stripe.

Unlocks:

- Inventory upload (CSV format initially)
- Priority placement in results
- "Call Store" button
- Hold request functionality
- Analytics dashboard
- Map highlight styling

Subscription must:
- Automatically downgrade on failed payment
- Update store.subscription_status accordingly

---

### 3. Inventory Upload System

Premium stores can:

- Upload CSV file
- Map CSV fields to system schema
- Validate data
- Replace existing inventory on upload

Inventory must:
- Be searchable
- Be linked to recommendation results

---

### 4. Recommendation Result Enhancement

When user receives recommendation:

If premium store nearby has item in inventory:
- Display store at top
- Show "In Stock Near You"
- Show price
- Show Hold button

If free store:
- Display in standard order
- No in-stock indicator

---

### 5. Hold Request System

User taps "Request Hold".

System must:
- Record request
- Notify retailer dashboard
- Allow retailer to mark:
    - Confirmed
    - Declined

Mobile user must see status updates.

---

### 6. Retailer Dashboard (Web App)

Required features:

- Login system
- Store profile editor
- Inventory upload interface
- Analytics summary:
    - Profile views
    - Recommendation references
    - Hold requests
- Subscription status display

No mobile admin interface required in Phase 2.

---

## PRIORITY PLACEMENT LOGIC

When multiple stores carry same product:

1. Premium tier stores ranked first
2. Within premium tier:
    - Distance-based ordering
3. Free tier stores ranked after

Ranking logic must be abstracted into service layer.

No hardcoded sorting inside UI.

---

## PAYMENT INTEGRATION

Stripe Requirements:

- Monthly subscription product
- Webhook endpoint for:
    - Payment succeeded
    - Payment failed
    - Subscription cancelled
- Secure webhook verification
- Automatic subscription status update

---

## SECURITY REQUIREMENTS

- JWT authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting on API endpoints
- Protected admin routes
- No direct database exposure
- Proper CORS configuration

---

## NON-GOALS (PHASE 2)

Do NOT implement:

- Push notifications
- Promotions engine
- AI personalization per user
- Referral program
- In-app purchases for consumers
- Multi-store chain dashboards
- Deep analytics reporting

These belong to Phase 3.

---

## DELIVERABLES

1. Fully functional retailer registration system
2. Stripe subscription integration
3. Inventory upload system
4. Working hold request flow
5. Retailer admin dashboard
6. Updated mobile app with store integration
7. Updated README.md
8. Updated version log
9. Git commit and push

---

## SUCCESS CRITERIA

The system must:

- Allow store creation
- Successfully process subscription payments
- Properly upgrade/downgrade subscription tiers
- Correctly prioritize premium stores
- Handle inventory uploads without crashing
- Record analytics events
- Maintain clean, modular architecture

---

## SCALABILITY NOTES

Design must anticipate:

Future Phase 3 additions:
- Push notifications
- Promo system
- Advanced analytics
- Multi-location store accounts
- API partner access

Structure code accordingly.

---

END OF PHASE 2 SPECIFICATION

# Phase 3: Engagement, Personalization & Growth Infrastructure

---

## OBJECTIVE

Expand Myra into a full engagement-driven platform with:

- Push notifications
- Personalized recommendation memory
- Promotion engine
- Advanced analytics
- Multi-location retailer support
- Event-driven recommendation campaigns

Phase 3 transforms Myra from SaaS tool into growth platform.

---

## HIGH-LEVEL GOAL

Increase:

- User retention
- Retailer subscription value
- Engagement frequency
- Platform intelligence
- Monetization leverage

This phase focuses on growth systems and personalization.

---

## TECH STACK EXPANSION

Mobile:
- Push notification integration (Firebase for Android, APNs for iOS)
- Background task handling
- User preference storage

Backend:
- User profile system
- Promotion engine
- Event scheduling system
- Advanced analytics aggregation
- Notification scheduler

Database:
Extend schema to include:

Users
User_Preferences
User_Activity
Promotions
Store_Locations
Notification_Log

---

## DATABASE EXPANSION

### User_Preferences
- preference_id
- user_id
- preferred_wine_types
- price_range
- preferred_regions
- favorite_stores
- notification_opt_in (boolean)

### User_Activity
- activity_id
- user_id
- event_type (search | recommendation_click | hold_request | store_view)
- metadata (JSON)
- timestamp

### Promotions
- promo_id
- store_id
- title
- description
- discount_type
- start_date
- end_date
- target_audience (all | premium_users | location_based)

### Store_Locations
- location_id
- store_id
- address
- geo_coordinates
- active (boolean)

### Notification_Log
- notification_id
- user_id
- store_id
- type (promo | seasonal | recommendation)
- sent_at
- status

---

## FEATURE SET (PHASE 3)

---

### 1. Push Notification Engine

Allow:

- Seasonal recommendations
- "Dinner Tonight?" prompts
- Holiday suggestions
- Store promotions
- Restock alerts

Users must:
- Opt in explicitly
- Control notification types in settings

Notifications must:
- Be rate limited
- Be scheduled intelligently
- Avoid spam patterns

---

### 2. Personalized Recommendation Layer

Add:

- Save favorite wines
- Save favorite styles
- Recommendation refinement over time
- Basic user taste profiling

AI logic must:
- Incorporate user preference history
- Adjust recommendation weighting
- Remain explainable

No black-box personalization.

---

### 3. Promotion Engine (Retailer Premium+)

Premium+ subscription tier unlocks:

- Create time-bound promotions
- Highlight specific products
- Push promo notifications
- Appear in "Featured Near You" section

Promotion logic must:
- Validate date ranges
- Auto-expire
- Prevent stacking abuse

---

### 4. Advanced Retailer Analytics

Dashboard must include:

- Search appearances
- Recommendation references
- Hold conversion rate
- Promo engagement
- Click-to-call tracking

Provide:

- Daily
- Weekly
- Monthly summaries

Data must be aggregated, not raw log dumps.

---

### 5. Multi-Location Store Support

Allow:

- Single retailer account
- Multiple store branches
- Per-location inventory
- Per-location analytics

Stores must:
- Be selectable based on proximity
- Support location-based promotions

---

### 6. Event-Driven Campaign System

Implement event templates:

- Valentine’s Day
- Christmas
- Thanksgiving
- Summer BBQ
- New Year’s Eve

System must:

- Automatically generate themed recommendation campaigns
- Allow retailers to opt into campaigns
- Push event-specific suggestions to users

Campaign logic must be modular and reusable.

---

## SUBSCRIPTION TIERS (UPDATED)

Free:
- Basic store listing

Premium:
- Inventory upload
- Priority ranking
- Hold requests
- Analytics dashboard

Premium+:
- Promotion engine
- Push campaigns
- Featured placement
- Multi-location support
- Advanced analytics

Subscription management must support tier upgrades/downgrades.

---

## SECURITY REQUIREMENTS

- Notification authentication
- Promotion validation
- Rate limiting
- Abuse prevention
- Encrypted user data storage
- GDPR-compliant opt-out system

---

## NON-GOALS (PHASE 3)

Do NOT implement:

- Social feed
- User-to-user messaging
- In-app marketplace checkout
- Crypto payments
- NFT wine certificates
- Loyalty point systems

These are distractions.

---

## DELIVERABLES

1. Push notification system fully operational
2. User preference personalization layer
3. Promotion engine implemented
4. Updated retailer dashboard
5. Multi-location store support
6. Subscription tier expansion
7. Updated API documentation
8. Updated mobile UI
9. Version update log
10. Git commit and push

---

## SUCCESS CRITERIA

The system must:

- Retain users via intelligent notifications
- Increase retailer value perception
- Provide measurable analytics
- Maintain clean architecture
- Remain scalable
- Avoid feature clutter

---

## SCALABILITY NOTES

Prepare architecture for:

- API public access
- Partner integrations
- Restaurant integrations
- White-label opportunities

All code must remain modular and maintainable.

---

END OF PHASE 3 SPECIFICATION