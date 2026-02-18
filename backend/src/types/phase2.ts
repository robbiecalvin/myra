export type UserRole = "consumer" | "retailer" | "admin";

export type JwtClaims = {
  sub: string;
  role: UserRole;
  email: string;
};

export type StoreTier = "free" | "premium";

export type StoreRow = {
  store_id: string;
  owner_user_id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  subscription_tier: StoreTier;
  subscription_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
};

export type RankedStore = {
  storeId: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  subscriptionTier: StoreTier;
  subscriptionStatus: string;
  distanceKm: number;
  inStock: boolean;
  price: number | null;
};
