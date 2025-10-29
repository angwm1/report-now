// File: src/app/api/reviews/route.test.js

// --- Mocks ---
// Mock PrismaClient so that new PrismaClient() returns an object with a mocked "review" property.
jest.mock("@prisma/client", () => {
  const review = {
    findFirst: jest.fn(),
    create: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => ({ review })) };
});

// Mock getToken from next-auth/jwt so we can simulate authentication.
jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

// --- End of Mocks ---

// Import dependencies and the function under test.
import { POST } from "./route"; // adjust relative path if needed
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
      rating: 4,
      comment: "Nice issue",
      userId: 1,
      userName: "Test User",
    };
    prismaReview.create.mockResolvedValue(fakeReview);

    const request = createRequest({ issueId: "1", rating: 4, comment: "Nice issue" });
    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await getResponseData(response);
    expect(data).toEqual(fakeReview);

    // Verify that findFirst was called with correct parameters.
    expect(prismaReview.findFirst).toHaveBeenCalledWith({
      where: { issueId: 1, userId: 1 },
    });
    // Verify that create was called with the review data.
    expect(prismaReview.create).toHaveBeenCalledWith({
      data: {
        issueId: 1,
        rating: 4,
        comment: "Nice issue",
        userId: 1,
        userName: "Test User",
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

    // Optionally, suppress console.error for this test.
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
