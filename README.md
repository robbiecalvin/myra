# Myra (Phase 1) - Pocket Sommelier

Myra Phase 1 is a production-ready mobile-first recommendation experience with an inventory-neutral backend.

## Version

Current version: `v0.2`

## What's New

- React Native (Expo + TypeScript strict) mobile app scaffold in `/mobile`
- Node.js + Express backend API in `/backend`
- Free-form recommendation flow with structured top 3 results (`POST /recommend`)
- Intent parsing endpoint (`POST /parse-intent`)
- Mobile screens implemented: Splash, Home, Results, History, Settings
- Local recommendation history storage on device
- Optional location permission flow with Google Maps handoff
- Removed specific retailer and `myrabottle.png` references from the primary web entry file
- Security increment: upgraded mobile stack to Expo SDK 54 with React 19 / React Native 0.81
- Mobile dependency vulnerability scan now passes with no high-severity findings

## Project Layout

- `/mobile` - React Native app (Expo)
- `/backend` - Express REST API
- `/data` - legacy web dataset files (not used by Phase 1 backend)

## API Contract

### `POST /parse-intent`

Request body:

```json
{
  "input": "I need a $30 red wine for steak tonight."
}
```

Response:

```json
{
  "budget": 30,
  "style": "red",
  "region": "any",
  "occasion": "dinner"
}
```

### `POST /recommend`

Request body:

```json
{
  "input": "I need a $30 red wine for steak tonight."
}
```

Response shape:

```json
{
  "budget": 30,
  "style": "red",
  "occasion": "dinner",
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
```

## Local Development

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Backend default URL: `http://localhost:4000`

### 2. Mobile

```bash
cd mobile
npm install
npm run start
```

Set `EXPO_PUBLIC_API_BASE_URL` in `.env` if your backend is not on localhost.

## Verification Commands

```bash
cd backend && npm run lint && npm run build
cd mobile && npm run lint && npm run build
```

## Deployment Notes

- Backend can be deployed to any Node.js host (self-managed VM/container).
- Mobile app is Expo-managed and ready for iOS/Android build workflows.
- Keep `EXPO_PUBLIC_API_BASE_URL` environment-specific per environment.

## Update Report

See: [`myra-v0.2-updates.md`](myra-v0.2-updates.md)
