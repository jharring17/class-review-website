import { courses } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as validation from '../utils/validation.js'

/**
 * Creates a new course in the courses collection.
 * @param {objectId} adminId The id of the admin used to build the course.
 * @param {string} courseId A unique identifier applied to a course (ex: cs546)
 * @param {string} courseName The name of the course.
 * @param {string} courseDescription The description of the course.
 * @param {Date} meetingTime A date when the course meets.
 * @param {string} imgLink An image link used for a picture in the course.
 * @param {string} professor The name of the professor teaching the course. 
 * @returns {object} Object containing the new course
 * @throws Will throw if the object cannot be created or if a field is invalid.
 */

//added helper function to update course comments directly - SS
const updateCourseComments = async (courseId, newComment) => {
	const coursesCollection = await courses();
	const updatedInfo = await coursesCollection.updateOne(
		{_id: new ObjectId(courseId)},
		{$push: {comments: newComment}}
	);
	if (updatedInfo.modifiedCount === 0) throw `Could not add comment to course ${courseId}`;
};

const createCourse = async (
	adminId,
	courseId,
	courseName,
	courseDescription,
	imgLink,
	professor
) => {
	// Get courses collection
	const coursesCollection = await courses();

	// Validation
	adminId = validation.validateString("adminId", adminId)
	if (!ObjectId.isValid(adminId)) throw `Error: ${adminId} is not a valid ID.`
	courseId = validation.validateCourseId(courseId)
	const exists = await coursesCollection.findOne({ courseId: courseId });
	if (exists) throw `Error: cannot have duplicate courseIds.`
	courseName = validation.validateCourseName(courseName)
	courseDescription = validation.validateCourseDescription(courseDescription)
	imgLink = await validation.validateImgLink(imgLink)
	professor = validation.validateProfessor(professor)

	// Add the new course
	const newCourse = {
		adminId: adminId,
		courseId: courseId,
		courseName: courseName,
		courseDescription: courseDescription,
		imgLink: imgLink,
		professor: professor,
		courseRating: null,
		ratingCount: 0,
		ratings: [],
		comments: []
	}
	const insertInfo = await coursesCollection.insertOne(newCourse)
	if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not create course.';
	return await getCourseById(insertInfo.insertedId.toString());
};

/**
 * Returns all courses from the courses collection.
 * @returns {object} Object containing success status and ID of deleted object.
 * @throws Will throw an error if the ID is invalid or not in collection.
 */
const getAllCourses = async () => {
	const coursesCollection = await courses();
	const courseList = await coursesCollection.find({}).toArray();
	return courseList.map(course => {
        return {
            ...course,
            _id: course._id.toString()
        };
    });
};

/**
 * Gets a course by ID from the course collection.
 * The value provided must be a non-empty, valid object ID.
 * @param {string} courseId - An id used to uniquely identify a course
 * @returns {object} Object representing the course.
 * @throws Will throw an error if the ID is invalid or not in collection.
 */
const getCourseById = async (courseId) => {
	// Validate courseId is a valid string and objectId
	courseId = validation.validateString("courseId", courseId)
	if (!ObjectId.isValid(courseId)) throw `Error: ${courseId} is invalid.`
	
	// Find the course
	const coursesCollection = await courses();
	const courseById = await coursesCollection.findOne({ _id: new ObjectId(courseId) })
	if (!courseById) throw `Error: no course found with ID ${courseId}.`
	courseById._id = courseById._id.toString()
	return courseById
};

/**
 * Updates a course in the courses collection.
 * @param {ObjectId} adminId The id of the admin used to build the course.
 * @param {string} courseId A unique identifier applied to a course (ex: cs546)
 * @param {string} courseName The name of the course.
 * @param {string} courseDescription The description of the course.
 * @param {Date} meetingTime A date when the course meets.
 * @param {string} imgLink An image link used for a picture in the course.
 * @param {string} professor The name of the professor teaching the course. 
 * @returns {object} Object containing the new course
 * @throws Will throw if the object cannot be created or if a field is invalid.
 */
const updateCourse = async (
	adminCreated,
	courseId,
	courseName,
	courseDescription,
	imgLink,
	professor
) => {
	const coursesCollection = await courses();
	
	// validate the inputs
	adminCreated = validation.validateString("adminId", adminCreated)
	if (!ObjectId.isValid(adminCreated)) throw `Error: ${adminCreated} is not a valid ID.`
	courseId = validation.validateCourseId(courseId)
	const exists = await coursesCollection.findOne({ courseId: courseId });
	if (exists) throw `Error: cannot have duplicate courseIds.`
	courseName = validation.validateCourseName(courseName)
	courseDescription = validation.validateCourseDescription(courseDescription)
	imgLink = await validation.validateImgLink(imgLink)
	professor = validation.validateProfessor(professor)

	// Create the updated course object (no update allowed for reviews or comments)
	const updatedCourse = {
		adminId: adminCreated,
		courseId: courseId,
		courseName: courseName,
		courseDescription: courseDescription,
		imgLink: imgLink,
		professor: professor,
	};
	
	// Update the course in the collection
	const updatedInfo = await coursesCollection.findOneAndUpdate(
		{ _id: new ObjectId(courseId) },
		{ $set: updatedCourse },
		{ returnDocument: 'after' }
	);
	if (!updatedInfo.value) throw `Error: could not update course with ID ${courseId}.`
	updatedInfo.value._id = updatedInfo.value._id.toString();
	return updatedInfo.value;
};

/**
 * Removes a course by ID from the course collection.
 * The value provided must be a non-empty, valid object ID.
 * @param {string} courseId - An id used to uniquely identify a course
 * @returns {object} Object containing success status and ID of deleted object.
 * @throws Will throw an error if the ID is invalid or not in collection.
 */
const removeCourse = async (courseId) => {
	// validate the course ID
	courseId = validation.validateString("courseId", courseId)
	if (!ObjectId.isValid(courseId)) throw `Error: ${courseId} is invalid.`

	// Find the course
	const coursesCollection = await courses();
	const deletedInfo = await coursesCollection.deleteOne({ _id: new ObjectId(courseId) })
	
	// Check if it was delete successfully
	if (deletedInfo.deletedCount !== 1) throw `Error: failed to delete record for ${courseId}`
	return { _id: courseId, deleted: true}
};

//COURSE REVIEWS AND RATINGS
// STATS helpers (now based on comment ratings, 1 to 5)

const getMostReviewedCourses = async () => {
  const coursesCollection = await courses();
  return await coursesCollection
    .aggregate([
      {
        $project: {
          courseId: 1,
          reviewCount: {
            $size: {
              $filter: {
                input: { $ifNull: ['$comments', []] },
                as: 'c',
                cond: {
                  $and: [
                    { $isNumber: '$$c.rating' },
                    { $gte: ['$$c.rating', 1] },
                    { $lte: ['$$c.rating', 5] }
                  ]
                }
              }
            }
          }
        }
      },
      { $group: { _id: null, maxReviewCount: { $max: '$reviewCount' }, items: { $push: '$$ROOT' } } },
      {
        $project: {
          _id: 0,
          results: {
            $filter: { input: '$items', as: 'it', cond: { $eq: ['$$it.reviewCount', '$maxReviewCount'] } }
          }
        }
      },
      { $unwind: '$results' },
      { $replaceRoot: { newRoot: '$results' } }
    ])
    .toArray();
};

const getLeastReviewedCourses = async () => {
  const coursesCollection = await courses();
  return await coursesCollection
    .aggregate([
      {
        $project: {
          courseId: 1,
          reviewCount: {
            $size: {
              $filter: {
                input: { $ifNull: ['$comments', []] },
                as: 'c',
                cond: {
                  $and: [
                    { $isNumber: '$$c.rating' },
                    { $gte: ['$$c.rating', 1] },
                    { $lte: ['$$c.rating', 5] }
                  ]
                }
              }
            }
          }
        }
      },
      { $group: { _id: null, minReviewCount: { $min: '$reviewCount' }, items: { $push: '$$ROOT' } } },
      {
        $project: {
          _id: 0,
          results: {
            $filter: { input: '$items', as: 'it', cond: { $eq: ['$$it.reviewCount', '$minReviewCount'] } }
          }
        }
      },
      { $unwind: '$results' },
      { $replaceRoot: { newRoot: '$results' } }
    ])
    .toArray();
};

const getHighestRatedCourses = async () => {
  const coursesCollection = await courses();
  return await coursesCollection
    .aggregate([
      {
        $project: {
          courseId: 1,
          avgRating: {
            $avg: {
              $map: {
                input: {
                  $filter: {
                    input: { $ifNull: ['$comments', []] },
                    as: 'c',
                    cond: {
                      $and: [
                        { $isNumber: '$$c.rating' },
                        { $gte: ['$$c.rating', 1] },
                        { $lte: ['$$c.rating', 5] }
                      ]
                    }
                  }
                }
              },
              as: 'c',
              in: '$$c.rating'
            }
          }
        }
      },
      { $match: { avgRating: { $ne: null } } },
      { $group: { _id: null, maxAvg: { $max: '$avgRating' }, items: { $push: '$$ROOT' } } },
      {
        $project: {
          _id: 0,
          results: { $filter: { input: '$items', as: 'it', cond: { $eq: ['$$it.avgRating', '$maxAvg'] } } }
        }
      },
      { $unwind: '$results' },
      { $replaceRoot: { newRoot: '$results' } }
    ])
    .toArray();
};

const getLowestRatedCourses = async () => {
  const coursesCollection = await courses();
  return await coursesCollection
    .aggregate([
      {
        $project: {
          courseId: 1,
          avgRating: {
            $avg: {
              $map: {
                input: {
                  $filter: {
                    input: { $ifNull: ['$comments', []] },
                    as: 'c',
                    cond: {
                      $and: [
                        { $isNumber: '$$c.rating' },
                        { $gte: ['$$c.rating', 1] },
                        { $lte: ['$$c.rating', 5] }
                      ]
                    }
                  }
                }
              },
              as: 'c',
              in: '$$c.rating'
            }
          }
        }
      },
      { $match: { avgRating: { $ne: null } } },
      { $group: { _id: null, minAvg: { $min: '$avgRating' }, items: { $push: '$$ROOT' } } },
      {
        $project: {
          _id: 0,
          results: { $filter: { input: '$items', as: 'it', cond: { $eq: ['$$it.avgRating', '$minAvg'] } } }
        }
      },
      { $unwind: '$results' },
      { $replaceRoot: { newRoot: '$results' } }
    ])
    .toArray();
};

// Recalculate courseRating/ratingCount from comment ratings
const recalcCourseRatingFromComments = async (courseId) => {
  courseId = validation.validateString('courseId', courseId);
  if (!ObjectId.isValid(courseId)) throw `Error: ${courseId} is invalid.`;

  const coursesCollection = await courses();

  const agg = await coursesCollection
    .aggregate([
      { $match: { _id: new ObjectId(courseId) } },
      {
        $project: {
          avgRating: {
            $avg: {
              $map: {
                input: {
                  $filter: {
                    input: { $ifNull: ['$comments', []] },
                    as: 'c',
                    cond: {
                      $and: [
                        { $isNumber: '$$c.rating' },
                        { $gte: ['$$c.rating', 1] },
                        { $lte: ['$$c.rating', 5] }
                      ]
                    }
                  }
                }
              },
              as: 'c',
              in: '$$c.rating'
            }
          },
          count: {
            $size: {
              $filter: {
                input: { $ifNull: ['$comments', []] },
                as: 'c',
                cond: {
                  $and: [
                    { $isNumber: '$$c.rating' },
                    { $gte: ['$$c.rating', 1] },
                    { $lte: ['$$c.rating', 5] }
                  ]
                }
              }
            }
          }
        }
      }
    ])
    .toArray();

  const avg = agg[0] && typeof agg[0].avgRating === 'number' ? agg[0].avgRating : null;
  const cnt = agg[0] && typeof agg[0].count === 'number' ? agg[0].count : 0;

  await coursesCollection.updateOne(
    { _id: new ObjectId(courseId) },
    { $set: { courseRating: avg, ratingCount: cnt } }
  );

  return { courseRating: avg, ratingCount: cnt };
};

//COMMENTS

//Create a comment for a course
const createComment = async (userId, courseId, text, rating = null) => {
  userId = validation.validateString("userId", userId);
  courseId = validation.validateString("courseId", courseId);
  text = validation.validateString("text", text);

  if (rating !== null) {
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      throw "Rating must be a number between 1 and 5 or null.";
    }
  }

  const newComment = {
    _id: new ObjectId(),
    userId: new ObjectId(userId),
    text: text,
    likes: [],
    dislikes: [],
    rating: rating,
    createdAt: new Date()
  };

  const coursesCollection = await courses();
  const updateInfo = await coursesCollection.updateOne(
    { _id: new ObjectId(courseId) },
    { $push: { comments: newComment } }
  );

  if (updateInfo.modifiedCount === 0) throw "Could not add comment.";

  if (rating !== null) await recalcCourseRatingFromComments(courseId);

  return newComment;
};

//Get all comments for a course
const getCommentsByCourse = async (courseId) => {
  courseId = validation.validateString("courseId", courseId);
  const course = await getCourseById(courseId);
  return course.comments || [];
};

//Update a comment's text
const updateComment = async (courseId, commentId, newText, newRating = undefined) => {
  courseId = validation.validateString("courseId", courseId);
  commentId = validation.validateString("commentId", commentId);
  newText = validation.validateString("newText", newText);
  if (newRating !== undefined && newRating !== null) {
	if (typeof newRating !== 'number' || newRating < 1 || newRating > 5) {
		throw 'Rating must be a number between 1 and 5.';
	}
  }

  const setDoc = {'comments.$.text': newText, 'comments.$.updatedAt': new Date()};
  if (newRating !== undefined) {
	setDoc['comments.$.rating'] = newRating;
  }

  const coursesCollection = await courses();
  const updateInfo = await coursesCollection.updateOne(
    { _id: new ObjectId(courseId), "comments._id": new ObjectId(commentId) },
    { $set: setDoc}
  );

  if (updateInfo.modifiedCount === 0) throw "Could not update comment.";

  if (newRating !== undefined) await recalcCourseRatingFromComments(courseId);

  return await getCommentsByCourse(courseId);
};

//Like a comment
const likeComment = async (courseId, commentId, userId) => {
  courseId = validation.validateString("courseId", courseId);
  commentId = validation.validateString("commentId", commentId);
  userId = validation.validateString("userId", userId);

  const coursesCollection = await courses();
  const updateInfo = await coursesCollection.updateOne(
    { _id: new ObjectId(courseId), "comments._id": new ObjectId(commentId) },
    {
      $addToSet: { "comments.$.likes": userId },
      $pull: { "comments.$.dislikes": userId }
    }
  );

  if (updateInfo.modifiedCount === 0) throw "Could not like comment.";
  return await getCommentsByCourse(courseId);
};

//Dislike a comment
const dislikeComment = async (courseId, commentId, userId) => {
  courseId = validation.validateString("courseId", courseId);
  commentId = validation.validateString("commentId", commentId);
  userId = validation.validateString("userId", userId);

  const coursesCollection = await courses();
  const updateInfo = await coursesCollection.updateOne(
    { _id: new ObjectId(courseId), "comments._id": new ObjectId(commentId) },
    {
      $addToSet: { "comments.$.dislikes": userId },
      $pull: { "comments.$.likes": userId }
    }
  );

  if (updateInfo.modifiedCount === 0) throw "Could not dislike comment.";

  return await getCommentsByCourse(courseId);
};

//Delete a comment
const deleteComment = async (courseId, commentId) => {
  courseId = validation.validateString("courseId", courseId);
  commentId = validation.validateString("commentId", commentId);

  const coursesCollection = await courses();
  const updateInfo = await coursesCollection.updateOne(
    { _id: new ObjectId(courseId) },
    { $pull: { comments: { _id: new ObjectId(commentId) } } }
  );

  if (updateInfo.modifiedCount === 0) throw "Could not delete comment.";

  await recalcCourseRatingFromComments(courseId);

  return { deleted: true };
};

//Course ratings calculation
const recalcCourseRatingFromRatings = async (courseId) => {
	//Not used by the comment-based flow anymore...keeping so existing callers won't break.
  courseId = validation.validateString("courseId", courseId);
  if (!ObjectId.isValid(courseId)) throw `Error: ${courseId} is invalid.`;

  const coursesCollection = await courses();

  const agg = await coursesCollection.aggregate([
    { $match: { _id: new ObjectId(courseId) } },
    {
      $project: {
        avgRating: {
          $avg: {
            $map: {
              input: {
                $filter: {
                  input: { $ifNull: ["$ratings", []] },
                  as: "r",
                  cond: {
                    $and: [
                      { $gte: ["$$r.rating", 1] },
                      { $lte: ["$$r.rating", 5] }
                    ]
                  }
                }
              },
              as: "r",
              in: "$$r.rating"
            }
          }
        },
        count: {
          $size: {
            $filter: {
              input: { $ifNull: ["$ratings", []] },
              as: "r",
              cond: {
                $and: [
                  { $gte: ["$$r.rating", 1] },
                  { $lte: ["$$r.rating", 5] }
                ]
              }
            }
          }
        }
      }
    }
  ]).toArray();

  const avg = (agg[0] && typeof agg[0].avgRating === "number") ? agg[0].avgRating : null;
  const cnt = (agg[0] && typeof agg[0].count === "number") ? agg[0].count : 0;

  await coursesCollection.updateOne(
    { _id: new ObjectId(courseId) },
    { $set: { courseRating: avg, ratingCount: cnt } }
  );

  return { courseRating: avg, ratingCount: cnt };
};

//Create or update the current user's course rating
const setCourseRating = async (courseId, userId, rating) => {
  courseId = validation.validateString("courseId", courseId);
  userId = validation.validateString("userId", userId);

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    throw "Rating must be a number between 1 and 5.";
  }

  const coursesCollection = await courses();
  const courseObjId = new ObjectId(courseId);
  const userObjId = new ObjectId(userId);

  //If user already rated, can update it
  const updated = await coursesCollection.updateOne(
    { _id: courseObjId, "ratings.userId": userObjId },
    { $set: { "ratings.$.rating": rating, "ratings.$.updatedAt": new Date() } }
  );

  if (updated.matchedCount === 0) {
    //no existing rating for this user -> push new
    await coursesCollection.updateOne(
      { _id: courseObjId },
      { $push: { ratings: { userId: userObjId, rating, createdAt: new Date(), updatedAt: new Date() } } }
    );
  }

  return await recalcCourseRatingFromRatings(courseId);
};

//Remove the current user's course rating
const removeCourseRating = async (courseId, userId) => {
  courseId = validation.validateString("courseId", courseId);
  userId = validation.validateString("userId", userId);

  const coursesCollection = await courses();

  const res = await coursesCollection.updateOne(
    { _id: new ObjectId(courseId) },
    { $pull: { ratings: { userId: new ObjectId(userId) } } }
  );
  if (res.matchedCount === 0) throw `Course ${courseId} not found.`;

  return await recalcCourseRatingFromRatings(courseId);
};


export { 
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  removeCourse,
  getMostReviewedCourses,
  getLeastReviewedCourses,
  getHighestRatedCourses,
  getLowestRatedCourses,

  //comments (embedded)
  createComment,
  updateCourseComments,
  getCommentsByCourse,
  updateComment,
  likeComment,
  dislikeComment,
  deleteComment,

  //course-level ratings
  setCourseRating,
  removeCourseRating,
  recalcCourseRatingFromRatings,

  //comment-based rating (primary)
  recalcCourseRatingFromComments
};