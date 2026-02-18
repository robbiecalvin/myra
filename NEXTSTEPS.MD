# Project: Myra – Pocket Sommelier
# Phase 1: Mobile App (Consumer-First, Inventory-Neutral)

---

## OBJECTIVE

Build Phase 1 of Myra as a production-ready mobile application using React Native.

This version must:
- Remove all references to Crosstown Liquor or any specific retailer
- Remove myrabottle.png animation
- Operate as a pure AI-powered recommendation engine
- Be inventory-neutral
- Establish clean mobile UX architecture
- Prepare for future SaaS retailer integration (Phase 2)

Phase 1 is focused on:
Product polish
Mobile UX authority
Clean architecture foundation

No retailer monetization logic in this phase.

---

## TECH STACK

Frontend:
- React Native (Expo preferred for faster iteration)
- TypeScript required
- Clean component architecture

Backend:
- Existing Myra AI logic refactored into API endpoints
- Node.js (Express) OR Python (FastAPI)
- RESTful API structure
- Hosted on existing self-managed infrastructure

Data:
- Static curated wine dataset for Phase 1
- No live retailer inventory
- Future-ready schema design for store integration

---

## CORE FEATURES (PHASE 1)

### 1. Free-Form Recommendation Engine

User inputs natural language:
Example:
"I need a $30 red wine for steak tonight."

App must:
- Send input to backend
- Parse intent
- Extract constraints:
    - Budget
    - Wine type
    - Region (if present)
    - Occasion (if present)
- Return top 3 structured recommendations

Display:
- Bottle name
- Region
- Style
- Price range
- Pairing suggestion
- Short reasoning summary

---

### 2. Clean Mobile UX

Must include:

- Minimalist dark or neutral theme
- Smooth transitions
- Keyboard-aware input field
- Scrollable results
- Card-based recommendation layout

No clutter.
No retailer branding.
No ads in Phase 1.

---

### 3. Location Permission (Foundation Only)

Request optional location access.

If granted:
- Display "Find Stores Near You" button
- Use Google Maps API to open nearby liquor stores
- Do NOT integrate specific store data yet

This establishes future retailer positioning.

---

### 4. Recommendation History (Local Only)

Store previous searches locally on device.

Allow:
- View past recommendations
- Tap to re-open results

No cloud account system in Phase 1.

---

### 5. App Structure

Required Screens:

1. Splash Screen
2. Home Screen (Input Field + CTA)
3. Results Screen
4. History Screen
5. Settings Screen

Settings must include:
- Clear privacy note
- Data usage explanation
- App version number

---

## ARCHITECTURE REQUIREMENTS

### Code Standards

- Modular folder structure
- Components separated from logic
- API calls abstracted into service layer
- No inline business logic inside UI components
- Proper error handling
- Loading states implemented
- TypeScript strict mode enabled

---

### Backend Requirements

Create endpoints:

POST /recommend
POST /parse-intent

Response must be structured JSON:
{
  "budget": number,
  "style": string,
  "occasion": string,
  "recommendations": [
      {
          "name": "",
          "region": "",
          "price": "",
          "pairing": "",
          "reason": ""
      }
  ]
}

Must include:
- Input validation
- Sanitization
- Error responses

---

## NON-GOALS (PHASE 1)

Do NOT implement:

- Retailer dashboard
- Store registration
- Payment processing
- Subscription logic
- Inventory uploads
- Priority ranking logic
- Push notifications
- Authentication system

These belong to Phase 2.

---

## DELIVERABLES

1. Fully functional React Native mobile app
2. Running backend API
3. Clean README.md
4. Environment variable configuration file
5. Deployment instructions
6. Version update file documenting changes
7. Git commit and push to repository

---

## SUCCESS CRITERIA

The app must:

- Successfully parse free-form wine requests
- Return structured recommendations
- Handle errors gracefully
- Run on both iOS simulator and Android emulator
- Be visually polished
- Be ready for app store submission preparation

---

## FUTURE-PROOFING NOTES

Database design must anticipate:

Future "Stores" table:
- store_id
- name
- address
- geo_location
- subscription_tier
- inventory_feed

Do not implement yet.
Design with scalability in mind.

---

END OF PHASE 1 SPECIFICATION