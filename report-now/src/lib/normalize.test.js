import { normalizeIdList, normalizeUserId } from "./normalize";

describe("normalizeIdList", () => {
  test("returns empty array when input is not an array", () => {
    expect(normalizeIdList(null)).toEqual([]);
    expect(normalizeIdList(undefined)).toEqual([]);
    expect(normalizeIdList("123")).toEqual([]);
    expect(normalizeIdList(42)).toEqual([]);
    expect(normalizeIdList({})).toEqual([]);
  });

  test("normalizes numeric values and deduplicates", () => {
    expect(normalizeIdList([1, 2, 3, 2, 1])).toEqual([1, 2, 3]);
  });

  test("parses numeric strings into integers", () => {
    expect(normalizeIdList(["10", "20", "30"])).toEqual([10, 20, 30]);
  });

  test("filters out invalid entries, floats, NaNs, and non-numeric types", () => {
    const raw = [1, "42", "not-a-number", null, undefined, true, 3.14, {}, []];
    expect(normalizeIdList(raw)).toEqual([1, 42]);
  });

  test("handles empty array", () => {
    expect(normalizeIdList([])).toEqual([]);
  });
});

describe("normalizeUserId", () => {
  test("returns integer directly when given a valid integer", () => {
    expect(normalizeUserId(5)).toBe(5);
    expect(normalizeUserId(0)).toBe(0);
    expect(normalizeUserId(-1)).toBe(-1);
  });

  test("parses valid integer strings", () => {
    expect(normalizeUserId("42")).toBe(42);
    expect(normalizeUserId("100")).toBe(100);
  });

  test("returns null for non-integer numbers or non-numeric values", () => {
    expect(normalizeUserId(3.14)).toBeNull();
    expect(normalizeUserId(null)).toBeNull();
    expect(normalizeUserId(undefined)).toBeNull();
    expect(normalizeUserId("abc")).toBeNull();
    expect(normalizeUserId({})).toBeNull();
    expect(normalizeUserId([])).toBeNull();
    expect(normalizeUserId(true)).toBeNull();
  });
});
