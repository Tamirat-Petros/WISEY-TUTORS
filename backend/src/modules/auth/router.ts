import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import { SignJWT } from "jose";
import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../http/http-error.js";
import { authRateLimit } from "../../http/middleware/rate-limit.js";

const router = Router();
const secret = new TextEncoder().encode(env.AUTH_ACCESS_SECRET);
const refreshCookieName = "wisey_refresh";
const refreshCookiePath = "/api/v1/auth";
const refreshTtlMs = env.AUTH_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;
const maxSessionMs = env.AUTH_SESSION_MAX_DAYS * 24 * 60 * 60 * 1000;
const loginSchema = z.strictObject({ email: z.email().max(254), password: z.string().min(1).max(256) });
const dummyPasswordHash = await argon2.hash(randomBytes(32), { type: argon2.argon2id });

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function issueRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

async function issueAccessToken(user: { id: string; role: string }): Promise<string> {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuer(env.AUTH_ISSUER)
    .setAudience(env.AUTH_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${env.AUTH_ACCESS_TTL_SECONDS}s`)
    .sign(secret);
}

function setRefreshCookie(res: Parameters<RequestHandler>[1], token: string, expiresAt: Date): void {
  res.cookie(refreshCookieName, token, {
    httpOnly: true,
    secure: env.secureCookies,
    sameSite: env.AUTH_COOKIE_SAME_SITE,
    path: refreshCookiePath,
    maxAge: Math.max(0, expiresAt.getTime() - Date.now()),
  });
}

function clearRefreshCookie(res: Parameters<RequestHandler>[1]): void {
  res.clearCookie(refreshCookieName, {
    httpOnly: true,
    secure: env.secureCookies,
    sameSite: env.AUTH_COOKIE_SAME_SITE,
    path: refreshCookiePath,
  });
}

function getRefreshCookie(req: Parameters<RequestHandler>[0]): string | undefined {
  const value = req.cookies?.[refreshCookieName];
  return typeof value === "string" ? value : undefined;
}

async function createRefreshSession(userId: string, req: Parameters<RequestHandler>[0]): Promise<{ token: string; expiresAt: Date }> {
  const now = Date.now();
  const token = issueRefreshToken();
  const familyExpiresAt = new Date(now + maxSessionMs);
  const expiresAt = new Date(Math.min(now + refreshTtlMs, familyExpiresAt.getTime()));
  await prisma.refreshSession.create({
    data: {
      userId,
      familyId: randomBytes(24).toString("base64url"),
      familyExpiresAt,
      tokenHash: hashToken(token),
      expiresAt,
      userAgent: req.get("user-agent")?.slice(0, 512) ?? null,
      ipAddress: req.ip?.slice(0, 64) ?? null,
    },
  });
  return { token, expiresAt };
}

const sameOriginForCookie: RequestHandler = (req, _res, next) => {
  const origin = req.get("origin");
  if (!origin || !env.frontendOrigins.includes(origin)) return next(new HttpError(403, "ORIGIN_NOT_ALLOWED", "This request origin is not allowed."));
  next();
};

router.post("/login", authRateLimit, async (req, res) => {
  const input = loginSchema.parse(req.body);
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordIsValid = await argon2.verify(user?.passwordHash ?? dummyPasswordHash, input.password).catch(() => false);

  if (!user || !passwordIsValid || user.status !== "ACTIVE") {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  const session = await createRefreshSession(user.id, req);
  res.setHeader("Cache-Control", "no-store");
  setRefreshCookie(res, session.token, session.expiresAt);
  res.status(200).json({
    data: {
      accessToken: await issueAccessToken(user),
      tokenType: "Bearer",
      expiresIn: env.AUTH_ACCESS_TTL_SECONDS,
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    },
  });
});

router.post("/refresh", sameOriginForCookie, async (req, res) => {
  const token = getRefreshCookie(req);
  if (!token) throw new HttpError(401, "SESSION_EXPIRED", "Sign in again to continue.");

  const existing = await prisma.refreshSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  const now = new Date();
  if (!existing || existing.revokedAt || existing.expiresAt <= now || existing.familyExpiresAt <= now || existing.user.status !== "ACTIVE") {
    if (existing) {
      await prisma.refreshSession.updateMany({ where: { familyId: existing.familyId, revokedAt: null }, data: { revokedAt: now } });
    }
    clearRefreshCookie(res);
    throw new HttpError(401, "SESSION_EXPIRED", "Sign in again to continue.");
  }

  const nextToken = issueRefreshToken();
  const nextExpiresAt = new Date(Math.min(Date.now() + refreshTtlMs, existing.familyExpiresAt.getTime()));
  const rotated = await prisma.$transaction(async (tx) => {
    const revoked = await tx.refreshSession.updateMany({
      where: { id: existing.id, revokedAt: null, expiresAt: { gt: now }, familyExpiresAt: { gt: now } },
      data: { revokedAt: now },
    });
    if (revoked.count !== 1) return false;
    await tx.refreshSession.create({
      data: {
        userId: existing.userId,
        familyId: existing.familyId,
        familyExpiresAt: existing.familyExpiresAt,
        tokenHash: hashToken(nextToken),
        expiresAt: nextExpiresAt,
        userAgent: req.get("user-agent")?.slice(0, 512) ?? null,
        ipAddress: req.ip?.slice(0, 64) ?? null,
      },
    });
    return true;
  });
  if (!rotated) {
    await prisma.refreshSession.updateMany({ where: { familyId: existing.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
    clearRefreshCookie(res);
    throw new HttpError(401, "SESSION_EXPIRED", "Sign in again to continue.");
  }

  res.setHeader("Cache-Control", "no-store");
  setRefreshCookie(res, nextToken, nextExpiresAt);
  res.status(200).json({
    data: {
      accessToken: await issueAccessToken(existing.user),
      tokenType: "Bearer",
      expiresIn: env.AUTH_ACCESS_TTL_SECONDS,
      user: { id: existing.user.id, email: existing.user.email, displayName: existing.user.displayName, role: existing.user.role },
    },
  });
});

router.post("/logout", sameOriginForCookie, async (req, res) => {
  const token = getRefreshCookie(req);
  if (token) {
    const session = await prisma.refreshSession.findUnique({ where: { tokenHash: hashToken(token) }, select: { familyId: true } });
    if (session) {
      await prisma.refreshSession.updateMany({ where: { familyId: session.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
    }
  }
  clearRefreshCookie(res);
  res.status(204).end();
});

export default router;



