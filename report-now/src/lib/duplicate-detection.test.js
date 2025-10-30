const openAICreateMock = jest.fn();

jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: openAICreateMock,
      },
    },
  }));
});

const prismaMock = {
  issue: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

describe("checkAndMarkDuplicate", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    openAICreateMock.mockReset();
    for (const method of Object.values(prismaMock.issue)) {
      method.mockReset();
    }
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    Object.assign(process.env, ORIGINAL_ENV);
    process.env.ENABLE_DUPLICATE_DETECTION = "true";
    process.env.OPENAI_API_KEY = "test-api-key";
  });

  afterAll(() => {
    for (const key of Object.keys(process.env)) {
      delete process.env[key];
    }
    Object.assign(process.env, ORIGINAL_ENV);
  });

  const loadModule = async () => {
    let exported;
    await jest.isolateModulesAsync(async () => {
      exported = await import("./duplicate-detection");
    });
    return exported.checkAndMarkDuplicate;
  };

  test("skips when feature flag disabled", async () => {
    process.env.ENABLE_DUPLICATE_DETECTION = "false";
    const checkAndMarkDuplicate = await loadModule();
    const result = await checkAndMarkDuplicate(1);
    expect(result).toEqual({
      skipped: true,
      reason: "Feature flag disabled",
    });
    expect(prismaMock.issue.findUnique).not.toHaveBeenCalled();
  });

  test("skips when API key missing", async () => {
    delete process.env.OPENAI_API_KEY;
    const checkAndMarkDuplicate = await loadModule();
    const result = await checkAndMarkDuplicate(2);
    expect(result.skipped).toBe(true);
    expect(result.reason).toMatch(/Missing API key/);
  });

  test("skips when issue not found", async () => {
    prismaMock.issue.findUnique.mockResolvedValue(null);
    const checkAndMarkDuplicate = await loadModule();
    const outcome = await checkAndMarkDuplicate(3);
    expect(outcome).toEqual({ skipped: true, reason: "Issue not found" });
  });

  test("returns non-duplicate when no other issues exist", async () => {
    prismaMock.issue.findUnique.mockResolvedValue({
      id: 10,
      title: "Water leak",
      description: "Pipe burst",
      latitude: 1.2,
      longitude: 103.8,
    });
    prismaMock.issue.findMany.mockResolvedValue([]);
    prismaMock.issue.update.mockResolvedValue({});

    const checkAndMarkDuplicate = await loadModule();
    const response = await checkAndMarkDuplicate(10);

    expect(response).toEqual({ duplicate: false });
    expect(prismaMock.issue.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { duplicateId: null, duplicateReason: null },
    });
    expect(openAICreateMock).not.toHaveBeenCalled();
  });

  test("marks duplicate when model confirms", async () => {
    prismaMock.issue.findUnique.mockResolvedValue({
      id: 42,
      title: "Flood in basement",
      description: "Water accumulating",
      latitude: 1.25,
      longitude: 103.9,
    });
    prismaMock.issue.findMany.mockResolvedValue([
      {
        id: 11,
        title: "Basement flood",
        description: "Same description",
        latitude: 1.25,
        longitude: 103.9,
      },
    ]);
    prismaMock.issue.update.mockResolvedValue({});

    openAICreateMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              duplicate: true,
              duplicateId: 11,
              reason: "Same basement flooding reported earlier.",
            }),
          },
        },
      ],
    });

    const checkAndMarkDuplicate = await loadModule();
    const result = await checkAndMarkDuplicate(42);

    expect(result).toEqual({
      duplicate: true,
      duplicateId: 11,
      reason: "Same basement flooding reported earlier.",
    });
    expect(prismaMock.issue.update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: {
        duplicateId: 11,
        duplicateReason: "Same basement flooding reported earlier.",
      },
    });
  });

  test("handles unparsable model response gracefully", async () => {
    prismaMock.issue.findUnique.mockResolvedValue({
      id: 101,
      title: "Road damage",
      description: "Potholes on road",
      latitude: 1.3,
      longitude: 103.7,
    });
    prismaMock.issue.findMany.mockResolvedValue([
      { id: 201, title: "Cracks", description: "Different issue" },
    ]);
    prismaMock.issue.update.mockResolvedValue({});

    openAICreateMock.mockResolvedValue({
      choices: [{ message: { content: "not-json" } }],
    });

    const checkAndMarkDuplicate = await loadModule();
    const output = await checkAndMarkDuplicate(101);

    expect(output).toEqual({ duplicate: false, reason: null });
    expect(prismaMock.issue.update).not.toHaveBeenCalled();
  });
});
