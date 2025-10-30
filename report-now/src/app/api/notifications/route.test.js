import { POST } from "./route";

function createRequest(body) {
  return {
    json: () => Promise.resolve(body),
  };
}

async function getResponseData(response) {
  return JSON.parse(await response.text());
}

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
});
