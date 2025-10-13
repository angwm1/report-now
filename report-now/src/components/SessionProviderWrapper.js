// File: /src/components/SessionProviderWrapper.js
"use client"; // This is a client component

import { SessionProvider } from "next-auth/react";

export default function SessionProviderWrapper({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}