import { ObjectId } from 'mongodb';
import { validateString } from '../utils/validation.js';
import { comments } from '../config/mongoCollections.js';

const createComment = async (userId, courseId, text) => {
  userId = validateString('userId', userId);
  courseId = validateString('courseId', courseId);
  text = validateString('text', text);

  const newComment = {
    userId: new ObjectId(userId),
    courseId: new ObjectId(courseId),
    text,
    createdAt: new Date()
  };

  const commentsCollection = await comments();
  const insertInfo = await commentsCollection.insertOne(newComment);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not create comment.';

  return await getCommentById(insertInfo.insertedId.toString());
};

const getAllComments = async () => {
  const commentsCollection = await comments();
  return await commentsCollection.find({}).toArray();
};

const getCommentById = async (id) => {
  id = validateString('id', id);
  const commentsCollection = await comments();
  const comment = await commentsCollection.findOne({ _id: new ObjectId(id) });
  if (!comment) throw 'No comment found with the provided id.';
  return comment;
};

const getCommentsByUser = async (userId) => {
  userId = validateString('userId', userId);
  const commentsCollection = await comments();
  return await commentsCollection.find({ userId: new ObjectId(userId) }).toArray();
};

const getCommentsByCourse = async (courseId) => {
  courseId = validateString('courseId', courseId);
  const commentsCollection = await comments();
  return await commentsCollection.find({ courseId: new ObjectId(courseId) }).toArray();
};

const updateComment = async (commentId, newText) => {
  commentId = validateString('commentId', commentId);
  newText = validateString('newText', newText);

  const commentsCollection = await comments();
  const updated = await commentsCollection.findOneAndUpdate(
    { _id: new ObjectId(commentId) },
    { $set: { text: newText, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );

  if (!updated.value) throw 'Could not update comment.';
  return updated.value;
};

const deleteComment = async (commentId) => {
  commentId = validateString('commentId', commentId);
  const commentsCollection = await comments();
  const deletionInfo = await commentsCollection.deleteOne({ _id: new ObjectId(commentId) });
  if (deletionInfo.deletedCount === 0) throw 'Could not delete comment.';
  return { deleted: true };
};

export {
  createComment,
  getAllComments,
  getCommentById,
  getCommentsByUser,
  getCommentsByCourse,
  updateComment,
  deleteComment
};
