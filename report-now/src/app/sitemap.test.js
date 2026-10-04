import sitemap from "./sitemap";

describe("sitemap metadata generator", () => {
  const originalEnv = process.env.NEXTAUTH_URL;

  afterEach(() => {
    process.env.NEXTAUTH_URL = originalEnv;
  });

  it("should return correct sitemap entries using default baseUrl", () => {
    delete process.env.NEXTAUTH_URL;
    const entries = sitemap();

    expect(Array.isArray(entries)).toBe(true);
    expect(entries).toHaveLength(5);

    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://report-now.vercel.app");
    expect(urls).toContain("https://report-now.vercel.app/issues");
    expect(urls).toContain("https://report-now.vercel.app/issues/map");
    expect(urls).toContain("https://report-now.vercel.app/issues/report");
    expect(urls).toContain("https://report-now.vercel.app/reviews");

    entries.forEach((entry) => {
      expect(entry.lastModified).toBeInstanceOf(Date);
      expect(typeof entry.changeFrequency).toBe("string");
      expect(typeof entry.priority).toBe("number");
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    });
  });

  it("should format entry URLs correctly with custom NEXTAUTH_URL", () => {
    process.env.NEXTAUTH_URL = "https://custom-domain.org/";
    const entries = sitemap();

    expect(entries[0].url).toBe("https://custom-domain.org");
    expect(entries[1].url).toBe("https://custom-domain.org/issues");
  });
});
