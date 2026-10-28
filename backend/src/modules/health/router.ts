import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../http/http-error.js";

const router = Router();
router.get("/live", (_req, res) => res.json({ data: { status: "ok", service: "wisey-tutors-api" } }));
router.get("/ready", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ data: { status: "ready", service: "wisey-tutors-api" } });
  } catch {
    next(new HttpError(503, "DATABASE_UNAVAILABLE", "The service is temporarily unavailable."));
  }
});
export default router;
