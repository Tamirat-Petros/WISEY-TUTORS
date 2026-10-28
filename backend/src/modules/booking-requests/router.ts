import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { submissionRateLimit } from "../../http/middleware/rate-limit.js";
import { z } from "zod";

const router = Router();
const bookingRequestSchema = z.strictObject({
  contactName: z.string().trim().min(2).max(120),
  email: z.email().trim().max(254),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  learnerAgeGroup: z.enum(["CHILD", "TEEN", "ADULT", "PREFER_NOT_TO_SAY"]),
  subjectInterest: z.string().trim().min(2).max(120),
  curriculum: z.string().trim().max(120).optional(),
  mode: z.enum(["ONLINE", "IN_PERSON", "EITHER"]).default("EITHER"),
  timezone: z.string().trim().min(1).max(64),
  preferredStart: z.iso.datetime({ offset: true }).optional(),
  preferredEnd: z.iso.datetime({ offset: true }).optional(),
  message: z.string().trim().max(3000).optional(),
  privacyConsent: z.literal(true),
  website: z.string().max(0).optional(),
}).refine((value) => !value.preferredStart || !value.preferredEnd || new Date(value.preferredEnd) > new Date(value.preferredStart), {
  path: ["preferredEnd"],
  message: "The preferred end time must be after the preferred start time.",
});

router.post("/", submissionRateLimit, async (req, res) => {
  const input = bookingRequestSchema.parse(req.body);
  const request = await prisma.bookingRequest.create({
    data: {
      contactName: input.contactName,
      email: input.email.toLowerCase(),
      phone: input.phone || null,
      learnerAgeGroup: input.learnerAgeGroup,
      subjectInterest: input.subjectInterest,
      curriculum: input.curriculum || null,
      mode: input.mode,
      timezone: input.timezone,
      preferredStart: input.preferredStart ? new Date(input.preferredStart) : null,
      preferredEnd: input.preferredEnd ? new Date(input.preferredEnd) : null,
      message: input.message || null,
      privacyConsentAt: new Date(),
    },
    select: { id: true, status: true, createdAt: true },
  });
  res.status(201).json({ data: request });
});

export default router;
