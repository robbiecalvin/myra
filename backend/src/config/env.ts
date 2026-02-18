const must = (name: string): string => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const optional = (name: string): string | null => {
  const value = process.env[name];
  if (!value || !value.trim()) {
    return null;
  }
  return value.trim();
};

export const env = {
  port: Number.parseInt(process.env.PORT ?? "4000", 10),
  databaseUrl: optional("DATABASE_URL"),
  jwtSecret: optional("JWT_SECRET"),
  stripeSecretKey: optional("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: optional("STRIPE_WEBHOOK_SECRET"),
  stripePriceId: optional("STRIPE_PRICE_ID")
};

export const getJwtSecret = (): string => must("JWT_SECRET");
export const getDatabaseUrl = (): string => must("DATABASE_URL");
