import express from "express";
import { parseIntent, sanitizeInput } from "../services/intentParser.js";
import { recommend } from "../services/recommendationEngine.js";
const parseBodyInput = (body) => {
    if (typeof body !== "object" || body === null) {
        throw new Error("Request body must be an object.");
    }
    const candidate = body.input;
    return sanitizeInput(candidate);
};
const sendBadRequest = (response, message) => {
    const payload = {
        message,
        code: "BAD_REQUEST"
    };
    response.status(400).json(payload);
};
export const recommendationRouter = express.Router();
recommendationRouter.post("/parse-intent", (request, response) => {
    try {
        const input = parseBodyInput(request.body);
        const parsed = parseIntent(input);
        response.json(parsed);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Invalid input.";
        sendBadRequest(response, message);
    }
});
recommendationRouter.post("/recommend", (request, response) => {
    try {
        const input = parseBodyInput(request.body);
        const parsed = parseIntent(input);
        const recommendation = recommend(parsed);
        response.json(recommendation);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Invalid input.";
        sendBadRequest(response, message);
    }
});
