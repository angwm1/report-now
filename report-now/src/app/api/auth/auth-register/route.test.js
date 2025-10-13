// File: src/app/api/auth/auth-register/route.test.js

// --- Mocks ---

// Define and expose a Prisma mock inside the factory.
jest.mock("@prisma/client", () => {
  const prismaMock = {
    invite: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  global.__prismaMock = prismaMock; // expose for tests
  return { PrismaClient: jest.fn(() => prismaMock) };
});

// Mock bcryptjs (using bcrypt in your code may be imported as default but we simulate using the same API)
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

// Import the module under test.
import { POST } from "./route"; // adjust relative path as necessary

// Helper: Create a fake Request object that implements .json()
function createRequest(body) {
  return {
    json: () => Promise.resolve(body),
  };
}

// Helper: Extract JSON data from a Response object.
async function getResponseData(response) {
  return JSON.parse(await response.text());
}

describe("POST /api/auth/auth-register", () => {
  const validData = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    contactNumber: "12345678",
  };

  beforeEach(() => {
    // Clear all mocks.
    global.__prismaMock.invite.findUnique.mockReset();
    global.__prismaMock.invite.update.mockReset();
    global.__prismaMock.user.findUnique.mockReset();
    global.__prismaMock.user.create.mockReset();
    require("bcryptjs").hash.mockReset();
  });

  test("returns 400 if any required field is missing", async () => {
    const incompleteData = { ...validData };
    delete incompleteData.password;

    const request = createRequest(incompleteData);
    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await getResponseData(response);
    expect(data.error).toBe("All fields are required");
  });

  test("returns 400 for invalid email format", async () => {
    const invalidEmailData = { ...validData, email: "not-an-email" };

    const request = createRequest(invalidEmailData);
    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await getResponseData(response);
    expect(data.error).toBe("Invalid email address");
  });

  test("returns 400 if user already exists", async () => {
    // Simulate existing user.
    global.__prismaMock.user.findUnique.mockResolvedValue({ id: 99, email: validData.email });

    const request = createRequest(validData);
    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await getResponseData(response);
    expect(data.error).toBe("User already exists");
  });

  test("returns 400 for invalid or expired invite token", async () => {
    const dataWithInvite = { ...validData, inviteToken: "invalid-token" };

    // Simulate no invite found.
    global.__prismaMock.invite.findUnique.mockResolvedValue(null);

    const request = createRequest(dataWithInvite);
    const response = await POST(request);
    expect(response.status).toBe(400);

    const responseData = await getResponseData(response);
    expect(responseData.error).toBe("Invalid or expired invite token");
  });

  test("registers a new user with valid invite token", async () => {
    const dataWithInvite = { ...validData, inviteToken: "valid-token" };

    // Simulate a valid invite.
    const fakeInvite = {
      token: "valid-token",
      email: validData.email,
      expiresAt: new Date(Date.now() + 3600000), // expires in 1 hour
      used: false,
      role: "governmentDepartment",
    };
    global.__prismaMock.invite.findUnique.mockResolvedValue(fakeInvite);
    global.__prismaMock.invite.update.mockResolvedValue({ ...fakeInvite, used: true });

    // Simulate that no user exists.
    global.__prismaMock.user.findUnique.mockResolvedValue(null);

    // Simulate password hashing.
    const hashedPassword = "hashed-password123";
    const bcrypt = require("bcryptjs");
    bcrypt.hash.mockResolvedValue(hashedPassword);

    // Simulate user creation.
    const fakeNewUser = {
      id: 1,
      name: validData.name,
      email: validData.email,
      contactNumber: validData.contactNumber,
      password: hashedPassword,
      role: fakeInvite.role,
    };
    global.__prismaMock.user.create.mockResolvedValue(fakeNewUser);

    const request = createRequest(dataWithInvite);
    const response = await POST(request);
    expect(response.status).toBe(201);

    const responseData = await getResponseData(response);
    expect(responseData.message).toBe("User created successfully");
    expect(responseData.user).toEqual(fakeNewUser);

    // Verify the invite was updated.
    expect(global.__prismaMock.invite.update).toHaveBeenCalledWith({
      where: { token: dataWithInvite.inviteToken },
      data: { used: true },
    });
  });

  test("registers a new user without an invite token", async () => {
    // Simulate that no invite token is provided.
    global.__prismaMock.user.findUnique.mockResolvedValue(null);

    // Simulate password hashing.
    const hashedPassword = "hashed-password123";
    const bcrypt = require("bcryptjs");
    bcrypt.hash.mockResolvedValue(hashedPassword);

    // Simulate user creation.
    const fakeNewUser = {
      id: 2,
      name: validData.name,
      email: validData.email,
      contactNumber: validData.contactNumber,
      password: hashedPassword,
      role: "citizen", // default role
    };
    global.__prismaMock.user.create.mockResolvedValue(fakeNewUser);

    const request = createRequest(validData);
    const response = await POST(request);
    expect(response.status).toBe(201);

    const responseData = await getResponseData(response);
    expect(responseData.message).toBe("User created successfully");
    expect(responseData.user).toEqual(fakeNewUser);
  });

  test("returns 500 on unexpected error", async () => {
    // Force an error by making request.json() reject.
    const request = {
      json: () => Promise.reject(new Error("Test error")),
    };

    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await getResponseData(response);
    expect(data.error).toBe("Internal Server Error");
    expect(data.details).toContain("Test error");
  });
});