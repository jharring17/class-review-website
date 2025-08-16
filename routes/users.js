// routes/users.js
import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  removeUser,
  addViewedClass,
  loginUser
} from '../data/users.js';
import { requireAuth, requireSelfParam } from '../middleware/auth.js';

const router = express.Router();

/** GET /users */
router.get('/', async (_req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e?.toString?.() || 'Internal error' });
  }
});

/** GET /users/:id */
router.get('/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: e?.toString?.() || 'User not found' });
  }
});

/** POST /users (signup) */
router.post('/', async (req, res) => {
  try {
    const created = await createUser(req.body);
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

/** POST /users/login — sets req.session.user */
router.post('/login', async (req, res) => {
  try {
    const user = await loginUser(req.body.username, req.body.password);
    // keep only essentials in the session
    req.session.user = {
      _id: String(user._id),
      role: user.role || 'user',
      username: user.username
    };
    res.json({ ok: true, user: req.session.user });
  } catch (e) {
    res.status(401).json({ error: e?.toString?.() || 'Invalid credentials' });
  }
});

/** GET /users/logout */
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

/** PUT /users/:id — self only */
router.put('/:id', requireAuth, requireSelfParam('id'), async (req, res) => {
  try {
    const updated = await updateUser(req.params.id, req.body);
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

/** DELETE /users/:id — self only */
router.delete('/:id', requireAuth, requireSelfParam('id'), async (req, res) => {
  try {
    const result = await removeUser(req.params.id);
    if (req.session?.user?._id === req.params.id) {
      req.session.destroy(() => {});
    }
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

/** PATCH /users/:id/viewed — self only (optional feature) */
router.patch('/:id/viewed', requireAuth, requireSelfParam('id'), async (req, res) => {
  try {
    const { courseId } = req.body;
    const updatedUser = await addViewedClass(req.params.id, courseId);
    res.json(updatedUser);
  } catch (e) {
    res.status(400).json({ error: e?.toString?.() || 'Bad request' });
  }
});

export default router;

