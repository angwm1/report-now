// File: /src/app/api/issues/[id]/route.js
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request, context) {
  // Await the context.params so that we can safely access its properties.
  const params = await context.params;
  const { id } = params;

  const issue = await prisma.issue.findUnique({
    where: { id: parseInt(id, 10) },
    include: { 
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