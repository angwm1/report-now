import robots from "./robots";

describe("robots metadata generator", () => {
  const originalEnv = process.env.NEXTAUTH_URL;

  afterEach(() => {
    process.env.NEXTAUTH_URL = originalEnv;
  });

  it("should return robots rules with default URL when NEXTAUTH_URL is not set", () => {
    delete process.env.NEXTAUTH_URL;
    const config = robots();

    expect(config).toBeDefined();
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0].userAgent).toBe("*");
    expect(config.rules[0].allow).toBe("/");
    expect(config.rules[0].disallow).toEqual(
      expect.arrayContaining(["/api/", "/admin/", "/superAdmin/", "/account/"])
    );
    expect(config.sitemap).toBe("https://report-now.vercel.app/sitemap.xml");
  });

  it("should format sitemap URL correctly when NEXTAUTH_URL is provided with trailing slash", () => {
    process.env.NEXTAUTH_URL = "https://example.com/";
    const config = robots();

    expect(config.sitemap).toBe("https://example.com/sitemap.xml");
  });

  it("should format sitemap URL correctly when NEXTAUTH_URL is provided without trailing slash", () => {
    process.env.NEXTAUTH_URL = "https://example.com";
    const config = robots();

    expect(config.sitemap).toBe("https://example.com/sitemap.xml");
  });
});
