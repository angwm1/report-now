import { GET, POST } from "./route";

function createRequest(body) {
  return {
    json: () => Promise.resolve(body),
  };
}

async function getResponseData(response) {
  return JSON.parse(await response.text());
}

describe("GET /api/notifications", () => {
  test("returns empty notifications array with status 200", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const data = await getResponseData(response);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toEqual([]);
  });
});

describe("POST /api/notifications", () => {
  test("echoes payload and returns message", async () => {
    const payload = { title: "Maintenance", description: "Downtime at 10pm" };
    const request = createRequest(payload);

    const response = await POST(request);
    expect(response.status).toBe(201);

    const data = await getResponseData(response);
    expect(data).toEqual({
      message: "Notification sent",
      data: payload,
    });
  });

  test("returns 400 when payload is invalid or unparsable", async () => {
    const request = {
      json: () => Promise.reject(new Error("Invalid JSON")),
    };

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await getResponseData(response);
    expect(data.error).toBe("Invalid notification payload");
  });

  test("returns 400 when payload is not an object", async () => {
    const request = createRequest("string-payload");

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await getResponseData(response);
    expect(data.error).toBe("Invalid notification payload");
  });
});
