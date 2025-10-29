// File: src/app/api/issues/[id]/route.test.js

// --- Mocks ---
// Mock PrismaClient so that when new PrismaClient() is created, its "issue" property is mocked.
jest.mock("@prisma/client", () => {
  const issue = {
    findUnique: jest.fn(),
    update: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => ({ issue })) };
});

jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

// --- End of Mocks ---

// Import the functions under test.
import { GET, PATCH } from "./route"; // Adjust relative path if needed.
import { getToken } from "next-auth/jwt";

// Helper: Create a fake Request object that supports .json()
function createRequest(body) {
  return {
    json: () => Promise.resolve(body),
  };
}

// Helper: Create a fake context with params.
function createContext(params) {
  return { params: Promise.resolve(params) };
}

// Helper: Extract JSON data from a NextResponse.
async function getResponseData(response) {
  return JSON.parse(await response.text());
}

describe("GET /api/issues/[id]", () => {
  let prismaIssue;
  beforeEach(() => {
    const { PrismaClient } = require("@prisma/client");
    prismaIssue = new PrismaClient().issue;
    prismaIssue.findUnique.mockReset();
  });

  test("returns issue with status 200 when issue is found", async () => {
    // Provide a review with a rating so that averageRating is computed.
    const fakeIssue = {
      id: 1,
      title: "Test Issue",
      description: "An example issue",
      reviews: [{ id: 10, comment: "Great", rating: 5 }],
    };
    prismaIssue.findUnique.mockResolvedValue(fakeIssue);

    const context = createContext({ id: "1" });
    const response = await GET({}, context);
    expect(response.status).toBe(200);

    const data = await getResponseData(response);
    // The route calculates the average rating.
    // For one review with rating 5, averageRating should be 5.
    const expected = { ...fakeIssue, averageRating: 5 };
    expect(data).toEqual(expected);
    expect(prismaIssue.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: { reviews: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });
  });

  test("returns 404 when issue is not found", async () => {
    prismaIssue.findUnique.mockResolvedValue(null);

    const context = createContext({ id: "123" });
    const response = await GET({}, context);
    expect(response.status).toBe(404);

    const data = await getResponseData(response);
    expect(data.error).toBe("Issue not found");
  });
});

describe("PATCH /api/issues/[id]", () => {
  let prismaIssue;
  beforeEach(() => {
    const { PrismaClient } = require("@prisma/client");
    prismaIssue = new PrismaClient().issue;
    prismaIssue.findUnique.mockReset();
    prismaIssue.update.mockReset();
    getToken.mockReset();
  });

  test("adds current user to upvotes when not yet upvoted", async () => {
    getToken.mockResolvedValue({ sub: "1" });
    prismaIssue.findUnique.mockResolvedValue({ status: "In Progress", upvotes: [] });
    prismaIssue.update.mockResolvedValue({ id: 1, upvotes: [1], status: "In Progress" });

    const request = createRequest({ vote: "up" });
    const context = createContext({ id: "1" });
    const response = await PATCH(request, context);
    expect(response.status).toBe(200);

    const data = await getResponseData(response);
    expect(data.upvotes).toEqual([1]);
    expect(prismaIssue.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { status: true, upvotes: true },
    });
    expect(prismaIssue.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { upvotes: { set: [1] } },
    });
  });

  test("removes current user from upvotes when already upvoted", async () => {
    getToken.mockResolvedValue({ sub: "1" });
    prismaIssue.findUnique.mockResolvedValue({ status: "Pending", upvotes: [1, 2] });
    prismaIssue.update.mockResolvedValue({ id: 1, upvotes: [2], status: "Pending" });

    const request = createRequest({ vote: "up" });
    const context = createContext({ id: "1" });
    const response = await PATCH(request, context);
    expect(response.status).toBe(200);

    const data = await getResponseData(response);
    expect(data.upvotes).toEqual([2]);
    expect(prismaIssue.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { upvotes: { set: [2] } },
    });
  });

  test("returns 401 when user is not authenticated", async () => {
    getToken.mockResolvedValue(null);

    const request = createRequest({ vote: "up" });
    const context = createContext({ id: "1" });
    const response = await PATCH(request, context);
    expect(response.status).toBe(401);

    expect(getToken).toHaveBeenCalled();
    expect(prismaIssue.findUnique).not.toHaveBeenCalled();
    expect(prismaIssue.update).not.toHaveBeenCalled();
  });

  test("returns 400 when user identifier cannot be parsed", async () => {
    getToken.mockResolvedValue({ sub: "not-a-number" });

    const request = createRequest({ vote: "up" });
    const context = createContext({ id: "1" });
    const response = await PATCH(request, context);
    expect(response.status).toBe(400);

    const data = await getResponseData(response);
    expect(data.error).toBe("Invalid user identifier");
    expect(getToken).toHaveBeenCalled();
    expect(prismaIssue.findUnique).not.toHaveBeenCalled();
  });

  test("returns 400 when vote direction is invalid", async () => {
    const request = createRequest({ vote: "sideways" });
    const context = createContext({ id: "1" });
    const response = await PATCH(request, context);
    expect(response.status).toBe(400);

    const data = await getResponseData(response);
    expect(data.error).toBe("Invalid vote direction");
    expect(getToken).not.toHaveBeenCalled();
    expect(prismaIssue.update).not.toHaveBeenCalled();
  });

  test("returns 404 when voting on non-existent issue", async () => {
    getToken.mockResolvedValue({ sub: "1" });
    prismaIssue.findUnique.mockResolvedValue(null);

    const request = createRequest({ vote: "up" });
    const context = createContext({ id: "1" });
    const response = await PATCH(request, context);
    expect(response.status).toBe(404);

    const data = await getResponseData(response);
    expect(data.error).toBe("Issue not found");
    expect(getToken).toHaveBeenCalled();
    expect(prismaIssue.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { status: true, upvotes: true },
    });
    expect(prismaIssue.update).not.toHaveBeenCalled();
  });

  test("blocks voting when issue is Done or Rejected", async () => {
    getToken.mockResolvedValue({ sub: "1" });
    prismaIssue.findUnique.mockResolvedValue({ status: "Done", upvotes: [] });

    const request = createRequest({ vote: "up" });
    const context = createContext({ id: "1" });
    const response = await PATCH(request, context);
    expect(response.status).toBe(400);

    const data = await getResponseData(response);
    expect(data.error).toBe("Voting is not allowed for completed issues");
    expect(prismaIssue.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { status: true, upvotes: true },
    });
    expect(prismaIssue.update).not.toHaveBeenCalled();
  });

  test("updates timeline when timelineUpdate is provided", async () => {
    const currentIssue = { timeline: null };
    prismaIssue.findUnique.mockResolvedValue(currentIssue);

    const newEntry = { text: "New update", timestamp: "dummy-timestamp" };
    const updatedIssue = { id: 1, timeline: [newEntry] };
    prismaIssue.update.mockResolvedValue(updatedIssue);

    const request = createRequest({ timelineUpdate: "New update" });
    const context = createContext({ id: "1" });
    const response = await PATCH(request, context);
    expect(response.status).toBe(200);

    const data = await getResponseData(response);
    expect(data.timeline).toBeDefined();
    // Since the route creates a timestamp dynamically, we verify the text.
    expect(data.timeline[0].text).toBe("New update");
    expect(prismaIssue.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { timeline: true },
    });
    expect(prismaIssue.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { timeline: expect.any(Array) },
    });
  });

  test("updates status when status is provided", async () => {
    const updatedIssue = { id: 1, status: "Resolved" };
    prismaIssue.update.mockResolvedValue(updatedIssue);

    const request = createRequest({ status: "Resolved" });
    const context = createContext({ id: "1" });
    const response = await PATCH(request, context);
    expect(response.status).toBe(200);

    const data = await getResponseData(response);
    expect(data).toEqual(updatedIssue);
    expect(prismaIssue.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: "Resolved" },
    });
  });

  test("returns 400 if no valid update field is provided", async () => {
    const request = createRequest({ someField: "irrelevant" });
    const context = createContext({ id: "1" });
    const response = await PATCH(request, context);
    expect(response.status).toBe(400);

    const data = await getResponseData(response);
    expect(data.error).toBe("No valid update field provided");
  });

  test("returns 500 on unexpected error", async () => {
    // Force an error by making request.json() reject.
    const request = {
      json: () => Promise.reject(new Error("Test error")),
    };
    const context = createContext({ id: "1" });

    const originalError = console.error;
    console.error = jest.fn();

    const response = await PATCH(request, context);
    expect(response.status).toBe(500);

    const data = await getResponseData(response);
    expect(data.error).toBe("Internal Server Error");
    expect(data.details).toContain("Test error");

    console.error = originalError;
  });
});
