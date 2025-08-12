// Database functions to get sorted course data for the Statistics page.

import { courses } from '../config/mongoCollections.js';

/**
 * Ensure limit is a valid number (cap at 100)
 */
function normalizeLimit(x, fallback = 10) {
  const n = Number(x);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, 100);
}

/**
 * Highest-rated courses
 */
export async function getHighestRated(limit = 10) {
  const col = await courses();
  const lim = normalizeLimit(limit);
  return col.aggregate([
    {
      $addFields: {
        rating: { $ifNull: ['$courseRating', 0] },
        reviewCount: { $size: { $ifNull: ['$comments', []] } }
      }
    },
    { $sort: { rating: -1, reviewCount: -1, courseName: 1 } },
    { $limit: lim },
    {
      $project: {
        courseId: 1, courseName: 1, professor: 1, meetingTime: 1, imgLink: 1,
        courseRating: '$rating', reviewCount: 1
      }
    }
  ]).toArray();
}

/**
 * Lowest-rated courses
 */
export async function getLowestRated(limit = 10) {
  const col = await courses();
  const lim = normalizeLimit(limit);
  return col.aggregate([
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
        courseId: 1, courseName: 1, professor: 1, meetingTime: 1, imgLink: 1,
        courseRating: '$rating', reviewCount: 1
      }
    }
  ]).toArray();
}

/**
 * Most-reviewed courses
 */
export async function getMostReviewed(limit = 10) {
  const col = await courses();
  const lim = normalizeLimit(limit);
  return col.aggregate([
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
        courseId: 1, courseName: 1, professor: 1, meetingTime: 1, imgLink: 1,
        courseRating: '$rating', reviewCount: 1
      }
    }
  ]).toArray();
}

/**
 * Least-reviewed courses
 */
export async function getLeastReviewed(limit = 10) {
  const col = await courses();
  const lim = normalizeLimit(limit);
  return col.aggregate([
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
        courseId: 1, courseName: 1, professor: 1, meetingTime: 1, imgLink: 1,
        courseRating: '$rating', reviewCount: 1
      }
    }
  ]).toArray();
}

