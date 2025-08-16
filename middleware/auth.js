// middleware/auth.js
import { ObjectId } from 'mongodb';
import { courses as coursesCol } from '../config/mongoCollections.js';

// must be logged in
export const requireAuth = (req, res, next) => {
  if (!req.session?.user) return res.status(401).json({ error: 'Authentication required' });
  next();
};

// only allow acting on your own :id (e.g., PUT /users/:id)
export const requireSelfParam = (param = 'id') => (req, res, next) => {
  if (!req.session?.user) return res.status(401).json({ error: 'Authentication required' });
  if (String(req.params[param]) !== String(req.session.user._id)) {
    return res.status(403).json({ error: 'You may only modify your own profile' });
  }
  next();
};

// only the owner of an embedded comment may edit/delete it
// requires :courseId and :commentId params; comments live in courses.comments[]
export const requireCommentOwner = async (req, res, next) => {
  try {
    if (!req.session?.user) return res.status(401).json({ error: 'Authentication required' });

    const { courseId, commentId } = req.params;
    if (!ObjectId.isValid(courseId) || !ObjectId.isValid(commentId)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const col = await coursesCol();
    const doc = await col.findOne(
      { _id: new ObjectId(courseId), 'comments._id': new ObjectId(commentId) },
      { projection: { 'comments.$': 1 } }
    );

    const comment = doc?.comments?.[0];
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (String(comment.userId) !== String(req.session.user._id)) {
      return res.status(403).json({ error: 'You may only modify your own comment' });
    }
    next();
  } catch (e) {
    res.status(500).json({ error: e?.toString?.() || 'Internal error' });
  }
};

