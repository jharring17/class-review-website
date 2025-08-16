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
  deleteComment
} from '../data/courses.js';
import { requireAuth, requireCommentOwner } from '../middleware/auth.js';

const router = Router();
const isValidId = (id) => ObjectId.isValid(String(id));

/* ---------- Courses: list/search/paginate ---------- */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
    const searchTerm = (req.query.searchTerm || '').trim();

    const all = await getAllCourses();
    const filtered = searchTerm
      ? all.filter((c) =>
          [c.courseId, c.courseName, c.professor]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : all;

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    res.json({ page, pageSize, total, items });
  } catch (e) {
    res.status(500).json({ error: e?.toString?.() || 'Internal error' });
  }
});

/* ---------- Courses: by id ---------- */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid course id' });
    const course = await getCourseById(id);
    res.json(course);
  } catch (e) {
    res.status(404).json({ error: e?.toString?.() || 'Course not found' });
  }
});

/* ---------- Courses: create/update/delete (Task 6 will add admin checks) ---------- */
router.post('/', async (req, res) => {
  try {
    const { adminId, courseId, courseName, courseDescription, meetingTime, imgLink, professor } = req.body;
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

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid course id' });
    const { adminId, courseId, courseName, courseDescription, meetingTime, imgLink, professor } = req.body;

    // ensure your data.updateCourse updates by _id
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

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid course id' });
    const result = await removeCourse(String(id));
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

/* ---------- Embedded comments under /courses/:courseId/... ---------- */

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

    const userId = req.session.user._id;
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
    const userId = req.session.user._id;
    const updated = await dislikeComment(String(courseId), String(commentId), String(userId));
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

export default router;

