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
