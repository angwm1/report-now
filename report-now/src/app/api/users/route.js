// src/app/api/users/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (
      !currentUser ||
      (currentUser.role !== "admin" &&
        currentUser.role !== "superAdmin" &&
        currentUser.role !== "department")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        contactNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // get session
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use email from session instead of ID
    if (!session.user.email) {
      console.error("No user email in session");
      return NextResponse.json(
        { error: "Invalid session data" },
        { status: 401 }
      );
    }

    // get user data from request body
    const data = await request.json();
    const { name, email, phone } = data;

    // Verify name and email
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Find user by email from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        email,
        contactNumber: phone, // Map 'phone' to 'contactNumber' in your schema
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.contactNumber, // Explicitly include phone field in response
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile: " + error.message },
      { status: 500 }
    );
  }
}