// File: /src/components/HintsCard.js
"use client";

import React from "react";

export default function HintsCard({ items = [] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-base font-semibold text-foreground">Ideas</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No ideas yet.
        </p>
      ) : (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {items.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
