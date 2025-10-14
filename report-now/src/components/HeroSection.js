// File: /src/components/HeroSection.js
"use client";

import Image from "next/image";
import LoginCard from "./LoginCard";

export default function HeroSection() {
  return (
    <section className="w-full bg-[var(--color-background)]">
      {/* --- HERO IMAGE + TITLE --- */}
      <div className="relative w-full h-80 sm:h-[420px] lg:h-[520px]">
        {/* Background image */}
        <Image
          src="/heroBanner2.jpg"
          alt="heroBanner2"
          fill
          className="object-cover object-center opacity-80 z-0"
          priority
        />

        {/* Fade at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-[var(--color-background)] z-10" />

        {/* Title (always above image) */}
        <div className="relative z-20 flex h-full top-50 lg:top-65 justify-center lg:justify-start px-4 sm:px-6 text-center lg:text-left">
          <h1
            className="
              font-bold text-primary px-30
              text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-8xl
              drop-shadow-[2px_2px_4px_rgba(0,0,0,0.74)]
            "
          >
            ReportNow
          </h1>
        </div>

        {/* Login card for large screens (right-side, half-overlap) */}
        <div
          className="
            hidden lg:block
            absolute right-12 xl:right-44 bottom-50 translate-y-1/2
            w-[min(92vw,28rem)] z-30
          "
        >
          <LoginCard />
        </div>
      </div>

      {/* --- MOBILE/TABLET VERSION: card BELOW banner --- */}
      <div className="block lg:hidden px-4 sm:px-6 mt-4 sm:mt-6 md:mt-8 flex justify-center">
        <div className="w-[min(92vw,28rem)]">
          <LoginCard />
        </div>
      </div>
    </section>
  );
}
