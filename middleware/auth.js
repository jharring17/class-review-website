// middleware/auth.js
// Session-based auth + role checks + comment ownership checks

import { ObjectId } from 'mongodb';
import { courses as coursesCol } from '../config/mongoCollections.js';

/**
 * Require that a user is logged in (session-auth).
 */
export function requireAuth(req, res, next) {
  const user = req.session?.user;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

/**
 * Role-based guard.
 * Usage: requireRole('admin') or requireRole('admin', 'instructor')
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.session?.user?.role;
    if (!role) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

/**
 * Ensure the logged-in user owns the comment (or is admin).
 * Expects :courseId and :commentId route params.
 */
export async function requireCommentOwner(req, res, next) {
  try {
    const { courseId, commentId } = req.params;

    if (!ObjectId.isValid(String(courseId)) || !ObjectId.isValid(String(commentId))) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    // Admins can bypass ownership checks if you want:
    if (user.role === 'admin') return next();

    const col = await coursesCol();
    const course = await col.findOne(
      { _id: new ObjectId(courseId), 'comments._id': new ObjectId(commentId) },
      { projection: { 'comments.$': 1 } }
    );

    if (!course || !course.comments?.length) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = course.comments[0];
    const ownerId = String(comment.userId);
    if (ownerId !== String(user._id)) {
      return res.status(403).json({ error: 'Forbidden: not the comment owner' });
    }

    next();
  } catch (e) {
    console.error('requireCommentOwner error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}


