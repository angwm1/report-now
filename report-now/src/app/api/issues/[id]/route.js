// File: /src/app/api/issues/[id]/route.js
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function GET(request, context) {
  // Await the context.params so that we can safely access its properties.
  const params = await context.params;
  const { id } = params;

  const issue = await prisma.issue.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      duplicateOf: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Calculate average rating
  let averageRating = null;
  if (issue.reviews && issue.reviews.length > 0) {
    const totalRating = issue.reviews.reduce((sum, review) => sum + review.rating, 0);
    averageRating = totalRating / issue.reviews.length;
  }

  // Add average rating to the response
  return NextResponse.json(
    { 
      ...issue, 
      averageRating 
    }, 
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function PATCH(request, context) {
  // Await context.params to safely access its properties
  const params = await context.params;
  const { id } = params;
  
  try {
    const body = await request.json();

    if (typeof body.vote === "string") {
      const direction = body.vote.toLowerCase();
      if (direction !== "up") {
        return NextResponse.json(
          { error: "Invalid vote direction" },
          { status: 400 }
        );
      }

      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const userId = Number.parseInt(token.sub, 10);
      if (!Number.isInteger(userId)) {
        return NextResponse.json(
          { error: "Invalid user identifier" },
          { status: 400 }
        );
      }

      const issueRecord = await prisma.issue.findUnique({
        where: { id: parseInt(id, 10) },
        select: { status: true, upvotes: true },
      });

      if (!issueRecord) {
        return NextResponse.json(
          { error: "Issue not found" },
          { status: 404 }
        );
      }

      if (["Done", "Rejected"].includes(issueRecord.status)) {
        return NextResponse.json(
          { error: "Voting is not allowed for completed issues" },
          { status: 400 }
        );
      }

      const currentUpvotes = Array.isArray(issueRecord.upvotes)
        ? issueRecord.upvotes
        : [];
      const alreadyUpvoted = currentUpvotes.includes(userId);
      const updatedUpvotes = alreadyUpvoted
        ? currentUpvotes.filter((uid) => uid !== userId)
        : [...currentUpvotes, userId];

      const normalizedUpvotes = Array.from(new Set(updatedUpvotes));

      const updatedIssue = await prisma.issue.update({
        where: { id: parseInt(id, 10) },
        data: {
          upvotes: {
            set: normalizedUpvotes,
          },
        },
      });
      return NextResponse.json(updatedIssue, { status: 200 });
    }

    // If a timeline update is provided, append it to the timeline array
    if (body.timelineUpdate) {
      // Fetch current timeline
      const currentIssue = await prisma.issue.findUnique({
        where: { id: parseInt(id, 10) },
        select: { timeline: true },
      });
      // If timeline is null, default to an empty array
      const currentTimeline = currentIssue.timeline || [];
      const newEntry = {
        text: body.timelineUpdate,
        timestamp: new Date().toISOString(),
      };
      const updatedTimeline = [newEntry, ...currentTimeline];
      const updatedIssue = await prisma.issue.update({
        where: { id: parseInt(id, 10) },
        data: { timeline: updatedTimeline },
      });
      return NextResponse.json(updatedIssue, { status: 200 });
    }

    // Otherwise, if status update is provided, update that
    if (body.status) {
      const updatedIssue = await prisma.issue.update({
        where: { id: parseInt(id, 10) },
        data: { status: body.status },
      });
      return NextResponse.json(updatedIssue, { status: 200 });
    }

    // If neither field is provided, return an error.
    return NextResponse.json(
      { error: "No valid update field provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating issue:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  const params = await context.params;
  const { id } = params;
  const issueId = Number.parseInt(id, 10);

  if (!Number.isInteger(issueId)) {
    return NextResponse.json(
      { error: "Invalid issue identifier" },
      { status: 400 },
    );
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const userId = Number.parseInt(token.sub, 10);
  if (!Number.isInteger(userId)) {
    return NextResponse.json(
      { error: "Invalid user identifier" },
      { status: 400 },
    );
  }

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { reporterId: true },
  });

  if (!issue) {
    return NextResponse.json(
      { error: "Issue not found" },
      { status: 404 },
    );
  }

  if (issue.reporterId !== userId) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 },
    );
  }

  await prisma.issue.updateMany({
    where: { duplicateId: issueId },
    data: {
      duplicateId: null,
      duplicateReason: null,
    },
  });

  await prisma.issue.delete({
    where: { id: issueId },
  });

  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
