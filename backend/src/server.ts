import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { phase2Router } from "./routes/phase2Routes.js";
import { recommendationRouter } from "./routes/recommendationRoutes.js";

const app = express();
const port = Number.parseInt(process.env.PORT ?? "4000", 10);

app.use(helmet());
app.use(cors());
app.use("/billing/webhook", express.raw({ type: "application/json" }));
app.use((request, response, next) => {
  if (request.path === "/billing/webhook") {
    next();
    return;
  }
  express.json({ limit: "16kb" })(request, response, next);
});
app.use(morgan("dev"));

app.get("/health", (_request: Request, response: Response) => {
  response.json({ status: "ok" });
});

app.use(recommendationRouter);
app.use(phase2Router);

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : "Internal server error.";
  response.status(500).json({
    message,
    code: "INTERNAL_ERROR"
  });
});

app.listen(port, () => {
  // Intentional startup log for container and process manager diagnostics.
  console.log(`Myra backend listening on port ${port}`);
});
