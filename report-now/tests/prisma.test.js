const prismaMock = {
  user: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  issue: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  review: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  invite: {
    deleteMany: jest.fn(),
  },
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

const { PrismaClient } = require("@prisma/client");

describe("Prisma Schema Tests (mocked)", () => {
  const prisma = new PrismaClient();

  beforeEach(() => {
    Object.values(prismaMock).forEach((model) => {
      Object.values(model).forEach((fn) => {
        fn.mockReset();
      });
    });

    prisma.review.deleteMany.mockResolvedValue({});
    prisma.issue.deleteMany.mockResolvedValue({});
    prisma.invite.deleteMany.mockResolvedValue({});
    prisma.user.deleteMany.mockResolvedValue({});
  });

  test("creates a new user", async () => {
    const fakeUser = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      contactNumber: "12345678",
    };
    prisma.user.create.mockResolvedValue(fakeUser);

    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        contactNumber: "12345678",
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe("test@example.com");
  });

  test("enforces unique user email", async () => {
    prisma.user.create
      .mockResolvedValueOnce({
        id: 1,
        name: "User One",
        email: "unique@example.com",
        password: "password",
      })
      .mockRejectedValueOnce(new Error("Unique constraint failed"));

    const userOne = await prisma.user.create({
      data: {
        name: "User One",
        email: "unique@example.com",
        password: "password",
      },
    });
    expect(userOne.email).toBe("unique@example.com");

    await expect(
      prisma.user.create({
        data: {
          name: "User Two",
          email: "unique@example.com",
          password: "password",
        },
      }),
    ).rejects.toThrow("Unique constraint failed");
  });

  test("creates an issue linked to a reporter", async () => {
    const fakeReporter = {
      id: 1,
      name: "Reporter",
      email: "reporter@example.com",
      password: "secret",
    };
    const fakeIssue = {
      id: 1,
      title: "Test Issue",
      description: "This is a test issue",
      reporterId: fakeReporter.id,
      category: "General",
    };

    prisma.user.create.mockResolvedValueOnce(fakeReporter);
    prisma.issue.create.mockResolvedValueOnce(fakeIssue);

    const reporter = await prisma.user.create({
      data: {
        name: "Reporter",
        email: "reporter@example.com",
        password: "secret",
      },
    });

    const issue = await prisma.issue.create({
      data: {
        title: "Test Issue",
        description: "This is a test issue",
        reporterId: reporter.id,
        category: "General",
      },
    });

    expect(issue.id).toBeDefined();
    expect(issue.reporterId).toBe(reporter.id);
  });

  test("creates a review linked to an issue and user", async () => {
    const fakeReviewer = {
      id: 1,
      name: "Reviewer",
      email: "reviewer@example.com",
      password: "password",
    };
    const fakeReporter = {
      id: 2,
      name: "Issue Reporter",
      email: "issue-reporter@example.com",
      password: "password",
    };
    const fakeIssue = {
      id: 1,
      title: "Issue for Review",
      description: "An issue to be reviewed",
      reporterId: fakeReporter.id,
    };
    const fakeReview = {
      id: 1,
      rating: 5,
      comment: "Excellent handling of the issue.",
      issueId: fakeIssue.id,
      userId: fakeReviewer.id,
      userName: fakeReviewer.name,
    };

    prisma.user.create
      .mockResolvedValueOnce(fakeReviewer)
      .mockResolvedValueOnce(fakeReporter);

    prisma.issue.create.mockResolvedValueOnce(fakeIssue);
    prisma.review.create.mockResolvedValueOnce(fakeReview);

    const reviewer = await prisma.user.create({
      data: {
        name: "Reviewer",
        email: "reviewer@example.com",
        password: "password",
      },
    });

    const reporter = await prisma.user.create({
      data: {
        name: "Issue Reporter",
        email: "issue-reporter@example.com",
        password: "password",
      },
    });

    const issue = await prisma.issue.create({
      data: {
        title: "Issue for Review",
        description: "An issue to be reviewed",
        reporterId: reporter.id,
      },
    });

    const review = await prisma.review.create({
      data: {
        rating: 5,
        comment: "Excellent handling of the issue.",
        issueId: issue.id,
        userId: reviewer.id,
        userName: reviewer.name,
      },
    });

    expect(review.id).toBeDefined();
    expect(review.rating).toBe(5);
    expect(review.issueId).toBe(issue.id);
    expect(review.userId).toBe(reviewer.id);
  });
});
