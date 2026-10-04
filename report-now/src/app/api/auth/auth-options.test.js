jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@prisma/client", () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => prisma),
  };
});

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

import { authOptions } from "./[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

describe("authOptions.credentials.authorize", () => {
  const prisma = new PrismaClient();
  const credentialsProvider = authOptions.providers[0];
  const authorize = credentialsProvider.options?.authorize;

  beforeEach(() => {
    prisma.user.findUnique.mockReset();
    compare.mockReset();
  });

  test("throws when user email is not found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authorize({ email: "missing@example.com", password: "secret" }),
    ).rejects.toThrow("No user found with that email");

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "missing@example.com" },
    });
  });

  test("throws when password comparison fails", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: "user@example.com",
      password: "hashed",
      name: "User",
      role: "citizen",
    });
    compare.mockResolvedValue(false);

    await expect(
      authorize({ email: "user@example.com", password: "wrong" }),
    ).rejects.toThrow("Invalid password");

    expect(compare).toHaveBeenCalledWith("wrong", "hashed");
  });

  test("returns minimal user profile on success", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 3,
      email: "user@example.com",
      password: "hashed",
      name: "User",
      role: "citizen",
    });
    compare.mockResolvedValue(true);

    const result = await authorize({
      email: "user@example.com",
      password: "correct",
    });

    expect(result).toEqual({
      id: 3,
      email: "user@example.com",
      name: "User",
      role: "citizen",
    });
    expect(compare).toHaveBeenCalledWith("correct", "hashed");
  });
});

describe("authOptions callbacks", () => {
  const { jwt, session } = authOptions.callbacks;

  test("jwt callback sets token id and role when user is present", async () => {
    const token = await jwt({
      token: { sub: "10" },
      user: { id: 10, role: "admin" },
    });
    expect(token).toEqual({ sub: "10", id: 10, role: "admin" });
  });

  test("jwt callback returns token unchanged when user is absent", async () => {
    const token = await jwt({
      token: { sub: "10", id: 10, role: "citizen" },
      user: null,
    });
    expect(token).toEqual({ sub: "10", id: 10, role: "citizen" });
  });

  test("session callback attaches token id and role to session.user", async () => {
    const result = await session({
      session: { user: { name: "Test User" } },
      token: { id: 10, role: "admin" },
    });
    expect(result.user.id).toBe(10);
    expect(result.user.role).toBe("admin");
  });

  test("session callback handles undefined token safely", async () => {
    const result = await session({
      session: { user: { name: "Test User" } },
      token: null,
    });
    expect(result).toEqual({ user: { name: "Test User" } });
  });
});

