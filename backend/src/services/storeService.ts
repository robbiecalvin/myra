import { z } from "zod";
import { dbPool } from "../db/pool.js";
import { sortStoresForPlacement } from "./rankingService.js";
import type { RankedStore, StoreRow } from "../types/phase2.js";

export const updateStoreSchema = z.object({
  name: z.string().min(2).max(120),
  address: z.string().min(2).max(180),
  city: z.string().min(2).max(120),
  province: z.string().min(2).max(120),
  postalCode: z.string().min(2).max(20),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180)
});

export const nearbyQuerySchema = z.object({
  latitude: z.coerce.number().gte(-90).lte(90),
  longitude: z.coerce.number().gte(-180).lte(180),
  radiusKm: z.coerce.number().gt(0).lte(200).default(30),
  productName: z.string().trim().min(1).max(180).optional()
});

const toRadians = (value: number): number => (value * Math.PI) / 180;

const haversineKm = (fromLat: number, fromLng: number, toLat: number, toLng: number): number => {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(toLat - fromLat);
  const lngDelta = toRadians(toLng - fromLng);
  const originLat = toRadians(fromLat);
  const targetLat = toRadians(toLat);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(originLat) * Math.cos(targetLat) * Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const getStoreByOwner = async (ownerUserId: string): Promise<StoreRow | null> => {
  const pool = dbPool();
  const result = await pool.query<StoreRow>("SELECT * FROM stores WHERE owner_user_id = $1", [ownerUserId]);
  return result.rows[0] ?? null;
};

export const updateStoreByOwner = async (ownerUserId: string, payload: z.infer<typeof updateStoreSchema>): Promise<StoreRow> => {
  const pool = dbPool();
  const result = await pool.query<StoreRow>(
    `UPDATE stores
     SET name = $2, address = $3, city = $4, province = $5, postal_code = $6, latitude = $7, longitude = $8
     WHERE owner_user_id = $1
     RETURNING *`,
    [ownerUserId, payload.name, payload.address, payload.city, payload.province, payload.postalCode, payload.latitude, payload.longitude]
  );

  const updated = result.rows[0];
  if (!updated) {
    throw new Error("Store profile not found for retailer.");
  }

  return updated;
};

type StoreSearchRow = {
  store_id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  subscription_tier: "free" | "premium";
  subscription_status: string;
  in_stock: boolean | null;
  price: string | null;
};

export const getNearbyRankedStores = async (params: z.infer<typeof nearbyQuerySchema>): Promise<RankedStore[]> => {
  const pool = dbPool();

  const query = params.productName
    ? `SELECT s.store_id, s.name, s.address, s.city, s.province, s.postal_code, s.latitude, s.longitude,
              s.subscription_tier, s.subscription_status, i.in_stock, i.price::text AS price
       FROM stores s
       LEFT JOIN store_inventory i ON s.store_id = i.store_id AND lower(i.product_name) = lower($1)
       WHERE s.subscription_status = 'active'`
    : `SELECT s.store_id, s.name, s.address, s.city, s.province, s.postal_code, s.latitude, s.longitude,
              s.subscription_tier, s.subscription_status, NULL::boolean AS in_stock, NULL::text AS price
       FROM stores s
       WHERE s.subscription_status = 'active'`;

  const result = params.productName
    ? await pool.query<StoreSearchRow>(query, [params.productName])
    : await pool.query<StoreSearchRow>(query);

  const scored = result.rows
    .map<RankedStore>((row: StoreSearchRow) => {
      const distanceKm = haversineKm(params.latitude, params.longitude, row.latitude, row.longitude);
      return {
        storeId: row.store_id,
        name: row.name,
        address: row.address,
        city: row.city,
        province: row.province,
        postalCode: row.postal_code,
        latitude: row.latitude,
        longitude: row.longitude,
        subscriptionTier: row.subscription_tier,
        subscriptionStatus: row.subscription_status,
        distanceKm,
        inStock: row.in_stock === true,
        price: row.price != null ? Number.parseFloat(row.price) : null
      };
    })
    .filter((store: RankedStore) => store.distanceKm <= params.radiusKm);

  return sortStoresForPlacement(scored);
};

export const requirePremiumStore = async (ownerUserId: string): Promise<StoreRow> => {
  const store = await getStoreByOwner(ownerUserId);
  if (!store) {
    throw new Error("Store profile not found for retailer.");
  }
  if (!(store.subscription_tier === "premium" && store.subscription_status === "active")) {
    throw new Error("Premium subscription required for this action.");
  }
  return store;
};
