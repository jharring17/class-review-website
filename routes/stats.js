// Defines the Express routes for fetching course statistics.
// Calls the functions from data/stats.js and returns JSON results.

import { Router } from 'express';
import {
  getHighestRated,
  getLowestRated,
  getMostReviewed,
  getLeastReviewed
} from '../data/stats.js';

const router = Router();

/**
 * GET /stats
 * Query params:
 *   sort  = highestRated | lowestRated | mostReviewed | leastReviewed (default: highestRated)
 *   limit = number of results to return (default: 10, max: 100)
 */
router.get('/', async (req, res) => {
  try {
    // Read sort type and limit from query string
    const sort = String(req.query.sort || 'highestRated');
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    let results;

    // Decide which DB function to call based on "sort" param
    switch (sort) {
      case 'highestRated':
        results = await getHighestRated(limit);
        break;
      case 'lowestRated':
        results = await getLowestRated(limit);
        break;
      case 'mostReviewed':
        results = await getMostReviewed(limit);
        break;
      case 'leastReviewed':
        results = await getLeastReviewed(limit);
        break;
      default:
        // If sort param is invalid, return 400 (Bad Request)
        return res.status(400).json({
          error:
            "Invalid 'sort'. Use one of: highestRated, lowestRated, mostReviewed, leastReviewed."
        });
    }

    // Respond with JSON results
    res.json({ sort, limit, results });
  } catch (err) {
    console.error('GET /stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
