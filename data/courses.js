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
const createCourse = async (
	adminId,
	courseId,
	courseName,
	courseDescription,
	meetingTime,
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
	//todo: validate meetingTime
	imgLink = await validation.validateImgLink(imgLink)
	professor = validation.validateProfessor(professor)

	// Add the new course
	newCourse = {
		adminId: adminId,
		courseId: courseId,
		courseName: courseName,
		courseDescription: courseDescription,
		meetingTime: meetingTime,
		imgLink: imgLink,
		professor: professor,
		courseRating: 0,
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
const updateCourse = async (
	adminCreated,
	courseId,
	courseName,
	courseDescription,
	meetingTime,
	imgLink,
	professor
) => {
	const coursesCollection = await courses();
	
	// validate the inputs
	adminCreated = validation.validateString("adminId", adminCreated)
	if (!ObjectId.isValid(adminId)) throw `Error: ${adminCreated} is not a valid ID.`
	courseId = validation.validateCourseId(courseId)
	const exists = await coursesCollection.findOne({ courseId: courseId });
	if (exists) throw `Error: cannot have duplicate courseIds.`
	courseName = validation.validateCourseName(courseName)
	courseDescription = validation.validateCourseDescription(courseDescription)
	//todo: validate meetingTime
	imgLink = await validation.validateImgLink(imgLink)
	professor = validation.validateProfessor(professor)

	// Create the updated course object (no update allowed for reviews or comments)
	const updatedCourse = {
		adminId: adminCreated,
		courseId: courseId,
		courseName: courseName,
		courseDescription: courseDescription,
		meetingTime: meetingTime,
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
	// Validate courseId is a valid string and objectId
	courseId = validation.validateString("courseId", courseId)
	if (!ObjectId.isValid(courseId)) throw `Error: ${courseId} is invalid.`

	// Find the course
	const coursesCollection = await courses();
	const deletedInfo = await coursesCollection.deleteOne({ _id: new ObjectId(courseId) })
	
	// Check if it was delete successfully
	if (deletedInfo.deletedCount !== 1) throw `Error: failed to delete record for ${courseId}`
	return { _id: courseId, deleted: true}
};

export { createCourse, getAllCourses, getCourseById, updateCourse, removeCourse };