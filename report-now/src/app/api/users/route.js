// src\app\api\users\route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    // get session
    const session = await getServerSession();
    console.log("Session received:", session);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use email from session instead of ID
    if (!session.user.email) {
      console.error("No user email in session:", session);
      return NextResponse.json({ error: "Invalid session data" }, { status: 401 });
    }

    // get user data from request body
    const data = await request.json();
    const { name, email, phone } = data;
    console.log("Received update data:", { name, email, phone });

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
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        email,
        contactNumber: phone // Map 'phone' to 'contactNumber' in your schema
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.contactNumber // Explicitly include phone field in response
      }
    });

  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile: " + error.message },
      { status: 500 }
    );
  }
}