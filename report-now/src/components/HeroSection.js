// File: /src/components/HeroSection.js
"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="relative w-full h-64 md:h-80 lg:h-[400px]">
      <Image
        src="/gardens.jpg"
        alt="Gardens by the Bay"
        fill
        className="object-cover object-center"
        priority
      />
      {/* Overlay to dim the background */}
      {/* <div className="absolute inset-0 bg-black bg-opacity-40" /> */}
      {/* Centered title */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1
          className="text-3xl md:text-5xl lg:text-6xl font-bold drop-shadow-md"
          style={{ color: "#FF6F3C", textShadow: "2px 2px 4px rgba(0,0,0,0.7)" }}
        >
          Report Service
        </h1>
      </div>
    </div>
  );
}
