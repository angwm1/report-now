// src/lib/issue-sorting.js

export const DEFAULT_SORT = "upvotes";

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula.
 *
 * @param {number|null|undefined} lat1 Latitude of point 1
 * @param {number|null|undefined} lon1 Longitude of point 1
 * @param {number|null|undefined} lat2 Latitude of point 2
 * @param {number|null|undefined} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers, or Infinity if coordinates are invalid.
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null ||
    Number.isNaN(Number(lat1)) ||
    Number.isNaN(Number(lon1)) ||
    Number.isNaN(Number(lat2)) ||
    Number.isNaN(Number(lon2))
  ) {
    return Infinity;
  }

  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  const R = 6371; // Earth's mean radius in km
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Sorts a list of municipal issues based on chosen criteria.
 *
 * @param {Array} list Array of issues
 * @param {string} sortType Criteria: "newest", "oldest", "nearest", "upvotes", "random"
 * @param {{lat: number, lng: number}|null} userLocation Current user coordinates for proximity sorting
 * @returns {Array} Sorted array of issues
 */
export function sortIssues(list, sortType = DEFAULT_SORT, userLocation = null) {
  if (!Array.isArray(list)) {
    return [];
  }

  const sortKey = sortType || DEFAULT_SORT;
  const result = list.filter((issue) => issue != null);

  switch (sortKey) {
    case "newest":
      return result.sort(
        (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
      );

    case "oldest":
      return result.sort(
        (a, b) => new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0)
      );

    case "nearest": {
      if (
        userLocation &&
        userLocation.lat != null &&
        userLocation.lng != null
      ) {
        return result
          .map((issue) => {
            if (issue?.latitude == null || issue?.longitude == null) {
              return { ...issue, distance: Infinity };
            }
            const distance = haversineDistance(
              userLocation.lat,
              userLocation.lng,
              issue.latitude,
              issue.longitude
            );
            return { ...issue, distance };
          })
          .sort(
            (a, b) => (a?.distance ?? Infinity) - (b?.distance ?? Infinity)
          );
      }
      return result;
    }

    case "upvotes":
      return result.sort((a, b) => {
        const aVotes = Array.isArray(a?.upvotes) ? a.upvotes.length : 0;
        const bVotes = Array.isArray(b?.upvotes) ? b.upvotes.length : 0;
        return bVotes - aVotes;
      });

    case "random": {
      const shuffled = [...result];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    default:
      return sortIssues(result, DEFAULT_SORT, userLocation);
  }
}
