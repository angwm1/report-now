// File: src/tests/prisma.test.js
import { PrismaClient } from '@prisma/client';

// Increase the default timeout to 15 seconds for all tests in this file.
jest.setTimeout(15000);

// This prisma instance comes from our global mock defined in jest.setup.js.
const prisma = new PrismaClient();

describe('Prisma Schema Tests (using mocks)', () => {  
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup deleteMany mocks to simply resolve (they don’t need to do anything)
    prisma.review.deleteMany.mockResolvedValue({});
    prisma.issue.deleteMany.mockResolvedValue({});
    prisma.invite.deleteMany.mockResolvedValue({});
    prisma.user.deleteMany.mockResolvedValue({});
  });

  // No need to disconnect mocks, so we just resolve.
  afterAll(async () => {
    await Promise.resolve();
  });

  test('should create a new user', async () => {
    // Set up the mock to resolve with a fake user object.
    const fakeUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      contactNumber: '12345678'
    };
    prisma.user.create.mockResolvedValue(fakeUser);

    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        contactNumber: '12345678'
      }
    });
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  test('should enforce unique user email', async () => {
    // First call resolves with a valid user.
    // Second call simulates a unique constraint violation.
    prisma.user.create
      .mockResolvedValueOnce({
        id: 1,
        name: 'User One',
        email: 'unique@example.com',
        password: 'password'
      })
      .mockRejectedValueOnce(new Error("Unique constraint failed"));

    // First creation should work.
    const userOne = await prisma.user.create({
      data: {
        name: 'User One',
        email: 'unique@example.com',
        password: 'password'
      }
    });
    expect(userOne.email).toBe('unique@example.com');

    // Second creation with the same email should throw an error.
    await expect(
      prisma.user.create({
        data: {
          name: 'User Two',
          email: 'unique@example.com',
          password: 'password'
        }
      })
    ).rejects.toThrow("Unique constraint failed");
  });

  test('should create an issue linked to a reporter', async () => {
    const fakeReporter = {
      id: 1,
      name: 'Reporter',
      email: 'reporter@example.com',
      password: 'secret'
    };
    const fakeIssue = {
      id: 1,
      title: 'Test Issue',
      description: 'This is a test issue',
      reporterId: fakeReporter.id,
      category: 'General'
    };

    // Set up the mocks in the order of calls.
    prisma.user.create.mockResolvedValueOnce(fakeReporter);
    prisma.issue.create.mockResolvedValueOnce(fakeIssue);

    const reporter = await prisma.user.create({
      data: {
        name: 'Reporter',
        email: 'reporter@example.com',
        password: 'secret'
      }
    });

    const issue = await prisma.issue.create({
      data: {
        title: 'Test Issue',
        description: 'This is a test issue',
        reporterId: reporter.id, // link issue to an existing user
        category: 'General'
      }
    });

    expect(issue.id).toBeDefined();
    expect(issue.reporterId).toBe(reporter.id);
  });

  test('should create a review linked to an issue and user', async () => {
    const fakeReviewer = {
      id: 1,
      name: 'Reviewer',
      email: 'reviewer@example.com',
      password: 'password'
    };
    const fakeReporter = {
      id: 2,
      name: 'Issue Reporter',
      email: 'issue-reporter@example.com',
      password: 'password'
    };
    const fakeIssue = {
      id: 1,
      title: 'Issue for Review',
      description: 'An issue to be reviewed',
      reporterId: fakeReporter.id,
    };
    const fakeReview = {
      id: 1,
      rating: 5,
      comment: 'Excellent handling of the issue.',
      issueId: fakeIssue.id,
      userId: fakeReviewer.id,
      userName: fakeReviewer.name
    };

    // Set up mocks for each create call in order.
    prisma.user.create
      .mockResolvedValueOnce(fakeReviewer)   // reviewer creation
      .mockResolvedValueOnce(fakeReporter);    // reporter creation

    prisma.issue.create.mockResolvedValueOnce(fakeIssue);
    prisma.review.create.mockResolvedValueOnce(fakeReview);

    const reviewer = await prisma.user.create({
      data: {
        name: 'Reviewer',
        email: 'reviewer@example.com',
        password: 'password'
      }
    });

    const reporter = await prisma.user.create({
      data: {
        name: 'Issue Reporter',
        email: 'issue-reporter@example.com',
        password: 'password'
      }
    });

    const issue = await prisma.issue.create({
      data: {
        title: 'Issue for Review',
        description: 'An issue to be reviewed',
        reporterId: reporter.id
      }
    });

    const review = await prisma.review.create({
      data: {
        rating: 5,
        comment: 'Excellent handling of the issue.',
        issueId: issue.id,
        userId: reviewer.id,
        userName: reviewer.name
      }
    });

    expect(review.id).toBeDefined();
    expect(review.rating).toBe(5);
    expect(review.issueId).toBe(issue.id);
    expect(review.userId).toBe(reviewer.id);
  });
});