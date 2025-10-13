// src\app\api\auth\auth-register\route.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Simple email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate invite token if provided.
 * If valid, mark the invite as used and return the role.
 * Otherwise, return null.
 */
async function validateInviteToken(inviteToken, inviteEmail) {
  // Look up the invite by token and matching email.
  const invite = await prisma.invite.findUnique({
    where: { token: inviteToken },
  });
  if (!invite) return null;

  // Check if the invite is expired or already used.
  if (new Date() > invite.expiresAt || invite.used) return null;

  // Optionally: Ensure the invite email matches the email in registration.
  if (invite.email.toLowerCase() !== inviteEmail.toLowerCase()) return null;

  // Mark the invite as used.
  await prisma.invite.update({
    where: { token: inviteToken },
    data: { used: true },
  });

  return invite.role;
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, password, contactNumber, inviteToken } = data;

    // Validate input fields
    if (!name || !email || !password || !contactNumber) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine user role based on invite token if provided
    let role = "citizen"; // default role
    if (inviteToken) {
      const invitedRole = await validateInviteToken(inviteToken, email);
      if (!invitedRole) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired invite token" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      role = invitedRole;
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user in the database, including the role
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        contactNumber,
        role, // assign the role (e.g., "governmentDepartment" or "user")
      },
    });

    return new Response(
      JSON.stringify({ message: "User created successfully", user: newUser }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}