# Myra verification guide

## Backend

From `backend/`, install dependencies using the repository lockfile where present, then run:

```sh
npm run lint
npm run build
npm test
```

The test script runs compiled tests under `dist/tests/`; build before testing. The ranking service test uses fictional retailers to check premium placement and distance ordering.

## Additional acceptance checks

Use disposable data to verify input validation, recommendation constraints, inventory import, authentication and payment integration in test mode. Evaluate recommendation relevance separately from retailer placement rules. Never use production credentials or customer records for fixtures.

No tests were executed as part of this documentation update.
