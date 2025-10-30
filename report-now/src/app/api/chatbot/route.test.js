import { POST } from "./route";

function createRequest(body) {
  return {
    json: () => Promise.resolve(body),
  };
}

async function getResponseData(response) {
  return JSON.parse(await response.text());
}

describe("POST /api/chatbot", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("returns trimmed reply when OpenAI responds successfully", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: "  Hello citizen!  ",
              },
            },
          ],
        }),
    });

    const request = createRequest({
      message: "Hello?",
      history: [{ role: "user", content: "Hi" }],
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const data = await getResponseData(response);
    expect(data).toEqual({ reply: "Hello citizen!" });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://api.openai.com/v1/chat/completions"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("Bearer"),
        }),
      }),
    );
  });

  test("bubbles up OpenAI API errors", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: () =>
        Promise.resolve({
          error: { message: "Rate limit" },
        }),
    });

    const request = createRequest({
      message: "Explain status?",
      history: [],
    });

    const response = await POST(request);
    expect(response.status).toBe(429);

    const data = await getResponseData(response);
    expect(data.error).toBe("Rate limit");
  });

  test("returns 500 when unexpected error occurs", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network down"));

    const request = createRequest({ message: "hello" });
    const response = await POST(request);
    expect(response.status).toBe(500);

    const data = await getResponseData(response);
    expect(data.error).toBe("Internal server error");
  });
});
