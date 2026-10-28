import { Router } from "express";
import { prisma } from "../../db/prisma.js";
import { z } from "zod";

const router = Router();
const pageSchema = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(25) });

router.get("/subjects", async (_req, res) => {
  const subjects = await prisma.subject.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, slug: true, name: true, description: true } });
  res.json({ data: subjects });
});

router.get("/tutors", async (req, res) => {
  const query = z.object({
    subject: z.string().trim().min(1).max(80).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(12),
  }).parse(req.query);
  const where = {
    status: "PUBLIC" as const,
    ...(query.subject ? { subjects: { some: { subject: { slug: query.subject, isActive: true } } } } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.tutorProfile.findMany({
      where,
      orderBy: { publicName: "asc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: {
        slug: true,
        publicName: true,
        headline: true,
        bio: true,
        yearsExperience: true,
        mode: true,
        subjects: { where: { subject: { isActive: true } }, select: { subject: { select: { slug: true, name: true } } } },
      },
    }),
    prisma.tutorProfile.count({ where }),
  ]);
  res.json({ data: items, pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } });
});

export default router;
