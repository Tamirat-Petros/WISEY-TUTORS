import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { ZodError } from "zod";
import { HttpError } from "./http-error.js";
import { logger } from "./logger.js";

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "The requested resource was not found." } });
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (res.headersSent) return;
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Please check the submitted information.", details: error.issues.map(({ path, message }) => ({ path, message })) } });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    res.status(409).json({ error: { code: "CONFLICT", message: "A record with those details already exists." } });
    return;
  }
  logger.error({ err: error, requestId: req.id, method: req.method, path: req.path }, "Unhandled request error");
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." } });
}
