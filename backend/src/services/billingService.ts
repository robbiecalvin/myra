import Stripe from "stripe";
import { env } from "../config/env.js";
import { dbPool } from "../db/pool.js";

const stripeClient = (): Stripe => {
  if (!env.stripeSecretKey) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
  return new Stripe(env.stripeSecretKey);
};

export const createCheckoutSession = async (storeId: string, customerEmail: string): Promise<string> => {
  if (!env.stripePriceId) {
    throw new Error("STRIPE_PRICE_ID is not configured.");
  }

  const stripe = stripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: env.stripePriceId, quantity: 1 }],
    customer_email: customerEmail,
    success_url: "https://example.com/billing/success",
    cancel_url: "https://example.com/billing/cancel",
    metadata: { storeId }
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session URL.");
  }

  return session.url;
};

export const processStripeEvent = async (event: Stripe.Event): Promise<void> => {
  const pool = dbPool();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const storeId = session.metadata?.storeId;
    if (!storeId) return;

    await pool.query(
      `UPDATE stores
       SET subscription_tier = 'premium',
           subscription_status = 'active',
           stripe_customer_id = $2,
           stripe_subscription_id = $3
       WHERE store_id = $1`,
      [storeId, session.customer?.toString() ?? null, session.subscription?.toString() ?? null]
    );
    return;
  }

  if (event.type === "invoice.payment_failed" || event.type === "customer.subscription.deleted") {
    let subscriptionId: string | null = null;

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const maybeSubscription = (invoice as unknown as { subscription?: string | null }).subscription;
      subscriptionId = maybeSubscription?.toString() ?? null;
    } else {
      const subscription = event.data.object as Stripe.Subscription;
      subscriptionId = subscription.id;
    }

    if (!subscriptionId) return;

    await pool.query(
      `UPDATE stores
       SET subscription_tier = 'free', subscription_status = 'inactive'
       WHERE stripe_subscription_id = $1`,
      [subscriptionId]
    );
  }
};

export const buildStripeEvent = (payload: Buffer, signature: string | undefined): Stripe.Event => {
  if (!env.stripeWebhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }

  const stripe = stripeClient();

  if (!signature) {
    throw new Error("Missing Stripe signature header.");
  }

  return stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
};
