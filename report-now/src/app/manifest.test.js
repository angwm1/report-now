import manifest from "./manifest";

describe("manifest metadata generator", () => {
  it("should return valid Web App Manifest configuration", () => {
    const data = manifest();

    expect(data).toBeDefined();
    expect(data.name).toBe("Report Now - Community Issue Reporting");
    expect(data.short_name).toBe("Report Now");
    expect(data.start_url).toBe("/");
    expect(data.display).toBe("standalone");
    expect(data.background_color).toBe("#ffffff");
    expect(data.theme_color).toBe("#2563eb");
    expect(Array.isArray(data.icons)).toBe(true);
    expect(data.icons.length).toBeGreaterThan(0);
    expect(data.icons[0]).toEqual(
      expect.objectContaining({
        src: "/favicon.ico",
        type: "image/x-icon",
      })
    );
  });
});
