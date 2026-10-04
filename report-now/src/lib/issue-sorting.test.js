// src/lib/issue-sorting.test.js
import {
  haversineDistance,
  sortIssues,
  DEFAULT_SORT,
} from "./issue-sorting";

describe("haversineDistance", () => {
  test("returns Infinity when any coordinate is missing or invalid", () => {
    expect(haversineDistance(null, 103.8, 1.3, 103.8)).toBe(Infinity);
    expect(haversineDistance(1.3, undefined, 1.3, 103.8)).toBe(Infinity);
    expect(haversineDistance(1.3, 103.8, null, 103.8)).toBe(Infinity);
    expect(haversineDistance(1.3, 103.8, 1.3, undefined)).toBe(Infinity);
    expect(haversineDistance("abc", 103.8, 1.3, 103.8)).toBe(Infinity);
  });

  test("calculates 0 for identical points", () => {
    const dist = haversineDistance(1.3521, 103.8198, 1.3521, 103.8198);
    expect(dist).toBeCloseTo(0, 5);
  });

  test("calculates realistic distance between two Singapore locations", () => {
    // NTU (approx 1.3483, 103.6831) to Marina Bay Sands (approx 1.2834, 103.8607)
    const dist = haversineDistance(1.3483, 103.6831, 1.2834, 103.8607);
    // Straight line distance across Singapore is approx 20-22 km
    expect(dist).toBeGreaterThan(18);
    expect(dist).toBeLessThan(25);
  });
});

describe("sortIssues", () => {
  const sampleIssues = [
    {
      id: 1,
      title: "Oldest Issue",
      createdAt: "2025-01-01T00:00:00.000Z",
      upvotes: [1],
      latitude: 1.35,
      longitude: 103.82,
    },
    {
      id: 2,
      title: "Newest Issue",
      createdAt: "2025-06-01T00:00:00.000Z",
      upvotes: [1, 2, 3],
      latitude: 1.36,
      longitude: 103.83,
    },
    {
      id: 3,
      title: "Middle Issue",
      createdAt: "2025-03-01T00:00:00.000Z",
      upvotes: [1, 2],
      latitude: null,
      longitude: null,
    },
  ];

  test("handles empty or non-array inputs gracefully", () => {
    expect(sortIssues(null)).toEqual([]);
    expect(sortIssues(undefined)).toEqual([]);
    expect(sortIssues([])).toEqual([]);
    expect(sortIssues("not-an-array")).toEqual([]);
  });

  test("filters out null or undefined items from list", () => {
    const list = [null, sampleIssues[0], undefined, sampleIssues[1]];
    const sorted = sortIssues(list, "upvotes");
    expect(sorted).toHaveLength(2);
    expect(sorted[0].id).toBe(2);
    expect(sorted[1].id).toBe(1);
  });

  test("sorts by newest descending", () => {
    const sorted = sortIssues(sampleIssues, "newest");
    expect(sorted.map((i) => i.id)).toEqual([2, 3, 1]);
  });

  test("sorts by oldest ascending", () => {
    const sorted = sortIssues(sampleIssues, "oldest");
    expect(sorted.map((i) => i.id)).toEqual([1, 3, 2]);
  });

  test("sorts by upvotes descending by default", () => {
    const sorted = sortIssues(sampleIssues, DEFAULT_SORT);
    expect(sorted.map((i) => i.id)).toEqual([2, 3, 1]);
  });

  test("handles missing or non-array upvotes properly", () => {
    const issues = [
      { id: 10, upvotes: null },
      { id: 11, upvotes: [1] },
      { id: 12, upvotes: undefined },
    ];
    const sorted = sortIssues(issues, "upvotes");
    expect(sorted[0].id).toBe(11);
  });

  test("sorts by nearest proximity when userLocation is provided", () => {
    const userLocation = { lat: 1.3501, lng: 103.8201 }; // Very close to Issue 1
    const sorted = sortIssues(sampleIssues, "nearest", userLocation);

    expect(sorted[0].id).toBe(1);
    expect(sorted[1].id).toBe(2);
    // Issue 3 has null coords and should have Infinity distance placed last
    expect(sorted[2].id).toBe(3);
    expect(sorted[2].distance).toBe(Infinity);
  });

  test("returns unchanged list when sorting nearest without userLocation", () => {
    const sorted = sortIssues(sampleIssues, "nearest", null);
    expect(sorted.map((i) => i.id)).toEqual([1, 2, 3]);
  });

  test("sorts by random maintaining item integrity", () => {
    const sorted = sortIssues(sampleIssues, "random");
    expect(sorted).toHaveLength(3);
    expect(new Set(sorted.map((i) => i.id))).toEqual(new Set([1, 2, 3]));
  });

  test("falls back to default sort for unknown sortType", () => {
    const sorted = sortIssues(sampleIssues, "unsupported-key");
    expect(sorted.map((i) => i.id)).toEqual([2, 3, 1]);
  });
});
