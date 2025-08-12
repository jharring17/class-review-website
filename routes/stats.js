// Unified stats routes: supports both query-style (/stats?sort=...)
// and path-style (/stats/most-reviewed, etc.).

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
 *   limit = number of results to return (default: 10, max in data layer: 100)
 */
router.get('/', async (req, res) => {
  try {
    const sort = String(req.query.sort || 'highestRated');
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    let results;
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
        return res.status(400).json({
          error:
            "Invalid 'sort'. Use one of: highestRated, lowestRated, mostReviewed, leastReviewed."
        });
    }

    res.json({ sort, limit, results });
  } catch (err) {
    console.error('GET /stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** Path-style endpoints for compatibility with main branch */

// GET /stats/most-reviewed
router.get('/most-reviewed', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const data = await getMostReviewed(limit);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// GET /stats/least-reviewed
router.get('/least-reviewed', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const data = await getLeastReviewed(limit);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// GET /stats/highest-rated
router.get('/highest-rated', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const data = await getHighestRated(limit);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// GET /stats/lowest-rated
router.get('/lowest-rated', async (req, res) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const data = await getLowestRated(limit);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

export default router;

