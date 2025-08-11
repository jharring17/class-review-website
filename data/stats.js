// Database functions to get sorted course data for the Statistics page.

import { classes } from '../config/mongoCollections.js';

/**
 * Helper function to make sure "limit" is a valid number
 * - Defaults to fallback if invalid
 * - Caps limit at 100 to prevent accidentally pulling huge datasets
 */
function normalizeLimit(x, fallback = 10) {
  const n = Number(x);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, 100);
}

/**
 * Get highest-rated courses.
 * Sort order:
 *   1) Highest courseRating
 *   2) Most reviews (reviewCount)
 *   3) Alphabetical courseName
 */
export async function getHighestRated(limit = 10) {
  const col = await classes();
  const lim = normalizeLimit(limit);
  return col
    .aggregate([
      {
        $addFields: {
          rating: { $ifNull: ['$courseRating', 0] }, // default to 0 if null
          reviewCount: { $size: { $ifNull: ['$comments', []] } } // count comments array
        }
      },
      { $sort: { rating: -1, reviewCount: -1, courseName: 1 } },
      { $limit: lim },
      {
        $project: {
          courseId: 1,
          courseName: 1,
          professor: 1,
          meetingTime: 1,
          imgLink: 1,
          courseRating: '$rating',
          reviewCount: 1
        }
      }
    ])
    .toArray();
}

/**
 * Get lowest-rated courses.
 * Sort order:
 *   1) Lowest courseRating
 *   2) Most reviews
 *   3) Alphabetical courseName
 */
export async function getLowestRated(limit = 10) {
  const col = await classes();
  const lim = normalizeLimit(limit);
  return col
    .aggregate([
      {
        $addFields: {
          rating: { $ifNull: ['$courseRating', 0] },
          reviewCount: { $size: { $ifNull: ['$comments', []] } }
        }
      },
      { $sort: { rating: 1, reviewCount: -1, courseName: 1 } },
      { $limit: lim },
      {
        $project: {
          courseId: 1,
          courseName: 1,
          professor: 1,
          meetingTime: 1,
          imgLink: 1,
          courseRating: '$rating',
          reviewCount: 1
        }
      }
    ])
    .toArray();
}

/**
 * Get most-reviewed courses.
 * Sort order:
 *   1) Highest reviewCount
 *   2) Highest rating
 *   3) Alphabetical courseName
 */
export async function getMostReviewed(limit = 10) {
  const col = await classes();
  const lim = normalizeLimit(limit);
  return col
    .aggregate([
      {
        $addFields: {
          reviewCount: { $size: { $ifNull: ['$comments', []] } },
          rating: { $ifNull: ['$courseRating', 0] }
        }
      },
      { $sort: { reviewCount: -1, rating: -1, courseName: 1 } },
      { $limit: lim },
      {
        $project: {
          courseId: 1,
          courseName: 1,
          professor: 1,
          meetingTime: 1,
          imgLink: 1,
          courseRating: '$rating',
          reviewCount: 1
        }
      }
    ])
    .toArray();
}

/**
 * Get least-reviewed courses.
 * Sort order:
 *   1) Lowest reviewCount
 *   2) Highest rating
 *   3) Alphabetical courseName
 */
export async function getLeastReviewed(limit = 10) {
  const col = await classes();
  const lim = normalizeLimit(limit);
  return col
    .aggregate([
      {
        $addFields: {
          reviewCount: { $size: { $ifNull: ['$comments', []] } },
          rating: { $ifNull: ['$courseRating', 0] }
        }
      },
      { $sort: { reviewCount: 1, rating: -1, courseName: 1 } },
      { $limit: lim },
      {
        $project: {
          courseId: 1,
          courseName: 1,
          professor: 1,
          meetingTime: 1,
          imgLink: 1,
          courseRating: '$rating',
          reviewCount: 1
        }
      }
    ])
    .toArray();
}
