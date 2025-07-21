import { courses } from '../config/mongoCollections';
import { ObjectId } from 'mongodb';
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

export { createCourse, getAllCourses, getCourseById, updateCourse, removeCourse };
