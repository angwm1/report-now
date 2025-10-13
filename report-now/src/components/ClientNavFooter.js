// File: /src/components/ClientNavFooter.js
"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";
import Footer from "./Footer";

/**
 * This component checks the current path (using usePathname) and
 * conditionally renders NavBar/Footer only if pathname !== "/".
 * 
 * You can customize the logic (e.g., hide NavBar/Footer for multiple routes).
 */
export default function ClientNavFooter({ children }) {
  const pathname = usePathname();

  // If on the home page "/", hide NavBar & Footer
  const showNavFooter = pathname !== "/" && pathname !== "/register";

  return (
    <>
      {showNavFooter && <NavBar />}
      <main className="flex-grow">{children}</main>
      {showNavFooter && <Footer />}
    </>
  );
}