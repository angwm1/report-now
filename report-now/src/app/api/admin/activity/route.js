// File: /src/app/api/admin/activity/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);

    const [invites, issues, reviews] = await Promise.all([
      prisma.invite.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          expiresAt: true,
          used: true,
        },
      }),
      prisma.issue.findMany({
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
          reporter: { select: { email: true, name: true } },
        },
      }),
      prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { email: true, name: true } },
          issue: { select: { id: true, title: true } },
        },
      }),
    ]);

    const now = Date.now();

    const inviteEvents = invites.map((i) => {
      let status = "pending";
      if (i.used) status = "used";
      else if (new Date(i.expiresAt).getTime() < now) status = "expired";
      return {
        type: "invite",
        ts: i.createdAt,
        tsISO: new Date(i.createdAt).toISOString(),
        status,
        summary: "Invite sent",
        subject: i.email,
        meta: { role: i.role, expiresAt: i.expiresAt },
      };
    });

    // summary = issue title (no status words here). status is shown in pill.
    const issueEvents = issues.map((it) => ({
      type: "issue",
      ts: it.updatedAt,
      tsISO: new Date(it.updatedAt).toISOString(),
      status: it.status || "updated",
      summary: it.title, // <- just the title
      subject: it.reporter?.name || it.reporter?.email || "unknown",
      meta: {
        user: it.reporter?.name || it.reporter?.email || "unknown",
        // no IDs in meta
      },
    }));

    const reviewEvents = reviews.map((r) => ({
      type: "review",
      ts: r.createdAt,
      tsISO: new Date(r.createdAt).toISOString(),
      status: "ok",
      summary: r.issue?.title || "Review",
      subject: r.user?.name || r.user?.email || "anonymous",
      meta: {
        rating: r.rating,
        comment: r.comment || "",
        user: r.user?.name || r.user?.email || "anonymous",
        // no IDs
      },
    }));

    const events = [...inviteEvents, ...issueEvents, ...reviewEvents]
      .sort((a, b) => new Date(b.ts) - new Date(a.ts))
      .slice(0, limit);

    return NextResponse.json({ events }, { status: 200 });
  } catch (err) {
    console.error("[/api/admin/activity] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
