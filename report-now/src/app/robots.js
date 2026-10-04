export default function robots() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://report-now.vercel.app";
  const cleanBase = baseUrl.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/superAdmin/", "/account/"],
      },
    ],
    sitemap: `${cleanBase}/sitemap.xml`,
  };
}
