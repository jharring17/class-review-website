import { courseData, commentData } from './data/index.js';
import {dbConnection, closeConnection} from './config/mongoConnections.js';
import { ObjectId } from 'mongodb';

const db = await dbConnection();
await db.dropDatabase();

const adminId = new ObjectId();

let course_one = null;
let course_two = null;

console.log('Starting database operations...');
console.log("\n\n")
try {
      course_one = await courseData.createCourse(
        adminId.toString(),
        'cs-546',
        'Software Engineering',
        'An advanced course in software engineering principles and practices.',
        new Date('2023-09-01'),
        'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
        'Jane Doe'
    )
    console.log('Created Course One:', course_one);
} catch (e) {
  console.error('Error during database operations:', e);
}

console.log("\n\n")
try {
    const get_course_one =await courseData.getCourseById(course_one._id);
    console.log('Retrieved Course One by ID:', get_course_one);
} catch (e) {
    console.error('Error retrieving course:', e);
}

// make another course
console.log("\n\n")
try {
      course_two = await courseData.createCourse(
        adminId.toString(),
        'MA-101',
        'Calculus I',
        'An introductory course to differential and integral calculus.',
        new Date('2023-09-02'),
        'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg',
        'Jack Harrington'
    )
    console.log('Created Course Two:', course_two);
} catch (e) {
  console.error('Error during database operations:', e);
}

// get all courses
console.log("\n\n")
try {
    const all_courses = await courseData.getAllCourses();
    console.log('All Courses:', all_courses);
} catch (e) {
    console.error('Error retrieving all courses:', e);
}

// update course one
console.log("\n\n")
try {
    const updated_course_one = await courseData.updateCourse(
        course_one._id.toString(),
        adminId.toString(),
        'CS-545',
        'Software Engineering',
        'UPDATED THIS',
        new Date('2023-09-01'),
        'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
        'Jane Doe'
    )
    console.log('Updated Course One:', updated_course_one);
} catch (e) {
    console.error('Error updating course:', e);
}

await closeConnection();
console.log('Database operations completed and connection closed.');