// File: src/app/api/issues/route.test.js

// --- Mocks ---
// Mock PrismaClient so that when new PrismaClient() is created, its "issue" property is mocked.
jest.mock("@prisma/client", () => {
  const issue = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => ({ issue })) };
});

// Mock getToken from next-auth/jwt to control authentication in POST.
jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

// Mock Cloudinary so that upload_stream immediately calls its callback with a dummy URL.
jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        // Simulate a successful upload by calling the callback with no error.
        callback(null, { secure_url: "https://cloudinary.com/dummyurl" });
        // Return a dummy writable stream.
        return { end: jest.fn() };
      }),
    },
  },
}));

// Mock streamifier.
jest.mock("streamifier", () => ({
  createReadStream: jest.fn(() => ({ pipe: jest.fn() })),
}));

// Mock the AI categorization function.
jest.mock("../../../lib/actions", () => ({
  categorize: jest.fn(),
}));

jest.mock("../../../lib/duplicate-detection", () => ({
  checkAndMarkDuplicate: jest.fn(),
}));

// --- End of Mocks ---

// Import dependencies and the functions under test.
import { GET, POST } from "./route"; // Adjust relative path if needed.
import { getToken } from "next-auth/jwt";
import cloudinary from "cloudinary";
import { categorize } from "../../../lib/actions";
import { checkAndMarkDuplicate } from "../../../lib/duplicate-detection";

// Helper: Create a fake Request for formData-based POST requests.
function createRequestWithFormData(formDataObj) {
  const formData = new FormData();
  Object.entries(formDataObj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v));
    } else {
      formData.append(key, value);
    }
  });
  return { formData: () => Promise.resolve(formData) };
}

// Helper: Create a fake context with params.
function createContext(params) {
  return { params: Promise.resolve(params) };
}

// Helper: Extract JSON data from a NextResponse.
async function getResponseData(response) {
  return JSON.parse(await response.text());
}

describe("GET /api/issues", () => {
  let prismaIssue;
  beforeEach(() => {
    const { PrismaClient } = require("@prisma/client");
    prismaIssue = new PrismaClient().issue;
    prismaIssue.findMany.mockReset();
  });

  test("returns issues with status 200", async () => {
    const fakeIssues = [
      { id: 1, title: "Issue One", reviews: [] },
      { id: 2, title: "Issue Two", reviews: [] },
    ];
    prismaIssue.findMany.mockResolvedValue(fakeIssues);

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await getResponseData(response);
    expect(data).toEqual(fakeIssues);
    expect(prismaIssue.findMany).toHaveBeenCalled();
  });

  test("returns 500 on error", async () => {
    prismaIssue.findMany.mockRejectedValue(new Error("Database error"));
    const response = await GET();
    expect(response.status).toBe(500);

    const data = await getResponseData(response);
    expect(data.error).toBe("Internal Server Error");
  });
});

describe("POST /api/issues", () => {
  let prismaIssue;
  beforeEach(() => {
    const { PrismaClient } = require("@prisma/client");
    prismaIssue = new PrismaClient().issue;
    prismaIssue.create.mockReset();
    prismaIssue.findUnique.mockReset();
    // Reset global.fetch if set.
    global.fetch = undefined;

    // Reset our categorize mock.
    categorize.mockReset();
    checkAndMarkDuplicate.mockReset();
    checkAndMarkDuplicate.mockResolvedValue(null);
  });

  test("returns 401 Unauthorized if token is missing", async () => {
    // Simulate that getToken returns null.
    getToken.mockResolvedValue(null);

    const request = createRequestWithFormData({
      title: "Test Issue",
      description: "Test description",
    });
    const context = createContext({});
    const response = await POST(request, context);
    expect(response.status).toBe(401);

    const data = await getResponseData(response);
    expect(data.error).toBe("Unauthorized");
  });

  test("returns 400 if title or description is missing", async () => {
    const { getToken } = require("next-auth/jwt");
    // Simulate a valid token.
    getToken.mockResolvedValue({ sub: "1" });
    const context = createContext({});

    // Missing title.
    let request = createRequestWithFormData({
      description: "Test description",
    });
    let response = await POST(request, context);
    expect(response.status).toBe(400);
    let data = await getResponseData(response);
    expect(data.error).toBe("Title and description are required.");

    // Missing description.
    request = createRequestWithFormData({
      title: "Test Issue",
    });
    response = await POST(request, context);
    expect(response.status).toBe(400);
    data = await getResponseData(response);
    expect(data.error).toBe("Title and description are required.");
  });

  test("creates a new issue with minimal valid data", async () => {
    const { getToken } = require("next-auth/jwt");
    // Simulate a valid token.
    getToken.mockResolvedValue({ sub: "1" });

    const requestData = {
      title: "Test Issue",
      description: "Test description",
    };

    // Simulate categorize returning a category.
    categorize.mockResolvedValue("Test Category");

    const fakeIssue = {
      id: 1,
      title: requestData.title,
      description: requestData.description,
      latitude: null,
      longitude: null,
      location: null,
      status: "Pending",
      category: "Test Category",
      upvotes: [],
      reporterId: 1,
      mediaUrls: null,
    };
    prismaIssue.create.mockResolvedValue(fakeIssue);

    const request = createRequestWithFormData(requestData);
    const context = createContext({});
    const response = await POST(request, context);
    expect(response.status).toBe(201);

    const data = await getResponseData(response);
    expect(data).toEqual(fakeIssue);
    expect(categorize).toHaveBeenCalledWith(
      requestData.title,
      requestData.description,
      [] // no image URLs
    );
    expect(prismaIssue.create).toHaveBeenCalledWith({
      data: {
        title: requestData.title,
        description: requestData.description,
        latitude: null,
        longitude: null,
        location: null,
        status: "Pending",
        category: "Test Category",
        upvotes: [],
        reporterId: 1,
        mediaUrls: null,
      },
    });
    expect(checkAndMarkDuplicate).toHaveBeenCalledWith(fakeIssue.id);
  });

  test("handles file uploads and reverse geocoding", async () => {
    const { getToken } = require("next-auth/jwt");
    getToken.mockResolvedValue({ sub: "1" });

    // Create a dummy File object. If File is not available in your test environment,
    // you may simulate an object with a minimal interface.
    const dummyFile = new File(["dummy content"], "test.png", { type: "image/png" });
    dummyFile.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));

    const requestData = {
      title: "Test Issue with File and Location",
      description: "Issue description",
      latitude: "12.34",
      longitude: "56.78",
      media: [dummyFile],
    };

    // Override global.fetch to simulate reverse geocoding.
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ display_name: "Test Location Name" }),
    });

    // Simulate categorize returning a category.
    categorize.mockResolvedValue("File Category");

    const fakeIssue = {
      id: 2,
      title: requestData.title,
      description: requestData.description,
      latitude: 12.34,
      longitude: 56.78,
      location: "Test Location Name",
      status: "Pending",
      category: "File Category",
      upvotes: [],
      reporterId: 1,
      mediaUrls: ["https://cloudinary.com/dummyurl"],
    };
    prismaIssue.create.mockResolvedValue(fakeIssue);

    const request = createRequestWithFormData({
      ...requestData,
      media: [dummyFile],
    });
    const context = createContext({});
    const response = await POST(request, context);
    expect(response.status).toBe(201);
    const data = await getResponseData(response);
    expect(data).toEqual(fakeIssue);

    // Verify that reverse geocoding was called with a URL containing "lat=12.34".
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("lat=12.34")
    );

    // Verify that Cloudinary uploader was called.
    expect(cloudinary.v2.uploader.upload_stream).toHaveBeenCalled();

    // Verify that categorize was called with an array containing the dummy URL.
    expect(categorize).toHaveBeenCalledWith(
      requestData.title,
      requestData.description,
      expect.arrayContaining(["https://cloudinary.com/dummyurl"])
    );
    expect(checkAndMarkDuplicate).toHaveBeenCalledWith(fakeIssue.id);

    global.fetch = originalFetch;
  });

  test("returns 500 on unexpected error", async () => {
    const { getToken } = require("next-auth/jwt");
    getToken.mockResolvedValue({ sub: "1" });
    // Force an error by making request.formData() reject.
    const request = {
      formData: () => Promise.reject(new Error("Test error")),
    };
    const context = createContext({});

    const originalError = console.error;
    console.error = jest.fn();

    const response = await POST(request, context);
    expect(response.status).toBe(500);
    const data = await getResponseData(response);
    expect(data.error).toBe("Internal Server Error");
    expect(data.details).toContain("Test error");

    console.error = originalError;
  });
});
