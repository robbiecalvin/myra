import assert from "node:assert/strict";
import test from "node:test";
import { sortStoresForPlacement } from "../services/rankingService.js";

test("sortStoresForPlacement ranks premium first then distance", () => {
  const ranked = sortStoresForPlacement([
    {
      storeId: "1",
      name: "Free Near",
      address: "A",
      city: "City",
      province: "BC",
      postalCode: "V1",
      latitude: 0,
      longitude: 0,
      subscriptionTier: "free",
      subscriptionStatus: "active",
      distanceKm: 1,
      inStock: true,
      price: 20
    },
    {
      storeId: "2",
      name: "Premium Far",
      address: "B",
      city: "City",
      province: "BC",
      postalCode: "V2",
      latitude: 0,
      longitude: 0,
      subscriptionTier: "premium",
      subscriptionStatus: "active",
      distanceKm: 8,
      inStock: true,
      price: 22
    },
    {
      storeId: "3",
      name: "Premium Near",
      address: "C",
      city: "City",
      province: "BC",
      postalCode: "V3",
      latitude: 0,
      longitude: 0,
      subscriptionTier: "premium",
      subscriptionStatus: "active",
      distanceKm: 3,
      inStock: true,
      price: 21
    }
  ]);

  assert.equal(ranked[0]?.storeId, "3");
  assert.equal(ranked[1]?.storeId, "2");
  assert.equal(ranked[2]?.storeId, "1");
});
