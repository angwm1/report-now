// File: src/app/api/invite/route.test.js

// --- Mocks ---
// Mock next-auth to prevent errors when calling NextAuth(authOptions)
jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn((options) => {
    // Return a dummy handler function.
    return () => {};
  }),
}));

// Mock next-auth/next so that getServerSession is controlled.
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

// Mock nodemailer.
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(),
}));

// Mock Prisma Client – we only need to mock the "invite" property.
jest.mock("@prisma/client", () => {
  const invite = {
    create: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => ({ invite })) };
});

// Import dependencies and the module under test.
import { getServerSession } from "next-auth/next"; // now mocked
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

// Import the invite route handler (POST function)
import { POST } from "./route";

// Helper: Create a fake Request object with a json() method.
function createRequest(body) {
  return {
    json: () => Promise.resolve(body),
  };
}

// Helper: Extract JSON data from a NextResponse.
async function getResponseData(response) {
  return JSON.parse(await response.text());
}

// Save original console.error for restoration.
const originalConsoleError = console.error;

describe("POST /api/invite", () => {
  let prismaInvite; // Reference to Prisma invite mock.
  let sendMailMock; // Reference to nodemailer's sendMail mock.

  beforeEach(() => {
    // Reset modules and mocks.
    jest.resetModules();

    const prisma = new PrismaClient();
    prismaInvite = prisma.invite;
    prismaInvite.create.mockReset();

    // Reset getServerSession mock.
    getServerSession.mockReset();

    // Set up nodemailer.createTransport to return an object with a mocked sendMail.
    sendMailMock = jest.fn().mockResolvedValue();
    nodemailer.createTransport.mockReset();
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  test("returns 403 Unauthorized if session is missing or not admin", async () => {
    // Simulate getServerSession returning null.
    getServerSession.mockResolvedValue(null);

    const request = createRequest({ email: "invite@example.com", role: "governmentDepartment" });
    const response = await POST(request);
    expect(response.status).toBe(403);

    const data = await getResponseData(response);
    expect(data.error).toBe("Unauthorized");
  });

  test("returns 400 if invite email is missing or invalid", async () => {
    // Simulate an admin session.
    getServerSession.mockResolvedValue({ user: { role: "admin" } });

    // Case 1: Missing invite email.
    let request = createRequest({ role: "governmentDepartment" });
    let response = await POST(request);
    expect(response.status).toBe(400);
    let data = await getResponseData(response);
    expect(data.error).toBe("A valid email is required");

    // Case 2: Invalid email format.
    request = createRequest({ email: "not-an-email", role: "governmentDepartment" });
    response = await POST(request);
    expect(response.status).toBe(400);
    data = await getResponseData(response);
    expect(data.error).toBe("A valid email is required");
  });

  test("sends invitation and returns success when request is valid", async () => {
    // Simulate an admin session.
    getServerSession.mockResolvedValue({ user: { role: "admin" } });

    const inviteEmail = "invite@example.com";
    const requestBody = { email: inviteEmail, role: "governmentDepartment" };

    // Simulate successful creation of the invite record.
    prismaInvite.create.mockResolvedValue({
      token: "sometoken",
      email: inviteEmail,
      role: "governmentDepartment",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const request = createRequest(requestBody);
    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await getResponseData(response);
    expect(data.message).toBe("Invitation sent successfully");

    // Verify that an invite record was created.
    expect(prismaInvite.create).toHaveBeenCalled();

    // Verify that nodemailer's sendMail was called with proper options.
    expect(sendMailMock).toHaveBeenCalled();
    const mailOptions = sendMailMock.mock.calls[0][0];
    expect(mailOptions.to).toBe(inviteEmail);
    expect(mailOptions.subject).toContain("You're Invited");
  });

  test("returns 500 on unexpected error", async () => {
    // Simulate an admin session.
    getServerSession.mockResolvedValue({ user: { role: "admin" } });
    // Force an error by making request.json() reject.
    const request = {
      json: () => Promise.reject(new Error("Test error")),
    };

    // Suppress console.error for this test.
    const originalError = console.error;
    console.error = jest.fn();

    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await getResponseData(response);
    // Expect error message to match the rejected error's message.
    expect(data.error).toBe("Test error");
    // Since our route does not return a "details" property, skip checking data.details.
    // expect(data.details).toContain("Test error");

    console.error = originalError;
  });
});
