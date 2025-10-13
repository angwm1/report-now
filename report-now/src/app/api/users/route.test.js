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
    update: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => ({ user })) };
});

// --- End of Mocks ---

// Import the function under test.
import { PUT } from "./route"; // adjust the path if needed
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

  test("returns 401 Unauthorized if session exists but no user object", async () => {
    // Simulate a session without a user.
    getServerSession.mockResolvedValue({});
    const request = createRequest({ name: "New Name", email: "new@example.com", phone: "123456" });
    const response = await PUT(request);
    expect(response.status).toBe(401);
    const data = await getResponseData(response);
    expect(data.error).toBe("Unauthorized");
  });

  test("returns 401 if session exists but user email is missing", async () => {
    // Simulate a session with a user object but no email.
    getServerSession.mockResolvedValue({ user: { name: "Current User" } });
    const request = createRequest({ name: "New Name", email: "new@example.com", phone: "123456" });
    const response = await PUT(request);
    // The route logs an error and returns 401 with "Invalid session data".
    expect(response.status).toBe(401);
    const data = await getResponseData(response);
    expect(data.error).toBe("Invalid session data");
  });

  test("returns 400 if name or email is missing in request body", async () => {
    // Simulate a valid session.
    getServerSession.mockResolvedValue({ user: dummySessionUser });
    
    // Missing name.
    let request = createRequest({ email: "new@example.com", phone: "123456" });
    let response = await PUT(request);
    expect(response.status).toBe(400);
    let data = await getResponseData(response);
    expect(data.error).toBe("Name and email are required");

    // Missing email.
    request = createRequest({ name: "New Name", phone: "123456" });
    response = await PUT(request);
    expect(response.status).toBe(400);
    data = await getResponseData(response);
    expect(data.error).toBe("Name and email are required");
  });

  test("returns 404 if user is not found", async () => {
    // Simulate a valid session.
    getServerSession.mockResolvedValue({ user: dummySessionUser });
    // Simulate that the user is not found.
    prismaUser.findUnique.mockResolvedValue(null);

    const request = createRequest({ name: "New Name", email: "new@example.com", phone: "123456" });
    const response = await PUT(request);
    expect(response.status).toBe(404);
    const data = await getResponseData(response);
    expect(data.error).toBe("User not found");
  });

  test("successfully updates user if email is unchanged", async () => {
    // Simulate a valid session.
    getServerSession.mockResolvedValue({ user: dummySessionUser });
    // Simulate that the user is found using session email.
    prismaUser.findUnique.mockResolvedValue({ id: 1, email: dummySessionUser.email });
    // Simulate successful update.
    const updatedUser = {
      id: dummySessionUser.id,
      name: "Updated Name",
      email: dummySessionUser.email, // unchanged
      contactNumber: "987654",
    };
    prismaUser.update.mockResolvedValue(updatedUser);

    const request = createRequest({ name: "Updated Name", email: dummySessionUser.email, phone: "987654" });
    const response = await PUT(request);
    expect(response.status).toBe(200);
    const data = await getResponseData(response);
    // The route returns a JSON object with a message and a user property.
    expect(data).toEqual({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.contactNumber,
      },
    });
    expect(prismaUser.update).toHaveBeenCalledWith({
      where: { email: dummySessionUser.email },
      data: {
        name: "Updated Name",
        email: dummySessionUser.email,
        contactNumber: "987654",
      },
    });
  });

  test("successfully updates user if email is changed and not already in use", async () => {
    // Note: This route does not check for duplicate emails.
    // It always uses the email from session to look up the user.
    // Therefore, even if the request sends a new email,
    // the update will occur based on session.user.email.
    getServerSession.mockResolvedValue({ user: dummySessionUser });
    // Simulate that user is found when looking up session.email.
    prismaUser.findUnique.mockResolvedValue({ id: 1, email: dummySessionUser.email });
    // Simulate successful update, returning updated values.
    const updatedUser = {
      id: dummySessionUser.id,
      name: "Updated Name",
      email: "updated@example.com", // new email from request
      contactNumber: "987654",
    };
    prismaUser.update.mockResolvedValue(updatedUser);

    const request = createRequest({ name: "Updated Name", email: "updated@example.com", phone: "987654" });
    const response = await PUT(request);
    expect(response.status).toBe(200);
    const data = await getResponseData(response);
    // Even though the lookup is by session.email, the update changes the email.
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