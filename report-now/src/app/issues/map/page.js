//// File: /src/app/issues/map/page.jsx
//import MapWrapper from "../../../components/MapWrapper";
//
//export default async function MapPage() {
//  // Use an absolute URL so Next.js can fetch from the server
//  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
//  const res = await fetch(`${baseUrl}/api/issues`, { cache: "no-store" });
//  const issues = await res.json();
//
//  return (
//    <div className="min-h-screen flex flex-col bg-gray-50 p-4">
//      <h1 className="text-2xl font-bold mb-4">Incidents Nearby</h1>
//      <p className="text-sm text-gray-500 mb-4">Showing {issues.length} results</p>
//      <div className="flex-grow">
//        <MapWrapper issues={issues} />
//      </div>
//    </div>
//  );
//}
