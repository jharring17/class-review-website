import { courses } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as validation from '../utils/validation.js';

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
const createCourse = async (
	adminId,
	courseCode,
	courseName,
	courseDescription,
	meetingTime,
	imgLink,
	professor
) => {
	// Get courses collection
	const coursesCollection = await courses();

	// validate admin id
	adminId = validation.validateString('adminId', adminId);
	if (!ObjectId.isValid(adminId)) throw `Error: ${adminId} is not a valid ID.`;

	// validate course code
	courseCode = validation.validateCourseCode(courseCode);
	const exists = await coursesCollection.findOne({ courseCode: courseCode });
	if (exists) throw `Error: cannot have duplicate courseCodes.`;

	// validate course name
	courseName = validation.validateCourseName(courseName);

	// validate course description
	courseDescription = validation.validateCourseDescription(courseDescription);

	// validate image link
	imgLink = await validation.validateImgLink(imgLink);

	// validate professor
	professor = validation.validateProfessor(professor);

	// Add the new course
	const newCourse = {
		adminId: adminId,
		courseCode: courseCode,
		courseName: courseName,
		courseDescription: courseDescription,
		meetingTime: new Date(meetingTime),
		imgLink: imgLink,
		professor: professor,
		courseRating: 0,
		comments: [],
	};
	const insertInfo = await coursesCollection.insertOne(newCourse);
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
	return courseList.map((course) => {
		return {
			...course,
			_id: course._id.toString(),
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
	courseId = validation.validateString('courseId', courseId);
	if (!ObjectId.isValid(courseId)) throw `Error: ${courseId} is invalid.`;

	// Find the course
	const coursesCollection = await courses();
	const courseById = await coursesCollection.findOne({ _id: new ObjectId(courseId) });
	if (!courseById) throw `Error: no course found with ID ${courseId}.`;
	courseById._id = courseById._id.toString();
	return courseById;
};

/**
 * Updates a course in the courses collection.
 * @param {string} courseId The id of the course to update.
 * @param {objectId} adminId The id of the admin used to build the course.
 * @param {string} courseCode A unique identifier applied to a course (ex: cs546)
 * @param {string} courseName The name of the course.
 * @param {string} courseDescription The description of the course.
 * @param {Date} meetingTime A date when the course meets.
 * @param {string} imgLink An image link used for a picture in the course.
 * @param {string} professor The name of the professor teaching the course.
 * @returns {object} Object containing the new course
 * @throws Will throw if the object cannot be created or if a field is invalid.
 */
const updateCourse = async (
	courseId,
	adminId,
	courseCode,
	courseName,
	courseDescription,
	meetingTime,
	imgLink,
	professor
) => {
	// get the courses collection
	const coursesCollection = await courses();

	// validate admin id
	adminId = validation.validateString('adminId', adminId);
	if (!ObjectId.isValid(adminId)) throw `Error: ${adminId} is not a valid ID.`;

	// validate course code
	courseCode = validation.validateCourseCode(courseCode);
	const exists = await coursesCollection.findOne({ courseCode: courseCode });
	if (exists) throw `Error: cannot have duplicate courseCodes.`;

	// validate course name
	courseName = validation.validateCourseName(courseName);

	// validate course description
	courseDescription = validation.validateCourseDescription(courseDescription);

	// validate image link
	imgLink = await validation.validateImgLink(imgLink);

	// validate professor
	professor = validation.validateProfessor(professor);

	// check if the course id exists
	const course = await getCourseById(courseId);
	if (!course) throw `Error: no course found with ID ${courseId}.`;

	// Create the updated course object (no update allowed for reviews or comments)
	const updatedCourse = {
		adminId: adminId,
		courseCode: courseCode,
		courseName: courseName,
		courseDescription: courseDescription,
		meetingTime: meetingTime,
		imgLink: imgLink,
		professor: professor,
	};

	// Update the course in the collection
	const updateInfo = await coursesCollection.findOneAndUpdate(
		{ _id: new ObjectId(courseId) },
		{ $set: updatedCourse },
		{ returnDocument: 'after' }
	);

	// Check if the update was successful
	if (!updateInfo) {
		throw `Could not update course with id ${courseId.toString()}`;
	}
	return updateInfo;
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
	// Validate courseId is a valid string and objectId
	courseId = validation.validateString('courseId', courseId);
	if (!ObjectId.isValid(courseId)) throw `Error: ${courseId} is invalid.`;

	// Find the course
	const coursesCollection = await courses();
	const deletedInfo = await coursesCollection.deleteOne({ _id: new ObjectId(courseId) });

	// Check if it was delete successfully
	if (deletedInfo.deletedCount !== 1) throw `Error: failed to delete record for ${courseId}`;
	return { _id: courseId, deleted: true };
};

//added most reviewed courses - SS
const getMostReviewedCourses = async () => {
	const commentsCollection = await comments();
	return await commentsCollection
		.aggregate([
			{ $group: { _id: '$courseId', reviewCount: { $sum: 1 } } },
			{ $sort: { reviewCount: -1 } },
		])
		.toArray();
};

//added least reviewed courses - SS
const getLeastReviewedCourses = async () => {
	const commentsCollection = await comments();
	return await commentsCollection
		.aggregate([
			{ $group: { _id: '$courseId', reviewCount: { $sum: 1 } } },
			{ $sort: { reviewCount: 1 } },
		])
		.toArray();
};

//added lowest rated courses - SS
const getLowestRatedCourses = async () => {
	const commentsCollection = await comments();
	return await commentsCollection
		.aggregate([
			{ $match: { rating: { $exists: true } } },
			{ $group: { _id: '$courseId', avgRating: { $avg: '$rating' } } },
			{ $sort: { avgRating: 1 } },
		])
		.toArray();
};

export {
	createCourse,
	getAllCourses,
	getCourseById,
	updateCourse,
	removeCourse,
	getMostReviewedCourses,
	getLeastReviewedCourses,
	getLowestRatedCourses,
};
