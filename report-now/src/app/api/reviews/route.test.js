// File: src/app/api/reviews/route.test.js

// --- Mocks ---
// Mock PrismaClient so that new PrismaClient() returns an object with a mocked "review" property.
jest.mock("@prisma/client", () => {
  const review = {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => ({ review })) };
});

// Mock getToken from next-auth/jwt so we can simulate authentication.
jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

// --- End of Mocks ---

// Import dependencies and the functions under test.
import { GET, POST } from "./route";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

// Helper: Create a fake Request object that implements .json()
function createRequest(body) {
  return {
    json: () => Promise.resolve(body),
  };
}

// Helper: Extract JSON from a NextResponse.
async function getResponseData(response) {
  return JSON.parse(await response.text());
}

describe("GET /api/reviews", () => {
  let prismaReview;

  beforeEach(() => {
    const prisma = new PrismaClient();
    prismaReview = prisma.review;
    prismaReview.findMany.mockReset();
  });

  test("returns all reviews when no issueId query parameter is provided", async () => {
    const fakeReviews = [
      { id: 1, rating: 5, comment: "Quick fix", issueId: 10, issue: { id: 10, title: "Pothole", status: "Done" } },
      { id: 2, rating: 4, comment: "Good job", issueId: 12, issue: { id: 12, title: "Light", status: "Done" } },
    ];
    prismaReview.findMany.mockResolvedValue(fakeReviews);

    const request = { url: "http://localhost:3000/api/reviews" };
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await getResponseData(response);
    expect(data.reviews).toEqual(fakeReviews);
    expect(prismaReview.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        issue: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  });

  test("filters reviews by issueId when valid numeric query param is provided", async () => {
    const fakeReviews = [
      { id: 1, rating: 5, comment: "Quick fix", issueId: 10, issue: { id: 10, title: "Pothole", status: "Done" } },
    ];
    prismaReview.findMany.mockResolvedValue(fakeReviews);

    const request = { url: "http://localhost:3000/api/reviews?issueId=10" };
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await getResponseData(response);
    expect(data.reviews).toEqual(fakeReviews);
    expect(prismaReview.findMany).toHaveBeenCalledWith({
      where: { issueId: 10 },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        issue: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  });

  test("ignores invalid issueId parameter and queries without filter", async () => {
    prismaReview.findMany.mockResolvedValue([]);

    const request = { url: "http://localhost:3000/api/reviews?issueId=abc" };
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(prismaReview.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  test("returns 500 when database throws an error", async () => {
    prismaReview.findMany.mockRejectedValue(new Error("Database offline"));

    const originalError = console.error;
    console.error = jest.fn();

    const request = { url: "http://localhost:3000/api/reviews" };
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await getResponseData(response);
    expect(data.error).toBe("Internal Server Error");

    console.error = originalError;
  });
});

describe("POST /api/reviews", () => {
  let prismaReview;
  beforeEach(() => {
    // Get the Prisma mock instance.
    const prisma = new PrismaClient();
    prismaReview = prisma.review;
    prismaReview.findFirst.mockReset();
    prismaReview.create.mockReset();

    // Reset getToken mock.
    getToken.mockReset();
  });

  test("returns 400 if issueId or rating is missing", async () => {
    // Missing issueId.
    let request = createRequest({ rating: 4, comment: "Good" });
    let response = await POST(request);
    expect(response.status).toBe(400);
    let data = await getResponseData(response);
    expect(data.error).toBe("Issue ID and rating are required.");

    // Missing rating.
    request = createRequest({ issueId: "1", comment: "Good" });
    response = await POST(request);
    expect(response.status).toBe(400);
    data = await getResponseData(response);
    expect(data.error).toBe("Issue ID and rating are required.");
  });

  test("returns 401 Unauthorized if token is missing", async () => {
    // Simulate that getToken returns null.
    getToken.mockResolvedValue(null);
    const request = createRequest({ issueId: "1", rating: 5, comment: "Great" });
    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await getResponseData(response);
    expect(data.error).toBe("Unauthorized");
  });

  test("returns 400 if the user has already left a review", async () => {
    // Simulate valid token.
    getToken.mockResolvedValue({ id: "1", name: "Test User" });
    // Simulate an existing review.
    prismaReview.findFirst.mockResolvedValue({ id: 100, issueId: 1, userId: 1 });

    const request = createRequest({ issueId: "1", rating: 5, comment: "Great!" });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await getResponseData(response);
    expect(data.error).toBe("You have already left a review for this issue.");
    expect(prismaReview.findFirst).toHaveBeenCalledWith({
      where: { issueId: 1, userId: 1 },
    });
  });

  test("creates a new review when valid data is provided", async () => {
    // Simulate valid token.
    getToken.mockResolvedValue({ id: "1", name: "Test User" });
    // Simulate no existing review.
    prismaReview.findFirst.mockResolvedValue(null);

    // Simulate review creation.
    const fakeReview = {
      id: 101,
      issueId: 1,
      rating: 5,
      comment: "Great work!",
      userId: 1,
      userName: "Test User",
    };
    prismaReview.create.mockResolvedValue(fakeReview);

    const request = createRequest({
      issueId: "1",
      rating: 5,
      comment: "Great work!",
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
    const data = await getResponseData(response);
    expect(data).toEqual(fakeReview);
    expect(prismaReview.create).toHaveBeenCalledWith({
      data: {
        issueId: 1,
        rating: 5,
        comment: "Great work!",
        userId: 1,
        userName: "Test User",
      },
    });
  });

  test("uses 'Anonymous' when token does not have a name", async () => {
    // Token without a name.
    getToken.mockResolvedValue({ sub: "5" });
    prismaReview.findFirst.mockResolvedValue(null);
    prismaReview.create.mockResolvedValue({
      id: 102,
      issueId: 1,
      rating: 5,
      comment: "Anonymous review",
      userId: 5,
      userName: "Anonymous",
    });

    const request = createRequest({
      issueId: 1,
      rating: 5,
      comment: "Anonymous review",
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(prismaReview.create).toHaveBeenCalledWith({
      data: {
        issueId: 1,
        rating: 5,
        comment: "Anonymous review",
        userId: 5,
        userName: "Anonymous",
      },
    });
  });

  test("returns 500 on unexpected error", async () => {
    // Simulate valid token.
    getToken.mockResolvedValue({ id: "1", name: "Test User" });
    // Force an error by making request.json() reject.
    const request = {
      json: () => Promise.reject(new Error("Test error")),
    };

    const originalError = console.error;
    console.error = jest.fn();

    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await getResponseData(response);
    expect(data.error).toBe("Internal Server Error");
    expect(data.details).toContain("Test error");

    console.error = originalError;
  });
});
