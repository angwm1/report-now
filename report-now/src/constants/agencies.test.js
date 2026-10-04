import agencies from "./agencies";

describe("agencies constant registry", () => {
  test("exports a non-empty array of agencies", () => {
    expect(Array.isArray(agencies)).toBe(true);
    expect(agencies.length).toBeGreaterThan(0);
  });

  test("contains valid structural properties for each agency", () => {
    agencies.forEach((agency) => {
      expect(typeof agency.id).toBe("string");
      expect(agency.id.trim().length).toBeGreaterThan(0);

      expect(typeof agency.name).toBe("string");
      expect(agency.name.trim().length).toBeGreaterThan(0);

      expect(["Ministry", "Agency"]).toContain(agency.group);
      expect(agency.icon).toBeDefined();
    });
  });

  test("has unique agency IDs across the entire registry", () => {
    const ids = agencies.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test("includes core municipal statutory boards", () => {
    const ids = agencies.map((a) => a.id);
    expect(ids).toContain("HDB");
    expect(ids).toContain("LTA");
    expect(ids).toContain("PUB");
    expect(ids).toContain("NEA");
    expect(ids).toContain("BCA");
  });
});
