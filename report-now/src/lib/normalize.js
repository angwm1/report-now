/**
 * Normalizes a list of issue or user IDs into a deduplicated array of integers.
 * Handles numbers, numeric strings, and filters out null, NaN, or non-integer items.
 *
 * @param {unknown} raw - Raw input value, expected to be an array of IDs.
 * @returns {number[]} Deduplicated array of valid integer IDs.
 */
export function normalizeIdList(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  const numericValues = raw
    .map((value) => {
      if (typeof value === "number") {
        return value;
      }
      if (typeof value === "string") {
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
      }
      return null;
    })
    .filter((value) => typeof value === "number" && Number.isInteger(value));

  return Array.from(new Set(numericValues));
}

/**
 * Normalizes a user ID into a valid integer, or returns null if invalid.
 *
 * @param {unknown} raw - Raw user ID, can be number, numeric string, or other.
 * @returns {number | null} Normalized integer user ID, or null.
 */
export function normalizeUserId(raw) {
  if (typeof raw === "number" && Number.isInteger(raw)) {
    return raw;
  }

  if (typeof raw === "string") {
    const parsed = Number.parseInt(raw, 10);
    return Number.isInteger(parsed) ? parsed : null;
  }

  return null;
}
