import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { recommendationRouter } from "./routes/recommendationRoutes.js";
const app = express();
const port = Number.parseInt(process.env.PORT ?? "4000", 10);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(morgan("dev"));
app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
});
app.use(recommendationRouter);
app.use((error, _request, response, _next) => {
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
