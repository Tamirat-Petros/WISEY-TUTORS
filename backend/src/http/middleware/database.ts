import type { RequestHandler } from "express";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../http-error.js";

export const requireDatabase: RequestHandler = async (_req, _res, next) => {
  try { await prisma.$queryRaw`SELECT 1`; next(); }
  catch { next(new HttpError(503, "DATABASE_UNAVAILABLE", "The service is temporarily unavailable.")); }
};
