import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";
import { env } from "./config/env.js";
import { HttpError } from "./http/http-error.js";
import { errorHandler, notFound } from "./http/errors.js";
import { logger } from "./http/logger.js";
import { apiRateLimit } from "./http/middleware/rate-limit.js";
import healthRouter from "./modules/health/router.js";
import apiRouter from "./modules/router.js";

export const app = express();
app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY === "true" ? 1 : false);

app.use(pinoHttp({ logger }));
const openApiSpec = YAML.parse(readFileSync(resolve(process.cwd(), "docs/openapi.yaml"), "utf8"));
// Swagger UI uses inline configuration scripts; disable CSP only for this static docs page.
app.use("/api/docs", helmet({ contentSecurityPolicy: false }), swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }));
app.use(helmet());
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || env.frontendOrigins.includes(origin)) return callback(null, true);
    callback(new HttpError(403, "ORIGIN_NOT_ALLOWED", "This request origin is not allowed."));
  },
}));
app.use(express.json({ limit: "20kb", type: "application/json" }));
app.use(cookieParser());
app.use(apiRateLimit);

app.get("/", (_req, res) => res.json({ data: { name: "Wisey Tutors API", version: "v1", docs: "/api/docs" } }));
app.use("/health", healthRouter);
app.use("/api/v1", apiRouter);
app.use(notFound);
app.use(errorHandler);
