import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error(
      "ADMIN_PASSWORD is not defined in environment variables"
    );
  }

  const hashedPassword = await bcrypt.hash(
    adminPassword,
    10
  );

  const admin = await prisma.user.upsert({
    where: {
      email: process.env.ADMIN_EMAIL!,
    },
    update: {},
    create: {
      name: process.env.ADMIN_NAME!,
      email: process.env.ADMIN_EMAIL!,
      passwordHash: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created/verified:");
  console.log({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });