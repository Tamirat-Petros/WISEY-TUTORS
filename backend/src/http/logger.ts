import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "req.body.password", "req.body.token"],
    censor: "[REDACTED]",
  },
  base: { service: "wisey-tutors-api", environment: env.NODE_ENV },
});
