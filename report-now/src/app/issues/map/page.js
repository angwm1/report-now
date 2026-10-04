import MapWrapper from "@/components/MapWrapper";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  let validIssues = [];
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/issues`, {
      cache: "no-store",
    });
    if (res.ok) {
      const issues = await res.json();
      validIssues = Array.isArray(issues) ? issues : [];
    }
  } catch (err) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("Failed to fetch issues for map view:", err);
  }

  return <MapWrapper issues={validIssues} />;
}