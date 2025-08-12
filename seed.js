import { courseData, commentData } from './data/index.js';
import {dbConnection, closeConnection} from './config/mongoConnections.js';
import { ObjectId } from 'mongodb';

const db = await dbConnection();
await db.dropDatabase();

const adminId = new ObjectId();

console.log('Starting database operations...');
try {
    const course_one = await courseData.createCourse(
        adminId.toString(),
        'cs546',
        'Software Engineering',
        'An advanced course in software engineering principles and practices.',
        new Date('2023-09-01T10:00:00Z'),
        'https://example.com/course-image.jpg',
        'Jane Doe'
    )
    console.log('Created Course One:', course_one);
} catch (e) {
  console.error('Error during database operations:', e);
}

await closeConnection();
console.log('Database operations completed and connection closed.');