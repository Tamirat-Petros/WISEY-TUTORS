import { rateLimit } from "express-rate-limit";
import { env } from "../../config/env.js";

export const apiRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many requests. Please try again shortly." } },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60_000,
  limit: env.NODE_ENV === "production" ? 8 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many sign-in attempts. Please try again later." } },
});

export const submissionRateLimit = rateLimit({
  windowMs: 60 * 60_000,
  limit: env.NODE_ENV === "production" ? 8 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many submissions. Please try again later." } },
});
