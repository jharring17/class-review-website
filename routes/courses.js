// routes/courses.js
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  removeCourse,
  // embedded comments:
  createComment,
  getCommentsByCourse,
  updateComment,
  likeComment,
  dislikeComment,
  deleteComment,
} from '../data/courses.js';

import { courses as coursesCol } from '../config/mongoCollections.js';
import { requireAuth, requireRole, requireCommentOwner } from '../middleware/auth.js';

const router = Router();

/* =========================
   Helpers
========================= */
const isValidId = (id) => ObjectId.isValid(String(id));

const toPosInt = (val, def) => {
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
};

// escape for regex
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// DB-side search with paging
async function findCoursesByQuery(q, page = 1, pageSize = 10) {
  const col = await coursesCol();
  const rx = new RegExp(esc(q), 'i');
  const filter = { $or: [{ courseId: rx }, { courseName: rx }, { professor: rx }] };

  const total = await col.countDocuments(filter);
  const items = await col
    .find(filter)
    .sort({ courseId: 1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();

  return { total, items };
}

/* =========================
   Pages / HTML routes
========================= */

// GET /courses/allCourses  (renders list)
router.get('/allCourses', async (req, res) => {
  try {
    const page = toPosInt(req.query.page, 1);
    const pageSize = Math.min(50, toPosInt(req.query.pageSize, 10));
    const searchTerm = (req.query.searchTerm || '').trim();

    if (searchTerm) {
      const { total, items } = await findCoursesByQuery(searchTerm, page, pageSize);
      return res.json({ page, pageSize, total, items });
    }

    const all = await getAllCourses();
    const total = all.length;
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);

    return res.status(200).render('allCourses', { page, pageSize, total, items });
  } catch (e) {
    return res.status(500).json({ error: e?.toString?.() || 'Internal error' });
  }
});

// GET /courses/search (render form)
router.get('/search', (req, res) => {
  console.log('GET /courses/search', req.query);
  const q = (req.query.q || '').trim();
  if (q) return res.redirect(`/courses/search/results?q=${encodeURIComponent(q)}`);
  return res.render('courses/search', { title: 'Search Courses' });
});

// POST /courses/search (redirect to results)
router.post('/search', (req, res) => {
  const q = (req.body.q || '').trim();
  const url = q ? `/courses/search/results?q=${encodeURIComponent(q)}` : '/courses/search';
  res.redirect(url);
});

// GET /courses/search/results (render results)
router.get('/search/results', async (req, res) => {
  console.log('GET /courses/search/results', req.query);
  try {
    const qRaw = (req.query.q || '').trim();
    const q = qRaw.length > 64 ? qRaw.slice(0, 64) : qRaw;
    const page = toPosInt(req.query.page, 1);
    const pageSize = Math.min(50, toPosInt(req.query.pageSize, 10));

    if (!q) {
      return res.status(400).render('courses/search', {
        title: 'Search Courses',
        q: '',
        error: 'Please enter a search term.',
      });
    }

    const { total, items } = await findCoursesByQuery(q, page, pageSize);

    const itemsWithLinks = items.map((d) => ({
      ...d,
      idStr: String(d._id),
    }));

    const hasPrev = page > 1;
    const hasNext = page * pageSize < total;

    return res.render('courses/searchResults', {
      title: `Search: ${q}`,
      q,
      page,
      pageSize,
      total,
      items: itemsWithLinks,
      hasPrev,
      hasNext,
      prevLink: hasPrev
        ? `/courses/search/results?q=${encodeURIComponent(q)}&page=${page - 1}&pageSize=${pageSize}`
        : null,
      nextLink: hasNext
        ? `/courses/search/results?q=${encodeURIComponent(q)}&page=${page + 1}&pageSize=${pageSize}`
        : null,
    });
  } catch (e) {
    console.error('GET /courses/search/results error:', e);
    return res
      .status(500)
      .render('error', { title: 'Error', error: e?.toString?.() || 'Internal server error' });
  }
});

/* =========================
   JSON API list
========================= */
router.get('/', async (req, res) => {
  try {
    const page = toPosInt(req.query.page, 1);
    const pageSize = Math.min(50, toPosInt(req.query.pageSize, 10));
    const searchTerm = (req.query.searchTerm || '').trim();

    if (searchTerm) {
      const { total, items } = await findCoursesByQuery(searchTerm, page, pageSize);
      return res.json({ page, pageSize, total, items });
    }

    const all = await getAllCourses();
    const total = all.length;
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return res.json({ page, pageSize, total, items });
  } catch (e) {
    return res.status(500).json({ error: e?.toString?.() || 'Internal error' });
  }
});

/* =========================
   Course page
========================= */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid course id' });

    const course = await getCourseById(id);
    return res.status(200).render('coursePage', {
      title: `${course.courseId}: ${course.courseName}`,
      course,
    });
  } catch (e) {
    return res.status(404).json({ error: e?.toString?.() || 'Course not found' });
  }
});

/* =========================
   Admin create/update/delete
========================= */
// Role checks: must be logged in and have role === 'admin'
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const {
      adminId,
      courseId,
      courseName,
      courseDescription,
      meetingTime,
      imgLink,
      professor,
    } = req.body;

    const created = await createCourse(
      String(adminId),
      String(courseId),
      String(courseName),
      String(courseDescription),
      meetingTime ? new Date(meetingTime) : new Date(),
      String(imgLink),
      String(professor)
    );
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid course id' });

    const {
      adminId,
      courseId,
      courseName,
      courseDescription,
      meetingTime,
      imgLink,
      professor,
    } = req.body;

    const updated = await updateCourse(
      String(id),
      String(adminId),
      String(courseId),
      String(courseName),
      String(courseDescription),
      meetingTime ? new Date(meetingTime) : new Date(),
      String(imgLink),
      String(professor)
    );
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid course id' });
    const result = await removeCourse(String(id));
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

/* =========================
   Embedded comments (protected)
========================= */

// list comments
router.get('/:courseId/comments', async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!isValidId(courseId)) return res.status(400).json({ error: 'Invalid course id' });
    const list = await getCommentsByCourse(String(courseId));
    res.json(list);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// create comment — must be logged in; userId from session only
router.post('/:courseId/comments', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!isValidId(courseId)) return res.status(400).json({ error: 'Invalid course id' });

    const userId = req.session.user._id; // don’t trust body.userId
    const { text, rating } = req.body;

    const newComment = await createComment(String(userId), String(courseId), String(text), rating ?? null);
    res.status(201).json(newComment);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// update comment — owner only
router.put('/:courseId/comments/:commentId', requireAuth, requireCommentOwner, async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    if (!isValidId(courseId) || !isValidId(commentId))
      return res.status(400).json({ error: 'Invalid id' });

    const { newText } = req.body;
    const updated = await updateComment(String(courseId), String(commentId), String(newText));
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// delete comment — owner only
router.delete('/:courseId/comments/:commentId', requireAuth, requireCommentOwner, async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    if (!isValidId(courseId) || !isValidId(commentId))
      return res.status(400).json({ error: 'Invalid id' });

    const result = await deleteComment(String(courseId), String(commentId));
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// like/dislike — logged in; userId from session only
router.post('/:courseId/comments/:commentId/like', requireAuth, async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    if (!isValidId(courseId) || !isValidId(commentId))
      return res.status(400).json({ error: 'Invalid id' });

    const userId = req.session.user._id;
    const updated = await likeComment(String(courseId), String(commentId), String(userId));
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

router.post('/:courseId/comments/:commentId/dislike', requireAuth, async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    if (!isValidId(courseId) || !isValidId(commentId))
      return res.status(400).json({ error: 'Invalid id' });

    const userId = req.session.user._id;
    const updated = await dislikeComment(String(courseId), String(commentId), String(userId));
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

export default router;

