// File: /src/app/page.js
"use client";

import HeroSection from "../components/HeroSection";
import LoginCard from "../components/LoginCard";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <div className="flex-grow flex flex-col items-center justify-center p-4 bg-gray-50">
        <LoginCard />
      </div>
    </div>
  );
}
