import { jwtVerify } from "jose";
import type { RequestHandler } from "express";
import { env } from "../../config/env.js";
import { HttpError } from "../http-error.js";

export type AuthenticatedUser = { id: string; role: "OWNER" | "ADMIN" | "STAFF" | "TUTOR" };
declare global {
  namespace Express {
    interface Request { auth?: AuthenticatedUser }
  }
}

const secret = new TextEncoder().encode(env.AUTH_ACCESS_SECRET);

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return next(new HttpError(401, "UNAUTHORIZED", "Sign in to continue."));
  try {
    const { payload } = await jwtVerify(header.slice(7), secret, { issuer: env.AUTH_ISSUER, audience: env.AUTH_AUDIENCE });
    if (typeof payload.sub !== "string" || !["OWNER", "ADMIN", "STAFF", "TUTOR"].includes(String(payload.role))) {
      return next(new HttpError(401, "UNAUTHORIZED", "The access token is invalid."));
    }
    req.auth = { id: payload.sub, role: payload.role as AuthenticatedUser["role"] };
    next();
  } catch {
    next(new HttpError(401, "UNAUTHORIZED", "The access token is expired or invalid."));
  }
};

export function requireRoles(...roles: AuthenticatedUser["role"][]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) return next(new HttpError(403, "FORBIDDEN", "You do not have permission to do that."));
    next();
  };
}
