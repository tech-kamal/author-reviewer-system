import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const createInitialAdmin = async (): Promise<void> => {
  try {
    const adminName = process.env.ADMIN_NAME?.trim();
    const adminEmail = process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Admin credentials are required only for initial setup
    if (!adminName || !adminEmail || !adminPassword) {
      console.log(
        "Initial admin setup skipped: ADMIN_NAME, ADMIN_EMAIL or ADMIN_PASSWORD is missing."
      );
      return;
    }

    // Check whether an admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
      },
    });

    if (existingAdmin) {
      console.log(
        `Initial admin setup skipped: Admin already exists (${existingAdmin.email}).`
      );
      return;
    }

    // Check whether the configured email already belongs to another user
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (existingUser) {
      console.log(
        `Initial admin setup skipped: ${adminEmail} is already registered with role ${existingUser.role}.`
      );
      return;
    }

    const passwordHash = await bcrypt.hash(
      adminPassword,
      12
    );

    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(
      `Initial admin created successfully: ${admin.email}`
    );
  } catch (error) {
    console.error(
      "Failed to create initial admin:",
      error
    );
  }
};