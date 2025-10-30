jest.mock("@prisma/client", () => {
  const prisma = {
    invite: {
      findMany: jest.fn(),
    },
    issue: {
      findMany: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => prisma),
  };
});

import { GET } from "./route";
import { PrismaClient } from "@prisma/client";

function createRequest(url) {
  return { url };
}

async function getResponseData(response) {
  return JSON.parse(await response.text());
}

describe("GET /api/admin/activity", () => {
  const prisma = new PrismaClient();

  beforeEach(() => {
    prisma.invite.findMany.mockReset();
    prisma.issue.findMany.mockReset();
    prisma.review.findMany.mockReset();
  });

  test("aggregates invite, issue, and review events", async () => {
    const now = new Date("2025-10-30T12:00:00Z").getTime();
    const dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(now);

    prisma.invite.findMany.mockResolvedValue([
      {
        id: "1",
        email: "used@gov.sg",
        role: "admin",
        createdAt: "2025-10-29T08:00:00Z",
        expiresAt: "2025-11-05T08:00:00Z",
        used: true,
      },
      {
        id: "2",
        email: "expired@gov.sg",
        role: "gov",
        createdAt: "2025-10-20T08:00:00Z",
        expiresAt: "2025-10-25T08:00:00Z",
        used: false,
      },
    ]);

    prisma.issue.findMany.mockResolvedValue([
      {
        id: 99,
        title: "Broken lamp post",
        status: "Pending",
        updatedAt: "2025-10-30T09:00:00Z",
        reporter: { email: "citizen@example.com", name: "Citizen" },
      },
    ]);

    prisma.review.findMany.mockResolvedValue([
      {
        id: 42,
        rating: 4,
        comment: "Quick fix",
        createdAt: "2025-10-28T10:00:00Z",
        user: { email: "reviewer@example.com", name: "Reviewer" },
        issue: { id: 99, title: "Broken lamp post" },
      },
    ]);

    const request = createRequest("http://localhost/api/admin/activity?limit=3");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const result = await getResponseData(response);
    expect(result.events).toHaveLength(3);

    const [firstEvent] = result.events;
    expect(firstEvent).toMatchObject({
      type: "issue",
      status: "Pending",
      summary: "Broken lamp post",
      subject: "Citizen",
    });

    const inviteUsed = result.events.find((event) => event.type === "invite" && event.status === "used");
    const inviteExpired = result.events.find(
      (event) => event.type === "invite" && event.status === "expired",
    );
    expect(inviteUsed).toBeDefined();
    expect(inviteExpired).toBeUndefined();

    expect(prisma.invite.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: expect.any(Object),
    });
    expect(prisma.issue.findMany).toHaveBeenCalledWith({
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: expect.any(Object),
    });
    expect(prisma.review.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: expect.any(Object),
    });

    dateNowSpy.mockRestore();
  });

  test("returns 500 when prisma throws", async () => {
    prisma.invite.findMany.mockRejectedValue(new Error("Database offline"));

    const request = createRequest("http://localhost/api/admin/activity");
    const response = await GET(request);
    expect(response.status).toBe(500);

    const result = await getResponseData(response);
    expect(result.error).toBe("Internal Server Error");
  });
});
