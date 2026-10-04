// File: src/app/api/users/route.test.js

// --- Mocks ---
// Mock getServerSession from next-auth.
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

import { getServerSession } from "next-auth";

// Mock PrismaClient so that new PrismaClient() returns an object with a mocked "user" property.
jest.mock("@prisma/client", () => {
  const user = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => ({ user })) };
});

// --- End of Mocks ---

// Import the functions under test.
import { GET, PUT } from "./route";
import { NextResponse } from "next/server";

// Helper: Create a fake Request object that supports .json()
function createRequest(body) {
  return {
    json: () => Promise.resolve(body),
  };
}

// Helper: Extract JSON data from a NextResponse.
async function getResponseData(response) {
  return JSON.parse(await response.text());
}

describe("GET /api/users", () => {
  let prismaUser;

  beforeEach(() => {
    getServerSession.mockReset();
    const { PrismaClient } = require("@prisma/client");
    prismaUser = new PrismaClient().user;
    prismaUser.findUnique.mockReset();
    prismaUser.findMany.mockReset();
  });

  test("returns 401 if session is missing", async () => {
    getServerSession.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
    const data = await getResponseData(response);
    expect(data.error).toBe("Unauthorized");
  });

  test("returns 401 if session user email is missing", async () => {
    getServerSession.mockResolvedValue({ user: { name: "No Email" } });
    const response = await GET();
    expect(response.status).toBe(401);
    const data = await getResponseData(response);
    expect(data.error).toBe("Unauthorized");
  });

  test("returns 403 if user is not found in database", async () => {
    getServerSession.mockResolvedValue({ user: { email: "ghost@example.com" } });
    prismaUser.findUnique.mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(403);
    const data = await getResponseData(response);
    expect(data.error).toBe("Forbidden");
  });

  test("returns 403 if user is not authorized (role is citizen)", async () => {
    getServerSession.mockResolvedValue({ user: { email: "citizen@example.com" } });
    prismaUser.findUnique.mockResolvedValue({ role: "citizen" });

    const response = await GET();
    expect(response.status).toBe(403);
    const data = await getResponseData(response);
    expect(data.error).toBe("Forbidden");
  });

  test("returns 200 with user list if user role is admin", async () => {
    getServerSession.mockResolvedValue({ user: { email: "admin@example.com" } });
    prismaUser.findUnique.mockResolvedValue({ role: "admin" });

    const fakeUsers = [
      { id: 1, name: "Alice", email: "alice@example.com", role: "citizen" },
      { id: 2, name: "Bob", email: "bob@example.com", role: "department" },
    ];
    prismaUser.findMany.mockResolvedValue(fakeUsers);

    const response = await GET();
    expect(response.status).toBe(200);
    const data = await getResponseData(response);
    expect(data).toEqual(fakeUsers);
  });

  test("returns 200 with user list if user role is superAdmin", async () => {
    getServerSession.mockResolvedValue({ user: { email: "super@example.com" } });
    prismaUser.findUnique.mockResolvedValue({ role: "superAdmin" });

    const fakeUsers = [{ id: 1, name: "Alice", email: "alice@example.com", role: "citizen" }];
    prismaUser.findMany.mockResolvedValue(fakeUsers);

    const response = await GET();
    expect(response.status).toBe(200);
    const data = await getResponseData(response);
    expect(data).toEqual(fakeUsers);
  });

  test("returns 200 with user list if user role is department", async () => {
    getServerSession.mockResolvedValue({ user: { email: "dept@example.com" } });
    prismaUser.findUnique.mockResolvedValue({ role: "department" });

    const fakeUsers = [{ id: 1, name: "Alice", email: "alice@example.com", role: "citizen" }];
    prismaUser.findMany.mockResolvedValue(fakeUsers);

    const response = await GET();
    expect(response.status).toBe(200);
  });

  test("returns 500 when database throws an error", async () => {
    getServerSession.mockResolvedValue({ user: { email: "admin@example.com" } });
    prismaUser.findUnique.mockRejectedValue(new Error("Database offline"));

    const originalError = console.error;
    console.error = jest.fn();

    const response = await GET();
    expect(response.status).toBe(500);
    const data = await getResponseData(response);
    expect(data.error).toBe("Internal Server Error");

    console.error = originalError;
  });
});

describe("PUT /api/users", () => {
  let prismaUser;
  const dummySessionUser = {
    id: 1,
    email: "current@example.com",
    name: "Current User",
  };

  beforeEach(() => {
    // Reset the getServerSession mock.
    getServerSession.mockReset();
    // Get the Prisma user mock.
    const { PrismaClient } = require("@prisma/client");
    prismaUser = new PrismaClient().user;
    prismaUser.findUnique.mockReset();
    prismaUser.update.mockReset();
  });

  test("returns 401 Unauthorized if session is missing", async () => {
    // Simulate that getServerSession returns null.
    getServerSession.mockResolvedValue(null);
    const request = createRequest({ name: "New Name", email: "new@example.com", phone: "123456" });
    const response = await PUT(request);
    expect(response.status).toBe(401);
    const data = await getResponseData(response);
    expect(data.error).toBe("Unauthorized");
  });

  test("returns 401 Unauthorized if session exists but user email is missing", async () => {
    // Session exists, but email is not provided.
    getServerSession.mockResolvedValue({ user: { name: "Current User" } });
    const request = createRequest({ name: "New Name", email: "new@example.com", phone: "123456" });
    const response = await PUT(request);
    expect(response.status).toBe(401);
    const data = await getResponseData(response);
    expect(data.error).toBe("Invalid session data");
  });

  test("returns 400 Bad Request if name is missing", async () => {
    getServerSession.mockResolvedValue({ user: dummySessionUser });
    const request = createRequest({ email: "new@example.com", phone: "123456" });
    const response = await PUT(request);
    expect(response.status).toBe(400);
    const data = await getResponseData(response);
    expect(data.error).toBe("Name and email are required");
  });

  test("returns 400 Bad Request if email is missing in the request body", async () => {
    getServerSession.mockResolvedValue({ user: dummySessionUser });
    const request = createRequest({ name: "New Name", phone: "123456" });
    const response = await PUT(request);
    expect(response.status).toBe(400);
    const data = await getResponseData(response);
    expect(data.error).toBe("Name and email are required");
  });

  test("returns 404 Not Found if user is not found in the database", async () => {
    getServerSession.mockResolvedValue({ user: dummySessionUser });
    // Prisma lookup fails.
    prismaUser.findUnique.mockResolvedValue(null);

    const request = createRequest({ name: "New Name", email: "new@example.com", phone: "123456" });
    const response = await PUT(request);
    expect(response.status).toBe(404);
    const data = await getResponseData(response);
    expect(data.error).toBe("User not found");
  });

  test("updates the profile successfully and returns the updated user data", async () => {
    getServerSession.mockResolvedValue({ user: dummySessionUser });
    // Simulate user found in database.
    const existingUser = {
      id: 1,
      name: "Current User",
      email: "current@example.com",
      contactNumber: "123456",
    };
    prismaUser.findUnique.mockResolvedValue(existingUser);

    // Simulate updated user returned by Prisma.
    const updatedUser = {
      id: 1,
      name: "Updated Name",
      email: "updated@example.com",
      contactNumber: "987654",
    };
    prismaUser.update.mockResolvedValue(updatedUser);

    const request = createRequest({
      name: "Updated Name",
      email: "updated@example.com",
      phone: "987654",
    });
    const response = await PUT(request);
    expect(response.status).toBe(200);
    const data = await getResponseData(response);
    expect(data).toEqual({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.contactNumber,
      },
    });
    // The update is called with the lookup key from session.
    expect(prismaUser.update).toHaveBeenCalledWith({
      where: { email: dummySessionUser.email },
      data: {
        name: "Updated Name",
        email: "updated@example.com",
        contactNumber: "987654",
      },
    });
  });

  test("returns 500 on unexpected error", async () => {
    // Simulate a valid session.
    getServerSession.mockResolvedValue({ user: dummySessionUser });
    // Force an error by making request.json() reject.
    const request = {
      json: () => Promise.reject(new Error("Test error")),
    };

    const response = await PUT(request);
    expect(response.status).toBe(500);
    const data = await getResponseData(response);
    expect(data.error).toBe("Failed to update profile: Test error");
  });
});