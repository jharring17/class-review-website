import { Router } from 'express';
const router = Router();
import { coursesData } from '../data/index.js';
import * as validation from '../utils/validation.js';

// Route to get all courses (unrestricted access)
router.get('/', async (req, res) => {
	try {
		const courses = await coursesData.getAllCourses();
		res.json(courses);
	} catch (e) {
		res.status(500).json({ error: e });
	}
});

// Route to get a course by ID (unrestricted access)
router.get('/:courseId', async (req, res) => {
	const courseId = req.params.courseId;
	try {
		validation.validateCourseCode(courseId);
		const course = await coursesData.getCourseById(courseId);
		if (!course) {
			return res.status(404).json({ error: `Course with ID ${courseId} not found.` });
		}
		res.json(course);
	} catch (e) {
		res.status(400).json({ error: e });
	}
});

// Route to get most reviewed courses (unrestricted access)
router.get('/most-reviewed', async (req, res) => {
	try {
		const courses = await coursesData.getMostReviewedCourses();
		res.json(courses);
	} catch (e) {
		res.status(500).json({ error: e });
	}
});

// Route to get least reviewed courses (unrestricted access)
router.get('/least-reviewed', async (req, res) => {
	try {
		const courses = await coursesData.getLeastReviewedCourses();
		res.json(courses);
	} catch (e) {
		res.status(500).json({ error: e });
	}
});

// Route to get lowest rated courses (unrestricted access)
router.get('/lowest-rated', async (req, res) => {
	try {
		const courses = await coursesData.getLowestRatedCourses();
		res.json(courses);
	} catch (e) {
		res.status(500).json({ error: e });
	}
});

// Route to create a new course (admin access only)
router.post('/', async (req, res) => {
	const { adminId, courseCode, courseName, courseDescription, meetingTime, imgLink, professor } =
		req.body;
	try {
		validation.validateCourseCode(courseCode);
		validation.validateCourseName(courseName);
		validation.validateCourseDescription(courseDescription);
		validation.validateImgLink(imgLink);
		validation.validateProfessor(professor);

		const newCourse = await coursesData.createCourse(
			adminId,
			courseCode,
			courseName,
			courseDescription,
			meetingTime,
			imgLink,
			professor
		);
		res.status(201).json(newCourse);
	} catch (e) {
		res.status(400).json({ error: e });
	}
});

// Route to update a course (admin access only)
router.put('/:courseId', async (req, res) => {
	const courseId = req.params.courseId;
	const { adminId, courseCode, courseName, courseDescription, meetingTime, imgLink, professor } =
		req.body;
	try {
		validation.validateCourseCode(courseCode);
		validation.validateCourseName(courseName);
		validation.validateCourseDescription(courseDescription);
		validation.validateImgLink(imgLink);
		validation.validateProfessor(professor);

		const updatedCourse = await coursesData.updateCourse(
			courseId,
			adminId,
			courseCode,
			courseName,
			courseDescription,
			meetingTime,
			imgLink,
			professor
		);
		res.json(updatedCourse);
	} catch (e) {
		res.status(400).json({ error: e });
	}
});

// Route to delete a course (admin access only)
router.delete('/:courseId', async (req, res) => {
	const courseId = req.params.courseId;
	try {
		validation.validateCourseCode(courseId);
		const deletedCourse = await coursesData.deleteCourse(courseId);
		res.json(deletedCourse);
	} catch (e) {
		res.status(400).json({ error: e });
	}
});

export default router;
