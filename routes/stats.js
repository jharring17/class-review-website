//routes/stats.js

import express from 'express';
import {
  getMostReviewedCourses,
  getLeastReviewedCourses,
  getHighestRatedCourses,
  getLowestRatedCourses
} from '../data/courses.js';

const router = express.Router();

// GET /stats/most-reviewed
router.get('/most-reviewed', async (req, res) => {
  try {
    const data = await getMostReviewedCourses();
    res.json(data);
  } 
  catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// GET /stats/least-reviewed
router.get('/least-reviewed', async (req, res) => {
  try {
    const data = await getLeastReviewedCourses();
    res.json(data);
  } 
  catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// GET /stats/highest-rated
router.get('/highest-rated', async (req, res) => {
  try {
    const data = await getHighestRatedCourses();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// GET /stats/lowest-rated
router.get('/lowest-rated', async (req, res) => {
  try {
    const data = await getLowestRatedCourses();
    res.json(data);
  } 
  catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

export default router;
