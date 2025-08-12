// routes/stats.js
import { Router } from 'express';
import {
  getHighestRated,
  getLowestRated,
  getMostReviewed,
  getLeastReviewed
} from '../data/stats.js';

const router = Router();

// small helpers
const toLimit = (q) => {
  const n = Number(q);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100) : 10;
};

// courseRating (fallback to rating)
const normalize = (arr) =>
  (arr || []).map((r) => ({
    ...r,
    courseRating:
      typeof r.courseRating === 'number'
        ? r.courseRating
        : typeof r.rating === 'number'
        ? r.rating
        : null
  }));

/**
 * GET /stats
 * Query: sort=highestRated|lowestRated|mostReviewed|leastReviewed  (default highestRated)
 *        limit=number (default 10)
 * Returns JSON { sort, limit, results }
 */
router.get('/', async (req, res) => {
  try {
    const sort = String(req.query.sort || 'highestRated');
    const limit = toLimit(req.query.limit);

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

    res.json({ sort, limit, results: normalize(results) });
  } catch (err) {
    console.error('GET /stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* -------- Path-style JSON endpoints -------- */

router.get('/most-reviewed', async (req, res) => {
  try {
    const limit = toLimit(req.query.limit);
    const data = await getMostReviewed(limit);
    res.json(normalize(data));
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router.get('/least-reviewed', async (req, res) => {
  try {
    const limit = toLimit(req.query.limit);
    const data = await getLeastReviewed(limit);
    res.json(normalize(data));
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router.get('/highest-rated', async (req, res) => {
  try {
    const limit = toLimit(req.query.limit);
    const data = await getHighestRated(limit);
    res.json(normalize(data));
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router.get('/lowest-rated', async (req, res) => {
  try {
    const limit = toLimit(req.query.limit);
    const data = await getLowestRated(limit);
    res.json(normalize(data));
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

/* -------- Handlebars page -------- */
// GET /stats/page
router.get('/page', async (req, res) => {
  try {
    const limit = toLimit(req.query.limit);

    const [mostReviewed, leastReviewed, highestRated, lowestRated] =
      await Promise.all([
        getMostReviewed(limit),
        getLeastReviewed(limit),
        getHighestRated(limit),
        getLowestRated(limit)
      ]);

    res.render('stats', {
      title: 'Course Stats',
      limit,
      mostReviewed: normalize(mostReviewed),
      leastReviewed: normalize(leastReviewed),
      highestRated: normalize(highestRated),
      lowestRated: normalize(lowestRated)
    });
  } catch (e) {
    console.error('Render /stats/page error:', e);
    res.status(500).render('error', { title: 'Error', error: e.toString() });
  }
});

// optional alias: /stats/dashboard for /stats/page
router.get('/dashboard', (_req, res) => res.redirect('/stats/page'));

export default router;
