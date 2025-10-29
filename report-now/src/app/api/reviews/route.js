// File: /src/app/api/reviews/route.js
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();


export async function POST(request) {
  try {
    // Parse the JSON body from the request
    const body = await request.json();
    const { issueId, rating, comment } = body;

    // Validate required fields
    if (!issueId || !rating) {
      return NextResponse.json(
        { error: "Issue ID and rating are required." },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Authenticate the user using NextAuth's JWT
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract user information from the token
    // Ensure that your NextAuth session callback attaches user.id and user.name to the token
    const userId = Number(token.id);
    const userName = token.name || "Anonymous";

    // Check if this user has already left a review for this issue
    const existingReview = await prisma.review.findFirst({
      where: {
        issueId: parseInt(issueId, 10),
        userId: userId,
      },
    });
    if (existingReview) {
      return NextResponse.json(
        { error: "You have already left a review for this issue." },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create the new review in the database
    const newReview = await prisma.review.create({
      data: {
        issueId: parseInt(issueId, 10),
        rating,
        comment,
        userId: userId,
        userName: userName,
      },
    });

    return NextResponse.json(newReview, {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}