// File: src/app/api/user/details/route.test.js

// --- Mocks ---
// Mock getServerSession from next-auth/next.
jest.mock("next-auth/next", () => ({
    getServerSession: jest.fn(),
  }));
  
  // Mock PrismaClient so that new PrismaClient() returns an object with a mocked "user" property.
  jest.mock("@prisma/client", () => {
    const user = {
      findUnique: jest.fn(),
    };
    return { PrismaClient: jest.fn(() => ({ user })) };
  });
  
  // --- End of Mocks ---
  
  // Import the function under test.
  import { GET } from "./route"; // adjust relative path if needed
  import { getServerSession } from "next-auth/next";
  
  // Helper: Create a fake Request object with a "url" property.
  function createRequest(url) {
    return { url };
  }
  
  // Helper: Extract JSON data from a NextResponse.
  async function getResponseData(response) {
    return JSON.parse(await response.text());
  }
  
  describe("GET /api/user/details", () => {
    let prismaUser;
    // Define a dummy session for valid cases.
    const dummySession = { user: { email: "user@example.com", id: 1, name: "Test User" } };
  
    beforeEach(() => {
      // Reset getServerSession mock.
      getServerSession.mockReset();
      // Get the Prisma user mock.
      const { PrismaClient } = require("@prisma/client");
      prismaUser = new PrismaClient().user;
      prismaUser.findUnique.mockReset();
    });
  
    test("returns 401 Unauthorized if session is missing", async () => {
      getServerSession.mockResolvedValue(null);
      const request = createRequest("http://localhost/api/user/details?email=user@example.com");
      const response = await GET(request);
      expect(response.status).toBe(401);
      const data = await getResponseData(response);
      expect(data.error).toBe("Unauthorized");
    });
  
    test("returns 400 if email parameter is missing", async () => {
      getServerSession.mockResolvedValue(dummySession);
      const request = createRequest("http://localhost/api/user/details");
      const response = await GET(request);
      expect(response.status).toBe(400);
      const data = await getResponseData(response);
      expect(data.error).toBe("Email parameter is required");
    });
  
    test("returns 403 if email parameter does not match session email", async () => {
      getServerSession.mockResolvedValue(dummySession);
      const request = createRequest("http://localhost/api/user/details?email=other@example.com");
      const response = await GET(request);
      expect(response.status).toBe(403);
      const data = await getResponseData(response);
      expect(data.error).toBe("Unauthorized");
    });
  
    test("returns 404 if user is not found", async () => {
      getServerSession.mockResolvedValue(dummySession);
      prismaUser.findUnique.mockResolvedValue(null);
      const request = createRequest("http://localhost/api/user/details?email=user@example.com");
      const response = await GET(request);
      expect(response.status).toBe(404);
      const data = await getResponseData(response);
      expect(data.error).toBe("User not found");
    });
  
    test("returns user details when user is found", async () => {
      getServerSession.mockResolvedValue(dummySession);
      const fakeUser = {
        id: 1,
        name: "Test User",
        email: "user@example.com",
        contactNumber: "1234567890",
        role: "citizen",
      };
      prismaUser.findUnique.mockResolvedValue(fakeUser);
      const request = createRequest("http://localhost/api/user/details?email=user@example.com");
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await getResponseData(response);
      // The route returns only non-sensitive fields.
      expect(data).toEqual(fakeUser);
    });
  });  