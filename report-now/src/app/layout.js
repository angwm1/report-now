// File: /src/app/layout.js
import "../styles/globals.css";
import SessionProviderWrapper from "../components/SessionProviderWrapper";
import ClientNavFooter from "../components/ClientNavFooter";
import ChatbotWidget from "../components/ChatbotWidget";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "https://report-now.vercel.app"
  ),
  title: {
    default: "Report Now - Community Issue Reporting",
    template: "%s | Report Now",
  },
  description:
    "Empowering citizens to report, track, and resolve municipal and community issues seamlessly with real-time updates and interactive map visualizations.",
  applicationName: "Report Now",
  keywords: [
    "community",
    "issue reporting",
    "civic tech",
    "municipality",
    "local reports",
    "neighbourhood",
    "infrastructure",
  ],
  authors: [{ name: "Report Now Team" }],
  creator: "Report Now",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Report Now",
    title: "Report Now - Community Issue Reporting",
    description:
      "Empowering citizens to report, track, and resolve municipal and community issues seamlessly with real-time updates and interactive map visualizations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Report Now - Community Issue Reporting",
    description:
      "Empowering citizens to report, track, and resolve municipal and community issues seamlessly.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-background">
        <SessionProviderWrapper>
          {/* ClientNavFooter is a client component that conditionally renders NavBar/Footer */}
          <ClientNavFooter>
            {children}
            <ChatbotWidget />
          </ClientNavFooter>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
