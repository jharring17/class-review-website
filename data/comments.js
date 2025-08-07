import { ObjectId } from 'mongodb';
import { validateString } from '../utils/validation.js';
import { courses } from '../config/mongoCollections.js';

const createComment = async (userId, courseId, text) => {
  userId = validateString('userId', userId);
  courseId = validateString('courseId', courseId);
  text = validateString('text', text);

  const newComment = {
    userId: new ObjectId(userId),
    courseId: new ObjectId(courseId),
    text,
    likes:[], //added extra feature for likes/dislikes and ratings - SS
    dislikes: [],
    rating: null,
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

//like a comment feature - SS
const likeComment = async (commentId, userId) => {
  commentId = validateString('commentId', commentId);
  userId = validateString('userId', userId);
  const commentsCollection = await comments();
  const updated = await commentsCollection.findOneAndUpdate(
    {_id: new ObjectId(commentId)},
    {
      $addToSet: {likes: userId},
      $pull: {dislikes: userId}
    },
    {returnDocument: 'after'}
  );
  if (!updated.value) throw 'Could not like a comment.';
  return updated.value;
};

//dislike a comment feature - SS
const dislikeComment = async (commentId, userId) => {
  commentId = validateString('commentId', commentId);
  userId = validateString('userId', userId);
  const commentsCollection = await comments();
  const updated = await commentsCollections.findOneAndUpdate(
    {_id: new ObjectId(commentId)},
    {
      $addToSet: {dislikes: userId},
      $pull: {likes: userId}
    },
    {returnDocument: 'after'}
  );
  if (!updated.value) throw 'Could not dislike comment.';
  return updated.value;
}

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
  deleteComment,
  likeComment, //new export for likes function - SS
  dislikeComment //new export for dislikes function - SS
};
