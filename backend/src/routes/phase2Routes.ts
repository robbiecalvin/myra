import express, { type Request, type Response, type Router } from "express";
import multer from "multer";
import { ZodError, z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { login, loginSchema, registerRetailer, retailerRegisterSchema } from "../services/authService.js";
import { buildStripeEvent, createCheckoutSession, processStripeEvent } from "../services/billingService.js";
import { parseBody, parseQuery } from "../services/httpValidation.js";
import { replaceInventoryFromCsv } from "../services/inventoryService.js";
import {
  getNearbyRankedStores,
  getStoreByOwner,
  nearbyQuerySchema,
  requirePremiumStore,
  updateStoreByOwner,
  updateStoreSchema
} from "../services/storeService.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 } });

const toErrorResponse = (response: Response, error: unknown): void => {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Validation failed.",
      code: "BAD_REQUEST",
      details: error.issues
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Request failed.";
  const status = /not found/i.test(message)
    ? 404
    : /unauthorized|invalid|missing bearer|expired/i.test(message)
      ? 401
      : /permission|forbidden|required/i.test(message)
        ? 403
        : 400;

  response.status(status).json({ message, code: status === 400 ? "BAD_REQUEST" : "REQUEST_ERROR" });
};

export const phase2Router: Router = express.Router();

phase2Router.post("/auth/register-retailer", async (request: Request, response: Response) => {
  try {
    const payload = parseBody(retailerRegisterSchema, request.body);
    const result = await registerRetailer(payload);
    response.status(201).json({
      userId: result.userId,
      storeId: result.store.store_id,
      token: result.token,
      role: "retailer"
    });
  } catch (error) {
    toErrorResponse(response, error);
  }
});

phase2Router.post("/auth/login", async (request: Request, response: Response) => {
  try {
    const payload = parseBody(loginSchema, request.body);
    const result = await login(payload);
    response.json(result);
  } catch (error) {
    toErrorResponse(response, error);
  }
});

phase2Router.get("/retailer/store", requireAuth, requireRole(["retailer"]), async (request: Request, response: Response) => {
  try {
    const store = await getStoreByOwner(request.user!.sub);
    if (!store) {
      response.status(404).json({ message: "Store profile not found.", code: "NOT_FOUND" });
      return;
    }
    response.json(store);
  } catch (error) {
    toErrorResponse(response, error);
  }
});

phase2Router.put("/retailer/store", requireAuth, requireRole(["retailer"]), async (request: Request, response: Response) => {
  try {
    const payload = parseBody(updateStoreSchema, request.body);
    const store = await updateStoreByOwner(request.user!.sub, payload);
    response.json(store);
  } catch (error) {
    toErrorResponse(response, error);
  }
});

phase2Router.post(
  "/retailer/inventory/upload",
  requireAuth,
  requireRole(["retailer"]),
  upload.single("file"),
  async (request: Request, response: Response) => {
    try {
      const file = request.file;
      if (!file) {
        response.status(400).json({ message: "CSV file is required.", code: "BAD_REQUEST" });
        return;
      }

      const store = await requirePremiumStore(request.user!.sub);
      const content = file.buffer.toString("utf8");
      const result = await replaceInventoryFromCsv(store.store_id, content);
      response.json({ storeId: store.store_id, replaced: result.replaced });
    } catch (error) {
      toErrorResponse(response, error);
    }
  }
);

phase2Router.get("/stores/nearby", async (request: Request, response: Response) => {
  try {
    const query = parseQuery(nearbyQuerySchema, request.query);
    const stores = await getNearbyRankedStores(query);
    response.json({ count: stores.length, stores });
  } catch (error) {
    toErrorResponse(response, error);
  }
});

phase2Router.post("/billing/create-checkout-session", requireAuth, requireRole(["retailer"]), async (request: Request, response: Response) => {
  try {
    const payload = parseBody(z.object({ storeId: z.string().uuid() }), request.body);
    const url = await createCheckoutSession(payload.storeId, request.user!.email);
    response.json({ url });
  } catch (error) {
    toErrorResponse(response, error);
  }
});

phase2Router.post("/billing/webhook", async (request: Request, response: Response) => {
  try {
    const event = buildStripeEvent(request.body as Buffer, request.header("stripe-signature"));
    await processStripeEvent(event);
    response.json({ received: true });
  } catch (error) {
    toErrorResponse(response, error);
  }
});
