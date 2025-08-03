import { courses } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { comments } from '../config/mongoCollections.js'; //added for stats - SS
// import validation functions

const createCourse = async (
	adminCreated,
	courseId,
	courseName,
	courseDescription,
	meetingTime,
	imgLink,
	professor
) => {
	// validate the inputs
	// courseRating & comments will be initialized as nothing
	const newCourse = {
		adminCreated,
		courseId,
		courseName,
		courseDescription,
		meetingTime,
		imgLink,
		professor,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	const coursesCollection = await courses();
	const insertInfo = await coursesCollection.insertOne(newCourse);
	if (!insertInfo.insertedId) throw 'Could not create course';
	return await coursesCollection.findOne({_id: insertInfo.insertedId});
};

/**
 * Returns all courses from the courses collection.
 * @returns {object} Object containing success status and ID of deleted object.
 * @throws Will throw an error if the ID is invalid or not in collection.
 */
const getAllCourses = async () => {
	const coursesCollection = await courses();
	const courseList = await coursesCollection.find({}).toArray();
	return courseList;
};

/**
 * Gets a course by ID from the course collection.
 * The value provided must be a non-empty, valid object ID.
 * @param {string} courseId - An id used to uniquely identify a course
 * @returns {object} Object representing the course.
 * @throws Will throw an error if the ID is invalid or not in collection.
 */
const getCourseById = async (courseId) => {
	// validate the course ID
};

const updateCourse = async (
	adminCreated,
	courseId,
	courseName,
	courseDescription,
	meetingTime,
	imgLink,
	professor
) => {
	// validate the inputs
	// courseRating & comments will be initialized as nothing
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
};

//added most reviewed courses - SS
const getMostReviewedCourses = async () => {
	const commentsCollection = await comments();
	return await commentsCollection.aggregate([
		{$group: {_id: "$courseId", reviewCount: {$sum: 1}}},
		{$sort: {reviewCount: -1}}
	]).toArray();
};

//added least reviewed courses - SS
const getLeastReviewedCourses = async () => {
	const commentsCollection = await comments();
	return await commentsCollection.aggregate([
		{$group: {_id: "$courseId", reviewCount: {$sum: 1}}},
		{$sort: {reviewCount: 1}}
	]).toArray();
};

//added lowest rated courses - SS
const getLowestRatedCourses = async () => {
	const commentsCollection = await comments();
	return await commentsCollection.aggregate([
		{$match: {rating: {$exists: true}}},
		{$group: {_id: "$courseId", avgRating: {$avg: "$rating"}}},
		{$sort: {avgRating: 1}}
	]).toArray();
};

export { createCourse, getAllCourses, getCourseById, updateCourse, removeCourse, getMostReviewedCourses, getLeastReviewedCourses, getLowestRatedCourses }; //added new exports for getting most reviewed, least reviewed, and lowest rated courses - SS