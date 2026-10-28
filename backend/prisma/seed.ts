import "dotenv/config";
import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to seed the database.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

const subjects = [
  ["mathematics", "Mathematics"],
  ["english", "English"],
  ["science", "Science"],
  ["biology", "Biology"],
  ["chemistry", "Chemistry"],
  ["physics", "Physics"],
] as const;

try {
  for (const [slug, name] of subjects) {
    await prisma.subject.upsert({ where: { slug }, update: { name, isActive: true }, create: { slug, name } });
  }

  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 14) throw new Error("BOOTSTRAP_ADMIN_PASSWORD must be at least 14 characters.");
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await prisma.user.upsert({
      where: { email },
      update: { displayName: "Wisey Administrator", passwordHash, role: "OWNER", status: "ACTIVE" },
      create: { email, displayName: "Wisey Administrator", passwordHash, role: "OWNER", status: "ACTIVE" },
    });
    console.info("Bootstrap owner account created or updated.");
  } else {
    console.info("No bootstrap owner configured; set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD to create one.");
  }
} finally {
  await prisma.$disconnect();
}
