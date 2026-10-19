import "dotenv/config";

import bcrypt from "bcryptjs";

import prisma from "../prisma";

import { Role } from "@prisma/client";

// ============================================
// Create Initial Admin
// ============================================

async function createAdmin() {
  try {
    console.log(
      "========== CREATE ADMIN =========="
    );

    // ============================================
    // Get Admin Credentials from Environment
    // ============================================

    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    // ============================================
    // Validate Environment Variables
    // ============================================

    if (!name || !email || !password) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required in .env"
      );
    }

    // ============================================
    // Normalize Data
    // ============================================

    const normalizedName = name.trim();
    const normalizedEmail =
      email.toLowerCase().trim();

    // ============================================
    // Validate Name
    // ============================================

    if (normalizedName.length < 2) {
      throw new Error(
        "ADMIN_NAME must be at least 2 characters"
      );
    }

    // ============================================
    // Validate Email
    // ============================================

    if (!normalizedEmail.includes("@")) {
      throw new Error(
        "ADMIN_EMAIL must be a valid email address"
      );
    }

    // ============================================
    // Validate Password
    // ============================================

    if (password.length < 6) {
      throw new Error(
        "ADMIN_PASSWORD must be at least 6 characters"
      );
    }

    // ============================================
    // Check Existing User
    // ============================================

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    // ============================================
    // Existing User Found
    // ============================================

    if (existingUser) {
      console.log(
        `User already exists: ${normalizedEmail}`
      );

      if (existingUser.role === Role.ADMIN) {
        console.log(
          "This user is already an ADMIN."
        );
      } else {
        console.log(
          `This email belongs to a ${existingUser.role}.`
        );

        console.log(
          "Admin account was not created."
        );
      }

      return;
    }

    // ============================================
    // Hash Password
    // ============================================

    const passwordHash =
      await bcrypt.hash(password, 12);

    // ============================================
    // Create Admin
    // ============================================

    const admin =
      await prisma.user.create({
        data: {
          name: normalizedName,
          email: normalizedEmail,
          passwordHash,
          role: Role.ADMIN,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

    // ============================================
    // Success
    // ============================================

    console.log(
      "--------------------------------------------"
    );

    console.log(
      "Admin created successfully."
    );

    console.log(
      "--------------------------------------------"
    );

    console.log({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
    });

    console.log(
      "--------------------------------------------"
    );
  } catch (error) {
    // ============================================
    // Error
    // ============================================

    console.error(
      "========== CREATE ADMIN ERROR =========="
    );

    console.error(error);

    process.exitCode = 1;
  } finally {
    // ============================================
    // Disconnect Prisma
    // ============================================

    await prisma.$disconnect();
  }
}

// ============================================
// Run
// ============================================

createAdmin();