// middleware/auth.js
// Minimal session/role/ownership helpers

import { ObjectId } from 'mongodb';
import { courses as coursesCol } from '../config/mongoCollections.js';

// Must be logged in
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  next();
}

// Must have specific role (e.g., 'admin')
export function requireRole(role) {
  return function (req, res, next) {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    if (String(user.role) !== String(role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role.' });
    }
    next();
  };
}

// Only the comment owner may modify/delete their comment.
export async function requireCommentOwner(req, res, next) {
  try {
    const userId = req.session?.user?._id;
    if (!userId) return res.status(401).json({ error: 'Authentication required.' });

    const { courseId, commentId } = req.params;
    if (!ObjectId.isValid(String(courseId)) || !ObjectId.isValid(String(commentId))) {
      return res.status(400).json({ error: 'Invalid id.' });
    }

    const col = await coursesCol();
    const course = await col.findOne({
      _id: new ObjectId(String(courseId)),
      'comments._id': new ObjectId(String(commentId))
    }, { projection: { comments: 1 } });

    if (!course) return res.status(404).json({ error: 'Comment not found.' });

    const comment = (course.comments || []).find(c => String(c._id) === String(commentId));
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });

    if (String(comment.userId) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden: not the comment owner.' });
    }

    next();
  } catch (e) {
    console.error('requireCommentOwner error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}



