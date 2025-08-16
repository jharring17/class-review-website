import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { courses as coursesCol } from '../config/mongoCollections.js';
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
  deleteComment
} from '../data/courses.js';

const router = Router();

// Helpers
const isValidId = (id) => ObjectId.isValid(String(id));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toPosInt = (v, def) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
};

// common DB search used by both pages
async function findCoursesByQuery(q, page, pageSize) {
  const col = await coursesCol();
  const rx = new RegExp(esc(q), 'i');

  const cursor = col.find({
    $or: [{ courseId: rx }, { courseName: rx }, { professor: rx }]
  });

  const total = await cursor.count();
  const items = await cursor.skip((page - 1) * pageSize).limit(pageSize).toArray();

  return { total, items };
}

// ---- HTML search page ----

// GET /courses/search
router.get('/search', async (req, res) => {
  try {
    const qRaw = (req.query.q || '').trim();
    const q = qRaw.length > 64 ? qRaw.slice(0, 64) : qRaw;
    const page = toPosInt(req.query.page, 1);
    const pageSize = Math.min(50, toPosInt(req.query.pageSize, 10));

    if (!q) {
      // render empty search page
      return res.render('courses/search', { title: 'Search Courses', q: '' });
    }

    const { total, items } = await findCoursesByQuery(q, page, pageSize);

    return res.render('courses/search', {
      title: 'Search Courses',
      q,
      page,
      pageSize,
      total,
      items
    });
  } catch (e) {
    return res
      .status(500)
      .render('error', { title: 'Error', error: e?.toString?.() || 'Internal server error' });
  }
});

// POST /courses/search
router.post('/search', (req, res) => {
  const q = (req.body.q || '').trim();
  const url = q ? `/courses/search?q=${encodeURIComponent(q)}` : '/courses/search';
  res.redirect(url);
});

// GET /courses/search/results
router.get('/search/results', async (req, res) => {
  try {
    const qRaw = (req.query.q || '').trim();
    const q = qRaw.length > 64 ? qRaw.slice(0, 64) : qRaw;
    const page = toPosInt(req.query.page, 1);
    const pageSize = Math.min(50, toPosInt(req.query.pageSize, 10));

    if (!q) {
      return res.status(400).render('courses/search', {
        title: 'Search Courses',
        q: '',
        error: 'Please enter a search term.'
      });
    }

    const { total, items } = await findCoursesByQuery(q, page, pageSize);

    const hasPrev = page > 1;
    const hasNext = page * pageSize < total;

    return res.render('courses/searchResults', {
      title: `Search: ${q}`,
      q,
      page,
      pageSize,
      total,
      items,
      hasPrev,
      hasNext,
      prevLink: hasPrev
        ? `/courses/search/results?q=${encodeURIComponent(q)}&page=${page - 1}&pageSize=${pageSize}`
        : null,
      nextLink: hasNext
        ? `/courses/search/results?q=${encodeURIComponent(q)}&page=${page + 1}&pageSize=${pageSize}`
        : null
    });
  } catch (e) {
    console.error('GET /courses/search/results error:', e);
    return res
      .status(500)
      .render('error', { title: 'Error', error: e?.toString?.() || 'Internal server error' });
  }
});

// Courses

// GET /courses
router.get('/', async (req, res) => {
  try {
    const page = toPosInt(req.query.page, 1);
    const pageSize = Math.min(50, toPosInt(req.query.pageSize, 10));
    const searchTerm = (req.query.searchTerm || '').trim();

    if (searchTerm) {
      // DB-side search for JSON variant
      const { total, items } = await findCoursesByQuery(searchTerm, page, pageSize);
      return res.json({ page, pageSize, total, items });
    }

    // Otherwise just list/paginate all (simple in-memory paging)
    const all = await getAllCourses();
    const total = all.length;
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return res.json({ page, pageSize, total, items });
  } catch (e) {
    return res.status(500).json({ error: e?.toString?.() || 'Internal error' });
  }
});

// Course by ID

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid course id' });
    const course = await getCourseById(id);
    return res.json(course);
  } catch (e) {
    return res.status(404).json({ error: e?.toString?.() || 'Course not found' });
  }
});

// Admin create/update/delete

// POST /courses
router.post('/', async (req, res) => {
  try {
    const {
      adminId, courseId, courseName, courseDescription,
      meetingTime, imgLink, professor
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
    return res.status(201).json(created);
  } catch (e) {
    return res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// PUT /courses/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid course id' });

    const {
      adminId, courseId, courseName, courseDescription,
      meetingTime, imgLink, professor
    } = req.body;

    const updated = await updateCourse(
      String(adminId),
      String(courseId),
      String(courseName),
      String(courseDescription),
      meetingTime ? new Date(meetingTime) : new Date(),
      String(imgLink),
      String(professor)
    );
    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// DELETE /courses/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid course id' });
    const result = await removeCourse(id);
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// Embedded comments

// GET /courses/:courseId/comments
router.get('/:courseId/comments', async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!isValidId(courseId)) return res.status(400).json({ error: 'Invalid course id' });
    const list = await getCommentsByCourse(courseId);
    return res.json(list);
  } catch (e) {
    return res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// POST /courses/:courseId/comments
router.post('/:courseId/comments', async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!isValidId(courseId)) return res.status(400).json({ error: 'Invalid course id' });

    const { userId, text, rating } = req.body;
    const newComment = await createComment(String(userId), String(courseId), String(text), rating ?? null);
    return res.status(201).json(newComment);
  } catch (e) {
    return res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// PUT /courses/:courseId/comments/:commentId
router.put('/:courseId/comments/:commentId', async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    if (!isValidId(courseId) || !isValidId(commentId)) return res.status(400).json({ error: 'Invalid id' });
    const { newText } = req.body;
    const updated = await updateComment(String(courseId), String(commentId), String(newText));
    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// POST /courses/:courseId/comments/:commentId/like
router.post('/:courseId/comments/:commentId/like', async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    const { userId } = req.body;
    if (!isValidId(courseId) || !isValidId(commentId)) return res.status(400).json({ error: 'Invalid id' });
    const updated = await likeComment(String(courseId), String(commentId), String(userId));
    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// POST /courses/:courseId/comments/:commentId/dislike
router.post('/:courseId/comments/:commentId/dislike', async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    const { userId } = req.body;
    if (!isValidId(courseId) || !isValidId(commentId)) return res.status(400).json({ error: 'Invalid id' });
    const updated = await dislikeComment(String(courseId), String(commentId), String(userId));
    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// DELETE /courses/:courseId/comments/:commentId
router.delete('/:courseId/comments/:commentId', async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    if (!isValidId(courseId) || !isValidId(commentId)) return res.status(400).json({ error: 'Invalid id' });
    const result = await deleteComment(String(courseId), String(commentId));
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

export default router;
