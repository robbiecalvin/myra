import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { dbPool } from "../db/pool.js";
import { getJwtSecret } from "../config/env.js";
import type { JwtClaims, StoreRow } from "../types/phase2.js";

export const retailerRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  storeName: z.string().min(2).max(120),
  address: z.string().min(2).max(180),
  city: z.string().min(2).max(120),
  province: z.string().min(2).max(120),
  postalCode: z.string().min(2).max(20),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export type RegisterRetailerInput = z.infer<typeof retailerRegisterSchema>;

type RegisterResult = {
  userId: string;
  store: StoreRow;
  token: string;
};

const signToken = (claims: JwtClaims): string => {
  return jwt.sign(claims, getJwtSecret(), { expiresIn: "12h" });
};

export const registerRetailer = async (input: RegisterRetailerInput): Promise<RegisterResult> => {
  const pool = dbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query<{ user_id: string }>("SELECT user_id FROM users WHERE email = $1", [input.email.toLowerCase()]);
    if (existing.rowCount) {
      throw new Error("A user with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const userResult = await client.query<{ user_id: string }>(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'retailer') RETURNING user_id",
      [input.email.toLowerCase(), passwordHash]
    );

    const userId = userResult.rows[0]?.user_id;
    if (!userId) {
      throw new Error("Failed to create user.");
    }

    const storeResult = await client.query<StoreRow>(
      `INSERT INTO stores (
        owner_user_id, name, address, city, province, postal_code, latitude, longitude, subscription_tier, subscription_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'free','active')
      RETURNING *`,
      [userId, input.storeName, input.address, input.city, input.province, input.postalCode, input.latitude, input.longitude]
    );

    const store = storeResult.rows[0];
    if (!store) {
      throw new Error("Failed to create store profile.");
    }

    await client.query("COMMIT");

    return {
      userId,
      store,
      token: signToken({ sub: userId, role: "retailer", email: input.email.toLowerCase() })
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const login = async (input: z.infer<typeof loginSchema>): Promise<{ token: string; role: string }> => {
  const pool = dbPool();
  const result = await pool.query<{ user_id: string; email: string; role: "consumer" | "retailer" | "admin"; password_hash: string }>(
    "SELECT user_id, email, role, password_hash FROM users WHERE email = $1",
    [input.email.toLowerCase()]
  );

  const user = result.rows[0];
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) {
    throw new Error("Invalid email or password.");
  }

  const token = signToken({
    sub: user.user_id,
    role: user.role,
    email: user.email
  });

  return { token, role: user.role };
};

export const verifyToken = (token: string): JwtClaims => {
  return jwt.verify(token, getJwtSecret()) as JwtClaims;
};
