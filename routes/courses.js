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

//Helpers 
const isValidId = (id) => ObjectId.isValid(String(id));

//Courses

// GET /courses  (paginated; also supports ?searchTerm=)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
    const searchTerm = (req.query.searchTerm || '').trim();

    // If searching, do it at the DB layer
    if (searchTerm) {
      const col = await coursesCol();
      const rx = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const cursor = col.find({ $or: [{ courseId: rx }, { courseName: rx }, { professor: rx }] });
      const total = await cursor.count();
      const items = await cursor.skip((page - 1) * pageSize).limit(pageSize).toArray();
      return res.json({ page, pageSize, total, items });
    }

    // Otherwise, get all and page in memory (can be swapped for DB paging later)
    const all = await getAllCourses();
    const total = all.length;
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    res.json({ page, pageSize, total, items });
  } catch (e) {
    res.status(500).json({ error: e?.toString?.() || 'Internal error' });
  }
});

// GET /courses/:id
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

// POST /courses  [Admin]
// Body: { adminId, courseId, courseName, courseDescription, meetingTime, imgLink, professor }
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
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// PUT /courses/:id  [Admin]
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
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// DELETE /courses/:id  [Admin]
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid course id' });
    const result = await removeCourse(id);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

//Embedded Comments (under /courses/:courseId/...)

// GET /courses/:courseId/comments
router.get('/:courseId/comments', async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!isValidId(courseId)) return res.status(400).json({ error: 'Invalid course id' });
    const list = await getCommentsByCourse(courseId);
    res.json(list);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// POST /courses/:courseId/comments
// Body: { userId, text, rating? }
router.post('/:courseId/comments', async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!isValidId(courseId)) return res.status(400).json({ error: 'Invalid course id' });

    const { userId, text, rating } = req.body;
    const newComment = await createComment(String(userId), String(courseId), String(text), rating ?? null);
    res.status(201).json(newComment);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// PUT /courses/:courseId/comments/:commentId
router.put('/:courseId/comments/:commentId', async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    if (!isValidId(courseId) || !isValidId(commentId)) return res.status(400).json({ error: 'Invalid id' });
    const { newText } = req.body;
    const updated = await updateComment(String(courseId), String(commentId), String(newText));
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// POST /courses/:courseId/comments/:commentId/like
router.post('/:courseId/comments/:commentId/like', async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    const { userId } = req.body;
    if (!isValidId(courseId) || !isValidId(commentId)) return res.status(400).json({ error: 'Invalid id' });
    const updated = await likeComment(String(courseId), String(commentId), String(userId));
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// POST /courses/:courseId/comments/:commentId/dislike
router.post('/:courseId/comments/:commentId/dislike', async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    const { userId } = req.body;
    if (!isValidId(courseId) || !isValidId(commentId)) return res.status(400).json({ error: 'Invalid id' });
    const updated = await dislikeComment(String(courseId), String(commentId), String(userId));
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

// DELETE /courses/:courseId/comments/:commentId
router.delete('/:courseId/comments/:commentId', async (req, res) => {
  try {
    const { courseId, commentId } = req.params;
    if (!isValidId(courseId) || !isValidId(commentId)) return res.status(400).json({ error: 'Invalid id' });
    const result = await deleteComment(String(courseId), String(commentId));
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

export default router;
