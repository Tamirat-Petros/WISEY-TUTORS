import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_ACCESS_SECRET: z.string().min(32, "AUTH_ACCESS_SECRET must be at least 32 characters"),
  AUTH_ISSUER: z.string().default("wisey-tutors-api"),
  AUTH_AUDIENCE: z.string().default("wisey-tutors-admin"),
  AUTH_ACCESS_TTL_SECONDS: z.coerce.number().int().min(60).max(3600).default(900),
  AUTH_REFRESH_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(14),
  AUTH_SESSION_MAX_DAYS: z.coerce.number().int().min(1).max(180).default(30),
  AUTH_COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),
  FRONTEND_ORIGINS: z.string().default("http://localhost:3000,http://localhost:5173"),
  TRUST_PROXY: z.enum(["true", "false"]).default("false"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", z.treeifyError(parsed.error));
  throw new Error("Environment configuration is invalid. Check backend/.env.example.");
}

export const env = {
  ...parsed.data,
  frontendOrigins: parsed.data.FRONTEND_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
  secureCookies: parsed.data.NODE_ENV === "production",
};


