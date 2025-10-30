import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Generates a secure random invite token.
 * @returns {string} A hex string token.
 */
function generateInviteToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validates an email address using a simple regex.
 * @param {string} email The email address to validate.
 * @returns {boolean} True if the email is valid.
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Creates a Nodemailer transporter using environment variables.
 * @returns {import("nodemailer").Transporter} A Nodemailer transporter.
 */
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Builds an invitation link using the invite token.
 * @param {string} inviteToken The generated invite token.
 * @returns {string} The full invitation URL.
 */
function buildInviteLink(inviteToken) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  return `${baseUrl}/register?invite=${inviteToken}`;
}

/**
 * POST /api/invite
 * Only accessible to admin users.
 * Sends an invitation email for a governmentDepartment user.
 */
export async function POST(request) {
  try {
    // Retrieve the NextAuth session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse and validate the request body
    const { email: inviteEmail, role = "governmentDepartment" } =
      await request.json();
    if (!inviteEmail || !isValidEmail(inviteEmail)) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    // Generate a secure invitation token and build the invitation link
    const inviteToken = generateInviteToken();
    const inviteLink = buildInviteLink(inviteToken);

    // Store the invite token in the database (valid for 7 days)
    await prisma.invite.create({
      data: {
        token: inviteToken,
        email: inviteEmail,
        role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days validity
      },
    });

    // Create a Nodemailer transporter
    const transporter = createTransporter();

    // Compose the invitation email
    const mailOptions = {
      from: `"ReportNow" <${process.env.SMTP_FROM}>`,
      to: inviteEmail,
      subject: "You're Invited to Join as a Government Department User",
      text: `Hello,

You have been invited to join our platform as a Government Department user.
Please register using the following link:
${inviteLink}

Role: ${role}

If you did not expect this invitation, please disregard this email.`,
      html: `<p>Hello,</p>
<p>You have been invited to join our platform as a <strong>Government Department</strong> user.</p>
<p>Please register using the following link: <a href="${inviteLink}">${inviteLink}</a></p>
<p>Role: ${role}</p>
<p>If you did not expect this invitation, please disregard this email.</p>`,
    };

    // Send the invitation email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Invitation sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing invitation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
