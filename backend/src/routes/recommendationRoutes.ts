import type { Request, Response, Router } from "express";
import express from "express";
import { parseIntent, sanitizeInput } from "../services/intentParser.js";
import { recommend } from "../services/recommendationEngine.js";

type ApiError = {
  message: string;
  code: string;
};

const parseBodyInput = (body: unknown): string => {
  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be an object.");
  }

  const candidate = (body as { input?: unknown }).input;
  return sanitizeInput(candidate);
};

const sendBadRequest = (response: Response, message: string): void => {
  const payload: ApiError = {
    message,
    code: "BAD_REQUEST"
  };
  response.status(400).json(payload);
};

export const recommendationRouter: Router = express.Router();

recommendationRouter.post("/parse-intent", (request: Request, response: Response) => {
  try {
    const input = parseBodyInput(request.body);
    const parsed = parseIntent(input);
    response.json(parsed);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid input.";
    sendBadRequest(response, message);
  }
});

recommendationRouter.post("/recommend", (request: Request, response: Response) => {
  try {
    const input = parseBodyInput(request.body);
    const parsed = parseIntent(input);
    const recommendation = recommend(parsed);
    response.json(recommendation);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid input.";
    sendBadRequest(response, message);
  }
});
