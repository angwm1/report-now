// File: /src/app/issues/map/page.jsx
import MapWrapper from "../../../components/MapWrapper";

export default async function MapPage() {
 // Use an absolute URL so Next.js can fetch from the server
 const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
 const res = await fetch(`${baseUrl}/api/issues`, { cache: "no-store" });
 const issues = await res.json();

 return (
    <MapWrapper issues={issues} />
 );
}
