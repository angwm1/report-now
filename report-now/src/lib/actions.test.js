const actionsCreateMock = jest.fn();

jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: actionsCreateMock,
      },
    },
  }));
});

describe("categorize", () => {
  let categorize;

  beforeEach(async () => {
    jest.resetModules();
    actionsCreateMock.mockReset();
    process.env.OPENAI_API_KEY = "test-key";
    ({ categorize } = await import("./actions"));
  });

  afterAll(() => {
    delete process.env.OPENAI_API_KEY;
  });

  test("calls OpenAI with expected payload and returns category", async () => {
    actionsCreateMock.mockResolvedValue({
      choices: [{ message: { content: "MSE" } }],
    });

    const result = await categorize("Flooding", "Water around estate", [
      "https://example.com/image.png",
    ]);

    expect(result).toBe("MSE");
    expect(actionsCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5-mini",
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "system" }),
          expect.objectContaining({
            role: "user",
            content: expect.arrayContaining([
              expect.objectContaining({ type: "text" }),
              expect.objectContaining({
                type: "image_url",
                image_url: { url: "https://example.com/image.png" },
              }),
            ]),
          }),
        ]),
      }),
    );
  });

  test("throws error when title is invalid", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      categorize(null, "Valid description", []),
    ).rejects.toThrow("Title and description must be strings.");
    expect(actionsCreateMock).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  test("throws error when imageUrls is not array", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      categorize("Valid title", "Valid description", "not-array"),
    ).rejects.toThrow("Image URLs must be provided as an array.");
    errorSpy.mockRestore();
  });

  test("returns empty string when completion content is falsy", async () => {
    actionsCreateMock.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });

    const result = await categorize("Pothole", "Road defect", []);
    expect(result).toBe("");
  });

  test("rethrows underlying OpenAI errors", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("OpenAI timeout");
    actionsCreateMock.mockRejectedValue(error);

    await expect(
      categorize("Title", "Description", []),
    ).rejects.toThrow("OpenAI timeout");
    errorSpy.mockRestore();
  });
});

