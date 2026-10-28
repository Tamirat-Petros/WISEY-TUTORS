import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { z } from "zod";
import { submissionRateLimit } from "../../http/middleware/rate-limit.js";

const router = Router();
const inquirySchema = z.strictObject({
  contactName: z.string().trim().min(2).max(120),
  email: z.email().trim().max(254),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  learnerAgeGroup: z.enum(["CHILD", "TEEN", "ADULT", "PREFER_NOT_TO_SAY"]),
  subjectInterest: z.string().trim().min(2).max(120),
  message: z.string().trim().min(10).max(3000),
  privacyConsent: z.literal(true),
  website: z.string().max(0).optional(),
});

router.post("/", submissionRateLimit, async (req, res) => {
  const input = inquirySchema.parse(req.body);
  const inquiry = await prisma.inquiry.create({
    data: {
      contactName: input.contactName,
      email: input.email.toLowerCase(),
      phone: input.phone || null,
      learnerAgeGroup: input.learnerAgeGroup,
      subjectInterest: input.subjectInterest,
      message: input.message,
      privacyConsentAt: new Date(),
    },
    select: { id: true, status: true, createdAt: true },
  });
  res.status(201).json({ data: inquiry });
});

export default router;
