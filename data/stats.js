// Database functions to get sorted course data for the Statistics page.

import { courses } from '../config/mongoCollections.js';

function normalizeLimit(x, fallback = 10) {
  const n = Number(x);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, 100);
}

// Highest-rated (all courses whose rating == global max)
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
    // First, find the global max
    {
      $group: {
        _id: null,
        maxRating: { $max: '$rating' },
        items: {
          $push: {
            courseId: '$courseId',
            courseName: '$courseName',
            professor: '$professor',
            meetingTime: '$meetingTime',
            imgLink: '$imgLink',
            rating: '$rating',
            reviewCount: '$reviewCount'
          }
        }
      }
    },
    // Keep only items with rating == max
    {
      $project: {
        _id: 0,
        results: {
          $filter: {
            input: '$items',
            as: 'it',
            cond: { $eq: ['$$it.rating', '$maxRating'] }
          }
        }
      }
    },
    { $unwind: '$results' },
    // Nice, stable ordering within ties
    {
      $sort: {
        'results.reviewCount': -1,
        'results.courseName': 1
      }
    },
    // Optional cap if you still want to cap output size
    ...(lim ? [{ $limit: lim }] : []),
    { $replaceRoot: { newRoot: '$results' } }
  ]).toArray();
}

// Lowest-rated (all courses whose rating == global min)
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
    {
      $group: {
        _id: null,
        minRating: { $min: '$rating' },
        items: {
          $push: {
            courseId: '$courseId',
            courseName: '$courseName',
            professor: '$professor',
            meetingTime: '$meetingTime',
            imgLink: '$imgLink',
            rating: '$rating',
            reviewCount: '$reviewCount'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        results: {
          $filter: {
            input: '$items',
            as: 'it',
            cond: { $eq: ['$$it.rating', '$minRating'] }
          }
        }
      }
    },
    { $unwind: '$results' },
    { $sort: { 'results.reviewCount': -1, 'results.courseName': 1 } },
    ...(lim ? [{ $limit: lim }] : []),
    { $replaceRoot: { newRoot: '$results' } }
  ]).toArray();
}

// Most-reviewed (all courses whose reviewCount == global max)
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
    {
      $group: {
        _id: null,
        maxReviews: { $max: '$reviewCount' },
        items: {
          $push: {
            courseId: '$courseId',
            courseName: '$courseName',
            professor: '$professor',
            meetingTime: '$meetingTime',
            imgLink: '$imgLink',
            rating: '$rating',
            reviewCount: '$reviewCount'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        results: {
          $filter: {
            input: '$items',
            as: 'it',
            cond: { $eq: ['$$it.reviewCount', '$maxReviews'] }
          }
        }
      }
    },
    { $unwind: '$results' },
    { $sort: { 'results.rating': -1, 'results.courseName': 1 } },
    ...(lim ? [{ $limit: lim }] : []),
    { $replaceRoot: { newRoot: '$results' } }
  ]).toArray();
}

// Least-reviewed (all courses whose reviewCount == global min)
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
    {
      $group: {
        _id: null,
        minReviews: { $min: '$reviewCount' },
        items: {
          $push: {
            courseId: '$courseId',
            courseName: '$courseName',
            professor: '$professor',
            meetingTime: '$meetingTime',
            imgLink: '$imgLink',
            rating: '$rating',
            reviewCount: '$reviewCount'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        results: {
          $filter: {
            input: '$items',
            as: 'it',
            cond: { $eq: ['$$it.reviewCount', '$minReviews'] }
          }
        }
      }
    },
    { $unwind: '$results' },
    { $sort: { 'results.rating': -1, 'results.courseName': 1 } },
    ...(lim ? [{ $limit: lim }] : []),
    { $replaceRoot: { newRoot: '$results' } }
  ]).toArray();
}