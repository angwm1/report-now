// File: /src/app/layout.js
import "../styles/globals.css";
import SessionProviderWrapper from "../components/SessionProviderWrapper";
import ClientNavFooter from "../components/ClientNavFooter";

export const metadata = {
  title: "Report Service",
  description: "Report community issues seamlessly",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-50">
        <SessionProviderWrapper>
          {/* ClientNavFooter is a client component that conditionally renders NavBar/Footer */}
          <ClientNavFooter>
            {children}
          </ClientNavFooter>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}