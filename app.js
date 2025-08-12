import { courseData } from './data/index.js';
import {dbConnection, closeConnection} from './config/mongoConnections.js';
import { ObjectId } from 'mongodb';

const db = await dbConnection();
await db.dropDatabase();

const adminId = new ObjectId();

console.log('Starting database operations...');
try {
    const course_one = await courseData.createCourse(
        adminId.toString(),
        'cs-546',
        'Software Engineering',
        'An advanced course in software engineering principles and practices.',
        new Date('2023-09-01T10:00:00Z'),
        'https://picsum.photos/300.jpg',
        'Jane Doe'
    )
    console.log('Created Course One:', course_one);

    // ---- Seed block: comments + ratings ----
    const user1 = new ObjectId(); // fake users for seeding
    const user2 = new ObjectId();

    // comments (rating is optional; we include it here)
    await courseData.createComment(user1.toString(), course_one._id, 'Great course!', 5);
    await courseData.createComment(user2.toString(), course_one._id, 'Pretty good', 4);

    // course ratings (these drive highest/lowest-rated)
    await courseData.setCourseRating(course_one._id, user1.toString(), 5);
    await courseData.setCourseRating(course_one._id, user2.toString(), 4);

    // quick check
    const after = await courseData.getCourseById(course_one._id);
    console.log('After seeding:', {
      courseId: after.courseId,
      courseRating: after.courseRating,
      ratingCount: after.ratingCount,
      commentCount: after.comments?.length ?? 0
    });
} catch (e) {
  console.error('Error during database operations:', e);
}

await closeConnection();
console.log('Database operations completed and connection closed.');