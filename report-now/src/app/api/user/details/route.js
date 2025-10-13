// src\app\api\user\details\route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    
    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }
    
    // Only allow fetching the currently logged in user's data
    if (email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Convert to a plain object and remove sensitive data
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      contactNumber: user.contactNumber,
      role: user.role
    };
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Failed to fetch details: " + error.message },
      { status: 500 }
    );
  }
}