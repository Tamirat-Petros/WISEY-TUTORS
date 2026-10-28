import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { HttpError } from "../../http/http-error.js";
import { requireAuth, requireRoles } from "../../http/middleware/auth.js";
import { z } from "zod";

const router = Router();
router.use(requireAuth, requireRoles("OWNER", "ADMIN", "STAFF"), (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
const pageSchema = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(25) });
const inquiryStatusSchema = z.strictObject({ status: z.enum(["NEW", "CONTACTED", "CONVERTED", "CLOSED"]) });
const bookingStatusSchema = z.strictObject({ status: z.enum(["NEW", "CONTACTED", "OFFERED", "ACCEPTED", "DECLINED", "CLOSED"]) });
const idSchema = z.string().min(1).max(80);

router.get("/inquiries", async (req, res) => {
  const { page, pageSize } = pageSchema.parse(req.query);
  const [items, total] = await prisma.$transaction([
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, contactName: true, email: true, phone: true, learnerAgeGroup: true, subjectInterest: true, message: true, status: true, createdAt: true, updatedAt: true },
    }),
    prisma.inquiry.count(),
  ]);
  res.json({ data: items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

router.patch("/inquiries/:id/status", requireRoles("OWNER", "ADMIN"), async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const { status } = inquiryStatusSchema.parse(req.body);
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.inquiry.updateMany({ where: { id }, data: { status } });
    if (updated.count === 0) throw new HttpError(404, "INQUIRY_NOT_FOUND", "The enquiry was not found.");
    await tx.auditLog.create({ data: { actorId: req.auth!.id, action: "inquiry.status.updated", entityType: "Inquiry", entityId: id, metadata: { status }, ipAddress: req.ip?.slice(0, 64) ?? null } });
    return tx.inquiry.findUniqueOrThrow({ where: { id }, select: { id: true, status: true, updatedAt: true } });
  });
  res.json({ data: result });
});

router.get("/booking-requests", async (req, res) => {
  const { page, pageSize } = pageSchema.parse(req.query);
  const [items, total] = await prisma.$transaction([
    prisma.bookingRequest.findMany({
      orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, contactName: true, email: true, phone: true, learnerAgeGroup: true, subjectInterest: true, curriculum: true, mode: true, timezone: true, preferredStart: true, preferredEnd: true, message: true, status: true, createdAt: true, updatedAt: true },
    }),
    prisma.bookingRequest.count(),
  ]);
  res.json({ data: items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
});

router.patch("/booking-requests/:id/status", requireRoles("OWNER", "ADMIN"), async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const { status } = bookingStatusSchema.parse(req.body);
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.bookingRequest.updateMany({ where: { id }, data: { status } });
    if (updated.count === 0) throw new HttpError(404, "BOOKING_REQUEST_NOT_FOUND", "The booking request was not found.");
    await tx.auditLog.create({ data: { actorId: req.auth!.id, action: "booking_request.status.updated", entityType: "BookingRequest", entityId: id, metadata: { status }, ipAddress: req.ip?.slice(0, 64) ?? null } });
    return tx.bookingRequest.findUniqueOrThrow({ where: { id }, select: { id: true, status: true, updatedAt: true } });
  });
  res.json({ data: result });
});

export default router;



